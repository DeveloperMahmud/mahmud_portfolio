import { Router } from 'express';
import { z } from 'zod';
import { db } from '../lib/db.js';
import { clearSession, hashPassword, setSession, verifyPassword, requireAuth } from '../lib/auth.js';
import { Prisma } from '@prisma/client';
import { updateAdminSecurityCache } from '../lib/admin-security.js';

const router = Router();
const loginSchema = z.object({ email: z.string().email(), password: z.string().min(8) });

router.post('/login', async (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Invalid credentials format' });
  const user = await db.user.findUnique({ where: { email: parsed.data.email.toLowerCase() } });
  if (!user || !user.active || !(await verifyPassword(parsed.data.password, user.passwordHash))) return res.status(401).json({ error: 'Invalid email or password' });
  setSession(res, user.id, user.role);
  res.json({ user: { id: user.id, email: user.email, role: user.role } });
});
router.post('/logout', (_req, res) => { clearSession(res); res.status(204).end(); });
router.get('/me', requireAuth, async (_req, res) => {
  const user = await db.user.findUnique({ where: { id: res.locals.user.sub }, select: { id: true, email: true, role: true, active:true, createdAt: true, updatedAt: true } });
  if (!user?.active) return res.status(401).json({ error: 'Session user is unavailable' });
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

const roles=['ADMIN','EDITOR','WRITER','MODERATOR','VIEWER'] as const;
async function requireAdminUser(res:any){const user=await db.user.findUnique({where:{id:res.locals.user.sub},select:{id:true,role:true,active:true}});return user?.active&&user.role==='ADMIN'?user:null}
router.get('/users',requireAuth,async(_req,res)=>{if(!await requireAdminUser(res))return res.status(403).json({error:'Administrator access is required.'});const users=await db.user.findMany({orderBy:[{role:'asc'},{email:'asc'}],select:{id:true,email:true,role:true,active:true,createdAt:true,updatedAt:true}});res.json({users,roles,permissions:{ADMIN:'Full CMS, security and user management',EDITOR:'Projects, journal, brands, media and page builders',WRITER:'Projects and journal drafts',MODERATOR:'Leads, testimonials and client review workflows',VIEWER:'Read-only CMS access'}})});
router.post('/users',requireAuth,async(req,res)=>{if(!await requireAdminUser(res))return res.status(403).json({error:'Administrator access is required.'});const parsed=z.object({email:z.string().email(),password:z.string().min(10),role:z.enum(roles).default('VIEWER')}).safeParse(req.body);if(!parsed.success)return res.status(400).json({error:'Use a valid email, a password of at least 10 characters and an allowed role.'});try{const user=await db.user.create({data:{email:parsed.data.email.toLowerCase(),passwordHash:await hashPassword(parsed.data.password),role:parsed.data.role},select:{id:true,email:true,role:true,active:true,createdAt:true,updatedAt:true}});res.status(201).json({user})}catch{return res.status(409).json({error:'That email already has an account.'})}});
router.patch('/users/:id',requireAuth,async(req,res)=>{const admin=await requireAdminUser(res);if(!admin)return res.status(403).json({error:'Administrator access is required.'});const parsed=z.object({role:z.enum(roles).optional(),active:z.boolean().optional(),password:z.string().min(10).optional()}).refine(value=>Object.keys(value).length>0).safeParse(req.body);if(!parsed.success)return res.status(400).json({error:'Invalid account update.'});const target=await db.user.findUnique({where:{id:String(req.params.id)}});if(!target)return res.status(404).json({error:'User not found.'});if(target.id===admin.id&&(parsed.data.active===false||parsed.data.role&&parsed.data.role!=='ADMIN'))return res.status(400).json({error:'You cannot remove your own administrator access.'});if(target.role==='ADMIN'&&(parsed.data.active===false||parsed.data.role&&parsed.data.role!=='ADMIN')){const activeAdmins=await db.user.count({where:{role:'ADMIN',active:true}});if(activeAdmins<=1)return res.status(400).json({error:'At least one active administrator is required.'})}const {password,...data}=parsed.data;const user=await db.user.update({where:{id:target.id},data:{...data,...(password?{passwordHash:await hashPassword(password)}:{})},select:{id:true,email:true,role:true,active:true,createdAt:true,updatedAt:true}});res.json({user})});

const themeSchema=z.object({preset:z.enum(['MIDNIGHT_LIME','GRAPHITE_BLUE','WARM_EDITORIAL','CUSTOM']).default('MIDNIGHT_LIME'),background:z.string().regex(/^#[0-9a-f]{6}$/i).default('#090a09'),panel:z.string().regex(/^#[0-9a-f]{6}$/i).default('#0d0f0e'),text:z.string().regex(/^#[0-9a-f]{6}$/i).default('#f3f4ef'),muted:z.string().regex(/^#[0-9a-f]{6}$/i).default('#8e948d'),accent:z.string().regex(/^#[0-9a-f]{6}$/i).default('#c6ff4c'),grainStyle:z.enum(['FINE','FILM','PAPER','OFF']).default('FINE'),grainOpacity:z.number().min(0).max(.18).default(.045),grainScale:z.number().min(.5).max(3).default(1)}).strict();
const securitySchema=z.object({adminPath:z.string().regex(/^\/[a-z0-9][a-z0-9-]{5,60}$/).default('/manage-portfolio'),hideCanonicalAdmin:z.boolean().default(false)}).strict();
const themeDefaults=themeSchema.parse({}),securityDefaults=securitySchema.parse({});
router.get('/admin-config',requireAuth,async(_req,res)=>{if(!await requireAdminUser(res))return res.status(403).json({error:'Administrator access is required.'});let settings=await db.siteSettings.findFirst();if(!settings)settings=await db.siteSettings.create({data:{}});res.json({theme:{...themeDefaults,...(settings.themeConfig as object||{})},security:{...securityDefaults,...(settings.securityConfig as object||{})}})});
router.patch('/admin-config',requireAuth,async(req,res)=>{if(!await requireAdminUser(res))return res.status(403).json({error:'Administrator access is required.'});const parsed=z.object({theme:themeSchema.optional(),security:securitySchema.optional()}).refine(value=>value.theme||value.security).safeParse(req.body);if(!parsed.success)return res.status(400).json({error:parsed.error.flatten()});const reserved=new Set(['/admin','/admin.html','/api','/work','/journal','/pages','/health','/page-studio','/homepage-studio']);if(parsed.data.security&&reserved.has(parsed.data.security.adminPath))return res.status(400).json({error:'Choose a different private admin path.'});let settings=await db.siteSettings.findFirst();if(!settings)settings=await db.siteSettings.create({data:{}});settings=await db.siteSettings.update({where:{id:settings.id},data:{...(parsed.data.theme?{themeConfig:parsed.data.theme as Prisma.InputJsonValue}:{}),...(parsed.data.security?{securityConfig:parsed.data.security as Prisma.InputJsonValue}:{})}});const security={...securityDefaults,...(settings.securityConfig as object||{})};if(parsed.data.security)updateAdminSecurityCache(security);res.json({theme:{...themeDefaults,...(settings.themeConfig as object||{})},security})});
export default router;

export { hashPassword };
