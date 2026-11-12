import { test, expect } from '../fixtures/index';


test('show tasks heading after login', async ({ page, user }) => {
  
  await page.goto('/');
  await expect(page.getByTestId('user-name')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'As minhas tarefas' })).toBeVisible();

});


test('add new task and check it appears in the list', async ({ page, user, todoPage }) => {

  await todoPage.goto();
  await todoPage.createTodo('Nova tarefa', 'Alta', '2026-12-30');

  await expect(page.getByTestId('todo-title').filter({ hasText: 'Nova tarefa' })).toBeVisible();      

});

test('add 4 tasks and check they appear in the list (using page object)', async ({ page, user, todoPage }) => {
  await todoPage.goto();
  let todoObj = { 
    title: '', 
    priority: 'Alta', 
    dueDate: '2028-12-30' 
  };

  for (let i = 0; i < 4; i++) {
    todoObj.title = `Nova tarefa ${i+1}`;
    console.log(`Creating task: ${todoObj.title}`);
    let createTodoResponse = await page.request.post('api/todos', {
      data: {
        userId: user,
        ...todoObj
      },      
    });

    console.log(`Response status for task ${i+1}: ${createTodoResponse.status()}`);
  }

  await expect(page.getByRole('listitem')).toHaveCount(4);

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
