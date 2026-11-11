import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';

const read=path=>readFile(new URL(`../${path}`,import.meta.url),'utf8');
const loadEngine=async()=>{const context={};context.globalThis=context;vm.runInNewContext(await read('portfolio/creative-brief-engine.js'),context);return context.CreativeBriefEngine};

test('F04 receives a guided local sample form and brief preview',async()=>{
  const js=await read('portfolio/creative-tool.js');
  assert.match(js,/if\(tool\.canonicalId==='F04'\)return briefDemo\(tool\)/);
  assert.match(js,/data-brief-form/);
  assert.match(js,/data-brief-product/);
  assert.match(js,/data-brief-constraints/);
  assert.match(js,/data-brief-questions/);
  assert.match(js,/data-brief-export="json"/);
  assert.match(js,/event\.preventDefault\(\)/);
});

test('brief sample discloses that it is local, unsaved and not generated',async()=>{
  const js=await read('portfolio/creative-tool.js');
  const section=js.slice(js.indexOf('function briefDemo'),js.indexOf('function genericDemo'));
  assert.match(section,/Nothing is submitted, saved, emailed, approved or AI-generated/);
  assert.doesNotMatch(section,/fetch\(|localStorage|sessionStorage/);
});

test('brief engine sanitizes, bounds and identifies required clarification',async()=>{
  const engine=await loadEngine();
  const brief=engine.build({brand:' Brand\nName ',product:'Product',deliverables:'One\nTwo',availableFiles:''});
  assert.equal(brief.brand,'Brand Name');
  assert.deepEqual([...brief.deliverables],['One','Two']);
  assert.equal(brief.readiness,'NEEDS CLARIFICATION');
  assert.match(brief.questions.join(' '),/primary audience/i);
  assert.match(engine.toText(brief),/not submitted, saved, emailed, approved/i);
});

test('brief inputs are bounded and responsive with announced state',async()=>{
  const [js,css]=await Promise.all([read('portfolio/creative-tool.js'),read('portfolio/creative-lab.css')]);
  assert.match(js,/maxlength="80"/);
  assert.match(js,/maxlength="500"/);
  assert.match(js,/data-brief-status aria-live="polite"/);
  assert.match(css,/\.brief-demo input:focus-visible/);
  assert.match(css,/@media\(max-width:620px\).*\.brief-demo form/s);
});
