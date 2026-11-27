import { Prisma } from '@prisma/client';
import { db } from './db.js';
import { publishedCreativeTool, type PublicCreativeTool } from './creative-tools.js';

export type PageStudioCreativeTool = PublicCreativeTool & { visibility: 'PUBLIC' | 'UNLISTED' };

export async function pageStudioCreativeTools(now = new Date()) {
  const rows = await db.creativeTool.findMany({
    where: {
      deletedAt: null,
      status: 'PUBLISHED',
      publishedSnapshot: { not: Prisma.JsonNull }
    },
    select: { visibility: true, visible: true, scheduledAt: true, publishedSnapshot: true }
  });

  const references: PageStudioCreativeTool[] = [];
  for (const row of rows) {
    const published = publishedCreativeTool(row.publishedSnapshot,row,now);
    if (!published?.eligible || !['PUBLIC','UNLISTED'].includes(published.visibility)) continue;
    references.push({ ...published.tool, visibility: published.visibility as 'PUBLIC' | 'UNLISTED' });
  }
  references.sort((a,b)=>Number(Boolean(b.featured))-Number(Boolean(a.featured))+(Number(a.sortOrder||0)-Number(b.sortOrder||0))||a.title.localeCompare(b.title));
  return {
    catalog: references.filter(tool => tool.visibility === 'PUBLIC'),
    references
  };
}
