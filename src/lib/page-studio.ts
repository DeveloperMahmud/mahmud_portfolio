import { z } from 'zod';

export const PAGE_STUDIO_SCHEMA_VERSION=1;
export const PAGE_STUDIO_WIDGETS=['SECTION','COLUMNS','HERO','HEADING','RICH_TEXT','IMAGE','GALLERY','VIDEO','CTA','STATS','QUOTE','EDITORIAL_SHOWCASE','COLLECTION_GRID','TESTIMONIAL_CAROUSEL','PROJECT_GRID','JOURNAL_FEED','BRAND_GRID','SOCIAL_LINKS','CV_DOWNLOAD','CONTACT','FAQ','SPACER','DIVIDER','LOTTIE','EMBED'] as const;
export type PageStudioWidgetType=typeof PAGE_STUDIO_WIDGETS[number];

const jsonRecord=z.record(z.string(),z.unknown()).default({});
export type StudioBlock={id:string;type:PageStudioWidgetType;enabled:boolean;data:Record<string,unknown>;style:Record<string,unknown>;responsive:Record<string,unknown>;motion:Record<string,unknown>;children:StudioBlock[];globalBlockId?:string|null;globalVersion?:number|null};

export const studioBlockSchema:z.ZodType<StudioBlock>=z.lazy(()=>z.object({
  id:z.string().min(1).max(90),
  type:z.enum(PAGE_STUDIO_WIDGETS),
  enabled:z.boolean().default(true),
  data:jsonRecord,
  style:jsonRecord,
  responsive:jsonRecord,
  motion:jsonRecord,
  children:z.array(studioBlockSchema).max(80).default([]),
  globalBlockId:z.string().max(90).nullable().optional(),
  globalVersion:z.number().int().positive().nullable().optional()
}).strict());

function blockStats(blocks:StudioBlock[],depth=1):{count:number;depth:number}{
  return blocks.reduce((result,block)=>{const nested=blockStats(block.children||[],depth+1);return {count:result.count+1+nested.count,depth:Math.max(result.depth,nested.depth)}},{count:0,depth});
}

export const studioBlocksSchema=z.array(studioBlockSchema).max(120).superRefine((blocks,ctx)=>{
  const stats=blockStats(blocks);
  if(stats.count>180)ctx.addIssue({code:'custom',message:'A page can contain at most 180 widgets.'});
  if(stats.depth>5)ctx.addIssue({code:'custom',message:'Widgets can be nested at most five levels deep.'});
  const ids:string[]=[];const walk=(items:StudioBlock[])=>items.forEach(item=>{ids.push(item.id);walk(item.children||[])});walk(blocks);
  if(new Set(ids).size!==ids.length)ctx.addIssue({code:'custom',message:'Every widget must have a unique ID.'});
});

export const pageStudioConfigSchema=z.object({
  cmsEnabled:z.boolean().default(true),
  publicEnabled:z.boolean().default(false),
  customPathsEnabled:z.boolean().default(false),
  maxRevisions:z.number().int().min(5).max(50).default(25),
  maxBlocks:z.number().int().min(20).max(180).default(120),
  freeTierMode:z.boolean().default(true),
  maxUploadBytes:z.number().int().min(100000).max(4000000).default(4000000),
  remoteCacheMinutes:z.number().int().min(5).max(1440).default(30)
}).strict();
export type PageStudioConfig=z.infer<typeof pageStudioConfigSchema>;

export const DEFAULT_PAGE_STUDIO_CONFIG:PageStudioConfig={cmsEnabled:true,publicEnabled:false,customPathsEnabled:false,maxRevisions:25,maxBlocks:120,freeTierMode:true,maxUploadBytes:4000000,remoteCacheMinutes:30};

export function pageStudioSystemEnabled(){return process.env.PAGE_STUDIO_EMERGENCY_DISABLED!=='true'}
export function parsePageStudioConfig(value:unknown):PageStudioConfig{return pageStudioConfigSchema.parse({...DEFAULT_PAGE_STUDIO_CONFIG,...(value&&typeof value==='object'&&!Array.isArray(value)?value:{})})}

const reservedRoots=new Set(['api','admin','admin.html','work','work.html','journal','blog.html','share','preview','health','robots.txt','sitemap.xml','llms.txt','page-studio.html']);
export function normalizePagePath(value:string,slug:string,customPathsEnabled:boolean){
  const raw=(value||`/pages/${slug}`).trim();
  let pathname=raw.startsWith('/')?raw:`/${raw}`;
  pathname=pathname.replace(/\/{2,}/g,'/').replace(/\/$/,'')||'/';
  if(!/^\/[a-z0-9][a-z0-9\-_/]*$/.test(pathname))throw new Error('Path may contain lowercase letters, numbers, hyphens and slashes only.');
  const root=pathname.split('/').filter(Boolean)[0]||'';
  if(reservedRoots.has(root))throw new Error('That path is reserved by the existing site.');
  if(!customPathsEnabled&&pathname!==`/pages/${slug}`)throw new Error(`Custom paths are disabled. Use /pages/${slug}.`);
  return pathname;
}

export function defaultBlock(type:PageStudioWidgetType,id:string):StudioBlock{
  const content:Record<PageStudioWidgetType,Record<string,unknown>>={
    SECTION:{label:'Section',width:'WIDE'},COLUMNS:{columns:2,gap:'MEDIUM'},HERO:{eyebrow:'NEW PAGE',heading:'Build something clear.',text:'Introduce this page with a focused message.',ctaLabel:'START A CONVERSATION',ctaUrl:'/#contact',image:'',imageAlt:''},HEADING:{eyebrow:'',text:'Section heading',level:2},RICH_TEXT:{text:'Add clear, useful copy here.'},IMAGE:{url:'',alt:'',caption:'',sourceType:'MEDIA_LIBRARY'},GALLERY:{items:[]},VIDEO:{url:'',title:'Video'},CTA:{eyebrow:'READY WHEN YOU ARE',heading:'Have a project in mind?',text:'Send a short note and I will get back to you.',label:'START A CONVERSATION',url:'/#contact'},STATS:{items:[{label:'PROJECTS',value:'12+'},{label:'YEARS',value:'5+'}]},QUOTE:{quote:'Design should make the next action feel obvious.',author:''},EDITORIAL_SHOWCASE:{eyebrow:'CURATED COLLECTION',heading:'A more elevated way to explore.',text:'Pair a focused introduction with visual cards.',primaryLabel:'EXPLORE WORK',primaryUrl:'/work.html',items:[{title:'Commerce systems',meta:'AMAZON / E-COMMERCE',image:'',url:'/work.html'},{title:'Brand direction',meta:'IDENTITY / CAMPAIGN',image:'',url:'/work.html'},{title:'Digital experiences',meta:'WEB / PRODUCT',image:'',url:'/work.html'}]},COLLECTION_GRID:{eyebrow:'EXPLORE BY NEED',heading:'Pick a direction. Build the right outcome.',text:'Use these cards as a clear path into services or collections.',items:[{title:'Amazon growth',text:'A+ Content, storefronts and listing systems.',url:'/work.html'},{title:'Brand systems',text:'Identity, campaigns and launch assets.',url:'/work.html'},{title:'Digital launches',text:'Landing pages and product experiences.',url:'/work.html'},{title:'Motion stories',text:'Product films and social content.',url:'/work.html'}]},TESTIMONIAL_CAROUSEL:{heading:'Client notes',auto:true,interval:5},PROJECT_GRID:{heading:'Selected work',category:'',limit:6},JOURNAL_FEED:{heading:'Latest journal',limit:3},BRAND_GRID:{heading:'Selected brands'},SOCIAL_LINKS:{heading:'Find me online'},CV_DOWNLOAD:{label:'DOWNLOAD CV'},CONTACT:{heading:'Have a question or project in mind?',text:'Share the essentials. A short message is enough.'},FAQ:{items:[{question:'What can we build together?',answer:'Add your answer here.'}]},SPACER:{size:64},DIVIDER:{},LOTTIE:{url:'',fallback:'→',label:'Animated icon',trigger:'AUTOPLAY',loop:'true',speed:1,size:96},EMBED:{url:'',title:'Embedded content',height:560},
  };
  return {id,type,enabled:true,data:content[type],style:{theme:'DEFAULT',align:'LEFT',padding:'MEDIUM'},responsive:{hideDesktop:false,hideTablet:false,hideMobile:false},motion:{enabled:false},children:[]};
}

export const DEFAULT_PAGE_TEMPLATES=[
  {name:'Blank page',slug:'blank',category:'GENERAL',description:'An empty canvas.',blocks:[]},
  {name:'Service page',slug:'service-page',category:'SERVICES',description:'Hero, service story, selected work and inquiry CTA.',blocks:[defaultBlock('HERO','template-service-hero'),defaultBlock('RICH_TEXT','template-service-copy'),defaultBlock('PROJECT_GRID','template-service-work'),defaultBlock('CTA','template-service-cta')]},
  {name:'Landing page',slug:'landing-page',category:'LANDING',description:'Focused campaign page with minimal distractions.',blocks:[defaultBlock('HERO','template-landing-hero'),defaultBlock('STATS','template-landing-stats'),defaultBlock('IMAGE','template-landing-image'),defaultBlock('CTA','template-landing-cta')]},
  {name:'Resource page',slug:'resource-page',category:'RESOURCES',description:'Long-form resource with a clear download or inquiry action.',blocks:[defaultBlock('HERO','template-resource-hero'),defaultBlock('RICH_TEXT','template-resource-copy'),defaultBlock('FAQ','template-resource-faq'),defaultBlock('CTA','template-resource-cta')]}
];

export function slugify(value:string){return value.toLowerCase().normalize('NFKD').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,80)}
export function cloneBlocks(value:unknown){return JSON.parse(JSON.stringify(studioBlocksSchema.parse(value))) as StudioBlock[]}

export function resolveGlobalBlocks(blocks:StudioBlock[],masters:Array<{id:string;version:number;mode:string;active:boolean;block:unknown}>){
  const byId=new Map(masters.filter(item=>item.active&&item.mode==='GLOBAL').map(item=>[item.id,item]));
  const resolve=(items:StudioBlock[]):StudioBlock[]=>items.map(instance=>{
    const master=instance.globalBlockId?byId.get(instance.globalBlockId):undefined;
    if(!master)return {...instance,children:resolve(instance.children||[])};
    const source=studioBlockSchema.parse(master.block);
    return {...source,id:instance.id,globalBlockId:master.id,globalVersion:master.version,children:resolve(source.children||[])};
  });
  return resolve(cloneBlocks(blocks));
}
