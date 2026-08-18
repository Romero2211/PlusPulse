import { headers } from 'next/headers'
import { prisma } from '@/lib/prisma'

export async function getClientIp(): Promise<string> {
  const h = await headers()
  const forwarded = h.get('x-forwarded-for')
  if (forwarded) {
    const first = forwarded.split(',')[0]?.trim()
    if (first) return first
  }
  return h.get('x-real-ip')?.trim() || 'unknown'
}

/**
 * Sliding-window rate limit (PostgreSQL). Повертає true, якщо запит дозволено.
 * При збої БД — пропускаємо (fail-open), щоб не блокувати легітимних користувачів.
 */
export async function consumeRateLimit(opts: {
  namespace: string
  key: string
  limit: number
  windowSec: number
}): Promise<boolean> {
  const bucketKey = `${opts.namespace}:${opts.key}`.slice(0, 200)
  const now = new Date()
  const expiresAt = new Date(now.getTime() + opts.windowSec * 1000)

  try {
    const row = await prisma.rateLimitEntry.findUnique({ where: { key: bucketKey } })

    if (!row || row.expiresAt <= now) {
      await prisma.rateLimitEntry.upsert({
        where: { key: bucketKey },
        create: { key: bucketKey, count: 1, expiresAt },
        update: { count: 1, expiresAt },
      })
      return true
    }

    if (row.count >= opts.limit) {
      return false
    }

    await prisma.rateLimitEntry.update({
      where: { key: bucketKey },
      data: { count: { increment: 1 } },
    })
    return true
  } catch {
    return true
  }
}

export async function rateLimitByIp(namespace: string, limit: number, windowSec: number): Promise<boolean> {
  const ip = await getClientIp()
  return consumeRateLimit({ namespace, key: ip, limit, windowSec })
}
