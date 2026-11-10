export type Priority = 'low' | 'medium' | 'high';

export interface User {
  id: number;
  name: string;
  email: string;
}

/** Linha da tabela `todos`, tal como vem do SQLite. */
export interface TodoRow {
  id: number;
  user_id: number;
  title: string;
  completed: number; // 0 | 1
  priority: Priority;
  due_date: string | null;
  created_at: string;
  updated_at: string;
}

/** Tarefa no formato devolvido pela API. */
export interface Todo {
  id: number;
  title: string;
  completed: boolean;
  priority: Priority;
  dueDate: string | null;
  createdAt: string;
  updatedAt: string;
}

/** Resposta de GET /api/todos. */
export interface TodoList {
  todos: Todo[];
  remaining: number;
  total: number;
}

// Acrescenta `req.user` ao tipo Request do Express (preenchido pelo middleware loadUser).
declare global {
  namespace Express {
    interface Request {
      user: User | null;
    }
  }
}
