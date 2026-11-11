import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const js=await readFile(new URL('../portfolio/creative-tool-mini-demos.js',import.meta.url),'utf8');
const css=await readFile(new URL('../portfolio/creative-lab.css',import.meta.url),'utf8');

test('M03 provides editable bounded browser-local brief inputs',()=>{
  assert.match(js,/data-mini-demo="M03"/);
  for(const field of ['title','brand','objective','deliverables','timeline'])assert.match(js,new RegExp(`data-pdf-field="${field}"`));
  assert.match(js,/maxlength="500"/);
  assert.match(js,/never uploads, stores or emails the brief/);
});

test('M03 optional logo is local and bounded',()=>{
  assert.match(js,/accept="image\/png,image\/jpeg,image\/webp" data-pdf-logo/);
  assert.match(js,/file\.size>2\*1024\*1024/);
  assert.match(js,/URL\.createObjectURL\(file\)/);
  assert.doesNotMatch(js,/fetch\([^)]*data-pdf/);
});

test('M03 creates an honest print-to-PDF workflow',()=>{
  assert.match(js,/classList\.add\('mini-pdf__controls'\)/);
  assert.match(js,/data-pdf-print>PRINT \/ SAVE AS PDF/);
  assert.match(js,/document\.body\.dataset\.printBrief='true'/);
  assert.match(js,/window\.print\(\)/);
  assert.match(css,/body\[data-print-brief="true"\]/);
  assert.match(js,/not approval, a contract, proof of delivery/);
});

test('M03 remains keyboard-visible and responsive',()=>{
  assert.match(css,/\.mini-pdf--engine input:focus-visible/);
  assert.match(css,/@media\(max-width:620px\)/);
  assert.match(css,/break-inside:avoid/);
  assert.match(js,/aria-live="polite"/);
});
