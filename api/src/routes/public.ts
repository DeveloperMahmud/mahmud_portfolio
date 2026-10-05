import { Router } from 'express';
import { db } from '../lib/db.js';
import { hashShareToken } from '../lib/tokens.js';
import { z } from 'zod';

const router = Router();
router.post('/inquiries', async (req,res)=>{
  const p=z.object({name:z.string().min(2).max(120),email:z.string().email().max(200),service:z.string().max(120).optional().nullable(),budget:z.string().max(120).optional().nullable(),timeline:z.string().max(120).optional().nullable(),message:z.string().min(10).max(5000),attachment:z.string().max(500).optional().nullable()}).safeParse(req.body);
  if(!p.success)return res.status(400).json({error:'Please provide valid inquiry details.'});
  const inquiry=await db.inquiry.create({data:p.data});
  let emailSent=false;
  let emailError='';
  try{
    const settings=await db.siteSettings.findFirst();
    const recipient=settings?.inquiryRecipientEmail||settings?.email;
    const apiKey=process.env.RESEND_API_KEY;
    const fromEmail=process.env.RESEND_FROM_EMAIL;
    const fromName=process.env.RESEND_FROM_NAME||settings?.siteName||'Portfolio Website';
    if(apiKey&&fromEmail&&recipient){
      const subject=(settings?.inquirySubject||'New project inquiry — {name}').replaceAll('{name}',p.data.name).replaceAll('{service}',p.data.service||'General');
      const text=[`New project inquiry from ${p.data.name}`,`Email: ${p.data.email}`,`Service: ${p.data.service||'—'}`,`Budget: ${p.data.budget||'—'}`,`Timeline: ${p.data.timeline||'—'}`,'',p.data.message].join('\\n');
      const r=await fetch('https://api.resend.com/emails',{method:'POST',headers:{'Authorization':`Bearer ${apiKey}`,'Content-Type':'application/json'},body:JSON.stringify({from:`${fromName} <${fromEmail}>`,to:[recipient],reply_to:p.data.email,subject,text})});
      if(!r.ok) emailError=await r.text(); else emailSent=true;
    } else {
      emailError='Email delivery is not configured yet. Set RESEND_API_KEY and RESEND_FROM_EMAIL, then set the recipient in Admin → Maintenance.';
    }
  }catch(e){ emailError=e instanceof Error?e.message:'Email delivery failed'; }
  await db.activityLog.create({data:{action:'NEW_INQUIRY',entity:'INQUIRY',entityId:inquiry.id,label:inquiry.name}});
  await db.activityLog.create({data:{action:emailSent?'INQUIRY_EMAIL_SENT':'INQUIRY_EMAIL_PENDING',entity:'INQUIRY',entityId:inquiry.id,label:emailSent?'Email delivered':'Inquiry saved; email not sent'}});
  res.status(201).json({ok:true,emailSent,emailError:emailSent?undefined:emailError});
});

router.get('/projects', async (_req, res) => {
  const projects = await db.project.findMany({ where: { status: 'PUBLISHED', visibility: 'PUBLIC', clientOnly: false, OR:[{scheduledAt:null},{scheduledAt:{lte:new Date()}}] }, orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }] });
  res.json({ projects });
});
router.get('/projects/:slug', async (req, res) => {
  const project = await db.project.findFirst({ where: { slug: req.params.slug, status: 'PUBLISHED', visibility: 'PUBLIC', clientOnly: false } });
  if (!project) return res.status(404).json({ error: 'Project not found' });
  res.json({ project });
});
router.get('/settings', async (_req,res)=>{ let settings=await db.siteSettings.findFirst(); if(!settings) settings=await db.siteSettings.create({data:{}}); const {inquiryRecipientEmail:_,inquirySubject:__,...publicSettings}=settings; res.json({settings:{...publicSettings,skillsConfig:Array.isArray(publicSettings.skillsConfig)?publicSettings.skillsConfig:[]}}); });
router.get('/testimonials', async (_req,res)=>{ const testimonials=await db.testimonial.findMany({where:{published:true},orderBy:[{featured:'desc'},{sortOrder:'asc'}]}); res.json({testimonials}); });
router.get('/brands', async (_req, res) => {
  const brands = await db.brand.findMany({ where: { active: true }, orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }] });
  res.json({ brands });
});
router.get('/share/:token', async (req, res) => {
  const tokenHash = hashShareToken(req.params.token);
  const project = await db.project.findFirst({ where: { accessTokenHash: tokenHash, status: 'PUBLISHED', visibility: { in: ['UNLISTED', 'PRIVATE'] } } });
  if (!project || (project.clientExpiresAt && project.clientExpiresAt < new Date())) return res.status(404).json({ error: 'Share link is invalid or expired' });
  res.json({ project });
});
export default router;
