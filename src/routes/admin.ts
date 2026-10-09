import express, { Router } from 'express';
import path from 'node:path';
import fs from 'node:fs/promises';
import * as fsSync from 'node:fs';
import { fileURLToPath } from 'node:url';
import { z } from 'zod';
import { Prisma } from '@prisma/client';
import { db } from '../lib/db.js';
import { requireAuth } from '../lib/auth.js';
import { createUploadUrl, uploadBuffer, deleteStoredObject } from '../lib/storage.js';
import { hashShareToken, newShareToken } from '../lib/tokens.js';
import ExcelJS from 'exceljs';
import { productionOrigin } from '../lib/origin.js';
import { createHash } from 'node:crypto';
import { notifyIndexNow } from '../lib/indexnow.js';
import { createRevision } from '../lib/revisions.js';

const router = Router();
router.use(requireAuth);

const projectSchema = z.object({
  title: z.string().min(1), slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/), category: z.string().min(1), service: z.string().optional().nullable(), type: z.string().optional().nullable(), client: z.string().optional().nullable(), year: z.number().int().optional().nullable(), role: z.string().optional().nullable(), description: z.string().optional().nullable(), coverImage: z.string().optional().nullable(), gallery: z.array(z.object({ url: z.string(), alt: z.string().optional().nullable(), width: z.number().int().optional().nullable(), height: z.number().int().optional().nullable(), sortOrder: z.number().int().default(0) })).default([]), challenge: z.string().optional().nullable(), approach: z.string().optional().nullable(), process: z.string().optional().nullable(), results: z.string().optional().nullable(), deliverables: z.array(z.string()).default([]), tools: z.array(z.string()).default([]), featured: z.boolean().default(false), sliderEnabled: z.boolean().default(true), sliderTransition: z.enum(['AUTO','MASK','DIAGONAL','SPLIT','CURTAIN','ZOOM','SLIDE']).default('AUTO'), sortOrder: z.number().int().default(0), status: z.enum(['DRAFT','PUBLISHED','ARCHIVED']).default('DRAFT'), visibility: z.enum(['PUBLIC','UNLISTED','PRIVATE']).default('PUBLIC'), clientOnly: z.boolean().default(false), clientExpiresAt: z.string().datetime().optional().nullable(), scheduledAt: z.string().datetime().optional().nullable(), seoTitle: z.string().optional().nullable(), seoDescription: z.string().optional().nullable(), liveUrl: z.string().url().optional().nullable()
});
const brandSchema = z.object({ name: z.string().min(1), logoAsset: z.string().optional().nullable(), url: z.string().url().optional().nullable(), sortOrder: z.number().int().default(0), active: z.boolean().default(true) });
const projectMetricSchema=z.object({id:z.string().optional(),label:z.string().min(1).max(120),value:z.string().max(80).optional().nullable(),prefix:z.string().max(30).optional().nullable(),suffix:z.string().max(40).optional().nullable(),beforeValue:z.string().max(80).optional().nullable(),afterValue:z.string().max(80).optional().nullable(),publicNote:z.string().max(500).optional().nullable(),sourceNote:z.string().max(1000).optional().nullable(),verified:z.boolean().default(false),visible:z.boolean().default(false),sortOrder:z.number().int().default(0)});
const projectV2Schema = projectSchema.extend({
  industry: z.string().max(120).optional().nullable(), projectSubtitle: z.string().max(240).optional().nullable(),
  credits: z.array(z.object({ label: z.string().min(1).max(80), value: z.string().min(1).max(240) })).default([]),
  projectBlocks: z.array(z.object({ id: z.string().min(1), type: z.enum(['TEXT','LARGE_IMAGE','FULL_BLEED_IMAGE','IMAGE_PAIR','IMAGE_GRID','GALLERY','VIDEO','BEFORE_AFTER','DESIGN_DECISIONS','DESIGN_SYSTEM','QUOTE','RESULTS','METRICS','DELIVERABLES','CREDITS','SPACER','DIVIDER','EMBED']), enabled: z.boolean().default(true), sortOrder: z.number().int().default(0), data: z.record(z.string(), z.unknown()).default({}) })).default([]),
  showOnHomepage: z.boolean().default(true), homepageOrder: z.number().int().default(0), homepageLayout: z.enum(['STANDARD','WIDE','FEATURE','PORTRAIT','FULL']).default('STANDARD'),
  homepageTitle: z.string().max(180).optional().nullable(), homepageSubtitle: z.string().max(240).optional().nullable(), homepageImage: z.string().max(1000).optional().nullable(),
  sliderImage: z.string().max(1000).optional().nullable(), sliderMobileImage: z.string().max(1000).optional().nullable(), sliderThumbnail:z.string().max(1000).optional().nullable(), sliderImageAlt:z.string().max(240).optional().nullable(), sliderTitle: z.string().max(180).optional().nullable(), sliderHeadline: z.string().max(240).optional().nullable(), sliderDescription: z.string().max(600).optional().nullable(), sliderCtaLabel: z.string().max(80).optional().nullable(), sliderCtaUrl: z.string().max(1000).optional().nullable(), sliderTextAlign: z.enum(['LEFT','CENTER','RIGHT']).default('LEFT'), sliderOverlay: z.number().int().min(0).max(90).default(35), sliderFocalPoint: z.string().regex(/^\s*(?:100|\d{1,2})(?:\.\d+)?%\s+(?:100|\d{1,2})(?:\.\d+)?%\s*$/).default('50% 50%'), sliderReflection:z.enum(['INHERIT','ON','OFF']).default('INHERIT'),sliderReflectionIntensity:z.enum(['SUBTLE','MEDIUM','STRONG']).optional().nullable(),
  ogImage: z.string().max(1000).optional().nullable(),ogTitle:z.string().max(180).optional().nullable(),ogDescription:z.string().max(500).optional().nullable(), canonicalUrl: z.string().url().optional().nullable(), noIndex: z.boolean().default(false),noFollow:z.boolean().default(false),includeSitemap:z.boolean().default(true),focusTopic:z.string().max(160).optional().nullable(),publicModifiedAt:z.string().datetime().optional().nullable(),relatedProjectIds:z.array(z.string()).max(30).default([]),relatedContentIds:z.array(z.string()).max(30).default([]), nextProjectId: z.string().optional().nullable(),
  resultMetrics:z.array(projectMetricSchema).max(20).default([])
});
const brandV2Schema = brandSchema.extend({ logoDark: z.string().max(1000).optional().nullable(), industry: z.string().max(120).optional().nullable(), description: z.string().max(600).optional().nullable(), featured: z.boolean().default(false) });

const metricData=(items:z.infer<typeof projectMetricSchema>[])=>items.map(({id:_,...item},index)=>({...item,sortOrder:index}));
router.get('/projects', async (_req, res) => res.json({ projects: await db.project.findMany({where:{deletedAt:null}, include:{resultMetrics:{orderBy:{sortOrder:'asc'}}},orderBy: [{ sortOrder: 'asc' }, { updatedAt: 'desc' }] }) }));
router.post('/projects', async (req, res) => { const p = projectV2Schema.safeParse(req.body); if (!p.success) return res.status(400).json({ error: p.error.flatten() }); const {resultMetrics,...input}=p.data;const project = await db.project.create({ data: { ...input, credits:input.credits as Prisma.InputJsonValue, projectBlocks:input.projectBlocks as Prisma.InputJsonValue, clientExpiresAt: input.clientExpiresAt ? new Date(input.clientExpiresAt) : null, scheduledAt: input.scheduledAt ? new Date(input.scheduledAt) : null,publicModifiedAt:input.status==='PUBLISHED'?(input.publicModifiedAt?new Date(input.publicModifiedAt):new Date()):null,resultMetrics:{create:metricData(resultMetrics)} },include:{resultMetrics:{orderBy:{sortOrder:'asc'}}} });if(project.status==='PUBLISHED'&&!project.noIndex)notifyIndexNow(`/work/${project.slug}`);res.status(201).json({ project }); });
router.get('/projects/:id', async (req, res) => { const project = await db.project.findUnique({ where: { id: req.params.id },include:{resultMetrics:{orderBy:{sortOrder:'asc'}}} }); if (!project) return res.status(404).json({ error: 'Project not found' }); res.json({ project }); });
router.patch('/projects/:id', async (req, res) => { const p = projectV2Schema.partial().safeParse(req.body); if (!p.success) return res.status(400).json({ error: p.error.flatten() });const existing=await db.project.findUnique({where:{id:req.params.id},include:{resultMetrics:true}});if(!existing)return res.status(404).json({error:'Project not found'});await createRevision('PROJECT',existing.id,existing,{actorId:res.locals.user?.sub,summary:p.data.status&&p.data.status!==existing.status?`${existing.status} → ${p.data.status}`:'Project saved',sourceAction:p.data.status==='PUBLISHED'?'PUBLISH':'SAVE'}); const {resultMetrics,...input}=p.data;const data = { ...input, credits:input.credits as Prisma.InputJsonValue|undefined, projectBlocks:input.projectBlocks as Prisma.InputJsonValue|undefined, clientExpiresAt: input.clientExpiresAt === undefined ? undefined : (input.clientExpiresAt ? new Date(input.clientExpiresAt) : null), scheduledAt: input.scheduledAt === undefined ? undefined : (input.scheduledAt ? new Date(input.scheduledAt) : null),publicModifiedAt:input.publicModifiedAt===undefined?(existing.status==='PUBLISHED'||input.status==='PUBLISHED'?new Date():undefined):(input.publicModifiedAt?new Date(input.publicModifiedAt):null),...(resultMetrics!==undefined?{resultMetrics:{deleteMany:{},create:metricData(resultMetrics)}}:{}) }; const project = await db.project.update({ where: { id: req.params.id }, data,include:{resultMetrics:{orderBy:{sortOrder:'asc'}}} });if(input.slug&&input.slug!==existing.slug&&existing.status==='PUBLISHED')await db.redirectRule.upsert({where:{sourcePath:`/work/${existing.slug}`},create:{sourcePath:`/work/${existing.slug}`,destination:`/work/${project.slug}`,statusCode:301,reason:'Automatic redirect after published project slug change'},update:{destination:`/work/${project.slug}`,enabled:true}});if(project.status==='PUBLISHED'&&!project.noIndex)notifyIndexNow(`/work/${project.slug}`); res.json({ project }); });
router.delete('/projects/:id', async (req, res) => { const project=await db.project.update({ where: { id: req.params.id },data:{deletedAt:new Date(),deletedBy:res.locals.user?.sub} });await db.activityLog.create({data:{action:'TRASH',entity:'PROJECT',entityId:project.id,label:project.title}}); res.status(204).end(); });
router.post('/projects/:id/share-link', async (req, res) => { const token = newShareToken(); const project = await db.project.update({ where: { id: req.params.id }, data: { visibility: 'UNLISTED', clientOnly: true, accessTokenHash: hashShareToken(token) } }); res.json({ project, token, url: `${productionOrigin()}/share/${token}` }); });
router.delete('/projects/:id/share-link', async (req, res) => { const project = await db.project.update({ where: { id: req.params.id }, data: { accessTokenHash: null } }); res.json({ project }); });

router.get('/brands', async (_req, res) => res.json({ brands: await db.brand.findMany({where:{deletedAt:null}, orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }] }) }));
router.post('/brands', async (req, res) => { const p = brandV2Schema.safeParse(req.body); if (!p.success) return res.status(400).json({ error: p.error.flatten() }); const brand = await db.brand.create({ data: p.data }); res.status(201).json({ brand }); });
router.patch('/brands/:id', async (req, res) => { const p = brandV2Schema.partial().safeParse(req.body); if (!p.success) return res.status(400).json({ error: p.error.flatten() }); const brand = await db.brand.update({ where: { id: req.params.id }, data: p.data }); res.json({ brand }); });
router.delete('/brands/:id', async (req, res) => { await db.brand.update({ where: { id: req.params.id },data:{deletedAt:new Date()} }); res.status(204).end(); });

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
  const configuredMax=Number(process.env.MAX_UPLOAD_BYTES||25000000);const max=process.env.VERCEL?Math.min(configuredMax,4_000_000):configuredMax;
  let body: Buffer;
  try {
    body = await readRequestBody(req, max);
  } catch (e) {
    return res.status(413).json({ error: e instanceof Error ? e.message : 'File is too large' });
  }
  if (!body.length) return res.status(400).json({ error: 'Empty file' });
  const checksum=createHash('sha256').update(body).digest('hex');
  const duplicate=await db.media.findUnique({where:{checksum}});
  if(duplicate)return res.json({key:duplicate.key,publicUrl:duplicate.url,provider:duplicate.provider,media:duplicate,duplicate:true,warning:'This file already exists in the Media Library.'});
  const quota=Number(process.env.MEDIA_STORAGE_QUOTA_BYTES||1073741824);const used=(await db.media.aggregate({_sum:{size:true}}))._sum.size||0;const exceedsQuota=used+body.length>quota;
  if(exceedsQuota&&process.env.STRICT_STORAGE_QUOTA==='true')return res.status(413).json({error:'This upload would exceed the configured media storage quota.'});
  const ext = path.extname(filename) || (contentType === 'image/png' ? '.png' : contentType === 'image/webp' ? '.webp' : '.jpg');
  const base = path.basename(filename, path.extname(filename)).replace(/[^a-z0-9._-]/g, '-') || 'image';
  const key = `portfolio/${Date.now()}-${base}${ext}`;
  try { const stored=await uploadBuffer(key,body,contentType); const dims=imageDimensions(body,contentType); const media=await db.media.create({data:{key:stored.key,url:stored.publicUrl!,provider:stored.provider,originalName:filenameHeader,filename,size:body.length,mimeType:contentType,width:dims?.width??null,height:dims?.height??null,checksum}}); res.json({...stored,media,warning:exceedsQuota?'Upload completed, but configured storage usage is now above quota.':undefined}); } catch (e) { res.status(503).json({ error: e instanceof Error ? e.message : 'Storage unavailable' }); }
});

function imageDimensions(buf:Buffer,mime:string){try{if(mime==='image/png'&&buf.length>24)return{width:buf.readUInt32BE(16),height:buf.readUInt32BE(20)};if(mime==='image/gif'&&buf.length>10)return{width:buf.readUInt16LE(6),height:buf.readUInt16LE(8)};if(mime==='image/webp'&&buf.toString('ascii',0,4)==='RIFF'&&buf.toString('ascii',8,12)==='WEBP'&&buf.toString('ascii',12,16)==='VP8X')return{width:1+buf.readUIntLE(24,3),height:1+buf.readUIntLE(27,3)};if(mime==='image/jpeg'&&buf[0]===255&&buf[1]===216){let o=2;while(o+9<buf.length){if(buf[o]!==255){o++;continue}const m=buf[o+1],l=buf.readUInt16BE(o+2);if([192,193,194,195,197,198,199,201,202,203,205,206,207].includes(m))return{width:buf.readUInt16BE(o+7),height:buf.readUInt16BE(o+5)};o+=2+l}}}catch{}return null}
function norm(v:string){return String(v||'').split('?')[0].replace(/\\/g,'/')}
router.get('/media',async(req,res)=>{const q=String(req.query.q||'').trim().toLowerCase(),type=String(req.query.type||'').trim(),page=Math.max(1,Number(req.query.page)||1),pageSize=Math.min(100,Math.max(10,Number(req.query.pageSize)||40));const media=await db.media.findMany({where:{deletedAt:null},orderBy:{createdAt:'desc'}});const projects=await db.project.findMany({where:{deletedAt:null},select:{title:true,coverImage:true,gallery:true,homepageImage:true,sliderImage:true,sliderMobileImage:true,ogImage:true}});const content=await db.content.findMany({where:{deletedAt:null},select:{title:true,coverImage:true,gallery:true,body:true}});const brands=await db.brand.findMany({where:{deletedAt:null},select:{name:true,logoAsset:true,logoDark:true}});const testimonials=await db.testimonial.findMany({where:{deletedAt:null},select:{client:true,photo:true}});const settings=await db.siteSettings.findFirst();const filtered=media.map(m=>{const u:any[]=[];const add=(kind:string,label:string,url:string)=>{if(url&&norm(url)===norm(m.url))u.push({kind,label})};for(const x of projects){add('PROJECT COVER',x.title,x.coverImage||'');add('PROJECT HOMEPAGE',x.title,x.homepageImage||'');add('PROJECT SLIDER',x.title,x.sliderImage||'');add('PROJECT SLIDER MOBILE',x.title,x.sliderMobileImage||'');add('PROJECT OG',x.title,x.ogImage||'');if(Array.isArray(x.gallery))for(const g of x.gallery as any[])add('PROJECT GALLERY',x.title,g?.url||'')}for(const x of content){add('JOURNAL COVER',x.title,x.coverImage||'');if(Array.isArray(x.gallery))for(const g of x.gallery as any[])add('JOURNAL GALLERY',x.title,g?.url||'');if(x.body?.includes(m.url))u.push({kind:'JOURNAL BODY',label:x.title})}for(const x of brands){add('BRAND LOGO',x.name,x.logoAsset||'');add('BRAND DARK LOGO',x.name,x.logoDark||'')}for(const x of testimonials)add('TESTIMONIAL PHOTO',x.client,x.photo||'');add('HERO IMAGE','Homepage Hero',settings?.heroImage||'');add('OG IMAGE','Site SEO',settings?.ogImage||'');return {...m,usage:u}}).filter(m=>!q||[m.originalName,m.filename,m.alt,m.title,m.description,...m.tags].filter(Boolean).join(' ').toLowerCase().includes(q)).filter(m=>!type||m.mimeType.startsWith(type));const start=(page-1)*pageSize;res.json({media:filtered.slice(start,start+pageSize),total:filtered.length,page,pageSize,pages:Math.max(1,Math.ceil(filtered.length/pageSize))})});
router.get('/media/quota',async(_req,res)=>{const quota=Number(process.env.MEDIA_STORAGE_QUOTA_BYTES||1073741824),groups=await db.media.groupBy({by:['mimeType','visibility'],_sum:{size:true},_count:{_all:true}}),used=groups.reduce((sum,row)=>sum+(row._sum.size||0),0),percent=quota?used/quota*100:0;res.json({used,quota,available:Math.max(0,quota-used),percent,assets:groups.reduce((sum,row)=>sum+row._count._all,0),provider:process.env.BLOB_READ_WRITE_TOKEN?'VERCEL BLOB':process.env.S3_BUCKET?'S3':process.env.GITHUB_TOKEN?'GITHUB':'LOCAL',health:'HEALTHY',strict:process.env.STRICT_STORAGE_QUOTA==='true',level:percent>=95?'CRITICAL':percent>=85?'WARNING':percent>=70?'NOTICE':'OK',breakdown:groups})});
router.post('/media/sync',async(_req,res)=>{
  // Resolve the project root robustly for both `tsx` development and compiled/runtime builds.
  // Do not rely only on import.meta.url pathname because the server may be launched from a
  // different working directory or from a bundled/transpiled location.
  const moduleDir=path.dirname(fileURLToPath(import.meta.url));
  const candidates=[
    path.resolve(process.cwd(),'portfolio'),
    path.resolve(moduleDir,'../../../portfolio'),
    path.resolve(moduleDir,'../../../../portfolio')
  ];
  const portfolioRoot=candidates.find(dir=>fsSync.existsSync(dir)) || candidates[0];
  const roots=[
    {dir:path.join(portfolioRoot,'uploads'),urlPrefix:'/uploads',keyPrefix:'uploads'},
    {dir:path.join(portfolioRoot,'assets'),urlPrefix:'/assets',keyPrefix:'assets'}
  ];
  let created=0,skipped=0,scanned=0;
  const mimeFor=(name:string)=>{
    const ext=path.extname(name).toLowerCase();
    return ext==='.png'?'image/png':ext==='.webp'?'image/webp':ext==='.gif'?'image/gif':ext==='.svg'?'image/svg+xml':ext==='.jpg'||ext==='.jpeg'?'image/jpeg':ext==='.avif'?'image/avif':ext==='.ico'?'image/x-icon':null;
  };
  try{
    const walk=async(root:{dir:string,urlPrefix:string,keyPrefix:string})=>{
      try{await fs.access(root.dir)}catch{return;}
      const visit=async(dir:string)=>{
        for(const name of await fs.readdir(dir,{withFileTypes:true})){
          const full=path.join(dir,name.name);
          if(name.isDirectory()){await visit(full);continue;}
          const mime=mimeFor(name.name);
          if(!mime)continue;
          scanned++;
          const rel=path.relative(root.dir,full).replace(/\\/g,'/');
          const key=`${root.keyPrefix}/${rel}`;
          const exists=await db.media.findUnique({where:{key}});
          if(exists){skipped++;continue;}
          const st=await fs.stat(full);
          await db.media.create({data:{key,url:`${root.urlPrefix}/${rel}`,provider:'local',originalName:name.name,filename:name.name,mimeType:mime,size:st.size}});
          created++;
        }
      };
      await visit(root.dir);
    };
    for(const root of roots)await walk(root);
    res.json({created,skipped,scanned,sources:['portfolio/uploads','portfolio/assets']});
  }catch(e){
    res.status(500).json({error:e instanceof Error?e.message:'Media sync failed',created,skipped,scanned});
  }
});
router.patch('/media/:id',async(req,res)=>{const p=z.object({alt:z.string().max(500).nullable().optional(),title:z.string().max(180).nullable().optional(),description:z.string().max(2000).nullable().optional(),caption:z.string().max(1000).nullable().optional(),creator:z.string().max(180).nullable().optional(),credit:z.string().max(300).nullable().optional(),decorative:z.boolean().optional(),tags:z.array(z.string().max(50)).max(30).optional(),folder:z.string().max(120).nullable().optional(),keep:z.boolean().optional()}).safeParse(req.body);if(!p.success)return res.status(400).json({error:p.error.flatten()});res.json({media:await db.media.update({where:{id:req.params.id},data:p.data})})});
async function mediaReferences(url:string){const [projects,content,brands,testimonials,settings]=await Promise.all([db.project.findMany(),db.content.findMany(),db.brand.findMany(),db.testimonial.findMany(),db.siteSettings.findFirst()]);const refs:string[]=[];const has=(value:unknown)=>typeof value==='string'&&norm(value)===norm(url);for(const p of projects)if([p.coverImage,p.homepageImage,p.sliderImage,p.sliderMobileImage,p.ogImage].some(has)||JSON.stringify(p.gallery).includes(url)||JSON.stringify(p.projectBlocks).includes(url))refs.push(`Project: ${p.title}`);for(const c of content)if(has(c.coverImage)||JSON.stringify(c.gallery).includes(url)||c.body.includes(url))refs.push(`Content: ${c.title}`);for(const b of brands)if(has(b.logoAsset)||has(b.logoDark))refs.push(`Brand: ${b.name}`);for(const t of testimonials)if(has(t.photo))refs.push(`Testimonial: ${t.client}`);if(settings&&(has(settings.heroImage)||has(settings.ogImage)||JSON.stringify(settings).includes(url)))refs.push('Site settings');return refs;}
router.delete('/media/:id',async(req,res)=>{const m=await db.media.findUnique({where:{id:req.params.id}});if(!m)return res.status(404).json({error:'Media not found'});const references=await mediaReferences(m.url);if(references.length)return res.status(409).json({error:'Media is currently in use.',references});await db.media.update({where:{id:m.id},data:{deletedAt:new Date(),status:'TRASHED'}});await db.activityLog.create({data:{action:'TRASH',entity:'MEDIA',entityId:m.id,label:m.filename}});res.status(204).end()});
router.post('/media/bulk-delete',async(req,res)=>{const ids=z.array(z.string()).min(1).max(100).safeParse(req.body?.ids);if(!ids.success)return res.status(400).json({error:'ids required'});const rows=await db.media.findMany({where:{id:{in:ids.data}}});const blocked=[];for(const m of rows){const references=await mediaReferences(m.url);if(references.length){blocked.push({id:m.id,filename:m.filename,references});continue;}await db.media.update({where:{id:m.id},data:{deletedAt:new Date(),status:'TRASHED'}})}res.json({deleted:rows.length-blocked.length,blocked,permanent:false})});
function text(v: unknown) { return v === undefined || v === null ? '' : String(v).trim(); }
function bool(v: unknown) { const x=text(v).toLowerCase(); return ['1','true','yes','y','on','published'].includes(x); }
function num(v: unknown, fallback=0) { const n=Number(v); return Number.isFinite(n) ? n : fallback; }
function slugify(v: unknown) { return text(v).toLowerCase().normalize('NFKD').replace(/[^a-z0-9\s-]/g,'').trim().replace(/\s+/g,'-').replace(/-+/g,'-').replace(/^-|-$/g,'') || `item-${Date.now()}`; }
function csvList(v: unknown) { return text(v).split(/\r?\n|[,|]/).map(x=>x.trim()).filter(Boolean); }
function rowValue(row: Record<string, unknown>, names: string[]) {
  const keys=Object.keys(row); for (const name of names) { const hit=keys.find(k=>k.toLowerCase().replace(/[^a-z0-9]/g,'')===name.toLowerCase().replace(/[^a-z0-9]/g,'')); if(hit!==undefined) return row[hit]; }
  return undefined;
}
function parseCsv(textValue:string){const rows:string[][]=[];let row:string[]=[],cell='',quoted=false;for(let i=0;i<textValue.length;i++){const char=textValue[i];if(char==='"'){if(quoted&&textValue[i+1]==='"'){cell+='"';i++}else quoted=!quoted}else if(char===','&&!quoted){row.push(cell);cell=''}else if((char==='\n'||char==='\r')&&!quoted){if(char==='\r'&&textValue[i+1]==='\n')i++;row.push(cell);if(row.some(value=>value!==''))rows.push(row);row=[];cell=''}else cell+=char}row.push(cell);if(row.some(value=>value!==''))rows.push(row);const [headers=[],...values]=rows;return values.map(columns=>Object.fromEntries(headers.map((header,index)=>[header.trim(),columns[index]??''])))}
async function parseSheet(buffer: Buffer) {
  if(buffer[0]!==0x50||buffer[1]!==0x4b)return parseCsv(buffer.toString('utf8'));
  const workbook=new ExcelJS.Workbook();await workbook.xlsx.load(buffer as unknown as ExcelJS.Buffer);const worksheet=workbook.worksheets[0];if(!worksheet)return [];
  const headers=(worksheet.getRow(1).values as unknown[]).slice(1).map(value=>String(value??''));const rows:Record<string,unknown>[]=[];worksheet.eachRow((row,rowNumber)=>{if(rowNumber===1)return;const values=(row.values as unknown[]).slice(1);if(values.some(value=>value!==null&&value!==undefined&&value!==''))rows.push(Object.fromEntries(headers.map((header,index)=>[header,values[index]??''])))});return rows;
}
async function exportWorkbook(rows:Record<string,unknown>[],sheetName:string){const workbook=new ExcelJS.Workbook(),worksheet=workbook.addWorksheet(sheetName);const keys=Object.keys(rows[0]||{});worksheet.columns=keys.map(key=>({header:key,key,width:Math.min(50,Math.max(12,key.length+2))}));worksheet.addRows(rows);worksheet.getRow(1).font={bold:true};return Buffer.from(await workbook.xlsx.writeBuffer())}
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
    gallery:[], challenge:text(rowValue(row,['challenge'])) || null, approach:text(rowValue(row,['approach'])) || null, process:text(rowValue(row,['process'])) || null, results:text(rowValue(row,['results','result','outcome'])) || null,
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
    const rows=await parseSheet(body); const mapped=rows.map(projectFromRow).filter(x=>x.title); res.json({count:mapped.length,rows:mapped.slice(0,100),totalRows:rows.length});
  } catch(e) { res.status(400).json({error:e instanceof Error?e.message:'Could not read project sheet'}); }
});
router.post('/import/projects', async (req,res)=>{
  try {
    const ct=String(req.headers['content-type']||''); let body:Buffer;
    if(ct.includes('application/json')) { const u=z.object({googleSheetUrl:z.string().url()}).safeParse(req.body); if(!u.success)return res.status(400).json({error:'Provide a valid Google Sheet URL'}); body=await fetchGoogleSheet(u.data.googleSheetUrl); }
    else body=await readImportBody(req, 20*1024*1024);
    const rows=(await parseSheet(body)).map(projectFromRow).filter(x=>x.title); const imported=[]; const skipped=[];
    for(const data of rows){ const exists=await db.project.findUnique({where:{slug:data.slug}}); if(exists){skipped.push({slug:data.slug,title:data.title,reason:'Slug already exists'});continue;} imported.push(await db.project.create({data})); }
    res.status(201).json({imported:imported.length,skipped:skipped.length,items:imported.map(x=>({id:x.id,title:x.title,slug:x.slug,status:x.status})),skippedItems:skipped});
  } catch(e) { res.status(400).json({error:e instanceof Error?e.message:'Could not import projects'}); }
});
router.post('/import/content/preview', async (req,res)=>{
  try { const ct=String(req.headers['content-type']||''); let body:Buffer; if(ct.includes('application/json')){const u=z.object({googleSheetUrl:z.string().url()}).safeParse(req.body);if(!u.success)return res.status(400).json({error:'Provide a valid Google Sheet URL'});body=await fetchGoogleSheet(u.data.googleSheetUrl)}else body=await readImportBody(req,20*1024*1024); const rows=await parseSheet(body);const mapped=rows.map(contentFromRow).filter(x=>x.title&&x.body);res.json({count:mapped.length,rows:mapped.slice(0,100),totalRows:rows.length}); }
  catch(e){res.status(400).json({error:e instanceof Error?e.message:'Could not read content sheet'});}
});
router.post('/import/content', async (req,res)=>{
  try { const ct=String(req.headers['content-type']||''); let body:Buffer; if(ct.includes('application/json')){const u=z.object({googleSheetUrl:z.string().url()}).safeParse(req.body);if(!u.success)return res.status(400).json({error:'Provide a valid Google Sheet URL'});body=await fetchGoogleSheet(u.data.googleSheetUrl)}else body=await readImportBody(req,20*1024*1024); const rows=(await parseSheet(body)).map(contentFromRow).filter(x=>x.title&&x.body);const imported=[];const skipped=[];for(const data of rows){const exists=await db.content.findUnique({where:{slug:data.slug}});if(exists){skipped.push({slug:data.slug,title:data.title,reason:'Slug already exists'});continue;}imported.push(await db.content.create({data}))}res.status(201).json({imported:imported.length,skipped:skipped.length,items:imported.map(x=>({id:x.id,title:x.title,slug:x.slug,status:x.status})),skippedItems:skipped}); }
  catch(e){res.status(400).json({error:e instanceof Error?e.message:'Could not import content'});}
});


function idsFromBody(body: unknown) {
  const parsed = z.object({ ids: z.array(z.string().min(1)).min(1) }).safeParse(body);
  return parsed.success ? parsed.data.ids : null;
}

router.post('/projects/bulk', async (req,res) => {
  const ids=idsFromBody(req.body); const action=text((req.body as any)?.action).toUpperCase();
  if(!ids || !['PUBLISH','DRAFT','ARCHIVE','DELETE'].includes(action)) return res.status(400).json({error:'Provide ids and one of PUBLISH, DRAFT, ARCHIVE, DELETE.'});
  if(action==='DELETE') await db.project.updateMany({where:{id:{in:ids}},data:{deletedAt:new Date(),deletedBy:res.locals.user?.sub}});
  else await db.project.updateMany({where:{id:{in:ids}},data:{status:action as any}});
  await db.activityLog.create({data:{action:`BULK_${action}`,entity:'PROJECT',label:`${ids.length} project(s)`}});
  res.json({ok:true,count:ids.length,action});
});

router.post('/brands/bulk', async (req,res) => {
  const ids=idsFromBody(req.body); const action=text((req.body as any)?.action).toUpperCase();
  if(!ids || !['ACTIVATE','HIDE','DELETE'].includes(action)) return res.status(400).json({error:'Provide ids and ACTIVATE, HIDE, or DELETE.'});
  if(action==='DELETE') await db.brand.updateMany({where:{id:{in:ids}},data:{deletedAt:new Date()}});
  else await db.brand.updateMany({where:{id:{in:ids}},data:{active:action==='ACTIVATE'}});
  await db.activityLog.create({data:{action:`BULK_${action}`,entity:'BRAND',label:`${ids.length} brand(s)`}});
  res.json({ok:true,count:ids.length,action});
});

router.get('/export/projects.xlsx', async (_req,res) => {
  const rows=await db.project.findMany({orderBy:[{sortOrder:'asc'},{updatedAt:'desc'}]});
  const data=rows.map(p=>({title:p.title,slug:p.slug,category:p.category,service:p.service,type:p.type,client:p.client,year:p.year,role:p.role,description:p.description,coverImage:p.coverImage,challenge:p.challenge,approach:p.approach,process:p.process,deliverables:p.deliverables.join(' | '),tools:p.tools.join(' | '),featured:p.featured,sliderEnabled:p.sliderEnabled,sliderTransition:p.sliderTransition,sortOrder:p.sortOrder,status:p.status,visibility:p.visibility,liveUrl:p.liveUrl,createdAt:p.createdAt.toISOString(),updatedAt:p.updatedAt.toISOString()}));
  const out=await exportWorkbook(data,'Projects');
  res.setHeader('Content-Type','application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');res.setHeader('Content-Disposition','attachment; filename="mahmudul-projects-export.xlsx"');res.send(out);
});

router.get('/export/brands.xlsx', async (_req,res) => {
  const rows=await db.brand.findMany({orderBy:[{sortOrder:'asc'},{name:'asc'}]}); const data=rows.map(b=>({name:b.name,logoAsset:b.logoAsset,url:b.url,sortOrder:b.sortOrder,active:b.active,createdAt:b.createdAt.toISOString(),updatedAt:b.updatedAt.toISOString()}));
  const out=await exportWorkbook(data,'Brands');res.setHeader('Content-Type','application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');res.setHeader('Content-Disposition','attachment; filename="mahmudul-brands-export.xlsx"');res.send(out);
});

export default router;
