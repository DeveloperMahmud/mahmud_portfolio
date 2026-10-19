import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const read=path=>readFile(new URL(`../${path}`,import.meta.url),'utf8');

test('Open Graph selectors remain valid CSS selectors',async()=>{
  const source=await read('portfolio/app.js');
  assert.doesNotMatch(source,/meta\[property=og:/);
  assert.match(source,/meta\[property="og:image"\]/);
  assert.match(source,/meta\[property="og:title"\]/);
  assert.match(source,/meta\[property="og:description"\]/);
});

test('public pages install the durable missing-image fallback',async()=>{
  const [fallback,index,custom,work,project,blog,share]=await Promise.all([
    read('portfolio/public-media.js'),
    read('portfolio/index.html'),
    read('portfolio/custom-page.html'),
    read('portfolio/work.js'),
    read('portfolio/project.js'),
    read('portfolio/blog.js'),
    read('portfolio/share.js')
  ]);
  assert.match(fallback,/publicFallbackApplied/);
  assert.match(fallback,/data-social-fallback/);
  assert.match(index,/\/public-media\.js/);
  assert.match(custom,/\/public-media\.js/);
  for(const source of [work,project,blog,share])assert.match(source,/import\('\/public-media\.js'\)/);
});

test('broken media fallback does not erase CMS references',async()=>{
  const source=await read('portfolio/public-media.js');
  assert.doesNotMatch(source,/fetch\(|DELETE|bulk-delete/i);
  assert.match(source,/Preview temporarily unavailable/);
});

test('public social profiles have a local fallback when the icon CDN is unavailable',async()=>{
  const [runtime,index,styles]=await Promise.all([
    read('portfolio/social-icon-fix.js'),
    read('portfolio/index.html'),
    read('portfolio/styles.css')
  ]);
  assert.match(runtime,/MutationObserver/);
  assert.match(runtime,/social-inline-icon/);
  assert.match(index,/\/social-icon-fix\.js/);
  assert.match(styles,/\.public-socials \.social-inline-icon/);
});
