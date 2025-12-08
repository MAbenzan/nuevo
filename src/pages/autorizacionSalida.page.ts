import { Page } from '@playwright/test';
import { CustomActions } from '../actions/customActions';
import { menuSelectors } from '../selectors/menu.selectors';
import { obtenerClienteYContenedorUnificado } from '../data/queries';
import { commonSelectors } from '../selectors/common.selectors';
import { autorizacionSalidaSelectors } from '../selectors/autorizacionSalida.selectors';

export class AutorizacionSalidaPage {
  constructor(private page: Page, private actions: CustomActions) {}

  async autorizacionSalida(
    cliente?: string,
    dbParams?: { usuario?: string; rol?: string; garantia?: string | number | boolean; tributacion?: number; modulo?: string; estadoOperativo?: string },
    options?: { fecha?: string; nota?: string },
  ) {
    if (!cliente) {
      const datos = await obtenerClienteYContenedorUnificado({
        usuario: dbParams?.usuario,
        rol: dbParams?.rol,
        garantia: dbParams?.garantia,
        tributacion: dbParams?.tributacion,
        modulo: dbParams?.modulo ?? process.env.SQL_MODULO_APP,
        estadoOperativo: dbParams?.estadoOperativo,
      });
      if (!datos || !datos.cliente) throw new Error('No se encontró contenedor/cliente en DB');
      cliente = datos.cliente;

      console.log('Cliente encontrado:', cliente);
      console.log('Contenedor encontrado:', datos.contenedor);

      await this.actions.customClick(menuSelectors.menuCliente(this.page), 'click-menu-cliente');
      await this.actions.customType(menuSelectors.selectorcliente(this.page), cliente, 'ingresar-cliente');
      await this.actions.customPressEnter(menuSelectors.selectorcliente(this.page));

      await this.actions.customClick(menuSelectors.seccionSolicitudes(this.page), 'click-seccion-solicitudes');
      await this.actions.customClick(menuSelectors.opcionAutorizacionSalida(this.page), 'click-opcion-autorizacion-salida');
      await this.actions.waitForPageLoaded();

    await this.actions.customClick(commonSelectors.btnNueva(this.page), 'click-btn-nueva');

    const fechaVigencia = options?.fecha ?? this.getDateToday();
    await this.actions.customType(autorizacionSalidaSelectors.txtFechaVigencia(this.page), fechaVigencia, 'ingresar-fecha');

    const nota = options?.nota ?? 'Nota de prueba';
    await this.actions.customType(autorizacionSalidaSelectors.txtNota(this.page), nota, 'Prueba automatizada');
    await this.actions.customClick(commonSelectors.btnProximo(this.page), 'click-btn-proximo');
    
      if (datos.contenedor) {
        await this.actions.customType(autorizacionSalidaSelectors.txtBuscar(this.page), datos.contenedor, 'buscar-contenedor');
        await autorizacionSalidaSelectors.txtBuscar(this.page).press('Enter');
      }
    } 

    await this.actions.customClick(autorizacionSalidaSelectors.chkSeleccionarTodos(this.page), 'click-chk-seleccionar-todos');
    await this.actions.customClick(commonSelectors.btnProximo(this.page), 'click-btn-proximo');
    await this.actions.customClick(commonSelectors.btnFinalizar(this.page), 'click-btn-finalizar');
    await this.actions.customClick(commonSelectors.btnSi(this.page), 'click-btn-si');
    await this.actions.customClick(commonSelectors.btnCerrar(this.page), 'click-btn-cerrar');



  }
  private getDateToday(): string {
    const d = new Date();
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  }
}
