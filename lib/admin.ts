import { redirect } from 'next/navigation'
import { getSession } from '@/lib/session'

export function isAdminEmail(email: string): boolean {
  const raw = process.env.ADMIN_EMAILS?.trim()
  if (!raw) return false
  const allow = raw
    .split(',')
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean)
  return allow.includes(email.trim().toLowerCase())
}

/** Для server actions — без redirect (не ловити NEXT_REDIRECT у try/catch). */
export async function getAdminSession(): Promise<{ id: string; email: string } | null> {
  const session = await getSession()
  if (!session) return null
  if (!isAdminEmail(session.email)) return null
  return session
}

export async function requireAdmin(): Promise<{ id: string; email: string }> {
  const session = await getSession()
  if (!session) {
    redirect('/login')
  }
  if (!isAdminEmail(session.email)) {
    redirect('/')
  }
  return session
}

