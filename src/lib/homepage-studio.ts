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
      if(String(block.data.html||'').length>30000||String(block.data.css||'').length>30000||String(block.data.js||'').length>30000)ctx.addIssue({code:'custom',message:'Custom HTML, CSS and JavaScript are limited to 30 KB each.'});
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

export type HomepageResolvedSection={
  source:string;
  managerLabel:string;
  managerUrl:string;
  fields:Record<string,unknown>;
  managedCount?:number;
};

const objectValue=(value:unknown):Record<string,any>=>value&&typeof value==='object'&&!Array.isArray(value)?value as Record<string,any>:{};
const listValue=(value:unknown):any[]=>Array.isArray(value)?value:[];
const textValue=(value:unknown,fallback:string)=>typeof value==='string'&&value.trim()?value:fallback;

/**
 * Resolve the content currently feeding the legacy homepage. Homepage Studio
 * keeps only visual overrides; managed projects, skills, brands and testimonials
 * remain the canonical records so the same content is never duplicated.
 */
export function resolveHomepageStudioSections(siteSettings:Record<string,any>):Record<string,HomepageResolvedSection>{
  const hero=objectValue(siteSettings.heroConfig),amazon=objectValue(siteSettings.amazonConfig),statement=objectValue(siteSettings.statementConfig),about=objectValue(siteSettings.aboutConfig),inquiry=objectValue(siteSettings.inquiryConfig),slider=objectValue(siteSettings.sliderConfig),editorial=objectValue(slider.editorialHome),testimonial=objectValue(slider.testimonialCarousel);
  const primary=objectValue(hero.primaryCta),secondary=objectValue(hero.secondaryCta),phrases=listValue(siteSettings.heroTypewriterPhrases).filter(value=>typeof value==='string'&&value.trim());
  const skills=listValue(siteSettings.skillsConfig),capabilities=listValue(siteSettings.capabilitiesConfig),socials=listValue(siteSettings.socialLinks);
  const managerUrl='/admin.html';
  return {
    hero:{source:'SITE SETTINGS / HERO',managerLabel:'OPEN SITE SETTINGS',managerUrl,fields:{eyebrow:textValue(hero.eyebrow,'AMAZON A+ / E-COMMERCE / BRANDING / WEB / MOTION'),leadText:textValue(siteSettings.heroLeadText,'I DESIGN'),phrases:(phrases.length?phrases:['BRANDS THAT SELL.','I CREATE E-COMMERCE EXPERIENCES.','CREATIVE THINKING. TECHNICAL PRECISION.']).join('\n'),description:textValue(hero.supportingCopy,'Creative design focused on Amazon, e-commerce and visual communication - backed by a technical, detail-driven mindset.'),primaryLabel:textValue(primary.label,'EXPLORE WORK'),primaryUrl:textValue(primary.url,'#work'),secondaryLabel:textValue(secondary.label,"LET'S WORK TOGETHER"),secondaryUrl:textValue(secondary.url,'#contact'),image:textValue(hero.desktopImage,textValue(siteSettings.heroImage,'/assets/home-hero-default.png'))}},
    brands:{source:'BRAND LIBRARY',managerLabel:'MANAGE BRANDS',managerUrl,fields:{eyebrow:'SELECTED BRANDS / CLIENT WORK'}},
    featured_slider:{source:'PUBLISHED PROJECTS / SLIDER SETTINGS',managerLabel:'MANAGE PROJECTS & SLIDER',managerUrl,fields:{eyebrow:textValue(slider.eyebrow,'SELECTED WORK'),heading:textValue(slider.headline,'Top work.\nMade to move.')}},
    selected_work:{source:'PUBLISHED PROJECTS',managerLabel:'MANAGE PROJECTS',managerUrl,fields:{eyebrow:'SELECTED WORK',heading:'Selected work.\nBuilt with intent.',description:'A focused mix of Amazon, e-commerce, branding, digital, motion and technical work. Each project can become a full case study.',primaryLabel:'VIEW FULL ARCHIVE',primaryUrl:'/work.html'}},
    editorial_modules:{source:'EDITORIAL MODULE SETTINGS / PROJECTS',managerLabel:'MANAGE EDITORIAL MODULE',managerUrl,fields:{eyebrow:textValue(editorial.eyebrow,'EDITORIAL / SELECTED DIRECTIONS'),heading:textValue(editorial.heading,'A more considered way to explore the work.'),description:textValue(editorial.text,'Move through focused collections, disciplines and outcomes without losing the story behind each project.'),primaryLabel:textValue(editorial.primaryLabel,'VIEW ALL WORK'),primaryUrl:textValue(editorial.primaryUrl,'/work.html'),secondaryLabel:textValue(editorial.secondaryLabel,'START A CONVERSATION'),secondaryUrl:textValue(editorial.secondaryUrl,'#contact')}},
    amazon:{source:'SITE MODULES / AMAZON',managerLabel:'OPEN SITE MODULES',managerUrl,fields:{eyebrow:textValue(amazon.eyebrow,'PRIMARY SPECIALIZATION'),heading:textValue(amazon.heading,'AMAZON\n/ E-COMMERCE'),description:textValue(amazon.copy,'I create product-focused visual systems for brands selling on Amazon - from A+ Content and Brand Story to Storefronts, listing images and product infographics.')}},
    capabilities:{source:'CAPABILITIES MANAGER',managerLabel:'MANAGE CAPABILITIES',managerUrl,managedCount:capabilities.length,fields:{eyebrow:'CAPABILITIES',heading:'One creative\nfoundation.',description:'Multiple disciplines, one consistent approach to hierarchy, clarity, craft and detail.'}},
    tools:{source:'SKILLS MANAGER',managerLabel:'MANAGE SKILLS',managerUrl,managedCount:skills.length,fields:{eyebrow:'TOOLS',heading:'The tools\nbehind the work.',description:'Design, motion, digital and technical tools I use to turn ideas into structured visual work.'}},
    statement:{source:'SITE MODULES / STATEMENT',managerLabel:'OPEN SITE MODULES',managerUrl,fields:{eyebrow:textValue(statement.eyebrow,'APPROACH'),heading:textValue(statement.heading,'CREATIVE THINKING.\nTECHNICAL PRECISION.'),description:textValue(statement.description||statement.note,'Design with clarity. Build with structure. Deliver with intent.')}},
    about:{source:'SITE MODULES / ABOUT',managerLabel:'MANAGE ABOUT, CV & SOCIALS',managerUrl,managedCount:socials.length,fields:{eyebrow:textValue(about.eyebrow,'ABOUT'),heading:textValue(about.heading,"A designer with\nan engineer's mindset."),intro:textValue(about.shortIntro,'I create high-impact visual experiences for brands, products and digital platforms - combining design thinking with a structured, detail-driven approach.'),description:textValue(about.longBio,'My work sits between visual communication and problem solving. I care about hierarchy, clarity, consistency and the small details that make a design feel intentional.')}},
    why_me:{source:'HOMEPAGE STUDIO',managerLabel:'EDIT HERE',managerUrl:'#',fields:{eyebrow:'WHY WORK WITH ME',heading:'Creative thinking.\nCommercial clarity.',description:'Design that looks considered, communicates quickly and stays structured from first draft to final delivery.',items:[{title:'CREATIVE THINKING',text:'Visual storytelling built around hierarchy, clarity and a strong point of view.'},{title:'TECHNICAL PRECISION',text:'A structured, detail-driven workflow that keeps complex work accurate and consistent.'},{title:'E-COMMERCE FOCUS',text:'Product visuals designed to communicate benefits fast and support better buying decisions.'}]}},
    clients:{source:'TESTIMONIAL MANAGER',managerLabel:'MANAGE TESTIMONIALS',managerUrl,fields:{eyebrow:'CLIENT NOTES',heading:'Work that leaves\na clear impression.',description:textValue(testimonial.reviewLabel,'CLIENT EXPERIENCES')}},
    contact:{source:'INQUIRY SETTINGS',managerLabel:'MANAGE CONTACT & LEADS',managerUrl,fields:{eyebrow:textValue(inquiry.eyebrow,"LET'S TALK"),heading:textValue(inquiry.heading,'Have a question - or\nan idea to explore?'),description:textValue(inquiry.description,'Share as much or as little as you like. A quick question is welcome, and you do not need a finished brief or confirmed budget.'),primaryLabel:textValue(inquiry.submitLabel,'SEND INQUIRY')}},
  };
}

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
