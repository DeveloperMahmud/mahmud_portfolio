import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

const app=fs.readFileSync('src/app.ts','utf8');
const studio=fs.readFileSync('src/lib/page-studio.ts','utf8');

test('recruiter and studio routes are explicit and precede the Page Studio catch-all',()=>{
  const hire=app.indexOf("app.get('/hire'");
  const client=app.indexOf("app.get('/studio'");
  const catchAll=app.indexOf("app.get('/pages/:slug'");
  assert.ok(hire>0&&client>0&&catchAll>0);
  assert.ok(hire<catchAll&&client<catchAll);
  assert.ok(fs.existsSync('portfolio/hire.html'));
  assert.ok(fs.existsSync('portfolio/studio.html'));
});

test('V2 product roots cannot be claimed by custom Page Studio paths',()=>{
  for(const root of ['creative-lab','services','hire','studio','resources']){
    assert.match(studio,new RegExp(`['\"]${root}['\"]`));
  }
});

test('experience pages expose honest CTAs and responsive foundations',()=>{
  const hire=fs.readFileSync('portfolio/hire.html','utf8');
  const hireJs=fs.readFileSync('portfolio/hire.js','utf8');
  const client=fs.readFileSync('portfolio/studio.html','utf8');
  const css=fs.readFileSync('portfolio/experience-pages.css','utf8');
  assert.match(hire,/href="\/work\.html"/);
  assert.doesNotMatch(hire,/href="\/api\/public\/cv"/);
  assert.match(hireJs,/profile\.cvAvailable\?'<a class="button" href="\/api\/public\/cv"/);
  assert.match(client,/href="\/#contact"/);
  assert.doesNotMatch(hire+client,/href="#"/);
  assert.match(css,/@media\(max-width:580px\)/);
  assert.match(css,/prefers-reduced-motion/);
});
