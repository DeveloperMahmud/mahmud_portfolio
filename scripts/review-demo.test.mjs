import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const read=path=>readFile(new URL(`../${path}`,import.meta.url),'utf8');

test('F06 receives authored versions, sample comments and local decisions',async()=>{
  const js=await read('portfolio/creative-tool.js');
  assert.match(js,/if\(tool\.canonicalId==='F06'\)return reviewDemo\(tool\)/);
  assert.match(js,/role="tablist" aria-label="Sample creative versions"/);
  assert.match(js,/ART DIRECTOR \/ SAMPLE/);
  assert.match(js,/CLIENT \/ SAMPLE/);
  assert.match(js,/MARK SAMPLE APPROVED/);
});

test('review prototype exposes the production security and persistence boundary',async()=>{
  const js=await read('portfolio/creative-tool.js');
  const section=js.slice(js.indexOf('function reviewDemo'),js.indexOf('function genericDemo'));
  assert.match(section,/does not upload or share files, issue secure access tokens, save real comments or approvals, notify anyone, or persist after refresh/);
  assert.match(section,/authenticated or expiring access, authorization, durable version storage, audit logs, privacy controls, rate limits and reliable notifications/);
  assert.doesNotMatch(section,/fetch\(|localStorage|sessionStorage|WebSocket/);
});

test('review state is keyboard native, announced, responsive and reduced-motion safe',async()=>{
  const [js,css]=await Promise.all([read('portfolio/creative-tool.js'),read('portfolio/creative-lab.css')]);
  assert.match(js,/setAttribute\('aria-selected'/);
  assert.match(js,/data-review-status aria-live="polite"/);
  assert.match(css,/\.review-demo button:focus-visible/);
  assert.match(css,/@media\(max-width:620px\).*\.review-demo/s);
  assert.match(css,/@media\(prefers-reduced-motion:reduce\).*\.review-demo__asset img/s);
});
