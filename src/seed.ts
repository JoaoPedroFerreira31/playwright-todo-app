// Dados de exemplo. As credenciais abaixo são só para desenvolvimento/testes locais.
import { db, execute, queryOne } from './db';
import { hashPassword } from './auth';
import type { Priority } from './types';

export const DEMO_USER = {
  name: 'Utilizador Demo',
  email: 'demo@example.com',
  password: 'password123',
};

export const DEMO_TODOS: { title: string; completed: 0 | 1; priority: Priority; due_date: string | null }[] = [
  { title: 'Instalar o Playwright', completed: 1, priority: 'high', due_date: null },
  { title: 'Escrever o primeiro teste', completed: 0, priority: 'high', due_date: null },
  { title: 'Ler a documentação dos locators', completed: 0, priority: 'medium', due_date: null },
  { title: 'Experimentar o modo UI', completed: 0, priority: 'low', due_date: null },
];

export function resetDatabase(): void {
  db.exec('DELETE FROM sessions; DELETE FROM todos; DELETE FROM users;');
  db.exec("DELETE FROM sqlite_sequence WHERE name IN ('users', 'todos');");
}

export function seed(): void {
  const { lastInsertRowid: userId } = execute(
    'INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)',
    DEMO_USER.name,
    DEMO_USER.email,
    hashPassword(DEMO_USER.password)
  );

  for (const t of DEMO_TODOS) {
    execute(
      'INSERT INTO todos (user_id, title, completed, priority, due_date) VALUES (?, ?, ?, ?, ?)',
      userId,
      t.title,
      t.completed,
      t.priority,
      t.due_date
    );
  }
}

export function seedIfEmpty(): void {
  const row = queryOne<{ count: number }>('SELECT COUNT(*) AS count FROM users');
  if (!row || row.count === 0) seed();
}
