import { z } from 'zod';

const internalOrHttps=z.string().max(1000).refine(value=>{
  if(/^\/(?!\/)[^\s]*$/.test(value))return true;
  try{return new URL(value).protocol==='https:'}catch{return false}
},'Use a site-relative path or HTTPS URL.');

const action=z.object({label:z.string().trim().min(1).max(80),url:internalOrHttps}).strict();
const stableId=z.string().trim().regex(/^[a-z0-9-]{1,60}$/);
const service=z.object({serviceId:stableId,title:z.string().trim().min(1).max(160),summary:z.string().trim().min(1).max(700),deliverables:z.array(z.string().trim().min(1).max(120)).max(10),sortOrder:z.number().int().min(0).max(1000),isPublished:z.boolean()}).strict();
const processStep=z.object({stepId:stableId,title:z.string().trim().min(1).max(120),summary:z.string().trim().min(1).max(500),sortOrder:z.number().int().min(0).max(1000),isPublished:z.boolean()}).strict();
const faq=z.object({faqId:stableId,question:z.string().trim().min(1).max(240),answer:z.string().trim().min(1).max(1200),sortOrder:z.number().int().min(0).max(1000),isPublished:z.boolean()}).strict();

export const defaultStudioServices=[
  {serviceId:'amazon-commerce',title:'Amazon & e-commerce creative',summary:'Clear listing visuals, A+ modules and campaign assets built around product benefits and marketplace context.',deliverables:['Listing image systems','A+ content direction','Campaign creative'],sortOrder:0,isPublished:true},
  {serviceId:'brand-systems',title:'Brand visual systems',summary:'Flexible identity and campaign systems that keep growing content recognizable, consistent and practical to use.',deliverables:['Visual direction','Campaign systems','Reusable brand assets'],sortOrder:1,isPublished:true},
  {serviceId:'digital-experiences',title:'Digital experiences',summary:'Focused landing pages and portfolio experiences that connect strong hierarchy with clear conversion paths.',deliverables:['Landing-page design','Content hierarchy','Responsive UI direction'],sortOrder:2,isPublished:true}
];

export const defaultStudioProcess=[
  {stepId:'align',title:'Align',summary:'Clarify the audience, business goal, required deliverables and evidence before production begins.',sortOrder:0,isPublished:true},
  {stepId:'design',title:'Design',summary:'Build the core direction and reusable system, then review the decisions in context.',sortOrder:1,isPublished:true},
  {stepId:'refine',title:'Refine',summary:'Use focused feedback rounds to improve clarity, consistency and production readiness.',sortOrder:2,isPublished:true},
  {stepId:'handoff',title:'Handoff',summary:'Deliver organized final assets with clear formats, versions and next-use guidance.',sortOrder:3,isPublished:true}
];

export const studioServiceRoutes=[
  {slug:'amazon-ecommerce',serviceId:'amazon-commerce',seoTitle:'Amazon & E-commerce Creative Services',seoDescription:'Amazon listing visuals, A+ content direction and e-commerce campaign creative built around clear product benefits.',keywords:['amazon','e-commerce','ecommerce','commerce','listing','a+','marketplace']},
  {slug:'brand-systems',serviceId:'brand-systems',seoTitle:'Brand Visual Systems',seoDescription:'Flexible brand identity, campaign and reusable visual systems for growing products and creative teams.',keywords:['brand','branding','identity','campaign','packaging']},
  {slug:'digital-experiences',serviceId:'digital-experiences',seoTitle:'Digital Experience Design',seoDescription:'Focused landing pages and responsive digital experiences with clear hierarchy and conversion paths.',keywords:['digital','web','website','landing','ui','ux','experience']}
] as const;

export type StudioServiceRoute=(typeof studioServiceRoutes)[number];

export function studioServiceRoute(slug:string):StudioServiceRoute|undefined{
  return studioServiceRoutes.find(item=>item.slug===slug);
}

export function projectMatchesStudioService(project:Record<string,unknown>,route:StudioServiceRoute):boolean{
  const haystack=[project.service,project.category,project.type,project.title,project.description]
    .filter(value=>typeof value==='string').join(' ').toLowerCase();
  return route.keywords.some(keyword=>haystack.includes(keyword));
}

export const studioConfigSchema=z.object({
  eyebrow:z.string().trim().min(1).max(100).default('CLIENT / STUDIO MODE'),
  headline:z.string().trim().min(1).max(260).default('Visual systems that help products sell clearly.'),
  introduction:z.string().trim().min(1).max(900).default('Independent creative support for Amazon sellers, e-commerce brands and agencies.'),
  scopeNoteTitle:z.string().trim().max(160).default('Focused scope. Clear handoff.'),
  scopeNote:z.string().trim().max(600).default('Every engagement starts with the business need, audience and deliverables.'),
  featuredProjectSlugs:z.array(z.string().trim().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)).max(6).default([]),
  selectedTestimonialIds:z.array(z.string().trim().min(1).max(120)).max(6).default([]),
  services:z.array(service).max(10).default(defaultStudioServices),
  processSteps:z.array(processStep).max(8).default(defaultStudioProcess),
  faqs:z.array(faq).max(12).default([]),
  primaryAction:action.default({label:'START A PROJECT',url:'/#contact'}),
  secondaryAction:action.default({label:'VIEW RELEVANT WORK',url:'/work.html'}),
  bookingAction:action.nullable().default(null)
}).strict();

export type StudioConfig=z.infer<typeof studioConfigSchema>;

export function parseStudioConfig(value:unknown):StudioConfig{
  const source=value&&typeof value==='object'&&!Array.isArray(value)?value as Record<string,unknown>:{};
  const parsed=studioConfigSchema.safeParse(source.studioConfig);
  return parsed.success?parsed.data:studioConfigSchema.parse({});
}
