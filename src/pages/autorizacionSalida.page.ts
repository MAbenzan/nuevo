import { Page, TestInfo } from '@playwright/test';
import { loginSelectors } from '../selectors/login.selectors';
import { CustomActions } from '../actions/customActions';
import { menuSelectors } from '../selectors/menu.selectors';
import { obtenerClienteAutorizacion } from '../data/queries';

export class AutorizacionSalidaPage {
  constructor(private page: Page, private actions: CustomActions) {}

  async autorizacionSalida(
    cliente?: string,
    dbParams?: { usuario?: string; rol?: string; garantia?: string | number | boolean; tributacion?: number }
  ) {
    if (!cliente) {
      const info = await obtenerClienteAutorizacion(dbParams);
      if (!info || !info.nombre) throw new Error('No se encontró cliente en DB');
      cliente = info.nombre;
    }
    await this.actions.customClick(menuSelectors.menuCliente(this.page), 'click-menu-cliente');
    await this.actions.customType(menuSelectors.selectorcliente(this.page), cliente, 'ingresar-cliente');
    await this.actions.customPressEnter(menuSelectors.selectorcliente(this.page));

    await this.actions.customClick(menuSelectors.seccionSolicitudes(this.page), 'click-seccion-solicitudes');
    await this.actions.customClick(menuSelectors.opcionAutorizacionSalida(this.page), 'click-opcion-autorizacion-salida');
  }
}
