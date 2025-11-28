import { Page } from '@playwright/test';

export const loginSelectors = {
  usernameInput: (page: Page) => page.locator('#email'),
  passwordInput: (page: Page) => page.locator('#password'),
  loginButton: (page: Page) => page.getByRole('button', { name: 'Acceder' }),
};