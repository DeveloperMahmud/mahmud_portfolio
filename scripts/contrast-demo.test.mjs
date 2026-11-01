import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const read=path=>readFile(new URL(`../${path}`,import.meta.url),'utf8');

test('F02 receives three bounded sample readability states',async()=>{
  const js=await read('portfolio/creative-tool.js');
  assert.match(js,/tool\.canonicalId==='F02'/);
  assert.match(js,/\['strong','Strong contrast'/);
  assert.match(js,/\['weak','Low contrast'/);
  assert.match(js,/\['image','Busy image'/);
  assert.match(js,/data-contrast-scale/);
});

test('F02 makes its sample and compliance boundaries explicit',async()=>{
  const js=await read('portfolio/creative-tool.js');
  assert.match(js,/does not accept uploads, run OCR, calculate a complete image-accessibility score or certify WCAG conformance/);
  assert.match(js,/Color math alone cannot prove that the complete creative is readable/);
  assert.doesNotMatch(js,/type=["']file["']/i);
  assert.doesNotMatch(js,/FileReader|createObjectURL|canvas\.getContext/);
});

test('contrast controls are announced, keyboard native and responsive',async()=>{
  const [js,css]=await Promise.all([read('portfolio/creative-tool.js'),read('portfolio/creative-lab.css')]);
  assert.match(js,/type="radio" name="contrastScene"/);
  assert.match(js,/data-contrast-status aria-live="polite"/);
  assert.match(css,/\.contrast-demo__choices input:focus-visible\+span/);
  assert.match(css,/@media\(max-width:620px\).*\.contrast-demo/s);
  assert.match(css,/@media\(prefers-reduced-motion:reduce\).*\.contrast-demo__art/s);
});
