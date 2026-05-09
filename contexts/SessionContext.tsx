'use client'

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import type { SessionUser } from '@/lib/session'

export type { SessionUser }

type SessionContextValue = {
  user: SessionUser | null
}

const SessionContext = createContext<SessionContextValue>({ user: null })

export function SessionProvider({
  children,
  initialUser,
}: {
  children: ReactNode
  initialUser: SessionUser | null
}) {
  const [user, setUser] = useState<SessionUser | null>(initialUser)

  useEffect(() => {
    setUser(initialUser)
  }, [initialUser])

  return <SessionContext.Provider value={{ user }}>{children}</SessionContext.Provider>
}

export function useSession(): SessionContextValue {
  return useContext(SessionContext)
}
