import { z } from 'zod';

export const publicPathOrHttps = z.string().max(1000).refine(value => {
  if (/^\/(?!\/)[a-z0-9][a-z0-9\-_/]*(?:[?#][^\s]*)?$/i.test(value)) return true;
  try { return new URL(value).protocol === 'https:'; } catch { return false; }
}, 'URL must be an internal path or HTTPS URL');

const actionSchema = z.object({
  label: z.string().max(100).nullable().optional(),
  behavior: z.enum(['AUTO','DEMO','LIVE','DETAILS']),
  target: z.enum(['SAME_TAB','NEW_TAB']),
  style: z.string().max(40).nullable().optional(),
  url: publicPathOrHttps
});

export const publicCreativeToolSchema = z.object({
  schemaVersion: z.literal(1),
  toolId: z.string().min(1).max(191).optional(),
  canonicalId: z.string().regex(/^[FM]0[1-6]$/).nullable(),
  publishedSlug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  kind: z.enum(['FLAGSHIP','MINI']),
  category: z.string().min(1).max(120),
  tags: z.array(z.string().min(1).max(60)).max(20),
  title: z.string().min(1).max(180),
  subtitle: z.string().max(300).nullable().optional(),
  shortDescription: z.string().max(600).nullable().optional(),
  overview: z.string().max(4000).nullable().optional(),
  problemStatement: z.string().max(1500).nullable().optional(),
  audience: z.array(z.string().min(1).max(160)).max(20),
  featureBullets: z.array(z.string().min(1).max(300)).max(30),
  proposedInputs: z.array(z.string().min(1).max(300)).max(30),
  proposedOutputs: z.array(z.string().min(1).max(300)).max(30),
  limitations: z.array(z.string().min(1).max(500)).max(30),
  iconKey: z.string().max(80).nullable().optional(),
  coverImage: publicPathOrHttps.nullable().optional(),
  galleryImages: z.array(z.object({url:publicPathOrHttps,alt:z.string().max(240).default('')})).max(30),
  pageBlocks: z.array(z.unknown()).max(80),
  productStatus: z.enum(['PLANNED','PREVIEW','BETA','LIVE','ARCHIVED']),
  demoMode: z.enum(['CONCEPT','SAMPLE_INTERACTIVE','ACTUAL']),
  demoNotice: z.string().max(600).nullable().optional(),
  actions: z.object({primary:actionSchema,secondary:actionSchema.nullable().optional()}),
  demoUrl: publicPathOrHttps,
  documentationUrl: publicPathOrHttps.nullable().optional(),
  seo: z.object({
    title: z.string().max(180).nullable().optional(),
    description: z.string().max(500).nullable().optional(),
    ogImage: publicPathOrHttps.nullable().optional(),
    canonicalUrl: z.string().url().nullable().optional(),
    noIndex: z.boolean(),
    noFollow: z.boolean(),
    includeSitemap: z.boolean()
  }),
  publishedAt: z.string().datetime(),
  publicModifiedAt: z.string().datetime()
});

export type PublicCreativeTool = z.infer<typeof publicCreativeToolSchema>;
export type CreativeToolPublishIssue = {field:string;code:string;severity:'ERROR'|'WARNING';message:string};

export function publicCreativeTool(value: unknown): PublicCreativeTool | null {
  const parsed = publicCreativeToolSchema.safeParse(value);
  return parsed.success ? parsed.data : null;
}

export function filterPublicCreativeTools(items: PublicCreativeTool[], input: {q?:string;kind?:string;status?:string;category?:string}) {
  const q = input.q?.trim().toLocaleLowerCase() || '';
  const category = input.category?.trim().toLocaleLowerCase() || '';
  return items.filter(item => {
    if (item.productStatus === 'ARCHIVED') return false;
    if (input.kind && item.kind !== input.kind) return false;
    if (input.status && item.productStatus !== input.status) return false;
    if (category && item.category.toLocaleLowerCase() !== category) return false;
    if (!q) return true;
    return [item.title,item.subtitle,item.shortDescription,item.category,...item.tags,...item.audience].filter(Boolean).join(' ').toLocaleLowerCase().includes(q);
  });
}

function actionUrl(tool:Record<string,any>,behavior:'AUTO'|'DEMO'|'LIVE'|'DETAILS') {
  const details=`/creative-lab/${tool.slug}`;
  if(behavior==='DETAILS')return details;
  if(behavior==='DEMO')return tool.demoUrl||details;
  if(behavior==='LIVE')return tool.liveUrl||details;
  return tool.productStatus==='LIVE'&&tool.liveUrl&&tool.liveUrlVerifiedAt?tool.liveUrl:(tool.demoUrl||details);
}

export function buildCreativeToolPublicSnapshot(tool:Record<string,any>,now=new Date()):{snapshot:PublicCreativeTool|null;issues:CreativeToolPublishIssue[]} {
  const issues:CreativeToolPublishIssue[]=[];
  const error=(field:string,code:string,message:string)=>issues.push({field,code,severity:'ERROR',message});
  if(tool.publishedSlug&&tool.publishedSlug!==tool.slug)error('slug','SLUG_REDIRECT_REQUIRED','The draft slug differs from the live slug. Configure the redirect workflow before publishing this change.');
  if(!tool.demoUrl)error('demoUrl','DEMO_URL_REQUIRED','A demo URL is required before publishing.');
  if(tool.demoMode!=='ACTUAL'&&!String(tool.demoNotice||'').trim())error('demoNotice','DEMO_NOTICE_REQUIRED','Concept and sample demos need an honest demo notice.');
  if(tool.productStatus==='ARCHIVED')error('productStatus','ARCHIVED_TOOL','Archived tools cannot be published.');
  const needsVerifiedLive=tool.productStatus==='LIVE'||tool.primaryBehavior==='LIVE'||(tool.secondaryLabel&&tool.secondaryBehavior==='LIVE');
  if(needsVerifiedLive&&!tool.liveUrl)error('liveUrl','LIVE_URL_REQUIRED','A live URL is required for a live tool or action.');
  if(needsVerifiedLive&&tool.liveUrl&&!tool.liveUrlVerifiedAt)error('liveUrl','LIVE_URL_UNVERIFIED','Verify the live URL before publishing a live tool or action.');

  const publishedAt=(tool.publishedAt instanceof Date?tool.publishedAt:new Date(tool.publishedAt||now)).toISOString();
  const candidate={
    schemaVersion:1 as const,
    toolId:tool.id,
    canonicalId:tool.canonicalId,
    publishedSlug:tool.slug,
    kind:tool.kind,
    category:tool.category,
    tags:tool.tags||[],
    title:tool.title,
    subtitle:tool.subtitle,
    shortDescription:tool.shortDescription,
    overview:tool.overview,
    problemStatement:tool.problemStatement,
    audience:tool.audience||[],
    featureBullets:tool.featureBullets||[],
    proposedInputs:tool.proposedInputs||[],
    proposedOutputs:tool.proposedOutputs||[],
    limitations:tool.limitations||[],
    iconKey:tool.iconKey,
    coverImage:tool.coverImage,
    galleryImages:Array.isArray(tool.galleryImages)?tool.galleryImages:[],
    pageBlocks:Array.isArray(tool.pageBlocks)?tool.pageBlocks:[],
    productStatus:tool.productStatus,
    demoMode:tool.demoMode,
    demoNotice:tool.demoNotice,
    actions:{
      primary:{label:tool.primaryLabel,behavior:tool.primaryBehavior,target:tool.primaryTarget,style:tool.primaryStyle,url:actionUrl(tool,tool.primaryBehavior)},
      secondary:tool.secondaryLabel?{label:tool.secondaryLabel,behavior:tool.secondaryBehavior||'DETAILS',target:tool.secondaryTarget,style:tool.secondaryStyle,url:tool.secondaryBehavior==='LIVE'?actionUrl(tool,'LIVE'):(tool.secondaryUrl||actionUrl(tool,tool.secondaryBehavior||'DETAILS'))}:null
    },
    demoUrl:tool.demoUrl||`/creative-lab/${tool.slug}/demo`,
    documentationUrl:tool.documentationUrl,
    seo:{title:tool.seoTitle,description:tool.seoDescription,ogImage:tool.ogImage,canonicalUrl:tool.canonicalUrl,noIndex:Boolean(tool.noIndex),noFollow:Boolean(tool.noFollow),includeSitemap:tool.includeSitemap!==false},
    publishedAt,
    publicModifiedAt:now.toISOString()
  };
  const parsed=publicCreativeToolSchema.safeParse(candidate);
  if(!parsed.success){
    for(const item of parsed.error.issues)error(item.path.join('.')||'tool','INVALID_PUBLIC_SNAPSHOT',item.message);
  }
  return {snapshot:parsed.success&&issues.every(item=>item.severity!=='ERROR')?parsed.data:null,issues};
}
