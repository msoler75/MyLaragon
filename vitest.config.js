import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['tests/**/*.spec.js'],
    exclude: ['node_modules', 'dist', 'neutralino', 'public', 'www']
  },
  esbuild: {
    target: 'node18'
  }
});
