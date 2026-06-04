import { defineConfig } from '@playwright/test'

const PORT = 3101
const BASE_URL = `http://127.0.0.1:${PORT}`

export default defineConfig({
  testDir: __dirname,
  testMatch: /.*\.spec\.ts/,
  fullyParallel: false,
  workers: 1,
  timeout: 30_000,
  expect: {
    timeout: 10_000,
  },
  reporter: 'list',
  use: {
    baseURL: BASE_URL,
    trace: 'on-first-retry',
    video: 'off',
    screenshot: 'only-on-failure',
  },
  outputDir: 'tests/integration/test-results',
  webServer: {
    command:
      'cd ../.. && node tests/integration/reset-test-db.mjs && npx prisma migrate deploy && node tests/integration/seed-test-db.mjs && npx next dev --hostname 127.0.0.1 --port 3101',
    url: BASE_URL,
    timeout: 120_000,
    reuseExistingServer: false,
    stdout: 'pipe',
    stderr: 'pipe',
    env: {
      DATABASE_URL: 'file:./integration-test.db',
      AUTH_SECRET: 'integration-tests-secret-32-characters-minimum',
      ADMIN_EMAILS: 'admin.integration@example.com',
      EVENT_AI_DISABLED: '1',
    },
  },
})
