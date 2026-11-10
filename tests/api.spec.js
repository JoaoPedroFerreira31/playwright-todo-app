// @ts-check
// Testes à API diretamente, sem browser, usando o fixture `request`.
const { test, expect } = require('@playwright/test');

test.beforeEach(async ({ request }) => {
  await request.post('/api/test/reset');
  // O cookie de sessão fica guardado no contexto do `request` para os pedidos seguintes
  await request.post('/api/auth/login', {
    data: { email: 'demo@example.com', password: 'password123' },
  });
});

// Teste de exemplo
test('GET /api/todos devolve as tarefas do seed', async ({ request }) => {
  const res = await request.get('/api/todos');
  expect(res.status()).toBe(200);

  const body = await res.json();
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
