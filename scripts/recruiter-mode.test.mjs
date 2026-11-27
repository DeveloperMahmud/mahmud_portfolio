import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const read=path=>readFile(new URL(`../${path}`,import.meta.url),'utf8');

test('recruiter profile uses bounded CMS configuration without invented experience',async()=>{
  const source=await read('src/lib/recruiter.ts');
  assert.match(source,/experience:z\.array\(experience\)\.max\(12\)/);
  assert.match(source,/verified:z\.boolean\(\)/);
  assert.match(source,/evidencePillars:z\.array\(pillar\)\.max\(8\)/);
  assert.match(source,/featuredProjectSlugs:z\.array/);
  assert.match(source,/internalOrHttps/);
  assert.doesNotMatch(source,/company:.*default|role:.*default/);
});

test('public recruiter endpoint returns only eligible published evidence',async()=>{
  const route=await read('src/routes/public.ts');
  const start=route.indexOf("router.get('/recruiter'");
  const end=route.indexOf("router.post('/inquiries'",start);
  assert.ok(start>0&&end>start);
  const section=route.slice(start,end);
  for(const contract of ["status:'PUBLISHED'","visibility:'PUBLIC'","clientOnly:false","deletedAt:null",'scheduledAt:{lte:now}'])assert.match(section,new RegExp(contract.replace(/[{}]/g,'\\$&')));
  assert.match(section,/config\.experience\.filter\(item=>item\.verified\)/);
  assert.match(section,/config\.evidencePillars\.filter\(item=>item\.isPublished\)/);
  assert.match(section,/eligibleCreativeTools\(toolRows,now,\['PUBLIC','UNLISTED'\]\)/);
  assert.match(section,/cvAvailable:Boolean\(about\.cvUrl\)/);
});

test('hire page supports quick scan, deep evidence and safe CV fallback responsively',async()=>{
  const [html,js,css]=await Promise.all([read('portfolio/hire.html'),read('portfolio/hire.js'),read('portfolio/experience-pages.css')]);
  assert.match(html,/RECRUITER MODE \/ CAREER VIEW/);
  for(const id of ['recruiterSkills','recruiterProjects','recruiterPillars','recruiterExperience'])assert.match(html,new RegExp(`id="${id}`));
  assert.match(js,/\/api\/public\/recruiter/);
  assert.match(js,/profile\.cvAvailable\?'<a class="button" href="\/api\/public\/cv"/);
  assert.match(js,/renderProjects/);
  assert.match(js,/renderPillars/);
  assert.match(js,/renderExperience/);
  assert.match(css,/\.recruiter-project-grid/);
  assert.match(css,/@media\(max-width:760px\)/);
});

test('recruiter profile has a dedicated validated CMS merge path',async()=>{
  const [maintenance,rbac]=await Promise.all([read('src/routes/maintenance.ts'),read('src/lib/rbac.ts')]);
  const start=maintenance.indexOf("router.patch('/recruiter-profile'");
  assert.ok(start>0,'dedicated recruiter mutation route should exist');
  const section=maintenance.slice(start,maintenance.indexOf("router.get('/testimonials'",start));
  assert.match(section,/recruiterConfigSchema/);
  assert.match(section,/aboutConfig:\{\.\.\.about,recruiterConfig:parsed\.data\.recruiterConfig\}/);
  assert.match(section,/Recruiter Mode profile saved/);
  assert.match(section,/RECRUITER_PROFILE_UPDATE/);
  assert.match(rbac,/recruiter-profile/);
});

test('friendly recruiter editor preserves the advanced About source and role safety',async()=>{
  const [html,js,css,admin]=await Promise.all([read('portfolio/admin.html'),read('portfolio/admin-recruiter-mode.js'),read('portfolio/admin-recruiter-mode.css'),read('portfolio/admin.js')]);
  assert.match(html,/admin-recruiter-mode\.css/);
  assert.match(html,/admin-recruiter-mode\.js/);
  for(const field of ['roleTitle','headline','introduction','availabilityStatement','featuredProjectSlugs','skills','primaryLabel','primaryUrl','contactLabel','contactUrl'])assert.match(js,new RegExp(`name=\\"${field}\\"`));
  assert.match(js,/\/api\/admin\/maintenance\/recruiter-profile/);
  assert.match(js,/const about=\{\.\.\.aboutFromTextarea\(\),recruiterConfig:config\}/);
  assert.match(js,/experienceVerified/);
  assert.match(js,/pillarPublished/);
  assert.match(admin,/#recruiterProfileForm input/);
  assert.match(css,/@media\(max-width:580px\)/);
});
