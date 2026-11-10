// Passwords (scrypt) e sessões guardadas na BD, identificadas por um cookie httpOnly.
import crypto from 'node:crypto';
import type { NextFunction, Request, Response } from 'express';
import { execute, queryOne } from './db';
import type { User } from './types';

const COOKIE_NAME = 'session';
const SESSION_DAYS = 7;

export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const [salt, hash] = stored.split(':');
  const candidate = crypto.scryptSync(password, salt, 64);
  return crypto.timingSafeEqual(candidate, Buffer.from(hash, 'hex'));
}

export function createSession(res: Response, userId: number): void {
  const token = crypto.randomBytes(32).toString('hex');
  const expires = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000);
  execute('INSERT INTO sessions (token, user_id, expires_at) VALUES (?, ?, ?)', token, userId, expires.toISOString());
  res.cookie(COOKIE_NAME, token, { httpOnly: true, sameSite: 'lax', expires });
}

export function destroySession(req: Request, res: Response): void {
  const token = readCookie(req, COOKIE_NAME);
  if (token) execute('DELETE FROM sessions WHERE token = ?', token);
  res.clearCookie(COOKIE_NAME);
}

function readCookie(req: Request, name: string): string | null {
  const header = req.headers.cookie || '';
  for (const part of header.split(';')) {
    const [key, ...rest] = part.trim().split('=');
    if (key === name) return decodeURIComponent(rest.join('='));
  }
  return null;
}

/** Coloca req.user se houver uma sessão válida (não bloqueia o pedido). */
export function loadUser(req: Request, _res: Response, next: NextFunction): void {
  const token = readCookie(req, COOKIE_NAME);
  req.user = null;
  if (token) {
    const row = queryOne<User>(
      `SELECT u.id, u.name, u.email FROM sessions s
       JOIN users u ON u.id = s.user_id
       WHERE s.token = ? AND s.expires_at > ?`,
      token,
      new Date().toISOString()
    );
    if (row) req.user = { ...row };
  }
  next();
}

/** Para rotas da API que exigem login. */
export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  if (!req.user) {
    res.status(401).json({ error: 'Não autenticado.' });
    return;
  }
  next();
}

/** Utilizador autenticado (usar só depois de requireAuth). */
export function currentUser(req: Request): User {
  if (!req.user) throw new Error('requireAuth em falta nesta rota');
  return req.user;
}
