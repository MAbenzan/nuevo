import { Page } from '@playwright/test';

export const loginSelectors = {
  usernameInput: (page: Page) => page.locator('#user-name'),
  passwordInput: (page: Page) => page.locator('#password'),
  loginButton: (page: Page) => page.locator('#login-button'),
  errorMessage: (page: Page) => page.locator('[data-test="error"]'),
  productsTitle: (page: Page) => page.locator('.title')
};