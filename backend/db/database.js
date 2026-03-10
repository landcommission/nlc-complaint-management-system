const { DatabaseSync } = require('node:sqlite');
const path = require('path');

const db = new DatabaseSync(path.join(__dirname, '../cms.db'));

// Enable WAL mode for better performance
db.exec('PRAGMA journal_mode = WAL');
db.exec('PRAGMA foreign_keys = ON');

// Initialize schema
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    phone TEXT,
    role TEXT DEFAULT 'citizen' CHECK(role IN ('citizen', 'admin', 'staff')),
    department TEXT,
    is_active INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
  CREATE TABLE IF NOT EXISTS departments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    email TEXT,
    is_active INTEGER DEFAULT 1
  );
  CREATE TABLE IF NOT EXISTS complaints (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    tracking_number TEXT UNIQUE NOT NULL,
    user_id INTEGER REFERENCES users(id),
    is_anonymous INTEGER DEFAULT 0,
    submitter_name TEXT,
    submitter_email TEXT,
    submitter_phone TEXT,
    category TEXT NOT NULL,
    department_id INTEGER REFERENCES departments(id),
    subject TEXT NOT NULL,
    description TEXT NOT NULL,
    location TEXT,
    priority TEXT DEFAULT 'normal' CHECK(priority IN ('low', 'normal', 'high', 'urgent')),
    status TEXT DEFAULT 'submitted' CHECK(status IN ('submitted', 'under_review', 'in_progress', 'resolved', 'closed', 'rejected')),
    assigned_to INTEGER REFERENCES users(id),
    resolution TEXT,
    submitted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    resolved_at DATETIME
  );
  CREATE TABLE IF NOT EXISTS complaint_updates (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    complaint_id INTEGER NOT NULL REFERENCES complaints(id),
    updated_by INTEGER REFERENCES users(id),
    old_status TEXT,
    new_status TEXT,
    message TEXT NOT NULL,
    is_public INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
  CREATE TABLE IF NOT EXISTS complaint_attachments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    complaint_id INTEGER NOT NULL REFERENCES complaints(id),
    filename TEXT NOT NULL,
    original_name TEXT,
    file_size INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

// Seed default departments
const deptCount = db.prepare('SELECT COUNT(*) as count FROM departments').get();
if (deptCount.count === 0) {
  const insertDept = db.prepare('INSERT INTO departments (name, description) VALUES (?, ?)');
  const depts = [
    ['Public Health', 'Health services and sanitation complaints'],
    ['Roads & Infrastructure', 'Road maintenance and infrastructure issues'],
    ['Water & Sanitation', 'Water supply and sewage issues'],
    ['Education', 'Schools and educational facilities'],
    ['Social Services', 'Social welfare and community support'],
    ['Finance & Revenue', 'Tax, fees, and financial matters'],
    ['Environment', 'Environmental and waste management issues'],
    ['Security', 'Public safety and security concerns'],
    ['Planning & Housing', 'Land use, housing, and construction'],
    ['General', 'Other complaints and inquiries'],
  ];
  depts.forEach(([name, desc]) => insertDept.run(...desc ? [name, desc] : [name, '']));
}

// Seed default admin
const bcrypt = require('bcryptjs');
const adminExists = db.prepare("SELECT id FROM users WHERE email = 'ken.kimathi@landcommission.go.ke'").get();
if (!adminExists) {
  const hashedPassword = bcrypt.hashSync('Admin@2026', 10);
  db.prepare(`
    INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)
  `).run('System Administrator', 'ken.kimathi@landcommission.go.ke', hashedPassword, 'admin');
}

module.exports = db;
