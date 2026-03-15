const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const db = require('../db/database');
const { authenticate, requireAdmin } = require('../middleware/auth');

const multer = require('multer');
const path = require('path');
const fs = require('fs');

const uploadDir = path.join(__dirname, '../uploads');

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage });

// Generate tracking number
function generateTrackingNumber() {
  const year = new Date().getFullYear();
  const rand = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `CMS-${year}-${rand}`;
}

// Submit complaint (authenticated)
router.post('/', authenticate, upload.array('attachments', 5), (req, res) => {
  console.log('AUTH BODY:', req.body);
  console.log('AUTH FILES:', req.files);

  const files = req.files || [];
  const { category, department_id, subject, description, location, priority } = req.body;

  if (!category || !subject || !description) {
    return res.status(400).json({ error: 'Category, subject, and description are required' });
  }

  let tracking = generateTrackingNumber();

  while (db.prepare('SELECT id FROM complaints WHERE tracking_number = ?').get(tracking)) {
    tracking = generateTrackingNumber();
  }

  try {
    const result = db.prepare(`
      INSERT INTO complaints (
        tracking_number,
        user_id,
        is_anonymous,
        submitter_name,
        submitter_email,
        category,
        department_id,
        subject,
        description,
        location,
        priority
      )
      VALUES (?, ?, 0, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      tracking,
      req.user.id,
      req.user.name,
      req.user.email,
      category,
      department_id || null,
      subject,
      description,
      location || null,
      priority || 'normal'
    );

    db.prepare(`
      INSERT INTO complaint_updates (complaint_id, updated_by, new_status, message)
      VALUES (?, ?, 'submitted', 'Complaint successfully submitted and received.')
    `).run(result.lastInsertRowid, req.user.id);

    files.forEach((file) => {
      console.log('Uploaded file:', file.filename);
    });

    const complaint = db.prepare('SELECT * FROM complaints WHERE id = ?').get(result.lastInsertRowid);

    res.status(201).json({ complaint, tracking_number: tracking });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to submit complaint' });
  }
});


// Submit anonymous complaint
router.post('/anonymous', upload.array('attachments', 5), (req, res) => {
  const files = req.files || [];
  files.forEach(file => {
  console.log('Uploaded file:', file.filename);
});
  const { name, email, phone, category, department_id, subject, description, location } = req.body;
  if (!category || !subject || !description) {
    return res.status(400).json({ error: 'Category, subject, and description are required' });
  }

  let tracking = generateTrackingNumber();
  while (db.prepare('SELECT id FROM complaints WHERE tracking_number = ?').get(tracking)) {
    tracking = generateTrackingNumber();
  }

  try {
    const result = db.prepare(`
      INSERT INTO complaints (tracking_number, is_anonymous, submitter_name, submitter_email, submitter_phone,
        category, department_id, subject, description, location)
      VALUES (?, 1, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(tracking, name || 'Anonymous', email || null, phone || null,
      category, department_id || null, subject, description, location || null);

    db.prepare(`
      INSERT INTO complaint_updates (complaint_id, new_status, message)
      VALUES (?, 'submitted', 'Anonymous complaint received successfully.')
    `).run(result.lastInsertRowid);

    res.status(201).json({ tracking_number: tracking, message: 'Anonymous complaint submitted successfully. Save your tracking number.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to submit complaint' });
  }
});

// Track complaint by tracking number (public)
router.get('/track/:tracking_number', (req, res) => {
  const complaint = db.prepare(`
    SELECT c.*, d.name as department_name
    FROM complaints c
    LEFT JOIN departments d ON c.department_id = d.id
    WHERE c.tracking_number = ?
  `).get(req.params.tracking_number.toUpperCase());

  if (!complaint) {
    return res.status(404).json({ error: 'Complaint not found. Check your tracking number.' });
  }

  const updates = db.prepare(`
    SELECT cu.*, u.name as updated_by_name
    FROM complaint_updates cu
    LEFT JOIN users u ON cu.updated_by = u.id
    WHERE cu.complaint_id = ? AND cu.is_public = 1
    ORDER BY cu.created_at ASC
  `).all(complaint.id);

  // Mask personal info for anonymous complaints
  const safeComplaint = { ...complaint };
  if (complaint.is_anonymous) {
    safeComplaint.submitter_name = 'Anonymous';
    safeComplaint.submitter_email = null;
    safeComplaint.submitter_phone = null;
  }

  res.json({ complaint: safeComplaint, updates });
});

// Get my complaints (authenticated citizen)
router.get('/my', authenticate, (req, res) => {
  const complaints = db.prepare(`
    SELECT c.*, d.name as department_name
    FROM complaints c
    LEFT JOIN departments d ON c.department_id = d.id
    WHERE c.user_id = ?
    ORDER BY c.submitted_at DESC
  `).all(req.user.id);
  res.json({ complaints });
});

// ─── ADMIN ROUTES ───────────────────────────────────────────────

// Get all complaints (admin)
router.get('/admin/all', authenticate, requireAdmin, (req, res) => {
  const { status, department_id, priority, search, page = 1, limit = 20 } = req.query;
  let query = `
    SELECT c.*, d.name as department_name, u.name as assigned_to_name
    FROM complaints c
    LEFT JOIN departments d ON c.department_id = d.id
    LEFT JOIN users u ON c.assigned_to = u.id
    WHERE 1=1
  `;
  const params = [];

  if (status) { query += ' AND c.status = ?'; params.push(status); }
  if (department_id) { query += ' AND c.department_id = ?'; params.push(department_id); }
  if (priority) { query += ' AND c.priority = ?'; params.push(priority); }
  if (search) { query += ' AND (c.subject LIKE ? OR c.tracking_number LIKE ? OR c.submitter_name LIKE ?)'; params.push(`%${search}%`, `%${search}%`, `%${search}%`); }

  const total = db.prepare(`SELECT COUNT(*) as count FROM (${query})`).get(...params).count;
  query += ` ORDER BY c.submitted_at DESC LIMIT ? OFFSET ?`;
  params.push(parseInt(limit), (parseInt(page) - 1) * parseInt(limit));

  const complaints = db.prepare(query).all(...params);
  res.json({ complaints, total, page: parseInt(page), pages: Math.ceil(total / limit) });
});

// Get single complaint detail (admin)
router.get('/admin/:id', authenticate, requireAdmin, (req, res) => {
  const complaint = db.prepare(`
    SELECT c.*, d.name as department_name, u.name as assigned_to_name
    FROM complaints c
    LEFT JOIN departments d ON c.department_id = d.id
    LEFT JOIN users u ON c.assigned_to = u.id
    WHERE c.id = ?
  `).get(req.params.id);

  if (!complaint) return res.status(404).json({ error: 'Complaint not found' });

  const updates = db.prepare(`
    SELECT cu.*, u.name as updated_by_name
    FROM complaint_updates cu
    LEFT JOIN users u ON cu.updated_by = u.id
    WHERE cu.complaint_id = ?
    ORDER BY cu.created_at ASC
  `).all(complaint.id);

  res.json({ complaint, updates });
});

// Update complaint status (admin)
router.patch('/admin/:id/status', authenticate, requireAdmin, (req, res) => {
  const { status, message, is_public = 1, resolution, priority, assigned_to } = req.body;
  if (!status || !message) {
    return res.status(400).json({ error: 'Status and message are required' });
  }

  const complaint = db.prepare('SELECT * FROM complaints WHERE id = ?').get(req.params.id);
  if (!complaint) return res.status(404).json({ error: 'Complaint not found' });

  const resolvedAt = ['resolved', 'closed'].includes(status) ? new Date().toISOString() : null;

  db.prepare(`
    UPDATE complaints SET status = ?, priority = ?, assigned_to = ?, resolution = ?,
    resolved_at = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?
  `).run(status, priority || complaint.priority, assigned_to || complaint.assigned_to,
    resolution || complaint.resolution, resolvedAt, complaint.id);

  db.prepare(`
    INSERT INTO complaint_updates (complaint_id, updated_by, old_status, new_status, message, is_public)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(complaint.id, req.user.id, complaint.status, status, message, is_public ? 1 : 0);

  const updated = db.prepare('SELECT * FROM complaints WHERE id = ?').get(complaint.id);
  res.json({ complaint: updated, message: 'Complaint updated successfully' });
});

// Dashboard stats (admin)
router.get('/admin/stats/overview', authenticate, requireAdmin, (req, res) => {
  const total = db.prepare('SELECT COUNT(*) as count FROM complaints').get().count;
  const submitted = db.prepare("SELECT COUNT(*) as count FROM complaints WHERE status = 'submitted'").get().count;
  const inProgress = db.prepare("SELECT COUNT(*) as count FROM complaints WHERE status IN ('under_review', 'in_progress')").get().count;
  const resolved = db.prepare("SELECT COUNT(*) as count FROM complaints WHERE status = 'resolved'").get().count;
  const anonymous = db.prepare("SELECT COUNT(*) as count FROM complaints WHERE is_anonymous = 1").get().count;
  const urgent = db.prepare("SELECT COUNT(*) as count FROM complaints WHERE priority = 'urgent' AND status NOT IN ('resolved', 'closed')").get().count;

  const byDept = db.prepare(`
    SELECT d.name, COUNT(c.id) as count
    FROM complaints c
    LEFT JOIN departments d ON c.department_id = d.id
    GROUP BY c.department_id
    ORDER BY count DESC LIMIT 5
  `).all();

  const recent = db.prepare(`
    SELECT c.tracking_number, c.subject, c.status, c.priority, c.submitted_at, d.name as department_name
    FROM complaints c LEFT JOIN departments d ON c.department_id = d.id
    ORDER BY c.submitted_at DESC LIMIT 5
  `).all();

  const byMonth = db.prepare(`
    SELECT strftime('%Y-%m', submitted_at) as month, COUNT(*) as count
    FROM complaints WHERE submitted_at >= date('now', '-6 months')
    GROUP BY month ORDER BY month
  `).all();

  res.json({ total, submitted, inProgress, resolved, anonymous, urgent, byDept, recent, byMonth });
});

module.exports = router;
