import { defineConfig } from '@playwright/test';

const baseURL = (process.env.LIVE_BASE_URL || 'https://mahmudportfolio-azure.vercel.app').replace(/\/$/, '');

export default defineConfig({
  testDir: './tests/live',
  outputDir: 'test-results/live-admin',
  fullyParallel: false,
  retries: 1,
  timeout: 90_000,
  expect: { timeout: 15_000 },
  reporter: [
    ['list'],
    ['html', { outputFolder: 'playwright-report/live-admin', open: 'never' }],
    ['json', { outputFile: 'test-results/live-admin/results.json' }],
  ],
  use: {
    baseURL,
    browserName: 'chromium',
    ignoreHTTPSErrors: false,
    actionTimeout: 15_000,
    navigationTimeout: 30_000,
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    { name: 'desktop', use: { viewport: { width: 1440, height: 900 } } },
    { name: 'tablet', use: { viewport: { width: 1024, height: 768 } } },
    { name: 'mobile', use: { viewport: { width: 390, height: 844 }, isMobile: true } },
  ],
});
