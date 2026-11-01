import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const read=path=>readFile(new URL(`../${path}`,import.meta.url),'utf8');

test('publishing builds and validates one honest public snapshot',async()=>{
  const source=await read('src/lib/creative-tools.ts');
  assert.match(source,/publicCreativeToolSchema\.safeParse|publicCreativeToolSchema\.parse/);
  assert.match(source,/publishedSlug/);
  assert.match(source,/demoNotice/);
  assert.match(source,/ARCHIVED/);
  assert.match(source,/liveUrlVerifiedAt/);
  assert.match(source,/SLUG_REDIRECT_REQUIRED/);
  for(const behavior of ['AUTO','DEMO','LIVE','DETAILS'])assert.match(source,new RegExp(`['"]${behavior}['"]`));
});

test('publish, unpublish and restore endpoints are explicit and optimistic',async()=>{
  const route=await read('src/routes/creative-tools-admin.ts');
  for(const path of ["/:id/publish","/:id/unpublish","/:id/revisions","/:id/revisions/:revisionId","/:id/revisions/:revisionId/restore"])assert.match(route,new RegExp(path.replaceAll('/','\\/').replaceAll(':','\\:')));
  assert.match(route,/expectedUpdatedAt/);
  assert.match(route,/status\(428\)/);
  assert.match(route,/status\(409\)/);
  assert.match(route,/status\(422\)/);
  assert.match(route,/TOOL_PUBLISHED/);
  assert.match(route,/TOOL_UNPUBLISHED/);
  assert.match(route,/TOOL_REVISION_RESTORED/);
  assert.match(route,/db\.\$transaction|db\['\$transaction'\]/);
  assert.match(route,/preserveCreativeToolSlugRedirect/,'published slug changes must use the bounded P3-005 redirect workflow');
});

test('Creative Tool revisions are versioned draft-only snapshots',async()=>{
  const [admin,revisions]=await Promise.all([read('src/lib/creative-tools-admin.ts'),read('src/lib/revisions.ts')]);
  assert.match(admin,/schemaVersion/);
  assert.match(admin,/CREATIVE_TOOL_DRAFT/);
  assert.match(admin,/fields/);
  const snapshotStart=admin.indexOf('export const creativeToolRevisionSnapshotSchema');
  const snapshotEnd=admin.indexOf('export const creativeToolDetailSelect',snapshotStart);
  assert.ok(snapshotStart>=0&&snapshotEnd>snapshotStart,'revision schema must be independently bounded');
  const snapshotSection=admin.slice(snapshotStart,snapshotEnd);
  for(const protectedField of ['publishedSnapshot','publishedSlug','publishedAt','publicModifiedAt','scheduledAt','deletedAt'])assert.doesNotMatch(snapshotSection,new RegExp(`${protectedField}:`));
  assert.match(revisions,/TransactionClient/);
  assert.match(revisions,/contentRevision\.create/);
  assert.match(revisions,/retentionCount/);
});

test('admin publication UI separates save, publish and revision restore',async()=>{
  const [ui,css]=await Promise.all([read('portfolio/admin-creative-tools.js'),read('portfolio/admin-creative-tools.css')]);
  for(const id of ['creativeToolPublishingSummary','creativeToolPublish','creativeToolUnpublish','creativeToolRevisions','creativeToolRevisionPanel','creativeToolRevisionList'])assert.match(ui,new RegExp(id));
  assert.match(ui,/publicationAction\('publish'\)/);
  assert.match(ui,/publicationAction\('unpublish'\)/);
  assert.match(ui,/restoreRevision/);
  assert.match(ui,/live version will remain unchanged/i);
  assert.match(ui,/state\.permissions\.canRestore/);
  assert.match(css,/\.creative-tool-publishing-summary/);
  assert.match(css,/\.creative-tool-revision-panel/);
  assert.match(css,/@media\(max-width:700px\)/);
});
