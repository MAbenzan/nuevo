import { Page } from '@playwright/test';

export const commonSelectors = {

     btnNueva: (page: Page) => page.getByRole('button', { name: '+ Nueva' }),
     btnCancelar: (page: Page) => page.getByRole('button', { name: ' Cancelar' }),
     btnProximo: (page: Page) => page.getByRole('button', { name: 'Próximo ' }),
     btnPrevio: (page: Page) => page.getByRole('button', { name: ' Previo' }),
     btnFinalizar: (page: Page) => page.getByRole('button', { name: 'Finalizar ' }),
     btnSi: (page: Page) => page.getByRole('button', { name: 'Si' }),
     btnNo: (page: Page) => page.getByRole('button', { name: 'No' }),
     btnImprimir: (page: Page) => page.getByRole('button', { name: 'Imprimir' }),
     btnCerrar: (page: Page) => page.getByRole('button', { name: 'Cerrar' }),
     btnAceptar: (page: Page) => page.getByRole('button', { name: 'Aceptar' }),

     // Selectores SweetAlert genéricos
     modalSweetAlert: (page: Page) => page.locator('div.sweet-alert.showSweetAlert'),
     modalTitle: (page: Page) => page.locator('div.sweet-alert.showSweetAlert h2'),
     modalText: (page: Page) => page.locator('div.sweet-alert.showSweetAlert p.lead.text-muted'),

     // Otros
     loadingIcon: (page: Page) => page.locator('.progress-center'),
}
