import { test as base, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { RegisterPage } from '../pages/RegisterPage';
import { TodoPage } from '../pages/TodoPage';
import { createUserData, UserData } from '../factories/userFactory';
 
type Fixtures = {
  loginPage: LoginPage;
  registerPage: RegisterPage;
  todoPage: TodoPage;
  user: UserData; 
};



export const test = base.extend<Fixtures>({
  loginPage: async ({ page }, use) => {
    const loginPage = new LoginPage(page);

    await use(loginPage);
  },
  
  registerPage: async ({ page }, use) => {
    const registerPage = new RegisterPage(page);
    
    await use(registerPage);
    
  },

  user: async ({page}, use) => {
    const user = createUserData();

    const registerRes = await page.request.post('/api/auth/register', {
        data: { name: user.name, email: user.email, password: user.password },
    });

    await expect(registerRes).toBeOK();
    
    await use(user);

  },

  todoPage: async ({ page }, use) => {
    const todoPage = new TodoPage(page);    
    
    await use(todoPage);    
  }

});

export { expect } from '@playwright/test';