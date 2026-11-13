import type { Priority } from '../src/types';

export type TodoData = { title: string; priority: Priority; dueDate: string | null };

const TITLES = [
  'Comprar leite',
  'Ligar ao médico',
  'Pagar a renda',
  'Preparar a reunião',
  'Rever o relatório',
  'Marcar férias',
];

let counter = 0;

export function createTodoData(overrides: Partial<TodoData> = {}): TodoData {
      
  const title = generateTitle();
  const priority = 'medium';
  const dueDate = formatDate(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000));

  return { title, priority, dueDate, ...overrides };  
}

function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function generateTitle(): string {
  counter++;
  const text = TITLES[Math.floor(Math.random() * TITLES.length)];
  return `${text} ${counter}`;
}