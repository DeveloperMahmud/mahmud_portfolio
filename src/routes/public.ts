import { Router } from 'express';
import { db } from '../lib/db.js';
import { hashShareToken } from '../lib/tokens.js';
import { z } from 'zod';
import { sendInquiryNotification } from '../lib/email.js';
import { captureIncident } from '../lib/monitoring.js';
import path from 'node:path';

const router = Router();
router.post('/inquiries', async (req,res)=>{
  const p=z.object({name:z.string().min(2).max(120),email:z.string().email().max(200),company:z.string().max(160).optional().nullable(),projectType:z.string().max(120).optional().nullable(),service:z.string().max(120).optional().nullable(),budget:z.string().max(120).optional().nullable(),timeline:z.string().max(120).optional().nullable(),message:z.string().min(10).max(5000),attachment:z.string().max(500).optional().nullable(),website:z.string().max(0).optional(),turnstileToken:z.string().max(4000).optional()}).safeParse(req.body);
  if(!p.success)return res.status(400).json({error:'Please provide valid inquiry details.'});
  if(p.data.website)return res.status(201).json({ok:true});
  if((p.data.message.match(/https?:\/\//gi)||[]).length>3)return res.status(400).json({error:'Please remove excessive links and try again.'});
  if(process.env.TURNSTILE_SECRET_KEY){const verify=await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify',{method:'POST',headers:{'content-type':'application/x-www-form-urlencoded'},body:new URLSearchParams({secret:process.env.TURNSTILE_SECRET_KEY,response:p.data.turnstileToken||'',remoteip:req.ip||''})});const result=await verify.json() as {success?:boolean};if(!result.success)return res.status(400).json({error:'Verification failed. Please refresh and try again.'});}
  const {website:_,turnstileToken:__,...inquiryData}=p.data;
  const inquiry=await db.inquiry.create({data:inquiryData});
  const delivery=await sendInquiryNotification(inquiry);
  const emailSent=delivery.sent;
  const emailError=delivery.sent?'':delivery.error||'Notification failed; inquiry remains stored.';
  await db.activityLog.create({data:{action:'NEW_INQUIRY',entity:'INQUIRY',entityId:inquiry.id,label:inquiry.name}});
  await db.activityLog.create({data:{action:emailSent?'INQUIRY_EMAIL_SENT':'INQUIRY_EMAIL_PENDING',entity:'INQUIRY',entityId:inquiry.id,label:emailSent?'Email delivered':'Inquiry saved; email not sent'}});
  res.status(201).json({ok:true,stored:true,emailSent,emailStatus:delivery.status,emailError:emailSent?undefined:emailError});
});

router.post('/errors',async(req,res)=>{const parsed=z.object({message:z.string().min(1).max(1000),source:z.enum(['PUBLIC_JS','ADMIN_JS']).default('PUBLIC_JS'),path:z.string().max(500).optional(),release:z.string().max(100).optional()}).safeParse(req.body);if(!parsed.success)return res.status(400).json({error:'Invalid error report.'});await captureIncident(new Error(parsed.data.message),parsed.data.source,{path:parsed.data.path,release:parsed.data.release});res.status(202).json({ok:true});});

router.get('/preview/:token',async(req,res)=>{const row=await db.previewToken.findUnique({where:{tokenHash:hashShareToken(req.params.token)}});if(!row||row.revokedAt||row.expiresAt<=new Date())return res.status(404).json({error:'Preview link is invalid or expired.'});const resource=row.resourceType==='PROJECT'?await db.project.findUnique({where:{id:row.resourceId},include:{resultMetrics:{orderBy:{sortOrder:'asc'}}}}):await db.content.findUnique({where:{id:row.resourceId}});if(!resource)return res.status(404).json({error:'Preview content no longer exists.'});res.set({'X-Robots-Tag':'noindex,nofollow,noarchive','Cache-Control':'private, no-store'}).json({resourceType:row.resourceType,resource,preview:{expiresAt:row.expiresAt}});});

router.get('/projects', async (_req, res) => {
  const projects = await db.project.findMany({ where: { deletedAt:null,status: 'PUBLISHED', visibility: 'PUBLIC', clientOnly: false, OR:[{scheduledAt:null},{scheduledAt:{lte:new Date()}}] }, orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }] });
  res.set('Cache-Control','public, max-age=60, s-maxage=300, stale-while-revalidate=600');
  res.json({ projects, demoEnabled: process.env.ENABLE_DEMO_CONTENT === 'true' });
});
router.get('/projects/:slug', async (req, res) => {
  const project = await db.project.findFirst({ where: { deletedAt:null,slug: req.params.slug, status: 'PUBLISHED', visibility: 'PUBLIC', clientOnly: false },include:{resultMetrics:{where:{verified:true,visible:true},orderBy:{sortOrder:'asc'},take:6,select:{id:true,label:true,value:true,prefix:true,suffix:true,beforeValue:true,afterValue:true,publicNote:true,sortOrder:true}}} });
  if (!project) return res.status(404).json({ error: 'Project not found' });
  const ordered=await db.project.findMany({where:{deletedAt:null,status:'PUBLISHED',visibility:'PUBLIC',clientOnly:false},orderBy:[{sortOrder:'asc'},{createdAt:'desc'}],select:{id:true,slug:true,title:true,coverImage:true}});
  const index=ordered.findIndex(item=>item.id===project.id);const manual=project.nextProjectId?ordered.find(item=>item.id===project.nextProjectId):null;const nextProject=manual||(ordered.length>1?ordered[(index+1)%ordered.length]:null);
  res.set('Cache-Control','public, max-age=60, s-maxage=300, stale-while-revalidate=600');
  res.json({ project,nextProject });
});
router.get('/settings', async (_req,res)=>{ let settings=await db.siteSettings.findFirst(); if(!settings) settings=await db.siteSettings.create({data:{}}); const {inquiryRecipientEmail:_,inquirySubject:__,...publicSettings}=settings; res.json({settings:{...publicSettings,skillsConfig:Array.isArray(publicSettings.skillsConfig)?publicSettings.skillsConfig:[]}}); });
router.get('/cv',async(_req,res)=>{const settings=await db.siteSettings.findFirst();const about=(settings?.aboutConfig&&typeof settings.aboutConfig==='object'&&!Array.isArray(settings.aboutConfig)?settings.aboutConfig:{}) as Record<string,unknown>;const url=String(about.cvUrl||'').trim(),filename=String(about.cvFilename||'Mahmudul-Hassan-CV.pdf').replace(/[^a-zA-Z0-9._-]/g,'-');if(!url)return res.status(404).json({error:'CV is not available.'});try{res.setHeader('Content-Disposition',`attachment; filename="${filename.endsWith('.pdf')?filename:`${filename}.pdf`}"`);res.setHeader('Content-Type','application/pdf');if(url.startsWith('/')){const frontend=path.resolve(process.cwd(),'portfolio'),target=path.resolve(frontend,url.replace(/^\/+/,''));if(!target.startsWith(frontend))return res.status(400).json({error:'Invalid CV path.'});return res.sendFile(target)}const parsed=new URL(url);if(!['http:','https:'].includes(parsed.protocol))return res.status(400).json({error:'Invalid CV URL.'});const upstream=await fetch(parsed,{signal:AbortSignal.timeout(10000)});if(!upstream.ok)return res.status(502).json({error:'CV storage could not be reached.'});const declared=Number(upstream.headers.get('content-length')||0);if(declared>8_000_000)return res.status(413).json({error:'CV file is too large.'});const body=Buffer.from(await upstream.arrayBuffer());if(body.length>8_000_000||body.subarray(0,5).toString('ascii')!=='%PDF-')return res.status(502).json({error:'Stored CV is not a valid PDF.'});return res.send(body)}catch{return res.status(502).json({error:'CV download is temporarily unavailable.'})}});
router.get('/testimonials', async (_req,res)=>{ const testimonials=await db.testimonial.findMany({where:{published:true,deletedAt:null},orderBy:[{featured:'desc'},{sortOrder:'asc'}]}); res.json({testimonials}); });
router.get('/brands', async (_req, res) => {
  const brands = await db.brand.findMany({ where: { active: true,deletedAt:null }, orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }] });
  res.json({ brands });
});
router.get('/homepage',async(_req,res)=>{const sections=await db.homepageSection.findMany({where:{enabled:true},orderBy:[{sortOrder:'asc'},{label:'asc'}]});res.set('Cache-Control','public, max-age=60, s-maxage=300, stale-while-revalidate=600');res.json({sections});});

router.post('/share/:token/review', async (req, res) => {
  const tokenHash = hashShareToken(req.params.token);
  const project = await db.project.findFirst({ where: { deletedAt:null,accessTokenHash: tokenHash, status: 'PUBLISHED', visibility: { in: ['UNLISTED', 'PRIVATE'] } } });
  if (!project || (project.clientExpiresAt && project.clientExpiresAt < new Date())) return res.status(404).json({ error: 'Share link is invalid or expired' });
  const parsed = z.object({ clientName: z.string().min(1).max(120), clientEmail: z.string().email().optional().nullable(), decision: z.enum(['APPROVED','CHANGES_REQUESTED']), comment: z.string().max(3000).optional().nullable() }).safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const review = await db.projectReview.create({ data: { projectId: project.id, ...parsed.data } });
  await db.activityLog.create({ data: { action: parsed.data.decision === 'APPROVED' ? 'CLIENT_APPROVED' : 'CLIENT_REQUESTED_CHANGES', entity: 'PROJECT_REVIEW', entityId: review.id, label: `${project.title} · ${parsed.data.clientName}` } });
  res.status(201).json({ ok: true, review });
});

router.get('/share/:token', async (req, res) => {
  const tokenHash = hashShareToken(req.params.token);
  const project = await db.project.findFirst({ where: { deletedAt:null,accessTokenHash: tokenHash, status: 'PUBLISHED', visibility: { in: ['UNLISTED', 'PRIVATE'] } } });
  if (!project || (project.clientExpiresAt && project.clientExpiresAt < new Date())) return res.status(404).json({ error: 'Share link is invalid or expired' });
  res.json({ project });
});
export default router;
