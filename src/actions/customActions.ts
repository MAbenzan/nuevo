import { Locator, Page, TestInfo, expect } from '@playwright/test';
import { commonSelectors } from 'selectors/common.selectors';

export class CustomActions {
  constructor(private page: Page, private testInfo: TestInfo) { }

  /** Opciones para acciones integradas */
  private defaultTimeout = 5000;
  private async ensurePageLoaded() {
    try {
      await this.page.waitForLoadState('domcontentloaded');
      await this.page.waitForLoadState('load');
      await this.page.waitForFunction(() => document.readyState === 'complete');
    } catch (e) {
      throw new Error('La página no está completamente cargada');
    }
  }
  private async preWaitVisible(locator: Locator, timeout?: number) {
    await this.ensurePageLoaded();
    try {
      await this.page.locator('.sweet-overlay').waitFor({ state: 'hidden', timeout: timeout ?? this.defaultTimeout });
    } catch {}
    try {
      // Esperar a que el icono de carga desaparezca (si existe)
      // waitFor({ state: 'hidden' }) retorna inmediatamente si el elemento no existe o ya está oculto
      await commonSelectors.loadingIcon(this.page).waitFor({ state: 'hidden', timeout: timeout ?? this.defaultTimeout });
    } catch {}
    try {
      await locator.waitFor({ state: 'visible', timeout: timeout ?? this.defaultTimeout });
    } catch (e) {
      throw new Error('Elemento no visible antes de la acción');
    }
    const enabled = await locator.isEnabled();
    if (!enabled) throw new Error('Elemento no habilitado para interactuar');
  }
  private async postWait(
    locatorOrPage: Locator | Page,
    wait?: { state?: 'visible' | 'hidden' | 'attached' | 'detached'; timeout?: number; locator?: Locator; navigation?: boolean },
  ) {
    if (!wait) return;
    if (wait.navigation) {
      await this.page.waitForLoadState('domcontentloaded');
      await this.page.waitForLoadState('load');
      await this.page.waitForFunction(() => document.readyState === 'complete');
      return;
    }
    const target = wait.locator ?? (locatorOrPage as Locator);
    if (wait.state) {
      await target.waitFor({ state: wait.state, timeout: wait.timeout ?? this.defaultTimeout });
    }
  }

  /**
   * Click robusto con espera previa de visible y posterior configurable
   * Ejemplo: await actions.click(btnGuardar, 'guardar', { wait: { navigation: true } })
   */
  async click(locator: Locator, stepName?: string, opts?: { timeout?: number; wait?: { state?: 'visible' | 'hidden' | 'attached' | 'detached'; timeout?: number; locator?: Locator; navigation?: boolean } }) {
    await this.preWaitVisible(locator, opts?.timeout);
    await locator.evaluate((el) => { (el as HTMLElement).style.border = '3px solid red'; });
    const before = await locator.screenshot();
    await this.testInfo.attach(`${stepName || 'click'}-before`, { contentType: 'image/png', body: before });
    await locator.click();
    await this.postWait(locator, opts?.wait);
    const after = await this.page.screenshot();
    await this.testInfo.attach(`${stepName || 'click'}-after`, { contentType: 'image/png', body: after });
  }

  /**
   * Type robusto con verificación de editable y espera posterior
   * Ejemplo: await actions.type(txtUsuario, 'john', 'ingresar-usuario')
   */
  async type(locator: Locator, text: string, stepName?: string, opts?: { timeout?: number; wait?: { state?: 'visible' | 'hidden' | 'attached' | 'detached'; timeout?: number; locator?: Locator } }) {
    await this.preWaitVisible(locator, opts?.timeout);
    const editable = await locator.isEditable();
    if (!editable) throw new Error('Elemento no editable para escribir');
    await locator.evaluate((el) => { (el as HTMLElement).style.border = '3px solid red'; });
    const before = await locator.screenshot();
    await this.testInfo.attach(`${stepName || 'type'}-before`, { contentType: 'image/png', body: before });
    await locator.fill(text);
    await this.postWait(locator, opts?.wait);
    const after = await locator.screenshot();
    await this.testInfo.attach(`${stepName || 'type'}-after`, { contentType: 'image/png', body: after });
  }

  /**
   * Hover robusto con espera
   * Ejemplo: await actions.hover(menu, 'hover-menu')
   */
  async hover(locator: Locator, stepName?: string, opts?: { timeout?: number; wait?: { state?: 'visible' | 'hidden' | 'attached' | 'detached'; timeout?: number; locator?: Locator } }) {
    await this.preWaitVisible(locator, opts?.timeout);
    await locator.evaluate((el) => { (el as HTMLElement).style.border = '3px solid red'; });
    const before = await locator.screenshot();
    await this.testInfo.attach(`${stepName || 'hover'}-before`, { contentType: 'image/png', body: before });
    await locator.hover();
    await this.postWait(locator, opts?.wait);
    const after = await locator.screenshot();
    await this.testInfo.attach(`${stepName || 'hover'}-after`, { contentType: 'image/png', body: after });
  }
  
  async pressEnter(locator: Locator, opts?: { timeout?: number }) {
    await this.preWaitVisible(locator, opts?.timeout);
    await locator.press('Enter');
  }

  async delay(ms: number) {
    await this.page.waitForTimeout(ms);
  }

  /**
   * Maneja modales genéricos (tipo SweetAlert).
   * @param expected Opcional: { title?, messageIncludes? } para validar contenido.
   * @param modalSelectors Opcional: selectores del modal (container, title, text). Usa commonSelectors por defecto.
   * @param accept Si es true, hace click en el botón Aceptar.
   * @param timeout Tiempo máximo de espera para que aparezca el modal.
   * @param failOnDetect Si es true, lanza error tras detectar (y aceptar) el modal.
   */
  async handleModal(
    expected?: { title?: string; messageIncludes?: string },
    modalSelectors = {
      container: commonSelectors.modalSweetAlert(this.page),
      title: commonSelectors.modalTitle(this.page),
      text: commonSelectors.modalText(this.page),
      acceptBtn: commonSelectors.btnAceptar(this.page)
    },
    accept = true,
    timeout = 5000,
    failOnDetect = false
  ): Promise<{ detected: boolean; title?: string; message?: string }> {
    try {
      await modalSelectors.container.waitFor({ state: 'visible', timeout });
    } catch {
      return { detected: false };
    }

    await modalSelectors.title.waitFor({ state: 'visible', timeout: 2000 });
    await modalSelectors.text.waitFor({ state: 'visible', timeout: 2000 });

    const title = ((await modalSelectors.title.textContent()) || '').trim();
    const message = ((await modalSelectors.text.textContent()) || '').trim();

    if (expected?.title) {
      expect(title.toLowerCase()).toContain((expected.title || '').toLowerCase());
    }
    if (expected?.messageIncludes) {
      expect(message.toLowerCase()).toContain((expected.messageIncludes || '').toLowerCase());
    }

    if (accept) {
      await this.click(modalSelectors.acceptBtn, 'modal-aceptar');
    }

    if (failOnDetect) {
      throw new Error(`Acción bloqueada: ${title} | ${message}`);
    }

    return { detected: true, title, message };
  }
}
