import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { behanceCaseStudies } from './behance-case-studies.mjs';

const db = new PrismaClient();
const isPreviewDeployment = process.env.VERCEL_ENV === 'preview';
const isProductionDeployment = process.env.VERCEL_ENV === 'production';
const publish = process.env.PUBLISH_BEHANCE_CASE_STUDIES === 'true' || isPreviewDeployment;

let created = 0;
let skipped = 0;

try {
  if (isProductionDeployment) {
    console.log('skip Behance case studies: production deployments require a separate owner-approved release');
  }

  for (const entry of isProductionDeployment ? [] : behanceCaseStudies) {
    const { resultMetrics, ...project } = entry.project;
    const existing = await db.project.findUnique({ where: { slug: project.slug } });

    if (existing) {
      skipped += 1;
      console.log(`skip ${project.slug}: an existing CMS record was preserved`);
      continue;
    }

    const status = publish ? 'PUBLISHED' : 'DRAFT';
    await db.project.create({
      data: {
        ...project,
        status,
        publicModifiedAt: status === 'PUBLISHED' ? new Date() : null,
        gallery: project.gallery,
        credits: project.credits,
        projectBlocks: project.projectBlocks,
        resultMetrics: { create: resultMetrics },
      },
    });
    created += 1;
    console.log(`create ${project.slug}: ${status}`);
  }

  console.log(`Behance case studies complete: ${created} created, ${skipped} preserved`);
} finally {
  await db.$disconnect();
}
