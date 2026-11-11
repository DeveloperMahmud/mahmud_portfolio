import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
const read=path=>readFile(new URL(`../${path}`,import.meta.url),'utf8');

test('review schema separates immutable versions, access, comments and decisions',async()=>{
  const schema=await read('prisma/schema.prisma');
  for(const model of ['ReviewWorkspace','ReviewVersion','ReviewAccessToken','ReviewComment','ReviewDecision'])assert.match(schema,new RegExp(`model ${model}`));
  assert.match(schema,/@@unique\(\[workspaceId, version\]\)/);
  assert.match(schema,/tokenHash\s+String\s+@unique/);
  assert.match(schema,/expiresAt\s+DateTime/);
  assert.match(schema,/revokedAt\s+DateTime\?/);
});

test('raw token is exchanged for a strict HttpOnly scoped session',async()=>{
  const [access,route,client]=await Promise.all([read('src/lib/review-access.ts'),read('src/routes/public-reviews.ts'),read('portfolio/creative-review.js')]);
  assert.match(access,/httpOnly:true/);assert.match(access,/sameSite:'strict'/);assert.match(access,/path:'\/api\/public\/reviews'/);
  assert.match(route,/tokenHash:hashReviewToken/);assert.match(route,/revokedAt:null/);assert.match(route,/expiresAt:\{gt:new Date\(\)\}/);
  assert.match(client,/location\.hash\.slice\(1\)/);assert.match(client,/history\.replaceState\(null,'',location\.pathname\)/);
});

test('public DTO is redacted and decisions bind to an existing workspace version',async()=>{
  const route=await read('src/routes/public-reviews.ts');
  assert.match(route,/select:\{id:true,title:true,status:true,updatedAt:true,versions:/);
  assert.doesNotMatch(route,/select:\{[^}]*tokenHash:true/);
  assert.match(route,/id:parsed\.data\.versionId,workspaceId:access\.token\.workspaceId/);
  assert.match(route,/canDecide/);assert.match(route,/canComment/);
});

test('review delivery is public-media-only and public routes set privacy headers',async()=>{
  const [admin,publicRoute,app]=await Promise.all([read('src/routes/review-workspaces.ts'),read('src/routes/public-reviews.ts'),read('src/app.ts')]);
  assert.match(admin,/media\.visibility!=='PUBLIC'/);
  assert.match(admin,/Confidential delivery is not enabled/);
  assert.match(publicRoute,/Cache-Control':'private, no-store/);
  assert.match(publicRoute,/X-Robots-Tag':'noindex,nofollow,noarchive/);
  assert.match(app,/\/api\/public\/reviews',rateLimit/);
  assert.match(app,/Content-Security-Policy/);
});
