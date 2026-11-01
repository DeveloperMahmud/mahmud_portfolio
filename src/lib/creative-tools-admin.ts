import { Prisma } from '@prisma/client';
import { z } from 'zod';
import { buildCreativeToolPublicSnapshot, publicCreativeTool } from './creative-tools.js';

const slugSchema = z.string().trim().min(1).max(160).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Use a lowercase, hyphen-separated slug.');

const internalPathOrHttps = z.string().trim().max(1000).refine(value => {
  if (/^\/(?!\/)[a-z0-9][a-z0-9\-_/]*(?:[?#][^\s]*)?$/i.test(value)) return true;
  try {
    const url = new URL(value);
    return url.protocol === 'https:' && !url.username && !url.password;
  } catch {
    return false;
  }
}, 'Use an internal path or HTTPS URL without embedded credentials.');

export const publicHttpsUrlSchema = z.string().trim().max(1000).refine(value => {
  try {
    const url = new URL(value);
    if (url.protocol !== 'https:' || url.username || url.password || url.hash) return false;
    const host = url.hostname.toLowerCase().replace(/^\[|\]$/g, '');
    if (host === 'localhost' || host === '::1' || host.endsWith('.localhost') || host.endsWith('.local')) return false;
    const octets = host.split('.').map(Number);
    if (octets.length === 4 && octets.every(value => Number.isInteger(value) && value >= 0 && value <= 255)) {
      const [a, b] = octets;
      if (a === 0 || a === 10 || a === 127 || a >= 224 || (a === 169 && b === 254) || (a === 172 && b >= 16 && b <= 31) || (a === 192 && b === 168)) return false;
    }
    return true;
  } catch {
    return false;
  }
}, 'Use a public HTTPS URL without credentials or a fragment.');

const nullableText = (max: number) => z.string().trim().max(max).nullable().optional();
const nullableInternalUrl = internalPathOrHttps.nullable().optional();
const nullableExternalUrl = publicHttpsUrlSchema.nullable().optional();
const shortList = (maxItems: number, maxLength: number) => z.array(z.string().trim().min(1).max(maxLength)).max(maxItems).optional();

export const creativeToolDraftPatchSchema = z.object({
  expectedUpdatedAt: z.string().datetime(),
  slug: slugSchema.optional(),
  category: z.string().trim().min(1).max(120).optional(),
  tags: shortList(20, 60),
  title: z.string().trim().min(1).max(180).optional(),
  subtitle: nullableText(300),
  shortDescription: nullableText(600),
  overview: nullableText(4000),
  problemStatement: nullableText(1500),
  audience: shortList(20, 160),
  featureBullets: shortList(30, 300),
  proposedInputs: shortList(30, 300),
  proposedOutputs: shortList(30, 300),
  limitations: shortList(30, 500),
  iconKey: nullableText(80),
  coverImage: nullableInternalUrl,
  galleryImages: z.array(z.object({
    url: internalPathOrHttps,
    alt: z.string().trim().max(240).default('')
  }).strict()).max(30).optional(),
  productStatus: z.enum(['PLANNED', 'PREVIEW', 'BETA', 'LIVE', 'ARCHIVED']).optional(),
  demoMode: z.enum(['CONCEPT', 'SAMPLE_INTERACTIVE', 'ACTUAL']).optional(),
  demoNotice: nullableText(600),
  visibility: z.enum(['PUBLIC', 'UNLISTED', 'PRIVATE']).optional(),
  visible: z.boolean().optional(),
  featured: z.boolean().optional(),
  sortOrder: z.number().int().min(-100000).max(100000).optional(),
  demoUrl: nullableInternalUrl,
  liveUrl: nullableExternalUrl,
  documentationUrl: nullableInternalUrl,
  primaryLabel: nullableText(100),
  primaryBehavior: z.enum(['AUTO', 'DEMO', 'LIVE', 'DETAILS']).optional(),
  primaryTarget: z.enum(['SAME_TAB', 'NEW_TAB']).optional(),
  primaryStyle: nullableText(40),
  secondaryLabel: nullableText(100),
  secondaryBehavior: z.enum(['AUTO', 'DEMO', 'LIVE', 'DETAILS']).nullable().optional(),
  secondaryUrl: nullableInternalUrl,
  secondaryTarget: z.enum(['SAME_TAB', 'NEW_TAB']).optional(),
  secondaryStyle: nullableText(40),
  seoTitle: nullableText(180),
  seoDescription: nullableText(500),
  ogImage: nullableInternalUrl,
  canonicalUrl: nullableExternalUrl,
  noIndex: z.boolean().optional(),
  noFollow: z.boolean().optional(),
  includeSitemap: z.boolean().optional()
}).strict().refine(value => Object.keys(value).some(key => key !== 'expectedUpdatedAt'), {
  message: 'Provide at least one draft field to update.'
});

export const creativeToolDraftFieldsSchema = creativeToolDraftPatchSchema.omit({ expectedUpdatedAt: true });
export const creativeToolRevisionSnapshotSchema = z.object({
  schemaVersion: z.literal(1),
  resource: z.literal('CREATIVE_TOOL_DRAFT'),
  canonicalId: z.string().nullable(),
  kind: z.enum(['FLAGSHIP', 'MINI']),
  fields: creativeToolDraftFieldsSchema
}).strict();

export const creativeToolDetailSelect = {
  id: true,
  canonicalId: true,
  systemSeeded: true,
  seedVersion: true,
  slug: true,
  publishedSlug: true,
  kind: true,
  category: true,
  tags: true,
  title: true,
  subtitle: true,
  shortDescription: true,
  overview: true,
  problemStatement: true,
  audience: true,
  featureBullets: true,
  proposedInputs: true,
  proposedOutputs: true,
  limitations: true,
  iconKey: true,
  coverImage: true,
  galleryImages: true,
  pageBlocks: true,
  productStatus: true,
  demoMode: true,
  demoNotice: true,
  visibility: true,
  visible: true,
  featured: true,
  sortOrder: true,
  demoUrl: true,
  liveUrl: true,
  documentationUrl: true,
  liveUrlVerifiedAt: true,
  primaryLabel: true,
  primaryBehavior: true,
  primaryTarget: true,
  primaryStyle: true,
  secondaryLabel: true,
  secondaryBehavior: true,
  secondaryUrl: true,
  secondaryTarget: true,
  secondaryStyle: true,
  status: true,
  publishedSnapshot: true,
  publishedAt: true,
  scheduledAt: true,
  publicModifiedAt: true,
  seoTitle: true,
  seoDescription: true,
  ogImage: true,
  canonicalUrl: true,
  noIndex: true,
  noFollow: true,
  includeSitemap: true,
  createdAt: true,
  updatedAt: true
} satisfies Prisma.CreativeToolSelect;

export type CreativeToolDetail = Prisma.CreativeToolGetPayload<{select: typeof creativeToolDetailSelect}>;

export function creativeToolAdminDto(tool: CreativeToolDetail) {
  const { pageBlocks: _pageBlocks, publishedSnapshot: rawPublishedSnapshot, ...safeTool } = tool;
  const published=publicCreativeTool(rawPublishedSnapshot);
  const rebuilt=published?buildCreativeToolPublicSnapshot(tool as unknown as Record<string,unknown>,new Date(published.publicModifiedAt)).snapshot:null;
  const comparable=(value:typeof published)=>value?JSON.stringify({...value,publishedAt:undefined,publicModifiedAt:undefined}):null;
  const hasUnpublishedChanges=!published||!rebuilt||comparable(published)!==comparable(rebuilt);
  return {
    ...safeTool,
    hasPublishedSnapshot: Boolean(tool.publishedSlug && tool.publishedAt),
    hasUnpublishedChanges,
    immutable: {
      canonicalId: tool.canonicalId,
      systemSeeded: tool.systemSeeded,
      seedVersion: tool.seedVersion,
      kind: tool.kind
    },
    publishing: {
      hasPublishedSnapshot: Boolean(tool.publishedSlug && tool.publishedAt),
      publishedSlug: tool.publishedSlug,
      publishedAt: tool.publishedAt,
      publicModifiedAt: tool.publicModifiedAt
    }
  };
}

export function creativeToolRevisionSnapshot(tool: CreativeToolDetail) {
  const fields:Record<string,unknown>={};
  for(const key of Object.keys(creativeToolDraftFieldsSchema.shape))fields[key]=(tool as unknown as Record<string,unknown>)[key];
  return creativeToolRevisionSnapshotSchema.parse({schemaVersion:1,resource:'CREATIVE_TOOL_DRAFT',canonicalId:tool.canonicalId,kind:tool.kind,fields});
}

export function creativeToolDraftData(input: z.infer<typeof creativeToolDraftPatchSchema>, resetLiveVerification: boolean): Prisma.CreativeToolUpdateManyMutationInput {
  const { expectedUpdatedAt: _expectedUpdatedAt, galleryImages, ...fields } = input;
  return {
    ...fields,
    ...(galleryImages === undefined ? {} : { galleryImages: galleryImages as Prisma.InputJsonValue }),
    ...(resetLiveVerification ? { liveUrlVerifiedAt: null } : {})
  };
}
