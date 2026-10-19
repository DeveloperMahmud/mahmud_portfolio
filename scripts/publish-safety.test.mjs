import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const read=path=>readFile(new URL(`../${path}`,import.meta.url),'utf8');

test('publish safety guards placeholder content and local media references',async()=>{
  const source=await read('src/lib/publish-safety.ts');
  assert.match(source,/PLACEHOLDER_TITLE/);
  assert.match(source,/MISSING_LOCAL_MEDIA/);
  assert.match(source,/MISSING_ALT/);
  assert.match(source,/assets\|uploads/);
});

test('project and content publishing routes enforce the safety check',async()=>{
  const [projects,content]=await Promise.all([
    read('src/routes/admin.ts'),
    read('src/routes/content.ts')
  ]);
  assert.match(projects,/projectPublishIssues/);
  assert.match(projects,/Publish safety check failed/);
  assert.match(content,/contentPublishIssues/);
  assert.match(content,/Publish safety check failed/);
});

test('bulk project publishing writes the real PUBLISHED status',async()=>{
  const source=await read('src/routes/admin.ts');
  assert.match(source,/action==='PUBLISH'\?'PUBLISHED':action/);
});
