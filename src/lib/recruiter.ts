import { z } from 'zod';

const internalOrHttps=z.string().max(1000).refine(value=>{
  if(/^\/(?!\/)[^\s]*$/.test(value))return true;
  try{return new URL(value).protocol==='https:'}catch{return false}
},'Use a site-relative path or HTTPS URL.');

const action=z.object({label:z.string().trim().min(1).max(80),url:internalOrHttps}).strict();
const experience=z.object({role:z.string().trim().min(1).max(160),company:z.string().trim().min(1).max(160),start:z.string().trim().max(60),end:z.string().trim().max(60),summary:z.string().trim().max(700),verified:z.boolean()}).strict();
const pillar=z.object({pillarId:z.string().trim().regex(/^[a-z0-9-]{1,60}$/),title:z.string().trim().min(1).max(160),summary:z.string().trim().max(700),evidenceProjectSlugs:z.array(z.string().trim().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)).max(8),toolIds:z.array(z.string().regex(/^[FM]0[1-6]$/)).max(8),sortOrder:z.number().int().min(0).max(1000),isPublished:z.boolean()}).strict();

export const recruiterConfigSchema=z.object({
  roleTitle:z.string().trim().min(1).max(160).default('Visual & E-commerce Designer'),
  headline:z.string().trim().min(1).max(240).default('Commercial design. Structured thinking.'),
  introduction:z.string().trim().min(1).max(900).default('A focused view of commercial design work, creative systems and production-ready visual communication.'),
  availabilityStatement:z.string().trim().max(500).default(''),
  featuredProjectSlugs:z.array(z.string().trim().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)).max(6).default([]),
  skills:z.array(z.string().trim().min(1).max(100)).max(24).default([]),
  experience:z.array(experience).max(12).default([]),
  evidencePillars:z.array(pillar).max(8).default([]),
  primaryAction:action.default({label:'EXPLORE SELECTED WORK',url:'/work.html'}),
  contactAction:action.default({label:'RECRUITER INQUIRY',url:'/#contact'})
}).strict();

export type RecruiterConfig=z.infer<typeof recruiterConfigSchema>;

export function parseRecruiterConfig(value:unknown):RecruiterConfig{
  const source=value&&typeof value==='object'&&!Array.isArray(value)?value as Record<string,unknown>:{};
  const parsed=recruiterConfigSchema.safeParse(source.recruiterConfig);
  return parsed.success?parsed.data:recruiterConfigSchema.parse({});
}
