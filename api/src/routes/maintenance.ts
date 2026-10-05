import express, { Router } from 'express';
import { z } from 'zod';
import { db } from '../lib/db.js';
import { requireAuth } from '../lib/auth.js';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const router=Router(); router.use(requireAuth);
const here=path.dirname(fileURLToPath(import.meta.url));

async function snapshot(){
  const [projects,content,brands,settings,testimonials,activity,inquiries]=await Promise.all([
    db.project.findMany(),db.content.findMany(),db.brand.findMany(),db.siteSettings.findMany(),db.testimonial.findMany(),db.activityLog.findMany({orderBy:{createdAt:'desc'},take:500}),db.inquiry.findMany()
  ]);
  return {format:'mahmudul-portfolio-backup-v1',createdAt:new Date().toISOString(),database:{projects,content,brands,settings,testimonials,activity,inquiries},mediaManifest:[...projects.flatMap(p=>[p.coverImage,...(Array.isArray(p.gallery)?(p.gallery as any[]).map(x=>x?.url):[])]),...content.flatMap(c=>[c.coverImage,...(Array.isArray(c.gallery)?(c.gallery as any[]).map(x=>x?.url):[])]),...brands.map(b=>b.logoAsset),...testimonials.map(t=>t.photo)].filter(Boolean)};
}

router.get('/status',async(_req,res)=>{
  const [projects,content,brands,testimonials,inquiries]=await Promise.all([db.project.count(),db.content.count(),db.brand.count(),db.testimonial.count(),db.inquiry.count()]);
  let dbOk=true; try{await db.$queryRaw`SELECT 1`;}catch{dbOk=false;}
  const uploadRoot=path.resolve(here,'../../../portfolio/uploads'); let mediaCount=0; try{const files=await fs.readdir(uploadRoot,{recursive:true});mediaCount=files.filter(x=>typeof x==='string'&&!x.endsWith('/')).length}catch{}
  res.json({ok:true,database:dbOk,storage:process.env.S3_BUCKET||process.env.GITHUB_TOKEN?'configured':'local',counts:{projects,content,brands,testimonials,inquiries,media:mediaCount},time:new Date().toISOString()});
});

router.get('/backup',async(_req,res)=>{const data=await snapshot();await db.activityLog.create({data:{action:'BACKUP_DOWNLOAD',entity:'SYSTEM',label:'Full CMS backup downloaded'}});res.setHeader('Content-Type','application/json');res.setHeader('Content-Disposition',`attachment; filename="mahmudul-site-backup-${new Date().toISOString().slice(0,10)}.json"`);res.send(JSON.stringify(data,null,2));});

router.post('/restore',async(req,res)=>{
  const body=req.body;
  if(!body || body.format!=='mahmudul-portfolio-backup-v1' || !body.database) return res.status(400).json({error:'Invalid backup file.'});
  const dbs=body.database;
  if(!Array.isArray(dbs.projects)||!Array.isArray(dbs.content)||!Array.isArray(dbs.brands)) return res.status(400).json({error:'Backup is missing required collections.'});
  const mode=z.object({mode:z.enum(['MERGE','REPLACE']).default('MERGE')}).safeParse(req.query); const restoreMode=mode.success?mode.data.mode:'MERGE';
  try{
    if(restoreMode==='REPLACE'){
      await db.$transaction(async tx=>{await tx.activityLog.deleteMany();await tx.inquiry.deleteMany();await tx.testimonial.deleteMany();await tx.content.deleteMany();await tx.project.deleteMany();await tx.brand.deleteMany();await tx.siteSettings.deleteMany();});
    }
    for(const x of dbs.projects){const {id,createdAt,updatedAt,...data}=x;await db.project.upsert({where:{slug:data.slug},create:{...data,id,createdAt:new Date(createdAt),updatedAt:new Date(updatedAt)},update:data});}
    for(const x of dbs.content){const {id,createdAt,updatedAt,...data}=x;await db.content.upsert({where:{slug:data.slug},create:{...data,id,createdAt:new Date(createdAt),updatedAt:new Date(updatedAt)},update:data});}
    for(const x of dbs.brands){const {id,createdAt,updatedAt,...data}=x;await db.brand.upsert({where:{name:data.name},create:{...data,id,createdAt:new Date(createdAt),updatedAt:new Date(updatedAt)},update:data});}
    for(const x of (dbs.settings||[])){const {id,updatedAt,...data}=x;await db.siteSettings.upsert({where:{id},create:{...data,id,updatedAt:new Date(updatedAt)},update:data});}
    for(const x of (dbs.testimonials||[])){const {id,createdAt,updatedAt,...data}=x;await db.testimonial.upsert({where:{id},create:{...data,id,createdAt:new Date(createdAt),updatedAt:new Date(updatedAt)},update:data});}
    for(const x of (dbs.inquiries||[])){const {id,createdAt,updatedAt,...data}=x;await db.inquiry.upsert({where:{id},create:{...data,id,createdAt:new Date(createdAt),updatedAt:new Date(updatedAt)},update:data});}
    await db.activityLog.create({data:{action:'BACKUP_RESTORE',entity:'SYSTEM',label:`Restore completed (${restoreMode})`}});
    res.json({ok:true,mode:restoreMode});
  }catch(e){res.status(400).json({error:e instanceof Error?e.message:'Restore failed'});}
});

router.get('/settings',async(_req,res)=>{let settings=await db.siteSettings.findFirst();if(!settings)settings=await db.siteSettings.create({data:{}});res.json({settings});});
router.patch('/settings',async(req,res)=>{const allowed=z.object({siteName:z.string().optional(),title:z.string().optional(),heroLeadText:z.string().max(120).optional(),heroTypewriterPhrases:z.array(z.string().min(1).max(160)).min(1).max(12).optional(),email:z.string().nullable().optional(),inquiryRecipientEmail:z.string().email().nullable().optional(),inquirySubject:z.string().max(180).nullable().optional(),sliderConfig:z.record(z.any()).optional(),skillsConfig:z.array(z.object({id:z.string().optional(),name:z.string().min(1).max(80),category:z.string().min(1).max(60),icon:z.string().max(500).nullable().optional(),level:z.string().max(40).nullable().optional(),description:z.string().max(240).nullable().optional(),sortOrder:z.number().int().default(0),visible:z.boolean().default(true),featured:z.boolean().default(true)})).optional(),phone:z.string().nullable().optional(),location:z.string().nullable().optional(),availability:z.boolean().optional(),availabilityLabel:z.string().nullable().optional(),linkedin:z.string().nullable().optional(),behance:z.string().nullable().optional(),dribbble:z.string().nullable().optional(),instagram:z.string().nullable().optional(),github:z.string().nullable().optional(),metaTitle:z.string().nullable().optional(),metaDescription:z.string().nullable().optional(),ogImage:z.string().nullable().optional(),homepageOrder:z.string().nullable().optional()}).safeParse(req.body);if(!allowed.success)return res.status(400).json({error:allowed.error.flatten()});let settings=await db.siteSettings.findFirst();settings=settings?await db.siteSettings.update({where:{id:settings.id},data:allowed.data}):await db.siteSettings.create({data:allowed.data});await db.activityLog.create({data:{action:'UPDATE',entity:'SETTINGS',label:'Site settings updated'}});res.json({settings});});

router.get('/testimonials',async(_req,res)=>res.json({testimonials:await db.testimonial.findMany({orderBy:[{sortOrder:'asc'},{createdAt:'desc'}]})}));
router.post('/testimonials',async(req,res)=>{const p=z.object({client:z.string().min(1),company:z.string().nullable().optional(),role:z.string().nullable().optional(),quote:z.string().min(1),photo:z.string().nullable().optional(),projectId:z.string().nullable().optional(),featured:z.boolean().default(false),published:z.boolean().default(true),sortOrder:z.number().int().default(0)}).safeParse(req.body);if(!p.success)return res.status(400).json({error:p.error.flatten()});const x=await db.testimonial.create({data:p.data});res.status(201).json({testimonial:x});});
router.patch('/testimonials/:id',async(req,res)=>{const p=z.object({client:z.string().min(1).optional(),company:z.string().nullable().optional(),role:z.string().nullable().optional(),quote:z.string().min(1).optional(),photo:z.string().nullable().optional(),projectId:z.string().nullable().optional(),featured:z.boolean().optional(),published:z.boolean().optional(),sortOrder:z.number().int().optional()}).safeParse(req.body);if(!p.success)return res.status(400).json({error:p.error.flatten()});res.json({testimonial:await db.testimonial.update({where:{id:req.params.id},data:p.data})});});
router.delete('/testimonials/:id',async(req,res)=>{await db.testimonial.delete({where:{id:req.params.id}});res.status(204).end()});
router.get('/activity',async(_req,res)=>res.json({activity:await db.activityLog.findMany({orderBy:{createdAt:'desc'},take:100})}));
router.get('/inquiries',async(_req,res)=>res.json({inquiries:await db.inquiry.findMany({orderBy:{createdAt:'desc'},take:100})}));
router.patch('/inquiries/:id',async(req,res)=>{const p=z.object({status:z.string().min(1).max(40)}).safeParse(req.body);if(!p.success)return res.status(400).json({error:'Invalid status'});res.json({inquiry:await db.inquiry.update({where:{id:req.params.id},data:p.data})});});

export default router;
