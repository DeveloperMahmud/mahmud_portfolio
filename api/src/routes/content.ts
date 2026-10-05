import { Router } from 'express';
import { z } from 'zod';
import { db } from '../lib/db.js';
import { requireAuth } from '../lib/auth.js';

const router = Router();
const contentSchema = z.object({
  title: z.string().min(1), slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  type: z.string().default('BLOG'), category: z.string().optional().nullable(), excerpt: z.string().optional().nullable(), body: z.string().min(1),
  coverImage: z.string().optional().nullable(), gallery: z.array(z.any()).default([]), tags: z.array(z.string()).default([]), author: z.string().optional().nullable(),
  seoTitle: z.string().optional().nullable(), seoDescription: z.string().optional().nullable(), status: z.enum(['DRAFT','PUBLISHED','ARCHIVED']).default('DRAFT'), featured: z.boolean().default(false), sortOrder: z.number().int().default(0), publishedAt: z.string().datetime().optional().nullable(), scheduledAt: z.string().datetime().optional().nullable()
});

router.get('/admin/content', requireAuth, async (_req, res) => { res.set('Cache-Control','no-store, no-cache, must-revalidate'); const rows=await db.content.findMany({ orderBy: [{ sortOrder:'asc' }, { updatedAt:'desc' }] }); res.json({ content: rows.map(x=>({ ...x, id:String(x.id) })) }); });
router.post('/admin/content', requireAuth, async (req,res)=>{
  const p=contentSchema.safeParse(req.body); if(!p.success)return res.status(400).json({error:p.error.flatten()});
  const data={...p.data,publishedAt:p.data.status==='PUBLISHED'?(p.data.publishedAt?new Date(p.data.publishedAt):new Date()):null,scheduledAt:p.data.scheduledAt?new Date(p.data.scheduledAt):null};
  const content=await db.content.create({data}); res.status(201).json({content});
});
router.get('/admin/content/by-slug/:slug', requireAuth, async(req,res)=>{const content=await db.content.findUnique({where:{slug:req.params.slug}});if(!content)return res.status(404).json({error:'Content not found'});res.set('Cache-Control','no-store');res.json({content:{...content,id:String(content.id)}})});
router.get('/admin/content/:id', requireAuth, async(req,res)=>{const content=await db.content.findUnique({where:{id:req.params.id}});if(!content)return res.status(404).json({error:'Content not found'});res.json({content})});
router.patch('/admin/content/:id', requireAuth, async(req,res)=>{
  const id=String(req.params.id||'').trim();
  if(!id || id==='undefined' || id==='null') return res.status(400).json({error:'A valid content ID is required for update.'});
  const p=contentSchema.partial().safeParse(req.body); if(!p.success)return res.status(400).json({error:p.error.flatten()});
  const data={...p.data,publishedAt:p.data.status===undefined? (p.data.publishedAt===undefined?undefined:(p.data.publishedAt?new Date(p.data.publishedAt):null)) : (p.data.status==='PUBLISHED'?(p.data.publishedAt?new Date(p.data.publishedAt):new Date()):null),scheduledAt:p.data.scheduledAt===undefined?undefined:(p.data.scheduledAt?new Date(p.data.scheduledAt):null)};
  try { const content=await db.content.update({where:{id},data});res.json({content}); } catch(e:any) { if(e?.code==='P2025') return res.status(404).json({error:'Content record not found. Refresh the CMS and try again.'}); if(e?.code==='P2002') return res.status(409).json({error:'That slug is already in use. Choose a different slug.'}); throw e; }
});
router.delete('/admin/content/:id', requireAuth, async(req,res)=>{await db.content.delete({where:{id:req.params.id}});res.status(204).end()});

router.get('/public/content', async(_req,res)=>{const content=await db.content.findMany({where:{status:'PUBLISHED',OR:[{scheduledAt:null},{scheduledAt:{lte:new Date()}}]},orderBy:[{publishedAt:'desc'},{sortOrder:'asc'}]});res.json({content})});
router.get('/public/content/:slug', async(req,res)=>{const content=await db.content.findFirst({where:{slug:req.params.slug,status:'PUBLISHED',OR:[{scheduledAt:null},{scheduledAt:{lte:new Date()}}]}});if(!content)return res.status(404).json({error:'Content not found'});res.json({content})});

router.post('/admin/content/bulk', requireAuth, async (req,res) => {
  const parsed=z.object({ids:z.array(z.string().min(1)).min(1),action:z.enum(['PUBLISH','DRAFT','ARCHIVE','DELETE'])}).safeParse(req.body);
  if(!parsed.success)return res.status(400).json({error:'Provide ids and PUBLISH, DRAFT, ARCHIVE, or DELETE.'});
  if(parsed.data.action==='DELETE') await db.content.deleteMany({where:{id:{in:parsed.data.ids}}});
  else await db.content.updateMany({where:{id:{in:parsed.data.ids}},data:{status:parsed.data.action,publishedAt:parsed.data.action==='PUBLISHED'?new Date():null}});
  await db.activityLog.create({data:{action:`BULK_${parsed.data.action}`,entity:'CONTENT',label:`${parsed.data.ids.length} content item(s)`}});
  res.json({ok:true,count:parsed.data.ids.length,action:parsed.data.action});
});

router.get('/admin/export/content.xlsx', requireAuth, async (_req,res) => {
  const rows=await db.content.findMany({orderBy:[{sortOrder:'asc'},{updatedAt:'desc'}]});
  const data=rows.map(c=>({title:c.title,slug:c.slug,type:c.type,category:c.category,excerpt:c.excerpt,body:c.body,coverImage:c.coverImage,tags:c.tags.join(', '),author:c.author,seoTitle:c.seoTitle,seoDescription:c.seoDescription,status:c.status,featured:c.featured,sortOrder:c.sortOrder,publishedAt:c.publishedAt?.toISOString()||'',createdAt:c.createdAt.toISOString(),updatedAt:c.updatedAt.toISOString()}));
  const XLSX=await import('xlsx'); const wb=XLSX.utils.book_new();XLSX.utils.book_append_sheet(wb,XLSX.utils.json_to_sheet(data),'Content');const out=XLSX.write(wb,{type:'buffer',bookType:'xlsx'});res.setHeader('Content-Type','application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');res.setHeader('Content-Disposition','attachment; filename="mahmudul-content-export.xlsx"');res.send(out);
});

export default router;
