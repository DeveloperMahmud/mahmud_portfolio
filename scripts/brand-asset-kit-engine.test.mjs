import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const js=await readFile(new URL('../portfolio/creative-tool-mini-demos.js',import.meta.url),'utf8');
const css=await readFile(new URL('../portfolio/creative-lab.css',import.meta.url),'utf8');

test('M04 exposes bounded editable starter brand tokens',()=>{
  assert.match(js,/data-mini-demo="M04"/);
  for(const field of ['name','tagline','logo','imagery'])assert.match(js,new RegExp(`data-brand-field="${field}"`));
  for(const color of ['primary','secondary','neutral'])assert.match(js,new RegExp(`data-brand-color="${color}"`));
  assert.match(js,/maxlength="500"/);
});

test('M04 uses documented system font stacks rather than bundled font claims',()=>{
  assert.match(js,/Arial, Helvetica, sans-serif/);
  assert.match(js,/Georgia, Times New Roman, serif/);
  assert.match(js,/Consolas, Courier New, monospace/);
  assert.match(js,/no font file, logo or license is supplied/i);
});

test('M04 exports local versioned JSON and a printable guide',()=>{
  assert.match(js,/format:'portfolio-brand-kit-v1'/);
  assert.match(js,/application\/json;charset=utf-8/);
  assert.match(js,/data-brand-download/);
  assert.match(js,/document\.body\.dataset\.printBrandKit='true'/);
  assert.match(css,/body\[data-print-brand-kit="true"\]/);
  assert.doesNotMatch(js,/fetch\([^)]*data-brand/);
});

test('M04 preview follows the same token values and remains accessible',()=>{
  assert.match(js,/style\.setProperty\('--brand-primary',palette\.primary\)/);
  assert.match(js,/data-mini-status aria-live="polite"/);
  assert.match(css,/\.mini-brand--engine input:focus-visible/);
  assert.match(css,/\.mini-brand__palette/);
  assert.match(css,/break-inside:avoid/);
});
