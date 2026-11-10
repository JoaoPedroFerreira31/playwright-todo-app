// Página principal: lista de tarefas do utilizador autenticado, tudo via API.
const PRIORITY_LABELS = { low: 'Baixa', medium: 'Média', high: 'Alta' };

const form = document.getElementById('todo-form');
const titleInput = document.getElementById('new-todo');
const priorityInput = document.getElementById('new-priority');
const dueInput = document.getElementById('new-due');
const list = document.getElementById('todo-list');
const errorEl = document.getElementById('error');
const emptyEl = document.getElementById('empty');
const loadingEl = document.getElementById('loading');
const counterEl = document.getElementById('counter');
const clearBtn = document.getElementById('clear-completed');
const searchInput = document.getElementById('search');
const filterButtons = document.querySelectorAll('[data-filter]');

const state = { filter: 'all', search: '', todos: [], remaining: 0, total: 0 };

function showError(message) {
  errorEl.textContent = message || '';
  errorEl.hidden = !message;
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

function formatDate(iso) {
  const [y, m, d] = iso.split('-');
  return `${d}/${m}/${y}`;
}

// ---------- Dados ----------
async function loadTodos() {
  const params = new URLSearchParams({ status: state.filter });
  if (state.search) params.set('q', state.search);
  const data = await api(`/api/todos?${params}`);
  Object.assign(state, data);
  loadingEl.hidden = true;
  render();
}

async function run(action) {
  try {
    showError('');
    await action();
    await loadTodos();
  } catch (err) {
    showError(err.message);
  }
}

// ---------- Render ----------
function render() {
  list.innerHTML = '';
  for (const todo of state.todos) list.appendChild(renderItem(todo));

  const hasCompleted = state.total > state.remaining;
  counterEl.textContent = `${state.remaining} ${state.remaining === 1 ? 'tarefa' : 'tarefas'} por fazer`;
  clearBtn.hidden = !hasCompleted;

  if (state.todos.length === 0) {
    emptyEl.textContent = state.total === 0 ? 'Ainda não tens tarefas 🎉' : 'Nenhuma tarefa encontrada.';
    emptyEl.hidden = false;
  } else {
    emptyEl.hidden = true;
  }

  filterButtons.forEach((btn) => {
    const active = btn.dataset.filter === state.filter;
    btn.classList.toggle('active', active);
    btn.setAttribute('aria-pressed', active);
  });
}

function renderItem(todo) {
  const li = document.createElement('li');
  li.className = 'todo-item' + (todo.completed ? ' completed' : '');
  li.dataset.testid = 'todo-item';
  li.dataset.id = todo.id;

  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  checkbox.checked = todo.completed;
  checkbox.dataset.testid = 'todo-checkbox';
  checkbox.setAttribute('aria-label', `Marcar "${todo.title}" como concluída`);
  checkbox.addEventListener('change', () =>
    run(() => api(`/api/todos/${todo.id}`, { method: 'PATCH', body: { completed: checkbox.checked } }))
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

function startEditing(li, titleEl, todo) {
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
  const finish = (save) => {
    if (done) return;
    done = true;
    const value = input.value.trim();
    if (!save || value === todo.title) return render();
    run(() => api(`/api/todos/${todo.id}`, { method: 'PATCH', body: { title: value } }));
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
    await api('/api/todos', {
      method: 'POST',
      body: { title, priority: priorityInput.value, dueDate: dueInput.value || null },
    });
    form.reset();
    await loadTodos();
  } catch (err) {
    showError(err.message);
  }
  titleInput.focus();
});

filterButtons.forEach((btn) =>
  btn.addEventListener('click', () => {
    state.filter = btn.dataset.filter;
    run(() => Promise.resolve());
  })
);

let searchTimer;
searchInput.addEventListener('input', () => {
  clearTimeout(searchTimer);
  searchTimer = setTimeout(() => {
    state.search = searchInput.value.trim();
    run(() => Promise.resolve());
  }, 250);
});

clearBtn.addEventListener('click', () => run(() => api('/api/todos?completed=true', { method: 'DELETE' })));

document.getElementById('logout').addEventListener('click', async () => {
  await api('/api/auth/logout', { method: 'POST' });
  window.location.href = '/login';
});

// ---------- Arranque ----------
(async () => {
  const me = await api('/api/auth/me').catch(() => null);
  if (!me) return (window.location.href = '/login');
  document.getElementById('user-name').textContent = `Olá, ${me.name}`;
  await loadTodos();
})();
