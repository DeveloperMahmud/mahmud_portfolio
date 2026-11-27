import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const read=path=>readFile(new URL(`../${path}`,import.meta.url),'utf8');

test('Page Studio registers bounded stable Creative Tool references',async()=>{
  const [schema,editor]=await Promise.all([read('src/lib/page-studio.ts'),read('portfolio/page-studio.js')]);
  for(const type of ['CREATIVE_TOOL_CATALOG','CREATIVE_TOOL_CARD','CREATIVE_TOOL_CTA']){
    assert.match(schema,new RegExp(type));
    assert.match(editor,new RegExp(type));
  }
  assert.match(schema,/canonicalIds:z\.array\(creativeToolReference\)\.max\(100\)/);
  assert.match(schema,/canonicalId:creativeToolReference/);
  assert.match(editor,/function creativeToolReferences/);
  assert.match(editor,/A stable tool reference is saved/);
  assert.match(editor,/data-block-tool-ids/);
  assert.match(editor,/if\(!tool\.canonicalId&&tool\.toolId\)tool\.canonicalId=tool\.toolId/);
  assert.doesNotMatch(schema,/CREATIVE_TOOL_CARD:z\.object\(\{[^}]*title:/s,'blocks must not duplicate canonical tool copy');
});

test('Page Studio dynamic data resolves only eligible published snapshots',async()=>{
  const [resolver,adminRoute,publicRoute]=await Promise.all([
    read('src/lib/page-studio-creative-tools.ts'),
    read('src/routes/page-studio.ts'),
    read('src/routes/page-studio-public.ts')
  ]);
  assert.match(resolver,/status: 'PUBLISHED'/);
  assert.match(resolver,/visible: true/);
  assert.match(resolver,/visibility: \{ in: \['PUBLIC', 'UNLISTED'\] \}/);
  assert.match(resolver,/publishedSnapshot: \{ not: Prisma\.JsonNull \}/);
  assert.match(resolver,/scheduledAt: \{ lte: now \}/);
  assert.match(resolver,/publicCreativeTool\(row\.publishedSnapshot\)/);
  assert.match(resolver,/tool\.visibility === 'PUBLIC'/);
  assert.doesNotMatch(resolver,/draftSnapshot|liveUrlVerifiedAt|select: \{[^}]*title:/s);
  assert.match(adminRoute,/pageStudioCreativeTools\(\)/);
  assert.match(publicRoute,/pageStudioCreativeTools\(now\)/);
  assert.match(adminRoute,/creativeTools/);
  assert.match(publicRoute,/creativeTools/);
});

test('Page Studio renderer handles tool catalog, card and CTA with safe empty states',async()=>{
  const [renderer,css]=await Promise.all([read('portfolio/page-studio-renderer.js'),read('portfolio/page-studio-public.css')]);
  for(const type of ['CREATIVE_TOOL_CATALOG','CREATIVE_TOOL_CARD','CREATIVE_TOOL_CTA'])assert.match(renderer,new RegExp(`case['"]${type}['"]`));
  assert.match(renderer,/creativeToolById/);
  assert.match(renderer,/tool\.canonicalId===reference\|\|tool\.toolId===reference/);
  assert.match(renderer,/\/creative-lab\/\$\{encodeURIComponent\(tool\.publishedSlug\)\}/);
  assert.match(renderer,/No published Creative Lab tools are available/);
  assert.match(renderer,/not published or is not available/);
  assert.match(renderer,/action is not available from a published snapshot/);
  assert.match(css,/\.ps-creative-tool-grid/);
  assert.match(css,/\.ps-creative-tool-card/);
  assert.match(css,/\.ps-creative-tool-cta/);
  assert.match(css,/@media\(max-width:760px\)/);
});
