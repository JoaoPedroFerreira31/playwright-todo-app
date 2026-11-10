// Passwords (scrypt) e sessões guardadas na BD, identificadas por um cookie httpOnly.
const crypto = require('node:crypto');
const { db } = require('./db');

const COOKIE_NAME = 'session';
const SESSION_DAYS = 7;

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
}

function verifyPassword(password, stored) {
  const [salt, hash] = stored.split(':');
  const candidate = crypto.scryptSync(password, salt, 64);
  return crypto.timingSafeEqual(candidate, Buffer.from(hash, 'hex'));
}

function createSession(res, userId) {
  const token = crypto.randomBytes(32).toString('hex');
  const expires = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000);
  db.prepare('INSERT INTO sessions (token, user_id, expires_at) VALUES (?, ?, ?)').run(
    token,
    userId,
    expires.toISOString()
  );
  res.cookie(COOKIE_NAME, token, { httpOnly: true, sameSite: 'lax', expires });
}

function destroySession(req, res) {
  const token = readCookie(req, COOKIE_NAME);
  if (token) db.prepare('DELETE FROM sessions WHERE token = ?').run(token);
  res.clearCookie(COOKIE_NAME);
}

function readCookie(req, name) {
  const header = req.headers.cookie || '';
  for (const part of header.split(';')) {
    const [key, ...rest] = part.trim().split('=');
    if (key === name) return decodeURIComponent(rest.join('='));
  }
  return null;
}

// Coloca req.user se houver uma sessão válida (não bloqueia o pedido).
function loadUser(req, _res, next) {
  const token = readCookie(req, COOKIE_NAME);
  req.user = null;
  if (token) {
    const row = db
      .prepare(
        `SELECT u.id, u.name, u.email FROM sessions s
         JOIN users u ON u.id = s.user_id
         WHERE s.token = ? AND s.expires_at > ?`
      )
      .get(token, new Date().toISOString());
    if (row) req.user = { ...row };
  }
  next();
}

// Para rotas da API que exigem login.
function requireAuth(req, res, next) {
  if (!req.user) return res.status(401).json({ error: 'Não autenticado.' });
  next();
}

module.exports = { hashPassword, verifyPassword, createSession, destroySession, loadUser, requireAuth };
