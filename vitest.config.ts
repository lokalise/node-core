import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    watch: false,
    environment: 'node',
    reporters: ['verbose'],
    coverage: {
      include: ['src/**/*.ts'],
      exclude: [
        'src/**/*.spec.ts',
        'src/errors/errorReporterTypes.ts',
        'src/errors/either.ts',
        'src/common/may-omit.ts',
        'src/config/configTypes.ts',
        'src/errors/globalErrorHandler.ts',
        'src/config/configTransformers.ts'
      ],
      reporter: ['text'],
      all: true,
      lines: 100,
      functions: 100,
      branches: 100,
      statements: 100,
    },
  },
})
