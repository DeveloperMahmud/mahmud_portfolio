import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const read=path=>readFile(new URL(`../${path}`,import.meta.url),'utf8');

test('Creative Lab manager is authenticated and role bounded',async()=>{
  const [app,rbac,route,admin]=await Promise.all([read('src/app.ts'),read('src/lib/rbac.ts'),read('src/routes/creative-tools-admin.ts'),read('portfolio/admin.js')]);
  const guard=app.indexOf("app.use('/api/admin',requireAuth,enforceAdminAccess)");
  const mount=app.indexOf("app.use('/api/admin/creative-tools',creativeToolsAdmin)");
  assert.ok(guard>=0&&mount>guard,'manager route must sit behind global admin auth and RBAC');
  assert.equal((rbac.match(/\^\\\/creative-tools/g)||[]).length,3,'Editor read/write and Viewer read scopes should be the only Creative Lab grants');
  assert.match(admin,/EDITOR:new Set\(\[[^\]]*'creative-tools'/);
  assert.match(admin,/VIEWER:new Set\(\[[^\]]*'creative-tools'/);
  assert.doesNotMatch(admin,/WRITER:new Set\(\[[^\]]*'creative-tools'/);
  assert.doesNotMatch(admin,/MODERATOR:new Set\(\[[^\]]*'creative-tools'/);
  assert.match(route,/router\.get\('\/'/);
  assert.doesNotMatch(route,/router\.(?:put|delete)\(/,'manager must not expose unplanned replace or delete routes');
  for(const endpoint of ['publish','unpublish','revisions/:revisionId/restore'])assert.match(route,new RegExp(`router\\.post\\('[^']*${endpoint}`));
  assert.match(route,/canPublish: \['ADMIN', 'EDITOR'\]\.includes\(role\)/,'publishing must remain role bounded');
  assert.match(route,/canRestore: \['ADMIN', 'EDITOR'\]\.includes\(role\)/,'revision restore must remain role bounded');
});

test('manager query and DTO are bounded and do not return heavy content',async()=>{
  const route=await read('src/routes/creative-tools-admin.ts');
  assert.match(route,/max\(120\)/);
  assert.match(route,/min\(10\)\.max\(100\)/);
  assert.match(route,/safeParse\(req\.query\)/);
  assert.match(route,/status\(400\)/);
  assert.match(route,/deletedAt: null/);
  for(const filter of ['kind','productStatus','status','visibility','display','featured','category'])assert.match(route,new RegExp(`query\\.${filter}`));
  for(const order of ['ORDER','TITLE_ASC','TITLE_DESC','UPDATED_DESC','UPDATED_ASC'])assert.match(route,new RegExp(`${order}:`));
  const select=route.slice(route.indexOf('const listSelect'),route.indexOf('satisfies Prisma.CreativeToolSelect'));
  for(const heavy of ['publishedSnapshot','pageBlocks','galleryImages','overview','problemStatement','proposedInputs','proposedOutputs','limitations'])assert.doesNotMatch(select,new RegExp(heavy));
  assert.match(route,/Cache-Control', 'private, no-store/);
  assert.match(route,/readOnly: role === 'VIEWER'/);
});

test('admin workspace provides search, filters, pagination and read-only state',async()=>{
  const [ui,css,loader,admin]=await Promise.all([read('portfolio/admin-creative-tools.js'),read('portfolio/admin-creative-tools.css'),read('portfolio/admin-page-studio.js'),read('portfolio/admin.js')]);
  assert.match(loader,/admin-creative-tools\.js/);
  assert.match(loader,/admin-creative-tools\.css/);
  assert.match(admin,/ADMIN_TAB_NAMES=\[[^\]]*'creative-tools'/);
  assert.match(admin,/window\.loadCreativeToolManager/);
  for(const id of ['creativeManagerSearch','creativeManagerKind','creativeManagerProductStatus','creativeManagerStatus','creativeManagerVisibility','creativeManagerDisplay','creativeManagerCategory','creativeManagerSort','creativeManagerPrev','creativeManagerNext'])assert.match(ui,new RegExp(id));
  assert.match(ui,/AbortController/);
  assert.match(ui,/setTimeout\(\(\)=>load\(\{resetPage:true\}\),260\)/);
  assert.match(ui,/VIEWER · READ ONLY/);
  assert.match(ui,/No tools match these filters/);
  assert.doesNotMatch(ui,/method\s*:\s*['"](?:PUT|DELETE)/i);
  assert.match(ui,/method:'POST'/,'explicit publish and restore actions should use guarded POST requests');
  assert.match(ui,/method:'PATCH'/,'editor roles should receive the guarded draft-save control');
  assert.match(css,/@container\(max-width:620px\)/);
  assert.match(css,/@media\(prefers-reduced-motion:reduce\)/);
});
