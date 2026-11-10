const express = require('express');
const { db } = require('../db');
const { requireAuth } = require('../auth');

const router = express.Router();
router.use(requireAuth);

const PRIORITIES = ['low', 'medium', 'high'];
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const MAX_TITLE = 100;

function toJson(row) {
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

function findTodo(userId, id) {
  return db.prepare('SELECT * FROM todos WHERE id = ? AND user_id = ?').get(id, userId);
}

function titleExists(userId, title, exceptId = 0) {
  return db
    .prepare('SELECT 1 FROM todos WHERE user_id = ? AND lower(title) = lower(?) AND id != ?')
    .get(userId, title, exceptId);
}

// Valida os campos recebidos. `partial` = true para PATCH (só valida o que vier).
function validate(body, partial) {
  const out = {};

  if (!partial || body.title !== undefined) {
    const title = String(body.title ?? '').trim();
    if (!title) return { error: 'A tarefa não pode estar vazia.' };
    if (title.length > MAX_TITLE) return { error: `A tarefa não pode ter mais de ${MAX_TITLE} caracteres.` };
    out.title = title;
  }
  if (body.priority !== undefined) {
    if (!PRIORITIES.includes(body.priority)) return { error: 'Prioridade inválida.' };
    out.priority = body.priority;
  }
  if (body.dueDate !== undefined) {
    if (body.dueDate !== null && body.dueDate !== '' && !DATE_RE.test(body.dueDate)) {
      return { error: 'Data inválida (formato AAAA-MM-DD).' };
    }
    out.due_date = body.dueDate || null;
  }
  if (body.completed !== undefined) {
    if (typeof body.completed !== 'boolean') return { error: 'O campo "completed" tem de ser true/false.' };
    out.completed = body.completed ? 1 : 0;
  }
  return { data: out };
}

// GET /api/todos?status=all|active|completed&q=texto
router.get('/', (req, res) => {
  const { status = 'all', q = '' } = req.query;
  let sql = 'SELECT * FROM todos WHERE user_id = ?';
  const params = [req.user.id];

  if (status === 'active') sql += ' AND completed = 0';
  else if (status === 'completed') sql += ' AND completed = 1';

  if (q) {
    sql += ' AND title LIKE ?';
    params.push(`%${q}%`);
  }
  sql += ' ORDER BY id';

  const todos = db.prepare(sql).all(...params).map(toJson);
  const { remaining } = db
    .prepare('SELECT COUNT(*) AS remaining FROM todos WHERE user_id = ? AND completed = 0')
    .get(req.user.id);
  const { total } = db.prepare('SELECT COUNT(*) AS total FROM todos WHERE user_id = ?').get(req.user.id);

  res.json({ todos, remaining, total });
});

// GET /api/todos/:id
router.get('/:id', (req, res) => {
  const todo = findTodo(req.user.id, req.params.id);
  if (!todo) return res.status(404).json({ error: 'Tarefa não encontrada.' });
  res.json(toJson(todo));
});

// POST /api/todos  { title, priority?, dueDate? }
router.post('/', (req, res) => {
  const { error, data } = validate(req.body ?? {}, false);
  if (error) return res.status(400).json({ error });
  if (titleExists(req.user.id, data.title)) return res.status(409).json({ error: 'Essa tarefa já existe.' });

  const { lastInsertRowid } = db
    .prepare('INSERT INTO todos (user_id, title, priority, due_date) VALUES (?, ?, ?, ?)')
    .run(req.user.id, data.title, data.priority ?? 'medium', data.due_date ?? null);

  res.status(201).json(toJson(findTodo(req.user.id, lastInsertRowid)));
});

// PATCH /api/todos/:id  { title?, completed?, priority?, dueDate? }
router.patch('/:id', (req, res) => {
  const todo = findTodo(req.user.id, req.params.id);
  if (!todo) return res.status(404).json({ error: 'Tarefa não encontrada.' });

  const { error, data } = validate(req.body ?? {}, true);
  if (error) return res.status(400).json({ error });
  if (data.title && titleExists(req.user.id, data.title, todo.id)) {
    return res.status(409).json({ error: 'Essa tarefa já existe.' });
  }

  const fields = Object.keys(data);
  if (fields.length) {
    const sets = fields.map((f) => `${f} = ?`).join(', ');
    db.prepare(`UPDATE todos SET ${sets}, updated_at = datetime('now') WHERE id = ?`).run(
      ...fields.map((f) => data[f]),
      todo.id
    );
  }
  res.json(toJson(findTodo(req.user.id, todo.id)));
});

// DELETE /api/todos/:id
router.delete('/:id', (req, res) => {
  const { changes } = db.prepare('DELETE FROM todos WHERE id = ? AND user_id = ?').run(req.params.id, req.user.id);
  if (!changes) return res.status(404).json({ error: 'Tarefa não encontrada.' });
  res.status(204).end();
});

// DELETE /api/todos?completed=true  — limpa as concluídas
router.delete('/', (req, res) => {
  if (req.query.completed !== 'true') {
    return res.status(400).json({ error: 'Usa ?completed=true para apagar as concluídas.' });
  }
  const { changes } = db.prepare('DELETE FROM todos WHERE user_id = ? AND completed = 1').run(req.user.id);
  res.json({ deleted: Number(changes) });
});

module.exports = router;
