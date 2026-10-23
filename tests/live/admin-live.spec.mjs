import { test, expect } from '@playwright/test';

const email = process.env.LIVE_ADMIN_EMAIL;
const password = process.env.LIVE_ADMIN_PASSWORD;

if (!email || !password) {
  throw new Error('LIVE_ADMIN_EMAIL and LIVE_ADMIN_PASSWORD must be configured as GitHub Actions secrets.');
}

const safeTabs = [
  ['dashboard', '#dashboardTab'],
  ['projects', '#projectsTab'],
  ['content', '#contentTab'],
  ['brands', '#brandsTab'],
  ['media', '#mediaTab'],
  ['imports', '#importsTab'],
  ['homepage', '#homepageTab'],
  ['analytics', '#analyticsTab'],
  ['seo', '#seoTab'],
  ['operations', '#operationsTab'],
  ['leads', '#leadsTab'],
  ['motion', '#motionTab'],
  ['production-navigation', '#production-navigationTab'],
  ['control-center', '#control-centerTab'],
  ['maintenance', '#maintenanceTab'],
  ['account', '#accountTab'],
];

function monitorRuntime(page) {
  const findings = { consoleErrors: [], pageErrors: [], failedRequests: [], badResponses: [] };
  let authenticated = false;
  page.on('console', message => {
    if (message.type() === 'error') findings.consoleErrors.push(message.text());
  });
  page.on('pageerror', error => findings.pageErrors.push(error.message));
  page.on('requestfailed', request => {
    findings.failedRequests.push(`${request.method()} ${request.url()} — ${request.failure()?.errorText || 'failed'}`);
  });
  page.on('response', response => {
    if (!authenticated || response.status() < 400) return;
    const url = new URL(response.url());
    if (url.origin === new URL(page.url()).origin) {
      findings.badResponses.push(`${response.status()} ${response.request().method()} ${url.pathname}`);
    }
  });
  return { findings, markAuthenticated: () => { authenticated = true; } };
}

async function login(page, monitor) {
  await page.goto('/admin.html', { waitUntil: 'domcontentloaded' });
  const cms = page.locator('#cms');
  if (!(await cms.isVisible())) {
    await page.locator('#loginEmail').fill(email);
    await page.locator('#loginPassword').fill(password);
    await page.locator('#loginForm button[type="submit"]').click();
  }
  await expect(cms).toBeVisible();
  monitor.markAuthenticated();
  await expect(page.locator('.admin-sidebar')).toBeAttached();
}

async function attachJson(testInfo, name, value) {
  await testInfo.attach(name, {
    body: Buffer.from(JSON.stringify(value, null, 2)),
    contentType: 'application/json',
  });
}

test('authenticated CMS navigation and responsive shell remain healthy', async ({ page }, testInfo) => {
  const monitor = monitorRuntime(page);
  await login(page, monitor);

  for (const [tabName, panelSelector] of safeTabs) {
    const button = page.locator(`.admin-sidebar .side-btn[data-tab="${tabName}"]`);
    await expect(button, `Missing ${tabName} navigation control`).toHaveCount(1);
    await button.click();
    await expect(page.locator(panelSelector), `${tabName} panel did not open`).toBeVisible();
  }

  if (testInfo.project.name === 'mobile') {
    await expect(page.locator('#adminMenuToggle')).toBeVisible();
    await page.locator('#adminMenuToggle').click();
    await expect(page.locator('#adminMenuToggle')).toHaveAttribute('aria-expanded', 'true');
    await expect(page.locator('.admin-sidebar')).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.locator('#adminMenuToggle')).toHaveAttribute('aria-expanded', 'false');
  }

  const shot = testInfo.outputPath(`cms-${testInfo.project.name}.png`);
  await page.screenshot({ path: shot, fullPage: true });
  await testInfo.attach(`cms-${testInfo.project.name}`, { path: shot, contentType: 'image/png' });
  await attachJson(testInfo, 'runtime-findings', monitor.findings);

  expect(monitor.findings.pageErrors, 'Uncaught browser errors').toEqual([]);
  expect(monitor.findings.consoleErrors, 'Browser console errors').toEqual([]);
  expect(monitor.findings.failedRequests, 'Failed network requests').toEqual([]);
  expect(monitor.findings.badResponses, 'Authenticated same-origin HTTP errors').toEqual([]);
});

test('Homepage Studio and Page Studio load without mutating content', async ({ page }, testInfo) => {
  const monitor = monitorRuntime(page);
  await login(page, monitor);

  await page.goto('/homepage-studio.html', { waitUntil: 'domcontentloaded' });
  await expect(page.locator('body')).toContainText('HOMEPAGE STUDIO');
  await expect(page.locator('#homepagePreview')).toBeVisible();
  await expect(page.locator('#homepagePreview')).toHaveAttribute('src', /homepage-studio-preview=1/);
  const homepageShot = testInfo.outputPath(`homepage-studio-${testInfo.project.name}.png`);
  await page.screenshot({ path: homepageShot, fullPage: true });
  await testInfo.attach(`homepage-studio-${testInfo.project.name}`, { path: homepageShot, contentType: 'image/png' });

  await page.goto('/page-studio.html', { waitUntil: 'domcontentloaded' });
  await expect(page.locator('body')).not.toContainText('Page Studio unavailable');
  await expect(page.locator('#studioCanvas')).toBeAttached();
  const pageStudioShot = testInfo.outputPath(`page-studio-${testInfo.project.name}.png`);
  await page.screenshot({ path: pageStudioShot, fullPage: true });
  await testInfo.attach(`page-studio-${testInfo.project.name}`, { path: pageStudioShot, contentType: 'image/png' });

  await attachJson(testInfo, 'studio-runtime-findings', monitor.findings);
  expect(monitor.findings.pageErrors, 'Uncaught Studio browser errors').toEqual([]);
  expect(monitor.findings.consoleErrors, 'Studio browser console errors').toEqual([]);
  expect(monitor.findings.failedRequests, 'Failed Studio network requests').toEqual([]);
  expect(monitor.findings.badResponses, 'Studio same-origin HTTP errors').toEqual([]);
});
