import type { MetadataRoute } from 'next'
import { getAppOrigin } from '@/lib/appUrl'

export default function robots(): MetadataRoute.Robots {
  const base = getAppOrigin()

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/admin/',
        '/api/',
        '/cabinet',
        '/login',
        '/register',
        '/events/new',
        '/events/*/edit',
        '/fundraisers',
      ],
    },
    sitemap: `${base}/sitemap.xml`,
    host: base.replace(/^https?:\/\//, ''),
  }
}
