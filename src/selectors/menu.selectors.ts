import { Page } from '@playwright/test';

export const menuSelectors = {
  menuCliente: (page: Page) => page.locator('button[data-id="usercliente"] .filter-option-inner-inner'),
  selectorcliente: (page: Page) => page.getByRole('combobox', { name: 'Search' }),

  seccionSolicitudes: (page: Page) => page.getByRole('link', { name: ' Solicitudes ' }),
  seccionReportes: (page: Page) => page.getByRole('link', { name: ' Reportes ' }),

  opcionAutorizacionSalida: (page: Page) => page.getByRole('link', { name: 'Autorización de Salida /' }),
  opcionNumeroReferencia: (page: Page) => page.getByRole('link', { name: 'Numero de Referencia', exact: true }),
  opcionNumeroReferenciaCP: (page: Page) => page.getByRole('link', { name: 'Numero de Referencia Cargos' }),
  opcionNumeroReferenciaPrecinto: (page: Page) => page.getByRole('link', { name: 'Número de Referencia Precinto' }),
  opcionReclamaciones: (page: Page) => page.getByRole('link', { name: 'Reclamaciones' }),
  opcionReleaseExportacion: (page: Page) => page.getByRole('link', { name: 'Release de Exportación' }),

};