import { Page, expect } from '@playwright/test';
import { CustomActions } from 'actions/customActions';
import { menuSelectors } from 'selectors/menu.selectors';
import { obtenerClienteYContenedorUnificado, Restricciones, Accion_restriccion } from 'data/queries';
import { commonSelectors } from 'selectors/common.selectors';
import { autorizacionSalidaSelectors } from 'selectors/autorizacionSalida.selectors';

export class AutorizacionSalidaPage {
  constructor(private page: Page, private actions: CustomActions) { }
  

  async autorizacionSalida(
    cliente?: string,
    dbParams?: { usuario?: string; rol?: string; garantia?: string | number | boolean; tributacion?: number; modulo?: string; estadoOperativo?: string; restricciones?: Restricciones; accion_restriccion?: Accion_restriccion },
    options?: { fecha?: string | null; nota?: string },
  ): Promise<{ blocked: boolean; title?: string; message?: string; solicitud?: string }> {
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
      const fecha = options?.fecha;

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

      
      if (fecha != null) {
        await this.actions.type(autorizacionSalidaSelectors.txtFechaVigencia(this.page), fecha, 'ingresar-fecha');
      }

      await this.actions.type(autorizacionSalidaSelectors.txtNota(this.page), 'Nota de prueba automatizada', 'Prueba automatizada');

      await this.actions.click(commonSelectors.btnProximo(this.page), 'click-btn-proximo');

      if (datos.contenedor) {
        await this.actions.type(autorizacionSalidaSelectors.txtBuscar(this.page), datos.contenedor, 'buscar-contenedor');
        await autorizacionSalidaSelectors.txtBuscar(this.page).press('Enter');
      }
    }

    await this.actions.delay(1000);
    // Aumentamos el timeout para dar tiempo a que la búsqueda termine y aparezca el resultado
    await this.actions.click(autorizacionSalidaSelectors.chkSeleccionarPrimero(this.page), 'click-chk-seleccionar-priemro', { timeout: 15000 });

    await this.actions.click(commonSelectors.btnProximo(this.page), 'click-btn-proximo');

    // Detectar modal de garantia exedida (SweetAlert)
    const modalGarantia = await this.actions.handleModal({ title: 'Garantia excedida!', messageIncludes: 'Desea solicitar aumento temporal de Garantia?' }, undefined, false, 5000, false);
    if (modalGarantia?.detected) {
      await this.actions.click(commonSelectors.btnNo(this.page), 'click-btn-no');
      return { blocked: true, title: modalGarantia.title, message: modalGarantia.message };
    }

    await this.actions.click(commonSelectors.btnFinalizar(this.page), 'click-btn-finalizar');

    await this.actions.click(commonSelectors.btnSi(this.page), 'click-btn-si');

    // Capturar solicitud: Esperamos a que aparezca "Solicitud No." en el modal y capturamos el número
    await this.actions.delay(2000); 
    const modalTitle = commonSelectors.modalTitle(this.page);
    await expect(modalTitle).toContainText('Solicitud No.', { timeout: 15000 });
    const solicitud = (await modalTitle.innerText()).match(/Solicitud No\.\s+([\d-]+)/i)?.[1];
    
    await this.actions.click(commonSelectors.btnCerrar(this.page), 'click-btn-cerrar');

    return { blocked: false, solicitud };
  }
}
