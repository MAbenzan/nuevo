import { test, expect } from '@playwright/test';
import { CustomActions } from '../actions/customActions';
import { LoginPage } from '../pages/login.page';
import { credentials } from '../config/credentials';
import { AutorizacionSalidaPage } from '../pages/autorizacionSalida.page';
import { Roles, Garantias, Tributacion } from '../data/queries';

test.describe('Login', () => {
  test('Login exitoso', async ({ page }, testInfo) => {
    const actions = new CustomActions(page, testInfo);
    const loginPage = new LoginPage(page, actions);
    const autorizacionSalidaPage = new AutorizacionSalidaPage(page, actions);
    await test.step('Abrir página de login', async () => {
      await loginPage.goto();
      await loginPage.login(testInfo, credentials.user, credentials.password);
    });
    
     await autorizacionSalidaPage.autorizacionSalida(undefined, {
       usuario: credentials.userDPHVirtual, 
       rol: Roles.CLIENTE,
       garantia: Garantias.NO,
       tributacion: Tributacion.NO_EXENTO
     });

  });
});