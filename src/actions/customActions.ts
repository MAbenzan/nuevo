import { Locator, Page, TestInfo } from '@playwright/test';

export class CustomActions {
  constructor(private page: Page, private testInfo: TestInfo) {}

  async customClick(locator: Locator, stepName?: string) {
    await locator.evaluate((el) => {
      (el as HTMLElement).style.border = '3px solid red';
    });
    const before = await locator.screenshot();
    await this.testInfo.attach(`${stepName || 'click'}-before`, { contentType: 'image/png', body: before });
    await locator.click();
    const after = await this.page.screenshot();
    await this.testInfo.attach(`${stepName || 'click'}-after`, { contentType: 'image/png', body: after });
  }

  async customType(locator: Locator, text: string, stepName?: string) {
    await locator.evaluate((el) => {
      (el as HTMLElement).style.border = '3px solid red';
    });
    const before = await locator.screenshot();
    await this.testInfo.attach(`${stepName || 'type'}-before`, { contentType: 'image/png', body: before });
    await locator.fill(text);
    const after = await locator.screenshot();
    await this.testInfo.attach(`${stepName || 'type'}-after`, { contentType: 'image/png', body: after });
  }

  async customHover(locator: Locator, stepName?: string) {
    await locator.evaluate((el) => {
      (el as HTMLElement).style.border = '3px solid red';
    });
    const before = await locator.screenshot();
    await this.testInfo.attach(`${stepName || 'hover'}-before`, { contentType: 'image/png', body: before });
    await locator.hover();
    const after = await locator.screenshot();
    await this.testInfo.attach(`${stepName || 'hover'}-after`, { contentType: 'image/png', body: after });
  }

  async customPressEnter(locator: Locator) {
    await locator.press('Enter');
  }

  async waitForVisible(locator: Locator, timeout?: number) {
    await locator.waitFor({ state: 'visible', timeout });
  }

  async waitForHidden(locator: Locator, timeout?: number) {
    await locator.waitFor({ state: 'hidden', timeout });
  }

  async waitForPageLoaded() {
    await this.page.waitForLoadState('load');
    await this.page.waitForLoadState('networkidle');
    await this.page.waitForFunction(() => document.readyState === 'complete');
  }

  async waitForUrl(pattern: string | RegExp, timeout?: number) {
    await this.page.waitForURL(pattern as any, { timeout });
  }

  async waitForResponseUrl(pattern: string | RegExp, timeout?: number) {
    const predicate = (res: any) => {
      const url = res.url();
      return typeof pattern === 'string' ? url.includes(pattern) : (pattern as RegExp).test(url);
    };
    await this.page.waitForResponse(predicate, { timeout });
  }

  async delay(ms: number) {
    await this.page.waitForTimeout(ms);
  }
}
