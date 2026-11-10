import { Router } from 'express';
import { execute, queryOne } from '../db';
import { createSession, currentUser, destroySession, hashPassword, requireAuth, verifyPassword } from '../auth';

const router = Router();
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// POST /api/auth/register  { name, email, password }
router.post('/register', (req, res) => {
  const name = String(req.body?.name ?? '').trim();
  const email = String(req.body?.email ?? '').trim().toLowerCase();
  const password = String(req.body?.password ?? '');

  let error: string | null = null;
  if (!name) error = 'O nome é obrigatório.';
  else if (!EMAIL_RE.test(email)) error = 'Email inválido.';
  else if (password.length < 8) error = 'A password tem de ter pelo menos 8 caracteres.';
  if (error) {
    res.status(400).json({ error });
    return;
  }

  if (queryOne('SELECT 1 FROM users WHERE email = ?', email)) {
    res.status(409).json({ error: 'Já existe uma conta com esse email.' });
    return;
  }

  const { lastInsertRowid: id } = execute(
    'INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)',
    name,
    email,
    hashPassword(password)
  );

  createSession(res, id);
  res.status(201).json({ id, name, email });
});

// POST /api/auth/login  { email, password }
router.post('/login', (req, res) => {
  const email = String(req.body?.email ?? '').trim().toLowerCase();
  const password = String(req.body?.password ?? '');

  const user = queryOne<{ id: number; name: string; email: string; password_hash: string }>(
    'SELECT id, name, email, password_hash FROM users WHERE email = ?',
    email
  );
  if (!user || !verifyPassword(password, user.password_hash)) {
    res.status(401).json({ error: 'Email ou password incorretos.' });
    return;
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
  res.json(currentUser(req));
});

export default router;
