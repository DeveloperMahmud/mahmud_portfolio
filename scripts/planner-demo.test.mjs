import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const read=path=>readFile(new URL(`../${path}`,import.meta.url),'utf8');

test('F03 receives distinct listing and A+ sample lanes',async()=>{
  const js=await read('portfolio/creative-tool.js');
  assert.match(js,/if\(tool\.canonicalId==='F03'\)return plannerDemo\(tool\)/);
  assert.match(js,/Listing image sequence/);
  assert.match(js,/Premium A\+ module map/);
  assert.match(js,/data-plan-module=/);
  assert.match(js,/data-plan-count/);
});

test('planner is explicitly fictional, editable and not universal policy',async()=>{
  const js=await read('portfolio/creative-tool.js');
  const section=js.slice(js.indexOf('function plannerDemo'),js.indexOf('function briefDemo'));
  assert.match(section,/fictional portable blender/i);
  assert.match(section,/does not generate copy or assets, save a brief, or represent universal Amazon program requirements/);
  assert.match(section,/verify current marketplace specifications before design production/);
  assert.doesNotMatch(section,/fetch\([^)]*generate|AI-generated|Amazon approved/i);
});

test('planner controls and board remain accessible and responsive',async()=>{
  const [js,css]=await Promise.all([read('portfolio/creative-tool.js'),read('portfolio/creative-lab.css')]);
  assert.match(js,/data-plan-status aria-live="polite"/);
  assert.match(js,/\.addEventListener\('change',update\)/);
  assert.match(css,/\.planner-demo__controls select:focus-visible/);
  assert.match(css,/@media\(max-width:700px\).*\.planner-demo__lanes/s);
  assert.match(css,/data-module-count="3"/);
});
