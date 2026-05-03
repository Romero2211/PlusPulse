import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import { Suspense } from 'react'
import './globals.css'
import { Providers } from '@/components/Providers'

const inter = Inter({ subsets: ['latin', 'cyrillic'] })

export const metadata: Metadata = {
  title: 'БО БФ «ПЛЮС ПУЛЬС» | Благодійний фонд',
  description: 'Благодійна організація «Благодійний фонд «ПЛЮС ПУЛЬС» - недержавна, неприбуткова благодійна організація, що діє відповідно до законодавства України.',
  keywords: 'благодійність, фонд, Україна, допомога, благодійна організація',
  robots: 'index, follow',
  icons: {
    icon: [{ url: '/icon.png', type: 'image/png' }],
    apple: [{ url: '/icon.png', type: 'image/png' }],
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="uk" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        <Providers>
          <Suspense fallback={<div style={{ padding: '2rem', textAlign: 'center' }}>Завантаження...</div>}>
            {children}
          </Suspense>
        </Providers>
      </body>
    </html>
  )
}
