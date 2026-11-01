import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const read=path=>readFile(new URL(`../${path}`,import.meta.url),'utf8');

test('F01 receives an individualized sample-only thumbnail experience',async()=>{
  const js=await read('portfolio/creative-tool.js');
  assert.match(js,/if\(tool\.canonicalId==='F01'\)return thumbnailDemo\(tool\)/);
  assert.match(js,/\[80,120,160\]/);
  assert.match(js,/\/assets\/demo-listing\.svg/);
  assert.match(js,/Side-by-side sample thumbnail comparison/);
});

test('demo makes its non-production boundary explicit and has no upload control',async()=>{
  const js=await read('portfolio/creative-tool.js');
  assert.match(js,/does not accept uploads, run OCR, score readability or certify Amazon compliance/);
  assert.match(js,/production assessment would need a real image-processing workflow, explainable criteria and human review/);
  assert.doesNotMatch(js,/type=["']file["']/i);
  assert.doesNotMatch(js,/FileReader|createObjectURL|FormData/);
});

test('thumbnail controls are keyboard-native, announced and responsive',async()=>{
  const [js,css]=await Promise.all([read('portfolio/creative-tool.js'),read('portfolio/creative-lab.css')]);
  assert.match(js,/type="radio" name="thumbnailSize"/);
  assert.match(js,/aria-live="polite"/);
  assert.match(js,/data-thumbnail-background/);
  assert.match(css,/\.thumbnail-demo__choices input:focus-visible\+span/);
  assert.match(css,/@media\(max-width:620px\)/);
  assert.match(css,/@media\(prefers-reduced-motion:reduce\).*\.thumbnail-demo__cell/s);
});
