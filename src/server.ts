import app from './app';
import { DB_FILE } from './db';
import { DEMO_USER, seedIfEmpty } from './seed';

const PORT = Number(process.env.PORT) || 9000;

seedIfEmpty();

app.listen(PORT, () => {
  console.log(`Todo app em http://localhost:${PORT}`);
  console.log(`Base de dados: ${DB_FILE}`);
  console.log(`Login de exemplo: ${DEMO_USER.email} / ${DEMO_USER.password}`);
  if (process.env.NODE_ENV === 'test') console.log('Modo de teste: POST /api/test/reset ativo');
});
