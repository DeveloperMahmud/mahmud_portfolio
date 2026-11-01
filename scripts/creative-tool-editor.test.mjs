import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const read=path=>readFile(new URL(`../${path}`,import.meta.url),'utf8');

test('draft editor is authenticated, role bounded and never publishes implicitly',async()=>{
  const [app,route,rbac]=await Promise.all([read('src/app.ts'),read('src/routes/creative-tools-admin.ts'),read('src/lib/rbac.ts')]);
  assert.ok(app.indexOf("app.use('/api/admin',requireAuth,enforceAdminAccess)")<app.indexOf("app.use('/api/admin/creative-tools',creativeToolsAdmin)"));
  assert.match(route,/router\.get\('\/:id'/);
  assert.match(route,/router\.patch\('\/:id'/);
  assert.match(rbac,/const editorWriteScopes=\[[\s\S]*\^\\\/creative-tools/);
  assert.match(route,/canPublish: \['ADMIN', 'EDITOR'\]\.includes\(role\)/g);
  const patchStart=route.indexOf("router.patch('/:id'");
  const patchEnd=route.indexOf("router.post('/:id/publish'",patchStart);
  assert.ok(patchStart>=0&&patchEnd>patchStart,'draft PATCH must remain independently bounded from publication routes');
  const patch=route.slice(patchStart,patchEnd);
  for(const protectedField of ['publishedSnapshot','publishedSlug','publishedAt','publicModifiedAt','status:'])assert.doesNotMatch(patch,new RegExp(protectedField));
});

test('server validates every editable field and prevents lost updates',async()=>{
  const [schema,route]=await Promise.all([read('src/lib/creative-tools-admin.ts'),read('src/routes/creative-tools-admin.ts')]);
  const draftStart=schema.indexOf('export const creativeToolDraftPatchSchema');
  const draftEnd=schema.indexOf('export const creativeToolDraftFieldsSchema',draftStart);
  assert.ok(draftStart>=0&&draftEnd>draftStart,'draft patch schema must remain independently bounded');
  const draftSchema=schema.slice(draftStart,draftEnd);
  for(const field of ['title','slug','category','tags','overview','problemStatement','audience','featureBullets','proposedInputs','proposedOutputs','limitations','iconKey','coverImage','galleryImages','productStatus','demoMode','demoNotice','visibility','visible','featured','sortOrder','demoUrl','liveUrl','documentationUrl','primaryLabel','primaryBehavior','secondaryLabel','secondaryBehavior','seoTitle','seoDescription','ogImage','canonicalUrl','noIndex','noFollow','includeSitemap'])assert.match(draftSchema,new RegExp(`${field}:`));
  for(const forbidden of ['canonicalId: z','systemSeeded: z','seedVersion: z','kind: z','publishedSnapshot: z','publishedSlug: z','status: z','pageBlocks: z'])assert.doesNotMatch(draftSchema,new RegExp(forbidden));
  assert.match(schema,/Use a public HTTPS URL without credentials or a fragment/);
  assert.match(route,/status\(428\)/);
  assert.match(route,/EXPECTED_VERSION_REQUIRED/);
  assert.match(route,/updatedAt: expectedUpdatedAt/);
  assert.match(route,/status\(409\)/);
  assert.match(route,/EDIT_CONFLICT/);
  assert.match(route,/SLUG_CONFLICT/);
  assert.match(route,/TOOL_DRAFT_UPDATED/);
  assert.match(schema,/liveUrlVerifiedAt: null/);
});

test('admin editor exposes complete draft controls and friendly conflict-safe save UX',async()=>{
  const [ui,css]=await Promise.all([read('portfolio/admin-creative-tools.js'),read('portfolio/admin-creative-tools.css')]);
  for(const id of ['creativeToolEditor','creativeToolEditorForm','creativeToolEditorFields','creativeToolEditorNotice','creativeToolEditorSave'])assert.match(ui,new RegExp(id));
  for(const group of ['Identity & summary','Structured content','Media & destinations','Presentation & status','Buttons','Search visibility'])assert.match(ui,new RegExp(group.replace('&','\\&')));
  assert.match(ui,/expectedUpdatedAt:state\.editing\.updatedAt/);
  assert.match(ui,/method:'PATCH'/);
  assert.match(ui,/Public content is unchanged/);
  assert.match(ui,/published snapshot protected/);
  assert.match(ui,/data\.issues\?\.fieldErrors/);
  assert.match(css,/\.creative-tool-editor-fields\{[^}]*overflow-y:auto/);
  assert.match(css,/@media\(max-width:700px\)/);
  assert.match(css,/@media\(prefers-reduced-motion:reduce\)/);
});
