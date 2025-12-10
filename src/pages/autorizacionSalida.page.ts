import { Page } from '@playwright/test';
import { CustomActions } from 'actions/customActions';
import { menuSelectors } from 'selectors/menu.selectors';
import { obtenerClienteYContenedorUnificado, Restricciones, Accion_restriccion } from 'data/queries';
import { commonSelectors } from 'selectors/common.selectors';
import { autorizacionSalidaSelectors } from 'selectors/autorizacionSalida.selectors';
import { getDateToday } from 'utils/date';

export class AutorizacionSalidaPage {
  constructor(private page: Page, private actions: CustomActions) { }

  async autorizacionSalida(
    cliente?: string,
    dbParams?: { usuario?: string; rol?: string; garantia?: string | number | boolean; tributacion?: number; modulo?: string; estadoOperativo?: string; restricciones?: Restricciones; accion_restriccion?: Accion_restriccion },
    options?: { fecha?: string; nota?: string },
  ): Promise<{ blocked: boolean; title?: string; message?: string }> {
    if (!cliente) {
      const datos = await obtenerClienteYContenedorUnificado({
        usuario: dbParams?.usuario,
        rol: dbParams?.rol,
        garantia: dbParams?.garantia,
        tributacion: dbParams?.tributacion,
        modulo: dbParams?.modulo ?? process.env.SQL_MODULO_APP,
        estadoOperativo: dbParams?.estadoOperativo,
        tipoRestriccion: dbParams?.restricciones,
        accion: dbParams?.accion_restriccion,
      });
      if (!datos || !datos.cliente) throw new Error('No se encontró contenedor/cliente en DB');
      cliente = datos.cliente;

      console.log('Cliente encontrado:', cliente);
      console.log('Contenedor encontrado:', datos.contenedor);

      await this.actions.click(menuSelectors.menuCliente(this.page), 'click-menu-cliente');
      await this.actions.type(menuSelectors.selectorcliente(this.page), cliente, 'ingresar-cliente');
      await this.actions.pressEnter(menuSelectors.selectorcliente(this.page));

      await this.actions.click(menuSelectors.seccionSolicitudes(this.page), 'click-seccion-solicitudes', { wait: { navigation: true } });
      await this.actions.click(menuSelectors.opcionAutorizacionSalida(this.page), 'click-opcion-autorizacion-salida', { wait: { navigation: true } });

      await this.actions.click(commonSelectors.btnNueva(this.page), 'click-btn-nueva');

      // Detectar modal de restricciones usando selectores por defecto (SweetAlert)
      const modalResult = await this.actions.handleModal({ title: 'Acción no permitida!!', messageIncludes: 'restricciones' }, undefined, true, 5000, false);
      if (modalResult?.detected) {
        return { blocked: true, title: modalResult.title, message: modalResult.message };
      }

      const fechaVigencia = options?.fecha ?? getDateToday();
      await this.actions.type(autorizacionSalidaSelectors.txtFechaVigencia(this.page), fechaVigencia, 'ingresar-fecha');

      const nota = options?.nota ?? 'Nota de prueba';
      await this.actions.type(autorizacionSalidaSelectors.txtNota(this.page), nota, 'Prueba automatizada');

      await this.actions.click(commonSelectors.btnProximo(this.page), 'click-btn-proximo');

      if (datos.contenedor) {
        await this.actions.type(autorizacionSalidaSelectors.txtBuscar(this.page), datos.contenedor, 'buscar-contenedor');
        await autorizacionSalidaSelectors.txtBuscar(this.page).press('Enter');
      }
    }

    await this.actions.click(autorizacionSalidaSelectors.chkSeleccionarTodos(this.page), 'click-chk-seleccionar-todos');
    await this.actions.click(commonSelectors.btnProximo(this.page), 'click-btn-proximo');
    await this.actions.click(commonSelectors.btnFinalizar(this.page), 'click-btn-finalizar');
    await this.actions.click(commonSelectors.btnSi(this.page), 'click-btn-si');
    await this.actions.click(commonSelectors.btnCerrar(this.page), 'click-btn-cerrar');
    return { blocked: false };
  }
}
