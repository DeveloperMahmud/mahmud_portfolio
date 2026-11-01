import { Prisma } from '@prisma/client';
import { db } from './db.js';
import { publicCreativeTool, type PublicCreativeTool } from './creative-tools.js';

export type PageStudioCreativeTool = PublicCreativeTool & { visibility: 'PUBLIC' | 'UNLISTED' };

export async function pageStudioCreativeTools(now = new Date()) {
  const rows = await db.creativeTool.findMany({
    where: {
      deletedAt: null,
      status: 'PUBLISHED',
      visible: true,
      visibility: { in: ['PUBLIC', 'UNLISTED'] },
      publishedSnapshot: { not: Prisma.JsonNull },
      OR: [{ scheduledAt: null }, { scheduledAt: { lte: now } }]
    },
    orderBy: [{ featured: 'desc' }, { sortOrder: 'asc' }, { title: 'asc' }],
    select: { visibility: true, publishedSnapshot: true }
  });

  const references: PageStudioCreativeTool[] = [];
  for (const row of rows) {
    const snapshot = publicCreativeTool(row.publishedSnapshot);
    if (!snapshot || snapshot.productStatus === 'ARCHIVED') continue;
    references.push({ ...snapshot, visibility: row.visibility as 'PUBLIC' | 'UNLISTED' });
  }
  return {
    catalog: references.filter(tool => tool.visibility === 'PUBLIC'),
    references
  };
}
