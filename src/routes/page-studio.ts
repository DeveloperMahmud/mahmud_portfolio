import { Router } from 'express';
import { Prisma } from '@prisma/client';
import { z } from 'zod';
import { db } from '../lib/db.js';
import { requireAuth } from '../lib/auth.js';
import { createRevision } from '../lib/revisions.js';
import { DEFAULT_PAGE_STUDIO_CONFIG, DEFAULT_PAGE_TEMPLATES, cloneBlocks, normalizePagePath, pageStudioConfigSchema, pageStudioSystemEnabled, parsePageStudioConfig, resolveGlobalBlocks, slugify, studioBlockSchema, studioBlocksSchema, type StudioBlock } from '../lib/page-studio.js';

const router=Router();
router.use(requireAuth);
router.use((_req,res,next)=>pageStudioSystemEnabled()?next():res.status(503).json({error:'Page Studio is disabled at the system level. Set PAGE_STUDIO_ENABLED=true to enable the protected CMS module.'}));
const actor=(res:any)=>res.locals.user?.sub as string|undefined;
const jsonValue=(value:unknown)=>value as Prisma.InputJsonValue;

async function settings(){let row=await db.siteSettings.findFirst();if(!row)row=await db.siteSettings.create({data:{}});return row}
async function config(){return parsePageStudioConfig((await settings()).pageStudioConfig)}
async function seedTemplates(){await db.pageTemplate.createMany({data:DEFAULT_PAGE_TEMPLATES.map(template=>({...template,blocks:jsonValue(template.blocks)})),skipDuplicates:true})}

const nullableUrl=z.union([z.string().url(),z.literal(''),z.null()]).optional().transform(value=>value||null);
const basePageSchema=z.object({
  title:z.string().min(1).max(160),slug:z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),path:z.string().max(240).optional(),status:z.enum(['DRAFT','PUBLISHED','ARCHIVED']).default('DRAFT'),visibility:z.enum(['PUBLIC','UNLISTED','PRIVATE']).default('PUBLIC'),templateKey:z.string().max(80).nullable().optional(),blocks:studioBlocksSchema.default([]),navbarPresetId:z.string().nullable().optional(),seoTitle:z.string().max(180).nullable().optional(),seoDescription:z.string().max(500).nullable().optional(),ogImage:nullableUrl,canonicalUrl:nullableUrl,noIndex:z.boolean().default(false),noFollow:z.boolean().default(false),includeSitemap:z.boolean().default(true),scheduledAt:z.union([z.string().datetime(),z.null()]).optional(),termIds:z.array(z.string()).max(30).default([])
});

function allBlocks(blocks:StudioBlock[]){const result:StudioBlock[]=[];const walk=(items:StudioBlock[])=>items.forEach(item=>{result.push(item);walk(item.children||[])});walk(blocks);return result}
async function validateEmbeds(blocks:StudioBlock[]){
  const embeds=allBlocks(blocks).filter(block=>block.type==='EMBED'&&String(block.data.url||'').trim());
  if(!embeds.length)return;
  const sources=await db.trustedEmbedSource.findMany({where:{enabled:true,allowIframe:true},select:{origin:true}}),allowed=new Set(sources.map(x=>x.origin));
  const official=['https://www.youtube.com','https://youtube.com','https://player.vimeo.com','https://www.figma.com'];
  official.forEach(origin=>allowed.add(origin));
  for(const block of embeds){let url:URL;try{url=new URL(String(block.data.url))}catch{throw new Error('Embed widgets require a valid HTTPS URL.')}if(url.protocol!=='https:'||!allowed.has(url.origin))throw new Error(`Embed origin ${url.origin} is not in Trusted Embed Sources.`)}
}

async function normalizeInput(input:z.infer<typeof basePageSchema>,pageId?:string){
  const currentConfig=await config();
  const blocks=cloneBlocks(input.blocks);
  if(allBlocks(blocks).length>currentConfig.maxBlocks)throw new Error(`This page exceeds the configured ${currentConfig.maxBlocks}-widget limit.`);
  await validateEmbeds(blocks);
  const normalizedPath=normalizePagePath(input.path||'',input.slug,currentConfig.customPathsEnabled);
  const publishedConflict=await db.customPage.findFirst({where:{publishedPath:normalizedPath,...(pageId?{id:{not:pageId}}:{})},select:{id:true}});
  if(publishedConflict)throw new Error('That URL is already used by another published page.');
  return {...input,path:normalizedPath,blocks};
}

router.use(async(req,res,next)=>{if(req.path==='/bootstrap'||req.path==='/config')return next();try{return (await config()).cmsEnabled?next():res.status(423).json({error:'Page Studio editing is paused in CMS activation settings.'})}catch(error){next(error)}});

router.get('/bootstrap',async(_req,res)=>{
  await seedTemplates();const siteSettings=await settings(),studioConfig=parsePageStudioConfig(siteSettings.pageStudioConfig);
  const [pages,templates,reusableBlocks,taxonomy,navigationPresets,embedSources,mediaCount,mediaBytes,media,projects,content,brands]=await Promise.all([
    db.customPage.findMany({where:{deletedAt:null},orderBy:{updatedAt:'desc'},include:{taxonomy:{include:{term:true}}}}),db.pageTemplate.findMany({where:{active:true},orderBy:[{category:'asc'},{name:'asc'}]}),db.reusableBlock.findMany({where:{active:true},orderBy:[{category:'asc'},{name:'asc'}]}),db.taxonomyTerm.findMany({where:{active:true},orderBy:[{type:'asc'},{sortOrder:'asc'},{name:'asc'}]}),db.navigationPreset.findMany({where:{enabled:true},orderBy:[{isGlobal:'desc'},{name:'asc'}]}),db.trustedEmbedSource.findMany({orderBy:{name:'asc'}}),db.media.count({where:{deletedAt:null}}),db.media.aggregate({where:{deletedAt:null},_sum:{size:true}}),db.media.findMany({where:{deletedAt:null,status:'COMPLETE',mimeType:{startsWith:'image/'}},orderBy:{createdAt:'desc'},take:200,select:{id:true,url:true,filename:true,originalName:true,mimeType:true,size:true,width:true,height:true,alt:true,title:true}}),db.project.findMany({where:{deletedAt:null,status:'PUBLISHED',visibility:'PUBLIC',clientOnly:false},orderBy:[{featured:'desc'},{sortOrder:'asc'}],take:50,select:{id:true,title:true,slug:true,category:true,service:true,client:true,coverImage:true,homepageImage:true,projectSubtitle:true}}),db.content.findMany({where:{deletedAt:null,status:'PUBLISHED'},orderBy:[{featured:'desc'},{publishedAt:'desc'}],take:30,select:{id:true,title:true,slug:true,category:true,excerpt:true,coverImage:true,publishedAt:true}}),db.brand.findMany({where:{deletedAt:null,active:true},orderBy:{sortOrder:'asc'},take:50,select:{id:true,name:true,logoAsset:true,logoDark:true,url:true,industry:true}})
  ]);
  const dynamic={projects,content,brands,settings:{siteName:siteSettings.siteName,title:siteSettings.title,navigationConfig:siteSettings.navigationConfig,footerConfig:siteSettings.footerConfig,aboutConfig:siteSettings.aboutConfig,socialLinks:siteSettings.socialLinks}};
  const resolvedPages=pages.map(page=>({...page,blocks:resolveGlobalBlocks(studioBlocksSchema.parse(page.blocks),reusableBlocks)}));
  res.json({systemEnabled:true,config:studioConfig,pages:resolvedPages,templates,reusableBlocks,taxonomy,navigationPresets,embedSources,media,dynamic,usage:{mediaAssets:mediaCount,mediaBytes:mediaBytes._sum.size||0,configuredMediaQuota:Number(process.env.MEDIA_STORAGE_QUOTA_BYTES||1073741824)},limits:{blobWritesOnPageSave:0,mediaCopiedOnDuplicate:false}});
});

router.get('/pages/:id',async(req,res)=>{const [page,masters]=await Promise.all([db.customPage.findFirst({where:{id:req.params.id,deletedAt:null},include:{taxonomy:{include:{term:true}},navbarPreset:true}}),db.reusableBlock.findMany({where:{active:true}})]);if(!page)return res.status(404).json({error:'Page not found.'});res.json({page:{...page,blocks:resolveGlobalBlocks(studioBlocksSchema.parse(page.blocks),masters)}});});
router.post('/pages',async(req,res)=>{
  const parsed=basePageSchema.safeParse({...req.body,status:'DRAFT'});if(!parsed.success)return res.status(400).json({error:parsed.error.flatten()});
  try{const normalized=await normalizeInput(parsed.data);const {termIds,...data}=normalized;const page=await db.customPage.create({data:{...data,blocks:jsonValue(data.blocks),scheduledAt:data.scheduledAt?new Date(data.scheduledAt):null,taxonomy:{create:termIds.map(termId=>({term:{connect:{id:termId}}}))}}});await db.activityLog.create({data:{action:'CREATE',entity:'CUSTOM_PAGE',entityId:page.id,actorId:actor(res),label:page.title}});res.status(201).json({page});}catch(error){res.status(400).json({error:error instanceof Error?error.message:'Could not create page.'})}
});
router.patch('/pages/:id',async(req,res)=>{
  const existing=await db.customPage.findFirst({where:{id:req.params.id,deletedAt:null}});if(!existing)return res.status(404).json({error:'Page not found.'});
  const merged={...existing,...req.body,status:existing.status,blocks:req.body.blocks??existing.blocks,scheduledAt:req.body.scheduledAt===undefined?(existing.scheduledAt?.toISOString()||null):req.body.scheduledAt,termIds:Array.isArray(req.body.termIds)?req.body.termIds:undefined};const parsed=basePageSchema.safeParse(merged);if(!parsed.success)return res.status(400).json({error:parsed.error.flatten()});
  try{const normalized=await normalizeInput(parsed.data,existing.id);const {termIds,status:_ignoredStatus,...data}=normalized;const page=await db.$transaction(async tx=>{if(Array.isArray(req.body.termIds)){await tx.pageTaxonomyAssignment.deleteMany({where:{pageId:existing.id}});if(termIds.length)await tx.pageTaxonomyAssignment.createMany({data:termIds.map(termId=>({pageId:existing.id,termId})),skipDuplicates:true})}return tx.customPage.update({where:{id:existing.id},data:{...data,blocks:jsonValue(data.blocks),scheduledAt:data.scheduledAt?new Date(data.scheduledAt):null}})});res.json({page});}catch(error){res.status(400).json({error:error instanceof Error?error.message:'Could not save page.'})}
});
router.post('/pages/:id/publish',async(req,res)=>{
  const page=await db.customPage.findFirst({where:{id:req.params.id,deletedAt:null}});if(!page)return res.status(404).json({error:'Page not found.'});const blocks=studioBlocksSchema.parse(page.blocks);await validateEmbeds(blocks);if(!blocks.length)return res.status(400).json({error:'Add at least one widget before publishing.'});
  const studioConfig=await config();
  await createRevision('CUSTOM_PAGE',page.id,page,{actorId:actor(res),summary:'Published Page Studio page',sourceAction:'PUBLISH',retentionCount:studioConfig.maxRevisions});const now=new Date(),{publishedSnapshot:_previousSnapshot,...pageFields}=page,publishedSnapshot=jsonValue(JSON.parse(JSON.stringify({...pageFields,blocks,publishedPath:page.path,publishedAt:page.publishedAt||now,publicModifiedAt:now})));const updated=await db.customPage.update({where:{id:page.id},data:{status:'PUBLISHED',publishedPath:page.path,publishedSnapshot,publishedAt:page.publishedAt||now,publicModifiedAt:now}});await db.activityLog.create({data:{action:'PUBLISH',entity:'CUSTOM_PAGE',entityId:page.id,actorId:actor(res),label:page.title}});res.json({page:updated,url:updated.publishedPath});
});
router.post('/pages/:id/unpublish',async(req,res)=>{const page=await db.customPage.update({where:{id:req.params.id},data:{status:'DRAFT',publishedPath:null}});await db.activityLog.create({data:{action:'UNPUBLISH',entity:'CUSTOM_PAGE',entityId:page.id,actorId:actor(res),label:page.title}});res.json({page});});
router.post('/pages/:id/duplicate',async(req,res)=>{const source=await db.customPage.findFirst({where:{id:req.params.id,deletedAt:null},include:{taxonomy:true}});if(!source)return res.status(404).json({error:'Page not found.'});let slug=`${source.slug}-copy`,index=2;while(await db.customPage.findUnique({where:{slug}}))slug=`${source.slug}-copy-${index++}`;const rekey=(blocks:StudioBlock[]):StudioBlock[]=>blocks.map(block=>({...block,id:crypto.randomUUID(),children:rekey(block.children||[])}));const page=await db.customPage.create({data:{title:`${source.title} — Copy`,slug,path:`/pages/${slug}`,status:'DRAFT',visibility:source.visibility,templateKey:source.templateKey,blocks:jsonValue(rekey(cloneBlocks(source.blocks))),navbarPresetId:source.navbarPresetId,seoTitle:source.seoTitle,seoDescription:source.seoDescription,ogImage:source.ogImage,noIndex:true,noFollow:source.noFollow,includeSitemap:false,taxonomy:{create:source.taxonomy.map(x=>({term:{connect:{id:x.termId}}}))}}});res.status(201).json({page});});
router.delete('/pages/:id',async(req,res)=>{const page=await db.customPage.update({where:{id:req.params.id},data:{deletedAt:new Date(),status:'ARCHIVED'}});await db.activityLog.create({data:{action:'TRASH',entity:'CUSTOM_PAGE',entityId:page.id,actorId:actor(res),label:page.title}});res.status(204).end();});
router.get('/pages/:id/revisions',async(req,res)=>res.json({revisions:await db.contentRevision.findMany({where:{resourceType:'CUSTOM_PAGE',resourceId:req.params.id},orderBy:{revision:'desc'},take:50})}));
router.post('/pages/:id/revisions/:revisionId/restore',async(req,res)=>{const [page,revision]=await Promise.all([db.customPage.findFirst({where:{id:req.params.id,deletedAt:null}}),db.contentRevision.findUnique({where:{id:req.params.revisionId}})]);if(!page||!revision||revision.resourceType!=='CUSTOM_PAGE'||revision.resourceId!==page.id)return res.status(404).json({error:'Page revision not found.'});await createRevision('CUSTOM_PAGE',page.id,page,{actorId:actor(res),summary:'Before revision restore',sourceAction:'RESTORE'});const snapshot=revision.snapshot as any;const blocks=studioBlocksSchema.parse(snapshot.blocks||[]);const restored=await db.customPage.update({where:{id:page.id},data:{title:snapshot.title||page.title,blocks:jsonValue(blocks),seoTitle:snapshot.seoTitle,seoDescription:snapshot.seoDescription,ogImage:snapshot.ogImage}});res.json({page:restored,notice:page.status==='PUBLISHED'?'Revision restored to the working draft. The current live snapshot remains unchanged until you publish again.':'Revision restored to the working draft.'});});

const namedBlocksSchema=z.object({name:z.string().min(1).max(120),slug:z.string().optional(),description:z.string().max(500).nullable().optional(),category:z.string().max(60).default('CONTENT'),mode:z.enum(['GLOBAL','COPY']).default('GLOBAL'),block:studioBlockSchema});
router.post('/reusable-blocks',async(req,res)=>{const p=namedBlocksSchema.safeParse(req.body);if(!p.success)return res.status(400).json({error:p.error.flatten()});const slug=p.data.slug?slugify(p.data.slug):slugify(p.data.name);const row=await db.reusableBlock.create({data:{...p.data,slug,block:jsonValue(p.data.block)}});res.status(201).json({reusableBlock:row});});
router.patch('/reusable-blocks/:id',async(req,res)=>{const p=namedBlocksSchema.partial().safeParse(req.body);if(!p.success)return res.status(400).json({error:p.error.flatten()});const current=await db.reusableBlock.findUnique({where:{id:req.params.id}});if(!current)return res.status(404).json({error:'Reusable block not found.'});const {block,slug,...fields}=p.data;const row=await db.reusableBlock.update({where:{id:current.id},data:{...fields,...(slug?{slug:slugify(slug)}:{}),...(block?{block:jsonValue(block),version:{increment:1}}:{})}});res.json({reusableBlock:row});});
router.delete('/reusable-blocks/:id',async(req,res)=>{await db.reusableBlock.update({where:{id:req.params.id},data:{active:false}});res.status(204).end();});

const templateSchema=z.object({name:z.string().min(1).max(120),slug:z.string().optional(),description:z.string().max(500).nullable().optional(),category:z.string().max(60).default('GENERAL'),thumbnail:nullableUrl,blocks:studioBlocksSchema});
router.post('/templates',async(req,res)=>{const p=templateSchema.safeParse(req.body);if(!p.success)return res.status(400).json({error:p.error.flatten()});const row=await db.pageTemplate.create({data:{...p.data,slug:slugify(p.data.slug||p.data.name),blocks:jsonValue(p.data.blocks)}});res.status(201).json({template:row});});
router.delete('/templates/:id',async(req,res)=>{await db.pageTemplate.update({where:{id:req.params.id},data:{active:false}});res.status(204).end();});

const taxonomySchema=z.object({name:z.string().min(1).max(100),slug:z.string().optional(),type:z.enum(['PAGE_CATEGORY','PAGE_TAG','WIDGET_CATEGORY']).default('PAGE_TAG'),description:z.string().max(500).nullable().optional(),parentId:z.string().nullable().optional(),sortOrder:z.number().int().min(0).max(10000).default(0)});
router.post('/taxonomy',async(req,res)=>{const p=taxonomySchema.safeParse(req.body);if(!p.success)return res.status(400).json({error:p.error.flatten()});const term=await db.taxonomyTerm.create({data:{...p.data,slug:slugify(p.data.slug||p.data.name)}});res.status(201).json({term});});
router.patch('/taxonomy/:id',async(req,res)=>{const p=taxonomySchema.partial().safeParse(req.body);if(!p.success)return res.status(400).json({error:p.error.flatten()});if(p.data.parentId===req.params.id)return res.status(400).json({error:'A taxonomy term cannot be its own parent.'});const term=await db.taxonomyTerm.update({where:{id:req.params.id},data:{...p.data,...(p.data.slug?{slug:slugify(p.data.slug)}:{})}});res.json({term});});
router.delete('/taxonomy/:id',async(req,res)=>{await db.taxonomyTerm.update({where:{id:req.params.id},data:{active:false}});res.status(204).end();});

const navigationItem:z.ZodType<any>=z.lazy(()=>z.object({id:z.string().min(1).max(90),label:z.string().min(1).max(80),url:z.string().min(1).max(500),enabled:z.boolean().default(true),newTab:z.boolean().default(false),desktop:z.boolean().default(true),mobile:z.boolean().default(true),style:z.enum(['LINK','CTA']).default('LINK'),icon:z.string().max(500).nullable().optional(),children:z.array(navigationItem).max(12).default([])}).strict());
const navigationSchema=z.object({name:z.string().min(1).max(120),slug:z.string().optional(),description:z.string().max(500).nullable().optional(),isGlobal:z.boolean().default(false),enabled:z.boolean().default(true),items:z.array(navigationItem).max(30).default([]),styles:z.record(z.string(),z.unknown()).default({})});
router.post('/navigation',async(req,res)=>{const p=navigationSchema.safeParse(req.body);if(!p.success)return res.status(400).json({error:p.error.flatten()});const slug=slugify(p.data.slug||p.data.name);const preset=await db.$transaction(async tx=>{if(p.data.isGlobal)await tx.navigationPreset.updateMany({data:{isGlobal:false}});return tx.navigationPreset.create({data:{...p.data,slug,items:jsonValue(p.data.items),styles:jsonValue(p.data.styles)}})});res.status(201).json({preset});});
router.patch('/navigation/:id',async(req,res)=>{const p=navigationSchema.partial().safeParse(req.body);if(!p.success)return res.status(400).json({error:p.error.flatten()});const preset=await db.$transaction(async tx=>{if(p.data.isGlobal)await tx.navigationPreset.updateMany({where:{id:{not:req.params.id}},data:{isGlobal:false}});const {items,styles,slug,...fields}=p.data;return tx.navigationPreset.update({where:{id:req.params.id},data:{...fields,...(slug?{slug:slugify(slug)}:{}),...(items?{items:jsonValue(items)}:{}),...(styles?{styles:jsonValue(styles)}:{})}})});res.json({preset});});
router.delete('/navigation/:id',async(req,res)=>{await db.navigationPreset.update({where:{id:req.params.id},data:{enabled:false,isGlobal:false}});res.status(204).end();});

const embedSchema=z.object({name:z.string().min(1).max(120),origin:z.string().url(),enabled:z.boolean().default(true),allowIframe:z.boolean().default(true),allowRemoteJson:z.boolean().default(false)});
function normalizeEmbedOrigin(value:string){const url=new URL(value);if(url.protocol!=='https:')throw new Error('Trusted embed origins must use HTTPS.');return url.origin}
router.post('/embed-sources',async(req,res)=>{const p=embedSchema.safeParse(req.body);if(!p.success)return res.status(400).json({error:p.error.flatten()});try{const source=await db.trustedEmbedSource.create({data:{...p.data,origin:normalizeEmbedOrigin(p.data.origin)}});res.status(201).json({source});}catch(error){res.status(400).json({error:error instanceof Error?error.message:'Could not add embed source.'})}});
router.patch('/embed-sources/:id',async(req,res)=>{const p=embedSchema.partial().safeParse(req.body);if(!p.success)return res.status(400).json({error:p.error.flatten()});try{const data={...p.data,...(p.data.origin?{origin:normalizeEmbedOrigin(p.data.origin)}:{})};const source=await db.trustedEmbedSource.update({where:{id:req.params.id},data});res.json({source});}catch(error){res.status(400).json({error:error instanceof Error?error.message:'Could not update embed source.'})}});
router.delete('/embed-sources/:id',async(req,res)=>{await db.trustedEmbedSource.update({where:{id:req.params.id},data:{enabled:false}});res.status(204).end();});

router.patch('/config',async(req,res)=>{const current=await config(),parsed=pageStudioConfigSchema.safeParse({...current,...req.body});if(!parsed.success)return res.status(400).json({error:parsed.error.flatten()});const row=await settings();await createRevision('SITE_SETTINGS',row.id,row,{actorId:actor(res),summary:'Page Studio configuration saved',sourceAction:'SAVE'});const updated=await db.siteSettings.update({where:{id:row.id},data:{pageStudioConfig:jsonValue(parsed.data)}});res.json({config:parsePageStudioConfig(updated.pageStudioConfig)});});

export default router;
