import { z } from 'zod';
import { db } from './db.js';

export const featureFlagsSchema=z.object({
  productionNavigation:z.boolean().default(false),
  analytics:z.boolean().default(true),
  demoContent:z.boolean().default(false),
  seoAudit:z.boolean().default(true),
  llmsTxt:z.boolean().default(false),
  backupExport:z.boolean().default(true),
  motionIcons:z.boolean().default(true),
  contactForm:z.boolean().default(true),
  emailNotifications:z.boolean().default(true),
  cvDownload:z.boolean().default(true),
  socialLinks:z.boolean().default(true),
  testimonials:z.boolean().default(true),
  journal:z.boolean().default(true),
  projectArchive:z.boolean().default(true)
}).strict();

export type FeatureFlags=z.infer<typeof featureFlagsSchema>;

export const DEFAULT_FEATURE_FLAGS:FeatureFlags={
  productionNavigation:false,
  analytics:true,
  demoContent:process.env.ENABLE_DEMO_CONTENT==='true',
  seoAudit:process.env.SEO_AUDIT_ENABLED!=='false',
  llmsTxt:process.env.LLMS_TXT_ENABLED==='true',
  backupExport:process.env.BACKUP_EXPORT_ENABLED!=='false',
  motionIcons:true,
  contactForm:true,
  emailNotifications:true,
  cvDownload:true,
  socialLinks:true,
  testimonials:true,
  journal:true,
  projectArchive:true
};

export function parseFeatureFlags(value:unknown):FeatureFlags{
  const input=value&&typeof value==='object'&&!Array.isArray(value)?value:{};
  return featureFlagsSchema.parse({...DEFAULT_FEATURE_FLAGS,...input});
}

export async function getFeatureFlags():Promise<FeatureFlags>{
  const settings=await db.siteSettings.findFirst({select:{featureFlags:true}});
  return parseFeatureFlags(settings?.featureFlags);
}

export async function featureEnabled(key:keyof FeatureFlags){
  return (await getFeatureFlags())[key];
}
