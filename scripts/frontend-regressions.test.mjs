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

test('admin background remains branded without running the public particle render loop',async()=>{
  const [background,admin]=await Promise.all([
    read('portfolio/neural-bg.js'),
    read('portfolio/admin.html')
  ]);
  assert.match(background,/classList\.contains\('admin-page'\)/);
  assert.match(background,/host\.dataset\.ambientStatic='true'/);
  assert.match(admin,/Admin ambient background: intentionally static/);
  assert.match(admin,/neural-bg\.js\?v=20261103-1/);
  assert.match(admin,/\.admin-page>\.admin-ambient \.ambient-grid\{[^}]*animation:none!important/);
  assert.match(admin,/\.admin-page>\.admin-ambient \.ambient-orb\{[^}]*animation:none!important/);
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
  assert.match(html,/admin\.js\?v=20261102-4/);
  assert.match(runtime,/admin-mobile-nav\.css\?v=20261102-1/);
  assert.match(css,/@media\(max-width:1050px\)/);
  assert.match(css,/body\.admin-menu-open \.admin-sidebar\{transform:translateX\(0\)/);
  assert.match(css,/body\.admin-page\.admin-menu-open #adminSidebar\{transform:translateX\(0\)!important\}/);
  assert.match(runtime,/event\.key==='Escape'/);
  assert.match(runtime,/aria-expanded/);
  assert.match(runtime,/window\.closeAdminMobileMenu=\(\)=>setOpen\(false\)/);
  assert.match(runtime,/openAdminTab\(item\.dataset\.tab\);\s*window\.closeAdminMobileMenu\?\.\(\)/);
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
  assert.match(html,/admin\.js\?v=20261102-4/);
  assert.match(html,/admin-page-studio\.js\?v=20261102-11/);
  assert.match(await read('portfolio/admin-page-studio.js'),/20261102-account-v1/);
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
  assert.match(polish,/2026-10 coherence pass/);
  assert.match(polish,/visibility:hidden;pointer-events:none/);
  assert.match(runtime,/classList\.add\('cms-workspace-active'\)/);
  assert.match(polish,/body\.admin-page\.cms-workspace-active\{height:100dvh/);
  assert.match(polish,/\.admin-page\.cms-workspace-active \.admin-main\{[^}]*overflow-y:auto[^}]*border:1px solid #303630[^}]*border-radius:var\(--admin-radius\)/);
  assert.match(polish,/\.admin-page\.cms-workspace-active \.admin-main::-webkit-scrollbar-track\{margin-block:10px/);
  assert.match(polish,/\.admin-page \.ops-nav\{[^}]*padding:8px[^}]*border-radius:11px[^}]*overflow-x:auto[^}]*overflow-y:hidden/);
  assert.match(polish,/\.admin-page \.ops-nav \.admin-btn\{flex:0 0 auto;min-height:44px/);
  assert.match(polish,/\.admin-main\{height:100%;min-height:0;overflow-x:hidden;overflow-y:auto/);
  assert.match(polish,/@media\(min-width:1051px\)/);
  assert.match(polish,/input\[type=checkbox\]:not\(\.media-check\).*width:18px!important/);
  assert.match(polish,/label:has\(>input\[type=checkbox\]\):not\(\.toggle-field\):not\(\.inspector-check\)/);
  assert.match(account,/HOW THE PRIVATE ADMIN URL WORKS/);
  assert.match(account,/const form=event\.currentTarget;try\{/);
  assert.match(account,/form\.reset\(\)/);
  assert.doesNotMatch(account,/event\.currentTarget\.reset\(\)/);
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

test('homepage proof-to-work transition stays compact on wide displays',async()=>{
  const [html,runtimeCss]=await Promise.all([
    read('portfolio/index.html'),
    read('portfolio/homepage-studio-runtime.css')
  ]);
  assert.match(html,/homepage-studio-runtime\.css\?v=20261028-1/);
  assert.match(runtimeCss,/\.homepage-studio-proof-fallback\+\.featured-slider-section/);
  assert.match(runtimeCss,/padding-block:clamp\(42px,4\.5vw,68px\)!important/);
});

test('homepage uses the native cursor without a perpetual cursor animation loop',async()=>{
  const [source,index]=await Promise.all([read('portfolio/app.js'),read('portfolio/index.html')]);
  assert.doesNotMatch(source,/classList\.add\('home-custom-cursor'\)/);
  assert.doesNotMatch(index,/<div class="cursor"/);
  assert.match(index,/app\.js\?v=20261028-1/);
});

test('homepage proof content is manageable and reusable across both studios',async()=>{
  const [manager,studio,pageStudio,publicRoute]=await Promise.all([
    read('portfolio/admin-homepage-controls.js'),
    read('src/lib/homepage-studio.ts'),
    read('portfolio/page-studio.js'),
    read('src/routes/page-studio-public.ts')
  ]);
  assert.match(manager,/How I Work \/ Proof Cards/);
  assert.match(manager,/data-proof-add/);
  assert.match(manager,/data-proof-up/);
  assert.match(manager,/data-proof-drag/);
  assert.match(manager,/draggedSection/);
  assert.match(manager,/data-home-enabled/);
  assert.match(manager,/homepageEditorRoutes/);
  assert.match(manager,/EDIT CONTENT & SETTINGS/);
  assert.match(manager,/data-home-editor/);
  assert.match(manager,/openHomepageEditor/);
  assert.match(manager,/maintenance-subtab/);
  assert.match(studio,/type:'PROOF_STRIP'/);
  assert.match(pageStudio,/Proof cards \/ outcome metrics/);
  assert.match(publicRoute,/homepageSections/);
});

test('structured module presets expose non-destructive hover and keyboard previews',async()=>{
  const [library,css]=await Promise.all([
    read('portfolio/admin-module-library.js'),
    read('portfolio/admin-module-library.css')
  ]);
  assert.match(library,/modulePresetPreview/);
  assert.match(library,/previewPreset/);
  assert.match(library,/mouseenter/);
  assert.match(library,/focusin/);
  assert.match(library,/PREVIEW/);
  assert.match(library,/site-module-preset-preview/);
  assert.match(css,/\.module-library-browser/);
  assert.match(css,/\.module-preset-preview/);
  assert.match(css,/height:clamp\(540px,68vh,760px\)/);
  assert.match(css,/overflow-y:auto/);
  assert.match(css,/\.is-footerConfig,\.is-aboutConfig,\.is-amazonConfig\)\{min-height:0;justify-content:flex-start/);
});

test('structured site modules have safe visual previews and the inspector scrolls independently',async()=>{
  const [manager,adminCss,studioCss,studioHtml]=await Promise.all([
    read('portfolio/admin-homepage-controls.js'),
    read('portfolio/admin-ui-polish.css'),
    read('portfolio/homepage-studio-polish.css'),
    read('portfolio/homepage-studio.html')
  ]);
  assert.match(manager,/siteModulePreviewDefinitions/);
  assert.match(manager,/data-site-module-preview/);
  assert.match(manager,/Fix the JSON syntax/);
  assert.match(adminCss,/\.site-modules-workspace/);
  assert.match(studioCss,/\.hs-inspector\{position:sticky/);
  assert.match(studioCss,/overflow-y:auto/);
  assert.match(studioHtml,/homepage-studio-polish\.css/);
});

test('lead and analytics workspaces expose authenticated spreadsheet exports',async()=>{
  const [leads,analyticsUi,operations,analyticsRoute]=await Promise.all([
    read('portfolio/admin-leads.js'),
    read('portfolio/admin-export-controls.js'),
    read('src/routes/operations.ts'),
    read('src/routes/analytics.ts')
  ]);
  assert.match(leads,/inquiries\.xlsx/);
  assert.match(analyticsUi,/analytics\/export\.xlsx/);
  assert.match(analyticsUi,/encodeURIComponent/);
  assert.match(operations,/Sensitive XLSX export/);
  assert.match(operations,/application\/vnd\.openxmlformats-officedocument\.spreadsheetml\.sheet/);
  assert.match(analyticsRoute,/adminAnalytics\.get\('\/export\.xlsx'/);
});

test('admin collection controls keep consistent spacing and Brand field geometry',async()=>{
  const [admin,polish]=await Promise.all([
    read('portfolio/admin.js'),
    read('portfolio/admin-ui-polish.css')
  ]);
  assert.match(admin,/renderBrands\(\).*class="item-actions"/s);
  assert.match(polish,/\.admin-page \.bulkbar>label\{[^}]*min-height:44px[^}]*padding:0 11px/);
  assert.match(polish,/\.admin-page \.project-item>\.item-actions\{[^}]*gap:8px/);
  assert.match(polish,/#brandForm>label:has\(#brandActive\)\{[^}]*min-height:48px/);
});

test('public loading frames remain intentional and multiline conversion headings breathe',async()=>{
  const [styles,index]=await Promise.all([read('portfolio/styles.css'),read('portfolio/index.html')]);
  assert.match(styles,/\.project-media-wrap\{[^}]*radial-gradient\(circle at 78% 18%/);
  assert.match(styles,/\.contact-inner h2\{line-height:\.88\}/);
  assert.match(index,/styles\.css\?v=20261028-2/);
});

test('case-study media adapts long Behance boards without tiny letterboxed heroes',async()=>{
  const [project,styles,html]=await Promise.all([
    read('portfolio/project.js'),
    read('portfolio/styles.css'),
    read('portfolio/project.html')
  ]);
  assert.match(project,/classifyProjectMedia/);
  assert.match(project,/project-detail-hero-frame/);
  assert.match(project,/items\.length === 1 \? ' is-single'/);
  assert.match(styles,/\.project-detail-hero-frame:is\(\.is-long,\.is-portrait,\.is-square\)\{aspect-ratio:16\/9\}/);
  assert.match(styles,/\.case-gallery\.is-single\.has-long-media img\{width:min\(100%,780px\)\}/);
  assert.match(html,/project\.js\?v=20261112-case-media-1/);
  assert.match(html,/styles\.css\?v=20261112-case-media-1/);
});
