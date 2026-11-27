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

test('public motion respects data-saving visitors and admin previews stay live',async()=>{
  const [background,motion,adminMotion,adminSeo,adminHtml]=await Promise.all([
    read('portfolio/neural-bg.js'),
    read('portfolio/motion-icons.js'),
    read('portfolio/admin-motion.js'),
    read('portfolio/admin-seo.js'),
    read('portfolio/admin.html')
  ]);
  assert.match(background,/navigator\.connection\?\.saveData/);
  assert.match(background,/visibilitychange/);
  assert.match(motion,/const saveData=/);
  assert.match(motion,/reduced\(\)\|\|saveData\(\)/);
  assert.match(motion,/function schedulePreview/);
  assert.match(motion,/function bindInteractions/);
  assert.match(motion,/window\.MotionIcons=\{init,apply,play,refresh,defaults\}/);
  assert.match(adminMotion,/runtime\.refresh\(config,card\)/);
  assert.match(adminMotion,/motion-icons\.js\?v=20261126-live-preview-1/);
  assert.match(adminSeo,/admin-motion\.js\?v=20261126-live-preview-1/);
  assert.match(adminHtml,/admin-seo\.js\?v=20261126-motion-preview-1/);
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
  assert.match(html,/admin\.js\?v=20261122-hero-media-2/);
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
  assert.match(html,/admin\.js\?v=20261122-hero-media-2/);
  assert.match(html,/admin-page-studio\.js\?v=20261126-admin-layout-4/);
  assert.match(await read('portfolio/admin-page-studio.js'),/20261127-settings-appearance-1/);
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
  assert.match(html,/homepage-studio-runtime\.css\?v=20261127-proof-mode-1/);
  assert.match(runtimeCss,/\.homepage-studio-runtime-group\{position:relative;z-index:1\}/);
  assert.match(runtimeCss,/\.homepage-studio-proof\[data-proof-mode="OUTCOMES"\]\{display:block;visibility:visible/);
  assert.match(runtimeCss,/\.homepage-studio-proof-fallback\+\.featured-slider-section/);
  assert.match(runtimeCss,/padding-block:clamp\(42px,4\.5vw,68px\)!important/);
});

test('homepage uses the native cursor without a perpetual cursor animation loop',async()=>{
  const [source,index]=await Promise.all([read('portfolio/app.js'),read('portfolio/index.html')]);
  assert.doesNotMatch(source,/classList\.add\('home-custom-cursor'\)/);
  assert.doesNotMatch(index,/<div class="cursor"/);
  assert.match(index,/app\.js\?v=20261112-project-links-1/);
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

test('analytics bars expose animated date detail and a readable traffic summary',async()=>{
  const [analytics,styles,admin]=await Promise.all([
    read('portfolio/admin-addendum.js'),
    read('portfolio/styles.css'),
    read('portfolio/admin.html')
  ]);
  assert.match(analytics,/class="analytics-tooltip"/);
  assert.match(analytics,/aria-label="\$\{esc\(x\.date\)\}: \$\{x\.pageViews\} page views/);
  assert.match(analytics,/analyticsChartSummary/);
  assert.match(analytics,/DAILY AVERAGE/);
  assert.match(styles,/\.analytics-bar:hover \.analytics-tooltip/);
  assert.match(styles,/\.analytics-bar:focus-within \.analytics-tooltip/);
  assert.match(styles,/@keyframes analyticsBarRise/);
  assert.match(styles,/\.analytics-chart-summary/);
  assert.match(admin,/admin-addendum\.js\?v=20261114-analytics-hero-1/);
  assert.match(admin,/styles\.css\?v=20261114-analytics-hero-2/);
});

test('admin collection controls keep consistent spacing and Brand field geometry',async()=>{
  const [admin,polish,html]=await Promise.all([
    read('portfolio/admin.js'),
    read('portfolio/admin-ui-polish.css'),
    read('portfolio/admin.html')
  ]);
  assert.match(admin,/renderBrands\(\).*class="item-actions"/s);
  assert.match(polish,/\.admin-page \.bulkbar>label\{[^}]*min-height:44px[^}]*padding:0 11px/);
  assert.match(polish,/\.admin-page \.project-item>\.item-actions\{[^}]*gap:8px/);
  assert.match(polish,/#brandForm>label:has\(#brandActive\)\{[^}]*min-height:48px/);
  assert.match(html,/#projectList \.project-item:has\(>\.project-drag-handle\)[^{]*\{grid-template-columns:22px 24px 72px minmax\(180px,1fr\) minmax\(230px,auto\)/);
  assert.match(html,/#contentList \.project-item>div:last-child\{grid-column:5;display:flex/);
  assert.match(html,/@media\(max-width:767px\)[\s\S]*?#contentList \.project-item>div:last-child\{grid-column:1\/-1!important;display:grid!important/);
});

test('public loading frames remain intentional and multiline conversion headings breathe',async()=>{
  const [styles,index]=await Promise.all([read('portfolio/styles.css'),read('portfolio/index.html')]);
  assert.match(styles,/\.project-media-wrap\{[^}]*radial-gradient\(circle at 78% 18%/);
  assert.match(styles,/\.contact-inner h2\{line-height:\.88\}/);
  assert.match(index,/styles\.css\?v=20261112-project-links-1/);
});

test('homepage project thumbnails are native case-study links, not lightbox targets',async()=>{
  const [app,viewer,styles,index]=await Promise.all([
    read('portfolio/app.js'),
    read('portfolio/image-viewer.js'),
    read('portfolio/styles.css'),
    read('portfolio/index.html')
  ]);
  assert.match(app,/<a class="project-card"[^>]*href="\/work\/\$\{encodeURIComponent\(p\.slug\)\}/);
  assert.doesNotMatch(app,/<article class="project-card"/);
  assert.match(viewer,/closest\?\.\('\.project-card,\.featured-slide'\)/);
  assert.match(styles,/\.project-card \.project-image\{cursor:pointer\}/);
  assert.match(index,/app\.js\?v=20261112-project-links-1/);
  assert.match(index,/image-viewer\.js\?v=20261112-project-links-1/);
  assert.match(index,/styles\.css\?v=20261112-project-links-1/);
});

test('case-study media adapts long Behance boards without tiny letterboxed heroes',async()=>{
  const [project,styles,html]=await Promise.all([
    read('portfolio/project.js'),
    read('portfolio/styles.css'),
    read('portfolio/project.html')
  ]);
  assert.match(project,/classifyProjectMedia/);
  assert.match(project,/standalone\.classList\.add\(`is-\$\{shape\}`\)/);
  assert.match(project,/standalone && shape === 'long'/);
  assert.match(project,/project-detail-hero-frame/);
  assert.match(project,/items\.length === 1 \? ' is-single'/);
  assert.match(styles,/\.project-detail-hero-frame\{[^}]*aspect-ratio:16\/9/);
  assert.match(styles,/\.project-detail-hero-frame \.project-detail-hero\{position:absolute;inset:0;[^}]*height:100%/);
  assert.match(project,/normalizeCaseStudyStyle/);
  assert.match(project,/data-gallery-columns/);
  assert.match(styles,/\.case-gallery\.is-single\.has-long-media img\{width:min\(100%,var\(--case-long-board-max,780px\)\)\}/);
  assert.match(styles,/data-hero-focal="CUSTOM"/);
  assert.match(styles,/\.case-image\.full-bleed\{width:min\(100%,var\(--case-gallery-max,900px\)\)/);
  assert.match(styles,/\.case-image\.full-bleed\.has-long-media\{width:min\(100%,var\(--case-long-board-max,780px\)\)\}/);
  assert.match(project,/normalizeImagePresentation/);
  assert.match(project,/imagePresentationAttributes/);
  assert.match(project,/data-media-width/);
  assert.match(styles,/data-media-width="FULL"/);
  assert.match(styles,/data-media-fit="CONTAIN"/);
  assert.match(styles,/data-media-frame="CARD"/);
  assert.match(styles,/data-mobile-aspect="PORTRAIT"/);
  assert.match(html,/project\.js\?v=20261122-hero-media-2/);
  assert.match(html,/styles\.css\?v=20261122-cms-feedback-1/);
  assert.match(project,/blockMediaUrls/);
  assert.match(project,/mediaUrlKey/);
  assert.match(project,/inheritGalleryPresentation/);
  assert.match(project,/key === 'url' \|\| \/Url\$\//);
  assert.match(project,/renderGallery\(remainingGallery, project\.title\)/);
});

test('project and journal workspaces open on their libraries and reveal editors on demand',async()=>{
  const [admin,styles,html]=await Promise.all([
    read('portfolio/admin.js'),
    read('portfolio/styles.css'),
    read('portfolio/admin.html')
  ]);
  assert.match(admin,/collectionEditorConfig/);
  assert.match(admin,/data-collection-new/);
  assert.match(admin,/\+ NEW PROJECT/);
  assert.match(admin,/\+ NEW JOURNAL \/ BLOG/);
  assert.match(admin,/showCollectionEditor\('project'\)/);
  assert.match(admin,/showCollectionEditor\('content'\)/);
  assert.match(admin,/setCollectionEditor\('project',false\)/);
  assert.match(admin,/setCollectionEditor\('content',false\)/);
  assert.match(styles,/#projectsTab>section:first-child,#contentTab>section:first-child\{display:none\}/);
  assert.match(styles,/\.is-editor-open>section:first-child/);
  assert.match(styles,/\.is-editor-open>section:nth-child\(2\)/);
  assert.match(html,/admin\.js\?v=20261122-hero-media-2/);
  assert.match(html,/styles\.css\?v=20261114-analytics-hero-2/);
});

test('homepage OUTCOMES proof mode always renders proof cards and never inherits a hidden state',async()=>{
  const [html,runtime]=await Promise.all([
    read('portfolio/index.html'),
    read('portfolio/homepage-studio-runtime.js')
  ]);
  assert.match(html,/homepage-studio-runtime\.js\?v=20261127-proof-mode-1/);
  assert.match(runtime,/\['OUTCOMES','BRANDS','HYBRID'\]\.includes\(requestedMode\)\?requestedMode:'OUTCOMES'/);
  assert.match(runtime,/wrap\.dataset\.proofMode=mode;wrap\.hidden=false/);
  assert.match(runtime,/mode==='OUTCOMES'\|\|mode==='HYBRID'/);
  assert.match(runtime,/data\.items\.length\?data\.items:proofFallback/);
});

test('CMS libraries expose save timestamps, live links, compact header and the current hero manager',async()=>{
  const [admin,polish,homepageControls]=await Promise.all([
    read('portfolio/admin.js'),
    read('portfolio/admin-ui-polish.css'),
    read('portfolio/admin-homepage-controls.js')
  ]);
  assert.match(admin,/formatAdminTimestamp/);
  assert.match(admin,/LAST EDITED/);
  assert.match(admin,/VIEW LINK APPEARS WHEN PUBLISHED/);
  assert.match(admin,/publicRecordUrl\('project'/);
  assert.match(admin,/publicRecordUrl\('content'/);
  assert.match(polish,/:not\(\.admin-top\):not\(\.tabs\)/);
  assert.match(polish,/admin-main>\.admin-top\{min-height:0/);
  assert.match(homepageControls,/target:'\.hero-theme-manager'/);
  assert.match(homepageControls,/action:'CUSTOMIZE HERO'/);
});

test('hero media controls support upload, library selection and selected-file navigation',async()=>{
  const [manager,extras,admin,managerStyles]=await Promise.all([
    read('portfolio/admin-homepage-theme-manager.js'),
    read('portfolio/admin-homepage-extras.js'),
    read('portfolio/admin.js'),
    read('portfolio/admin-homepage-theme-manager.css')
  ]);
  assert.match(manager,/hero-media-manager/);
  assert.match(manager,/heroSelectedMediaCard/);
  assert.match(manager,/UPLOAD NEW IMAGE/);
  assert.match(manager,/openAdminMediaLibrary/);
  assert.match(extras,/CHOOSE FROM MEDIA LIBRARY/);
  assert.match(extras,/data-media-alt/);
  assert.match(extras,/Hero image selected/);
  assert.match(admin,/window\.openAdminMediaLibrary/);
  assert.match(managerStyles,/\.hero-selected-media/);
  assert.match(managerStyles,/repeat\(auto-fit,minmax\(min\(100%,360px\),1fr\)\)/);
  assert.match(managerStyles,/\.hero-media-manager-fields>label\{min-width:0\}/);
  assert.match(managerStyles,/@container process-manager \(max-width:720px\)/);
  assert.match(managerStyles,/label:has\(#processIntroAdmin\)\{grid-column:1\/-1\}/);
  assert.match(managerStyles,/button\[aria-pressed=true\]/);
});

test('homepage saves preserve statement data and atomically derive legacy hero fields',async()=>{
  const [manager,route]=await Promise.all([
    read('portfolio/admin-homepage-theme-manager.js'),
    read('src/routes/maintenance.ts')
  ]);
  assert.match(manager,/statementEnvelope/);
  assert.match(manager,/JSON\.stringify\(\{\.\.\.statementEnvelope,process\}/);
  assert.match(manager,/map\(\(item,sortOrder\)=>\(\{\.\.\.item,sortOrder\}\)\)/);
  assert.equal((manager.match(/fetch\('\/api\/admin\/maintenance\/site-config'/g)||[]).length,1);
  assert.match(route,/data\.heroImage=hero\.desktopImage/);
  assert.match(route,/data\.heroLeadText=hero\.leadText/);
  assert.match(route,/data\.heroTypewriterPhrases=phrases/);
});

test('modular project blocks keep full editor geometry instead of collection-row columns',async()=>{
  const [admin,styles,html]=await Promise.all([
    read('portfolio/admin.js'),
    read('portfolio/admin-project-block-editor.css'),
    read('portfolio/admin.html')
  ]);
  assert.equal((admin.match(/class="project-item project-block-editor"/g)||[]).length,2);
  assert.match(styles,/grid-template-columns:\s*minmax\(0, 1fr\) auto !important/);
  assert.match(styles,/textarea\[data-block-data\][\s\S]*?width:\s*100%;[\s\S]*?min-height:\s*180px/);
  assert.match(styles,/> div:first-child > strong[\s\S]*?white-space:\s*normal/);
  assert.match(styles,/@media \(max-width: 900px\)[\s\S]*?grid-template-columns:\s*minmax\(0, 1fr\) !important/);
  assert.match(html,/admin-project-block-editor\.css\?v=20261113-project-block-layout-1/);
});

test('shared typography roles keep admin, login and public forms readable',async()=>{
  const [styles,adminHtml,indexHtml]=await Promise.all([
    read('portfolio/typography-system.css'),
    read('portfolio/admin.html'),
    read('portfolio/index.html')
  ]);
  assert.match(styles,/--type-caption:\s*10px/);
  assert.match(styles,/--type-helper:\s*12px/);
  assert.match(styles,/--type-control:\s*15px/);
  assert.match(styles,/body\.admin-page[\s\S]*?--type-control:\s*14px/);
  assert.match(styles,/#loginForm[\s\S]*?font-size:\s*15px !important/);
  assert.match(styles,/@media \(max-width: 700px\)[\s\S]*?font-size:\s*16px !important/);
  assert.match(styles,/@media \(max-width: 700px\)[\s\S]*?body\.admin-page #loginForm :where\(input, select, textarea\)[\s\S]*?font-size:\s*16px !important/);
  assert.match(adminHtml,/typography-system\.css\?v=20261122-login-mobile-1/);
  assert.match(indexHtml,/typography-system\.css\?v=20261113-typography-1/);
});

test('preview homepage uses a capsule navigation and CMS-compatible full-bleed hero',async()=>{
  const [html,styles,app]=await Promise.all([
    read('portfolio/index.html'),
    read('portfolio/homepage-cinematic-preview.css'),
    read('portfolio/app.js')
  ]);
  assert.match(html,/class="hero hero-cinematic-preview"/);
  assert.match(html,/assets\/hero-portrait\.png/);
  assert.match(html,/homepage-cinematic-preview\.css\?v=20261114-scrollbar-1/);
  assert.match(styles,/border-radius:\s*999px/);
  assert.match(styles,/\.hero-cinematic-preview \.hero-visual\s*\{[\s\S]*?position:\s*absolute/);
  assert.match(styles,/\.hero-cinematic-preview \.hero-visual img[\s\S]*?object-fit:\s*cover/);
  assert.match(styles,/@media \(max-width: 800px\)/);
  assert.match(app,/document\.querySelector\('\.hero-visual img'\)/);
});

test('preview featured-project navigation uses the themed compact scrollbar',async()=>{
  const styles=await read('portfolio/homepage-cinematic-preview.css');
  assert.match(styles,/\.featured-project-nav\s*\{[\s\S]*?scrollbar-color:/);
  assert.match(styles,/\.featured-project-nav::\-webkit-scrollbar\s*\{[\s\S]*?width:\s*8px/);
  assert.match(styles,/\.featured-project-nav::\-webkit-scrollbar-thumb/);
  assert.match(styles,/background:\s*linear-gradient\(180deg,\s*rgba\(198,\s*255,\s*76/);
  assert.match(styles,/::-webkit-scrollbar-button\s*\{\s*display:\s*none/);
});

test('preview homepage services use a CMS-managed accessible accordion',async()=>{
  const [html,styles,runtime,manager,managerStyles,pageStudio,moduleLibrary]=await Promise.all([
    read('portfolio/index.html'),
    read('portfolio/services-accordion-preview.css'),
    read('portfolio/services-accordion-preview.js'),
    read('portfolio/admin-services-manager.js'),
    read('portfolio/admin-services-manager.css'),
    read('portfolio/admin-page-studio.js'),
    read('portfolio/admin-module-library.js')
  ]);
  assert.match(html,/services-accordion-preview\.css\?v=20261113-1/);
  assert.match(html,/services-accordion-preview\.js\?v=20261113-1/);
  assert.match(runtime,/aria-expanded/);
  assert.match(runtime,/role="region"/);
  assert.match(runtime,/MutationObserver/);
  assert.match(runtime,/window\.renderServiceAccordion/);
  assert.match(styles,/clip-path:polygon/);
  assert.match(styles,/\.service-accordion-item\.is-open/);
  assert.match(styles,/@media\(max-width:760px\)/);
  assert.match(manager,/\+ ADD SERVICE/);
  assert.match(manager,/data-service-remove/);
  assert.match(manager,/data-service-up/);
  assert.match(manager,/data-service-primary/);
  assert.match(manager,/capabilitiesConfig/);
  assert.match(manager,/admin:siteconfigloaded/);
  assert.match(managerStyles,/\.services-manager-layout/);
  assert.match(pageStudio,/admin-services-manager\.js/);
  assert.match(pageStudio,/admin-services-manager\.css/);
  assert.match(moduleLibrary,/title, description, tags, url, label, primary, enabled, sortOrder/);
});

test('preview homepage exposes two CMS hero themes plus dynamic skills and process modules',async()=>{
  const [html,runtime,styles,manager,managerStyles,pageStudio,admin]=await Promise.all([
    read('portfolio/index.html'),
    read('portfolio/homepage-theme-modules.js'),
    read('portfolio/homepage-theme-modules.css'),
    read('portfolio/admin-homepage-theme-manager.js'),
    read('portfolio/admin-homepage-theme-manager.css'),
    read('portfolio/admin-page-studio.js'),
    read('portfolio/admin.js')
  ]);
  assert.match(html,/id="process"/);
  assert.match(html,/homepage-theme-modules\.js\?v=20261122-hero-media-2/);
  assert.match(html,/homepage-theme-modules\.css\?v=20261122-hero-media-2/);
  assert.match(runtime,/hero-profile-preview/);
  assert.match(runtime,/hero-cinematic-preview/);
  assert.match(runtime,/hero-theme/);
  assert.match(runtime,/profile-spotlight/);
  assert.match(runtime,/showTicker/);
  assert.match(runtime,/settings\.statementConfig/);
  assert.match(runtime,/processTrack/);
  assert.match(runtime,/IntersectionObserver/);
  assert.match(runtime,/--step-index/);
  assert.match(runtime,/--process-count/);
  assert.match(runtime,/--hero-focal-point/);
  assert.match(styles,/\.hero-profile-preview/);
  assert.match(styles,/\.process-track/);
  assert.match(styles,/\.process-section\.is-process-visible \.process-progress/);
  assert.match(styles,/@keyframes processTracer/);
  assert.match(styles,/\.process-icon::before/);
  assert.match(styles,/\.process-connector-base/);
  assert.match(styles,/stroke-dasharray:4 9/);
  assert.match(styles,/data-connector-style="WAVE_DASHED"/);
  assert.match(styles,/processWaveDashFlow/);
  assert.match(styles,/@keyframes processContentIn/);
  assert.match(styles,/\.process-step\{opacity:1\}/);
  assert.match(runtime,/class="process-connector"/);
  assert.match(runtime,/--step-delay:/);
  assert.match(runtime,/processIcons=\{search:/);
  assert.match(manager,/processIconOptions/);
  assert.match(styles,/\.skills-section \.skill-card/);
  assert.match(manager,/data-hero-theme="CINEMATIC"/);
  assert.match(manager,/data-hero-theme="PROFILE"/);
  assert.match(manager,/heroThemeImageUpload/);
  assert.match(manager,/VIEW PROFILE SHOWCASE/);
  assert.match(manager,/data-hero-toggle/);
  assert.match(manager,/spotlightLabel/);
  assert.match(manager,/heroTypewriterPreset/);
  assert.match(manager,/heroTypewriterPhrases/);
  assert.match(manager,/maintenance\/site-config/);
  assert.match(manager,/statementConfig/);
  assert.match(manager,/data-process-remove/);
  assert.match(manager,/stopImmediatePropagation/);
  assert.match(managerStyles,/\.hero-theme-options/);
  assert.match(managerStyles,/\.preview-spotlight/);
  assert.match(managerStyles,/data-connector="DOTTED"/);
  assert.match(pageStudio,/admin-homepage-theme-manager\.js/);
  assert.match(pageStudio,/admin-homepage-theme-manager\.css/);
  assert.match(pageStudio,/20261127-admin-layout-5/);
  assert.match(manager,/DOTTED JOURNEY/);
  assert.match(runtime,/DOTTED:/);
  assert.match(styles,/data-connector-style="DOTTED"/);
  assert.match(admin,/skillsConfig/);
});

test('admin homepage previews stay live and long workspaces expose contextual navigation',async()=>{
  const [manager,managerStyles,index,indexStyles,dock,dockStyles,loader,html,capsuleStyles,adminUiStyles]=await Promise.all([
    read('portfolio/admin-homepage-theme-manager.js'),
    read('portfolio/admin-homepage-theme-manager.css'),
    read('portfolio/admin-context-index.js'),
    read('portfolio/admin-context-index.css'),
    read('portfolio/admin-preview-dock.js'),
    read('portfolio/admin-preview-dock.css'),
    read('portfolio/admin-page-studio.js'),
    read('portfolio/admin.html'),
    read('portfolio/public-capsule-nav.css'),
    read('portfolio/admin-ui-polish.css')
  ]);
  assert.match(manager,/LIVE HERO PREVIEW/);
  assert.match(manager,/animateHeroPreview/);
  assert.match(manager,/prefers-reduced-motion: reduce/);
  assert.match(manager,/reducedMotionQuery\?\.matches/);
  assert.match(manager,/processIconPaths/);
  assert.match(manager,/process-preview-step/);
  assert.match(managerStyles,/adminHeroPreviewDrift/);
  assert.match(managerStyles,/#processManagerPreview \.process-preview-step b svg/);
  assert.match(index,/adminContextRail/);
  assert.match(index,/scrollIntoView\(\{behavior:'smooth',block:'start'\}\)/);
  assert.match(index,/candidateHeadings/);
  assert.match(index,/lastSignature/);
  assert.match(index,/lockedId/);
  assert.match(index,/admin:contexttarget/);
  assert.match(indexStyles,/has-context-rail\.context-rail-active\{grid-template-columns:248px minmax\(0,1fr\) 210px/);
  assert.match(index,/classList\.toggle\('context-rail-active',useful\)/);
  assert.match(indexStyles,/\.admin-context-rail\.is-empty\{display:none/);
  assert.match(dock,/siteModulePreviewCanvas/);
  assert.match(dock,/data-preview-dock/);
  assert.match(dock,/admin:contexttarget/);
  assert.match(dockStyles,/\.hero-theme-layout,\.admin-page \.process-manager-layout,\.admin-page \.services-manager-layout/);
  assert.match(dockStyles,/display:none!important/);
  assert.match(adminUiStyles,/container:site-modules \/ inline-size/);
  assert.match(adminUiStyles,/@container site-modules \(max-width:1240px\)/);
  assert.match(loader,/admin-context-index\.js/);
  assert.match(loader,/admin-preview-dock\.js/);
  assert.match(html,/admin-page-studio\.js\?v=20261126-admin-layout-4/);
  assert.match(capsuleStyles,/@media\(prefers-reduced-motion:reduce\)/);
  assert.match(capsuleStyles,/transition:none!important/);
  assert.match(capsuleStyles,/main:not\(#top\)\{padding-top:96px\}/);
  assert.match(await read('portfolio/responsive.js'),/public-capsule-nav\.css\?v=20261122-1/);
});

test('admin CMS layout, collection refresh and settings ownership stay consistent',async()=>{
  const [admin,account,accountStyles,uiStyles,styles]=await Promise.all([
    read('portfolio/admin.js'),
    read('portfolio/admin-account-upgrade.js'),
    read('portfolio/admin-account-upgrade.css'),
    read('portfolio/admin-ui-polish.css'),
    read('portfolio/styles.css')
  ]);
  assert.match(admin,/async function refreshAdminCollection\(kind\)/);
  assert.match(admin,/if\(name==='projects'\)refreshAdminCollection\('projects'\)/);
  assert.match(admin,/if\(name==='content'\)refreshAdminCollection\('content'\)/);
  assert.match(account,/function relocateGlobalAppearance\(\)/);
  assert.match(account,/#maintenanceSite/);
  assert.match(account,/globalAppearanceSettings/);
  assert.match(account,/appearance=\$\('#themePreset'\)\?\.closest\('\.panel'\)/);
  assert.match(account,/appearance\.parentElement!==destination/);
  assert.doesNotMatch(account,/account-upgrade-grid > \.panel:first-child/);
  assert.match(accountStyles,/\.global-appearance-panel/);
  assert.match(uiStyles,/#maintenanceOverview \.status-grid\{grid-template-columns:repeat\(auto-fit,minmax\(132px,1fr\)\)/);
  assert.match(styles,/\.motion-savebar\{position:relative;z-index:1/);
  assert.doesNotMatch(styles,/\.motion-savebar\{position:sticky/);
  assert.match(styles,/@media\(min-width:921px\)\{\.admin-page \.homepage-section-card\{grid-template-columns:minmax\(180px,\.75fr\) minmax\(0,1\.45fr\) auto/);
});

test('all public shells version the shared responsive navigation runtime',async()=>{
  const publicShells=['404.html','blog.html','creative-lab.html','creative-tool.html','hire.html','index.html','preview.html','project.html','service.html','share.html','studio.html','work.html'];
  const shells=await Promise.all(publicShells.map(file=>read(`portfolio/${file}`)));
  shells.forEach((shell,index)=>assert.match(shell,/responsive\.js\?v=20261122-nav-1/,`${publicShells[index]} must use the current shared navigation cache key`));
});
