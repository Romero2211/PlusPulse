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
    const securityHeaders = [
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
      {
        key: 'Permissions-Policy',
        value: 'camera=(), microphone=(), geolocation=()',
      },
      {
        key: 'Content-Security-Policy',
        value: [
          "default-src 'self'",
          "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
          "style-src 'self' 'unsafe-inline'",
          "img-src 'self' data: blob: https:",
          "font-src 'self' data:",
          "connect-src 'self' https://accounts.google.com https://oauth2.googleapis.com https://www.googleapis.com https://*.tile.openstreetmap.org https://nominatim.openstreetmap.org",
          "frame-src https://accounts.google.com",
          "base-uri 'self'",
          "form-action 'self'",
          "frame-ancestors 'none'",
        ].join('; '),
      },
    ]

    if (process.env.NODE_ENV === 'production') {
      securityHeaders.push({
        key: 'Strict-Transport-Security',
        value: 'max-age=63072000; includeSubDomains; preload',
      })
    }

    return [
      {
        source: '/:path*',
        headers: securityHeaders,
      },
    ]
  },
}

module.exports = nextConfig
