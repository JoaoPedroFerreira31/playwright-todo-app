// @ts-check
const { test, expect } = require('@playwright/test');

test.beforeEach(async ({ page }) => {
  await page.goto('/');
});

// Teste de exemplo só para confirmar que tudo funciona — a partir daqui é contigo!
test('a página abre com o título certo', async ({ page }) => {
  await expect(page.getByRole('heading', { name: 'As minhas tarefas' })).toBeVisible();
});

// Ideias de testes para escreveres:
// - adicionar uma tarefa e ver que aparece na lista
// - não deixar adicionar tarefa vazia (mensagem de erro)
// - não deixar adicionar tarefa duplicada
// - marcar como concluída e ver o contador a atualizar
// - filtros "Por fazer" / "Concluídas"
// - editar com duplo clique (Enter guarda, Escape cancela)
// - apagar uma tarefa
// - "Limpar concluídas"
// - as tarefas persistem depois de page.reload()
