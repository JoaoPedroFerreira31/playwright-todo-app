// Todo app simples, sem frameworks. Os dados ficam guardados no localStorage.
const STORAGE_KEY = 'todos';

const form = document.getElementById('todo-form');
const input = document.getElementById('new-todo');
const list = document.getElementById('todo-list');
const errorEl = document.getElementById('error');
const emptyEl = document.getElementById('empty');
const counterEl = document.getElementById('counter');
const clearBtn = document.getElementById('clear-completed');
const filterButtons = document.querySelectorAll('[data-filter]');

let todos = load();
let filter = 'all';

function load() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch {
    return [];
  }
}

function save() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
}

function showError(message) {
  errorEl.textContent = message;
  errorEl.hidden = !message;
}

function addTodo(title) {
  const text = title.trim();
  if (!text) {
    showError('A tarefa não pode estar vazia.');
    return;
  }
  if (todos.some((t) => t.title.toLowerCase() === text.toLowerCase())) {
    showError('Essa tarefa já existe.');
    return;
  }
  showError('');
  todos.push({ id: Date.now().toString(), title: text, completed: false });
  save();
  render();
}

function toggleTodo(id) {
  const todo = todos.find((t) => t.id === id);
  if (todo) todo.completed = !todo.completed;
  save();
  render();
}

function deleteTodo(id) {
  todos = todos.filter((t) => t.id !== id);
  save();
  render();
}

function editTodo(id, title) {
  const text = title.trim();
  if (!text) {
    deleteTodo(id);
    return;
  }
  const todo = todos.find((t) => t.id === id);
  if (todo) todo.title = text;
  save();
  render();
}

function startEditing(li, todo) {
  const titleEl = li.querySelector('.title');
  const editInput = document.createElement('input');
  editInput.type = 'text';
  editInput.className = 'edit-input';
  editInput.value = todo.title;
  editInput.setAttribute('data-testid', 'todo-edit-input');
  editInput.setAttribute('aria-label', 'Editar tarefa');
  li.replaceChild(editInput, titleEl);
  editInput.focus();

  let done = false;
  const finish = (commit) => {
    if (done) return;
    done = true;
    commit ? editTodo(todo.id, editInput.value) : render();
  };

  editInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') finish(true);
    if (e.key === 'Escape') finish(false);
  });
  editInput.addEventListener('blur', () => finish(true));
}

function visibleTodos() {
  if (filter === 'active') return todos.filter((t) => !t.completed);
  if (filter === 'completed') return todos.filter((t) => t.completed);
  return todos;
}

function render() {
  list.innerHTML = '';

  for (const todo of visibleTodos()) {
    const li = document.createElement('li');
    li.className = 'todo-item' + (todo.completed ? ' completed' : '');
    li.setAttribute('data-testid', 'todo-item');

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = todo.completed;
    checkbox.setAttribute('data-testid', 'todo-checkbox');
    checkbox.setAttribute('aria-label', `Marcar "${todo.title}" como concluída`);
    checkbox.addEventListener('change', () => toggleTodo(todo.id));

    const title = document.createElement('span');
    title.className = 'title';
    title.textContent = todo.title;
    title.setAttribute('data-testid', 'todo-title');
    title.title = 'Duplo clique para editar';
    title.addEventListener('dblclick', () => startEditing(li, todo));

    const del = document.createElement('button');
    del.type = 'button';
    del.className = 'delete';
    del.textContent = '✕';
    del.setAttribute('data-testid', 'todo-delete');
    del.setAttribute('aria-label', `Apagar "${todo.title}"`);
    del.addEventListener('click', () => deleteTodo(todo.id));

    li.append(checkbox, title, del);
    list.appendChild(li);
  }

  const remaining = todos.filter((t) => !t.completed).length;
  counterEl.textContent = `${remaining} ${remaining === 1 ? 'tarefa' : 'tarefas'} por fazer`;
  emptyEl.hidden = todos.length > 0;
  clearBtn.hidden = !todos.some((t) => t.completed);

  filterButtons.forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.filter === filter);
    btn.setAttribute('aria-pressed', btn.dataset.filter === filter);
  });
}

form.addEventListener('submit', (e) => {
  e.preventDefault();
  addTodo(input.value);
  if (!errorEl.textContent) input.value = '';
  input.focus();
});

filterButtons.forEach((btn) =>
  btn.addEventListener('click', () => {
    filter = btn.dataset.filter;
    render();
  })
);

clearBtn.addEventListener('click', () => {
  todos = todos.filter((t) => !t.completed);
  save();
  render();
});

render();
