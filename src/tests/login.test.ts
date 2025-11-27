import { test, expect } from '@playwright/test';
import { CustomActions } from '../actions/customActions';
import { LoginPage } from '../pages/login.page';
import { validarMensaje, ingresarUsuario, ingresarPassword, hacerClickLogin } from '../steps/login.steps';

test.describe('Login', () => {
  test('Login exitoso', async ({ page }, testInfo) => {
    const actions = new CustomActions(page, testInfo);
    const loginPage = new LoginPage(page, actions);
    await test.step('Abrir página de login', async () => {
      await loginPage.goto();
    });
    await ingresarUsuario(page, actions, 'standard_user');
    await ingresarPassword(page, actions, 'secret_sauce');
    await hacerClickLogin(page, actions);
    await validarMensaje(page, testInfo, 'Products');
    await expect(loginPage.productsTitle()).toHaveText('Products');
  });
});