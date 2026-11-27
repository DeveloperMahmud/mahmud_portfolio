import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';

const read=path=>readFile(new URL(`../${path}`,import.meta.url),'utf8');
const loadEngine=async()=>{const context={};context.globalThis=context;vm.runInNewContext(await read('portfolio/creative-planner-engine.js'),context);return context.CreativePlannerEngine};

test('F03 receives a bounded structured planning and export workflow',async()=>{
  const [html,js,registry]=await Promise.all([read('portfolio/creative-tool.html'),read('portfolio/creative-tool.js'),read('portfolio/creative-tool-module-registry.js')]);
  assert.match(js,/if\(tool\.canonicalId==='F03'\)return plannerDemo\(tool\)/);
  assert.match(html,/creative-tool-module-registry\.js/);
  assert.match(registry,/F03:\{scripts:\['\/creative-planner-engine\.js'\]\}/);
  assert.match(js,/Listing image sequence/);
  assert.match(js,/A\+ module map/);
  assert.match(js,/data-plan-form/);
  assert.match(js,/data-plan-export="json"/);
  assert.match(js,/data-plan-export="brief"/);
});

test('planner exposes bounded inputs and honest policy language',async()=>{
  const js=await read('portfolio/creative-tool.js');
  const section=js.slice(js.indexOf('function plannerDemo'),js.indexOf('function briefDemo'));
  assert.match(section,/min="4" max="9"/);
  assert.match(section,/min="3" max="7"/);
  assert.match(section,/does not write claims, generate assets or certify current marketplace requirements/);
  assert.match(section,/Confirm current regional program specifications/);
  assert.doesNotMatch(section,/fetch\([^)]*generate|AI-generated|Amazon approved/i);
});

test('planner engine bounds counts, sanitizes text and flags exact overlap',async()=>{
  const engine=await loadEngine();
  const plan=engine.buildPlan({product:'  Test\n Product ',listingCount:99,moduleCount:1,usps:'Shared claim\nSecond claim',assets:'Packshot',evidence:'Spec sheet'});
  assert.equal(plan.product,'Test Product');
  assert.equal(plan.listingCount,9);
  assert.equal(plan.moduleCount,3);
  assert.equal(plan.listing.length,9);
  assert.equal(plan.modules.length,3);
  assert.deepEqual([...plan.overlaps],['shared claim','second claim']);
  assert.match(engine.createBrief(plan),/HUMAN REVIEW GATES/);
  assert.match(engine.createBrief(plan),/does not certify compliance/i);
});

test('planner controls and board remain accessible and responsive',async()=>{
  const [js,css]=await Promise.all([read('portfolio/creative-tool.js'),read('portfolio/creative-lab.css')]);
  assert.match(js,/data-plan-status aria-live="polite"/);
  assert.match(js,/form\.reportValidity\(\)/);
  assert.match(css,/\.planner-demo--engine input:focus-visible/);
  assert.match(css,/@media\(max-width:620px\).*\.planner-demo__fields/s);
  assert.match(css,/\.planner-demo__evidence/);
});
