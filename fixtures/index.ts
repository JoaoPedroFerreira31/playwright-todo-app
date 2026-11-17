import { test as orgTest, expect } from '@org/pw-fixtures';
import { LoginPage } from '../pages/LoginPage';
import { RegisterPage } from '../pages/RegisterPage';
import { TodoPage } from '../pages/TodoPage';
import { createTodoData, TodoData } from '../factories/todoFactory';
import type { Todo } from '../src/types';

type Fixtures = {
  loginPage: LoginPage;
  registerPage: RegisterPage;
  todoPage: TodoPage;
  todo: (overrides?: Partial<TodoData>) => Promise<Todo>;
};

export const test = orgTest.extend<Fixtures>({
  loginPage: async ({ page }, use) => {
    const loginPage = new LoginPage(page);

    await use(loginPage);
  },

  registerPage: async ({ page }, use) => {
    const registerPage = new RegisterPage(page);

    await use(registerPage);

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

export { expect } from '@org/pw-fixtures';