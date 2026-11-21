import { When, Then, expect } from './fixtures';

// --- When: as ações ---

When('the user logs in with valid credentials', async ({ loginPage, registeredUser }) => {
  await loginPage.goto();
  await loginPage.login(registeredUser.email, registeredUser.password);
});

When('the user logs in with the valid email and wrong password', async ({ loginPage, registeredUser }) => {
  await loginPage.goto();
  await loginPage.login(registeredUser.email, 'wrongpassword');
});

When('the user logs in with empty fields', async ({ loginPage }) => {
  await loginPage.goto();
  await loginPage.login('', '');
});

When('the visitor without a session opens the todo list', async ({ page }) => {
  await page.goto('/');
});

// --- Then: os resultados observáveis ---

Then('the user sees the list of todos', async ({ page }) => {
  await expect(page).toHaveURL('/');
  await expect(page.getByRole('heading', { name: 'As minhas tarefas' })).toBeVisible();
});

Then('the user sees their name', async ({ page, registeredUser }) => {
  await expect(page.getByTestId('user-name')).toContainText(registeredUser.name);
});

Then('the user stays on the login page', async ({ page }) => {
  await expect(page).toHaveURL('/login');
});

Then('the visitor is redirected to the Login page', async ({ page }) => {
  await expect(page).toHaveURL('/login');
});
