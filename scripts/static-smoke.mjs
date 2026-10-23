import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';

const root = new URL('../', import.meta.url);
const read = path => readFile(new URL(path, root), 'utf8');
const checks = [];

async function check(name, task) {
  try {
    await task();
    checks.push({ name, ok: true });
  } catch (error) {
    checks.push({ name, ok: false, error: error.message });
    process.exitCode = 1;
  }
}

await check('compiled server exists', () => access(new URL('dist/src/app.js', root)));
await check('homepage SEO shell', async () => {
  const html = await read('portfolio/index.html');
  assert.match(html, /rel="canonical"/i);
  assert.match(html, /application\/ld\+json/i);
});
await check('public archives', async () => {
  for (const path of ['portfolio/work.html', 'portfolio/blog.html']) {
    assert.match(await read(path), /<main/i, `${path} is missing its main landmark`);
  }
});
await check('admin login shell', async () => {
  const html = await read('portfolio/admin.html');
  assert.match(html, /id="loginForm"/);
  assert.doesNotMatch(html, /<\/style>\s*<\/style>/i);
});
await check('crawler files', async () => {
  assert.match(await read('portfolio/robots.txt'), /User-agent:/i);
  const app = await read('src/app.ts');
  assert.match(app, /sitemap\.xml/);
});

console.table(checks);
if (process.exitCode) throw new Error('Static smoke checks failed');
