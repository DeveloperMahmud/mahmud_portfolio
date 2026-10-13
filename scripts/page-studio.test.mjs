import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const read=file=>fs.readFileSync(new URL(`../${file}`,import.meta.url),'utf8');

test('Page Studio migration is additive and preserves existing data',()=>{
  const sql=read('prisma/migrations/0021_page_studio/migration.sql');
  assert.match(sql,/ADD COLUMN "pageStudioConfig"/);
  assert.match(sql,/CREATE TABLE "CustomPage"/);
  assert.match(sql,/"publishedSnapshot" JSONB/);
  assert.doesNotMatch(sql,/\b(?:DROP|TRUNCATE|DELETE FROM)\b/i);
});

test('public delivery has two independent activation gates',()=>{
  const core=read('src/lib/page-studio.ts');
  const route=read('src/routes/page-studio-public.ts');
  assert.match(core,/PAGE_STUDIO_ENABLED==='true'/);
  assert.match(core,/publicEnabled:false/);
  assert.match(route,/pageStudioSystemEnabled\(\).*config\.publicEnabled/);
});

test('draft saves cannot bypass the explicit publish endpoint',()=>{
  const route=read('src/routes/page-studio.ts');
  assert.match(route,/status:existing\.status/);
  assert.match(route,/publishedSnapshot/);
  assert.match(route,/router\.post\('\/pages\/:id\/publish'/);
  assert.match(route,/retentionCount:studioConfig\.maxRevisions/);
});

test('builder reuses media and page saves do not write Blob objects',()=>{
  const route=read('src/routes/page-studio.ts');
  const editor=read('portfolio/page-studio.js');
  assert.match(route,/blobWritesOnPageSave:0/);
  assert.match(route,/db\.media\.findMany/);
  assert.match(editor,/openMediaPicker/);
  assert.doesNotMatch(route,/\bput\(|uploadStored|BLOB_READ_WRITE_TOKEN/);
});

test('embeds and editor preview retain isolation controls',()=>{
  const renderer=read('portfolio/page-studio-renderer.js');
  const route=read('src/routes/page-studio.ts');
  assert.match(renderer,/sandbox="allow-scripts allow-same-origin allow-forms allow-popups"/);
  assert.match(route,/Trusted Embed Sources/);
  assert.match(renderer,/event\.dataTransfer\.getData\('application\/x-page-studio-widget'\)/);
});

test('custom pages keep analytics, SEO, backup and media maintenance coverage',()=>{
  const html=read('portfolio/custom-page.html');
  const app=read('src/app.ts');
  const operations=read('src/routes/operations.ts');
  assert.match(html,/\/analytics\.js/);
  assert.match(app,/publicStudioEnabled/);
  assert.match(operations,/customPages/);
  assert.match(operations,/publishedSnapshot:row\.publishedSnapshot/);
});
