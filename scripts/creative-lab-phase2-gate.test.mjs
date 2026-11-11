import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import vm from 'node:vm';
import { CREATIVE_TOOLS } from './creative-tools-catalog.mjs';

const read=path=>readFile(new URL(`../${path}`,import.meta.url),'utf8');
const expectedIds=['F01','F02','F03','F04','F05','F06','M01','M02','M03','M04','M05','M06'];

test('all twelve canonical tools have unique honest public demo contracts',()=>{
  assert.equal(CREATIVE_TOOLS.length,12);
  assert.deepEqual(CREATIVE_TOOLS.map(tool=>tool.canonicalId),expectedIds);
  assert.equal(new Set(CREATIVE_TOOLS.map(tool=>tool.slug)).size,12);
  assert.equal(CREATIVE_TOOLS.filter(tool=>tool.kind==='FLAGSHIP').length,6);
  assert.equal(CREATIVE_TOOLS.filter(tool=>tool.kind==='MINI').length,6);
  for(const tool of CREATIVE_TOOLS){
    assert.equal(tool.status,'PUBLISHED',tool.canonicalId);
    assert.equal(tool.visibility,'PUBLIC',tool.canonicalId);
    assert.equal(tool.visible,true,tool.canonicalId);
    assert.equal(tool.productStatus,'PREVIEW',tool.canonicalId);
    assert.equal(tool.primaryBehavior,'DEMO',tool.canonicalId);
    assert.equal(tool.liveUrl,null,tool.canonicalId);
    assert.equal(tool.demoUrl,`/creative-lab/${tool.slug}/demo`,tool.canonicalId);
    assert.ok(tool.demoNotice.includes('does not run a production analysis'),tool.canonicalId);
    assert.ok(tool.limitations.length>0,tool.canonicalId);
  }
});

test('catalog, detail and demo routes are explicit and draft-safe',async()=>{
  const [app,publicRoute,helper,detail]=await Promise.all([read('src/app.ts'),read('src/routes/public.ts'),read('src/lib/creative-tools.ts'),read('portfolio/creative-tool.js')]);
  assert.match(app,/app\.get\('\/creative-lab'/);
  assert.match(app,/app\.get\('\/creative-lab\/:slug'/);
  assert.match(app,/app\.get\('\/creative-lab\/:slug\/demo'/);
  assert.ok(app.indexOf("app.get('/creative-lab/:slug/demo'")<app.indexOf("app.get('/pages/:slug'"));
  for(const rule of [/deletedAt:null/,/status:'PUBLISHED'/,/visible:true/,/visibility:'PUBLIC'/,/publishedSnapshot:\{not:Prisma\.JsonNull\}/,/scheduledAt:\{lte:new Date\(\)\}/])assert.match(publicRoute,rule);
  assert.match(helper,/item\.productStatus === 'ARCHIVED'/);
  for(const id of expectedIds.slice(0,6))assert.match(detail,new RegExp(`canonicalId==='${id}'`));
  assert.match(detail,/mini\?\.has\(tool\)/);
});

test('action resolver never invents a live destination',async()=>{
  const source=await read('portfolio/creative-lab-components.js'),context={URL};
  context.globalThis=context;
  vm.runInNewContext(source,context);
  const ui=context.CreativeLabUI;
  assert.ok(ui);
  const base={publishedSlug:'sample-tool',productStatus:'LIVE',primaryBehavior:'AUTO',primaryLabel:'Open Tool',target:'NEW_TAB'};
  assert.equal(ui.resolvePrimaryAction(base).href,'/creative-lab/sample-tool/demo');
  assert.equal(ui.resolvePrimaryAction({...base,liveUrl:'https://example.com/tool'}).href,'/creative-lab/sample-tool/demo');
  const verified=ui.resolvePrimaryAction({...base,liveUrl:'https://example.com/tool',liveUrlVerifiedAt:'2026-10-29T00:00:00.000Z'});
  assert.equal(verified.href,'https://example.com/tool');
  assert.equal(verified.target,'_blank');
  assert.equal(verified.rel,'noopener noreferrer');
});

test('catalog and demos expose keyboard, live-status and responsive contracts',async()=>{
  const [html,catalogJs,toolHtml,detailJs,miniJs,css]=await Promise.all([read('portfolio/creative-lab.html'),read('portfolio/creative-lab.js'),read('portfolio/creative-tool.html'),read('portfolio/creative-tool.js'),read('portfolio/creative-tool-mini-demos.js'),read('portfolio/creative-lab.css')]);
  assert.match(html,/type="search"/);
  assert.match(html,/role="group" aria-label="Filter by tool type"/);
  assert.match(html,/aria-live="polite"/);
  assert.match(catalogJs,/aria-pressed/);
  assert.match(catalogJs,/setTimeout\(load,220\)/);
  assert.match(toolHtml,/creative-tool-mini-demos\.js/);
  assert.match(detailJs,/aria-live="polite"/);
  for(const id of expectedIds.slice(6))assert.match(miniJs,new RegExp(`${id}:`));
  assert.match(css,/:focus-visible/);
  assert.match(css,/@media\(max-width:900px\)/);
  assert.match(css,/@media\(max-width:680px\)/);
  assert.match(css,/@media\(prefers-reduced-motion:reduce\)/);
});
