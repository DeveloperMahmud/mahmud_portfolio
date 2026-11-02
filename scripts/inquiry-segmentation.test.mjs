import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';

const read=file=>fs.readFile(file,'utf8');

test('public inquiry accepts only bounded routing metadata',async()=>{
  const source=await read('src/routes/public.ts'),start=source.indexOf("router.post('/inquiries'"),end=source.indexOf("router.post('/errors'",start),section=source.slice(start,end);
  assert.match(section,/intent:z\.enum\(\['GENERAL','CLIENT','RECRUITER'\]\)/);
  assert.match(section,/sourcePath:z\.string\(\)\.regex/);
  assert.match(section,/intent:\$\{intent\.toLowerCase\(\)\}/);
  assert.match(section,/source:\$\{sourcePath\.toLowerCase\(\)\}/);
  assert.doesNotMatch(section,/visitorId|sessionId|referrerHost/);
});

test('homepage derives intent without adding personal tracking data',async()=>{
  const [html,routing]=await Promise.all([read('portfolio/index.html'),read('portfolio/inquiry-routing.js')]);
  assert.match(html,/inquiry-routing\.js/);
  assert.match(routing,/RECRUITER/);
  assert.match(routing,/CLIENT/);
  assert.match(routing,/sourcePath/);
  assert.doesNotMatch(routing,/localStorage|cookie|fingerprint/i);
});

test('service CTAs preserve client intent and source route',async()=>{
  const source=await read('portfolio/service.js');
  assert.match(source,/intent=CLIENT/);
  assert.match(source,/sourcePath=/);
  assert.match(source,/service=/);
});

test('analytics uses bounded experience contexts and aggregate intent counts',async()=>{
  const [route,client]=await Promise.all([read('src/routes/analytics.ts'),read('portfolio/analytics.js')]);
  assert.match(route,/'hire','studio','service'/);
  assert.match(route,/inquiryIntents/);
  assert.match(route,/add\('Inquiry intent',data\.inquiryIntents\)/);
  assert.match(client,/pageContext=location\.pathname\.startsWith\('\/hire'\)/);
  assert.doesNotMatch(client,/email|message|company/);
});

test('lead exports retain routing tags for operational review',async()=>{
  const source=await read('src/routes/operations.ts');
  assert.match(source,/inquiries\.csv/);
  assert.match(source,/inquiries\.xlsx/);
  assert.match(source,/\['Tags','tags'/);
});
