import { test, expect } from '@playwright/test';

test('show tasks heading after login', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'As minhas tarefas' })).toBeVisible();
});


// - adicionar uma tarefa (com prioridade e data) e ver que aparece na lista


// Ideias de testes para escreveres:
// - tarefa vazia / duplicada mostra mensagem de erro
// - marcar como concluída e ver o contador a atualizar
// - filtros "Por fazer" / "Concluídas" e a pesquisa
// - editar com duplo clique (Enter guarda, Escape cancela)
// - apagar uma tarefa (atenção: aparece um confirm() → page.on('dialog', ...))
// - "Limpar concluídas"
// - tarefa com data no passado aparece como "Atrasada"
// - as tarefas persistem depois de page.reload()
// - fazer logout e confirmar que "/" redireciona para "/login"
