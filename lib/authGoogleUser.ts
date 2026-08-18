import { prisma } from '@/lib/prisma'
import type { GoogleUserProfile } from '@/lib/googleOAuth'

export class GoogleAuthError extends Error {
  constructor(public readonly code: 'ACCOUNT_EXISTS_PASSWORD' | 'GOOGLE_ACCOUNT_MISMATCH') {
    super(code)
    this.name = 'GoogleAuthError'
  }
}

export async function findOrCreateUserFromGoogle(profile: GoogleUserProfile) {
  const email = profile.email.trim().toLowerCase()

  const byGoogle = await prisma.user.findUnique({
    where: { googleId: profile.sub },
    select: { id: true, email: true },
  })
  if (byGoogle) return byGoogle

  const byEmail = await prisma.user.findUnique({
    where: { email },
    select: { id: true, email: true, googleId: true, passwordHash: true, name: true, avatarUrl: true },
  })

  if (byEmail) {
    if (byEmail.googleId && byEmail.googleId !== profile.sub) {
      throw new GoogleAuthError('GOOGLE_ACCOUNT_MISMATCH')
    }
    if (byEmail.passwordHash && !byEmail.googleId) {
      throw new GoogleAuthError('ACCOUNT_EXISTS_PASSWORD')
    }

    return prisma.user.update({
      where: { id: byEmail.id },
      data: {
        googleId: byEmail.googleId ?? profile.sub,
        name: byEmail.name ?? (profile.name?.trim() || null),
        avatarUrl: byEmail.avatarUrl ?? (profile.picture?.trim() || null),
      },
      select: { id: true, email: true },
    })
  }

  return prisma.user.create({
    data: {
      email,
      googleId: profile.sub,
      name: profile.name?.trim() || null,
      avatarUrl: profile.picture?.trim() || null,
      passwordHash: null,
    },
    select: { id: true, email: true },
  })
}
