import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';

const read=file=>fs.readFile(file,'utf8');

test('service registry is bounded and shares Studio CMS IDs',async()=>{
  const source=await read('src/lib/studio.ts');
  for(const value of ['amazon-ecommerce','amazon-commerce','brand-systems','digital-experiences'])assert.match(source,new RegExp(value));
  assert.match(source,/projectMatchesStudioService/);
  assert.match(source,/route\.keywords\.some/);
});

test('public service API respects publication, privacy and scheduling gates',async()=>{
  const source=await read('src/routes/public.ts'),start=source.indexOf("router.get('/services/:slug'"),end=source.indexOf("router.post('/inquiries'",start),section=source.slice(start,end);
  assert.ok(start>0&&end>start);
  assert.match(section,/if\(!service\?\.isPublished\)return res\.status\(404\)/);
  assert.match(section,/status:'PUBLISHED'/);
  assert.match(section,/visibility:'PUBLIC'/);
  assert.match(section,/clientOnly:false/);
  assert.match(section,/scheduledAt:\{lte:now\}/);
  assert.match(section,/publicProjectDto/);
});

test('explicit pages and canonical alias precede Page Studio catch-all',async()=>{
  const app=await read('src/app.ts'),service=app.indexOf("app.get('/services/:slug'"),pages=app.indexOf("app.get('/pages/:slug'");
  assert.ok(service>0&&pages>service);
  assert.match(app,/app\.get\('\/services\/amazon-creative'.+301.+\/services\/amazon-ecommerce/);
  assert.match(app,/service\?\.isPublished/);
  assert.match(app,/"@type":"Service"/);
  const studio=await read('src/lib/page-studio.ts');
  assert.match(studio,/['"]services['"]/);
});

test('service shell is responsive, safe and uses no fabricated proof',async()=>{
  const [html,js,css]=await Promise.all([read('portfolio/service.html'),read('portfolio/service.js'),read('portfolio/experience-pages.css')]);
  assert.match(html,/id="serviceProjectsSection" hidden/);
  assert.match(html,/id="serviceProcessSection" hidden/);
  assert.match(js,/\/api\/public\/services\//);
  assert.match(js,/safeUrl/);
  assert.match(js,/projects:\[\]/);
  assert.doesNotMatch(js,/testimonial|conversion rate|guaranteed/i);
  assert.match(css,/@media\(max-width:580px\).*service-page/s);
});

test('Studio admin defaults use the registered service identifiers',async()=>{
  const source=await read('portfolio/admin-studio-mode.js');
  assert.match(source,/serviceId:'amazon-commerce'/);
  assert.match(source,/serviceId:'brand-systems'/);
  assert.match(source,/serviceId:'digital-experiences'/);
  assert.match(source,/studioConfig:structuredClone\(defaults\)/);
});
