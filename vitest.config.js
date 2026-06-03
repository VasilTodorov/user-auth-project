const { defineConfig } = require('vitest/config');

module.exports = defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['backend/tests/**/*.test.ts'],
    coverage: {
      enabled: true,                
      provider: 'v8',
      include: ['backend/src/**/*.ts'],
      exclude: [
        'backend/src/**/*.d.ts',
        'backend/src/config/**',
        'backend/src/repositories/**',
        'backend/src/server.ts',
        'backend/src/router.ts',
        'backend/src/utils/authUtils.ts',
        'backend/src/utils/staticServer.ts'
      ],
      thresholds: {
        functions: 80
      }
    }
  }
});