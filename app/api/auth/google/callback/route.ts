import { cookies } from 'next/headers'
import { NextRequest } from 'next/server'
import { redirect } from 'next/navigation'
import { findOrCreateUserFromGoogle, GoogleAuthError } from '@/lib/authGoogleUser'
import { exchangeGoogleCode, fetchGoogleUserProfile, isGoogleOAuthConfigured } from '@/lib/googleOAuth'
import { OAUTH_STATE_COOKIE, verifyOAuthState } from '@/lib/oauthState'
import { createSession } from '@/lib/session'

export async function GET(request: NextRequest) {
  if (!isGoogleOAuthConfigured()) {
    redirect('/login?oauth=not_configured')
  }

  const params = request.nextUrl.searchParams
  const error = params.get('error')
  if (error) {
    redirect('/login?oauth=denied')
  }

  const code = params.get('code')
  const state = params.get('state')
  if (!code || !state) {
    redirect('/login?oauth=invalid')
  }

  const jar = await cookies()
  const savedState = jar.get(OAUTH_STATE_COOKIE)?.value
  jar.delete(OAUTH_STATE_COOKIE)

  if (!savedState || savedState !== state || !(await verifyOAuthState(state))) {
    redirect('/login?oauth=state')
  }

  try {
    const accessToken = await exchangeGoogleCode(code)
    const profile = await fetchGoogleUserProfile(accessToken)
    const user = await findOrCreateUserFromGoogle(profile)
    await createSession(user.id, user.email)
  } catch (e) {
    if (e instanceof GoogleAuthError) {
      if (e.code === 'ACCOUNT_EXISTS_PASSWORD') {
        redirect('/login?oauth=account_exists')
      }
      redirect('/login?oauth=account_mismatch')
    }
    redirect('/login?oauth=failed')
  }

  redirect('/')
}
