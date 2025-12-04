import 'dotenv/config';
import { defineConfig, devices } from '@playwright/test';
const reporterConfig: [string, any][] = [['list', {}], ['html', {}]];
const slowMoMs = Number(process.env.SLOWMO_MS || 0);
const headless = process.env.HEADLESS === 'false' ? false : true;

export default defineConfig({
  testDir: './src/tests',
  timeout: 30000,
  expect: { timeout: 5000 },
  fullyParallel: true,
  reporter: reporterConfig,
  outputDir: './reports/.artifacts',
  use: {
    baseURL: 'https://dphcrmtest:4443/Account/Login',
    headless,
    ignoreHTTPSErrors: true,
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    trace: 'on-first-retry',
    launchOptions: {
      args: ['--ignore-certificate-errors'],
      slowMo: slowMoMs > 0 ? slowMoMs : undefined
    }
  },
  projects: (() => {
    const all = [
      { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
      { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
      { name: 'webkit', use: { ...devices['Desktop Safari'] } }
    ];
    const target = (process.env.PW_PROJECT || process.env.PLAYWRIGHT_PROJECT || process.env.BROWSER || '').toLowerCase();
    return target ? all.filter(p => p.name.toLowerCase() === target) : all;
  })()
});
