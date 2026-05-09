'use client'

import { LanguageProvider } from '@/contexts/LanguageContext'
import { SessionProvider } from '@/contexts/SessionContext'
import type { SessionUser } from '@/lib/session'
import { ReactNode } from 'react'

export function Providers({
  children,
  sessionUser,
}: {
  children: ReactNode
  sessionUser: SessionUser | null
}) {
  return (
    <SessionProvider initialUser={sessionUser}>
      <LanguageProvider>{children}</LanguageProvider>
    </SessionProvider>
  )
}
