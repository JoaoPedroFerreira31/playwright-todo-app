import { test, expect } from '../fixtures/index';
import { createUserData } from '../factories/userFactory';

// Reset storage state for this file to avoid being authenticated
test.use({ storageState: { cookies: [], origins: [] } });

test.beforeEach(async ({ request }) => {
  await request.post('/api/test/reset');

  const user = createUserData();
  
});

// Teste de exemplo
test('sem sessão, a página inicial redireciona para o login', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveURL('/login');
});

test('login with wrong password shows error', async ({ page, loginPage }) => {
  const user = createUserData();

  await loginPage.goto();  
  await loginPage.login(user.email, 'wrongpassword');

  await expect(loginPage.errorMessage).toHaveText('Email ou password incorretos.');
});

test('login with empty fields shows error', async ({ page, loginPage }) => {  

  await loginPage.goto();
  await loginPage.login('', '');

  await expect(loginPage.errorMessage).toHaveText('Preenche o email e a password.');
});

test('go to register page', async ({ page, loginPage }) => {

  await loginPage.goto();
  await loginPage.gotoRegisterPage();
  
  await expect(page).toHaveURL('/register');
  await expect(page).toHaveTitle(/Criar conta/);  
  
});

// - criar conta nova e ficar logo autenticado
test('create new account and stay logged in', async ({ page, registerPage }) => {

  await registerPage.goto();
  await registerPage.register('New User', 'newuser@example.com', 'password123', 'password123');

  await expect(page.getByRole('heading', { name: 'As minhas tarefas' })).toBeVisible();  

});

// - criar conta com email já existente (demo@example.com)
test('create account with existing email shows error', async ({ page, registerPage }) => {

  await registerPage.goto();
  await registerPage.register('New User', 'demo@example.com', 'password123', 'password123');

  await expect(registerPage.errorMessage).toHaveText('Já existe uma conta com esse email.');

});

// Ideias de testes para escreveres:
// - passwords que não coincidem / password com menos de 8 caracteres
