import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import test from 'node:test';

const read=path=>readFile(new URL(`../${path}`,import.meta.url),'utf8');

test('public V2 surfaces expose core accessibility and motion safeguards',async()=>{
  const [lab,tool,review,hire,studio,qa,labCss,experienceCss]=await Promise.all([
    read('portfolio/creative-lab.html'),read('portfolio/creative-tool.html'),read('portfolio/creative-review.html'),
    read('portfolio/hire.html'),read('portfolio/studio.html'),read('portfolio/widget-qa.html'),
    read('portfolio/creative-lab.css'),read('portfolio/experience-pages.css')
  ]);
  for(const html of [lab,tool,review,hire,studio,qa]){
    assert.match(html,/<html[^>]+lang="en"/i);
    assert.match(html,/<meta[^>]+name="viewport"/i);
    assert.match(html,/<title>[^<]+<\/title>/i);
  }
  assert.match(qa,/noindex,nofollow,noarchive/);
  assert.match(labCss,/@media\(prefers-reduced-motion:reduce\)/);
  assert.match(experienceCss,/@media\(prefers-reduced-motion:reduce\)/);
  assert.doesNotMatch([lab,tool,review,hire,studio].join('\n'),/<img(?![^>]*\balt=)[^>]*>/i);
});

test('Page Studio QA fixture covers every registered widget and keyboard-sensitive controls',async()=>{
  const [fixture,renderer,css]=await Promise.all([
    read('portfolio/widget-qa.js'),read('portfolio/page-studio-renderer.js'),read('portfolio/page-studio-public.css')
  ]);
  for(const type of ['SECTION','COLUMNS','HERO','VIDEO','BEFORE_AFTER','TESTIMONIAL_CAROUSEL','CREATIVE_TOOL_CATALOG','CUSTOM_CODE','WEBSITE_EMBED'])assert.match(fixture,new RegExp(`['\"]${type}['\"]`));
  assert.match(renderer,/addEventListener\('keydown'/);
  assert.match(renderer,/aria-selected/);
  assert.match(renderer,/aria-expanded/);
  assert.match(renderer,/aria-label="Compare before and after images"/);
  assert.match(css,/:focus-visible/);
  assert.match(css,/@media\(prefers-reduced-motion:reduce\)/);
});

test('legacy and modern review routes retain bounded public security controls',async()=>{
  const [app,publicRoutes,admin,reviewAccess,publicReviews]=await Promise.all([
    read('src/app.ts'),read('src/routes/public.ts'),read('src/routes/admin.ts'),
    read('src/lib/review-access.ts'),read('src/routes/public-reviews.ts')
  ]);
  assert.match(app,/morgan\('tiny',\{skip:req=>req\.path\.startsWith\('\/share\/'\)/);
  assert.match(app,/app\.use\('\/api\/public\/share',rateLimit/);
  assert.match(publicRoutes,/publicProjectDto\(project/);
  assert.match(publicRoutes,/review:\s*\{\s*id:review\.id,decision:review\.decision,createdAt:review\.createdAt\s*\}/);
  assert.match(admin,/days:z\.number\(\)\.int\(\)\.min\(1\)\.max\(30\)\.default\(7\)/);
  assert.match(admin,/SHARE_LINK_CREATED/);
  assert.match(reviewAccess,/createHash\('sha256'\)/);
  assert.match(publicReviews,/no-store/);
});

test('portable export omits editor-only state and requires review for executable code',async()=>{
  const studio=await read('portfolio/page-studio.js');
  assert.match(studio,/portfolio-page-studio-wordpress-handoff\/v2/);
  assert.match(studio,/requiresManualReview/);
  assert.match(studio,/mediaManifest/);
  assert.match(studio,/migrationNotes/);
  assert.doesNotMatch(studio,/blocks:map\(current\.blocks\)/);
});
