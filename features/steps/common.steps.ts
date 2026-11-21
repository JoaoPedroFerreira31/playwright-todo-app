import { Given, Then, expect } from './fixtures';

Given('a registered user exists', async ({ registeredUser: _registeredUser }) => {});

// `user/visitor` é uma alternativa: serve o "the user sees..." do login
// e o "the visitor sees..." do registo com um só step definition.
// O alerta de erro é o mesmo nas duas páginas (role="alert").
Then('the user/visitor sees the message {string}', async ({ page }, message: string) => {
  await expect(page.getByRole('alert')).toHaveText(message);
});
