import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const read=path=>readFile(new URL(`../${path}`,import.meta.url),'utf8');

test('homepage teaser starts collapsed and only hydrates from the public catalog',async()=>{
  const [html,app,publicRoute]=await Promise.all([read('portfolio/index.html'),read('portfolio/app.js'),read('src/routes/public.ts')]);
  assert.match(html,/<section class="creative-lab-teaser section"[^>]+hidden>/);
  assert.match(app,/fetch\('\/api\/public\/creative-lab'/);
  assert.match(app,/section\.enabled===false/);
  assert.match(app,/!Array\.isArray\(tools\)\|\|!tools\.length/);
  assert.match(app,/root\.hidden=true/);
  assert.match(app,/root\.hidden=false/);
  for(const boundary of [/status:'PUBLISHED'/,/visible:true/,/visibility:'PUBLIC'/,/publishedSnapshot:\{not:Prisma\.JsonNull\}/])assert.match(publicRoute,boundary);
});

test('homepage config edits presentation only and validates bounded safe values',async()=>{
  const [admin,maintenance]=await Promise.all([read('portfolio/admin-homepage-controls.js'),read('src/routes/maintenance.ts')]);
  assert.match(admin,/homepageCreativeLabDefaults/);
  assert.match(admin,/data-lab-field="ctaUrl"/);
  assert.match(admin,/data-lab-field="limit"/);
  assert.match(admin,/cards always come from published public Creative Lab records/i);
  assert.doesNotMatch(admin,/data-lab-field="(?:slug|productStatus|demoUrl|liveUrl|tools)"/);
  assert.match(maintenance,/creativeLabTeaserConfigSchema/);
  assert.match(maintenance,/\.min\(1\)\.max\(6\)/);
  assert.match(maintenance,/CTA URL must be an internal path or an HTTPS URL/);
});

test('Homepage Studio accepts and maps the canonical Creative Lab section',async()=>{
  const [contract,adminRoute,publicRoute,runtime,editor]=await Promise.all([read('src/lib/homepage-studio.ts'),read('src/routes/page-studio.ts'),read('src/routes/page-studio-public.ts'),read('portfolio/homepage-studio-runtime.js'),read('portfolio/homepage-studio.js')]);
  assert.match(contract,/HOMEPAGE_SECTION_KEYS=\[[^\]]*'creative_lab'/);
  assert.match(contract,/homepageSections\.find\(section=>section\.key==='creative_lab'\)/);
  assert.match(adminRoute,/resolveHomepageStudioSections\(site as unknown as Record<string,any>,homepageSections\)/);
  assert.match(publicRoute,/resolveHomepageStudioSections\([^\n]+homepageSections\)/);
  assert.match(runtime,/creative_lab:\['#creative-lab-teaser'\]/);
  assert.match(runtime,/key==='creative_lab'/);
  assert.match(editor,/creative_lab:\[\]/);
});

test('teaser has responsive, keyboard-visible and reduced-risk presentation rules',async()=>{
  const css=await read('portfolio/styles.css');
  assert.match(css,/\.creative-lab-teaser\[hidden\]\{display:none!important\}/);
  assert.match(css,/\.creative-lab-teaser-grid\{[^}]*grid-template-columns:repeat\(3/);
  assert.match(css,/@media\(max-width:900px\)[\s\S]*creative-lab-teaser-grid/);
  assert.match(css,/@media\(max-width:620px\)[\s\S]*creative-lab-teaser-grid/);
  assert.match(css,/:where\(a,button,input,select,textarea,\[tabindex\]\):focus-visible/);
});
