import { Page, TestInfo } from '@playwright/test';
import { loginSelectors } from '../selectors/login.selectors';
import { CustomActions } from '../actions/customActions';

export class LoginPage {
  constructor(private page: Page, private actions: CustomActions) {}

  async goto() {
    await this.page.goto('/');
  }

  usernameInput() {
    return loginSelectors.usernameInput(this.page);
  }

  passwordInput() {
    return loginSelectors.passwordInput(this.page);
  }

  loginButton() {
    return loginSelectors.loginButton(this.page);
  }

  errorMessage() {
    return loginSelectors.errorMessage(this.page);
  }

  productsTitle() {
    return loginSelectors.productsTitle(this.page);
  }

  async login(testInfo: TestInfo, user: string, password: string) {
    await this.actions.customType(this.usernameInput(), user, 'ingresar-usuario');
    await this.actions.customType(this.passwordInput(), password, 'ingresar-password');
    await this.actions.customClick(this.loginButton(), 'click-login');
    await testInfo.attach('post-login', { contentType: 'image/png', body: await this.page.screenshot() });
  }
}