const express = require('express');
const router = express.Router();
const db = require('../db/database');
const { authenticate, requireAdmin } = require('../middleware/auth');

// Get all departments (public)
router.get('/', (req, res) => {
  const departments = db.prepare('SELECT * FROM departments WHERE is_active = 1 ORDER BY name').all();
  res.json({ departments });
});

// Create department (admin)
router.post('/', authenticate, requireAdmin, (req, res) => {
  const { name, description, email } = req.body;
  if (!name) return res.status(400).json({ error: 'Department name is required' });
  const result = db.prepare('INSERT INTO departments (name, description, email) VALUES (?, ?, ?)').run(name, description || null, email || null);
  const dept = db.prepare('SELECT * FROM departments WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json({ department: dept });
});

// Update department (admin)
router.patch('/:id', authenticate, requireAdmin, (req, res) => {
  const { name, description, email, is_active } = req.body;
  db.prepare('UPDATE departments SET name = COALESCE(?, name), description = COALESCE(?, description), email = COALESCE(?, email), is_active = COALESCE(?, is_active) WHERE id = ?')
    .run(name || null, description || null, email || null, is_active ?? null, req.params.id);
  const dept = db.prepare('SELECT * FROM departments WHERE id = ?').get(req.params.id);
  res.json({ department: dept });
});

module.exports = router;
