import { defineOrgConfig, isCI } from '@org/pw-config';
import { defineBddConfig } from 'playwright-bdd';
import { devices } from '@playwright/test';

// Os testes usam um servidor e uma base de dados próprios (porta 9100, data/test.db),
// para não mexerem nos dados com que trabalhas em `npm run dev` (porta 9000).
const TEST_PORT = 9100;

// Com BASE_URL definido (ex.: o container de testes em http://localhost:8081),
// o Playwright testa esse servidor e não arranca o local.
const EXTERNAL_URL = process.env.BASE_URL;


// O defineBddConfig devolve o CAMINHO da pasta onde o `bddgen` gera os testes
// a partir dos .feature (por defeito, .features-gen/).
const bddTestDir = defineBddConfig({
  features: 'features/**/*.feature',
  steps: 'features/steps/**/*.ts',
});

export default defineOrgConfig({
  // Os projects aqui SUBSTITUEM os da plataforma (o spread do defineOrgConfig é superficial),
  // por isso cada projeto repõe o browser.
  projects: [
    { name: 'e2e', testDir: './tests', use: { ...devices['Desktop Chrome'] } },
    { name: 'bdd', testDir: bddTestDir, use: { ...devices['Desktop Chrome'] } },
  ],
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
