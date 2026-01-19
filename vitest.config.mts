import { defineConfig } from 'vitest/config'

// biome-ignore lint: lint/style/noDefaultExport
export default defineConfig({
  test: {
    globals: true,
    watch: false,
    environment: 'node',
    reporters: ['verbose'],
    coverage: {
      include: ['src/**/*.ts'],
      exclude: [
        'src/index.ts',
        'src/**/*.spec.ts',
        'src/errors/errorReporterTypes.ts',
        'src/errors/either.ts',
        'src/common/may-omit.ts',
        'src/common/commonTypes.ts',
        'src/config/configTypes.ts',
        'src/errors/publicErrors.ts',
        'src/errors/globalErrorHandler.ts',
        'src/config/configTransformers.ts',
        'src/observability/NoopObservabilityManager.ts',
      ],
      reporter: ['text'],
      all: true,
      thresholds: {
        lines: 100,
        functions: 100,
        branches: 90,
        statements: 100,
      },
    },
    typecheck: {
      enabled: true,
      /**
       * By default, vitest runs typecheck on tests matching the pattern "*.test-d.ts".
       * Sadly some IDEs (like Webstorm) doesn't work well with custom patterns like that.
       * They do not properly recognize globals like vitest ones (describe, it, expect, etc.).
       * Because of that, we include typecheck in all test files.
       * The performance impact is minimal, and it makes the IDE work properly.
       * Docs: https://vitest.dev/guide/testing-types.html#testing-types
       */
      include: ['src/**/*.spec.ts'],
    },
  },
})
