import { test as base, expect } from '@playwright/test';
import { createUserData, type UserData } from './userFactory';

type Options = {
  registerPath: string;
};

// Fixtures que os testes recebem
type Fixtures = {
  user: UserData;
};

export const test = base.extend<Options & Fixtures>({  
  registerPath: ['/api/auth/register', { option: true }],

  user: async ({ page, registerPath }, use) => {
    const user = createUserData();

    const registerRes = await page.request.post(registerPath, {
      data: { name: user.name, email: user.email, password: user.password },
    });

    await expect(registerRes).toBeOK();

    

    await use(user);
  },
});

export { expect };
export { createUserData, type UserData };