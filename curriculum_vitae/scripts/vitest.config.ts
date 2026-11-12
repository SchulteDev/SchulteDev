import {defineConfig} from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'node',
    include: ['__tests__/*.test.ts'],
    reporters: ['default', 'junit'],
    outputFile: {
      junit: './test-results.xml'
    },
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      reportsDirectory: './coverage',
      // List every source file, including those no test imports
      include: ['*.ts'],
      exclude: ['*.config.ts']
    }
  }
})
