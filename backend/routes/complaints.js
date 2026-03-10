const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const db = require('../db/database');

// ===============================
// CREATE UPLOAD DIRECTORY
// ===============================
const uploadDir = path.join(__dirname, '../uploads');

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// ===============================
// CONFIGURE MULTER (FILE UPLOAD)
// ===============================
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueName = Date.now() + '-' + file.originalname;
    cb(null, uniqueName);
  }
});

const upload = multer({ storage });

// ===============================
// GENERATE TRACKING NUMBER
// ===============================
function generateTrackingNumber() {
  const year = new Date().getFullYear();
  const random = Math.floor(100000 + Math.random() * 900000);
  return `CMP-${year}-${random}`;
}

// ===============================
// SUBMIT ANONYMOUS COMPLAINT
// ===============================
router.post('/anonymous', upload.array('attachments', 5), async (req, res) => {

  try {

    const {
      name,
      email,
      phone,
      category,
      department_id,
      subject,
      description,
      location
    } = req.body;

    if (!category || !subject || !description) {
      return res.status(400).json({
        error: 'Category, subject, and description are required'
      });
    }

    const tracking = generateTrackingNumber();

    // Save complaint
    const result = db.prepare(`
      INSERT INTO complaints (
        tracking_number,
        is_anonymous,
        submitter_name,
        submitter_email,
        submitter_phone,
        category,
        department_id,
        subject,
        description,
        location
      )
      VALUES (?,1,?,?,?,?,?,?,?,?)
    `).run(
      tracking,
      name || "Anonymous",
      email || null,
      phone || null,
      category,
      department_id || null,
      subject,
      description,
      location || null
    );

    const complaintId = result.lastInsertRowid;

    // ===============================
    // SAVE ATTACHMENTS
    // ===============================
    if (req.files && req.files.length > 0) {

      const insertAttachment = db.prepare(`
        INSERT INTO complaint_attachments
        (complaint_id, filename, original_name, file_size)
        VALUES (?, ?, ?, ?)
      `);

      req.files.forEach(file => {

        insertAttachment.run(
          complaintId,
          file.filename,
          file.originalname,
          file.size
        );

      });

    }

    res.json({
      success: true,
      tracking_number: tracking
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      error: "Failed to submit complaint"
    });

  }

});

module.exports = router;