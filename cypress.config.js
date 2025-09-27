import { defineConfig } from 'cypress';

export default defineConfig({
  video: false,
  screenshotOnRunFailure: true,
  e2e: {
    baseUrl: 'http://127.0.0.1:4173',
    specPattern: 'tests/e2e/**/*.cy.js',
    supportFile: 'tests/e2e/support/e2e.js',
    fixturesFolder: false
  }
});
