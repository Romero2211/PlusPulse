import { execSync } from 'child_process'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.join(__dirname, '..', '..')

const databaseUrl =
  process.env.TEST_DATABASE_URL ||
  'postgresql://pluspulse:pluspulse@127.0.0.1:5433/pluspulse?schema=public'

execSync('npx prisma migrate reset --force', {
  cwd: root,
  stdio: 'inherit',
  env: {
    ...process.env,
    DATABASE_URL: databaseUrl,
    DIRECT_DATABASE_URL: databaseUrl,
  },
})

console.log('Integration test DB reset (PostgreSQL).')
