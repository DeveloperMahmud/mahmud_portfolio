import { Router } from 'express';
import { z } from 'zod';
import { db } from '../lib/db.js';
import { requireAuth } from '../lib/auth.js';
import ExcelJS from 'exceljs';
import { Prisma } from '@prisma/client';
import { notifyIndexNow } from '../lib/indexnow.js';
import { createRevision } from '../lib/revisions.js';
import { contentPublishIssues, publishBlocked } from '../lib/publish-safety.js';

const router = Router();
const routeParam = (value: string | string[] | undefined) => Array.isArray(value) ? value[0] : value;
const contentSchema = z.object({
  title: z.string().min(1), slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  type: z.string().default('BLOG'), category: z.string().optional().nullable(), excerpt: z.string().optional().nullable(), body: z.string().min(1),
  coverImage: z.string().optional().nullable(), gallery: z.array(z.any()).default([]), tags: z.array(z.string()).default([]), author: z.string().optional().nullable(),
  seoTitle: z.string().max(180).optional().nullable(), seoDescription: z.string().max(500).optional().nullable(), ogTitle:z.string().max(180).optional().nullable(),ogDescription:z.string().max(500).optional().nullable(),ogImage:z.string().max(1000).optional().nullable(),canonicalUrl:z.string().url().optional().nullable(),noIndex:z.boolean().default(false),noFollow:z.boolean().default(false),includeSitemap:z.boolean().default(true),focusTopic:z.string().max(160).optional().nullable(),references:z.array(z.object({label:z.string().max(180),url:z.string().url()})).max(30).default([]),relatedProjectIds:z.array(z.string()).max(30).default([]),relatedContentIds:z.array(z.string()).max(30).default([]),publicModifiedAt:z.string().datetime().optional().nullable(), status: z.enum(['DRAFT','PUBLISHED','ARCHIVED']).default('DRAFT'), featured: z.boolean().default(false), sortOrder: z.number().int().default(0), publishedAt: z.string().datetime().optional().nullable(), scheduledAt: z.string().datetime().optional().nullable()
});

router.get('/admin/content', requireAuth, async (_req, res) => { res.set('Cache-Control','no-store, no-cache, must-revalidate'); const rows=await db.content.findMany({where:{deletedAt:null}, orderBy: [{ sortOrder:'asc' }, { updatedAt:'desc' }] }); res.json({ content: rows.map(x=>({ ...x, id:String(x.id) })) }); });
router.post('/admin/content', requireAuth, async (req,res)=>{
  const p=contentSchema.safeParse(req.body); if(!p.success)return res.status(400).json({error:p.error.flatten()});
  if(p.data.status==='PUBLISHED'){const issues=await contentPublishIssues(p.data);const blocked=publishBlocked(issues);if(blocked.length)return res.status(422).json({error:'Publish safety check failed. Resolve the required items first.',issues});}
  const data={...p.data,references:p.data.references as Prisma.InputJsonValue,publishedAt:p.data.status==='PUBLISHED'?(p.data.publishedAt?new Date(p.data.publishedAt):new Date()):null,scheduledAt:p.data.scheduledAt?new Date(p.data.scheduledAt):null,publicModifiedAt:p.data.status==='PUBLISHED'?(p.data.publicModifiedAt?new Date(p.data.publicModifiedAt):new Date()):null};
  const content=await db.content.create({data});if(content.status==='PUBLISHED'&&!content.noIndex)notifyIndexNow(`/journal/${content.slug}`);res.status(201).json({content});
});
router.get('/admin/content/by-slug/:slug', requireAuth, async(req,res)=>{const slug=routeParam(req.params.slug);if(!slug)return res.status(400).json({error:'A valid slug is required'});const content=await db.content.findUnique({where:{slug}});if(!content)return res.status(404).json({error:'Content not found'});res.set('Cache-Control','no-store');res.json({content:{...content,id:String(content.id)}})});
router.get('/admin/content/:id', requireAuth, async(req,res)=>{const id=routeParam(req.params.id);if(!id)return res.status(400).json({error:'A valid content ID is required'});const content=await db.content.findUnique({where:{id}});if(!content)return res.status(404).json({error:'Content not found'});res.json({content})});
router.patch('/admin/content/:id', requireAuth, async(req,res)=>{
  const id=String(req.params.id||'').trim();
  if(!id || id==='undefined' || id==='null') return res.status(400).json({error:'A valid content ID is required for update.'});
  const p=contentSchema.partial().safeParse(req.body); if(!p.success)return res.status(400).json({error:p.error.flatten()});
  const existing=await db.content.findUnique({where:{id}});if(!existing)return res.status(404).json({error:'Content record not found.'});
  const candidate={...existing,...p.data};if((p.data.status==='PUBLISHED'||existing.status==='PUBLISHED')&&p.data.status!=='DRAFT'&&p.data.status!=='ARCHIVED'){const issues=await contentPublishIssues(candidate);const blocked=publishBlocked(issues);if(blocked.length)return res.status(422).json({error:'Publish safety check failed. Resolve the required items first.',issues});}
  await createRevision('CONTENT',existing.id,existing,{actorId:res.locals.user?.sub,summary:p.data.status&&p.data.status!==existing.status?`${existing.status} → ${p.data.status}`:'Article saved',sourceAction:p.data.status==='PUBLISHED'?'PUBLISH':'SAVE'});
  const data={...p.data,references:p.data.references as Prisma.InputJsonValue|undefined,publishedAt:p.data.status===undefined? (p.data.publishedAt===undefined?undefined:(p.data.publishedAt?new Date(p.data.publishedAt):null)) : (p.data.status==='PUBLISHED'?(p.data.publishedAt?new Date(p.data.publishedAt):new Date()):null),scheduledAt:p.data.scheduledAt===undefined?undefined:(p.data.scheduledAt?new Date(p.data.scheduledAt):null),publicModifiedAt:p.data.publicModifiedAt===undefined?(existing.status==='PUBLISHED'||p.data.status==='PUBLISHED'?new Date():undefined):(p.data.publicModifiedAt?new Date(p.data.publicModifiedAt):null)};
  try { const content=await db.content.update({where:{id},data});if(p.data.slug&&p.data.slug!==existing.slug&&existing.status==='PUBLISHED')await db.redirectRule.upsert({where:{sourcePath:`/journal/${existing.slug}`},create:{sourcePath:`/journal/${existing.slug}`,destination:`/journal/${content.slug}`,statusCode:301,reason:'Automatic redirect after published article slug change'},update:{destination:`/journal/${content.slug}`,enabled:true}});if(content.status==='PUBLISHED'&&!content.noIndex)notifyIndexNow(`/journal/${content.slug}`);res.json({content}); } catch(e:any) { if(e?.code==='P2025') return res.status(404).json({error:'Content record not found. Refresh the CMS and try again.'}); if(e?.code==='P2002') return res.status(409).json({error:'That slug is already in use. Choose a different slug.'}); throw e; }
});
router.delete('/admin/content/:id', requireAuth, async(req,res)=>{const id=routeParam(req.params.id);if(!id)return res.status(400).json({error:'A valid content ID is required'});const item=await db.content.update({where:{id},data:{deletedAt:new Date(),deletedBy:res.locals.user?.sub}});await db.activityLog.create({data:{action:'TRASH',entity:'CONTENT',entityId:item.id,label:item.title}});res.status(204).end()});

router.get('/public/content', async(_req,res)=>{const content=await db.content.findMany({where:{deletedAt:null,status:'PUBLISHED',OR:[{scheduledAt:null},{scheduledAt:{lte:new Date()}}]},orderBy:[{publishedAt:'desc'},{sortOrder:'asc'}]});res.json({content})});
router.get('/public/content/:slug', async(req,res)=>{const content=await db.content.findFirst({where:{deletedAt:null,slug:req.params.slug,status:'PUBLISHED',OR:[{scheduledAt:null},{scheduledAt:{lte:new Date()}}]}});if(!content)return res.status(404).json({error:'Content not found'});res.json({content})});

router.post('/admin/content/bulk', requireAuth, async (req,res) => {
  const parsed=z.object({ids:z.array(z.string().min(1)).min(1),action:z.enum(['PUBLISH','DRAFT','ARCHIVE','DELETE'])}).safeParse(req.body);
  if(!parsed.success)return res.status(400).json({error:'Provide ids and PUBLISH, DRAFT, ARCHIVE, or DELETE.'});
  if(parsed.data.action==='PUBLISH'){const rows=await db.content.findMany({where:{id:{in:parsed.data.ids},deletedAt:null}});const checks=await Promise.all(rows.map(async content=>({id:content.id,title:content.title,issues:publishBlocked(await contentPublishIssues(content as any))})));const blocked=checks.filter(x=>x.issues.length);if(blocked.length)return res.status(422).json({error:'Publish safety check failed. Review the listed articles.',blocked});}
  if(parsed.data.action==='DELETE') await db.content.updateMany({where:{id:{in:parsed.data.ids}},data:{deletedAt:new Date(),deletedBy:res.locals.user?.sub}});
  else {
    const statusByAction = { DRAFT: 'DRAFT', PUBLISH: 'PUBLISHED', ARCHIVE: 'ARCHIVED' } as const;
    const status = statusByAction[parsed.data.action];
    await db.content.updateMany({where:{id:{in:parsed.data.ids}},data:{status,publishedAt:status==='PUBLISHED'?new Date():null}});
  }
  await db.activityLog.create({data:{action:`BULK_${parsed.data.action}`,entity:'CONTENT',label:`${parsed.data.ids.length} content item(s)`}});
  res.json({ok:true,count:parsed.data.ids.length,action:parsed.data.action});
});

router.get('/admin/export/content.xlsx', requireAuth, async (_req,res) => {
  const rows=await db.content.findMany({orderBy:[{sortOrder:'asc'},{updatedAt:'desc'}]});
  const data=rows.map(c=>({title:c.title,slug:c.slug,type:c.type,category:c.category,excerpt:c.excerpt,body:c.body,coverImage:c.coverImage,tags:c.tags.join(', '),author:c.author,seoTitle:c.seoTitle,seoDescription:c.seoDescription,status:c.status,featured:c.featured,sortOrder:c.sortOrder,publishedAt:c.publishedAt?.toISOString()||'',createdAt:c.createdAt.toISOString(),updatedAt:c.updatedAt.toISOString()}));
  const workbook=new ExcelJS.Workbook(),worksheet=workbook.addWorksheet('Content');const keys=Object.keys(data[0]||{});worksheet.columns=keys.map(key=>({header:key,key,width:Math.min(50,Math.max(12,key.length+2))}));worksheet.addRows(data);worksheet.getRow(1).font={bold:true};const out=Buffer.from(await workbook.xlsx.writeBuffer());res.setHeader('Content-Type','application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');res.setHeader('Content-Disposition','attachment; filename="mahmudul-content-export.xlsx"');res.send(out);
});

export default router;
