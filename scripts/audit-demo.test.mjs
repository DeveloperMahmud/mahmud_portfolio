import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const read=path=>readFile(new URL(`../${path}`,import.meta.url),'utf8');

test('F05 receives six authored and explainable sample criteria',async()=>{
  const js=await read('portfolio/creative-tool.js');
  assert.match(js,/if\(tool\.canonicalId==='F05'\)return auditDemo\(tool\)/);
  assert.match(js,/Lead image clarity/);
  assert.match(js,/Benefit hierarchy/);
  assert.match(js,/Claim evidence/);
  assert.match(js,/SAMPLE PASS/);
  assert.match(js,/HUMAN REVIEW/);
});

test('sample audit refuses upload, computer-vision and compliance claims',async()=>{
  const js=await read('portfolio/creative-tool.js');
  const section=js.slice(js.indexOf('function auditDemo'),js.indexOf('function genericDemo'));
  assert.match(section,/does not accept uploads, run computer vision, make Amazon compliance decisions or perform a real client audit/);
  assert.match(section,/authored examples, not machine-detected results/);
  assert.match(section,/not an unexplained aggregate score/);
  assert.doesNotMatch(section,/type=["']file["']|FileReader|canvas\.getContext/);
});

test('audit filtering is announced, keyboard native and responsive',async()=>{
  const [js,css]=await Promise.all([read('portfolio/creative-tool.js'),read('portfolio/creative-lab.css')]);
  assert.match(js,/role="group" aria-label="Filter sample findings"/);
  assert.match(js,/setAttribute\('aria-pressed'/);
  assert.match(js,/data-audit-status aria-live="polite"/);
  assert.match(css,/\.audit-demo__filters button:focus-visible/);
  assert.match(css,/@media\(max-width:620px\).*\.audit-demo__list/s);
});
