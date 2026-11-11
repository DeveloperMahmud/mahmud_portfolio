import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const read=path=>readFile(new URL(`../${path}`,import.meta.url),'utf8');

test('M01 accepts only bounded browser-local image inputs',async()=>{
  const js=await read('portfolio/creative-tool-mini-demos.js');
  assert.match(js,/type="file" accept="image\/png,image\/jpeg,image\/webp"/);
  assert.match(js,/12\*1024\*1024/);
  assert.match(js,/12000/);
  assert.match(js,/URL\.createObjectURL\(file\)/);
  assert.match(js,/URL\.revokeObjectURL/);
  assert.doesNotMatch(js,/fetch\(|XMLHttpRequest|WebSocket|FormData/);
});

test('M01 reports real dimensions, ratios and bounded fit observations',async()=>{
  const js=await read('portfolio/creative-tool-mini-demos.js');
  for(const token of ['naturalWidth','naturalHeight','EXACT DIMENSIONS','CROP / CANVAS CHANGE','UPSCALE REQUIRED','DOWNSCALE AVAILABLE'])assert.match(js,new RegExp(token.replaceAll('/','\\/')));
  assert.match(js,/Generic square/);
  assert.match(js,/Custom output/);
  assert.match(js,/data-dimension-inset/);
});

test('M01 exports a local checklist with an honest compliance boundary',async()=>{
  const js=await read('portfolio/creative-tool-mini-demos.js');
  assert.match(js,/image-safe-zone-checklist\.txt/);
  assert.match(js,/not marketplace compliance certification/i);
  assert.match(js,/not current or universal marketplace specifications/i);
});

test('M01 engine UI remains keyboard-visible and responsive',async()=>{
  const css=await read('portfolio/creative-lab.css');
  assert.match(css,/\.mini-dimension--engine input:focus-visible/);
  assert.match(css,/@media\(max-width:620px\).*\.mini-dimension__summary/s);
  assert.match(css,/\.mini-dimension__custom\[hidden\]/);
});
