import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const read=path=>readFile(new URL(`../${path}`,import.meta.url),'utf8');

test('all six mini tools have distinct honest experiences',async()=>{
  const js=await read('portfolio/creative-tool-mini-demos.js');
  for(const id of ['M01','M02','M03','M04','M05','M06'])assert.match(js,new RegExp(`data-mini-demo="${id}"`));
  for(const feature of ['BROWSER-LOCAL IMAGE QA','BROWSER-LOCAL BACKGROUND REVIEW','BROWSER-LOCAL PDF WORKFLOW','FICTIONAL BRAND STARTER','SAMPLE PRESENTATION FLOW','BROWSER-LOCAL HANDOFF'])assert.match(js,new RegExp(feature));
  assert.match(js,/M01:dimensionDemo,M02:backgroundDemo,M03:pdfDemo,M04:brandKitEngineDemo,M05:presentationDemo,M06:handoffDemo/);
});

test('mini demos remain local, bounded and free of fake production operations',async()=>{
  const js=await read('portfolio/creative-tool-mini-demos.js');
  assert.doesNotMatch(js,/fetch\(|XMLHttpRequest|WebSocket|localStorage|sessionStorage|FormData/);
  assert.match(js,/never uploaded, stored or sent to the portfolio server/);
  assert.match(js,/never uploads, stores or emails the brief/);
  assert.match(js,/window\.print\(\)/);
  assert.match(js,/does not read portfolio records, publish a deck or create a share link/);
  assert.match(js,/No project name, task or completion state is sent to the server/);
});

test('mini module loads before the controller and integrates by canonical ID',async()=>{
  const [html,controller]=await Promise.all([read('portfolio/creative-tool.html'),read('portfolio/creative-tool.js')]);
  assert.ok(html.indexOf('/creative-tool-mini-demos.js')<html.indexOf('/creative-tool.js'));
  assert.match(controller,/window\.CreativeToolMiniDemos/);
  assert.match(controller,/if\(mini\?\.has\(tool\)\)/);
  assert.match(controller,/mini\.wire\(root,tool\)/);
});

test('mini controls expose native focus, live status, mobile and reduced-motion behavior',async()=>{
  const [js,css]=await Promise.all([read('portfolio/creative-tool-mini-demos.js'),read('portfolio/creative-lab.css')]);
  assert.ok((js.match(/aria-live="polite"/g)||[]).length>=6);
  assert.match(js,/role="tablist"|type="checkbox"|type="radio"/);
  assert.match(css,/\.mini-demo select:focus-visible/);
  assert.match(css,/@media\(max-width:620px\).*\.mini-demo/s);
  assert.match(css,/@media\(prefers-reduced-motion:reduce\).*\.mini-handoff__meter span/s);
});
