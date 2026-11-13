import { test as base, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { RegisterPage } from '../pages/RegisterPage';
import { TodoPage } from '../pages/TodoPage';
import { createUserData, UserData } from '../factories/userFactory';
import { createTodoData, TodoData } from '../factories/todoFactory';
import type { Todo } from '../src/types';

type Fixtures = {
  loginPage: LoginPage;
  registerPage: RegisterPage;
  todoPage: TodoPage;
  user: UserData & { id: number };
  todo: (overrides?: Partial<TodoData>) => Promise<Todo>;
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

  user: async ({ page }, use) => {
    const user = createUserData();

    const registerRes = await page.request.post('/api/auth/register', {
      data: { name: user.name, email: user.email, password: user.password },
    });

    await expect(registerRes).toBeOK();

    const { id }: { id: number } = await registerRes.json();

    await use({ ...user, id });

  },

  todoPage: async ({ page }, use) => {
    const todoPage = new TodoPage(page);

    await use(todoPage);
  },

  todo: async ({ page, user: _user }, use) => {
    await use(async (overrides: Partial<TodoData> = {}) => {
      const res = await page.request.post('/api/todos', { data: createTodoData(overrides) });
      await expect(res).toBeOK();
      return (await res.json()) as Todo;
    });
  },
});

export { expect } from '@playwright/test';