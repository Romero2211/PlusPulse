'use server'

import { redirect } from 'next/navigation'
import { z } from 'zod'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { createSession, destroySession } from '@/lib/session'
import { consumeRateLimit, getClientIp } from '@/lib/rateLimit'

export type LoginFormState = {
  errorKey?: 'invalid' | 'email' | 'generic' | 'rate_limit'
}

const loginSchema = z.object({
  email: z.string().trim().min(1).email(),
  password: z.string().min(1),
})

export async function loginAction(
  _prevState: LoginFormState,
  formData: FormData,
): Promise<LoginFormState> {
  const raw = {
    email: formData.get('email'),
    password: formData.get('password'),
  }

  const parsed = loginSchema.safeParse({
    email: typeof raw.email === 'string' ? raw.email : '',
    password: typeof raw.password === 'string' ? raw.password : '',
  })

  if (!parsed.success) {
    const issues = parsed.error.flatten().fieldErrors
    if (issues.email?.length) return { errorKey: 'email' }
    return { errorKey: 'invalid' }
  }

  const email = parsed.data.email.toLowerCase()

  const ip = await getClientIp()
  const allowed = await consumeRateLimit({
    namespace: 'login',
    key: `${ip}:${email}`,
    limit: 10,
    windowSec: 15 * 60,
  })
  if (!allowed) {
    return { errorKey: 'rate_limit' }
  }

  let user
  try {
    user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, email: true, passwordHash: true },
    })
  } catch {
    return { errorKey: 'generic' }
  }

  if (!user) {
    return { errorKey: 'invalid' }
  }

  if (!user.passwordHash) {
    return { errorKey: 'invalid' }
  }

  let passwordOk: boolean
  try {
    passwordOk = await bcrypt.compare(parsed.data.password, user.passwordHash)
  } catch {
    return { errorKey: 'generic' }
  }

  if (!passwordOk) {
    return { errorKey: 'invalid' }
  }

  try {
    await createSession(user.id, user.email)
  } catch {
    return { errorKey: 'generic' }
  }

  redirect('/')
}

export async function logoutAction(): Promise<void> {
  await destroySession()
  redirect('/')
}
