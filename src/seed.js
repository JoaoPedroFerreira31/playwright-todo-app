// Dados de exemplo. As credenciais abaixo são só para desenvolvimento/testes locais.
const { db } = require('./db');
const { hashPassword } = require('./auth');

const DEMO_USER = {
  name: 'Utilizador Demo',
  email: 'demo@example.com',
  password: 'password123',
};

const DEMO_TODOS = [
  { title: 'Instalar o Playwright', completed: 1, priority: 'high', due_date: null },
  { title: 'Escrever o primeiro teste', completed: 0, priority: 'high', due_date: null },
  { title: 'Ler a documentação dos locators', completed: 0, priority: 'medium', due_date: null },
  { title: 'Experimentar o modo UI', completed: 0, priority: 'low', due_date: null },
];

function resetDatabase() {
  db.exec('DELETE FROM sessions; DELETE FROM todos; DELETE FROM users;');
  db.exec("DELETE FROM sqlite_sequence WHERE name IN ('users', 'todos');");
}

function seed() {
  const { lastInsertRowid: userId } = db
    .prepare('INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)')
    .run(DEMO_USER.name, DEMO_USER.email, hashPassword(DEMO_USER.password));

  const insert = db.prepare(
    'INSERT INTO todos (user_id, title, completed, priority, due_date) VALUES (?, ?, ?, ?, ?)'
  );
  for (const t of DEMO_TODOS) insert.run(userId, t.title, t.completed, t.priority, t.due_date);
}

function seedIfEmpty() {
  const { count } = db.prepare('SELECT COUNT(*) AS count FROM users').get();
  if (count === 0) seed();
}

module.exports = { DEMO_USER, DEMO_TODOS, resetDatabase, seed, seedIfEmpty };

// `npm run db:reset` — apaga tudo e volta a pôr os dados de exemplo.
if (require.main === module) {
  resetDatabase();
  seed();
  console.log(`Base de dados reposta. Login: ${DEMO_USER.email} / ${DEMO_USER.password}`);
}
