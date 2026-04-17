import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors';
import Database from 'better-sqlite3';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const JWT_SECRET = process.env.JWT_SECRET || 'compliance-hub-secret-key-iso-27001';
const PORT = 3000;

const db = new Database('compliance.db');

// Initialize Database
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    uid TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT NOT NULL,
    createdAt TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS submissions (
    id TEXT PRIMARY KEY,
    date TEXT NOT NULL,
    categoryId TEXT NOT NULL,
    frequency TEXT NOT NULL,
    makerId TEXT NOT NULL,
    makerName TEXT NOT NULL,
    checkerId TEXT,
    checkerName TEXT,
    status TEXT NOT NULL,
    evidence TEXT NOT NULL, -- JSON string
    checkerComments TEXT,
    createdAt TEXT NOT NULL,
    updatedAt TEXT NOT NULL,
    FOREIGN KEY(makerId) REFERENCES users(uid)
  );

  CREATE TABLE IF NOT EXISTS audit_logs (
    id TEXT PRIMARY KEY,
    timestamp TEXT NOT NULL,
    userId TEXT NOT NULL,
    userName TEXT NOT NULL,
    action TEXT NOT NULL,
    resourceId TEXT,
    resourceType TEXT,
    details TEXT,
    FOREIGN KEY(userId) REFERENCES users(uid)
  );
`);

async function startServer() {
  const app = express();
  app.use(cors());
  app.use(express.json());

  // Bootstrap admin user
  try {
    const adminEmail = 'linekar@zerodha.com';
    const existingAdmin = db.prepare('SELECT * FROM users WHERE email = ?').get(adminEmail);
    if (!existingAdmin) {
      const hashedPassword = await bcrypt.hash('password123', 10);
      db.prepare('INSERT INTO users (uid, name, email, password, role, createdAt) VALUES (?, ?, ?, ?, ?, ?)')
        .run('admin-001', 'Admin User', adminEmail, hashedPassword, 'Admin', new Date().toISOString());
      console.log('Default admin user created: linekar@zerodha.com / password123');
    }
  } catch (err) {
    console.error('Error bootstrapping admin:', err);
  }

  // Middleware to verify JWT
  const authenticateToken = (req: any, res: any, next: any) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.status(401).json({ error: 'Access denied' });

    jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
      if (err) return res.status(403).json({ error: 'Invalid token' });
      req.user = user;
      next();
    });
  };

  // Auth Routes
  app.post('/api/auth/register', async (req, res) => {
    console.log('Register request received for:', req.body.email);
    const { name, email, password, role } = req.body;
    try {
      const hashedPassword = await bcrypt.hash(password, 10);
      const uid = Math.random().toString(36).substr(2, 9);
      const createdAt = new Date().toISOString();

      const stmt = db.prepare('INSERT INTO users (uid, name, email, password, role, createdAt) VALUES (?, ?, ?, ?, ?, ?)');
      stmt.run(uid, name, email, hashedPassword, role, createdAt);

      // Log registration
      const logStmt = db.prepare('INSERT INTO audit_logs (id, timestamp, userId, userName, action, resourceId, resourceType, details) VALUES (?, ?, ?, ?, ?, ?, ?, ?)');
      logStmt.run(Math.random().toString(36).substr(2, 9), createdAt, uid, name, 'USER_REGISTERED', uid, 'User', `User registered with role: ${role}`);

      const token = jwt.sign({ uid, email, role, name }, JWT_SECRET);
      res.json({ token, user: { uid, name, email, role, createdAt } });
    } catch (error: any) {
      if (error.message.includes('UNIQUE constraint failed')) {
        return res.status(400).json({ error: 'Email already in use' });
      }
      res.status(500).json({ error: 'Registration failed' });
    }
  });

  app.post('/api/auth/login', async (req, res) => {
    console.log('Login attempt for:', req.body.email);
    const { email, password } = req.body;
    try {
      const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email) as any;
      if (!user || !(await bcrypt.compare(password, user.password))) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }

      const token = jwt.sign({ uid: user.uid, email: user.email, role: user.role, name: user.name }, JWT_SECRET);
      
      // Log login for ISO 27001
      db.prepare(`
        INSERT INTO audit_logs (id, timestamp, userId, userName, action, resourceId, resourceType, details)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        Math.random().toString(36).substr(2, 9),
        new Date().toISOString(),
        user.uid,
        user.name,
        'USER_LOGIN',
        user.uid,
        'User',
        'User logged in successfully'
      );

      res.json({ token, user: { uid: user.uid, name: user.name, email: user.email, role: user.role, createdAt: user.createdAt } });
    } catch (error) {
      res.status(500).json({ error: 'Login failed' });
    }
  });

  app.post('/api/auth/change-password', authenticateToken, async (req: any, res) => {
    const { currentPassword, newPassword } = req.body;
    const { uid, name } = req.user;

    try {
      const user = db.prepare('SELECT * FROM users WHERE uid = ?').get(uid) as any;
      if (!user || !(await bcrypt.compare(currentPassword, user.password))) {
        return res.status(401).json({ error: 'Invalid current password' });
      }

      const hashedNewPassword = await bcrypt.hash(newPassword, 10);
      db.prepare('UPDATE users SET password = ? WHERE uid = ?').run(hashedNewPassword, uid);

      // Log password change
      db.prepare(`
        INSERT INTO audit_logs (id, timestamp, userId, userName, action, resourceId, resourceType, details)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        Math.random().toString(36).substr(2, 9),
        new Date().toISOString(),
        uid,
        name,
        'USER_PASSWORD_CHANGED',
        uid,
        'User',
        'User changed their password'
      );

      res.json({ message: 'Password changed successfully' });
    } catch (error) {
      res.status(500).json({ error: 'Failed to change password' });
    }
  });

  app.get('/api/auth/me', authenticateToken, (req: any, res) => {
    res.json({ user: req.user });
  });

  app.post('/api/auth/logout', authenticateToken, (req: any, res) => {
    try {
      db.prepare(`
        INSERT INTO audit_logs (id, timestamp, userId, userName, action, resourceId, resourceType, details)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        Math.random().toString(36).substr(2, 9),
        new Date().toISOString(),
        req.user.uid,
        req.user.name,
        'USER_LOGOUT',
        req.user.uid,
        'User',
        'User logged out'
      );
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: 'Logout logging failed' });
    }
  });

  // Submissions Routes
  app.get('/api/submissions', authenticateToken, (req, res) => {
    try {
      const submissions = db.prepare('SELECT * FROM submissions ORDER BY createdAt DESC').all() as any[];
      const formatted = submissions.map(s => ({
        ...s,
        evidence: JSON.parse(s.evidence)
      }));
      res.json(formatted);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch submissions' });
    }
  });

  app.post('/api/submissions', authenticateToken, (req: any, res) => {
    const { date, categoryId, frequency, status, evidence } = req.body;
    const { uid, name } = req.user;

    try {
      const id = 'AUD-' + Math.random().toString(36).substr(2, 9).toUpperCase();
      const now = new Date().toISOString();
      const stmt = db.prepare('INSERT INTO submissions (id, date, categoryId, frequency, makerId, makerName, status, evidence, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
      stmt.run(id, date, categoryId, frequency, uid, name, status, JSON.stringify(evidence), now, now);

      // Log submission
      const logStmt = db.prepare('INSERT INTO audit_logs (id, timestamp, userId, userName, action, resourceId, resourceType, details) VALUES (?, ?, ?, ?, ?, ?, ?, ?)');
      logStmt.run(Math.random().toString(36).substr(2, 9), now, uid, name, 'AUDIT_SUBMITTED', id, 'Submission', `Audit submitted with status: ${status}`);

      res.json({ id, status });
    } catch (error) {
      res.status(500).json({ error: 'Failed to create submission' });
    }
  });

  app.patch('/api/submissions/:id', authenticateToken, (req: any, res) => {
    const { id } = req.params;
    const { status, checkerComments } = req.body;
    const { uid, name, role } = req.user;

    try {
      const now = new Date().toISOString();
      if (role === 'Checker' || role === 'Admin') {
        const stmt = db.prepare('UPDATE submissions SET status = ?, checkerComments = ?, checkerId = ?, checkerName = ?, updatedAt = ? WHERE id = ?');
        stmt.run(status, checkerComments, uid, name, now, id);
      } else {
        const stmt = db.prepare('UPDATE submissions SET status = ?, updatedAt = ? WHERE id = ? AND makerId = ?');
        stmt.run(status, now, id, uid);
      }

      // Log review
      const logStmt = db.prepare('INSERT INTO audit_logs (id, timestamp, userId, userName, action, resourceId, resourceType, details) VALUES (?, ?, ?, ?, ?, ?, ?, ?)');
      logStmt.run(Math.random().toString(36).substr(2, 9), now, uid, name, 'AUDIT_REVIEWED', id, 'Submission', `Audit reviewed with status: ${status}`);

      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: 'Failed to update submission' });
    }
  });

  // Audit Logs
  app.get('/api/audit-logs', authenticateToken, (req: any, res) => {
    if (req.user.role !== 'Checker' && req.user.role !== 'Admin') return res.status(403).json({ error: 'Forbidden' });
    try {
      const logs = db.prepare('SELECT * FROM audit_logs ORDER BY timestamp DESC LIMIT 100').all();
      res.json(logs);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch audit logs' });
    }
  });

  // User Management (Admin only)
  app.get('/api/users', authenticateToken, (req: any, res) => {
    if (req.user.role !== 'Admin') return res.status(403).json({ error: 'Forbidden' });
    try {
      const users = db.prepare('SELECT uid, name, email, role, createdAt FROM users ORDER BY createdAt DESC').all();
      res.json(users);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch users' });
    }
  });

  app.post('/api/users', authenticateToken, async (req: any, res) => {
    if (req.user.role !== 'Admin') return res.status(403).json({ error: 'Forbidden' });
    const { name, email, password, role } = req.body;

    try {
      const hashedPassword = await bcrypt.hash(password, 10);
      const uid = Math.random().toString(36).substr(2, 9);
      const createdAt = new Date().toISOString();

      const stmt = db.prepare('INSERT INTO users (uid, name, email, password, role, createdAt) VALUES (?, ?, ?, ?, ?, ?)');
      stmt.run(uid, name, email, hashedPassword, role, createdAt);

      // Log user creation
      db.prepare(`
        INSERT INTO audit_logs (id, timestamp, userId, userName, action, resourceId, resourceType, details)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        Math.random().toString(36).substr(2, 9),
        createdAt,
        req.user.uid,
        req.user.name,
        'ADMIN_USER_CREATED',
        uid,
        'User',
        `Admin created user: ${name} with role: ${role}`
      );

      res.json({ uid, name, email, role, createdAt });
    } catch (error: any) {
      if (error.message.includes('UNIQUE constraint failed')) {
        return res.status(400).json({ error: 'Email already in use' });
      }
      res.status(500).json({ error: 'Failed to create user' });
    }
  });

  // Vite setup
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
