import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['__tests__/*.test.ts'],
    exclude: ['coverage', 'node_modules', 'tmp'],
    reporters: ['default', 'junit'],
    outputFile: {
      junit: './test-results.xml'
    },
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      reportsDirectory: './coverage',
      exclude: [
        'coverage/**',
        'node_modules/**',
        'tmp/**',
        '**/*.test.ts',
        '**/*.config.ts'
      ]
    }
  }
})
