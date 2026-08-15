import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: '.',
  testIgnore: ['extensions-src/**', '**/node_modules/**'],
});
