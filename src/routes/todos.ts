import { Router } from 'express';
import { execute, queryAll, queryOne, type SqlParam } from '../db';
import { currentUser, requireAuth } from '../auth';
import type { Priority, Todo, TodoList, TodoRow } from '../types';

const router = Router();
router.use(requireAuth);

const PRIORITIES: Priority[] = ['low', 'medium', 'high'];
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const MAX_TITLE = 100;

/** Campos que podem ser escritos na tabela `todos`. */
interface TodoChanges {
  title?: string;
  priority?: Priority;
  due_date?: string | null;
  completed?: 0 | 1;
}

type Validation = { error: string; data?: never } | { error?: never; data: TodoChanges };

function toJson(row: TodoRow): Todo {
  return {
    id: row.id,
    title: row.title,
    completed: Boolean(row.completed),
    priority: row.priority,
    dueDate: row.due_date,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function findTodo(userId: number, id: number | string): TodoRow | undefined {
  return queryOne<TodoRow>('SELECT * FROM todos WHERE id = ? AND user_id = ?', Number(id), userId);
}

function titleExists(userId: number, title: string, exceptId = 0): boolean {
  return Boolean(
    queryOne('SELECT 1 FROM todos WHERE user_id = ? AND lower(title) = lower(?) AND id != ?', userId, title, exceptId)
  );
}

/** Valida os campos recebidos. `partial` = true para PATCH (só valida o que vier). */
function validate(body: Record<string, unknown>, partial: boolean): Validation {
  const data: TodoChanges = {};

  if (!partial || body.title !== undefined) {
    const title = String(body.title ?? '').trim();
    if (!title) return { error: 'A tarefa não pode estar vazia.' };
    if (title.length > MAX_TITLE) return { error: `A tarefa não pode ter mais de ${MAX_TITLE} caracteres.` };
    data.title = title;
  }
  if (body.priority !== undefined) {
    if (!PRIORITIES.includes(body.priority as Priority)) return { error: 'Prioridade inválida.' };
    data.priority = body.priority as Priority;
  }
  if (body.dueDate !== undefined) {
    const due = body.dueDate;
    if (due !== null && due !== '' && !(typeof due === 'string' && DATE_RE.test(due))) {
      return { error: 'Data inválida (formato AAAA-MM-DD).' };
    }
    data.due_date = (due as string | null) || null;
  }
  if (body.completed !== undefined) {
    if (typeof body.completed !== 'boolean') return { error: 'O campo "completed" tem de ser true/false.' };
    data.completed = body.completed ? 1 : 0;
  }
  return { data };
}

// GET /api/todos?status=all|active|completed&q=texto
router.get('/', (req, res) => {
  const user = currentUser(req);
  const status = String(req.query.status ?? 'all');
  const q = String(req.query.q ?? '');

  let sql = 'SELECT * FROM todos WHERE user_id = ?';
  const params: SqlParam[] = [user.id];

  if (status === 'active') sql += ' AND completed = 0';
  else if (status === 'completed') sql += ' AND completed = 1';

  if (q) {
    sql += ' AND title LIKE ?';
    params.push(`%${q}%`);
  }
  sql += ' ORDER BY id';

  const todos = queryAll<TodoRow>(sql, ...params).map(toJson);
  const remaining =
    queryOne<{ n: number }>('SELECT COUNT(*) AS n FROM todos WHERE user_id = ? AND completed = 0', user.id)?.n ?? 0;
  const total = queryOne<{ n: number }>('SELECT COUNT(*) AS n FROM todos WHERE user_id = ?', user.id)?.n ?? 0;

  const body: TodoList = { todos, remaining, total };
  res.json(body);
});

// GET /api/todos/:id
router.get('/:id', (req, res) => {
  const todo = findTodo(currentUser(req).id, req.params.id);
  if (!todo) {
    res.status(404).json({ error: 'Tarefa não encontrada.' });
    return;
  }
  res.json(toJson(todo));
});

// POST /api/todos  { title, priority?, dueDate? }
router.post('/', (req, res) => {
  const user = currentUser(req);
  const result = validate(req.body ?? {}, false);
  if (result.error !== undefined) {
    res.status(400).json({ error: result.error });
    return;
  }
  const title = result.data.title!;
  if (titleExists(user.id, title)) {
    res.status(409).json({ error: 'Essa tarefa já existe.' });
    return;
  }

  const { lastInsertRowid } = execute(
    'INSERT INTO todos (user_id, title, priority, due_date) VALUES (?, ?, ?, ?)',
    user.id,
    title,
    result.data.priority ?? 'medium',
    result.data.due_date ?? null
  );

  res.status(201).json(toJson(findTodo(user.id, lastInsertRowid)!));
});

// PATCH /api/todos/:id  { title?, completed?, priority?, dueDate? }
router.patch('/:id', (req, res) => {
  const user = currentUser(req);
  const todo = findTodo(user.id, req.params.id);
  if (!todo) {
    res.status(404).json({ error: 'Tarefa não encontrada.' });
    return;
  }

  const result = validate(req.body ?? {}, true);
  if (result.error !== undefined) {
    res.status(400).json({ error: result.error });
    return;
  }
  const { data } = result;
  if (data.title && titleExists(user.id, data.title, todo.id)) {
    res.status(409).json({ error: 'Essa tarefa já existe.' });
    return;
  }

  const fields = Object.keys(data) as (keyof TodoChanges)[];
  if (fields.length) {
    const sets = fields.map((f) => `${f} = ?`).join(', ');
    execute(
      `UPDATE todos SET ${sets}, updated_at = datetime('now') WHERE id = ?`,
      ...fields.map((f) => data[f] ?? null),
      todo.id
    );
  }
  res.json(toJson(findTodo(user.id, todo.id)!));
});

// DELETE /api/todos/:id
router.delete('/:id', (req, res) => {
  const { changes } = execute('DELETE FROM todos WHERE id = ? AND user_id = ?', Number(req.params.id), currentUser(req).id);
  if (!changes) {
    res.status(404).json({ error: 'Tarefa não encontrada.' });
    return;
  }
  res.status(204).end();
});

// DELETE /api/todos?completed=true  — limpa as concluídas
router.delete('/', (req, res) => {
  if (req.query.completed !== 'true') {
    res.status(400).json({ error: 'Usa ?completed=true para apagar as concluídas.' });
    return;
  }
  const { changes } = execute('DELETE FROM todos WHERE user_id = ? AND completed = 1', currentUser(req).id);
  res.json({ deleted: changes });
});

export default router;
