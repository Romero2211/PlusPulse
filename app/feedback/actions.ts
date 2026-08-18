'use server'

import { z } from 'zod'
import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { rateLimitByIp } from '@/lib/rateLimit'

export type ContactFeedbackFormState =
  | { success: true }
  | { success?: false; error?: 'validation' | 'generic' | 'rate_limit' }

const nameSchema = z.string().trim().max(120)
const messageSchema = z.string().trim().min(10, 'min').max(4000, 'max')

function parseOptionalEmail(raw: unknown): { ok: true; value: string | undefined } | { ok: false } {
  const s = typeof raw === 'string' ? raw.trim() : ''
  if (s.length === 0) return { ok: true, value: undefined }
  if (s.length > 254) return { ok: false }
  const emailCheck = z.string().email().safeParse(s)
  if (!emailCheck.success) return { ok: false }
  return { ok: true, value: s }
}

export async function submitContactFeedbackAction(
  _prev: ContactFeedbackFormState,
  formData: FormData
): Promise<ContactFeedbackFormState> {
  const nameRaw = formData.get('name')
  const emailRaw = formData.get('email')
  const messageRaw = formData.get('message')

  const nameParsed = nameSchema.safeParse(typeof nameRaw === 'string' ? nameRaw : '')
  if (!nameParsed.success) return { error: 'validation' }
  const nameValue = nameParsed.data.length > 0 ? nameParsed.data : null

  const emailParsed = parseOptionalEmail(emailRaw)
  if (!emailParsed.ok) return { error: 'validation' }

  const messageParsed = messageSchema.safeParse(typeof messageRaw === 'string' ? messageRaw : '')
  if (!messageParsed.success) return { error: 'validation' }

  const allowed = await rateLimitByIp('contact_feedback', 5, 60 * 60)
  if (!allowed) return { error: 'rate_limit' }

  try {
    await prisma.contactFeedback.create({
      data: {
        name: nameValue,
        email: emailParsed.value ?? null,
        message: messageParsed.data,
      },
    })
    revalidatePath('/contacts')
    revalidatePath('/admin/feedback')
    return { success: true }
  } catch {
    return { error: 'generic' }
  }
}
