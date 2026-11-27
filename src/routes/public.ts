import { Router } from 'express';
import { db } from '../lib/db.js';
import { hashShareToken } from '../lib/tokens.js';
import { z } from 'zod';
import { Prisma } from '@prisma/client';
import { sendInquiryNotification } from '../lib/email.js';
import { captureIncident } from '../lib/monitoring.js';
import path from 'node:path';
import { featureEnabled } from '../lib/feature-flags.js';
import { filterPublicCreativeTools, publishedCreativeTool, type PublicCreativeTool } from '../lib/creative-tools.js';
import { parseRecruiterConfig } from '../lib/recruiter.js';
import { parseStudioConfig, projectMatchesStudioService, studioServiceRoute } from '../lib/studio.js';
import { publicProjectDto } from '../lib/public-project.js';
import { parsePresentationConfig } from '../lib/presentation.js';

const router = Router();
const creativeLabQuery=z.object({q:z.string().max(120).optional(),kind:z.enum(['FLAGSHIP','MINI']).optional(),status:z.enum(['PLANNED','PREVIEW','BETA','LIVE']).optional(),category:z.string().max(120).optional()});
const creativeToolPublicationSelect={publishedSnapshot:true,visibility:true,visible:true,scheduledAt:true} as const;
function eligibleCreativeTools(rows:Array<{publishedSnapshot:unknown;visibility:'PUBLIC'|'UNLISTED'|'PRIVATE';visible:boolean;scheduledAt:Date|null}>,now:Date,allowed:Array<'PUBLIC'|'UNLISTED'>){
  return rows.flatMap(row=>{const published=publishedCreativeTool(row.publishedSnapshot,row,now);return published?.eligible&&allowed.includes(published.visibility as 'PUBLIC'|'UNLISTED')?[published.tool]:[]});
}
function creativeToolOrder(a:PublicCreativeTool,b:PublicCreativeTool){return Number(Boolean(b.featured))-Number(Boolean(a.featured))+(Number(a.sortOrder||0)-Number(b.sortOrder||0))||a.title.localeCompare(b.title)}

router.get('/creative-lab',async(req,res)=>{
  const parsed=creativeLabQuery.safeParse(req.query);if(!parsed.success)return res.status(400).json({error:'Invalid Creative Lab filters.'});
  const now=new Date(),rows=await db.creativeTool.findMany({where:{deletedAt:null,status:'PUBLISHED',publishedSlug:{not:null},publishedSnapshot:{not:Prisma.JsonNull}},select:creativeToolPublicationSelect});
  const eligible=eligibleCreativeTools(rows,now,['PUBLIC']).sort(creativeToolOrder);
  const tools=filterPublicCreativeTools(eligible,parsed.data),categories=[...new Set(eligible.map(item=>item.category))].sort((a,b)=>a.localeCompare(b));
  res.set('Cache-Control','public, max-age=60, s-maxage=300, stale-while-revalidate=600');
  res.json({tools,counts:{total:eligible.length,flagship:eligible.filter(item=>item.kind==='FLAGSHIP').length,mini:eligible.filter(item=>item.kind==='MINI').length},categories});
});

router.get('/creative-lab/:slug',async(req,res)=>{
  const slug=z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).safeParse(req.params.slug);if(!slug.success)return res.status(404).json({error:'Creative tool not found.'});
  const now=new Date(),row=await db.creativeTool.findFirst({where:{deletedAt:null,status:'PUBLISHED',publishedSlug:slug.data,publishedSnapshot:{not:Prisma.JsonNull}},select:creativeToolPublicationSelect});
  const published=row?publishedCreativeTool(row.publishedSnapshot,row,now):null,tool=published?.tool;if(!published?.eligible||!['PUBLIC','UNLISTED'].includes(published.visibility)||!tool)return res.status(404).json({error:'Creative tool not found.'});
  res.set('Cache-Control','public, max-age=60, s-maxage=300, stale-while-revalidate=600');
  if(published.visibility==='UNLISTED'||tool.seo.noIndex)res.set('X-Robots-Tag','noindex,follow');
  res.json({tool});
});
router.get('/recruiter',async(_req,res)=>{
  const now=new Date(),settings=await db.siteSettings.findFirst(),config=parseRecruiterConfig(settings?.aboutConfig);
  const projectWhere={deletedAt:null,status:'PUBLISHED' as const,visibility:'PUBLIC' as const,clientOnly:false,OR:[{scheduledAt:null},{scheduledAt:{lte:now}}]};
  const projects=await db.project.findMany({where:{...projectWhere,...(config.featuredProjectSlugs.length?{slug:{in:config.featuredProjectSlugs}}:{featured:true})},orderBy:[{sortOrder:'asc'},{createdAt:'desc'}],take:6,select:{id:true,title:true,slug:true,category:true,service:true,client:true,year:true,role:true,description:true,challenge:true,approach:true,process:true,results:true,deliverables:true,tools:true,coverImage:true,homepageImage:true,projectSubtitle:true}});
  if(config.featuredProjectSlugs.length)projects.sort((a,b)=>config.featuredProjectSlugs.indexOf(a.slug)-config.featuredProjectSlugs.indexOf(b.slug));
  const toolIds=[...new Set(config.evidencePillars.flatMap(item=>item.toolIds))];
  const toolRows=toolIds.length?await db.creativeTool.findMany({where:{canonicalId:{in:toolIds},deletedAt:null,status:'PUBLISHED',publishedSnapshot:{not:Prisma.JsonNull}},select:creativeToolPublicationSelect}):[];
  const tools=eligibleCreativeTools(toolRows,now,['PUBLIC','UNLISTED']);
  const projectBySlug=new Map(projects.map(item=>[item.slug,item])),toolById=new Map(tools.map(item=>[item.canonicalId,item]));
  const pillars=config.evidencePillars.filter(item=>item.isPublished).sort((a,b)=>a.sortOrder-b.sortOrder).map(item=>({...item,projects:item.evidenceProjectSlugs.map(slug=>projectBySlug.get(slug)).filter(Boolean),tools:item.toolIds.map(id=>toolById.get(id)).filter(Boolean)})).filter(item=>item.projects.length||item.tools.length);
  const derivedSkills=[...new Set(projects.flatMap(item=>item.tools).filter(Boolean))].slice(0,24);
  const about=settings?.aboutConfig&&typeof settings.aboutConfig==='object'&&!Array.isArray(settings.aboutConfig)?settings.aboutConfig as Record<string,unknown>:{};
  res.set('Cache-Control','public, max-age=60, s-maxage=300, stale-while-revalidate=600');
  res.json({profile:{roleTitle:config.roleTitle,headline:config.headline,introduction:config.introduction,availability:settings?.availability?String(config.availabilityStatement||settings.availabilityLabel||'Available for the right opportunity.'):'',skills:config.skills.length?config.skills:derivedSkills,experience:config.experience.filter(item=>item.verified),primaryAction:config.primaryAction,contactAction:config.contactAction,cvAvailable:Boolean(about.cvUrl)},projects,pillars});
});
router.get('/studio',async(_req,res)=>{
  const now=new Date(),settings=await db.siteSettings.findFirst(),config=parseStudioConfig(settings?.aboutConfig);
  const projectWhere={deletedAt:null,status:'PUBLISHED' as const,visibility:'PUBLIC' as const,clientOnly:false,OR:[{scheduledAt:null},{scheduledAt:{lte:now}}]};
  const [projects,testimonials]=await Promise.all([
    db.project.findMany({where:{...projectWhere,...(config.featuredProjectSlugs.length?{slug:{in:config.featuredProjectSlugs}}:{featured:true})},orderBy:[{sortOrder:'asc'},{createdAt:'desc'}],take:6,select:{id:true,title:true,slug:true,category:true,service:true,client:true,year:true,role:true,description:true,results:true,deliverables:true,coverImage:true,homepageImage:true,projectSubtitle:true}}),
    db.testimonial.findMany({where:{published:true,deletedAt:null,...(config.selectedTestimonialIds.length?{id:{in:config.selectedTestimonialIds}}:{})},orderBy:[{featured:'desc'},{sortOrder:'asc'}],take:6,select:{id:true,client:true,company:true,role:true,quote:true,photo:true,projectId:true}})
  ]);
  if(config.featuredProjectSlugs.length)projects.sort((a,b)=>config.featuredProjectSlugs.indexOf(a.slug)-config.featuredProjectSlugs.indexOf(b.slug));
  if(config.selectedTestimonialIds.length)testimonials.sort((a,b)=>config.selectedTestimonialIds.indexOf(a.id)-config.selectedTestimonialIds.indexOf(b.id));
  const byOrder=<T extends {sortOrder:number}>(a:T,b:T)=>a.sortOrder-b.sortOrder;
  res.set('Cache-Control','public, max-age=60, s-maxage=300, stale-while-revalidate=600');
  res.json({profile:{eyebrow:config.eyebrow,headline:config.headline,introduction:config.introduction,scopeNoteTitle:config.scopeNoteTitle,scopeNote:config.scopeNote,primaryAction:config.primaryAction,secondaryAction:config.secondaryAction,bookingAction:config.bookingAction},services:config.services.filter(item=>item.isPublished).sort(byOrder),processSteps:config.processSteps.filter(item=>item.isPublished).sort(byOrder),faqs:config.faqs.filter(item=>item.isPublished).sort(byOrder),projects,testimonials});
});
router.get('/services/:slug',async(req,res)=>{
  const route=studioServiceRoute(String(req.params.slug||''));
  if(!route)return res.status(404).json({error:'Service not found.'});
  const now=new Date(),settings=await db.siteSettings.findFirst(),config=parseStudioConfig(settings?.aboutConfig);
  const service=config.services.find(item=>item.serviceId===route.serviceId);
  if(!service?.isPublished)return res.status(404).json({error:'Service not found.'});
  const candidates=await db.project.findMany({where:{deletedAt:null,status:'PUBLISHED',visibility:'PUBLIC',clientOnly:false,OR:[{scheduledAt:null},{scheduledAt:{lte:now}}]},orderBy:[{featured:'desc'},{sortOrder:'asc'},{createdAt:'desc'}],take:30,select:{id:true,title:true,slug:true,category:true,service:true,type:true,client:true,year:true,role:true,description:true,challenge:true,approach:true,process:true,results:true,deliverables:true,tools:true,coverImage:true,homepageImage:true,projectSubtitle:true}});
  const projects=candidates.filter(project=>projectMatchesStudioService(project,route)).slice(0,6).map(project=>publicProjectDto(project as unknown as Record<string,unknown>));
  const byOrder=<T extends {sortOrder:number}>(a:T,b:T)=>a.sortOrder-b.sortOrder;
  res.set('Cache-Control','public, max-age=60, s-maxage=300, stale-while-revalidate=600');
  res.json({service,route:{slug:route.slug,seoTitle:route.seoTitle},processSteps:config.processSteps.filter(item=>item.isPublished).sort(byOrder),projects,actions:{primary:config.primaryAction,secondary:config.secondaryAction}});
});
router.get('/presentation/:mode',async(req,res)=>{
  const mode=z.enum(['recruiter','client']).safeParse(req.params.mode);if(!mode.success)return res.status(404).json({error:'Presentation not found.'});
  const now=new Date(),settings=await db.siteSettings.findFirst(),presentation=parsePresentationConfig(settings?.aboutConfig),config=presentation[mode.data];
  if(!config.enabled)return res.status(404).json({error:'Presentation is not published.'});
  const projects=config.projectSlugs.length?await db.project.findMany({where:{deletedAt:null,status:'PUBLISHED',visibility:'PUBLIC',clientOnly:false,slug:{in:config.projectSlugs},OR:[{scheduledAt:null},{scheduledAt:{lte:now}}]},select:{id:true,title:true,slug:true,category:true,service:true,type:true,client:true,year:true,role:true,description:true,challenge:true,approach:true,process:true,results:true,deliverables:true,tools:true,coverImage:true,homepageImage:true,projectSubtitle:true}}):[];
  projects.sort((a,b)=>config.projectSlugs.indexOf(a.slug)-config.projectSlugs.indexOf(b.slug));
  const toolRows=await db.creativeTool.findMany({where:{deletedAt:null,status:'PUBLISHED',publishedSnapshot:{not:Prisma.JsonNull}},select:creativeToolPublicationSelect});
  const tools=eligibleCreativeTools(toolRows,now,['PUBLIC','UNLISTED']).filter(item=>item.featured).sort(creativeToolOrder).slice(0,4);
  const about=settings?.aboutConfig&&typeof settings.aboutConfig==='object'&&!Array.isArray(settings.aboutConfig)?settings.aboutConfig as Record<string,unknown>:{};
  let profile:Record<string,unknown>,proof:unknown[]=[];
  if(mode.data==='recruiter'){
    const recruiter=parseRecruiterConfig(settings?.aboutConfig);
    profile={roleTitle:recruiter.roleTitle,headline:recruiter.headline,introduction:recruiter.introduction,availability:settings?.availability?String(recruiter.availabilityStatement||settings.availabilityLabel||''):'' ,skills:recruiter.skills,experience:recruiter.experience.filter(item=>item.verified),cvAvailable:Boolean(about.cvUrl)};
  }else{
    const studio=parseStudioConfig(settings?.aboutConfig),byOrder=<T extends {sortOrder:number}>(a:T,b:T)=>a.sortOrder-b.sortOrder;
    profile={eyebrow:studio.eyebrow,headline:studio.headline,introduction:studio.introduction,services:studio.services.filter(item=>item.isPublished).sort(byOrder),processSteps:studio.processSteps.filter(item=>item.isPublished).sort(byOrder)};
    proof=await db.testimonial.findMany({where:{published:true,deletedAt:null,...(studio.selectedTestimonialIds.length?{id:{in:studio.selectedTestimonialIds}}:{})},orderBy:[{featured:'desc'},{sortOrder:'asc'}],take:3,select:{id:true,client:true,company:true,role:true,quote:true,photo:true,projectId:true}});
  }
  res.set('Cache-Control','public, max-age=60, s-maxage=300, stale-while-revalidate=600');
  if(config.noIndex)res.set('X-Robots-Tag','noindex,follow');
  res.json({mode:mode.data,config,profile,projects:projects.map(project=>publicProjectDto(project as unknown as Record<string,unknown>)),tools,proof,readiness:{projectCount:projects.length,complete:projects.length>=2}});
});
router.post('/inquiries', async (req,res)=>{
  if(!await featureEnabled('contactForm'))return res.status(404).json({error:'Contact form is currently unavailable.'});
  const p=z.object({name:z.string().min(2).max(120),email:z.string().email().max(200),company:z.string().max(160).optional().nullable(),projectType:z.string().max(120).optional().nullable(),service:z.string().max(120).optional().nullable(),budget:z.string().max(120).optional().nullable(),timeline:z.string().max(120).optional().nullable(),message:z.string().min(10).max(5000),attachment:z.string().max(500).optional().nullable(),intent:z.enum(['GENERAL','CLIENT','RECRUITER']).default('GENERAL'),sourcePath:z.string().regex(/^\/[a-zA-Z0-9/_-]{0,299}$/).default('/'),website:z.string().max(0).optional(),turnstileToken:z.string().max(4000).optional()}).safeParse(req.body);
  if(!p.success)return res.status(400).json({error:'Please provide valid inquiry details.'});
  if(p.data.website)return res.status(201).json({ok:true});
  if((p.data.message.match(/https?:\/\//gi)||[]).length>3)return res.status(400).json({error:'Please remove excessive links and try again.'});
  if(process.env.TURNSTILE_SECRET_KEY){const verify=await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify',{method:'POST',headers:{'content-type':'application/x-www-form-urlencoded'},body:new URLSearchParams({secret:process.env.TURNSTILE_SECRET_KEY,response:p.data.turnstileToken||'',remoteip:req.ip||''})});const result=await verify.json() as {success?:boolean};if(!result.success)return res.status(400).json({error:'Verification failed. Please refresh and try again.'});}
  const {website:_,turnstileToken:__,intent,sourcePath,...inquiryData}=p.data;
  const routingTags=[`intent:${intent.toLowerCase()}`,`source:${sourcePath.toLowerCase()}`.slice(0,40)];
  const inquiry=await db.inquiry.create({data:{...inquiryData,tags:routingTags}});
  const delivery=await featureEnabled('emailNotifications')?await sendInquiryNotification(inquiry):{sent:false,status:'DISABLED',error:'Email notifications are disabled in Control Center.'};
  const emailSent=delivery.sent;
  const emailError=delivery.sent?'':delivery.error||'Notification failed; inquiry remains stored.';
  await db.activityLog.create({data:{action:'NEW_INQUIRY',entity:'INQUIRY',entityId:inquiry.id,label:`${intent} via ${sourcePath}`}});
  await db.activityLog.create({data:{action:emailSent?'INQUIRY_EMAIL_SENT':'INQUIRY_EMAIL_PENDING',entity:'INQUIRY',entityId:inquiry.id,label:emailSent?'Email delivered':'Inquiry saved; email not sent'}});
  res.status(201).json({ok:true,stored:true,emailSent,emailStatus:delivery.status,emailError:emailSent?undefined:emailError});
});

router.post('/errors',async(req,res)=>{const parsed=z.object({message:z.string().min(1).max(1000),source:z.enum(['PUBLIC_JS','ADMIN_JS']).default('PUBLIC_JS'),path:z.string().max(500).optional(),release:z.string().max(100).optional()}).safeParse(req.body);if(!parsed.success)return res.status(400).json({error:'Invalid error report.'});await captureIncident(new Error(parsed.data.message),parsed.data.source,{path:parsed.data.path,release:parsed.data.release});res.status(202).json({ok:true});});

router.get('/preview/:token',async(req,res)=>{const row=await db.previewToken.findUnique({where:{tokenHash:hashShareToken(req.params.token)}});if(!row||row.revokedAt||row.expiresAt<=new Date())return res.status(404).json({error:'Preview link is invalid or expired.'});const resource=row.resourceType==='PROJECT'?await db.project.findUnique({where:{id:row.resourceId},include:{resultMetrics:{orderBy:{sortOrder:'asc'}}}}):await db.content.findUnique({where:{id:row.resourceId}});if(!resource)return res.status(404).json({error:'Preview content no longer exists.'});res.set({'X-Robots-Tag':'noindex,nofollow,noarchive','Cache-Control':'private, no-store'}).json({resourceType:row.resourceType,resource,preview:{expiresAt:row.expiresAt}});});

router.get('/projects', async (_req, res) => {
  const projects = await db.project.findMany({ where: { deletedAt:null,status: 'PUBLISHED', visibility: 'PUBLIC', clientOnly: false, OR:[{scheduledAt:null},{scheduledAt:{lte:new Date()}}] }, orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }] });
  res.set('Cache-Control','public, max-age=60, s-maxage=300, stale-while-revalidate=600');
  res.json({ projects:projects.map(project=>publicProjectDto(project as unknown as Record<string,unknown>)), demoEnabled:await featureEnabled('demoContent') });
});
router.get('/projects/:slug', async (req, res) => {
  const now=new Date();
  const project = await db.project.findFirst({ where: { deletedAt:null,slug: req.params.slug, status: 'PUBLISHED', visibility: 'PUBLIC', clientOnly: false, OR:[{scheduledAt:null},{scheduledAt:{lte:now}}] },include:{resultMetrics:{where:{verified:true,visible:true},orderBy:{sortOrder:'asc'},take:6,select:{id:true,label:true,value:true,prefix:true,suffix:true,beforeValue:true,afterValue:true,publicNote:true,sortOrder:true}}} });
  if (!project) return res.status(404).json({ error: 'Project not found' });
  const ordered=await db.project.findMany({where:{deletedAt:null,status:'PUBLISHED',visibility:'PUBLIC',clientOnly:false,OR:[{scheduledAt:null},{scheduledAt:{lte:now}}]},orderBy:[{sortOrder:'asc'},{createdAt:'desc'}],select:{id:true,slug:true,title:true,coverImage:true}});
  const index=ordered.findIndex(item=>item.id===project.id);const manual=project.nextProjectId?ordered.find(item=>item.id===project.nextProjectId):null;const nextProject=manual||(ordered.length>1?ordered[(index+1)%ordered.length]:null);
  res.set('Cache-Control','public, max-age=60, s-maxage=300, stale-while-revalidate=600');
  res.json({ project:publicProjectDto(project as unknown as Record<string,unknown>),nextProject });
});
router.get('/settings', async (_req,res)=>{ let settings=await db.siteSettings.findFirst(); if(!settings) settings=await db.siteSettings.create({data:{}}); const {inquiryRecipientEmail:_,inquirySubject:__,securityConfig:___,...publicSettings}=settings; res.json({settings:{...publicSettings,skillsConfig:Array.isArray(publicSettings.skillsConfig)?publicSettings.skillsConfig:[]}}); });
router.get('/cv',async(_req,res)=>{if(!await featureEnabled('cvDownload'))return res.status(404).json({error:'CV download is disabled.'});const settings=await db.siteSettings.findFirst();const about=(settings?.aboutConfig&&typeof settings.aboutConfig==='object'&&!Array.isArray(settings.aboutConfig)?settings.aboutConfig:{}) as Record<string,unknown>;const url=String(about.cvUrl||'').trim(),filename=String(about.cvFilename||'Mahmudul-Hassan-CV.pdf').replace(/[^a-zA-Z0-9._-]/g,'-');if(!url)return res.status(404).json({error:'CV is not available.'});try{res.setHeader('Content-Disposition',`attachment; filename="${filename.endsWith('.pdf')?filename:`${filename}.pdf`}"`);res.setHeader('Content-Type','application/pdf');if(url.startsWith('/')){const frontend=path.resolve(process.cwd(),'portfolio'),target=path.resolve(frontend,url.replace(/^\/+/,''));if(!target.startsWith(frontend))return res.status(400).json({error:'Invalid CV path.'});return res.sendFile(target)}const parsed=new URL(url);if(!['http:','https:'].includes(parsed.protocol))return res.status(400).json({error:'Invalid CV URL.'});const upstream=await fetch(parsed,{signal:AbortSignal.timeout(10000)});if(!upstream.ok)return res.status(502).json({error:'CV storage could not be reached.'});const declared=Number(upstream.headers.get('content-length')||0);if(declared>8_000_000)return res.status(413).json({error:'CV file is too large.'});const body=Buffer.from(await upstream.arrayBuffer());if(body.length>8_000_000||body.subarray(0,5).toString('ascii')!=='%PDF-')return res.status(502).json({error:'Stored CV is not a valid PDF.'});return res.send(body)}catch{return res.status(502).json({error:'CV download is temporarily unavailable.'})}});
router.get('/testimonials', async (_req,res)=>{ if(!await featureEnabled('testimonials'))return res.json({testimonials:[]});const testimonials=await db.testimonial.findMany({where:{published:true,deletedAt:null},orderBy:[{featured:'desc'},{sortOrder:'asc'}]}); res.json({testimonials}); });
router.get('/brands', async (_req, res) => {
  const brands = await db.brand.findMany({ where: { active: true,deletedAt:null }, orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }] });
  res.json({ brands });
});
router.get('/homepage',async(_req,res)=>{const sections=await db.homepageSection.findMany({where:{enabled:true},orderBy:[{sortOrder:'asc'},{label:'asc'}]});res.set('Cache-Control','public, max-age=60, s-maxage=300, stale-while-revalidate=600');res.json({sections});});

router.post('/share/:token/review', async (req, res) => {
  res.set({'Cache-Control':'private, no-store','X-Robots-Tag':'noindex,nofollow,noarchive','Referrer-Policy':'no-referrer'});
  const tokenHash = hashShareToken(req.params.token);
  const project = await db.project.findFirst({ where: { deletedAt:null,accessTokenHash: tokenHash, status: 'PUBLISHED', visibility: { in: ['UNLISTED', 'PRIVATE'] } } });
  if (!project || (project.clientExpiresAt && project.clientExpiresAt < new Date())) return res.status(404).json({ error: 'Share link is invalid or expired' });
  const parsed = z.object({ clientName: z.string().min(1).max(120), clientEmail: z.string().email().optional().nullable(), decision: z.enum(['APPROVED','CHANGES_REQUESTED']), comment: z.string().max(3000).optional().nullable() }).safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const review = await db.projectReview.create({ data: { projectId: project.id, ...parsed.data } });
  await db.activityLog.create({ data: { action: parsed.data.decision === 'APPROVED' ? 'CLIENT_APPROVED' : 'CLIENT_REQUESTED_CHANGES', entity: 'PROJECT_REVIEW', entityId: review.id, label: `${project.title} · ${parsed.data.clientName}` } });
  res.status(201).json({ ok: true, review: { id:review.id,decision:review.decision,createdAt:review.createdAt } });
});

router.get('/share/:token', async (req, res) => {
  res.set({'Cache-Control':'private, no-store','X-Robots-Tag':'noindex,nofollow,noarchive','Referrer-Policy':'no-referrer'});
  const tokenHash = hashShareToken(req.params.token);
  const project = await db.project.findFirst({ where: { deletedAt:null,accessTokenHash: tokenHash, status: 'PUBLISHED', visibility: { in: ['UNLISTED', 'PRIVATE'] } } });
  if (!project || (project.clientExpiresAt && project.clientExpiresAt < new Date())) return res.status(404).json({ error: 'Share link is invalid or expired' });
  res.json({ project:publicProjectDto(project as unknown as Record<string,unknown>) });
});
export default router;
