const express = require('express');
const { db } = require('../db');
const { hashPassword, verifyPassword, createSession, destroySession, requireAuth } = require('../auth');

const router = express.Router();
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// POST /api/auth/register  { name, email, password }
router.post('/register', (req, res) => {
  const name = String(req.body?.name ?? '').trim();
  const email = String(req.body?.email ?? '').trim().toLowerCase();
  const password = String(req.body?.password ?? '');

  if (!name) return res.status(400).json({ error: 'O nome é obrigatório.' });
  if (!EMAIL_RE.test(email)) return res.status(400).json({ error: 'Email inválido.' });
  if (password.length < 8) {
    return res.status(400).json({ error: 'A password tem de ter pelo menos 8 caracteres.' });
  }
  if (db.prepare('SELECT 1 FROM users WHERE email = ?').get(email)) {
    return res.status(409).json({ error: 'Já existe uma conta com esse email.' });
  }

  const { lastInsertRowid } = db
    .prepare('INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)')
    .run(name, email, hashPassword(password));

  createSession(res, lastInsertRowid);
  res.status(201).json({ id: Number(lastInsertRowid), name, email });
});

// POST /api/auth/login  { email, password }
router.post('/login', (req, res) => {
  const email = String(req.body?.email ?? '').trim().toLowerCase();
  const password = String(req.body?.password ?? '');

  const user = db.prepare('SELECT id, name, email, password_hash FROM users WHERE email = ?').get(email);
  if (!user || !verifyPassword(password, user.password_hash)) {
    return res.status(401).json({ error: 'Email ou password incorretos.' });
  }

  createSession(res, user.id);
  res.json({ id: user.id, name: user.name, email: user.email });
});

// POST /api/auth/logout
router.post('/logout', (req, res) => {
  destroySession(req, res);
  res.status(204).end();
});

// GET /api/auth/me
router.get('/me', requireAuth, (req, res) => {
  res.json(req.user);
});

module.exports = router;
