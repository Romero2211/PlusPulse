import { getAppOrigin } from '@/lib/appUrl'

const GOOGLE_AUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth'
const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token'
const GOOGLE_USERINFO_URL = 'https://www.googleapis.com/oauth2/v3/userinfo'

export type GoogleUserProfile = {
  sub: string
  email: string
  email_verified?: boolean
  name?: string
  picture?: string
}

export function isGoogleOAuthConfigured(): boolean {
  return Boolean(process.env.GOOGLE_CLIENT_ID?.trim() && process.env.GOOGLE_CLIENT_SECRET?.trim())
}

function clientId(): string {
  const id = process.env.GOOGLE_CLIENT_ID?.trim()
  if (!id) throw new Error('GOOGLE_CLIENT_ID is not set')
  return id
}

function clientSecret(): string {
  const secret = process.env.GOOGLE_CLIENT_SECRET?.trim()
  if (!secret) throw new Error('GOOGLE_CLIENT_SECRET is not set')
  return secret
}

export function getGoogleRedirectUri(): string {
  return `${getAppOrigin()}/api/auth/google/callback`
}

export function buildGoogleAuthUrl(state: string): string {
  const params = new URLSearchParams({
    client_id: clientId(),
    redirect_uri: getGoogleRedirectUri(),
    response_type: 'code',
    scope: 'openid email profile',
    access_type: 'online',
    include_granted_scopes: 'true',
    prompt: 'select_account',
    state,
  })
  return `${GOOGLE_AUTH_URL}?${params.toString()}`
}

export async function exchangeGoogleCode(code: string): Promise<string> {
  const res = await fetch(GOOGLE_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: clientId(),
      client_secret: clientSecret(),
      redirect_uri: getGoogleRedirectUri(),
      grant_type: 'authorization_code',
    }),
  })

  if (!res.ok) {
    throw new Error('token_exchange_failed')
  }

  const data = (await res.json()) as { access_token?: string }
  if (!data.access_token) throw new Error('missing_access_token')
  return data.access_token
}

export async function fetchGoogleUserProfile(accessToken: string): Promise<GoogleUserProfile> {
  const res = await fetch(GOOGLE_USERINFO_URL, {
    headers: { Authorization: `Bearer ${accessToken}` },
  })
  if (!res.ok) throw new Error('userinfo_failed')

  const data = (await res.json()) as GoogleUserProfile
  if (!data.sub || !data.email) throw new Error('invalid_profile')
  if (data.email_verified === false) throw new Error('email_not_verified')
  return data
}
