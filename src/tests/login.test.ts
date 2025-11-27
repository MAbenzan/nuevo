import { test, expect } from '@playwright/test';
import { CustomActions } from '../actions/customActions';
import { LoginPage } from '../pages/login.page';
import { loginSelectors } from '../selectors/login.selectors';

test.describe('Login', () => {
  test('Login exitoso', async ({ page }, testInfo) => {
    const actions = new CustomActions(page, testInfo);
    const loginPage = new LoginPage(page, actions);
    await test.step('Abrir página de login', async () => {
      await loginPage.goto();
    });

    await loginPage.login(testInfo, 'standard_user', 'secret_sauce');
  });
});