// `npm run db:reset` — apaga tudo e volta a pôr os dados de exemplo.
import { DEMO_USER, resetDatabase, seed } from '../seed';

resetDatabase();
seed();
console.log(`Base de dados reposta. Login: ${DEMO_USER.email} / ${DEMO_USER.password}`);
