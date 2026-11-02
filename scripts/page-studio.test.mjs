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
  const pageHtml=read('portfolio/page-studio.html');
  const homepageHtml=read('portfolio/homepage-studio.html');
  const homepagePolish=read('portfolio/homepage-studio-polish.css');
  assert.doesNotMatch(css,/\.studio-actions #studioSave\{display:none\}/);
  assert.match(css,/\.studio-actions #studioSave,\.studio-actions #studioPreview\{display:block\}/);
  assert.match(css,/\.studio-devices\{display:flex;order:4/);
  assert.match(pageHtml,/class="studio-back" href="\/admin\.html#admin-dashboard"/);
  assert.match(homepageHtml,/class="hs-back" href="\/admin\.html#admin-homepage"/);
  assert.match(css,/\.studio-back\{display:inline-flex/);
  assert.match(homepagePolish,/\.hs-back\{display:inline-flex/);
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
  assert.match(editor,/portfolio-page-studio-wordpress-handoff\/v2/);
  assert.match(editor,/requiresManualReview/);
  assert.match(editor,/mediaManifest/);
  assert.match(html,/id="studioWordpress"/);
});

test('selecting an existing page always reveals its live canvas',()=>{
  const editor=read('portfolio/page-studio.js');
  assert.match(editor,/function selectPage\(id\).*?\$\('#canvasEmpty'\)\.classList\.add\('hidden'\).*?\$\('#canvasViewport'\)\.classList\.remove\('hidden'\)/);
});

test('autosave keeps the active widget object stable while inspector fields remain open',()=>{
  const editor=read('portfolio/page-studio.js');
  assert.match(editor,/const savePageWithStableBlocks=savePage/);
  assert.match(editor,/preservedBlocks=current\?\.blocks/);
  assert.match(editor,/current\.blocks=preservedBlocks/);
  assert.match(editor,/cached\.blocks=clone\(preservedBlocks\)/);
});

test('custom code keeps isolation and displays JavaScript errors inside its own frame',()=>{
  const renderer=read('portfolio/page-studio-renderer.js');
  assert.match(renderer,/sandbox="allow-scripts"/);
  assert.match(renderer,/connect-src 'none'/);
  assert.match(renderer,/Custom JavaScript error/);
  assert.match(renderer,/window\.addEventListener\('unhandledrejection'/);
  assert.match(renderer,/Add HTML, CSS or JavaScript in the widget settings/);
});

test('shared slider enhancement safely skips pages without a featured item',()=>{
  const app=read('portfolio/app.js');
  assert.match(app,/function reflectionAllowed\(item\)\{return Boolean\(item&&sliderConfig\?\.reflectionEnabled/);
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

test('rounded Page Studio containers clip nested column content',()=>{
  const renderer=read('portfolio/page-studio-renderer.js');
  const css=read('portfolio/page-studio-public.css');
  assert.match(renderer,/data-rounded=/);
  assert.match(css,/\.ps-widget\[data-rounded=true\]\{overflow:hidden/);
  assert.match(css,/\[data-widget=COLUMNS\] \.ps-columns\{overflow:hidden;border-radius:inherit/);
});

test('structured site modules include inline schemas, examples and validation help',()=>{
  const library=read('portfolio/admin-module-library.js');
  for(const field of ['heroConfig','capabilitiesConfig','navigationConfig','footerConfig','aboutConfig','amazonConfig','socialLinks'])assert.match(library,new RegExp(`${field}:\\{`));
  assert.match(library,/data-guide-copy/);
  assert.match(library,/data-guide-insert/);
  assert.match(library,/data-guide-validate/);
  assert.match(library,/developer\.mozilla\.org/);
  assert.match(library,/jsonlint\.com/);
});

test('Homepage Studio includes draft-only conversion modules with editable demo content',()=>{
  const schema=read('src/lib/homepage-studio.ts');
  const editor=read('portfolio/homepage-studio.js');
  const runtime=read('portfolio/homepage-studio-runtime.js');
  const html=read('portfolio/homepage-studio.html');
  for(const type of ['ANNOUNCEMENT','PROOF_STRIP','PROCESS_STEPS','TESTIMONIAL_CAROUSEL','FAQ']){
    assert.match(schema,new RegExp(`'${type}'`));
    assert.match(editor,new RegExp(type));
    assert.match(runtime,new RegExp(`block\\.type==='${type}'`));
  }
  assert.match(editor,/function loadDemoKit\(/);
  assert.match(editor,/Production will not change until you publish/);
  assert.match(html,/id="loadDemoKit"/);
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
  assert.match(renderer,/DROP WIDGET HERE/);
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

test('structured module library offers twenty-four presets and coordinated draft-only site packs',()=>{
  const source=read('portfolio/admin-module-library.js');
  assert.match(source,/const sitePacks=\[/);
  assert.match(source,/Amazon Creative Specialist/);
  assert.match(source,/Available Freelancer/);
  assert.match(source,/never saves|never save|never publishes|never publish/i);
  assert.ok((source.match(/id:'(?:hero|capabilities|navigation|about|amazon|footer|social)-/g)||[]).length>=24);
  assert.ok((source.match(/presets:\[/g)||[]).length>=5);
});

test('Homepage Studio includes twelve non-destructive layout presets',()=>{
  const source=read('portfolio/homepage-studio.js');
  assert.match(source,/const homepagePresets=\[/);
  assert.ok((source.match(/^\s+\['[^']+','[^']+'/gm)||[]).length>=12);
  assert.match(source,/top\.forEach\(block=>\{if\(!used\.has\(block\.id\)\)ordered\.push\(block\)\}\)/);
  assert.match(source,/presetRollback/);
});

test('specialist templates and high-value portfolio widgets share schema editor and renderer support',()=>{
  const schema=read('src/lib/page-studio.ts');
  const editor=read('portfolio/page-studio.js');
  const renderer=read('portfolio/page-studio-renderer.js');
  for(const widget of ['TRUST_STRIP','OUTCOME_METRICS','PROCESS_TIMELINE','BEFORE_AFTER','FILTERABLE_PROJECT_GRID','SERVICE_PACKAGES','MEDIA_MOSAIC','AVAILABILITY_CTA']){
    assert.match(schema,new RegExp(widget));
    assert.match(editor,new RegExp(widget));
    assert.match(renderer,new RegExp(`case'${widget}'`));
  }
  for(const slug of ['amazon-a-plus-service','amazon-storefront','brand-identity-service','web-ui-service','motion-design-service','campaign-launch'])assert.match(schema,new RegExp(slug));
  assert.doesNotMatch(editor,/@vercel\/blob|put\(/);
});

test('every registered Page Studio widget is selectable and has a renderer path',()=>{
  const schema=read('src/lib/page-studio.ts');
  const editor=read('portfolio/page-studio.js');
  const renderer=read('portfolio/page-studio-renderer.js');
  const match=schema.match(/PAGE_STUDIO_WIDGETS=\[([^\]]+)\]/);
  assert.ok(match,'PAGE_STUDIO_WIDGETS registry was not found');
  const widgets=[...match[1].matchAll(/'([A-Z_]+)'/g)].map(item=>item[1]);
  assert.ok(widgets.length>=35,'expected the complete widget registry');
  for(const widget of widgets){
    assert.match(editor,new RegExp(`['\"]${widget}['\"]`),`${widget} is missing from the editor library`);
    assert.match(renderer,new RegExp(`case'${widget}'`),`${widget} is missing from the renderer`);
  }
});

test('interactive portfolio modules use managed CMS data and stay responsive',()=>{
  const pageSchema=read('src/lib/page-studio.ts');
  const homeSchema=read('src/lib/homepage-studio.ts');
  const adminRoute=read('src/routes/page-studio.ts');
  const publicRoute=read('src/routes/page-studio-public.ts');
  const homeEditor=read('portfolio/homepage-studio.js');
  const homeRuntime=read('portfolio/homepage-studio-runtime.js');
  const homeCss=read('portfolio/homepage-studio-runtime.css');
  for(const widget of ['PROJECT_EXPLORER','BENTO_SNAPSHOT','CASE_STORY']){
    assert.match(pageSchema,new RegExp(widget));
    assert.match(homeSchema,new RegExp(widget));
    assert.match(homeEditor,new RegExp(widget));
    assert.match(homeRuntime,new RegExp(`block\\.type==='${widget}'`));
  }
  assert.match(pageSchema,/interactive-portfolio/);
  assert.match(adminRoute,/resultMetrics:\{where:\{verified:true,visible:true\}/);
  assert.match(publicRoute,/projects:dynamic\.projects,brands:dynamic\.brands/);
  assert.match(homeRuntime,/aria-selected/);
  assert.match(homeRuntime,/prefers-reduced-motion/);
  assert.match(homeCss,/@media\(max-width:600px\)/);
  assert.match(homeCss,/@media\(prefers-reduced-motion:reduce\)/);
});

test('four lightweight futuristic presets stay draft-safe and share visual systems',()=>{
  const schema=read('src/lib/page-studio.ts');
  const editor=read('portfolio/homepage-studio.js');
  const homeRuntime=read('portfolio/homepage-studio-runtime.js');
  const homeCss=read('portfolio/homepage-studio-runtime.css');
  const pageCss=read('portfolio/page-studio-public.css');
  for(const name of ['Neon Grid Portfolio','Signal Bento','Case File Editorial','Soft Future']){
    assert.match(schema,new RegExp(name));
    assert.match(editor,new RegExp(name));
  }
  for(const visual of ['NEON_GRID','SIGNAL_BENTO','CASE_FILE','SOFT_FUTURE']){
    assert.match(editor,new RegExp(visual));
    assert.match(homeCss,new RegExp(visual));
  }
  assert.match(homeRuntime,/dataset\.homeVisual/);
  assert.match(pageCss,/ps-theme-neon/);
  assert.match(pageCss,/ps-theme-soft/);
  assert.match(editor,/unsaved draft/i);
});

test('Page Studio protects concurrent edits and saves before opening preview',()=>{
  const route=read('src/routes/page-studio.ts');
  const pageEditor=read('portfolio/page-studio.js');
  const homeEditor=read('portfolio/homepage-studio.js');
  assert.match(route,/EXPECTED_VERSION_REQUIRED/);
  assert.match(route,/code:'EDIT_CONFLICT'/);
  assert.match(route,/updateMany\(\{where:\{id:existing\.id,updatedAt:expectedUpdatedAt\}/);
  assert.match(route,/expected=req\.body\?\.expectedUpdatedAt\?\?null/);
  assert.match(pageEditor,/studioPreview'\)\.onclick=async/);
  assert.match(pageEditor,/Preview stopped because the latest draft could not be saved/);
  assert.match(homeEditor,/expectedUpdatedAt:state\.updatedAt\?\?null/);
  assert.match(homeEditor,/if\(dirty&&!await save\(\)\)return/);
});

test('publish preflight blocks sample copy, broken CTAs and missing image alternatives',()=>{
  const route=read('src/routes/page-studio.ts');
  const pageEditor=read('portfolio/page-studio.js');
  const homeEditor=read('portfolio/homepage-studio.js');
  assert.match(route,/function studioPublishIssues/);
  assert.match(route,/PLACEHOLDER_CONTENT/);
  assert.match(route,/MISSING_IMAGE_ALT/);
  assert.match(route,/BROKEN_CTA/);
  assert.match(route,/status\(422\).*issues/);
  assert.match(pageEditor,/Array\.isArray\(data\.issues\)/);
  assert.match(homeEditor,/Array\.isArray\(data\.issues\)/);
});

test('role scopes protect private CMS data and global Page Studio controls',()=>{
  const rbac=read('src/lib/rbac.ts');
  const route=read('src/routes/page-studio.ts');
  const editor=read('portfolio/page-studio.js');
  const homeEditor=read('portfolio/homepage-studio.js');
  assert.match(rbac,/const readScopes/);
  assert.match(rbac,/This account cannot view that CMS area/);
  assert.match(rbac,/const editorWriteScopes/);
  assert.match(rbac,/Administrator access is required for accounts, system controls, recovery and global site settings/);
  for(const endpoint of ['reusable-blocks','templates','taxonomy','navigation','embed-sources','config'])assert.match(route,new RegExp(`router\\.(?:post|patch|delete)\\('\\/${endpoint}[^\\n]*adminOnly`));
  assert.match(route,/permissions:\{editContent:\['ADMIN','EDITOR'\]\.includes\(role\(res\)\),manageGlobalControls/);
  assert.match(editor,/canManageGlobalControls/);
  assert.match(editor,/canEditContent/);
  assert.match(editor,/READ ONLY/);
  assert.match(editor,/PAGE_STUDIO_DROP'&&current&&canEditContent\(\)/);
  assert.match(homeEditor,/canEditContent/);
  assert.match(homeEditor,/hs-read-only/);
});

test('disabled Page Studio remains recoverable and guide documents the emergency lock',()=>{
  const route=read('src/routes/page-studio.ts');
  const guide=read('PAGE_STUDIO_GUIDE.md');
  assert.match(route,/req\.path==='\/bootstrap'\|\|req\.path==='\/config'/);
  assert.match(guide,/PAGE_STUDIO_EMERGENCY_DISABLED=true/);
  assert.doesNotMatch(guide,/PAGE_STUDIO_ENABLED/);
});

test('Studio Foundation v3 centralizes widget metadata and migrates legacy blocks',()=>{
  const schema=read('src/lib/page-studio.ts');
  const route=read('src/routes/page-studio.ts');
  const editor=read('portfolio/page-studio.js');
  assert.match(schema,/PAGE_STUDIO_SCHEMA_VERSION=3/);
  assert.match(schema,/PAGE_STUDIO_WIDGET_REGISTRY/);
  assert.match(schema,/widgetVersion:z\.number\(\)/);
  assert.match(schema,/function migrateBlockValue/);
  assert.match(schema,/export function migrateStudioBlocks/);
  assert.match(route,/widgetRegistry:PAGE_STUDIO_WIDGET_REGISTRY/);
  assert.match(editor,/function syncWidgetRegistry/);
  assert.match(editor,/widgetVersion:version/);
});

test('global design tokens and responsive column overrides remain JSON-backed',()=>{
  const auth=read('src/routes/auth.ts');
  const runtime=read('portfolio/theme-runtime.js');
  const account=read('portfolio/admin-account-upgrade.js');
  const renderer=read('portfolio/page-studio-renderer.js');
  const css=read('portfolio/page-studio-public.css');
  for(const token of ['headingFont','bodyFont','containerWidth','sectionSpacing','radiusBase','motionScale']){
    assert.match(auth,new RegExp(token));
    assert.match(runtime,new RegExp(token));
    assert.match(account,new RegExp(token));
  }
  assert.match(renderer,/--ps-tablet-columns/);
  assert.match(renderer,/--ps-mobile-columns/);
  assert.match(css,/var\(--ps-tablet-columns/);
  assert.match(css,/var\(--ps-mobile-columns/);
});

test('editor safeguards support labels, locks and reusable styles without changing public copy',()=>{
  const editor=read('portfolio/page-studio.js');
  const renderer=read('portfolio/page-studio-renderer.js');
  assert.match(editor,/styleClipboard/);
  assert.match(editor,/data-editor-label/);
  assert.match(editor,/data-block-locked/);
  assert.match(editor,/COPY STYLE/);
  assert.match(editor,/RESET STYLE/);
  assert.match(editor,/Unlock this widget before moving it/);
  assert.match(renderer,/style\.editorLabel/);
  assert.match(renderer,/editor&&!style\.locked/);
});

test('publish quality checks cover structural and advanced widgets',()=>{
  const route=read('src/routes/page-studio.ts');
  for(const code of ['MULTIPLE_H1','LARGE_PAGE','INCOMPLETE_COMPARISON','MISSING_COMPARISON_ALT','MISSING_EMBED_TITLE','CUSTOM_CODE_REVIEW'])assert.match(route,new RegExp(code));
});

test('Homepage Studio blocks carry a backward-compatible widget version',()=>{
  const schema=read('src/lib/homepage-studio.ts');
  const editor=read('portfolio/homepage-studio.js');
  assert.match(schema,/HOMEPAGE_STUDIO_WIDGET_VERSION=1/);
  assert.match(schema,/widgetVersion:z\.number\(\).*\.default\(HOMEPAGE_STUDIO_WIDGET_VERSION\)/);
  assert.match(schema,/widgetVersion:HOMEPAGE_STUDIO_WIDGET_VERSION/);
  assert.match(editor,/widgetVersion:1/);
});

test('public Widget QA Lab covers every registered widget without database writes',()=>{
  const schema=read('src/lib/page-studio.ts');
  const fixture=read('portfolio/widget-qa.js');
  const html=read('portfolio/widget-qa.html');
  const registered=[...schema.matchAll(/export const PAGE_STUDIO_WIDGETS=\[([^\]]+)\]/g)][0][1].match(/'([A-Z_]+)'/g).map(value=>value.slice(1,-1));
  for(const widget of registered)assert.match(fixture,new RegExp(`block\\('${widget}'`),`${widget} is missing from the QA fixture`);
  assert.match(html,/noindex,nofollow,noarchive/);
  assert.match(html,/page-studio-renderer\.js/);
  assert.doesNotMatch(fixture,/\/api\/admin|fetch\(|credentials:/);
});

test('visual studios expose reversible history, layer navigation and preview focus',()=>{
  const homepageHtml=read('portfolio/homepage-studio.html');
  const homepageEditor=read('portfolio/homepage-studio.js');
  const homepageRuntime=read('portfolio/homepage-studio-runtime.js');
  const pageHtml=read('portfolio/page-studio.html');
  const pageEditor=read('portfolio/page-studio.js');
  const pageRenderer=read('portfolio/page-studio-renderer.js');
  for(const marker of ['homepageUndo','homepageRedo','homepageNavigator'])assert.match(homepageHtml,new RegExp(marker));
  assert.match(homepageEditor,/travelHistory/);
  assert.match(homepageEditor,/homepage-studio-recovery/);
  assert.match(homepageEditor,/7\*864e5/);
  assert.match(homepageRuntime,/HOMEPAGE_STUDIO_FOCUS/);
  assert.match(homepageRuntime,/data\.showLabel/);
  for(const marker of ['studioUndo','studioRedo','studioNavigator'])assert.match(pageHtml,new RegExp(marker));
  assert.match(pageEditor,/renderStudioNavigator/);
  assert.match(pageEditor,/PAGE_STUDIO_FOCUS/);
  assert.match(pageRenderer,/PAGE_STUDIO_FOCUS/);
});
