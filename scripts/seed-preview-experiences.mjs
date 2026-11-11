import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PREVIEW_EXPERIENCE_SEED_VERSION, previewPresentationConfig, publishedTechnicalCaseStudy, technicalCaseStudy } from './preview-experiences.mjs';

const asRecord = value => value && typeof value === 'object' && !Array.isArray(value) ? value : {};

export async function seedPreviewExperiences(prisma = new PrismaClient(), releaseDeployment = ['preview', 'production'].includes(process.env.VERCEL_ENV || '')) {
  if (!releaseDeployment) {
    console.log('skip portfolio experience activation: only Vercel Preview and owner-authorized Production deployments are eligible');
    await prisma.$disconnect();
    return { skipped: true };
  }

  try {
    let settings = await prisma.siteSettings.findFirst();
    if (!settings) settings = await prisma.siteSettings.create({ data: {} });
    const about = asRecord(settings.aboutConfig);
    const pageStudio = asRecord(settings.pageStudioConfig);
    const alreadyConfigured = Number(about.previewExperienceSeedVersion || 0) >= PREVIEW_EXPERIENCE_SEED_VERSION;

    if (!alreadyConfigured) {
      await prisma.siteSettings.update({
        where: { id: settings.id },
        data: {
          aboutConfig: { ...about, presentationConfig: previewPresentationConfig, previewExperienceSeedVersion: PREVIEW_EXPERIENCE_SEED_VERSION },
          pageStudioConfig: { ...pageStudio, publicEnabled: true },
        },
      });
      console.log('activate recruiter/client presentations and public Page Studio for this release environment');
    } else {
      console.log('preserve presentation and Page Studio settings: seed already applied');
    }

    const existing = await prisma.customPage.findUnique({ where: { slug: technicalCaseStudy.slug } });
    if (!existing) {
      const now = new Date();
      const snapshot = publishedTechnicalCaseStudy(now);
      await prisma.customPage.create({
        data: {
          ...technicalCaseStudy,
          status: 'PUBLISHED',
          visibility: 'PUBLIC',
          blocks: technicalCaseStudy.blocks,
          noIndex: false,
          noFollow: false,
          includeSitemap: true,
          publishedPath: technicalCaseStudy.path,
          publishedSnapshot: snapshot,
          publishedAt: now,
          publicModifiedAt: now,
        },
      });
      console.log(`create ${technicalCaseStudy.slug}: PUBLISHED`);
    } else {
      console.log(`preserve ${technicalCaseStudy.slug}: an existing CMS record was found`);
    }

    return { skipped: false, settingsUpdated: !alreadyConfigured, pageCreated: !existing };
  } finally {
    await prisma.$disconnect();
  }
}

seedPreviewExperiences().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
