/// <reference types="vitest" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true, // enables test(), describe(), expect() as globals without imports
    environment: 'jsdom', // simulates browser DOM for testing React components
    setupFiles: './src/setupTests.ts', // optional setup file for jest-dom matchers
  },
});
