import express, { Router } from 'express';
import path from 'node:path';
import { z } from 'zod';
import { db } from '../lib/db.js';
import { requireAuth } from '../lib/auth.js';
import { createUploadUrl, uploadBuffer } from '../lib/storage.js';
import { hashShareToken, newShareToken } from '../lib/tokens.js';
import * as XLSX from 'xlsx';

const router = Router();
router.use(requireAuth);

const projectSchema = z.object({
  title: z.string().min(1), slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/), category: z.string().min(1), service: z.string().optional().nullable(), type: z.string().optional().nullable(), client: z.string().optional().nullable(), year: z.number().int().optional().nullable(), role: z.string().optional().nullable(), description: z.string().optional().nullable(), coverImage: z.string().optional().nullable(), gallery: z.array(z.object({ url: z.string(), alt: z.string().optional().nullable(), width: z.number().int().optional().nullable(), height: z.number().int().optional().nullable(), sortOrder: z.number().int().default(0) })).default([]), challenge: z.string().optional().nullable(), approach: z.string().optional().nullable(), process: z.string().optional().nullable(), deliverables: z.array(z.string()).default([]), tools: z.array(z.string()).default([]), featured: z.boolean().default(false), sliderEnabled: z.boolean().default(true), sliderTransition: z.enum(['AUTO','MASK','DIAGONAL','SPLIT','CURTAIN','ZOOM','SLIDE']).default('AUTO'), sortOrder: z.number().int().default(0), status: z.enum(['DRAFT','PUBLISHED','ARCHIVED']).default('DRAFT'), visibility: z.enum(['PUBLIC','UNLISTED','PRIVATE']).default('PUBLIC'), clientOnly: z.boolean().default(false), clientExpiresAt: z.string().datetime().optional().nullable(), scheduledAt: z.string().datetime().optional().nullable(), seoTitle: z.string().optional().nullable(), seoDescription: z.string().optional().nullable(), liveUrl: z.string().url().optional().nullable()
});
const brandSchema = z.object({ name: z.string().min(1), logoAsset: z.string().optional().nullable(), url: z.string().url().optional().nullable(), sortOrder: z.number().int().default(0), active: z.boolean().default(true) });

router.get('/projects', async (_req, res) => res.json({ projects: await db.project.findMany({ orderBy: [{ sortOrder: 'asc' }, { updatedAt: 'desc' }] }) }));
router.post('/projects', async (req, res) => { const p = projectSchema.safeParse(req.body); if (!p.success) return res.status(400).json({ error: p.error.flatten() }); const project = await db.project.create({ data: { ...p.data, clientExpiresAt: p.data.clientExpiresAt ? new Date(p.data.clientExpiresAt) : null, scheduledAt: p.data.scheduledAt ? new Date(p.data.scheduledAt) : null } }); res.status(201).json({ project }); });
router.get('/projects/:id', async (req, res) => { const project = await db.project.findUnique({ where: { id: req.params.id } }); if (!project) return res.status(404).json({ error: 'Project not found' }); res.json({ project }); });
router.patch('/projects/:id', async (req, res) => { const p = projectSchema.partial().safeParse(req.body); if (!p.success) return res.status(400).json({ error: p.error.flatten() }); const data = { ...p.data, clientExpiresAt: p.data.clientExpiresAt === undefined ? undefined : (p.data.clientExpiresAt ? new Date(p.data.clientExpiresAt) : null), scheduledAt: p.data.scheduledAt === undefined ? undefined : (p.data.scheduledAt ? new Date(p.data.scheduledAt) : null) }; const project = await db.project.update({ where: { id: req.params.id }, data }); res.json({ project }); });
router.delete('/projects/:id', async (req, res) => { await db.project.delete({ where: { id: req.params.id } }); res.status(204).end(); });
router.post('/projects/:id/share-link', async (req, res) => { const token = newShareToken(); const project = await db.project.update({ where: { id: req.params.id }, data: { visibility: 'UNLISTED', clientOnly: true, accessTokenHash: hashShareToken(token) } }); const origin = process.env.APP_ORIGIN || 'http://localhost:8787'; res.json({ project, token, url: `${origin}/share/${token}` }); });
router.delete('/projects/:id/share-link', async (req, res) => { const project = await db.project.update({ where: { id: req.params.id }, data: { accessTokenHash: null } }); res.json({ project }); });

router.get('/brands', async (_req, res) => res.json({ brands: await db.brand.findMany({ orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }] }) }));
router.post('/brands', async (req, res) => { const p = brandSchema.safeParse(req.body); if (!p.success) return res.status(400).json({ error: p.error.flatten() }); const brand = await db.brand.create({ data: p.data }); res.status(201).json({ brand }); });
router.patch('/brands/:id', async (req, res) => { const p = brandSchema.partial().safeParse(req.body); if (!p.success) return res.status(400).json({ error: p.error.flatten() }); const brand = await db.brand.update({ where: { id: req.params.id }, data: p.data }); res.json({ brand }); });
router.delete('/brands/:id', async (req, res) => { await db.brand.delete({ where: { id: req.params.id } }); res.status(204).end(); });

router.post('/media/presign', async (req, res) => { const parsed = z.object({ filename: z.string().min(1).max(180), contentType: z.string().startsWith('image/'), size: z.number().int().positive() }).safeParse(req.body); if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() }); const max = Number(process.env.MAX_UPLOAD_BYTES || 25000000); if (parsed.data.size > max) return res.status(413).json({ error: 'File is too large' }); const safe = parsed.data.filename.toLowerCase().replace(/[^a-z0-9._-]/g, '-'); const key = `portfolio/${Date.now()}-${safe}`; try { res.json(await createUploadUrl(key, parsed.data.contentType)); } catch (e) { res.status(503).json({ error: e instanceof Error ? e.message : 'Storage unavailable' }); } });

async function readRequestBody(req: express.Request, maxBytes: number) {
  const chunks: Buffer[] = [];
  let total = 0;
  for await (const chunk of req) {
    const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
    total += buffer.length;
    if (total > maxBytes) throw new Error('File is too large');
    chunks.push(buffer);
  }
  return Buffer.concat(chunks, total);
}

router.post('/media/upload', async (req, res) => {
  const contentType = String(req.headers['content-type'] || '');
  if (!contentType.startsWith('image/')) return res.status(400).json({ error: 'Only image uploads are allowed' });
  const filenameHeader = decodeURIComponent(String(req.headers['x-filename'] || 'upload-image')).slice(0, 180);
  const filename = filenameHeader.toLowerCase().replace(/[^a-z0-9._-]/g, '-') || 'upload-image';
  const max = Number(process.env.MAX_UPLOAD_BYTES || 25000000);
  let body: Buffer;
  try {
    body = await readRequestBody(req, max);
  } catch (e) {
    return res.status(413).json({ error: e instanceof Error ? e.message : 'File is too large' });
  }
  if (!body.length) return res.status(400).json({ error: 'Empty file' });
  const ext = path.extname(filename) || (contentType === 'image/png' ? '.png' : contentType === 'image/webp' ? '.webp' : '.jpg');
  const base = path.basename(filename, path.extname(filename)).replace(/[^a-z0-9._-]/g, '-') || 'image';
  const key = `portfolio/${Date.now()}-${base}${ext}`;
  try { res.json(await uploadBuffer(key, body, contentType)); } catch (e) { res.status(503).json({ error: e instanceof Error ? e.message : 'Storage unavailable' }); }
});

function text(v: unknown) { return v === undefined || v === null ? '' : String(v).trim(); }
function bool(v: unknown) { const x=text(v).toLowerCase(); return ['1','true','yes','y','on','published'].includes(x); }
function num(v: unknown, fallback=0) { const n=Number(v); return Number.isFinite(n) ? n : fallback; }
function slugify(v: unknown) { return text(v).toLowerCase().normalize('NFKD').replace(/[^a-z0-9\s-]/g,'').trim().replace(/\s+/g,'-').replace(/-+/g,'-').replace(/^-|-$/g,'') || `item-${Date.now()}`; }
function csvList(v: unknown) { return text(v).split(/\r?\n|[,|]/).map(x=>x.trim()).filter(Boolean); }
function rowValue(row: Record<string, unknown>, names: string[]) {
  const keys=Object.keys(row); for (const name of names) { const hit=keys.find(k=>k.toLowerCase().replace(/[^a-z0-9]/g,'')===name.toLowerCase().replace(/[^a-z0-9]/g,'')); if(hit!==undefined) return row[hit]; }
  return undefined;
}
function parseSheet(buffer: Buffer) {
  const wb=XLSX.read(buffer,{type:'buffer',cellDates:true});
  const ws=wb.Sheets[wb.SheetNames[0]]; if(!ws) return [];
  return XLSX.utils.sheet_to_json<Record<string,unknown>>(ws,{defval:''});
}
async function readImportBody(req: express.Request, maxBytes: number) {
  const chunks: Buffer[]=[]; let total=0;
  for await (const chunk of req) { const b=Buffer.isBuffer(chunk)?chunk:Buffer.from(chunk); total+=b.length; if(total>maxBytes) throw new Error('Import file is too large'); chunks.push(b); }
  return Buffer.concat(chunks,total);
}
async function fetchGoogleSheet(url: string) {
  const u=new URL(url);
  if(u.hostname!=='docs.google.com' || !u.pathname.includes('/spreadsheets/')) throw new Error('Only public Google Sheets spreadsheet URLs are supported.');
  const m=u.pathname.match(/\/spreadsheets\/d\/([^/]+)/); if(!m) throw new Error('Could not read the Google Sheet ID.');
  const gid=u.searchParams.get('gid') || '0';
  const exportUrl=`https://docs.google.com/spreadsheets/d/${m[1]}/export?format=csv&gid=${encodeURIComponent(gid)}`;
  const r=await fetch(exportUrl); if(!r.ok) throw new Error(`Google Sheet export failed (${r.status}). Make the sheet viewable to anyone with the link.`);
  return Buffer.from(await r.arrayBuffer());
}
function projectFromRow(row: Record<string,unknown>) {
  const title=text(rowValue(row,['title','name','project title']));
  const slug=slugify(rowValue(row,['slug']) || title);
  return {
    title, slug, category:text(rowValue(row,['category'])) || 'Amazon / E-commerce', service:text(rowValue(row,['service','subcategory'])) || null,
    type:text(rowValue(row,['type','project type'])) || null, client:text(rowValue(row,['client','brand'])) || null, year:num(rowValue(row,['year']),0)||null,
    role:text(rowValue(row,['role'])) || null, description:text(rowValue(row,['description','overview'])) || null, coverImage:text(rowValue(row,['coverimage','cover image','image','image url'])) || null,
    gallery:[], challenge:text(rowValue(row,['challenge'])) || null, approach:text(rowValue(row,['approach'])) || null, process:text(rowValue(row,['process'])) || null,
    deliverables:csvList(rowValue(row,['deliverables'])), tools:csvList(rowValue(row,['tools','software'])), featured:bool(rowValue(row,['featured','special'])), sliderEnabled: rowValue(row,['sliderenabled','slider enabled','slider'])===undefined ? true : bool(rowValue(row,['sliderenabled','slider enabled','slider'])), sliderTransition:['AUTO','MASK','DIAGONAL','SPLIT','CURTAIN','ZOOM','SLIDE'].includes((text(rowValue(row,['slidertransition','slider transition']))||'AUTO').toUpperCase()) ? (text(rowValue(row,['slidertransition','slider transition']))||'AUTO').toUpperCase() : 'AUTO',
    sortOrder:num(rowValue(row,['sortorder','order']),0), status:'DRAFT' as const, visibility:'PUBLIC' as const, clientOnly:false,
    clientExpiresAt:null, seoTitle:text(rowValue(row,['seotitle','seo title'])) || null, seoDescription:text(rowValue(row,['seodescription','seo description'])) || null,
    liveUrl:text(rowValue(row,['liveurl','live url','url'])) || null,
  };
}
function contentFromRow(row: Record<string,unknown>) {
  const title=text(rowValue(row,['title','name','content title']));
  return { title, slug:slugify(rowValue(row,['slug'])||title), type:text(rowValue(row,['type','content type']))||'BLOG', category:text(rowValue(row,['category']))||null,
    excerpt:text(rowValue(row,['excerpt','summary']))||null, body:text(rowValue(row,['body','content','article','text'])), coverImage:text(rowValue(row,['coverimage','cover image','image','image url']))||null,
    gallery:[], tags:csvList(rowValue(row,['tags','tag'])), author:text(rowValue(row,['author']))||null, seoTitle:text(rowValue(row,['seotitle','seo title']))||null,
    seoDescription:text(rowValue(row,['seodescription','seo description']))||null, status:'DRAFT' as const, featured:bool(rowValue(row,['featured'])), sortOrder:num(rowValue(row,['sortorder','order']),0), publishedAt:null };
}

router.post('/import/projects/preview', async (req,res)=>{
  try {
    const ct=String(req.headers['content-type']||''); let body:Buffer;
    if(ct.includes('application/json')) { const u=z.object({googleSheetUrl:z.string().url()}).safeParse(req.body); if(!u.success)return res.status(400).json({error:'Provide a valid Google Sheet URL'}); body=await fetchGoogleSheet(u.data.googleSheetUrl); }
    else body=await readImportBody(req, 20*1024*1024);
    const rows=parseSheet(body); const mapped=rows.map(projectFromRow).filter(x=>x.title); res.json({count:mapped.length,rows:mapped.slice(0,100),totalRows:rows.length});
  } catch(e) { res.status(400).json({error:e instanceof Error?e.message:'Could not read project sheet'}); }
});
router.post('/import/projects', async (req,res)=>{
  try {
    const ct=String(req.headers['content-type']||''); let body:Buffer;
    if(ct.includes('application/json')) { const u=z.object({googleSheetUrl:z.string().url()}).safeParse(req.body); if(!u.success)return res.status(400).json({error:'Provide a valid Google Sheet URL'}); body=await fetchGoogleSheet(u.data.googleSheetUrl); }
    else body=await readImportBody(req, 20*1024*1024);
    const rows=parseSheet(body).map(projectFromRow).filter(x=>x.title); const imported=[]; const skipped=[];
    for(const data of rows){ const exists=await db.project.findUnique({where:{slug:data.slug}}); if(exists){skipped.push({slug:data.slug,title:data.title,reason:'Slug already exists'});continue;} imported.push(await db.project.create({data})); }
    res.status(201).json({imported:imported.length,skipped:skipped.length,items:imported.map(x=>({id:x.id,title:x.title,slug:x.slug,status:x.status})),skippedItems:skipped});
  } catch(e) { res.status(400).json({error:e instanceof Error?e.message:'Could not import projects'}); }
});
router.post('/import/content/preview', async (req,res)=>{
  try { const ct=String(req.headers['content-type']||''); let body:Buffer; if(ct.includes('application/json')){const u=z.object({googleSheetUrl:z.string().url()}).safeParse(req.body);if(!u.success)return res.status(400).json({error:'Provide a valid Google Sheet URL'});body=await fetchGoogleSheet(u.data.googleSheetUrl)}else body=await readImportBody(req,20*1024*1024); const rows=parseSheet(body);const mapped=rows.map(contentFromRow).filter(x=>x.title&&x.body);res.json({count:mapped.length,rows:mapped.slice(0,100),totalRows:rows.length}); }
  catch(e){res.status(400).json({error:e instanceof Error?e.message:'Could not read content sheet'});}
});
router.post('/import/content', async (req,res)=>{
  try { const ct=String(req.headers['content-type']||''); let body:Buffer; if(ct.includes('application/json')){const u=z.object({googleSheetUrl:z.string().url()}).safeParse(req.body);if(!u.success)return res.status(400).json({error:'Provide a valid Google Sheet URL'});body=await fetchGoogleSheet(u.data.googleSheetUrl)}else body=await readImportBody(req,20*1024*1024); const rows=parseSheet(body).map(contentFromRow).filter(x=>x.title&&x.body);const imported=[];const skipped=[];for(const data of rows){const exists=await db.content.findUnique({where:{slug:data.slug}});if(exists){skipped.push({slug:data.slug,title:data.title,reason:'Slug already exists'});continue;}imported.push(await db.content.create({data}))}res.status(201).json({imported:imported.length,skipped:skipped.length,items:imported.map(x=>({id:x.id,title:x.title,slug:x.slug,status:x.status})),skippedItems:skipped}); }
  catch(e){res.status(400).json({error:e instanceof Error?e.message:'Could not import content'});}
});


function idsFromBody(body: unknown) {
  const parsed = z.object({ ids: z.array(z.string().min(1)).min(1) }).safeParse(body);
  return parsed.success ? parsed.data.ids : null;
}

router.post('/projects/bulk', async (req,res) => {
  const ids=idsFromBody(req.body); const action=text((req.body as any)?.action).toUpperCase();
  if(!ids || !['PUBLISH','DRAFT','ARCHIVE','DELETE'].includes(action)) return res.status(400).json({error:'Provide ids and one of PUBLISH, DRAFT, ARCHIVE, DELETE.'});
  if(action==='DELETE') await db.project.deleteMany({where:{id:{in:ids}}});
  else await db.project.updateMany({where:{id:{in:ids}},data:{status:action as any}});
  await db.activityLog.create({data:{action:`BULK_${action}`,entity:'PROJECT',label:`${ids.length} project(s)`}});
  res.json({ok:true,count:ids.length,action});
});

router.post('/brands/bulk', async (req,res) => {
  const ids=idsFromBody(req.body); const action=text((req.body as any)?.action).toUpperCase();
  if(!ids || !['ACTIVATE','HIDE','DELETE'].includes(action)) return res.status(400).json({error:'Provide ids and ACTIVATE, HIDE, or DELETE.'});
  if(action==='DELETE') await db.brand.deleteMany({where:{id:{in:ids}}});
  else await db.brand.updateMany({where:{id:{in:ids}},data:{active:action==='ACTIVATE'}});
  await db.activityLog.create({data:{action:`BULK_${action}`,entity:'BRAND',label:`${ids.length} brand(s)`}});
  res.json({ok:true,count:ids.length,action});
});

router.get('/export/projects.xlsx', async (_req,res) => {
  const rows=await db.project.findMany({orderBy:[{sortOrder:'asc'},{updatedAt:'desc'}]});
  const data=rows.map(p=>({title:p.title,slug:p.slug,category:p.category,service:p.service,type:p.type,client:p.client,year:p.year,role:p.role,description:p.description,coverImage:p.coverImage,challenge:p.challenge,approach:p.approach,process:p.process,deliverables:p.deliverables.join(' | '),tools:p.tools.join(' | '),featured:p.featured,sliderEnabled:p.sliderEnabled,sliderTransition:p.sliderTransition,sortOrder:p.sortOrder,status:p.status,visibility:p.visibility,liveUrl:p.liveUrl,createdAt:p.createdAt.toISOString(),updatedAt:p.updatedAt.toISOString()}));
  const wb=XLSX.utils.book_new(); XLSX.utils.book_append_sheet(wb,XLSX.utils.json_to_sheet(data),'Projects'); const out=XLSX.write(wb,{type:'buffer',bookType:'xlsx'});
  res.setHeader('Content-Type','application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');res.setHeader('Content-Disposition','attachment; filename="mahmudul-projects-export.xlsx"');res.send(out);
});

router.get('/export/brands.xlsx', async (_req,res) => {
  const rows=await db.brand.findMany({orderBy:[{sortOrder:'asc'},{name:'asc'}]}); const data=rows.map(b=>({name:b.name,logoAsset:b.logoAsset,url:b.url,sortOrder:b.sortOrder,active:b.active,createdAt:b.createdAt.toISOString(),updatedAt:b.updatedAt.toISOString()}));
  const wb=XLSX.utils.book_new();XLSX.utils.book_append_sheet(wb,XLSX.utils.json_to_sheet(data),'Brands');const out=XLSX.write(wb,{type:'buffer',bookType:'xlsx'});res.setHeader('Content-Type','application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');res.setHeader('Content-Disposition','attachment; filename="mahmudul-brands-export.xlsx"');res.send(out);
});

export default router;
