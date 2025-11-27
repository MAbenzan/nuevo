import { Page, TestInfo, expect, test } from '@playwright/test';
import { CustomActions } from '../actions/customActions';
import { LoginPage } from '../pages/login.page';

export async function ingresarUsuario(page: Page, actions: CustomActions, usuario: string) {
  await test.step('Ingresar usuario', async () => {
    const loginPage = new LoginPage(page, actions);
    await actions.customType(loginPage.usernameInput(), usuario, 'ingresar-usuario');
  });
}

export async function ingresarPassword(page: Page, actions: CustomActions, password: string) {
  await test.step('Ingresar password', async () => {
    const loginPage = new LoginPage(page, actions);
    await actions.customType(loginPage.passwordInput(), password, 'ingresar-password');
  });
}

export async function hacerClickLogin(page: Page, actions: CustomActions) {
  await test.step('Click en login', async () => {
    const loginPage = new LoginPage(page, actions);
    await actions.customClick(loginPage.loginButton(), 'click-login');
  });
}

export async function validarMensaje(page: Page, testInfo: TestInfo, esperado: string) {
  await test.step('Validar mensaje', async () => {
    const loginPage = new LoginPage(page, new CustomActions(page, testInfo));
    await expect(loginPage.productsTitle()).toHaveText(esperado);
    await testInfo.attach('validacion', { contentType: 'image/png', body: await page.screenshot() });
  });
}