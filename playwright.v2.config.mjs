import {defineConfig,devices} from '@playwright/test';

export default defineConfig({
  testDir:'./tests',
  testMatch:'v2-visual.spec.mjs',
  timeout:30_000,
  retries:0,
  reporter:'line',
  use:{baseURL:'http://127.0.0.1:8799',trace:'retain-on-failure'},
  projects:[
    {name:'desktop',use:{...devices['Desktop Chrome'],viewport:{width:1440,height:900}}},
    {name:'mobile',use:{...devices['iPhone 13']}}
  ],
  webServer:{command:'node scripts/static-preview-server.mjs',url:'http://127.0.0.1:8799/api/health',reuseExistingServer:true,timeout:20_000}
});
