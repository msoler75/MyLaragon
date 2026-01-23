import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['tests/**/*.spec.js'],
    exclude: ['tests/ui/**'],
    globals: true,
    testTimeout: 30000,
  },
});