import { resolve } from 'node:path';
import { transform } from 'oxc-transform';
import { defineConfig } from 'vitest/config';

const tsFilePattern = /\.[cm]?tsx?$/;

function oxcNestPlugin() {
  return {
    name: 'oxc-nest-transform',
    enforce: 'pre',
    /**
     * @param {string} code
     * @param {string} id
     */
    async transform(code, id) {
      if (!tsFilePattern.test(id) || id.includes('node_modules')) {
        return null;
      }

      const result = await transform(id, code, {
        lang: id.endsWith('x') ? 'tsx' : 'ts',
        sourceType: 'module',
        sourcemap: true,
        target: 'es2023',
        typescript: {
          onlyRemoveTypeImports: false,
        },
        decorator: {
          legacy: true,
          emitDecoratorMetadata: true,
          strictNullChecks: true,
        },
      });

      if (result.errors.length > 0) {
        throw new Error(result.errors.map((error) => error.message).join('\n'));
      }

      return {
        code: result.code,
        map: result.map,
      };
    },
  };
}

export default defineConfig({
  plugins: [oxcNestPlugin()],
  resolve: {
    alias: {
      '@core': resolve(import.meta.dirname, 'src/core'),
      '@infrastructure': resolve(import.meta.dirname, 'src/infrastructure'),
      '@presentation': resolve(import.meta.dirname, 'src/presentation'),
    },
  },
  test: {
    environment: 'node',
    globals: true,
    include: ['src/**/*.spec.ts'],
    passWithNoTests: true,
    coverage: {
      provider: 'v8',
      reportsDirectory: 'coverage',
      include: ['src/**/*.{ts,js}'],
    },
  },
});
