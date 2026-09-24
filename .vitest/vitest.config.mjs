import { defineConfig } from 'vitest/config';
import { sharedConfig } from './vitest.shared.config.mjs';

export default defineConfig({
  ...sharedConfig,
  test: {
    ...sharedConfig.test,
    include: ['test/unit/**/*.spec.ts'],
    passWithNoTests: true,
    coverage: {
      provider: 'v8',
      reportsDirectory: 'coverage',
      include: ['src/**/*.{ts,js}'],
    },
  },
});
