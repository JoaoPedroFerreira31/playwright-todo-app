// Testes à API diretamente, sem browser, usando o fixture `request`.
import { test, expect } from '@playwright/test';
import { createUserData } from '../factories/userFactory';
import { createTodoData } from '../factories/todoFactory';
import type { Todo, TodoList } from '../src/types';

test.beforeEach(async ({ request }) => {
  const user = createUserData();
  const registerRes = await request.post('/api/auth/register', { data: user });

  await expect(registerRes).toBeOK();  
});

// Teste de exemplo
test('GET /api/todos devolve as tarefas', async ({ request }) => {

  const todos: Todo[] = [];
  for (let i = 0; i < 4; i++) {
    const res = await request.post('/api/todos', { data: createTodoData() });
    await expect(res).toBeOK();
    todos.push(await res.json());
  }
  await expect(await request.patch(`/api/todos/${todos[0].id}`, { data: { completed: true } })).toBeOK();

  const res = await request.get('/api/todos');
  await expect(res).toBeOK();

  const body: TodoList = await res.json();
  expect(body.total).toBe(4);
  expect(body.remaining).toBe(3);
});

// Ideias de testes para escreveres:
// - POST /api/todos cria uma tarefa (201) e valida o corpo da resposta
// - POST com título vazio → 400; título duplicado → 409; prioridade inválida → 400
// - PATCH /api/todos/:id para concluir / mudar o título
// - DELETE /api/todos/:id → 204, e depois GET → 404
// - pedidos sem login → 401
// - um utilizador não consegue ver/alterar tarefas de outro
// - criar dados pela API e depois verificar na interface (mais rápido do que pela UI)
