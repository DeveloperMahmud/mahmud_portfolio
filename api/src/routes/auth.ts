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
  const user = await db.user.findUnique({ where: { id: res.locals.user.sub }, select: { id: true, email: true, role: true } });
  if (!user) return res.status(401).json({ error: 'Session user no longer exists' });
  res.json({ user });
});
export default router;

export { hashPassword };
