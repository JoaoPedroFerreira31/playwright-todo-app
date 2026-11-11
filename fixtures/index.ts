import { test as base } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { RegisterPage } from '../pages/RegisterPage';

type Pages = {
  loginPage: LoginPage;
  registerPage: RegisterPage;
};

export const test = base.extend<Pages>({
  loginPage: async ({ page }, use) => {
    const loginPage = new LoginPage(page);

    await use(loginPage);
  },
  
  registerPage: async ({ page }, use) => {
    const registerPage = new RegisterPage(page);
    
    await use(registerPage);
    
  }
});

export { expect } from '@playwright/test';