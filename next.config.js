const path = require('path')

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  /** Монорепо / кілька lockfile: обмежуємо трасування залежностей каталогом проєкту */
  outputFileTracingRoot: path.join(__dirname),
  /**
   * Статичний експорт (GitHub Pages): додайте output: 'export' і images.unoptimized: true.
   * experimental.serverActions прибрано — не використовується і конфліктує з output: 'export'.
   */
  images: {
    unoptimized: process.env.NEXT_STATIC_EXPORT === '1',
  },
  async redirects() {
    return [
      { source: '/programs', destination: '/donate', permanent: true },
      { source: '/transparency', destination: '/donate', permanent: true },
    ]
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
        ],
      },
    ]
  },
}

module.exports = nextConfig
