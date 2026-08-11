'use server'

import { redirect } from 'next/navigation'
import { z } from 'zod'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { createSession, destroySession } from '@/lib/session'

export type LoginFormState = {
  errorKey?: 'invalid' | 'email' | 'oauth' | 'generic'
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
    return { errorKey: 'oauth' }
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
