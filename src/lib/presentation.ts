import { z } from 'zod';

const internalOrHttps=z.string().trim().max(1000).refine(value=>{
  if(/^\/(?!\/)[^\s]*$/.test(value))return true;
  try{return new URL(value).protocol==='https:'}catch{return false}
},'Use a site-relative path or HTTPS URL.');

const action=z.object({label:z.string().trim().min(1).max(80),url:internalOrHttps}).strict();
const slug=z.string().trim().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);

const modeDefaults={
  recruiter:{
    enabled:false,
    noIndex:true,
    title:'Three-minute recruiter view',
    subtitle:'A concise, guided selection of commercial work, creative systems and professional evidence.',
    durationLabel:'ABOUT 3 MINUTES · PAUSE OR EXPLORE FREELY',
    projectSlugs:[],
    stepLabels:['IDENTITY & POSITION','SPECIALIZATION','FLAGSHIP CASE STUDY','SECOND CASE STUDY','HOW I THINK','CREATIVE SYSTEMS','PROFESSIONAL PROOF','NEXT STEP'],
    primaryAction:{label:'EXPLORE FULL PORTFOLIO',url:'/work.html'},
    secondaryAction:{label:'RECRUITER INQUIRY',url:'/?intent=RECRUITER&sourcePath=/hire/presentation#contact'}
  },
  client:{
    enabled:false,
    noIndex:true,
    title:'Creative studio introduction',
    subtitle:'A focused view of services, relevant work and the collaboration process.',
    durationLabel:'SHORT STUDIO WALKTHROUGH · PAUSE OR EXPLORE FREELY',
    projectSlugs:[],
    stepLabels:['STUDIO POSITION','SERVICES','RELEVANT CASE STUDY','SECOND CASE STUDY','PROCESS','CREATIVE SYSTEMS','CLIENT PROOF','START A PROJECT'],
    primaryAction:{label:'EXPLORE SERVICES',url:'/studio'},
    secondaryAction:{label:'START A PROJECT',url:'/?intent=CLIENT&sourcePath=/studio/presentation#contact'}
  }
};

export const presentationModeSchema=z.object({
  enabled:z.boolean().default(false),
  noIndex:z.boolean().default(true),
  title:z.string().trim().min(1).max(180),
  subtitle:z.string().trim().min(1).max(600),
  durationLabel:z.string().trim().max(120),
  projectSlugs:z.array(slug).max(6),
  stepLabels:z.array(z.string().trim().min(1).max(80)).length(8),
  primaryAction:action,
  secondaryAction:action
}).strict();

export const presentationConfigSchema=z.object({
  recruiter:presentationModeSchema.default(modeDefaults.recruiter),
  client:presentationModeSchema.default(modeDefaults.client)
}).strict();

export type PresentationMode='recruiter'|'client';
export type PresentationConfig=z.infer<typeof presentationConfigSchema>;

export function parsePresentationConfig(value:unknown):PresentationConfig{
  const source=value&&typeof value==='object'&&!Array.isArray(value)?value as Record<string,unknown>:{};
  const parsed=presentationConfigSchema.safeParse(source.presentationConfig);
  return parsed.success?parsed.data:presentationConfigSchema.parse({});
}

export function defaultPresentationConfig():PresentationConfig{
  return presentationConfigSchema.parse({});
}
