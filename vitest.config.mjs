import { resolve } from 'node:path';
import { transform } from '@swc/core';
import { defineConfig } from 'vitest/config';

const tsFilePattern = /\.[cm]?tsx?$/;

function swcNestPlugin() {
  return {
    name: 'swc-nest-transform',
    enforce: 'pre',
    /**
     * @param {string} code
     * @param {string} id
     */
    async transform(code, id) {
      if (!tsFilePattern.test(id) || id.includes('node_modules')) {
        return null;
      }

      const result = await transform(code, {
        filename: id,
        sourceMaps: true,
        module: {
          type: 'es6',
        },
        jsc: {
          target: 'es2023',
          keepClassNames: true,
          parser: {
            syntax: 'typescript',
            decorators: true,
          },
          transform: {
            legacyDecorator: true,
            decoratorMetadata: true,
          },
        },
      });

      return {
        code: result.code,
        map: result.map,
      };
    },
  };
}

export default defineConfig({
  plugins: [swcNestPlugin()],
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
