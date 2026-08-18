import type { MetadataRoute } from 'next'
import { getAppOrigin } from '@/lib/appUrl'
import { SHOW_EVENTS_NAV } from '@/lib/featureFlags'
import { prisma } from '@/lib/prisma'

const STATIC_ROUTES: Array<{
  path: string
  changeFrequency: MetadataRoute.Sitemap[number]['changeFrequency']
  priority: number
}> = [
  { path: '/', changeFrequency: 'weekly', priority: 1 },
  { path: '/about', changeFrequency: 'monthly', priority: 0.8 },
  { path: '/news', changeFrequency: 'weekly', priority: 0.9 },
  { path: '/donate', changeFrequency: 'weekly', priority: 0.9 },
  { path: '/contacts', changeFrequency: 'monthly', priority: 0.7 },
]

function absoluteUrl(base: string, path: string): string {
  return path === '/' ? base : `${base}${path}`
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = getAppOrigin()
  const generatedAt = new Date()

  const staticEntries: MetadataRoute.Sitemap = STATIC_ROUTES.map(({ path, changeFrequency, priority }) => ({
    url: absoluteUrl(base, path),
    lastModified: generatedAt,
    changeFrequency,
    priority,
  }))

  try {
    const [newsPosts, fundraisers, events] = await Promise.all([
      prisma.newsPost.findMany({
        where: { publishedAt: { not: null } },
        select: { slug: true, updatedAt: true },
        orderBy: { publishedAt: 'desc' },
      }),
      prisma.fundraiser.findMany({
        where: { publishedAt: { not: null }, archivedAt: null },
        select: { id: true, updatedAt: true },
        orderBy: { publishedAt: 'desc' },
      }),
      SHOW_EVENTS_NAV
        ? prisma.event.findMany({
            where: { archivedAt: null },
            select: { id: true, updatedAt: true, startsAt: true },
            orderBy: { startsAt: 'asc' },
          })
        : Promise.resolve([]),
    ])

    const newsEntries: MetadataRoute.Sitemap = newsPosts.map((post) => ({
      url: `${base}/news/${post.slug}`,
      lastModified: post.updatedAt,
      changeFrequency: 'monthly',
      priority: 0.7,
    }))

    const fundraiserEntries: MetadataRoute.Sitemap = fundraisers.map((f) => ({
      url: `${base}/donate/${f.id}`,
      lastModified: f.updatedAt,
      changeFrequency: 'weekly',
      priority: 0.8,
    }))

    const eventEntries: MetadataRoute.Sitemap = SHOW_EVENTS_NAV
      ? [
          {
            url: `${base}/events`,
            lastModified: generatedAt,
            changeFrequency: 'daily',
            priority: 0.8,
          },
          ...events.map((event) => ({
            url: `${base}/events/${event.id}`,
            lastModified: event.updatedAt,
            changeFrequency: 'weekly' as const,
            priority: 0.6,
          })),
        ]
      : []

    return [...staticEntries, ...newsEntries, ...fundraiserEntries, ...eventEntries]
  } catch {
    return staticEntries
  }
}

/** Оновлювати карту сайту раз на годину (новини та збори). */
export const revalidate = 3600
