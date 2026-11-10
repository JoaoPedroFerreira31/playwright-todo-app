import path from 'node:path';
import express, { type NextFunction, type Request, type Response } from 'express';
import { loadUser } from './auth';
import authRoutes from './routes/auth';
import todoRoutes from './routes/todos';
import testingRoutes from './routes/testing';

const PUBLIC_DIR = path.join(__dirname, '..', 'public');
const isTest = process.env.NODE_ENV === 'test';

const app = express();
app.use(express.json());
app.use(loadUser);

// --- API ---
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});
app.use('/api/auth', authRoutes);
app.use('/api/todos', todoRoutes);
if (isTest) app.use('/api/test', testingRoutes);

app.use('/api', (_req, res) => {
  res.status(404).json({ error: 'Rota não encontrada.' });
});

// --- Páginas (redirecionam conforme haja ou não sessão) ---
app.get('/', (req, res) => {
  if (!req.user) return res.redirect('/login');
  res.sendFile(path.join(PUBLIC_DIR, 'index.html'));
});
app.get('/login', (req, res) => {
  if (req.user) return res.redirect('/');
  res.sendFile(path.join(PUBLIC_DIR, 'login.html'));
});
app.get('/register', (req, res) => {
  if (req.user) return res.redirect('/');
  res.sendFile(path.join(PUBLIC_DIR, 'register.html'));
});

// CSS / JS (o JS é gerado a partir de client/*.ts)
app.use(express.static(PUBLIC_DIR, { index: false }));

// Erros inesperados (ex.: JSON mal formado)
app.use((err: Error & { type?: string }, _req: Request, res: Response, _next: NextFunction) => {
  if (err.type === 'entity.parse.failed') {
    res.status(400).json({ error: 'JSON inválido.' });
    return;
  }
  console.error(err);
  res.status(500).json({ error: 'Erro interno.' });
});

export default app;
