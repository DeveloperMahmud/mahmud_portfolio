import { Router } from 'express';
import { z } from 'zod';
import { db } from '../lib/db.js';
import { clearSession, hashPassword, setSession, verifyPassword, requireAuth } from '../lib/auth.js';

const router = Router();
const loginSchema = z.object({ email: z.string().email(), password: z.string().min(8) });

router.post('/login', async (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Invalid credentials format' });
  const user = await db.user.findUnique({ where: { email: parsed.data.email.toLowerCase() } });
  if (!user || !(await verifyPassword(parsed.data.password, user.passwordHash))) return res.status(401).json({ error: 'Invalid email or password' });
  setSession(res, user.id, user.role);
  res.json({ user: { id: user.id, email: user.email, role: user.role } });
});
router.post('/logout', (_req, res) => { clearSession(res); res.status(204).end(); });
router.get('/me', requireAuth, async (_req, res) => {
  const user = await db.user.findUnique({ where: { id: res.locals.user.sub }, select: { id: true, email: true, role: true, createdAt: true, updatedAt: true } });
  if (!user) return res.status(401).json({ error: 'Session user no longer exists' });
  res.json({ user });
});

router.post('/password', requireAuth, async (req, res) => {
  const parsed = z.object({ currentPassword: z.string().min(8), newPassword: z.string().min(8) }).safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Password must be at least 8 characters.' });
  if (parsed.data.currentPassword === parsed.data.newPassword) return res.status(400).json({ error: 'New password must be different from the current password.' });
  const user = await db.user.findUnique({ where: { id: res.locals.user.sub } });
  if (!user || !(await verifyPassword(parsed.data.currentPassword, user.passwordHash))) return res.status(401).json({ error: 'Current password is incorrect.' });
  const passwordHash = await hashPassword(parsed.data.newPassword);
  const updated = await db.user.update({ where: { id: user.id }, data: { passwordHash } });
  setSession(res, updated.id, updated.role);
  res.json({ user: { id: updated.id, email: updated.email, role: updated.role } });
});
export default router;

export { hashPassword };
