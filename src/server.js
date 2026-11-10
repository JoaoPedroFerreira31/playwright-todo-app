const app = require('./app');
const { DB_FILE } = require('./db');
const { seedIfEmpty, DEMO_USER } = require('./seed');

const PORT = Number(process.env.PORT) || 3000;

seedIfEmpty();

app.listen(PORT, () => {
  console.log(`Todo app em http://localhost:${PORT}`);
  console.log(`Base de dados: ${DB_FILE}`);
  console.log(`Login de exemplo: ${DEMO_USER.email} / ${DEMO_USER.password}`);
  if (process.env.NODE_ENV === 'test') console.log('Modo de teste: POST /api/test/reset ativo');
});
