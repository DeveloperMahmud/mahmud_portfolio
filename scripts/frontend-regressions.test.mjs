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

test('public motion respects data-saving visitors and pauses the background off-screen',async()=>{
  const [background,motion]=await Promise.all([
    read('portfolio/neural-bg.js'),
    read('portfolio/motion-icons.js')
  ]);
  assert.match(background,/navigator\.connection\?\.saveData/);
  assert.match(background,/visibilitychange/);
  assert.match(motion,/const saveData=/);
  assert.match(motion,/reduced\(\)\|\|saveData\(\)/);
});

test('hero typewriter keeps its caret in the live text flow and offers durable presets',async()=>{
  const [runtime,admin,styles]=await Promise.all([
    read('portfolio/app.js'),
    read('portfolio/admin.js'),
    read('portfolio/styles.css')
  ]);
  assert.match(runtime,/el\.replaceChildren\(output\)/);
  assert.match(runtime,/if\(caret\)el\.append\(caret\)/);
  for(const preset of ['EDITORIAL','QUICK_CUT','CINEMATIC','TERMINAL','QUIET']){
    assert.match(runtime,new RegExp(preset));
    assert.match(admin,new RegExp(preset));
    assert.match(styles,new RegExp(`data-typewriter-preset=\\"${preset}\\"`));
  }
  assert.match(admin,/typewriterConfig/);
});

test('site module presets stay draft-only and hero settings use an isolated mini preview',async()=>{
  const [library,styles,loader,admin]=await Promise.all([
    read('portfolio/admin-module-library.js'),
    read('portfolio/admin-module-library.css'),
    read('portfolio/admin-page-studio.js'),
    read('portfolio/admin.js')
  ]);
  assert.match(library,/MODULE PRESET LIBRARY/);
  assert.match(library,/SAVE CURRENT AS MY PRESET/);
  assert.match(library,/SAVE SITE MODULES/);
  assert.match(library,/localStorage/);
  assert.match(styles,/\.hero-preview-caret/);
  assert.match(loader,/admin-module-library\.js/);
  assert.match(admin,/runHeroTypewriterPreview/);
});

test('Brand Assets are CMS-managed, reuse the existing media flow and apply safely on public pages',async()=>{
  const [admin,runtime,responsive,maintenance,operations,auth]=await Promise.all([
    read('portfolio/admin-brand-assets.js'),
    read('portfolio/brand-assets.js'),
    read('portfolio/responsive.js'),
    read('src/routes/maintenance.ts'),
    read('src/routes/operations.ts'),
    read('src/routes/auth.ts')
  ]);
  assert.match(admin,/BRAND ASSETS/);
  assert.match(admin,/\/api\/admin\/media\/upload/);
  assert.match(admin,/brand-assets/);
  assert.match(runtime,/apple-touch-icon/);
  assert.match(runtime,/has-brand-logo/);
  assert.match(runtime,/safeUrl/);
  assert.match(responsive,/brand-assets\.js/);
  assert.match(maintenance,/brandAssetsSchema/);
  assert.match(operations,/themeConfig:row\.themeConfig/);
  assert.match(auth,/existingTheme/);
});

test('public performance avoids duplicate font imports and serves legacy project links through clean routes',async()=>{
  const [styles,app]=await Promise.all([read('portfolio/styles.css'),read('src/app.ts')]);
  assert.doesNotMatch(styles,/@import\s+url\(['"]https:\/\/fonts\.googleapis\.com/);
  assert.match(app,/app\.get\('\/project\.html'/);
  assert.match(app,/stale-while-revalidate=604800/);
  assert.match(app,/stale-while-revalidate=86400/);
});

test('admin navigation remains discoverable and keyboard accessible on mobile',async()=>{
  const [html,css,runtime]=await Promise.all([
    read('portfolio/admin.html'),
    read('portfolio/admin-mobile-nav.css'),
    read('portfolio/admin.js')
  ]);
  assert.doesNotMatch(html,/^<style>$/m);
  assert.match(runtime,/id=\"adminMenuToggle\"/);
  assert.match(runtime,/aria-controls=\"adminSidebar\"/);
  assert.match(runtime,/admin-mobile-nav\.css/);
  assert.match(css,/@media\(max-width:1050px\)/);
  assert.match(css,/body\.admin-menu-open \.admin-sidebar\{transform:translateX\(0\)/);
  assert.match(runtime,/event\.key==='Escape'/);
  assert.match(runtime,/aria-expanded/);
  assert.match(runtime,/closest\('\.side-btn'\)/);
});
