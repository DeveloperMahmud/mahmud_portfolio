import { z } from 'zod';

export const PAGE_STUDIO_SCHEMA_VERSION=3;
export const PAGE_STUDIO_WIDGET_VERSION=1;
export const PAGE_STUDIO_WIDGETS=['SECTION','COLUMNS','HERO','HEADING','TEXT','RICH_TEXT','BUTTON','IMAGE','GALLERY','VIDEO','CTA','STATS','QUOTE','EDITORIAL_SHOWCASE','COLLECTION_GRID','IMAGE_TEXT_SPLIT','FEATURE_CARDS','TRUST_STRIP','OUTCOME_METRICS','PROCESS_TIMELINE','BEFORE_AFTER','FILTERABLE_PROJECT_GRID','PROJECT_EXPLORER','BENTO_SNAPSHOT','CASE_STORY','SERVICE_PACKAGES','MEDIA_MOSAIC','AVAILABILITY_CTA','TESTIMONIAL_CAROUSEL','PROJECT_GRID','JOURNAL_FEED','BRAND_GRID','CREATIVE_TOOL_CATALOG','CREATIVE_TOOL_CARD','CREATIVE_TOOL_CTA','SOCIAL_LINKS','CV_DOWNLOAD','CONTACT','FAQ','SPACER','DIVIDER','LOTTIE','EMBED','WEBSITE_EMBED','CUSTOM_CODE'] as const;
export type PageStudioWidgetType=typeof PAGE_STUDIO_WIDGETS[number];

const widgetGroups:Record<string,readonly PageStudioWidgetType[]>={
  LAYOUT:['SECTION','COLUMNS','SPACER','DIVIDER'],CONTENT:['HERO','HEADING','TEXT','RICH_TEXT','STATS','QUOTE','OUTCOME_METRICS','PROCESS_TIMELINE','CASE_STORY'],CONVERSION:['BUTTON','CTA','COLLECTION_GRID','FEATURE_CARDS','SERVICE_PACKAGES','AVAILABILITY_CTA','CREATIVE_TOOL_CTA','CONTACT','FAQ'],MEDIA:['IMAGE','GALLERY','VIDEO','BEFORE_AFTER','MEDIA_MOSAIC'],EDITORIAL:['EDITORIAL_SHOWCASE','IMAGE_TEXT_SPLIT','BENTO_SNAPSHOT'],DYNAMIC:['TRUST_STRIP','FILTERABLE_PROJECT_GRID','PROJECT_EXPLORER','TESTIMONIAL_CAROUSEL','PROJECT_GRID','JOURNAL_FEED','BRAND_GRID','CREATIVE_TOOL_CATALOG','CREATIVE_TOOL_CARD','SOCIAL_LINKS','CV_DOWNLOAD'],MOTION:['LOTTIE'],EMBED:['EMBED','WEBSITE_EMBED'],ADVANCED:['CUSTOM_CODE']
};
const widgetLabels:Partial<Record<PageStudioWidgetType,string>>={RICH_TEXT:'Rich text',EDITORIAL_SHOWCASE:'Editorial showcase',COLLECTION_GRID:'Collection grid',IMAGE_TEXT_SPLIT:'Image + text split',FEATURE_CARDS:'Feature cards',TRUST_STRIP:'Trust strip',OUTCOME_METRICS:'Outcome metrics',PROCESS_TIMELINE:'Process timeline',BEFORE_AFTER:'Before / after',FILTERABLE_PROJECT_GRID:'Filterable projects',PROJECT_EXPLORER:'Project explorer',BENTO_SNAPSHOT:'Bento snapshot',CASE_STORY:'Case story',SERVICE_PACKAGES:'Service packages',MEDIA_MOSAIC:'Media mosaic',AVAILABILITY_CTA:'Availability CTA',TESTIMONIAL_CAROUSEL:'Testimonial carousel',PROJECT_GRID:'Project grid',JOURNAL_FEED:'Journal feed',BRAND_GRID:'Brand grid',CREATIVE_TOOL_CATALOG:'Creative Tool catalog',CREATIVE_TOOL_CARD:'Creative Tool card',CREATIVE_TOOL_CTA:'Creative Tool CTA',SOCIAL_LINKS:'Social links',CV_DOWNLOAD:'CV download',WEBSITE_EMBED:'Website embed',CUSTOM_CODE:'HTML / CSS / JS'};
const widgetDescriptions:Partial<Record<PageStudioWidgetType,string>>={SECTION:'A themed container for nested widgets.',COLUMNS:'Responsive nested columns, up to six.',HERO:'Large page introduction and CTA.',HEADING:'Semantic H1-H6 title and eyebrow.',TEXT:'Responsive paragraph or short body copy.',RICH_TEXT:'Readable long-form copy.',BUTTON:'Standalone configurable action button.',IMAGE:'Media Library or external CDN image.',GALLERY:'Multiple images in a responsive grid.',VIDEO:'Hosted video or approved embed.',CTA:'Focused conversion section.',STATS:'Metrics and proof points.',OUTCOME_METRICS:'Reusable proof cards, service outcomes and measurable results.',QUOTE:'Testimonial or statement.',TRUST_STRIP:'Live CMS brand logos in a credibility rail.',PROJECT_EXPLORER:'Image-led project tabs from published work.',TESTIMONIAL_CAROUSEL:'Auto-moving cards from CMS testimonials.',PROJECT_GRID:'Live published projects.',JOURNAL_FEED:'Live published articles.',BRAND_GRID:'Live brand collection.',CREATIVE_TOOL_CATALOG:'Published Creative Lab tools resolved from canonical snapshots.',CREATIVE_TOOL_CARD:'One canonical published Creative Tool reference.',CREATIVE_TOOL_CTA:'Published Creative Tool action without duplicated copy.',SOCIAL_LINKS:'Site Settings social profiles.',CV_DOWNLOAD:'Current CMS-managed CV.',CONTACT:'Friendly inquiry prompt.',LOTTIE:'URL, pasted JSON or local JSON file.',EMBED:'Trusted iframe source.',WEBSITE_EMBED:'Approved external website iframe.',CUSTOM_CODE:'Isolated custom code with network access disabled.'};
export const PAGE_STUDIO_WIDGET_REGISTRY=PAGE_STUDIO_WIDGETS.map(type=>({type,version:PAGE_STUDIO_WIDGET_VERSION,group:Object.entries(widgetGroups).find(([,types])=>types.includes(type))?.[0]||'CONTENT',label:widgetLabels[type]||type.toLowerCase().split('_').map(word=>word[0].toUpperCase()+word.slice(1)).join(' '),description:widgetDescriptions[type]||'Reusable responsive portfolio component.'}));

const jsonRecord=z.record(z.string(),z.unknown()).default({});
const creativeToolCanonicalId=z.enum(['F01','F02','F03','F04','F05','F06','M01','M02','M03','M04','M05','M06']);
const creativeToolBlockData:Partial<Record<PageStudioWidgetType,z.ZodTypeAny>>={
  CREATIVE_TOOL_CATALOG:z.object({canonicalIds:z.array(creativeToolCanonicalId).max(12).refine(ids=>new Set(ids).size===ids.length,'Tool IDs must be unique.'),kind:z.enum(['ALL','FLAGSHIP','MINI']),productStatus:z.enum(['ALL','PLANNED','PREVIEW','BETA','LIVE']),category:z.string().trim().max(120),limit:z.number().int().min(1).max(12),layout:z.enum(['GRID','COMPACT']),showStatus:z.boolean()}).strict(),
  CREATIVE_TOOL_CARD:z.object({canonicalId:creativeToolCanonicalId,layout:z.enum(['CARD','COMPACT','FEATURED']),showDescription:z.boolean(),showStatus:z.boolean()}).strict(),
  CREATIVE_TOOL_CTA:z.object({canonicalId:creativeToolCanonicalId,action:z.enum(['PRIMARY','SECONDARY','DETAILS']),layout:z.enum(['INLINE','PANEL']),showStatus:z.boolean()}).strict()
};
export type StudioBlock={id:string;type:PageStudioWidgetType;widgetVersion:number;enabled:boolean;data:Record<string,unknown>;style:Record<string,unknown>;responsive:Record<string,unknown>;motion:Record<string,unknown>;children:StudioBlock[];globalBlockId?:string|null;globalVersion?:number|null};

export const studioBlockSchema:z.ZodType<StudioBlock>=z.lazy(()=>z.object({
  id:z.string().min(1).max(90),
  type:z.enum(PAGE_STUDIO_WIDGETS),
  widgetVersion:z.number().int().min(1).max(PAGE_STUDIO_WIDGET_VERSION).default(PAGE_STUDIO_WIDGET_VERSION),
  enabled:z.boolean().default(true),
  data:jsonRecord,
  style:jsonRecord,
  responsive:jsonRecord,
  motion:jsonRecord,
  children:z.array(studioBlockSchema).max(80).default([]),
  globalBlockId:z.string().max(90).nullable().optional(),
  globalVersion:z.number().int().positive().nullable().optional()
}).strict().superRefine((block,ctx)=>{
  const schema=creativeToolBlockData[block.type];if(!schema)return;
  const parsed=schema.safeParse(block.data);if(parsed.success)return;
  parsed.error.issues.forEach(issue=>ctx.addIssue({code:'custom',path:['data',...issue.path],message:issue.message}));
}));

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

const reservedRoots=new Set(['api','admin','admin.html','work','work.html','journal','blog.html','share','preview','health','robots.txt','sitemap.xml','llms.txt','page-studio.html','homepage-studio.html','creative-lab','services','hire','studio','resources']);
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
  const content={
    SECTION:{label:'Section',width:'WIDE'},COLUMNS:{columns:2,gap:'MEDIUM'},HERO:{eyebrow:'NEW PAGE',heading:'Build something clear.',text:'Introduce this page with a focused message.',ctaLabel:'START A CONVERSATION',ctaUrl:'/#contact',image:'',imageAlt:''},HEADING:{eyebrow:'',text:'Section heading',level:2},RICH_TEXT:{text:'Add clear, useful copy here.'},IMAGE:{url:'',alt:'',caption:'',sourceType:'MEDIA_LIBRARY'},GALLERY:{items:[]},VIDEO:{url:'',title:'Video'},CTA:{eyebrow:'READY WHEN YOU ARE',heading:'Have a project in mind?',text:'Send a short note and I will get back to you.',label:'START A CONVERSATION',url:'/#contact'},STATS:{items:[{label:'PROJECTS',value:'12+'},{label:'YEARS',value:'5+'}]},QUOTE:{quote:'Design should make the next action feel obvious.',author:''},EDITORIAL_SHOWCASE:{eyebrow:'CURATED COLLECTION',heading:'A more elevated way to explore.',text:'Pair a focused introduction with visual cards.',primaryLabel:'EXPLORE WORK',primaryUrl:'/work.html',items:[{title:'Commerce systems',meta:'AMAZON / E-COMMERCE',image:'',url:'/work.html'},{title:'Brand direction',meta:'IDENTITY / CAMPAIGN',image:'',url:'/work.html'},{title:'Digital experiences',meta:'WEB / PRODUCT',image:'',url:'/work.html'}]},COLLECTION_GRID:{eyebrow:'EXPLORE BY NEED',heading:'Pick a direction. Build the right outcome.',text:'Use these cards as a clear path into services or collections.',items:[{title:'Amazon growth',text:'A+ Content, storefronts and listing systems.',url:'/work.html'},{title:'Brand systems',text:'Identity, campaigns and launch assets.',url:'/work.html'},{title:'Digital launches',text:'Landing pages and product experiences.',url:'/work.html'},{title:'Motion stories',text:'Product films and social content.',url:'/work.html'}]},TESTIMONIAL_CAROUSEL:{heading:'Client notes',auto:true,interval:5},PROJECT_GRID:{heading:'Selected work',category:'',limit:6},JOURNAL_FEED:{heading:'Latest journal',limit:3},BRAND_GRID:{heading:'Selected brands'},SOCIAL_LINKS:{heading:'Find me online'},CV_DOWNLOAD:{label:'DOWNLOAD CV'},CONTACT:{heading:'Have a question or project in mind?',text:'Share the essentials. A short message is enough.'},FAQ:{items:[{question:'What can we build together?',answer:'Add your answer here.'}]},SPACER:{size:64},DIVIDER:{},LOTTIE:{url:'',fallback:'→',label:'Animated icon',trigger:'AUTOPLAY',loop:'true',speed:1,size:96},EMBED:{url:'',title:'Embedded content',height:560},
    CREATIVE_TOOL_CATALOG:{canonicalIds:[],kind:'ALL',productStatus:'ALL',category:'',limit:6,layout:'GRID',showStatus:true},CREATIVE_TOOL_CARD:{canonicalId:'F01',layout:'CARD',showDescription:true,showStatus:true},CREATIVE_TOOL_CTA:{canonicalId:'F01',action:'PRIMARY',layout:'PANEL',showStatus:true},
    WEBSITE_EMBED:{url:'',title:'External website',height:640,fallbackLabel:'OPEN WEBSITE'},
    CUSTOM_CODE:{html:'<div class="custom-card"><h2>Custom block</h2><p>Add isolated HTML and CSS.</p></div>',css:'.custom-card { padding: 32px; background: #101310; color: #f6f7f2; border: 1px solid #30352f; }',height:320},
  } as unknown as Record<PageStudioWidgetType,Record<string,unknown>>;
  content.TEXT={text:'Add clear, useful copy here.',size:'MEDIUM',maxWidth:760};
  content.BUTTON={label:'LEARN MORE',url:'#',variant:'PRIMARY',size:'MEDIUM',newTab:false};
  content.IMAGE_TEXT_SPLIT={eyebrow:'FEATURED STORY',heading:'Pair a strong visual with a clear message.',text:'Use this section for a service, case study or campaign story.',image:'',imageAlt:'',label:'EXPLORE',url:'/work.html',imageSide:'RIGHT'};
  content.FEATURE_CARDS={eyebrow:'WHAT I DO',heading:'Creative systems built for real outcomes.',columns:3,items:[{title:'Strategy',text:'A clear direction before production begins.',url:'#'},{title:'Design',text:'A flexible visual system across every touchpoint.',url:'#'},{title:'Delivery',text:'Production-ready assets and a clean handoff.',url:'#'}]};
  content.TRUST_STRIP={heading:'Selected clients and collaborators',mode:'MARQUEE',speed:28,grayscale:'true'};
  content.OUTCOME_METRICS={eyebrow:'OUTCOMES',heading:'Useful proof, clearly presented.',items:[{value:'12+',label:'PROJECT SYSTEMS',detail:'Replace with a verified metric.'},{value:'4',label:'FOCUSED DISCIPLINES',detail:'Commerce, brand, web and motion.'},{value:'1',label:'CLEAR PROCESS',detail:'One connected creative system.'}]};
  content.PROCESS_TIMELINE={eyebrow:'PROCESS',heading:'A focused path from idea to delivery.',items:[{number:'01',title:'Align',text:'Clarify the goal, audience and useful outcome.'},{number:'02',title:'Create',text:'Build and review the strongest direction.'},{number:'03',title:'Deliver',text:'Prepare a clear, production-ready handoff.'}]};
  content.BEFORE_AFTER={beforeImage:'',beforeAlt:'Before state',beforeLabel:'BEFORE',afterImage:'',afterAlt:'After state',afterLabel:'AFTER',heading:'See the transformation',start:50};
  content.FILTERABLE_PROJECT_GRID={heading:'Explore selected work',limit:12};
  content.PROJECT_EXPLORER={eyebrow:'SELECTED WORK',heading:'Explore the work.',limit:5,auto:'false',interval:6};
  content.BENTO_SNAPSHOT={eyebrow:'AT A GLANCE',heading:'Creative direction with practical delivery.',availability:'AVAILABLE FOR SELECT PROJECTS',location:'DHAKA / REMOTE',emailLabel:'START A CONVERSATION',items:[{label:'FOCUS',value:'AMAZON / BRAND / WEB'},{label:'WORKFLOW',value:'STRATEGY TO HANDOFF'},{label:'OUTPUT',value:'REUSABLE SYSTEMS'}]};
  content.CASE_STORY={eyebrow:'CASE STORY',heading:'The thinking behind the work.',items:[{number:'01',title:'Brief',text:'Define the audience, constraint and useful outcome.'},{number:'02',title:'Decision',text:'Explain the creative choice that shaped the system.'},{number:'03',title:'Delivery',text:'Show what was handed over and how it can grow.'}]};
  content.SERVICE_PACKAGES={eyebrow:'WAYS TO WORK TOGETHER',heading:'Choose the right starting point.',items:[{title:'Focused project',text:'A defined outcome with a clear scope.',features:'Direction\nDesign\nProduction handoff',ctaLabel:'ASK ABOUT THIS',url:'/#contact'},{title:'Creative system',text:'A connected set of reusable assets.',features:'Audit\nCore system\nTemplates',ctaLabel:'START A CONVERSATION',url:'/#contact'}]};
  content.MEDIA_MOSAIC={eyebrow:'VISUAL STORY',heading:'A flexible editorial gallery.',items:[]};
  content.AVAILABILITY_CTA={status:'AVAILABLE FOR SELECT PROJECTS',heading:'Have a question or early idea?',text:'A short note is enough to begin.',label:'START A CONVERSATION',url:'/#contact'};
  content.DIVIDER={style:'SOLID',width:100};
  content.LOTTIE={...content.LOTTIE,animationData:null};
  content.CUSTOM_CODE={...content.CUSTOM_CODE,html:'<div class="custom-card"><h2>Custom block</h2><p>Add isolated HTML, CSS and JavaScript.</p></div>',js:''};
  return {id,type,widgetVersion:PAGE_STUDIO_WIDGET_VERSION,enabled:true,data:content[type],style:{theme:'DEFAULT',align:'LEFT',padding:'MEDIUM',marginTop:0,marginBottom:0,paddingX:0,paddingY:0,borderWidth:0,borderRadius:0,borderColor:'',backgroundColor:'',textColor:'',customClass:'',customCss:''},responsive:{hideDesktop:false,hideTablet:false,hideMobile:false},motion:{enabled:false},children:[]};
}

function presetBlock(type:PageStudioWidgetType,id:string,visual:'NEON_GRID'|'SIGNAL_BENTO'|'CASE_FILE'|'SOFT_FUTURE',data:Record<string,unknown>={}){
  const block=defaultBlock(type,id),styles={NEON_GRID:{customClass:'ps-theme-neon'},SIGNAL_BENTO:{customClass:'ps-theme-signal',borderRadius:24},CASE_FILE:{customClass:'ps-theme-case-file'},SOFT_FUTURE:{customClass:'ps-theme-soft',backgroundColor:'#f1f0eb',textColor:'#111714',borderRadius:24}}[visual];
  return {...block,data:{...block.data,...data,visualStyle:visual},style:{...block.style,...styles}};
}

function technicalCaseStudyBlock(id:string,evidenceKey:string,heading:string,prompt:string){
  const block=defaultBlock('RICH_TEXT',id);
  return {...block,data:{...block.data,evidenceKey,text:`## ${heading}\n\nEvidence required: ${prompt}`}};
}

export const DEFAULT_PAGE_TEMPLATES=[
  {name:'Blank page',slug:'blank',category:'GENERAL',description:'An empty canvas.',blocks:[]},
  {name:'Service page',slug:'service-page',category:'SERVICES',description:'Hero, service story, selected work and inquiry CTA.',blocks:[defaultBlock('HERO','template-service-hero'),defaultBlock('RICH_TEXT','template-service-copy'),defaultBlock('PROJECT_GRID','template-service-work'),defaultBlock('CTA','template-service-cta')]},
  {name:'Landing page',slug:'landing-page',category:'LANDING',description:'Focused campaign page with minimal distractions.',blocks:[defaultBlock('HERO','template-landing-hero'),defaultBlock('STATS','template-landing-stats'),defaultBlock('IMAGE','template-landing-image'),defaultBlock('CTA','template-landing-cta')]},
  {name:'Resource page',slug:'resource-page',category:'RESOURCES',description:'Long-form resource with a clear download or inquiry action.',blocks:[defaultBlock('HERO','template-resource-hero'),defaultBlock('RICH_TEXT','template-resource-copy'),defaultBlock('FAQ','template-resource-faq'),defaultBlock('CTA','template-resource-cta')]},
  {name:'Editorial portfolio',slug:'editorial-portfolio',category:'PORTFOLIO',description:'Editorial story, selected projects, proof and a focused CTA.',blocks:[defaultBlock('HERO','template-editorial-hero'),defaultBlock('EDITORIAL_SHOWCASE','template-editorial-showcase'),defaultBlock('PROJECT_GRID','template-editorial-projects'),defaultBlock('TESTIMONIAL_CAROUSEL','template-editorial-testimonials'),defaultBlock('CTA','template-editorial-cta')]},
  {name:'Collection landing',slug:'collection-landing',category:'LANDING',description:'A visual collection page with cards, split story and social proof.',blocks:[defaultBlock('HERO','template-collection-hero'),defaultBlock('COLLECTION_GRID','template-collection-grid'),defaultBlock('IMAGE_TEXT_SPLIT','template-collection-split'),defaultBlock('FEATURE_CARDS','template-collection-features'),defaultBlock('CTA','template-collection-cta')]},
  {name:'Creator profile',slug:'creator-profile',category:'PROFILE',description:'About-led profile with services, social links and contact.',blocks:[defaultBlock('HERO','template-profile-hero'),defaultBlock('IMAGE_TEXT_SPLIT','template-profile-split'),defaultBlock('FEATURE_CARDS','template-profile-features'),defaultBlock('SOCIAL_LINKS','template-profile-socials'),defaultBlock('CONTACT','template-profile-contact')]},
  {name:'Case study',slug:'case-study',category:'PORTFOLIO',description:'A clear project narrative with context, proof, supporting visuals and a next-step CTA.',blocks:[defaultBlock('HERO','template-case-hero'),defaultBlock('STATS','template-case-stats'),defaultBlock('IMAGE_TEXT_SPLIT','template-case-story'),defaultBlock('GALLERY','template-case-gallery'),defaultBlock('QUOTE','template-case-quote'),defaultBlock('PROJECT_GRID','template-case-related'),defaultBlock('CTA','template-case-cta')]},
  {name:'Page Studio technical case study',slug:'page-studio-technical-case-study',category:'PORTFOLIO',description:'Draft-only evidence framework for documenting Page Studio architecture, workflow, QA, security and individual contribution.',blocks:[
    {...defaultBlock('HERO','template-page-studio-case-hero'),data:{...defaultBlock('HERO','template-page-studio-case-hero').data,eyebrow:'TECHNICAL CASE STUDY',heading:'Building a Modular Page Studio for a Personal Creative Portfolio',text:'Evidence required: replace this draft introduction with an accurate summary of the implemented system.',ctaLabel:'',ctaUrl:''}},
    technicalCaseStudyBlock('template-page-studio-case-motivation','motivation','01 / Motivation','Explain the real problem, intended users and why the existing system needed this work.'),
    technicalCaseStudyBlock('template-page-studio-case-constraints','constraints','02 / Constraints','Document the actual hosting, free-tier, compatibility, privacy and maintenance constraints.'),
    technicalCaseStudyBlock('template-page-studio-case-architecture','architecture','03 / Architecture','Describe only the implemented routes, storage model, rendering boundaries and publishing gates.'),
    technicalCaseStudyBlock('template-page-studio-case-components','component-library','04 / Component library','List the real reusable widgets, design tokens and editor controls that can be inspected.'),
    technicalCaseStudyBlock('template-page-studio-case-workflow','creation-workflow','05 / Creation workflow','Show the verified draft, preview, revision and publish workflow without exposing private data.'),
    technicalCaseStudyBlock('template-page-studio-case-qa','qa-reliability','06 / QA and reliability','Record only tests that were actually run, their scope and any remaining limitations.'),
    technicalCaseStudyBlock('template-page-studio-case-accessibility','accessibility','07 / Accessibility','Document verified keyboard, semantic, responsive and reduced-motion behaviour.'),
    technicalCaseStudyBlock('template-page-studio-case-security','security','08 / Security','Explain implemented isolation, permissions and publish-safety controls without including secrets.'),
    technicalCaseStudyBlock('template-page-studio-case-lessons','lessons-tradeoffs','09 / Lessons and trade-offs','Describe concrete decisions, limitations and what would be improved next.'),
    technicalCaseStudyBlock('template-page-studio-case-contribution','individual-contribution','10 / Individual contribution','State the work personally completed and avoid claiming unverified team or client outcomes.'),
    {...defaultBlock('MEDIA_MOSAIC','template-page-studio-case-evidence'),data:{...defaultBlock('MEDIA_MOSAIC','template-page-studio-case-evidence').data,eyebrow:'AUTHORIZED EVIDENCE',heading:'Screenshots, diagrams and inspectable output',items:[]}},
    {...defaultBlock('AVAILABILITY_CTA','template-page-studio-case-cta'),data:{...defaultBlock('AVAILABILITY_CTA','template-page-studio-case-cta').data,status:'CASE STUDY DRAFT',heading:'Continue to the portfolio',text:'Publish only after every evidence section has been replaced with verified information.',label:'VIEW SELECTED WORK',url:'/work.html'}}
  ]},
  {name:'Project inquiry',slug:'project-inquiry',category:'LEADS',description:'A concise conversion page that gives prospective clients confidence before they contact you.',blocks:[defaultBlock('HERO','template-inquiry-hero'),defaultBlock('FEATURE_CARDS','template-inquiry-process'),defaultBlock('FAQ','template-inquiry-faq'),defaultBlock('CONTACT','template-inquiry-contact'),defaultBlock('SOCIAL_LINKS','template-inquiry-socials')]},
  {name:'Proof & testimonials',slug:'proof-testimonials',category:'TRUST',description:'Social proof, measurable outcomes, selected work and a low-friction contact CTA.',blocks:[defaultBlock('HERO','template-proof-hero'),defaultBlock('STATS','template-proof-stats'),defaultBlock('TESTIMONIAL_CAROUSEL','template-proof-testimonials'),defaultBlock('BRAND_GRID','template-proof-brands'),defaultBlock('PROJECT_GRID','template-proof-projects'),defaultBlock('CTA','template-proof-cta')]},
  {name:'About & availability',slug:'about-availability',category:'PROFILE',description:'A polished personal introduction with capabilities, CV access, social profiles and contact.',blocks:[defaultBlock('HERO','template-about-hero'),defaultBlock('IMAGE_TEXT_SPLIT','template-about-story'),defaultBlock('FEATURE_CARDS','template-about-capabilities'),defaultBlock('CV_DOWNLOAD','template-about-cv'),defaultBlock('SOCIAL_LINKS','template-about-socials'),defaultBlock('CONTACT','template-about-contact')]},
  {name:'FAQ & support',slug:'faq-support',category:'RESOURCES',description:'Answer common questions clearly, then guide visitors to the right next action.',blocks:[defaultBlock('HERO','template-faq-hero'),defaultBlock('RICH_TEXT','template-faq-intro'),defaultBlock('FAQ','template-faq-list'),defaultBlock('CONTACT','template-faq-contact')]},
  {name:'Amazon A+ service',slug:'amazon-a-plus-service',category:'SPECIALIST',description:'A conversion-focused Amazon service page with process, proof and packages.',blocks:[defaultBlock('HERO','template-amazon-hero'),defaultBlock('TRUST_STRIP','template-amazon-trust'),defaultBlock('OUTCOME_METRICS','template-amazon-outcomes'),defaultBlock('PROCESS_TIMELINE','template-amazon-process'),defaultBlock('SERVICE_PACKAGES','template-amazon-packages'),defaultBlock('FILTERABLE_PROJECT_GRID','template-amazon-work'),defaultBlock('AVAILABILITY_CTA','template-amazon-cta')]},
  {name:'Amazon storefront',slug:'amazon-storefront',category:'SPECIALIST',description:'An editorial storefront story with comparison and project proof.',blocks:[defaultBlock('HERO','template-storefront-hero'),defaultBlock('EDITORIAL_SHOWCASE','template-storefront-editorial'),defaultBlock('BEFORE_AFTER','template-storefront-compare'),defaultBlock('MEDIA_MOSAIC','template-storefront-mosaic'),defaultBlock('TESTIMONIAL_CAROUSEL','template-storefront-testimonials'),defaultBlock('AVAILABILITY_CTA','template-storefront-cta')]},
  {name:'Brand identity service',slug:'brand-identity-service',category:'SPECIALIST',description:'Identity process, visual story, packages and client proof.',blocks:[defaultBlock('HERO','template-brand-hero'),defaultBlock('TRUST_STRIP','template-brand-trust'),defaultBlock('PROCESS_TIMELINE','template-brand-process'),defaultBlock('MEDIA_MOSAIC','template-brand-mosaic'),defaultBlock('SERVICE_PACKAGES','template-brand-packages'),defaultBlock('TESTIMONIAL_CAROUSEL','template-brand-testimonials'),defaultBlock('AVAILABILITY_CTA','template-brand-cta')]},
  {name:'Web & UI service',slug:'web-ui-service',category:'SPECIALIST',description:'Product-led page with outcomes, process and filterable work.',blocks:[defaultBlock('HERO','template-web-hero'),defaultBlock('OUTCOME_METRICS','template-web-outcomes'),defaultBlock('PROCESS_TIMELINE','template-web-process'),defaultBlock('FILTERABLE_PROJECT_GRID','template-web-work'),defaultBlock('SERVICE_PACKAGES','template-web-packages'),defaultBlock('AVAILABILITY_CTA','template-web-cta')]},
  {name:'Motion design service',slug:'motion-design-service',category:'SPECIALIST',description:'A media-led service page for motion, launch and social work.',blocks:[defaultBlock('HERO','template-motion-hero'),defaultBlock('MEDIA_MOSAIC','template-motion-mosaic'),defaultBlock('PROCESS_TIMELINE','template-motion-process'),defaultBlock('FILTERABLE_PROJECT_GRID','template-motion-work'),defaultBlock('TESTIMONIAL_CAROUSEL','template-motion-testimonials'),defaultBlock('AVAILABILITY_CTA','template-motion-cta')]},
  {name:'Campaign launch',slug:'campaign-launch',category:'LANDING',description:'A compact launch page with proof, packages and one clear action.',blocks:[defaultBlock('HERO','template-campaign-hero'),defaultBlock('TRUST_STRIP','template-campaign-trust'),defaultBlock('OUTCOME_METRICS','template-campaign-outcomes'),defaultBlock('FEATURE_CARDS','template-campaign-features'),defaultBlock('SERVICE_PACKAGES','template-campaign-packages'),defaultBlock('AVAILABILITY_CTA','template-campaign-cta')]},
  {name:'Interactive portfolio',slug:'interactive-portfolio',category:'PORTFOLIO',description:'A Framer-inspired portfolio flow with an at-a-glance bento, project explorer, outcomes and case-story blocks.',blocks:[defaultBlock('HERO','template-interactive-hero'),defaultBlock('BENTO_SNAPSHOT','template-interactive-bento'),defaultBlock('TRUST_STRIP','template-interactive-trust'),defaultBlock('PROJECT_EXPLORER','template-interactive-explorer'),defaultBlock('OUTCOME_METRICS','template-interactive-outcomes'),defaultBlock('CASE_STORY','template-interactive-story'),defaultBlock('AVAILABILITY_CTA','template-interactive-cta')]},
  {name:'Neon Grid Portfolio',slug:'neon-grid-portfolio',category:'FUTURISTIC',description:'Technical dark grid, luminous accents and an interactive project sequence without heavy graphics.',blocks:[presetBlock('HERO','template-neon-hero','NEON_GRID',{eyebrow:'CREATIVE SYSTEM / 01',heading:'Design with signal.\nBuild with precision.'}),presetBlock('BENTO_SNAPSHOT','template-neon-bento','NEON_GRID'),presetBlock('TRUST_STRIP','template-neon-trust','NEON_GRID',{mode:'MARQUEE'}),presetBlock('PROJECT_EXPLORER','template-neon-explorer','NEON_GRID',{auto:'true'}),presetBlock('OUTCOME_METRICS','template-neon-outcomes','NEON_GRID'),presetBlock('PROCESS_TIMELINE','template-neon-process','NEON_GRID'),presetBlock('AVAILABILITY_CTA','template-neon-cta','NEON_GRID')]},
  {name:'Signal Bento',slug:'signal-bento',category:'FUTURISTIC',description:'A compact card-led portfolio overview focused on services, proof and availability.',blocks:[presetBlock('HERO','template-signal-hero','SIGNAL_BENTO',{eyebrow:'INDEPENDENT CREATIVE',heading:'Clear work.\nUseful outcomes.'}),presetBlock('BENTO_SNAPSHOT','template-signal-bento','SIGNAL_BENTO'),presetBlock('FEATURE_CARDS','template-signal-services','SIGNAL_BENTO'),presetBlock('PROJECT_EXPLORER','template-signal-work','SIGNAL_BENTO'),presetBlock('TESTIMONIAL_CAROUSEL','template-signal-testimonials','SIGNAL_BENTO'),presetBlock('SOCIAL_LINKS','template-signal-socials','SIGNAL_BENTO'),presetBlock('AVAILABILITY_CTA','template-signal-cta','SIGNAL_BENTO')]},
  {name:'Case File Editorial',slug:'case-file-editorial',category:'FUTURISTIC',description:'Numbered case narratives, measured outcomes and an editorial evidence-first structure.',blocks:[presetBlock('HERO','template-file-hero','CASE_FILE',{eyebrow:'CASE FILE / SELECTED WORK',heading:'Proof, not promises.'}),presetBlock('PROJECT_EXPLORER','template-file-explorer','CASE_FILE'),presetBlock('CASE_STORY','template-file-story','CASE_FILE'),presetBlock('OUTCOME_METRICS','template-file-metrics','CASE_FILE'),presetBlock('BEFORE_AFTER','template-file-compare','CASE_FILE'),presetBlock('TESTIMONIAL_CAROUSEL','template-file-testimonials','CASE_FILE'),presetBlock('AVAILABILITY_CTA','template-file-cta','CASE_FILE')]},
  {name:'Soft Future',slug:'soft-future',category:'FUTURISTIC',description:'Bright editorial surfaces, restrained green accents and softly rounded responsive cards.',blocks:[presetBlock('HERO','template-soft-hero','SOFT_FUTURE',{eyebrow:'DESIGN / DIRECTION / DELIVERY',heading:'A calmer future\nfor ambitious work.'}),presetBlock('TRUST_STRIP','template-soft-trust','SOFT_FUTURE',{mode:'MARQUEE'}),presetBlock('BENTO_SNAPSHOT','template-soft-bento','SOFT_FUTURE'),presetBlock('PROJECT_EXPLORER','template-soft-explorer','SOFT_FUTURE'),presetBlock('CASE_STORY','template-soft-story','SOFT_FUTURE'),presetBlock('TESTIMONIAL_CAROUSEL','template-soft-testimonials','SOFT_FUTURE'),presetBlock('FAQ','template-soft-faq','SOFT_FUTURE'),presetBlock('AVAILABILITY_CTA','template-soft-cta','SOFT_FUTURE')]}
];

export function slugify(value:string){return value.toLowerCase().normalize('NFKD').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,80)}
function migrateBlockValue(value:unknown):unknown{
  if(!value||typeof value!=='object'||Array.isArray(value))return value;
  const block=value as Record<string,unknown>;
  return {...block,widgetVersion:Number(block.widgetVersion)||PAGE_STUDIO_WIDGET_VERSION,data:block.data&&typeof block.data==='object'&&!Array.isArray(block.data)?block.data:{},style:block.style&&typeof block.style==='object'&&!Array.isArray(block.style)?block.style:{},responsive:block.responsive&&typeof block.responsive==='object'&&!Array.isArray(block.responsive)?block.responsive:{},motion:block.motion&&typeof block.motion==='object'&&!Array.isArray(block.motion)?block.motion:{},children:Array.isArray(block.children)?block.children.map(migrateBlockValue):[]};
}
export function migrateStudioBlocks(value:unknown){return studioBlocksSchema.parse(Array.isArray(value)?value.map(migrateBlockValue):value)}
export function cloneBlocks(value:unknown){return JSON.parse(JSON.stringify(migrateStudioBlocks(value))) as StudioBlock[]}

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
