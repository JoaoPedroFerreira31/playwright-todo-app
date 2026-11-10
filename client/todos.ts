// Página principal: lista de tarefas do utilizador autenticado, tudo via API.
import { api, byId, errorMessage } from './api.js';
import type { Filter, Priority, Todo, TodoList, User } from './types.js';

const PRIORITY_LABELS: Record<Priority, string> = { low: 'Baixa', medium: 'Média', high: 'Alta' };

const form = byId<HTMLFormElement>('todo-form');
const titleInput = byId<HTMLInputElement>('new-todo');
const priorityInput = byId<HTMLSelectElement>('new-priority');
const dueInput = byId<HTMLInputElement>('new-due');
const list = byId<HTMLUListElement>('todo-list');
const errorEl = byId('error');
const emptyEl = byId('empty');
const loadingEl = byId('loading');
const counterEl = byId('counter');
const clearBtn = byId<HTMLButtonElement>('clear-completed');
const searchInput = byId<HTMLInputElement>('search');
const filterButtons = document.querySelectorAll<HTMLButtonElement>('[data-filter]');

interface State extends TodoList {
  filter: Filter;
  search: string;
}

const state: State = { filter: 'all', search: '', todos: [], remaining: 0, total: 0 };

function showError(message: string): void {
  errorEl.textContent = message;
  errorEl.hidden = !message;
}

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

function formatDate(iso: string): string {
  const [y, m, d] = iso.split('-');
  return `${d}/${m}/${y}`;
}

// ---------- Dados ----------
async function loadTodos(): Promise<void> {
  const params = new URLSearchParams({ status: state.filter });
  if (state.search) params.set('q', state.search);
  const data = await api<TodoList>(`/api/todos?${params}`);
  Object.assign(state, data);
  loadingEl.hidden = true;
  render();
}

/** Executa uma ação na API e recarrega a lista; mostra o erro se falhar. */
async function run(action: () => Promise<unknown> = async () => {}): Promise<void> {
  try {
    showError('');
    await action();
    await loadTodos();
  } catch (err) {
    showError(errorMessage(err));
  }
}

// ---------- Render ----------
function render(): void {
  list.replaceChildren(...state.todos.map(renderItem));

  counterEl.textContent = `${state.remaining} ${state.remaining === 1 ? 'tarefa' : 'tarefas'} por fazer`;
  clearBtn.hidden = state.total === state.remaining;

  if (state.todos.length === 0) {
    emptyEl.textContent = state.total === 0 ? 'Ainda não tens tarefas 🎉' : 'Nenhuma tarefa encontrada.';
    emptyEl.hidden = false;
  } else {
    emptyEl.hidden = true;
  }

  filterButtons.forEach((btn) => {
    const active = btn.dataset.filter === state.filter;
    btn.classList.toggle('active', active);
    btn.setAttribute('aria-pressed', String(active));
  });
}

function renderItem(todo: Todo): HTMLLIElement {
  const li = document.createElement('li');
  li.className = 'todo-item' + (todo.completed ? ' completed' : '');
  li.dataset.testid = 'todo-item';
  li.dataset.id = String(todo.id);

  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  checkbox.checked = todo.completed;
  checkbox.dataset.testid = 'todo-checkbox';
  checkbox.setAttribute('aria-label', `Marcar "${todo.title}" como concluída`);
  checkbox.addEventListener('change', () =>
    run(() => api<Todo>(`/api/todos/${todo.id}`, { method: 'PATCH', body: { completed: checkbox.checked } }))
  );

  const title = document.createElement('span');
  title.className = 'title';
  title.textContent = todo.title;
  title.dataset.testid = 'todo-title';
  title.title = 'Duplo clique para editar';
  title.addEventListener('dblclick', () => startEditing(li, title, todo));

  const priority = document.createElement('span');
  priority.className = `badge priority-${todo.priority}`;
  priority.textContent = PRIORITY_LABELS[todo.priority];
  priority.dataset.testid = 'todo-priority';

  li.append(checkbox, title, priority);

  if (todo.dueDate) {
    const due = document.createElement('span');
    const overdue = !todo.completed && todo.dueDate < today();
    due.className = 'due' + (overdue ? ' overdue' : '');
    due.textContent = (overdue ? 'Atrasada · ' : '') + formatDate(todo.dueDate);
    due.dataset.testid = 'todo-due-date';
    li.appendChild(due);
  }

  const del = document.createElement('button');
  del.type = 'button';
  del.className = 'delete';
  del.textContent = '✕';
  del.dataset.testid = 'todo-delete';
  del.setAttribute('aria-label', `Apagar "${todo.title}"`);
  del.addEventListener('click', () => {
    if (!confirm(`Apagar "${todo.title}"?`)) return;
    run(() => api(`/api/todos/${todo.id}`, { method: 'DELETE' }));
  });
  li.appendChild(del);

  return li;
}

function startEditing(li: HTMLLIElement, titleEl: HTMLSpanElement, todo: Todo): void {
  const input = document.createElement('input');
  input.type = 'text';
  input.className = 'edit-input';
  input.value = todo.title;
  input.maxLength = 100;
  input.dataset.testid = 'todo-edit-input';
  input.setAttribute('aria-label', 'Editar tarefa');
  li.replaceChild(input, titleEl);
  input.focus();
  input.select();

  let done = false;
  const finish = (save: boolean) => {
    if (done) return;
    done = true;
    const value = input.value.trim();
    if (!save || value === todo.title) return render();
    run(() => api<Todo>(`/api/todos/${todo.id}`, { method: 'PATCH', body: { title: value } }));
  };

  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') finish(true);
    if (e.key === 'Escape') finish(false);
  });
  input.addEventListener('blur', () => finish(true));
}

// ---------- Eventos ----------
form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const title = titleInput.value.trim();
  if (!title) return showError('A tarefa não pode estar vazia.');

  try {
    showError('');
    await api<Todo>('/api/todos', {
      method: 'POST',
      body: { title, priority: priorityInput.value, dueDate: dueInput.value || null },
    });
    form.reset();
    await loadTodos();
  } catch (err) {
    showError(errorMessage(err));
  }
  titleInput.focus();
});

filterButtons.forEach((btn) =>
  btn.addEventListener('click', () => {
    state.filter = btn.dataset.filter as Filter;
    run();
  })
);

let searchTimer: ReturnType<typeof setTimeout> | undefined;
searchInput.addEventListener('input', () => {
  clearTimeout(searchTimer);
  searchTimer = setTimeout(() => {
    state.search = searchInput.value.trim();
    run();
  }, 250);
});

clearBtn.addEventListener('click', () => run(() => api('/api/todos?completed=true', { method: 'DELETE' })));

byId('logout').addEventListener('click', async () => {
  await api('/api/auth/logout', { method: 'POST' });
  window.location.href = '/login';
});

// ---------- Arranque ----------
(async () => {
  const me = await api<User>('/api/auth/me').catch(() => null);
  if (!me) {
    window.location.href = '/login';
    return;
  }
  byId('user-name').textContent = `Olá, ${me.name}`;
  await loadTodos();
})();
