import { defineConfig, devices, type PlaywrightTestConfig } from '@playwright/test';

export const isCI = !!process.env.CI;

export function defineOrgConfig(overrides: PlaywrightTestConfig = {}) {
  // 1. DEFAULTS: valores que a equipa PODE alterar
  const defaults: PlaywrightTestConfig = {
    fullyParallel: true,
    workers: isCI ? 2 : 4,         
    retries: isCI ? 2 : 0,    
    use: {        
        trace: isCI ? 'on-first-retry' : 'retain-on-failure',
        screenshot: 'only-on-failure'
    },
    projects: [
        {
            name: 'chromium',
            use: {
                ...devices['Desktop Chrome'],
            },
        },
    ],
  };

  return defineConfig({
    ...defaults,
    ...overrides,         
    use: {
      ...defaults.use,
      ...overrides.use,
    },       
    forbidOnly: isCI,    
    reporter: isCI ? [ 
        ['list'],
        ['html', { open: 'never' }],
        ['junit', { outputFile: 'test-results/junit.xml' }]
    ]: 'html',
  });
}