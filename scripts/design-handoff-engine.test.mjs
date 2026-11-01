import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const read=path=>readFile(new URL(`../${path}`,import.meta.url),'utf8');

test('M06 supports bounded project-specific checklist editing',async()=>{
  const js=await read('portfolio/creative-tool-mini-demos.js');
  assert.match(js,/data-handoff-project/);
  assert.match(js,/data-handoff-custom/);
  assert.match(js,/checks\(\)\.length>=24/);
  assert.match(js,/data-handoff-remove/);
});

test('M06 offers real local copy, print and reset actions',async()=>{
  const js=await read('portfolio/creative-tool-mini-demos.js');
  assert.match(js,/navigator\.clipboard\.writeText\(summary\(\)\)/);
  assert.match(js,/window\.print\(\)/);
  assert.match(js,/data-handoff-reset/);
  assert.match(js,/No project name, task or completion state is sent to the server/);
  assert.doesNotMatch(js,/fetch\(|XMLHttpRequest|WebSocket|FormData/);
});

test('M06 has keyboard focus, mobile layout and dedicated print output',async()=>{
  const css=await read('portfolio/creative-lab.css');
  assert.match(css,/\.mini-handoff--engine input:focus-visible/);
  assert.match(css,/@media print\{body\[data-print-handoff="true"\]/);
  assert.match(css,/@media\(max-width:620px\)/);
});
