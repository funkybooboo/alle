import { defineConfig } from '@playwright/test';

export default defineConfig({
    testDir: './packages/client/e2e',
    timeout: 30000,
    expect: { timeout: 10000 },
    fullyParallel: false,
    retries: 1,
    use: {
        baseURL: 'http://localhost:3000',
        actionTimeout: 5000,
    },
    webServer: [
        {
            command: 'bun run --cwd packages/server dev',
            port: 4000,
            reuseExistingServer: !process.env.CI,
        },
        {
            command: 'bun run --cwd packages/client dev',
            port: 3000,
            reuseExistingServer: !process.env.CI,
        },
    ],
});