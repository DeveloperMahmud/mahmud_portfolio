import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const read=path=>readFile(new URL(`../${path}`,import.meta.url),'utf8');

test('presentation routes remain disabled until explicitly published',async()=>{
  const [schema,app]=await Promise.all([read('src/lib/presentation.ts'),read('src/app.ts')]);
  assert.match(schema,/enabled:false/);
  assert.match(app,/if\(!config\.enabled\)return res\.status\(404\)/);
  assert.match(app,/\/hire\/presentation/);
  assert.match(app,/\/studio\/presentation/);
});

test('public presentation API selects public published projects only',async()=>{
  const source=await read('src/routes/public.ts');
  assert.match(source,/router\.get\('\/presentation\/:mode'/);
  assert.match(source,/status:'PUBLISHED',visibility:'PUBLIC',clientOnly:false/);
  assert.match(source,/slug:\{in:config\.projectSlugs\}/);
  assert.match(source,/publicProjectDto/);
});

test('presentation controls are keyboard and reduced-motion aware',async()=>{
  const [html,script,css]=await Promise.all([read('portfolio/presentation.html'),read('portfolio/presentation.js'),read('portfolio/presentation.css')]);
  assert.match(html,/role="progressbar"/);
  assert.match(script,/event\.key==='ArrowRight'/);
  assert.match(script,/event\.key==='ArrowLeft'/);
  assert.match(script,/prefers-reduced-motion/);
  assert.match(css,/@media\(prefers-reduced-motion:reduce\)/);
});

test('CMS editor preserves publication and evidence gates',async()=>{
  const [admin,route]=await Promise.all([read('portfolio/admin-presentation-mode.js'),read('src/routes/maintenance.ts')]);
  assert.match(admin,/needs at least two selected project slugs before publishing/);
  assert.match(route,/presentation-profile/);
  assert.match(route,/presentationConfigSchema/);
  assert.match(route,/aboutConfig:\{\.\.\.about,presentationConfig/);
});

test('presentation analytics stores no personal payload',async()=>{
  const analytics=await read('src/routes/analytics.ts');
  assert.match(analytics,/presentation_open/);
  assert.match(analytics,/presentation_step_advance/);
  assert.match(analytics,/presentationStep:z\.number/);
  assert.doesNotMatch(analytics,/presentationMessage|presentationEmail|presentationName/);
});
