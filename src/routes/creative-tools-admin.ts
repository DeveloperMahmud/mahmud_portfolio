import { Router } from 'express';
import { Prisma } from '@prisma/client';
import { z } from 'zod';
import { db } from '../lib/db.js';
import {
  creativeToolAdminDto,
  creativeToolDetailSelect,
  creativeToolDraftData,
  creativeToolDraftPatchSchema,
  creativeToolRevisionSnapshot,
  creativeToolRevisionSnapshotSchema,
  publicHttpsUrlSchema
} from '../lib/creative-tools-admin.js';
import { buildCreativeToolPublicSnapshot } from '../lib/creative-tools.js';
import { createRevisionInTransaction } from '../lib/revisions.js';
import { notifyIndexNow } from '../lib/indexnow.js';
import { PublicUrlVerificationError, verifyPublicHttpsUrl } from '../lib/public-url-verification.js';
import { CreativeToolRedirectError, preserveCreativeToolSlugRedirect } from '../lib/creative-tool-redirect.js';

const router = Router();
const versionSchema=z.object({expectedUpdatedAt:z.string().datetime()}).strict();
const verifyLiveUrlSchema=z.object({expectedUpdatedAt:z.string().datetime(),liveUrl:publicHttpsUrlSchema}).strict();
const actor=(res:any)=>res.locals.currentUser?.id||res.locals.user?.sub;

const listQuerySchema = z.object({
  q: z.string().trim().max(120).optional().default(''),
  kind: z.enum(['ALL', 'FLAGSHIP', 'MINI']).optional().default('ALL'),
  productStatus: z.enum(['ALL', 'PLANNED', 'PREVIEW', 'BETA', 'LIVE', 'ARCHIVED']).optional().default('ALL'),
  status: z.enum(['ALL', 'DRAFT', 'PUBLISHED', 'ARCHIVED']).optional().default('ALL'),
  visibility: z.enum(['ALL', 'PUBLIC', 'UNLISTED', 'PRIVATE']).optional().default('ALL'),
  display: z.enum(['ALL', 'VISIBLE', 'HIDDEN']).optional().default('ALL'),
  featured: z.enum(['ALL', 'true', 'false']).optional().default('ALL'),
  category: z.string().trim().max(120).optional().default(''),
  sort: z.enum(['ORDER', 'TITLE_ASC', 'TITLE_DESC', 'UPDATED_DESC', 'UPDATED_ASC']).optional().default('ORDER'),
  page: z.coerce.number().int().min(1).max(100000).optional().default(1),
  pageSize: z.coerce.number().int().min(10).max(100).optional().default(25)
});

const listSelect = {
  id: true,
  canonicalId: true,
  systemSeeded: true,
  slug: true,
  publishedSlug: true,
  kind: true,
  category: true,
  title: true,
  subtitle: true,
  shortDescription: true,
  iconKey: true,
  coverImage: true,
  productStatus: true,
  demoMode: true,
  visibility: true,
  visible: true,
  featured: true,
  sortOrder: true,
  demoUrl: true,
  liveUrl: true,
  liveUrlVerifiedAt: true,
  status: true,
  publishedAt: true,
  scheduledAt: true,
  updatedAt: true
} satisfies Prisma.CreativeToolSelect;

router.get('/', async (req, res, next) => {
  try {
    const parsed = listQuerySchema.safeParse(req.query);
    if (!parsed.success) return res.status(400).json({ error: 'Invalid Creative Lab list query.', issues: parsed.error.flatten() });
    const query = parsed.data;
    const where: Prisma.CreativeToolWhereInput = {
      deletedAt: null,
      ...(query.kind === 'ALL' ? {} : { kind: query.kind }),
      ...(query.productStatus === 'ALL' ? {} : { productStatus: query.productStatus }),
      ...(query.status === 'ALL' ? {} : { status: query.status }),
      ...(query.visibility === 'ALL' ? {} : { visibility: query.visibility }),
      ...(query.display === 'ALL' ? {} : { visible: query.display === 'VISIBLE' }),
      ...(query.featured === 'ALL' ? {} : { featured: query.featured === 'true' }),
      ...(query.category ? { category: { equals: query.category, mode: 'insensitive' } } : {}),
      ...(query.q ? {
        OR: [
          { title: { contains: query.q, mode: 'insensitive' } },
          { subtitle: { contains: query.q, mode: 'insensitive' } },
          { shortDescription: { contains: query.q, mode: 'insensitive' } },
          { slug: { contains: query.q, mode: 'insensitive' } },
          { category: { contains: query.q, mode: 'insensitive' } },
          { canonicalId: { contains: query.q, mode: 'insensitive' } }
        ]
      } : {})
    };
    const orderByByName: Record<typeof query.sort, Prisma.CreativeToolOrderByWithRelationInput[]> = {
      ORDER: [{ featured: 'desc' }, { sortOrder: 'asc' }, { updatedAt: 'desc' }],
      TITLE_ASC: [{ title: 'asc' }, { sortOrder: 'asc' }],
      TITLE_DESC: [{ title: 'desc' }, { sortOrder: 'asc' }],
      UPDATED_DESC: [{ updatedAt: 'desc' }, { title: 'asc' }],
      UPDATED_ASC: [{ updatedAt: 'asc' }, { title: 'asc' }]
    };

    const [rows, total, activeRows] = await db.$transaction([
      db.creativeTool.findMany({
        where,
        select: listSelect,
        orderBy: orderByByName[query.sort],
        skip: (query.page - 1) * query.pageSize,
        take: query.pageSize
      }),
      db.creativeTool.count({ where }),
      db.creativeTool.findMany({
        where: { deletedAt: null },
        select: { kind: true, category: true, productStatus: true, status: true, visibility: true, visible: true }
      })
    ]);
    const role = String(res.locals.currentUser?.role || 'VIEWER').toUpperCase();
    const categories = [...new Set(activeRows.map(row => row.category).filter(Boolean))].sort((a, b) => a.localeCompare(b));
    const count = (key: keyof typeof activeRows[number], value: string) => activeRows.filter(row => row[key] === value).length;

    res.set('Cache-Control', 'private, no-store');
    res.json({
      tools: rows.map(row => {
        const { demoUrl, liveUrl, liveUrlVerifiedAt, ...tool } = row;
        return {
          ...tool,
          hasDemoUrl: Boolean(demoUrl),
          hasLiveUrl: Boolean(liveUrl),
          liveUrlVerified: Boolean(liveUrlVerifiedAt)
        };
      }),
      total,
      page: query.page,
      pageSize: query.pageSize,
      pages: Math.max(1, Math.ceil(total / query.pageSize)),
      query,
      facets: {
        total: activeRows.length,
        flagship: count('kind', 'FLAGSHIP'),
        mini: count('kind', 'MINI'),
        draft: count('status', 'DRAFT'),
        published: count('status', 'PUBLISHED'),
        live: count('productStatus', 'LIVE'),
        preview: count('productStatus', 'PREVIEW'),
        hidden: activeRows.filter(row => !row.visible).length,
        categories
      },
      permissions: {
        role,
        canInspect: ['ADMIN', 'EDITOR', 'VIEWER'].includes(role),
        canEdit: ['ADMIN', 'EDITOR'].includes(role),
        canPublish: ['ADMIN', 'EDITOR'].includes(role),
        canRestore: ['ADMIN', 'EDITOR'].includes(role),
        readOnly: role === 'VIEWER'
      }
    });
  } catch (error) {
    next(error);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const tool = await db.creativeTool.findFirst({
      where: { id: req.params.id, deletedAt: null },
      select: creativeToolDetailSelect
    });
    if (!tool) return res.status(404).json({ error: 'Creative tool not found.' });
    const role = String(res.locals.currentUser?.role || 'VIEWER').toUpperCase();
    res.set('Cache-Control', 'private, no-store');
    res.json({
      tool: creativeToolAdminDto(tool),
      permissions: {
        role,
        canInspect: ['ADMIN', 'EDITOR', 'VIEWER'].includes(role),
        canEdit: ['ADMIN', 'EDITOR'].includes(role),
        canPublish: ['ADMIN', 'EDITOR'].includes(role),
        canRestore: ['ADMIN', 'EDITOR'].includes(role),
        readOnly: role === 'VIEWER'
      }
    });
  } catch (error) {
    next(error);
  }
});

router.patch('/:id', async (req, res, next) => {
  if (req.body?.expectedUpdatedAt === undefined) {
    return res.status(428).json({
      error: 'Reload this tool before saving so the current draft version can be verified.',
      code: 'EXPECTED_VERSION_REQUIRED'
    });
  }
  const parsed = creativeToolDraftPatchSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Invalid creative tool draft.', issues: parsed.error.flatten() });

  try {
    const existing = await db.creativeTool.findFirst({
      where: { id: req.params.id, deletedAt: null },
      select: creativeToolDetailSelect
    });
    if (!existing) return res.status(404).json({ error: 'Creative tool not found.' });

    const expectedUpdatedAt = new Date(parsed.data.expectedUpdatedAt);
    if (existing.updatedAt.getTime() !== expectedUpdatedAt.getTime()) {
      return res.status(409).json({
        error: 'This tool changed in another tab or session. Reload it before saving to avoid overwriting newer work.',
        code: 'EDIT_CONFLICT',
        currentUpdatedAt: existing.updatedAt
      });
    }

    const liveUrlWasSubmitted = Object.prototype.hasOwnProperty.call(parsed.data, 'liveUrl');
    const resetLiveVerification = liveUrlWasSubmitted && parsed.data.liveUrl !== existing.liveUrl;
    const actorId = res.locals.currentUser?.id || res.locals.user?.sub;
    const updated = await db.$transaction(async tx => {
      const result = await tx.creativeTool.updateMany({
        where: { id: existing.id, deletedAt: null, updatedAt: expectedUpdatedAt },
        data: creativeToolDraftData(parsed.data, resetLiveVerification)
      });
      if (result.count !== 1) throw new Error('EDIT_CONFLICT');
      const tool = await tx.creativeTool.findUniqueOrThrow({
        where: { id: existing.id },
        select: creativeToolDetailSelect
      });
      await tx.activityLog.create({
        data: {
          action: 'TOOL_DRAFT_UPDATED',
          entity: 'CREATIVE_TOOL',
          entityId: tool.id,
          actorId,
          label: tool.title
        }
      });
      return tool;
    });

    res.set('Cache-Control', 'private, no-store');
    res.json({ tool: creativeToolAdminDto(updated) });
  } catch (error) {
    if (error instanceof Error && error.message === 'EDIT_CONFLICT') {
      return res.status(409).json({
        error: 'This tool changed while you were saving. Reload it before trying again.',
        code: 'EDIT_CONFLICT'
      });
    }
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return res.status(409).json({ error: 'That Creative Lab slug is already in use.', code: 'SLUG_CONFLICT' });
    }
    next(error);
  }
});

router.post('/:id/verify-live-url',async(req,res,next)=>{
  if(req.body?.expectedUpdatedAt===undefined)return res.status(428).json({error:'Reload this tool before verifying its live URL.',code:'EXPECTED_VERSION_REQUIRED'});
  const parsed=verifyLiveUrlSchema.safeParse(req.body);
  if(!parsed.success)return res.status(400).json({error:'Invalid live URL verification request.',issues:parsed.error.flatten()});
  try{
    const existing=await db.creativeTool.findFirst({where:{id:req.params.id,deletedAt:null},select:{id:true,title:true,liveUrl:true,updatedAt:true}});
    if(!existing)return res.status(404).json({error:'Creative tool not found.'});
    const expectedUpdatedAt=new Date(parsed.data.expectedUpdatedAt);
    if(existing.updatedAt.getTime()!==expectedUpdatedAt.getTime())return res.status(409).json({error:'This tool changed before its URL could be verified.',code:'EDIT_CONFLICT',currentUpdatedAt:existing.updatedAt});
    if(!existing.liveUrl)return res.status(422).json({error:'Save a public HTTPS live URL before verifying it.',code:'LIVE_URL_REQUIRED'});
    if(existing.liveUrl!==parsed.data.liveUrl)return res.status(409).json({error:'The submitted URL no longer matches the saved live URL. Reload before verifying.',code:'LIVE_URL_CHANGED'});
    const verification=await verifyPublicHttpsUrl(existing.liveUrl,{timeoutMs:8000,maxRedirects:3,maxBytes:65536});
    const verifiedAt=new Date();
    const updated=await db.$transaction(async tx=>{
      const result=await tx.creativeTool.updateMany({where:{id:existing.id,deletedAt:null,updatedAt:expectedUpdatedAt,liveUrl:existing.liveUrl},data:{liveUrlVerifiedAt:verifiedAt}});
      if(result.count!==1)throw new Error('EDIT_CONFLICT');
      await tx.activityLog.create({data:{action:'TOOL_LIVE_URL_VERIFIED',entity:'CREATIVE_TOOL',entityId:existing.id,actorId:actor(res),label:existing.title,result:`HTTP ${verification.status}`}});
      return tx.creativeTool.findUniqueOrThrow({where:{id:existing.id},select:creativeToolDetailSelect});
    });
    res.set('Cache-Control','private, no-store');
    res.json({tool:creativeToolAdminDto(updated),verification:{...verification,verifiedAt}});
  }catch(error){
    if(error instanceof PublicUrlVerificationError)return res.status(422).json({error:error.message,code:error.code});
    if(error instanceof Error&&error.message==='EDIT_CONFLICT')return res.status(409).json({error:'This tool changed while its URL was being verified. Reload before trying again.',code:'EDIT_CONFLICT'});
    if(error instanceof Error&&['ENOTFOUND','ECONNREFUSED','ECONNRESET','EHOSTUNREACH','ETIMEDOUT'].includes((error as NodeJS.ErrnoException).code||''))return res.status(502).json({error:'The live URL could not be reached safely.',code:'URL_UNREACHABLE'});
    next(error);
  }
});

router.post('/:id/publish', async (req, res, next) => {
  if(req.body?.expectedUpdatedAt===undefined)return res.status(428).json({error:'Reload this tool before publishing.',code:'EXPECTED_VERSION_REQUIRED'});
  const parsed=versionSchema.safeParse(req.body);
  if(!parsed.success)return res.status(400).json({error:'Invalid publish request.',issues:parsed.error.flatten()});
  try{
    const existing=await db.creativeTool.findFirst({where:{id:req.params.id,deletedAt:null},select:creativeToolDetailSelect});
    if(!existing)return res.status(404).json({error:'Creative tool not found.'});
    const expectedUpdatedAt=new Date(parsed.data.expectedUpdatedAt);
    if(existing.updatedAt.getTime()!==expectedUpdatedAt.getTime())return res.status(409).json({error:'This tool changed before it could be published. Reload and review it first.',code:'EDIT_CONFLICT',currentUpdatedAt:existing.updatedAt});
    const now=new Date();
    const publishCandidate=existing.publishedSlug&&existing.publishedSlug!==existing.slug
      ?{...existing,publishedSlug:existing.slug}
      :existing;
    const readiness=buildCreativeToolPublicSnapshot(publishCandidate as unknown as Record<string,unknown>,now);
    if(!readiness.snapshot)return res.status(422).json({error:'Publish readiness check failed.',issues:readiness.issues});
    const revision=creativeToolRevisionSnapshot(existing);
    const updated=await db.$transaction(async tx=>{
      const redirect=await preserveCreativeToolSlugRedirect(tx,{
        toolId:existing.id,
        previousPublishedSlug:existing.publishedSlug,
        nextPublishedSlug:existing.slug
      });
      const result=await tx.creativeTool.updateMany({where:{id:existing.id,deletedAt:null,updatedAt:expectedUpdatedAt},data:{status:'PUBLISHED',publishedSlug:existing.slug,publishedSnapshot:readiness.snapshot as unknown as Prisma.InputJsonValue,publishedAt:existing.publishedAt||now,publicModifiedAt:now}});
      if(result.count!==1)throw new Error('EDIT_CONFLICT');
      await createRevisionInTransaction(tx,'CREATIVE_TOOL',existing.id,revision,{actorId:actor(res),summary:`Published ${existing.title}`,sourceAction:'PUBLISH'});
      await tx.activityLog.create({data:{action:'TOOL_PUBLISHED',entity:'CREATIVE_TOOL',entityId:existing.id,actorId:actor(res),label:existing.title}});
      if(redirect)await tx.activityLog.create({data:{action:'TOOL_SLUG_REDIRECT_CREATED',entity:'CREATIVE_TOOL',entityId:existing.id,actorId:actor(res),label:`${redirect.rule.sourcePath} → ${redirect.rule.destination}${redirect.flattenedCount?` · ${redirect.flattenedCount} older alias${redirect.flattenedCount===1?'':'es'} flattened`:''}`}});
      return tx.creativeTool.findUniqueOrThrow({where:{id:existing.id},select:creativeToolDetailSelect});
    },{isolationLevel:Prisma.TransactionIsolationLevel.Serializable});
    if(updated.visibility==='PUBLIC'&&updated.visible&&!updated.noIndex)notifyIndexNow(`/creative-lab/${updated.publishedSlug}`);
    res.set('Cache-Control','private, no-store');
    res.json({tool:creativeToolAdminDto(updated),issues:readiness.issues,url:`/creative-lab/${updated.publishedSlug}`});
  }catch(error){
    if(error instanceof CreativeToolRedirectError)return res.status(409).json({error:error.message,code:error.code});
    if(error instanceof Error&&error.message==='EDIT_CONFLICT')return res.status(409).json({error:'This tool changed while publishing. Reload it before trying again.',code:'EDIT_CONFLICT'});
    if(error instanceof Prisma.PrismaClientKnownRequestError&&error.code==='P2034')return res.status(409).json({error:'Another publish changed the redirect graph. Reload and publish again.',code:'PUBLISH_RETRY_REQUIRED'});
    if(error instanceof Prisma.PrismaClientKnownRequestError&&error.code==='P2002')return res.status(409).json({error:'The live slug or revision conflicts with another record. Reload and review the tool.',code:'PUBLISH_CONFLICT'});
    next(error);
  }
});

router.post('/:id/unpublish',async(req,res,next)=>{
  if(req.body?.expectedUpdatedAt===undefined)return res.status(428).json({error:'Reload this tool before unpublishing.',code:'EXPECTED_VERSION_REQUIRED'});
  const parsed=versionSchema.safeParse(req.body);
  if(!parsed.success)return res.status(400).json({error:'Invalid unpublish request.',issues:parsed.error.flatten()});
  try{
    const existing=await db.creativeTool.findFirst({where:{id:req.params.id,deletedAt:null},select:creativeToolDetailSelect});
    if(!existing)return res.status(404).json({error:'Creative tool not found.'});
    const expectedUpdatedAt=new Date(parsed.data.expectedUpdatedAt);
    if(existing.updatedAt.getTime()!==expectedUpdatedAt.getTime())return res.status(409).json({error:'This tool changed before it could be unpublished.',code:'EDIT_CONFLICT',currentUpdatedAt:existing.updatedAt});
    const revision=creativeToolRevisionSnapshot(existing);
    const updated=await db.$transaction(async tx=>{
      const result=await tx.creativeTool.updateMany({where:{id:existing.id,deletedAt:null,updatedAt:expectedUpdatedAt},data:{status:'DRAFT'}});
      if(result.count!==1)throw new Error('EDIT_CONFLICT');
      await createRevisionInTransaction(tx,'CREATIVE_TOOL',existing.id,revision,{actorId:actor(res),summary:`Unpublished ${existing.title}`,sourceAction:'UNPUBLISH'});
      await tx.activityLog.create({data:{action:'TOOL_UNPUBLISHED',entity:'CREATIVE_TOOL',entityId:existing.id,actorId:actor(res),label:existing.title}});
      return tx.creativeTool.findUniqueOrThrow({where:{id:existing.id},select:creativeToolDetailSelect});
    });
    res.set('Cache-Control','private, no-store');
    res.json({tool:creativeToolAdminDto(updated),notice:'The last published snapshot is retained, but it is no longer publicly eligible.'});
  }catch(error){
    if(error instanceof Error&&error.message==='EDIT_CONFLICT')return res.status(409).json({error:'This tool changed while unpublishing.',code:'EDIT_CONFLICT'});
    if(error instanceof Prisma.PrismaClientKnownRequestError&&error.code==='P2002')return res.status(409).json({error:'A concurrent revision was created. Reload before trying again.',code:'REVISION_CONFLICT'});
    next(error);
  }
});

router.get('/:id/revisions',async(req,res,next)=>{
  try{
    const exists=await db.creativeTool.findFirst({where:{id:req.params.id,deletedAt:null},select:{id:true}});
    if(!exists)return res.status(404).json({error:'Creative tool not found.'});
    const revisions=await db.contentRevision.findMany({where:{resourceType:'CREATIVE_TOOL',resourceId:exists.id},orderBy:{revision:'desc'},take:50,select:{id:true,revision:true,summary:true,sourceAction:true,actorId:true,createdAt:true}});
    res.set('Cache-Control','private, no-store');
    res.json({revisions});
  }catch(error){next(error)}
});

router.get('/:id/revisions/:revisionId',async(req,res,next)=>{
  try{
    const revision=await db.contentRevision.findFirst({where:{id:req.params.revisionId,resourceType:'CREATIVE_TOOL',resourceId:req.params.id},select:{id:true,revision:true,summary:true,sourceAction:true,actorId:true,createdAt:true,snapshot:true}});
    if(!revision)return res.status(404).json({error:'Creative tool revision not found.'});
    const parsed=creativeToolRevisionSnapshotSchema.safeParse(revision.snapshot);
    if(!parsed.success)return res.status(422).json({error:'This revision cannot be safely read.',code:'INVALID_REVISION'});
    res.set('Cache-Control','private, no-store');
    res.json({revision:{...revision,snapshot:parsed.data}});
  }catch(error){next(error)}
});

router.post('/:id/revisions/:revisionId/restore',async(req,res,next)=>{
  if(req.body?.expectedUpdatedAt===undefined)return res.status(428).json({error:'Reload this tool before restoring a revision.',code:'EXPECTED_VERSION_REQUIRED'});
  const version=versionSchema.safeParse(req.body);
  if(!version.success)return res.status(400).json({error:'Invalid restore request.',issues:version.error.flatten()});
  try{
    const [existing,revision]=await Promise.all([
      db.creativeTool.findFirst({where:{id:req.params.id,deletedAt:null},select:creativeToolDetailSelect}),
      db.contentRevision.findFirst({where:{id:req.params.revisionId,resourceType:'CREATIVE_TOOL',resourceId:req.params.id},select:{snapshot:true,revision:true}})
    ]);
    if(!existing||!revision)return res.status(404).json({error:'Creative tool or revision not found.'});
    const expectedUpdatedAt=new Date(version.data.expectedUpdatedAt);
    if(existing.updatedAt.getTime()!==expectedUpdatedAt.getTime())return res.status(409).json({error:'This tool changed before the revision could be restored.',code:'EDIT_CONFLICT',currentUpdatedAt:existing.updatedAt});
    const snapshot=creativeToolRevisionSnapshotSchema.safeParse(revision.snapshot);
    if(!snapshot.success||snapshot.data.canonicalId!==existing.canonicalId||snapshot.data.kind!==existing.kind)return res.status(422).json({error:'This revision is incompatible with the current tool.',code:'INVALID_REVISION'});
    const protective=creativeToolRevisionSnapshot(existing),resetLiveVerification=snapshot.data.fields.liveUrl!==existing.liveUrl;
    const restoreInput={...snapshot.data.fields,expectedUpdatedAt:expectedUpdatedAt.toISOString()};
    const updated=await db.$transaction(async tx=>{
      const result=await tx.creativeTool.updateMany({where:{id:existing.id,deletedAt:null,updatedAt:expectedUpdatedAt},data:creativeToolDraftData(restoreInput,resetLiveVerification)});
      if(result.count!==1)throw new Error('EDIT_CONFLICT');
      await createRevisionInTransaction(tx,'CREATIVE_TOOL',existing.id,protective,{actorId:actor(res),summary:`Before restoring revision ${revision.revision}`,sourceAction:'RESTORE'});
      await tx.activityLog.create({data:{action:'TOOL_REVISION_RESTORED',entity:'CREATIVE_TOOL',entityId:existing.id,actorId:actor(res),label:`${existing.title} · revision ${revision.revision}`}});
      return tx.creativeTool.findUniqueOrThrow({where:{id:existing.id},select:creativeToolDetailSelect});
    });
    res.set('Cache-Control','private, no-store');
    res.json({tool:creativeToolAdminDto(updated),notice:'Revision restored to the working draft. The current live snapshot is unchanged until you publish again.'});
  }catch(error){
    if(error instanceof Error&&error.message==='EDIT_CONFLICT')return res.status(409).json({error:'This tool changed while restoring the revision.',code:'EDIT_CONFLICT'});
    if(error instanceof Prisma.PrismaClientKnownRequestError&&error.code==='P2002')return res.status(409).json({error:'The restored slug or revision conflicts with another record.',code:'RESTORE_CONFLICT'});
    next(error);
  }
});

export default router;
