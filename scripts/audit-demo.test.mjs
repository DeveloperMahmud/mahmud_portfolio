import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const read=path=>readFile(new URL(`../${path}`,import.meta.url),'utf8');

test('F05 provides eight explainable human-review criteria',async()=>{
  const [js,engine]=await Promise.all([read('portfolio/creative-tool.js'),read('portfolio/listing-audit-engine.js')]);
  assert.match(js,/if\(tool\.canonicalId==='F05'\)return auditDemo\(tool\)/);
  assert.match(engine,/Lead image clarity/);
  assert.match(engine,/Benefit hierarchy/);
  assert.match(engine,/Claim evidence/);
  assert.match(engine,/Program \/ regional requirements/);
  assert.match(js,/data-audit-criterion/);
});

test('audit explicitly refuses upload, computer-vision and compliance claims',async()=>{
  const js=await read('portfolio/creative-tool.js');
  const section=js.slice(js.indexOf('function auditDemo'),js.indexOf('function genericDemo'));
  assert.match(section,/does not upload artwork, run computer vision, make marketplace compliance decisions or perform a certified audit/);
  assert.match(section,/workflow facts, not a quality or compliance score/);
  assert.doesNotMatch(section,/type=["']file["']|FileReader|canvas\.getContext/);
});

test('audit is locally exportable, announced, keyboard native and responsive',async()=>{
  const [js,css]=await Promise.all([read('portfolio/creative-tool.js'),read('portfolio/creative-lab.css')]);
  assert.match(js,/data-audit-export="json"/);
  assert.match(js,/data-audit-export="text"/);
  assert.match(js,/data-audit-status aria-live="polite"/);
  assert.match(css,/\.audit-demo button:focus-visible/);
  assert.match(css,/@media\(max-width:620px\).*\.audit-demo__actions/s);
});

test('engine normalizes status and keeps evidence attached to each finding',async()=>{
  await import('../portfolio/listing-audit-engine.js');
  const report=globalThis.ListingAuditEngine.build({listing:' Test ',criteria:{lead_image:{status:'review',evidence:'  tiny text  '},claim_evidence:{status:'unsafe'}}});
  assert.equal(report.criteria.length,8);
  assert.equal(report.criteria[0].status,'review');
  assert.equal(report.criteria[0].evidence,'tiny text');
  assert.equal(report.criteria.find(item=>item.id==='claim_evidence').status,'not_checked');
  assert.match(globalThis.ListingAuditEngine.toText(report),/No evidence note recorded/);
});
