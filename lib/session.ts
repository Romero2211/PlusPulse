import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'

const COOKIE_NAME = 'pluspulse_session'
const COOKIE_MAX_AGE = 60 * 60 * 24 * 7 // 7 days

function getSecretKey(): Uint8Array {
  const fromEnv = process.env.AUTH_SECRET?.trim()
  const secret =
    fromEnv && fromEnv.length >= 32
      ? fromEnv
      : process.env.NODE_ENV !== 'production'
        ? 'dev-only-pluspulse-auth-secret-32+chars'
        : ''
  if (!secret || secret.length < 32) {
    throw new Error('AUTH_SECRET must be set and at least 32 characters (use openssl rand -base64 32)')
  }
  return new TextEncoder().encode(secret)
}

export type SessionUser = {
  id: string
  email: string
}

export async function createSession(userId: string, email: string): Promise<void> {
  const token = await new SignJWT({ email })
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(userId)
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(getSecretKey())

  const jar = await cookies()
  jar.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: COOKIE_MAX_AGE,
  })
}

export async function getSession(): Promise<SessionUser | null> {
  try {
    const jar = await cookies()
    const token = jar.get(COOKIE_NAME)?.value
    if (!token) return null

    const { payload } = await jwtVerify(token, getSecretKey())
    const id = typeof payload.sub === 'string' ? payload.sub : null
    const email = typeof payload.email === 'string' ? payload.email : null
    if (!id || !email) return null
    return { id, email }
  } catch {
    return null
  }
}

export async function destroySession(): Promise<void> {
  const jar = await cookies()
  jar.delete(COOKIE_NAME)
}
