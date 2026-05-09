'use server'

import { redirect } from 'next/navigation'
import { z } from 'zod'
import bcrypt from 'bcryptjs'
import { Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { createSession } from '@/lib/session'

export type RegisterFormState = {
  errorKey?: 'duplicate' | 'generic' | 'validation' | 'mismatch' | 'short' | 'email'
}

const schema = z
  .object({
    email: z.string().trim().min(1).email(),
    name: z.string().trim().max(120).optional(),
    password: z.string().min(8),
    confirmPassword: z.string().min(1),
  })
  .refine((d) => d.password === d.confirmPassword, { path: ['confirmPassword'] })

export async function registerAction(
  _prevState: RegisterFormState,
  formData: FormData,
): Promise<RegisterFormState> {
  const raw = {
    email: formData.get('email'),
    name: formData.get('name'),
    password: formData.get('password'),
    confirmPassword: formData.get('confirmPassword'),
  }

  const parsed = schema.safeParse({
    email: typeof raw.email === 'string' ? raw.email : '',
    name: typeof raw.name === 'string' && raw.name.trim() !== '' ? raw.name : undefined,
    password: typeof raw.password === 'string' ? raw.password : '',
    confirmPassword: typeof raw.confirmPassword === 'string' ? raw.confirmPassword : '',
  })

  if (!parsed.success) {
    const issues = parsed.error.flatten().fieldErrors
    if (issues.email?.length) return { errorKey: 'email' }
    if (issues.password?.length) return { errorKey: 'short' }
    if (issues.confirmPassword?.length) return { errorKey: 'mismatch' }
    return { errorKey: 'validation' }
  }

  const { email, name, password } = parsed.data
  const passwordHash = await bcrypt.hash(password, 10)

  try {
    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        name: name?.trim() || null,
        passwordHash,
      },
      select: { id: true, email: true },
    })
    await createSession(user.id, user.email)
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
      return { errorKey: 'duplicate' }
    }
    return { errorKey: 'generic' }
  }

  redirect('/')
}
