import { Page, TestInfo } from '@playwright/test';
import { loginSelectors } from '../selectors/login.selectors';
import { CustomActions } from '../actions/customActions';

export class LoginPage {
  constructor(private page: Page, private actions: CustomActions) {}

  async login(testInfo: TestInfo, user: string, password: string) {
    await this.page.goto('/');
    await this.actions.customType(loginSelectors.usernameInput(this.page), user, 'ingresar-usuario');
    await this.actions.customType(loginSelectors.passwordInput(this.page), password, 'ingresar-password');
    await this.actions.customClick(loginSelectors.loginButton(this.page), 'click-login');
    await testInfo.attach('post-login', { contentType: 'image/png', body: await this.page.screenshot() });
  }
}