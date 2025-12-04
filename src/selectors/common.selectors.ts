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

}