import { test, expect } from '@playwright/test';

test.beforeEach(async ({ request }) => {
  await request.post('/api/test/reset');
});

// Teste de exemplo
test('sem sessão, a página inicial redireciona para o login', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveURL('/login');
});

// Ideias de testes para escreveres:
// - login com password errada mostra "Email ou password incorretos."
// - login com campos vazios
// - criar conta nova e ficar logo autenticado
// - criar conta com email já existente (demo@example.com)
// - passwords que não coincidem / password com menos de 8 caracteres
// - guardar a sessão com storageState para não fazer login em todos os testes
