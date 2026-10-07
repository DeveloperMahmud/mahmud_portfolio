import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import auth from './routes/auth.js';
import publicRoutes from './routes/public.js';
import admin from './routes/admin.js';
import content from './routes/content.js';
import maintenance from './routes/maintenance.js';
import { db } from './lib/db.js';

const app = express();
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const frontend = path.resolve(__dirname, '../../portfolio');

app.set('trust proxy', 1);
app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(cors({ origin: process.env.APP_ORIGIN || true, credentials: true }));
app.use(express.json({ limit: '2mb' }));
app.use(cookieParser());
app.use(morgan('tiny'));
app.use('/api/auth', rateLimit({ windowMs: 15 * 60 * 1000, limit: 20, standardHeaders: 'draft-8', legacyHeaders: false }));
const health = (_req: express.Request, res: express.Response) => res.json({ ok: true, service: 'mahmudul-portfolio-v8', time: new Date().toISOString() });
app.get('/robots.txt', (_req, res) => { res.type('text/plain').send('User-agent: *\nAllow: /\nDisallow: /admin.html\nDisallow: /api/admin/\nDisallow: /api/auth/\nSitemap: /sitemap.xml\n'); });
app.get('/sitemap.xml', async (_req, res) => {
  const origin=(process.env.APP_ORIGIN||'').replace(/\/$/,'') || 'http://localhost:3000';
  const urls=[`${origin}/`,`${origin}/blog.html`];
  try{
    const projects=await db.project.findMany({where:{status:'PUBLISHED',visibility:'PUBLIC',clientOnly:false,OR:[{scheduledAt:null},{scheduledAt:{lte:new Date()}}]},select:{slug:true,updatedAt:true}});
    urls.push(...projects.map(x=>`${origin}/work/${encodeURIComponent(x.slug)}`));
    const content=await db.content.findMany({where:{status:'PUBLISHED',OR:[{scheduledAt:null},{scheduledAt:{lte:new Date()}}]},select:{slug:true,updatedAt:true}});
    urls.push(...content.map(x=>`${origin}/blog.html?slug=${encodeURIComponent(x.slug)}`));
  }catch{}
  const xml='<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'+urls.map(u=>`<url><loc>${u.replace(/&/g,'&amp;')}</loc></url>`).join('')+'</urlset>';
  res.type('application/xml').send(xml);
});
app.get('/api/health', health);
app.get('/health', health);
app.use('/api/auth', auth);
app.use('/api/public', publicRoutes);
app.use('/api/admin', admin);
app.use('/api/admin/maintenance', maintenance);
app.use('/api', content);

app.get('/share/:token', (_req, res) => res.sendFile(path.join(frontend, 'share.html')));
app.get('/work/:slug', (_req, res) => res.sendFile(path.join(frontend, 'project.html')));
app.get('/journal/:slug', (_req, res) => res.sendFile(path.join(frontend, 'blog.html')));
app.use(express.static(frontend));
app.use((req, res, next) => { if (req.path.startsWith('/api/')) return next(); res.sendFile(path.join(frontend, 'index.html')); });
app.use((err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => { console.error(err); res.status(500).json({ error: 'Internal server error' }); });
export default app;
