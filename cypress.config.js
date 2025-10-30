import { defineConfig } from 'cypress';

const resolveEnv = (key, ...fallbacks) => {
  for (const candidate of [process.env[`CYPRESS_${key}`], process.env[key], ...fallbacks]) {
    if (typeof candidate === 'string' && candidate.length > 0) {
      return candidate;
    }
  }
  return undefined;
};

export default defineConfig({
  defaultCommandTimeout: 10_000,
  env: {
    TEST_USER_EMAIL: resolveEnv('TEST_USER_EMAIL', 'user@example.com'),
    TEST_USER_PASSWORD: resolveEnv('TEST_USER_PASSWORD', 'SenhaSegura1!')
  },
  e2e: {
    baseUrl: 'http://127.0.0.1:4173',
    specPattern: 'tests/e2e/**/*.cy.{js,jsx,ts,tsx}',
    supportFile: 'tests/e2e/support/e2e.js',
    video: false
  }
});
