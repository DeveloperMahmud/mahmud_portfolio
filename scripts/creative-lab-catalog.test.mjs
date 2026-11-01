import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const read = path => readFile(new URL(`../${path}`, import.meta.url), 'utf8');

test('Creative Lab catalog route is explicit before the Page Studio catch-all', async () => {
  const app=await read('src/app.ts'),route=app.indexOf("app.get('/creative-lab'"),catchAll=app.indexOf("app.get('/pages/:slug'");
  assert.ok(route>0&&catchAll>route);
  assert.match(app,/staticSeo\('creative-lab\.html'/);
});

test('public API reads eligible published snapshots and never serializes draft rows', async () => {
  const [routes,helper]=await Promise.all([read('src/routes/public.ts'),read('src/lib/creative-tools.ts')]);
  assert.match(routes,/router\.get\('\/creative-lab'/);
  for(const rule of [/deletedAt:null/,/status:'PUBLISHED'/,/visible:true/,/visibility:'PUBLIC'/,/scheduledAt:\{lte:new Date\(\)\}/,/publishedSnapshot:\{not:Prisma\.JsonNull\}/])assert.match(routes,rule);
  assert.match(routes,/select:\{publishedSnapshot:true\}/);
  assert.match(routes,/publicCreativeTool\(row\.publishedSnapshot\)/);
  assert.match(helper,/publicCreativeToolSchema/);
  assert.match(helper,/productStatus === 'ARCHIVED'/);
});

test('catalog exposes accessible search, filters, loading, empty and error states', async () => {
  const [html,js,css]=await Promise.all([read('portfolio/creative-lab.html'),read('portfolio/creative-lab.js'),read('portfolio/creative-lab.css')]);
  assert.match(html,/aria-label="Filter by tool type"/);
  assert.match(html,/type="search"/);
  assert.match(html,/id="labStatus"/);
  assert.match(html,/aria-live="polite"/);
  assert.match(html,/aria-busy="true"/);
  assert.match(js,/\/api\/public\/creative-lab/);
  assert.match(js,/renderEmptyState/);
  assert.match(js,/setTimeout\(load,220\)/);
  assert.match(css,/@media\(max-width:680px\)/);
  assert.match(css,/:focus-visible/);
  assert.match(css,/@media\(prefers-reduced-motion:reduce\)/);
});
