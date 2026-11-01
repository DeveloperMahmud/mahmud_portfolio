import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const read=path=>readFile(new URL(`../${path}`,import.meta.url),'utf8');

test('F04 receives a guided local sample form and brief preview',async()=>{
  const js=await read('portfolio/creative-tool.js');
  assert.match(js,/if\(tool\.canonicalId==='F04'\)return briefDemo\(tool\)/);
  assert.match(js,/data-brief-form/);
  assert.match(js,/data-brief-product/);
  assert.match(js,/data-brief-constraints/);
  assert.match(js,/event\.preventDefault\(\)/);
});

test('brief sample discloses that it is local, unsaved and not generated',async()=>{
  const js=await read('portfolio/creative-tool.js');
  const section=js.slice(js.indexOf('function briefDemo'),js.indexOf('function genericDemo'));
  assert.match(section,/Nothing is submitted, saved, emailed or AI-generated/);
  assert.match(section,/refreshing the page resets the sample/);
  assert.match(section,/LOCAL \/ UNSAVED/);
  assert.doesNotMatch(section,/fetch\(|localStorage|sessionStorage|FormData/);
});

test('brief inputs are bounded and responsive with announced state',async()=>{
  const [js,css]=await Promise.all([read('portfolio/creative-tool.js'),read('portfolio/creative-lab.css')]);
  assert.match(js,/maxlength="80" required/);
  assert.match(js,/maxlength="240"/);
  assert.match(js,/data-brief-status aria-live="polite"/);
  assert.match(css,/\.brief-demo input:focus-visible/);
  assert.match(css,/@media\(max-width:620px\).*\.brief-demo form/s);
});
