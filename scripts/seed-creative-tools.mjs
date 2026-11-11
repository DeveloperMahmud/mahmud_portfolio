import { PrismaClient } from '@prisma/client';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { CREATIVE_TOOLS, CREATIVE_TOOL_SEED_VERSION } from './creative-tools-catalog.mjs';

const CANONICAL_IDS = [...Array(6)].flatMap((_, index) => [`F0${index + 1}`, `M0${index + 1}`]).sort();

export function validateCreativeToolCatalog(items = CREATIVE_TOOLS) {
  const ids = items.map(item => item.canonicalId).sort();
  if (items.length !== 12 || JSON.stringify(ids) !== JSON.stringify(CANONICAL_IDS)) throw new Error('Creative Lab seed must contain exactly F01–F06 and M01–M06.');
  if (items.filter(item => item.kind === 'FLAGSHIP').length !== 6 || items.filter(item => item.kind === 'MINI').length !== 6) throw new Error('Creative Lab seed must contain exactly six flagship and six mini tools.');
  const slugs = new Set();
  for (const item of items) {
    if (slugs.has(item.slug)) throw new Error(`Duplicate Creative Lab slug: ${item.slug}`);
    slugs.add(item.slug);
    if (!item.demoUrl.startsWith(`/creative-lab/${item.slug}/demo`)) throw new Error(`${item.canonicalId} needs its internal demo route.`);
    if (item.liveUrl !== null) throw new Error(`${item.canonicalId} cannot ship with an unverified live URL.`);
    if (item.demoMode !== 'ACTUAL' && !item.demoNotice?.trim()) throw new Error(`${item.canonicalId} needs an honest demo notice.`);
  }
  return items;
}

export function publishedSnapshot(item, now = new Date()) {
  return {
    schemaVersion: 1,
    canonicalId: item.canonicalId,
    publishedSlug: item.publishedSlug,
    kind: item.kind,
    category: item.category,
    tags: item.tags,
    title: item.title,
    subtitle: item.subtitle,
    shortDescription: item.shortDescription,
    overview: item.overview,
    problemStatement: item.problemStatement,
    audience: item.audience,
    featureBullets: item.featureBullets,
    proposedInputs: item.proposedInputs,
    proposedOutputs: item.proposedOutputs,
    limitations: item.limitations,
    iconKey: item.iconKey,
    coverImage: item.coverImage,
    galleryImages: item.galleryImages,
    pageBlocks: item.pageBlocks,
    productStatus: item.productStatus,
    demoMode: item.demoMode,
    demoNotice: item.demoNotice,
    actions: {
      primary: {label:item.primaryLabel, behavior:item.primaryBehavior, target:item.primaryTarget, style:item.primaryStyle, url:item.demoUrl},
      secondary: {label:item.secondaryLabel, behavior:item.secondaryBehavior, target:item.secondaryTarget, style:item.secondaryStyle, url:`/creative-lab/${item.publishedSlug}`}
    },
    demoUrl: item.demoUrl,
    documentationUrl: item.documentationUrl,
    seo: {title:item.seoTitle, description:item.seoDescription, ogImage:item.ogImage, canonicalUrl:item.canonicalUrl, noIndex:item.noIndex, noFollow:item.noFollow, includeSitemap:item.includeSitemap},
    publishedAt: now.toISOString(),
    publicModifiedAt: now.toISOString()
  };
}

export function createData(item, now = new Date()) {
  return {...item, publishedSnapshot:publishedSnapshot(item, now), publishedAt:now, publicModifiedAt:now};
}

export function updateData() {
  return {systemSeeded:true, seedVersion:CREATIVE_TOOL_SEED_VERSION};
}

export async function seedCreativeTools(prisma = new PrismaClient()) {
  const items = validateCreativeToolCatalog();
  try {
    await prisma.$transaction(async tx => {
      for (const item of items) {
        await tx.creativeTool.upsert({where:{canonicalId:item.canonicalId}, create:createData(item), update:updateData()});
      }
    });
    const rows = await prisma.creativeTool.findMany({where:{systemSeeded:true, canonicalId:{in:CANONICAL_IDS}}, select:{canonicalId:true, kind:true}});
    if (rows.length !== 12 || rows.filter(row => row.kind === 'FLAGSHIP').length !== 6 || rows.filter(row => row.kind === 'MINI').length !== 6) throw new Error('Creative Lab seed verification failed.');
    return rows;
  } finally {
    await prisma.$disconnect();
  }
}

const isMain = Boolean(process.argv[1]) && fileURLToPath(import.meta.url) === fileURLToPath(pathToFileURL(process.argv[1]));
if (isMain) seedCreativeTools().then(rows => console.log(`Creative Lab seed complete: ${rows.length} canonical tools.`)).catch(error => { console.error(error); process.exitCode = 1; });
