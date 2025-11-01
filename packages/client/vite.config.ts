/// <reference types="vitest/config" />
/// <reference types="vitest" />

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// More info at: https://storybook.js.org/docs/next/writing-tests/integrations/vitest-addon
export default defineConfig({
  plugins: [react(), tailwindcss()],
  test: {
    globals: true,
    // enables test(), describe(), expect() as globals without imports
    environment: 'jsdom',
    // simulates browser DOM for testing React components
    setupFiles: './src/setupTests.ts', // optional setup file for jest-dom matchers
    exclude: ['**/*.stories.tsx', '**/*.stories.ts', '**/node_modules/**'],
  },
});
