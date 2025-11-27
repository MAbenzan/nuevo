import { Page, TestInfo, expect, test } from '@playwright/test';
import { CustomActions } from '../actions/customActions';
import { loginSelectors } from '../selectors/login.selectors';

export async function ingresarUsuario(page: Page, actions: CustomActions, usuario: string) {
  await test.step('Ingresar usuario', async () => {
    await actions.customType(loginSelectors.usernameInput(page), usuario, 'ingresar-usuario');
  });
}

export async function ingresarPassword(page: Page, actions: CustomActions, password: string) {
  await test.step('Ingresar password', async () => {
    await actions.customType(loginSelectors.passwordInput(page), password, 'ingresar-password');
  });
}

export async function hacerClickLogin(page: Page, actions: CustomActions) {
  await test.step('Click en login', async () => {
    await actions.customClick(loginSelectors.loginButton(page), 'click-login');
  });
}

export async function validarMensaje(page: Page, testInfo: TestInfo, esperado: string) {
  await test.step('Validar mensaje', async () => {
    await expect(loginSelectors.productsTitle(page)).toHaveText(esperado);
    await testInfo.attach('validacion', { contentType: 'image/png', body: await page.screenshot() });
  });
}