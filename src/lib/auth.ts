import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import type { Request, Response, NextFunction } from 'express';

const COOKIE = 'mh_admin_session';
const secret = () => {
  const value = process.env.JWT_SECRET?.trim();
  if (value) return value;
  if (process.env.NODE_ENV === 'production') throw new Error('JWT_SECRET is required in production');
  return 'dev-only-secret-change-me';
};

export async function hashPassword(password: string) { return bcrypt.hash(password, 12); }
export async function verifyPassword(password: string, hash: string) { return bcrypt.compare(password, hash); }

export function setSession(res: Response, userId: string, role: string) {
  const token = jwt.sign({ sub: userId, role }, secret(), { expiresIn: '7d' });
  res.cookie(COOKIE, token, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', maxAge: 7 * 24 * 60 * 60 * 1000, path: '/' });
}

export function clearSession(res: Response) { res.clearCookie(COOKIE, { path: '/', httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax' }); }

export function readSession(req:Request){
  const token=req.cookies?.[COOKIE];if(!token)return null;
  try{return jwt.verify(token,secret()) as {sub:string;role:string}}catch{return null}
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const payload=readSession(req);if(!payload)return res.status(401).json({error:'Authentication required'});res.locals.user=payload;next();
}
