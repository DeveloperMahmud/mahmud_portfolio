import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const read=path=>readFile(new URL(`../${path}`,import.meta.url),'utf8');

test('M02 performs bounded browser-local image sampling',async()=>{
  const js=await read('portfolio/creative-tool-mini-demos.js');
  assert.match(js,/data-background-file/);
  assert.match(js,/12\*1024\*1024/);
  assert.match(js,/12000/);
  assert.match(js,/getImageData/);
  assert.match(js,/willReadFrequently:true/);
  assert.doesNotMatch(js,/fetch\(|XMLHttpRequest|WebSocket|FormData/);
});

test('M02 reports explainable border, edge and transparency observations',async()=>{
  const js=await read('portfolio/creative-tool-mini-demos.js');
  for(const label of ['BORDER NEAR-WHITE','EDGE CONTACT','TRANSPARENCY'])assert.match(js,new RegExp(label));
  assert.match(js,/data-background-threshold/);
  assert.match(js,/Math\.max\(r,g,b\)-Math\.min\(r,g,b\)<=28/);
});

test('M02 states limits and does not claim removal or compliance',async()=>{
  const js=await read('portfolio/creative-tool-mini-demos.js');
  assert.match(js,/Nothing is uploaded, stored or used for background removal/);
  assert.match(js,/cannot prove marketplace compliance/i);
  assert.match(js,/false positives|distinguish intentional shadows/i);
});

test('M02 output is keyboard-visible and responsive',async()=>{
  const css=await read('portfolio/creative-lab.css');
  assert.match(css,/\.mini-background--engine input:focus-visible/);
  assert.match(css,/@media\(max-width:620px\).*\.mini-background__results/s);
});
