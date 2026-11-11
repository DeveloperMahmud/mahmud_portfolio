import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const read=path=>readFile(new URL(`../${path}`,import.meta.url),'utf8');

test('Creative Tool slug redirects are created only during explicit publish',async()=>{
  const route=await read('src/routes/creative-tools-admin.ts');
  const patchStart=route.indexOf("router.patch('/:id'");
  const verifyStart=route.indexOf("router.post('/:id/verify-live-url'",patchStart);
  const publishStart=route.indexOf("router.post('/:id/publish'",verifyStart);
  const unpublishStart=route.indexOf("router.post('/:id/unpublish'",publishStart);
  assert.ok(patchStart>=0&&verifyStart>patchStart&&publishStart>verifyStart&&unpublishStart>publishStart);
  assert.doesNotMatch(route.slice(patchStart,verifyStart),/preserveCreativeToolSlugRedirect|redirectRule/,'draft saves must not create public redirects');
  const publish=route.slice(publishStart,unpublishStart);
  assert.match(publish,/preserveCreativeToolSlugRedirect/);
  assert.match(publish,/previousPublishedSlug:existing\.publishedSlug/);
  assert.match(publish,/nextPublishedSlug:existing\.slug/);
  assert.match(publish,/TOOL_SLUG_REDIRECT_CREATED/);
  assert.match(publish,/TransactionIsolationLevel\.Serializable/);
  assert.match(publish,/PUBLISH_RETRY_REQUIRED/);
});

test('redirect helper fails closed on claims, loops and chain conflicts',async()=>{
  const source=await read('src/lib/creative-tool-redirect.ts');
  assert.match(source,/^const slugPattern/m);
  assert.match(source,/SLUG_PATH_CONFLICT/);
  assert.match(source,/REDIRECT_SOURCE_CONFLICT/);
  assert.match(source,/REDIRECT_CHAIN_CONFLICT/);
  assert.match(source,/sourcePath === destination|previous === next/);
  assert.match(source,/rule\.sourcePath === destination/,'new canonical destination must be checked as a redirect source');
  assert.match(source,/sourcePath\.startsWith\('\/creative-lab\/'\)/,'only Creative Lab aliases may be flattened');
  assert.match(source,/non-Creative-Lab redirect targets the previous public path/);
});

test('repeated slug changes flatten historical aliases to one canonical hop',async()=>{
  const source=await read('src/lib/creative-tool-redirect.ts');
  assert.match(source,/const aliases = new Set<string>/);
  assert.match(source,/pending = \[sourcePath\]/);
  assert.match(source,/candidate => candidate\.destination === target/);
  assert.match(source,/redirectRule\.updateMany/);
  assert.match(source,/data: \{ destination \}/);
  assert.match(source,/flattenedCount/);
  assert.match(source,/statusCode: 301/);
});

test('public redirect middleware runs before Creative Lab canonical routes',async()=>{
  const app=await read('src/app.ts');
  const redirect=app.indexOf('db.redirectRule.findUnique');
  const catalog=app.indexOf("app.get('/creative-lab'");
  const detail=app.indexOf("app.get('/creative-lab/:slug'");
  assert.ok(redirect>=0&&catalog>redirect&&detail>redirect,'old paths must be redirected before canonical route rendering');
});
