
import { Page } from '@playwright/test';

export const autorizacionSalidaSelectors = {
    
    txtFechaVigencia: (page: Page) => page.getByRole('textbox', { name: 'dd/mm/aaaa' }),
    txtNota: (page: Page) => page.getByRole('textbox', { name: 'Nota' }),
    txtBuscar: (page: Page) => page.getByRole('textbox', { name: 'BL, Contenedor o Booking' }),

    chkSeleccionarTodos: (page: Page) => page.getByRole('row', { name: 'BL / Booking Contenedor' }).getByRole('checkbox'),
    chkSeleccionarPrimero: (page: Page) => page.locator('input.select-box[name="select"]').nth(1),

    chkCreditoInterno: (page: Page) => page.locator('#creditointernocbx'),
    chkTransferencia: (page: Page) => page.locator('#transferenciacbx'),

    header: (page: Page) => page.getByRole('heading', { name: ' Autorización de Salida /' }),

}
