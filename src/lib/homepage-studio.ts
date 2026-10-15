import { z } from 'zod';

export const HOMEPAGE_STUDIO_KEY='homepage_studio_state';
export const HOMEPAGE_SECTION_KEYS=['hero','brands','featured_slider','selected_work','editorial_modules','amazon','capabilities','tools','statement','about','why_me','clients','contact'] as const;
export const HOMEPAGE_STUDIO_BLOCKS=['HOME_SECTION','HOME_GROUP','SOCIAL_LINKS','CUSTOM_CODE','WEBSITE_EMBED'] as const;

export type HomepageStudioBlock={
  id:string;
  type:typeof HOMEPAGE_STUDIO_BLOCKS[number];
  enabled:boolean;
  data:Record<string,unknown>;
  children:HomepageStudioBlock[];
};

const record=z.record(z.string(),z.unknown()).default({});
export const homepageStudioBlockSchema:z.ZodType<HomepageStudioBlock>=z.lazy(()=>z.object({
  id:z.string().min(1).max(90),
  type:z.enum(HOMEPAGE_STUDIO_BLOCKS),
  enabled:z.boolean().default(true),
  data:record,
  children:z.array(homepageStudioBlockSchema).max(30).default([])
}).strict());

export const homepageStudioLayoutSchema=z.object({
  version:z.literal(1).default(1),
  blocks:z.array(homepageStudioBlockSchema).min(1).max(40)
}).strict().superRefine((layout,ctx)=>{
  const ids:string[]=[];const sections:string[]=[];
  const walk=(items:HomepageStudioBlock[],depth:number)=>items.forEach(block=>{
    ids.push(block.id);
    if(depth>3)ctx.addIssue({code:'custom',message:'Homepage blocks can be nested at most three levels deep.'});
    if(block.type==='HOME_SECTION')sections.push(String(block.data.sectionKey||''));
    if(block.type==='HOME_SECTION'&&depth!==1)ctx.addIssue({code:'custom',message:'Existing homepage sections must remain at the top level.'});
    if(block.type==='CUSTOM_CODE'){
      if(String(block.data.html||'').length>30000||String(block.data.css||'').length>30000)ctx.addIssue({code:'custom',message:'Custom HTML and CSS are limited to 30 KB each.'});
    }
    walk(block.children||[],depth+1);
  });
  walk(layout.blocks,1);
  if(new Set(ids).size!==ids.length)ctx.addIssue({code:'custom',message:'Every homepage block must have a unique ID.'});
  if(new Set(sections).size!==sections.length)ctx.addIssue({code:'custom',message:'An existing homepage section can only appear once.'});
  for(const key of sections)if(!HOMEPAGE_SECTION_KEYS.includes(key as any))ctx.addIssue({code:'custom',message:`Unknown homepage section: ${key}.`});
});

export type HomepageStudioLayout=z.infer<typeof homepageStudioLayoutSchema>;
export const homepageStudioStateSchema=z.object({
  live:z.boolean().default(false),
  draft:homepageStudioLayoutSchema,
  published:homepageStudioLayoutSchema.nullable().default(null),
  updatedAt:z.string().datetime().nullable().default(null),
  publishedAt:z.string().datetime().nullable().default(null)
}).strict();
export type HomepageStudioState=z.infer<typeof homepageStudioStateSchema>;

const labels:Record<(typeof HOMEPAGE_SECTION_KEYS)[number],string>={hero:'Hero',brands:'Brand / Client Strip',featured_slider:'Featured Project Slider',selected_work:'Selected Work',editorial_modules:'Editorial Modules',amazon:'Amazon / E-commerce',capabilities:'Capabilities',tools:'Tools / Skills',statement:'Designer Statement',about:'About',why_me:'Why Work With Me',clients:'Clients / Testimonials',contact:'Contact'};

export function defaultHomepageStudioLayout():HomepageStudioLayout{
  return {version:1,blocks:HOMEPAGE_SECTION_KEYS.map(key=>({
    id:`home-${key}`,
    type:'HOME_SECTION' as const,
    enabled:true,
    data:{sectionKey:key,label:labels[key]},
    children:key==='about'?[{id:'home-about-socials',type:'SOCIAL_LINKS' as const,enabled:true,data:{heading:'Find me online',style:'BUTTONS'},children:[]}]:[]
  }))};
}

export function defaultHomepageStudioState():HomepageStudioState{
  return {live:false,draft:defaultHomepageStudioLayout(),published:null,updatedAt:null,publishedAt:null};
}

export function parseHomepageStudioState(value:unknown):HomepageStudioState{
  const fallback=defaultHomepageStudioState();
  const source=value&&typeof value==='object'&&!Array.isArray(value)?value:{};
  const parsed=homepageStudioStateSchema.safeParse({...fallback,...source});
  return parsed.success?parsed.data:fallback;
}

export function collectHomepageBlocks(layout:HomepageStudioLayout){
  const result:HomepageStudioBlock[]=[];
  const walk=(items:HomepageStudioBlock[])=>items.forEach(item=>{result.push(item);walk(item.children||[])});
  walk(layout.blocks);return result;
}
