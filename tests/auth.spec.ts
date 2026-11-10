import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';

test.beforeEach(async ({ request }) => {
  await request.post('/api/test/reset');
});

// Teste de exemplo
test('sem sessão, a página inicial redireciona para o login', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveURL('/login');
});

test('login with wrong password shows error', async ({ page }) => {
  const loginPage = new LoginPage(page);

  await loginPage.goto();
  await loginPage.login('demo@example.com', 'wrongpassword');

  expect(page.locator('text=Email ou password incorretos.')).toBeVisible();
});

test('login with empty fields shows error', async ({ page }) => {
  const loginPage = new LoginPage(page);

  await loginPage.goto();
  await loginPage.login('', '');

  expect(page.locator('text=Preenche o email e a password.')).toBeVisible();
});

test('go to register page', async ({ page }) => {
  const loginPage = new LoginPage(page);

  await loginPage.goto();
  await loginPage.gotoRegisterPage();
  await expect(page).toHaveURL('/register');
  
  expect(page).toHaveTitle(/Criar conta/);  
  
});

// Ideias de testes para escreveres:

// - criar conta nova e ficar logo autenticado
// - criar conta com email já existente (demo@example.com)
// - passwords que não coincidem / password com menos de 8 caracteres
