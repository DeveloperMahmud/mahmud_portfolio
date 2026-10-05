import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import type { Request, Response, NextFunction } from 'express';

const COOKIE = 'mh_admin_session';
const secret = () => process.env.JWT_SECRET || 'dev-only-secret-change-me';

export async function hashPassword(password: string) { return bcrypt.hash(password, 12); }
export async function verifyPassword(password: string, hash: string) { return bcrypt.compare(password, hash); }

export function setSession(res: Response, userId: string, role: string) {
  const token = jwt.sign({ sub: userId, role }, secret(), { expiresIn: '7d' });
  res.cookie(COOKIE, token, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', maxAge: 7 * 24 * 60 * 60 * 1000, path: '/' });
}

export function clearSession(res: Response) { res.clearCookie(COOKIE, { path: '/' }); }

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const token = req.cookies?.[COOKIE];
  if (!token) return res.status(401).json({ error: 'Authentication required' });
  try {
    const payload = jwt.verify(token, secret()) as { sub: string; role: string };
    res.locals.user = payload;
    next();
  } catch { return res.status(401).json({ error: 'Invalid or expired session' }); }
}
