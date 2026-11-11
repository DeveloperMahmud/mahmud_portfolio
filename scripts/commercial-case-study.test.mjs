import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';

const read=path=>readFile(new URL(`../${path}`,import.meta.url),'utf8');

test('public project DTO removes private project and metric evidence',async()=>{
  const source=await read('src/lib/public-project.ts');
  for(const field of ['accessTokenHash','deletedBy','deletedAt','clientExpiresAt','sourceNote'])assert.match(source,new RegExp(field));
  const routes=await read('src/routes/public.ts');
  assert.match(routes,/projects:projects\.map\(project=>publicProjectDto/);
  assert.match(routes,/project:publicProjectDto\(project/);
});

test('public detail, next-project and discovery routes respect publication schedule',async()=>{
  const [routes,app]=await Promise.all([read('src/routes/public.ts'),read('src/app.ts')]);
  const detail=routes.slice(routes.indexOf("router.get('/projects/:slug'"),routes.indexOf("router.get('/settings'"));
  assert.match(detail,/scheduledAt:null/);
  assert.match(detail,/scheduledAt:\{lte:now\}/);
  const htmlRoute=app.slice(app.indexOf("app.get('/work/:slug'"),app.indexOf("app.get('/journal/:slug'"));
  assert.match(htmlRoute,/scheduledAt:null/);
  assert.match(htmlRoute,/scheduledAt:\{lte:now\}/);
  const llmsStart=app.indexOf("app.get('/llms.txt'");
  const llms=app.slice(llmsStart,app.indexOf('\n',llmsStart));
  assert.match(llms,/deletedAt:null/);
  assert.match(llms,/includeSitemap:true/);
  assert.match(llms,/scheduledAt:\{lte:now\}/);
});

test('featured case studies have an evidence-led publish gate',async()=>{
  const source=await read('src/lib/publish-safety.ts');
  for(const code of ['FLAGSHIP_MISSING_ROLE','FLAGSHIP_MISSING_CONTEXT','FLAGSHIP_MISSING_PROCESS','FLAGSHIP_MISSING_DELIVERABLES','FLAGSHIP_MISSING_OUTCOME','FLAGSHIP_MISSING_EVIDENCE'])assert.match(source,new RegExp(code));
  assert.match(source,/if\(input\.featured===true\)/);
});

test('project CMS exposes a matching flagship readiness workflow',async()=>{
  const [loader,js,css]=await Promise.all([read('portfolio/admin-addendum.js'),read('portfolio/admin-case-study.js'),read('portfolio/admin-case-study.css')]);
  assert.match(loader,/admin-case-study\.js/);
  for(const key of ['role','context','process','deliverables','evidence','outcome'])assert.match(js,new RegExp(`key:'${key}'`));
  assert.match(js,/FEATURED \/ SPECIAL WORK/);
  assert.match(css,/\.case-readiness__grid/);
  assert.match(css,/@media\(max-width:580px\)/);
});
