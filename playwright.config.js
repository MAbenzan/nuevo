// Configuración básica para ejecución rápida con JS
// Usa el runner oficial de Playwright
const { defineConfig, devices } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './src/tests',
  timeout: 30000,
  expect: { timeout: 5000 },
  fullyParallel: true,
  // Reporter simple para ver resultados rápidos; el reporter custom se usa desde TS
  reporter: [['list'], ['html']],
  use: {
    baseURL: 'https://www.saucedemo.com/',
    headless: true,
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    trace: 'on-first-retry'
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } }
  ]
});