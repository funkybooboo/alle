import { defineConfig } from 'cypress';

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:5173',
    specPattern: 'cypress/e2e/**/*.cy.{ts,tsx}',
    supportFile: 'cypress/support/e2e.ts',
    video: false,
    screenshotOnRunFailure: true,
    // Increase command timeout for slow operations
    defaultCommandTimeout: 10000,
    // Retry failed tests once
    retries: {
      runMode: 1,
      openMode: 0,
    },
  },
});
