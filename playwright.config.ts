import 'dotenv/config';
import { defineConfig, devices } from '@playwright/test';
import fs from 'fs';
import path from 'path';

const customReporterPath = path.resolve('dist', 'reports', 'reporter.js');
const reporterConfig = fs.existsSync(customReporterPath)
  ? [[customReporterPath], ['html']]
  : [['list'], ['html']];

export default defineConfig({
  testDir: './src/tests',
  timeout: 30000,
  expect: { timeout: 5000 },
  fullyParallel: true,
  reporter: [['./dist/reports/reporter.js']],
  outputDir: './reports/.artifacts',
  use: {
    baseURL: 'https://dphcrmtest:4443/Account/Login',
    headless: true,
    ignoreHTTPSErrors: true,
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    trace: 'on-first-retry',
    launchOptions: {
      args: ['--ignore-certificate-errors']
    }
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } }
  ]
});