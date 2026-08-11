import { SignJWT, jwtVerify } from 'jose'

export const OAUTH_STATE_COOKIE = 'pluspulse_oauth_state'

function stateSecret(): Uint8Array {
  const secret = process.env.AUTH_SECRET?.trim()
  if (!secret || secret.length < 32) {
    throw new Error('AUTH_SECRET must be set for OAuth state signing')
  }
  return new TextEncoder().encode(secret)
}

/** Підписаний state для захисту від CSRF. */
export async function createOAuthState(): Promise<string> {
  const nonce = crypto.randomUUID()
  return new SignJWT({ n: nonce })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('10m')
    .sign(stateSecret())
}

export async function verifyOAuthState(token: string): Promise<boolean> {
  try {
    await jwtVerify(token, stateSecret())
    return true
  } catch {
    return false
  }
}
