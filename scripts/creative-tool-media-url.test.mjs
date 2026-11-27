import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const read=path=>readFile(new URL(`../${path}`,import.meta.url),'utf8');

test('live URL verification is explicit, optimistic and independent from draft save',async()=>{
  const [route,schema]=await Promise.all([read('src/routes/creative-tools-admin.ts'),read('src/lib/creative-tools-admin.ts')]);
  assert.match(route,/router\.post\('\/:id\/verify-live-url'/);
  assert.match(route,/verifyPublicHttpsUrl/);
  assert.match(route,/expectedUpdatedAt/);
  assert.match(route,/existing\.liveUrl!==parsed\.data\.liveUrl/);
  assert.match(route,/liveUrlVerifiedAt:verifiedAt/);
  assert.match(route,/TOOL_LIVE_URL_VERIFIED/);
  assert.match(route,/Cache-Control','private, no-store/);
  assert.match(schema,/resetLiveVerification \? \{ liveUrlVerifiedAt: null \}/);
  const patchStart=route.indexOf("router.patch('/:id'");
  const verifyStart=route.indexOf("router.post('/:id/verify-live-url'",patchStart);
  assert.ok(patchStart>=0&&verifyStart>patchStart,'verification must remain a separate endpoint after draft PATCH');
  assert.doesNotMatch(route.slice(patchStart,verifyStart),/verifyPublicHttpsUrl/,'saving a draft must never probe an external URL');
});

test('URL verifier pins public DNS answers and bounds network work',async()=>{
  const source=await read('src/lib/public-url-verification.ts');
  assert.match(source,/url\.protocol!==['"]https:['"]/);
  assert.match(source,/lookup\(host,\{all:true,verbatim:true\}\)/);
  assert.match(source,/addresses\.some\(item=>!publicIp\(item\.address\)\)/);
  assert.match(source,/lookup:\(_host,_options,callback\)=>callback\(null,address\.address,address\.family/);
  assert.match(source,/maxRedirects/);
  assert.match(source,/maxBytes/);
  assert.match(source,/deadline=Date\.now\(\)\+timeoutMs/);
  assert.match(source,/new URL\(result\.location,current\)/);
  assert.match(source,/RESPONSE_TOO_LARGE/);
});

test('Creative Tool media controls reuse the authenticated Media Library without uploading',async()=>{
  const [ui,css]=await Promise.all([read('portfolio/admin-creative-tools.js'),read('portfolio/admin-creative-tools.css')]);
  for(const id of ['creativeToolMediaPicker','creativeToolMediaSearch','creativeToolMediaGrid','creativeToolVerifyLiveUrl'])assert.match(ui,new RegExp(id));
  assert.match(ui,/\/api\/admin\/media\?\$\{params\}/);
  assert.match(ui,/type:'image\/'/);
  assert.match(ui,/Selecting an existing asset does not create another upload or Blob object/);
  assert.doesNotMatch(ui,/\/media\/upload|new XMLHttpRequest/);
  for(const target of ['coverImage','galleryImages','ogImage'])assert.match(ui,new RegExp(`['"]${target}['"]`));
  assert.match(ui,/verify-live-url/);
  assert.match(css,/\.creative-tool-media-picker/);
  assert.match(css,/\.creative-tool-media-grid/);
  assert.match(css,/@media\(max-width:700px\)/);
});
