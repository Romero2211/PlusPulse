import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { jwtVerify } from 'jose'
import { isAdminEmail } from '@/lib/admin'

const COOKIE_NAME = 'pluspulse_session'

function getSecretKey(): Uint8Array {
  const fromEnv = process.env.AUTH_SECRET?.trim()
  const secret =
    fromEnv && fromEnv.length >= 32
      ? fromEnv
      : process.env.NODE_ENV !== 'production'
        ? 'dev-only-pluspulse-auth-secret-32+chars'
        : ''
  if (!secret || secret.length < 32) {
    throw new Error('AUTH_SECRET must be set and at least 32 characters')
  }
  return new TextEncoder().encode(secret)
}

export async function middleware(request: NextRequest) {
  const token = request.cookies.get(COOKIE_NAME)?.value
  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  try {
    const { payload } = await jwtVerify(token, getSecretKey())
    const email = typeof payload.email === 'string' ? payload.email : ''
    if (!email || !isAdminEmail(email)) {
      return NextResponse.redirect(new URL('/', request.url))
    }
  } catch {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: '/admin/:path*',
}
