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
  assert.match(core,/PAGE_STUDIO_EMERGENCY_DISABLED!=='true'/);
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

test('publish waits for the newest draft save to succeed',()=>{
  const editor=read('portfolio/page-studio.js');
  assert.match(editor,/const saved=await savePage\(false\)/);
  assert.match(editor,/if\(!saved\|\|dirty\)/);
  assert.match(editor,/Publish stopped because the latest draft could not be saved/);
});

test('revision restore preserves live status and unpublish remains explicit',()=>{
  const route=read('src/routes/page-studio.ts');
  const editor=read('portfolio/page-studio.js');
  const restoreRoute=route.slice(route.indexOf("router.post('/pages/:id/revisions/:revisionId/restore'"),route.indexOf('const namedBlocksSchema'));
  assert.doesNotMatch(restoreRoute,/status:'DRAFT'/);
  assert.match(route,/router\.post\('\/pages\/:id\/unpublish'/);
  assert.match(editor,/id='studioUnpublish'|#studioUnpublish/);
});

test('responsive toolbar keeps save, preview and device controls available',()=>{
  const css=read('portfolio/page-studio.css');
  assert.doesNotMatch(css,/\.studio-actions #studioSave\{display:none\}/);
  assert.match(css,/\.studio-actions #studioSave,\.studio-actions #studioPreview\{display:block\}/);
  assert.match(css,/\.studio-devices\{display:flex;order:4/);
});

test('common YouTube share URLs are normalized before trusted-origin validation',()=>{
  const route=read('src/routes/page-studio.ts');
  const renderer=read('portfolio/page-studio-renderer.js');
  assert.match(route,/url\.hostname==='youtu\.be'/);
  assert.match(route,/youtube\.com\/embed/);
  assert.match(renderer,/const embedUrl=/);
  assert.match(renderer,/allowfullscreen/);
});

test('feature controls and production navigation preserve safe fallbacks',()=>{
  const flags=read('src/lib/feature-flags.ts');
  const runtime=read('portfolio/production-navigation.js');
  const admin=read('portfolio/admin-system-controls.js');
  const migration=read('prisma/migrations/0022_feature_control_center/migration.sql');
  assert.match(flags,/productionNavigation:z\.boolean\(\)\.default\(false\)/);
  assert.match(runtime,/if\(!flags\.productionNavigation\|\|!items\.length\)return/);
  assert.match(admin,/hardcoded menu remains the automatic fallback/);
  assert.doesNotMatch(migration,/\b(?:DROP|TRUNCATE|DELETE FROM)\b/i);
});
