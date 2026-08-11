import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { buildGoogleAuthUrl, isGoogleOAuthConfigured } from '@/lib/googleOAuth'
import { createOAuthState, OAUTH_STATE_COOKIE } from '@/lib/oauthState'

export async function GET() {
  if (!isGoogleOAuthConfigured()) {
    redirect('/login?oauth=not_configured')
  }

  const state = await createOAuthState()
  const jar = await cookies()
  jar.set(OAUTH_STATE_COOKIE, state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 600,
  })

  redirect(buildGoogleAuthUrl(state))
}
