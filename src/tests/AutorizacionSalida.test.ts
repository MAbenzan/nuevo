import { test, expect } from '@playwright/test';
// Imports actualizados
import { CustomActions } from 'actions/customActions';
import { LoginPage } from 'pages/login.page';
import { credentials } from 'config/credentials';
import { AutorizacionSalidaPage } from 'pages/autorizacionSalida.page';
import { Roles, Garantias, Tributacion, Modulos, EstadoOperativo, Restricciones, Accion_restriccion } from 'data/queries';

test.describe('Autorizacion Salida', () => {
  test.describe.configure({ timeout: 60000 });
  test('Autorizacion salida bloqueada por restricciones', async ({ page }, testInfo) => {
    const actions = new CustomActions(page, testInfo);
    const loginPage = new LoginPage(page, actions);
    const autorizacionSalidaPage = new AutorizacionSalidaPage(page, actions);
    await test.step('Abrir página de login', async () => {
      await loginPage.login(testInfo, credentials.user, credentials.password);
    });
    const result = await autorizacionSalidaPage.autorizacionSalida(undefined, {
      usuario: credentials.userDPHVirtual,
      rol: Roles.CLIENTE,
      garantia: Garantias.SI,
      tributacion: Tributacion.NO_EXENTO,
      modulo: Modulos.IMPORTACION,
      estadoOperativo: EstadoOperativo.MANIFESTADO,
      restricciones: Restricciones.AUTORIZACION_SALIDA,
      accion_restriccion: Accion_restriccion.LIBERADO
    }, { fecha: '10/12/2025' });
    expect(result).toBeTruthy();
  });
});
