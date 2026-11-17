import { defineOrgConfig, isCI } from '@org/pw-config';
import { devices } from '@playwright/test';

// Os testes usam um servidor e uma base de dados próprios (porta 9100, data/test.db),
// para não mexerem nos dados com que trabalhas em `npm run dev` (porta 9000).
const TEST_PORT = 9100;

// Com BASE_URL definido (ex.: o container de testes em http://localhost:8081),
// o Playwright testa esse servidor e não arranca o local.
const EXTERNAL_URL = process.env.BASE_URL;


export default defineOrgConfig({
  testDir: './tests',    
  use: {
    baseURL: EXTERNAL_URL || `http://localhost:${TEST_PORT}`,    
  },  
  webServer: EXTERNAL_URL
    ? undefined
    : {
      // Compila o frontend e arranca o servidor TypeScript diretamente com o tsx
      command: 'npm run build:client && tsx src/server.ts',
      url: `http://localhost:${TEST_PORT}/api/health`,
      reuseExistingServer: !isCI,
      env: {
        NODE_ENV: 'test', // ativa POST /api/test/reset
        PORT: String(TEST_PORT),
        DB_FILE: 'data/test.db',
        NODE_OPTIONS: '--disable-warning=ExperimentalWarning',
      },
    },
});
