import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    testTimeout: 10000,
    typecheck: {
      enabled: true,
    },
  },
  esbuild: {
    target: 'es2022',
  },
})