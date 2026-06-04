import { rm } from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.join(__dirname, '..', '..')

for (const file of ['integration-test.db', 'integration-test.db-journal']) {
  const abs = path.join(root, 'prisma', file)
  await rm(abs, { force: true })
}

console.log('Integration test DB reset.')
