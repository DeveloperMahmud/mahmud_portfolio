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
  assert.doesNotMatch(html,/<\/style>\s*<\/style>/i);
  assert.match(runtime,/id=\"adminMenuToggle\"/);
  assert.match(runtime,/aria-controls=\"adminSidebar\"/);
  assert.match(runtime,/admin-mobile-nav\.css/);
  assert.match(css,/@media\(max-width:1050px\)/);
  assert.match(css,/body\.admin-menu-open \.admin-sidebar\{transform:translateX\(0\)/);
  assert.match(runtime,/event\.key==='Escape'/);
  assert.match(runtime,/aria-expanded/);
  assert.match(runtime,/closest\('\.side-btn'\)/);
});

test('admin destinations use delegated navigation and versioned shell assets',async()=>{
  const [html,runtime,navigation,polish,account]=await Promise.all([
    read('portfolio/admin.html'),
    read('portfolio/admin.js'),
    read('portfolio/admin-navigation-runtime.js'),
    read('portfolio/admin-ui-polish.css'),
    read('portfolio/admin-account-upgrade.js')
  ]);
  assert.match(runtime,/document\.addEventListener\('click',event=>\{/);
  assert.match(runtime,/closest\?\.\('\.tab\[data-tab\]'\)/);
  assert.match(runtime,/window\.openAdminTab=openAdminTab/);
  assert.match(runtime,/aria-current/);
  assert.match(runtime,/#admin-/);
  assert.match(runtime,/function openInitialAdminTab\(attempt=0\)/);
  assert.doesNotMatch(runtime,/\$\$\('\.tab'\)\.forEach\(t=>t\.onclick/);
  assert.match(html,/admin\.js\?v=20261027-4/);
  assert.match(html,/admin-page-studio\.js\?v=20261027-2/);
  assert.match(html,/admin-navigation-runtime\.js\?v=20261027-4/);
  assert.match(navigation,/dataset\.adminNavBound/);
  assert.match(navigation,/MutationObserver/);
  assert.match(navigation,/window\.openAdminTab\?\./);
  assert.match(navigation,/button\.onclick=event/);
  assert.match(navigation,/window\.applyAdminRoleAccess\?\./);
  assert.match(navigation,/dataset\.cmsRole==='ADMIN'/);
  assert.match(navigation,/button\.hidden=false/);
  assert.match(runtime,/window\.applyAdminRoleAccess=applyRoleAccess/);
  assert.match(runtime,/Object\.hasOwn\(roleTabs,currentCmsRole\)\?roleTabs\[currentCmsRole\]:roleTabs\.VIEWER/);
  assert.match(polish,/\[hidden\]\{display:none!important\}/);
  assert.match(polish,/2026 admin shell refresh/);
  assert.match(account,/HOW THE PRIVATE ADMIN URL WORKS/);
});

test('CMS roles expose only appropriate workspaces and keep viewer and writer actions safe',async()=>{
  const [admin,rbac]=await Promise.all([read('portfolio/admin.js'),read('src/lib/rbac.ts')]);
  assert.match(admin,/const roleTabs=/);
  assert.match(admin,/document\.body\.dataset\.cmsRole=currentCmsRole/);
  assert.match(admin,/viewer=currentCmsRole==='VIEWER'/);
  assert.match(admin,/writer=currentCmsRole==='WRITER'/);
  assert.match(admin,/PRIVATE LEADS HIDDEN/);
  assert.match(rbac,/Writers can only edit records that are already drafts/);
  assert.match(rbac,/Viewer accounts have read-only access/);
  assert.match(rbac,/Administrator access is required for accounts, system controls, recovery and global site settings/);
});

test('homepage proof strip stays visible with empty draft data and legacy fallback',async()=>{
  const [studio,runtime,editorial]=await Promise.all([
    read('portfolio/homepage-studio.js'),
    read('portfolio/homepage-studio-runtime.js'),
    read('portfolio/editorial-upgrade.js')
  ]);
  assert.match(studio,/added or refreshed in the draft/);
  assert.match(studio,/!block\.data\.items\.length/);
  assert.match(studio,/CREATIVE DISCIPLINES/);
  assert.match(runtime,/proofFallback/);
  assert.match(runtime,/mountLegacyProof/);
  assert.match(runtime,/data\.items\.length\?data\.items:proofFallback/);
  assert.match(editorial,/guardEmptyTestimonials/);
});
