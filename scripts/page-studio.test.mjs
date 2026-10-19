import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const read=file=>fs.readFileSync(new URL(`../${file}`,import.meta.url),'utf8');

test('Page Studio migration is additive and preserves existing data',()=>{
  const sql=read('prisma/migrations/0021_page_studio/migration.sql');
  assert.match(sql,/ADD COLUMN "pageStudioConfig"/);
  assert.match(sql,/CREATE TABLE "CustomPage"/);
  assert.match(sql,/"publishedSnapshot" JSONB/);
  assert.doesNotMatch(sql,/\b(?:DROP|TRUNCATE|DELETE FROM)\b/i);
});

test('public delivery has two independent activation gates',()=>{
  const core=read('src/lib/page-studio.ts');
  const route=read('src/routes/page-studio-public.ts');
  assert.match(core,/PAGE_STUDIO_EMERGENCY_DISABLED!=='true'/);
  assert.match(core,/publicEnabled:false/);
  assert.match(route,/pageStudioSystemEnabled\(\).*config\.publicEnabled/);
});

test('draft saves cannot bypass the explicit publish endpoint',()=>{
  const route=read('src/routes/page-studio.ts');
  assert.match(route,/status:existing\.status/);
  assert.match(route,/publishedSnapshot/);
  assert.match(route,/router\.post\('\/pages\/:id\/publish'/);
  assert.match(route,/retentionCount:studioConfig\.maxRevisions/);
});

test('builder reuses media and page saves do not write Blob objects',()=>{
  const route=read('src/routes/page-studio.ts');
  const editor=read('portfolio/page-studio.js');
  assert.match(route,/blobWritesOnPageSave:0/);
  assert.match(route,/db\.media\.findMany/);
  assert.match(editor,/openMediaPicker/);
  assert.doesNotMatch(route,/\bput\(|uploadStored|BLOB_READ_WRITE_TOKEN/);
});

test('embeds and editor preview retain isolation controls',()=>{
  const renderer=read('portfolio/page-studio-renderer.js');
  const route=read('src/routes/page-studio.ts');
  assert.match(renderer,/sandbox="allow-scripts allow-same-origin allow-forms allow-popups"/);
  assert.match(route,/Trusted Embed Sources/);
  assert.match(renderer,/event\.dataTransfer\.getData\('application\/x-page-studio-widget'\)/);
});

test('custom pages keep analytics, SEO, backup and media maintenance coverage',()=>{
  const html=read('portfolio/custom-page.html');
  const app=read('src/app.ts');
  const operations=read('src/routes/operations.ts');
  assert.match(html,/\/analytics\.js/);
  assert.match(app,/publicStudioEnabled/);
  assert.match(operations,/customPages/);
  assert.match(operations,/publishedSnapshot:row\.publishedSnapshot/);
});

test('publish waits for the newest draft save to succeed',()=>{
  const editor=read('portfolio/page-studio.js');
  assert.match(editor,/const saved=await savePage\(false\)/);
  assert.match(editor,/if\(!saved\|\|dirty\)/);
  assert.match(editor,/Publish stopped because the latest draft could not be saved/);
});

test('revision restore preserves live status and unpublish remains explicit',()=>{
  const route=read('src/routes/page-studio.ts');
  const editor=read('portfolio/page-studio.js');
  const restoreRoute=route.slice(route.indexOf("router.post('/pages/:id/revisions/:revisionId/restore'"),route.indexOf('const namedBlocksSchema'));
  assert.doesNotMatch(restoreRoute,/status:'DRAFT'/);
  assert.match(route,/router\.post\('\/pages\/:id\/unpublish'/);
  assert.match(editor,/id='studioUnpublish'|#studioUnpublish/);
});

test('responsive toolbar keeps save, preview and device controls available',()=>{
  const css=read('portfolio/page-studio.css');
  assert.doesNotMatch(css,/\.studio-actions #studioSave\{display:none\}/);
  assert.match(css,/\.studio-actions #studioSave,\.studio-actions #studioPreview\{display:block\}/);
  assert.match(css,/\.studio-devices\{display:flex;order:4/);
});

test('common YouTube share URLs are normalized before trusted-origin validation',()=>{
  const route=read('src/routes/page-studio.ts');
  const renderer=read('portfolio/page-studio-renderer.js');
  assert.match(route,/url\.hostname==='youtu\.be'/);
  assert.match(route,/youtube\.com\/embed/);
  assert.match(renderer,/const embedUrl=/);
  assert.match(renderer,/allowfullscreen/);
});

test('feature controls and production navigation preserve safe fallbacks',()=>{
  const flags=read('src/lib/feature-flags.ts');
  const runtime=read('portfolio/production-navigation.js');
  const admin=read('portfolio/admin-system-controls.js');
  const migration=read('prisma/migrations/0022_feature_control_center/migration.sql');
  assert.match(flags,/productionNavigation:z\.boolean\(\)\.default\(false\)/);
  assert.match(runtime,/if\(!flags\.productionNavigation\|\|!items\.length\)return/);
  assert.match(admin,/hardcoded menu remains the automatic fallback/);
  assert.doesNotMatch(migration,/\b(?:DROP|TRUNCATE|DELETE FROM)\b/i);
});

test('editorial widgets and testimonials are available without new media writes',()=>{
  const schema=read('src/lib/page-studio.ts');
  const editor=read('portfolio/page-studio.js');
  const renderer=read('portfolio/page-studio-renderer.js');
  const adminRoute=read('src/routes/page-studio.ts');
  const publicRoute=read('src/routes/page-studio-public.ts');
  assert.match(schema,/EDITORIAL_SHOWCASE/);
  assert.match(schema,/COLLECTION_GRID/);
  assert.match(schema,/TESTIMONIAL_CAROUSEL/);
  assert.match(editor,/Editorial showcase/);
  assert.match(renderer,/data-ps-testimonials/);
  assert.match(adminRoute,/db\.testimonial\.findMany/);
  assert.match(publicRoute,/testimonials/);
  assert.doesNotMatch(renderer,/\/api\/admin\/maintenance\/media/);
});

test('public social links normalize common profile handles and slider stays uncluttered',()=>{
  const app=read('portfolio/app.js');
  const upgrade=read('portfolio/editorial-upgrade.js');
  const css=read('portfolio/editorial-upgrade.css');
  assert.match(app,/function normalizeSocialUrl/);
  assert.match(app,/https:\/\/www\.linkedin\.com\/in\//);
  assert.match(app,/https:\/\/www\.instagram\.com\//);
  assert.doesNotMatch(upgrade,/createElement\('div'\).*featured-stage-overlay/);
  assert.doesNotMatch(css,/\.featured-stage-overlay\{/);
  assert.doesNotMatch(css,/\.featured-orb\{/);
});

test('authenticated demo preview fills every new public module without database writes',()=>{
  const app=read('portfolio/app.js');
  const upgrade=read('portfolio/editorial-upgrade.js');
  assert.match(app,/const demoSocialLinks=/);
  assert.match(app,/DEMO_PREVIEW\?demoSocialLinks/);
  assert.match(upgrade,/const DEMO_TESTIMONIALS=/);
  assert.match(upgrade,/fetch\('\/api\/auth\/me'/);
  assert.match(upgrade,/demo\?DEMO_TESTIMONIALS/);
  assert.doesNotMatch(upgrade,/method:'POST'/);
  assert.doesNotMatch(upgrade,/method:'PATCH'/);
});

test('Homepage Studio keeps draft and production snapshots separate with a stable fallback',()=>{
  const schema=read('src/lib/homepage-studio.ts');
  const adminRoute=read('src/routes/page-studio.ts');
  const publicRoute=read('src/routes/page-studio-public.ts');
  const runtime=read('portfolio/homepage-studio-runtime.js');
  assert.match(schema,/draft:homepageStudioLayoutSchema/);
  assert.match(schema,/published:homepageStudioLayoutSchema\.nullable/);
  assert.match(adminRoute,/router\.post\('\/homepage-studio\/publish'/);
  assert.match(adminRoute,/router\.post\('\/homepage-studio\/disable'/);
  assert.match(publicRoute,/state\.live\?state\.published:null/);
  assert.match(runtime,/if\(payload\.live&&payload\.layout\)applyLayout/);
});

test('Page Studio starter library includes portfolio, lead and support patterns without new services',()=>{
  const schema=read('src/lib/page-studio.ts');
  for(const template of ['Case study','Project inquiry','Proof & testimonials','About & availability','FAQ & support'])assert.match(schema,new RegExp(`name:'${template.replace(/[&]/g,'\\&')}'`));
  assert.match(schema,/defaultBlock\('CONTACT','template-inquiry-contact'\)/);
  assert.match(schema,/defaultBlock\('TESTIMONIAL_CAROUSEL','template-proof-testimonials'\)/);
  assert.match(schema,/defaultBlock\('CV_DOWNLOAD','template-about-cv'\)/);
  assert.doesNotMatch(schema,/BLOB_READ_WRITE_TOKEN|put\(/);
});

test('widget inspector flushes edits before reselection and pages have a portable WordPress handoff',()=>{
  const editor=read('portfolio/page-studio.js');
  const html=read('portfolio/page-studio.html');
  assert.match(editor,/function flushInspectorDraft\(\)/);
  assert.match(editor,/flushInspectorDraft\(\);selectedId=event\.data\.id/);
  assert.match(editor,/input\.tagName==='SELECT'\?'change':'input'/);
  assert.match(editor,/function exportWordPress\(\)/);
  assert.match(editor,/portfolio-page-studio-wordpress-handoff\/v1/);
  assert.match(html,/id="studioWordpress"/);
});

test('custom code keeps isolation and displays JavaScript errors inside its own frame',()=>{
  const renderer=read('portfolio/page-studio-renderer.js');
  assert.match(renderer,/sandbox="allow-scripts"/);
  assert.match(renderer,/connect-src 'none'/);
  assert.match(renderer,/Custom JavaScript error/);
  assert.match(renderer,/window\.addEventListener\('unhandledrejection'/);
});

test('Homepage Studio supports reorderable nested social, code and trusted website modules',()=>{
  const editor=read('portfolio/homepage-studio.js');
  const runtime=read('portfolio/homepage-studio-runtime.js');
  const route=read('src/routes/page-studio.ts');
  assert.match(editor,/function nest\(/);
  assert.match(editor,/draggable="true"/);
  assert.match(editor,/SOCIAL_LINKS/);
  assert.match(runtime,/homepage-studio-slot-\$\{key\}/);
  assert.match(runtime,/hasSocialBlock/);
  assert.match(runtime,/about\.appendChild\(lastSocialTemplate\.cloneNode\(true\)\)/);
  assert.match(runtime,/frame\.sandbox='allow-scripts'/);
  assert.match(runtime,/connect-src 'none'/);
  assert.match(route,/validateHomepageEmbeds/);
  assert.match(route,/Trusted Embed Sources/);
});

test('Page Studio custom code is isolated and website embeds use the shared allow-list',()=>{
  const schema=read('src/lib/page-studio.ts');
  const editor=read('portfolio/page-studio.js');
  const renderer=read('portfolio/page-studio-renderer.js');
  const route=read('src/routes/page-studio.ts');
  assert.match(schema,/WEBSITE_EMBED/);
  assert.match(schema,/CUSTOM_CODE/);
  assert.match(editor,/HTML \/ CSS \/ JS/);
  assert.match(renderer,/script-src 'unsafe-inline'/);
  assert.match(renderer,/Content-Security-Policy/);
  assert.match(renderer,/sandbox="allow-scripts"/);
  assert.match(route,/\['EMBED','WEBSITE_EMBED','VIDEO'\]/);
});

test('advanced builder controls cover six columns, nested drops, Lottie files and reusable visual styling',()=>{
  const editor=read('portfolio/page-studio.js');
  const renderer=read('portfolio/page-studio-renderer.js');
  const css=read('portfolio/page-studio-public.css');
  assert.match(editor,/\['1','2','3','4','5','6'\]/);
  assert.match(editor,/hasDescendant/);
  assert.match(editor,/data-lottie-file/);
  assert.match(editor,/marginTop/);
  assert.match(editor,/borderRadius/);
  assert.match(renderer,/ps-column-cell/);
  assert.match(renderer,/stopPropagation\(\)/);
  assert.match(renderer,/animationData/);
  assert.match(css,/--ps-columns/);
});

test('new column layouts keep independent drop slots without changing legacy layouts automatically',()=>{
  const editor=read('portfolio/page-studio.js');
  const renderer=read('portfolio/page-studio-renderer.js');
  const css=read('portfolio/page-studio-public.css');
  assert.match(editor,/function columnSlot/);
  assert.match(editor,/function ensureFixedSlots/);
  assert.match(editor,/LEGACY FLOW LAYOUT/);
  assert.match(renderer,/fixedColumnChildren/);
  assert.match(css,/ps-column-slot/);
});

test('YouTube embeds send client identity required by the IFrame API',()=>{
  const renderer=read('portfolio/page-studio-renderer.js');
  const homepage=read('portfolio/homepage-studio-runtime.js');
  for(const source of [renderer,homepage]){
    assert.match(source,/widget_referrer/);
    assert.match(source,/origin/);
    assert.match(source,/strict-origin-when-cross-origin/);
  }
});

test('theme, private admin entry and role management remain additive and secret-safe',()=>{
  const migration=read('prisma/migrations/0023_builder_theme_users/migration.sql');
  const auth=read('src/routes/auth.ts');
  const publicRoute=read('src/routes/public.ts');
  const app=read('src/app.ts');
  const admin=read('portfolio/admin-account-upgrade.js');
  assert.doesNotMatch(migration,/\b(?:DROP|TRUNCATE|DELETE FROM)\b/i);
  assert.match(auth,/WRITER','MODERATOR','VIEWER/);
  assert.match(auth,/admin-config/);
  assert.match(publicRoute,/securityConfig:___/);
  assert.match(app,/hideCanonicalAdmin/);
  assert.match(admin,/Theme & grain/);
  assert.match(admin,/Users & roles/);
});

test('public theme and anchor runtimes are loaded without replacing existing page scripts',()=>{
  const responsive=read('portfolio/responsive.js');
  const theme=read('portfolio/theme-runtime.js');
  const anchor=read('portfolio/anchor-runtime.js');
  assert.match(responsive,/theme-runtime\.js/);
  assert.match(responsive,/anchor-runtime\.js/);
  assert.match(theme,/--grain-size/);
  assert.match(anchor,/getBoundingClientRect/);
  assert.match(anchor,/MutationObserver/);
});

test('Homepage Studio hydrates managed content without duplicating canonical CMS records',()=>{
  const schema=read('src/lib/homepage-studio.ts');
  const adminRoute=read('src/routes/page-studio.ts');
  const publicRoute=read('src/routes/page-studio-public.ts');
  const editor=read('portfolio/homepage-studio.js');
  const runtime=read('portfolio/homepage-studio-runtime.js');
  assert.match(schema,/resolveHomepageStudioSections/);
  assert.match(schema,/source:'SKILLS MANAGER'/);
  assert.match(adminRoute,/resolvedSections/);
  assert.match(publicRoute,/resolveHomepageStudioSections/);
  assert.match(editor,/MANAGED VALUE/);
  assert.match(editor,/RESET TO MANAGED VALUE/);
  assert.match(editor,/delete block\.data\[button\.dataset\.resetField\]/);
  assert.match(runtime,/payload\.resolvedSections/);
  assert.match(runtime,/sectionData=\{\.\.\.managed,\.\.\.\(block\.data\|\|\{\}\)\}/);
});
