// @ts-check
const { test, expect } = require('@playwright/test');

// Utilizador criado pelo seed (src/seed.js)
const DEMO = { email: 'demo@example.com', password: 'password123' };

test.beforeEach(async ({ request, page }) => {
  // Põe a BD de testes no estado inicial (só existe com NODE_ENV=test)
  await request.post('/api/test/reset');

  // Login pela interface
  await page.goto('/login');
  await page.getByTestId('login-email').fill(DEMO.email);
  await page.getByTestId('login-password').fill(DEMO.password);
  await page.getByTestId('login-submit').click();
  await expect(page).toHaveURL('/');
});

// Teste de exemplo — a partir daqui é contigo!
test('mostra as tarefas do utilizador depois do login', async ({ page }) => {
  await expect(page.getByRole('heading', { name: 'As minhas tarefas' })).toBeVisible();
  await expect(page.getByTestId('todo-item')).toHaveCount(4);
});

// Ideias de testes para escreveres:
// - adicionar uma tarefa (com prioridade e data) e ver que aparece na lista
// - tarefa vazia / duplicada mostra mensagem de erro
// - marcar como concluída e ver o contador a atualizar
// - filtros "Por fazer" / "Concluídas" e a pesquisa
// - editar com duplo clique (Enter guarda, Escape cancela)
// - apagar uma tarefa (atenção: aparece um confirm() → page.on('dialog', ...))
// - "Limpar concluídas"
// - tarefa com data no passado aparece como "Atrasada"
// - as tarefas persistem depois de page.reload()
// - fazer logout e confirmar que "/" redireciona para "/login"
