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

