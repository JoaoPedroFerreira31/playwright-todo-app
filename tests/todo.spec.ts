import { createTodoData } from '../factories/todoFactory';
import { test, expect } from '../fixtures/index';


test('show tasks heading after login', {tag: '@smoke'}, async ({ page, user }) => {
  
  await page.goto('/');
  await expect(page.getByTestId('user-name')).toContainText(user.name);
  await expect(page.getByRole('heading', { name: 'As minhas tarefas' })).toBeVisible();

});


test('add new task and check it appears in the list', {tag: '@smoke'}, async ({ user: _user, todoPage }) => {
  const todoData = createTodoData();

  await todoPage.goto();
  await todoPage.createTodo(todoData.title, 'high', '2029-12-31');

  await expect(todoPage.todoItem).toHaveCount(1);
  await expect(todoPage.todoTitle.filter({ hasText: todoData.title })).toBeVisible();
});

test('add 4 tasks and check they appear in the list', {tag: '@smoke'}, async ({todoPage, todo }) => {
  for (let i = 0; i < 4; i++) {    
    await todo();
  }
  await todoPage.goto();

  await expect(todoPage.todoItem).toHaveCount(4);

});
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
