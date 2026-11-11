import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const studioLibrary=await readFile(new URL('../src/lib/page-studio.ts',import.meta.url),'utf8');
const studioRoutes=await readFile(new URL('../src/routes/page-studio.ts',import.meta.url),'utf8');

test('technical case-study template is a distinct draft-oriented Page Studio template',()=>{
  assert.match(studioLibrary,/name:'Page Studio technical case study'/);
  assert.match(studioLibrary,/slug:'page-studio-technical-case-study'/);
  assert.match(studioLibrary,/Draft-only evidence framework/);
});

test('template covers every required technical evidence section',()=>{
  for(const key of ['motivation','constraints','architecture','component-library','creation-workflow','qa-reliability','accessibility','security','lessons-tradeoffs','individual-contribution']){
    assert.match(studioLibrary,new RegExp(`'${key}'`));
  }
});

test('template copy cannot be mistaken for verified production evidence',()=>{
  assert.match(studioLibrary,/Evidence required:/);
  assert.match(studioLibrary,/Publish only after every evidence section has been replaced with verified information\./);
  assert.doesNotMatch(studioLibrary,/\+\d+%|conversion increased|revenue increased/i);
});

test('publish preflight blocks missing sections and unresolved evidence prompts',()=>{
  assert.match(studioRoutes,/evidence required:/i);
  assert.match(studioRoutes,/INCOMPLETE_TECHNICAL_CASE_STUDY/);
  assert.match(studioRoutes,/templateKey:page\.templateKey/);
  assert.match(studioRoutes,/blocking=issues\.filter\(issue=>issue\.severity==='ERROR'\)/);
});

test('authorized visual evidence remains recommended without fabricating media',()=>{
  assert.match(studioRoutes,/MISSING_CASE_STUDY_EVIDENCE/);
  assert.match(studioLibrary,/items:\[\]/);
});
