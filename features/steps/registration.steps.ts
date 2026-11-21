import { When } from './fixtures';

When(
  'the visitor registers with name {string}, email {string}, password {string} and confirmation {string}',
  async ({ registerPage }, name: string, email: string, password: string, confirmation: string) => {
    await registerPage.goto();
    await registerPage.register(name, email, password, confirmation);
  },
);
