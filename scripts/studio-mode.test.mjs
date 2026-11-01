import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const read=path=>readFile(new URL(`../${path}`,import.meta.url),'utf8');

test('studio configuration is bounded, reference-based and has no invented proof',async()=>{
  const source=await read('src/lib/studio.ts');
  assert.match(source,/featuredProjectSlugs:z\.array/);
  assert.match(source,/selectedTestimonialIds:z\.array/);
  assert.match(source,/services:z\.array\(service\)\.max\(10\)/);
  assert.match(source,/processSteps:z\.array\(processStep\)\.max\(8\)/);
  assert.match(source,/faqs:z\.array\(faq\)\.max\(12\)/);
  assert.match(source,/bookingAction:action\.nullable\(\)/);
  assert.match(source,/internalOrHttps/);
  assert.doesNotMatch(source,/testimonial.*default|client.*default|successRate|revenue/);
  assert.match(source,/defaultStudioServices/);
  assert.match(source,/defaultStudioProcess/);
});

test('public studio projection excludes private work and unpublished testimonials',async()=>{
  const source=await read('src/routes/public.ts'),start=source.indexOf("router.get('/studio'"),end=source.indexOf("router.post('/inquiries'",start),section=source.slice(start,end);
  assert.ok(start>0&&end>start);
  for(const contract of ["status:'PUBLISHED'","visibility:'PUBLIC'","clientOnly:false","deletedAt:null",'scheduledAt:{lte:now}','published:true'])assert.match(section,new RegExp(contract.replace(/[{}]/g,'\\$&')));
  assert.match(section,/config\.featuredProjectSlugs/);
  assert.match(section,/config\.selectedTestimonialIds/);
  assert.match(section,/config\.services\.filter\(item=>item\.isPublished\)/);
  assert.match(section,/config\.processSteps\.filter\(item=>item\.isPublished\)/);
  assert.match(section,/config\.faqs\.filter\(item=>item\.isPublished\)/);
});

test('studio profile uses a revision-safe sibling-preserving CMS merge',async()=>{
  const [maintenance,rbac]=await Promise.all([read('src/routes/maintenance.ts'),read('src/lib/rbac.ts')]);
  const start=maintenance.indexOf("router.patch('/studio-profile'"),end=maintenance.indexOf("router.get('/testimonials'",start),section=maintenance.slice(start,end);
  assert.ok(start>0&&end>start);
  assert.match(section,/studioConfigSchema/);
  assert.match(section,/createRevision\('SITE_SETTINGS'/);
  assert.match(section,/aboutConfig:\{\.\.\.about,studioConfig:parsed\.data\.studioConfig\}/);
  assert.match(section,/STUDIO_PROFILE_UPDATE/);
  assert.match(rbac,/studio-profile/);
});

test('studio page renders dynamic services, work, process, real testimonials and FAQ safely',async()=>{
  const [html,js,css]=await Promise.all([read('portfolio/studio.html'),read('portfolio/studio.js'),read('portfolio/experience-pages.css')]);
  for(const id of ['studioServices','studioProjects','studioProcess','studioTestimonials','studioFaqs'])assert.match(html,new RegExp(`id="${id}"`));
  assert.match(js,/\/api\/public\/studio/);
  assert.match(js,/function renderServices/);
  assert.match(js,/function renderProjects/);
  assert.match(js,/function renderTestimonials/);
  assert.match(js,/fallbackServices/);
  assert.match(js,/fallbackProcess/);
  assert.match(js,/safeUrl/);
  assert.match(js,/noopener noreferrer/);
  assert.match(css,/\.studio-testimonial-grid/);
  assert.match(css,/@media\(max-width:580px\)/);
});

test('friendly Studio editor exposes repeaters and loads through the existing CMS runtime',async()=>{
  const [loader,js,css]=await Promise.all([read('portfolio/admin-recruiter-mode.js'),read('portfolio/admin-studio-mode.js'),read('portfolio/admin-studio-mode.css')]);
  assert.match(loader,/admin-studio-mode\.js/);
  assert.match(loader,/admin-studio-mode\.css/);
  for(const field of ['eyebrow','headline','introduction','scopeNoteTitle','scopeNote','studioProjectSlugs','studioTestimonialIds','studioPrimaryLabel','studioPrimaryUrl','studioSecondaryLabel','studioSecondaryUrl','studioBookingLabel','studioBookingUrl'])assert.match(js,new RegExp(`name="${field}"`));
  assert.match(js,/\/api\/admin\/maintenance\/studio-profile/);
  assert.match(js,/data-studio-add="service"/);
  assert.match(js,/data-studio-add="process"/);
  assert.match(js,/data-studio-add="faq"/);
  assert.match(js,/const about=\{\.\.\.aboutFromTextarea\(\),studioConfig:config\}/);
  assert.match(css,/@media\(max-width:760px\)/);
});
