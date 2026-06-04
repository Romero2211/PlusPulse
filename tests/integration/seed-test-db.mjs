import path from 'path'
import { fileURLToPath } from 'url'
import bcrypt from 'bcryptjs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.join(__dirname, '..', '..')

process.chdir(root)

const { PrismaClient } = await import('@prisma/client')
const prisma = new PrismaClient()

const adminEmail = 'admin.integration@example.com'
const adminPassword = 'AdminPass123!'
const userEmail = 'host.integration@example.com'

const now = new Date()
const dayMs = 24 * 60 * 60 * 1000

try {
  await prisma.contactFeedback.deleteMany()
  await prisma.eventMessage.deleteMany()
  await prisma.eventParticipant.deleteMany()
  await prisma.eventPendingApproval.deleteMany()
  await prisma.event.deleteMany()
  await prisma.newsPost.deleteMany()
  await prisma.fundraiser.deleteMany()
  await prisma.user.deleteMany()

  const [adminHash, userHash] = await Promise.all([
    bcrypt.hash(adminPassword, 10),
    bcrypt.hash('VolunteerPass123!', 10),
  ])

  const admin = await prisma.user.create({
    data: {
      email: adminEmail,
      name: 'Інтеграційний адміністратор',
      passwordHash: adminHash,
    },
  })

  const host = await prisma.user.create({
    data: {
      email: userEmail,
      name: 'Інтеграційний волонтер',
      passwordHash: userHash,
    },
  })

  await prisma.event.createMany({
    data: [
      {
        title: 'Голосіївський суботник',
        reason: 'Прибирання парку та сортування допомоги',
        description: 'Інтеграційний тестовий захід у Голосіївському районі.',
        startsAt: new Date(now.getTime() + 5 * dayMs),
        location: 'Голосіївський парк, Київ',
        district: 'holosiivskyi',
        latitude: 50.389,
        longitude: 30.512,
        maxParticipants: 25,
        hostId: host.id,
      },
      {
        title: 'Оболонська зустріч волонтерів',
        reason: 'Координація гуманітарної допомоги',
        description: 'Інтеграційний тестовий захід в Оболонському районі.',
        startsAt: new Date(now.getTime() + 9 * dayMs),
        location: 'Оболонська набережна, Київ',
        district: 'obolonskyi',
        latitude: 50.522,
        longitude: 30.498,
        maxParticipants: 15,
        hostId: admin.id,
      },
      {
        title: 'Архівна толока',
        reason: 'Завершений захід для перевірки архіву',
        description: 'Минулорічна подія для інтеграційних перевірок.',
        startsAt: new Date(now.getTime() - 3 * dayMs),
        archivedAt: new Date(now.getTime() - 2 * dayMs),
        location: 'Поділ, Київ',
        district: 'podilskyi',
        latitude: 50.467,
        longitude: 30.515,
        maxParticipants: 10,
        hostId: host.id,
      },
    ],
  })

  console.log(`Integration test DB seeded. Admin login: ${adminEmail} / ${adminPassword}`)
} finally {
  await prisma.$disconnect()
}
