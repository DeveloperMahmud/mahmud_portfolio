import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
const read=path=>readFile(new URL(`../${path}`,import.meta.url),'utf8');

test('detail and demo routes precede Page Studio catch-all and fail closed',async()=>{const app=await read('src/app.ts'),demo=app.indexOf("app.get('/creative-lab/:slug/demo'"),detail=app.indexOf("app.get('/creative-lab/:slug'"),catchAll=app.indexOf("app.get('/pages/:slug'");assert.ok(demo>0&&detail>demo&&catchAll>detail);assert.match(app,/tool\.productStatus==='ARCHIVED'/);assert.match(app,/status:'PUBLISHED'/);assert.match(app,/scheduledAt:\{lte:new Date\(\)\}/);assert.match(app,/sendFile\(path\.join\(frontend,'404\.html'\)\)/)});

test('detail API returns only a validated published snapshot',async()=>{const routes=await read('src/routes/public.ts');assert.match(routes,/router\.get\('\/creative-lab\/:slug'/);assert.match(routes,/select:\{publishedSnapshot:true,visibility:true\}/);assert.match(routes,/publicCreativeTool\(row\?\.publishedSnapshot\)/);assert.match(routes,/visibility:\{in:\['PUBLIC','UNLISTED'\]\}/);assert.match(routes,/X-Robots-Tag','noindex,follow'/)});

test('detail UI states the demo boundary and renders individualized contract fields',async()=>{const [html,js,css,components]=await Promise.all([read('portfolio/creative-tool.html'),read('portfolio/creative-tool.js'),read('portfolio/creative-lab.css'),read('portfolio/creative-lab-components.js')]);assert.match(html,/id="toolRoot"/);assert.match(js,/tool\.problemStatement/);assert.match(js,/tool\.proposedInputs/);assert.match(js,/tool\.proposedOutputs/);assert.match(js,/tool\.limitations/);assert.match(js,/DEMO BOUNDARY/);assert.match(js,/Concept demo\./);assert.match(components,/CreativeLabUI=Object\.freeze\(\{[\s\S]*statusBadge/);assert.match(css,/\.tool-demo-stage/);assert.match(css,/@media\(max-width:850px\)/)});
