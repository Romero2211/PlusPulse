'use server'

import { z } from 'zod'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/admin'
import { saveUploadedImage } from '@/lib/uploads'

export type AdminFundraiserFormState =
  | { success: true; id: string }
  | { success?: false; error?: 'unauth' | 'validation' | 'upload' | 'generic' }

const schema = z.object({
  title: z.string().trim().min(3).max(200),
  tag: z.string().trim().max(60).optional(),
  description: z.string().trim().min(1).max(10_000),
  goalAmount: z.string().trim(),
  raisedAmount: z.string().trim().optional(),
  removeCover: z.enum(['0', '1']).optional(),
})

function isCheckboxChecked(formData: FormData, name: string): boolean {
  return formData.getAll(name).includes('1')
}

function parseIntAmount(raw: string): number | null {
  const cleaned = raw.replace(/[^\d]/g, '')
  if (!cleaned) return null
  const n = Number(cleaned)
  if (!Number.isFinite(n) || !Number.isInteger(n) || n < 0 || n > 2_000_000_000) return null
  return n
}

export async function createFundraiserAction(
  _prev: AdminFundraiserFormState,
  formData: FormData,
): Promise<AdminFundraiserFormState> {
  let session
  try {
    session = await requireAdmin()
  } catch {
    return { error: 'unauth' }
  }

  const parsed = schema.safeParse({
    title: formData.get('title'),
    tag: formData.get('tag'),
    description: formData.get('description'),
    goalAmount: formData.get('goalAmount'),
    raisedAmount: formData.get('raisedAmount'),
  })
  if (!parsed.success) return { error: 'validation' }

  const goal = parseIntAmount(parsed.data.goalAmount)
  const raised = parsed.data.raisedAmount ? parseIntAmount(parsed.data.raisedAmount) : 0
  if (goal === null || goal <= 0) return { error: 'validation' }
  if (raised === null) return { error: 'validation' }

  const cover = formData.get('cover')
  const coverFile = cover instanceof File && cover.size > 0 ? cover : null
  let coverImageUrl: string | null = null
  try {
    if (coverFile) {
      coverImageUrl = (await saveUploadedImage({ file: coverFile, kind: 'fundraisers' })).url
    }
  } catch {
    return { error: 'upload' }
  }

  const publishedAt = isCheckboxChecked(formData, 'published') ? new Date() : null
  const archivedAt = isCheckboxChecked(formData, 'archived') ? new Date() : null

  try {
    const row = await prisma.fundraiser.create({
      data: {
        title: parsed.data.title,
        tag: parsed.data.tag?.trim() ? parsed.data.tag.trim() : null,
        description: parsed.data.description,
        goalAmount: goal,
        raisedAmount: raised,
        coverImageUrl,
        gallery: [],
        publishedAt,
        archivedAt,
        authorId: session.id,
      },
      select: { id: true },
    })
    revalidatePath('/donate')
    revalidatePath('/')
    return { success: true, id: row.id }
  } catch {
    return { error: 'generic' }
  }
}

export async function updateFundraiserAction(
  _prev: AdminFundraiserFormState,
  formData: FormData,
): Promise<AdminFundraiserFormState> {
  let session
  try {
    session = await requireAdmin()
  } catch {
    return { error: 'unauth' }
  }

  const id = typeof formData.get('id') === 'string' ? String(formData.get('id')).trim() : ''
  if (!id) return { error: 'validation' }

  const parsed = schema.safeParse({
    title: formData.get('title'),
    tag: formData.get('tag'),
    description: formData.get('description'),
    goalAmount: formData.get('goalAmount'),
    raisedAmount: formData.get('raisedAmount'),
    removeCover: formData.get('removeCover'),
  })
  if (!parsed.success) return { error: 'validation' }

  const goal = parseIntAmount(parsed.data.goalAmount)
  const raised = parsed.data.raisedAmount ? parseIntAmount(parsed.data.raisedAmount) : 0
  if (goal === null || goal <= 0) return { error: 'validation' }
  if (raised === null) return { error: 'validation' }

  const cover = formData.get('cover')
  const coverFile = cover instanceof File && cover.size > 0 ? cover : null
  let uploadedCoverUrl: string | null = null
  try {
    if (coverFile) {
      uploadedCoverUrl = (await saveUploadedImage({ file: coverFile, kind: 'fundraisers' })).url
    }
  } catch {
    return { error: 'upload' }
  }

  const publishedAt = isCheckboxChecked(formData, 'published') ? new Date() : null
  const archivedAt = isCheckboxChecked(formData, 'archived') ? new Date() : null

  try {
    await prisma.fundraiser.update({
      where: { id },
      data: {
        title: parsed.data.title,
        tag: parsed.data.tag?.trim() ? parsed.data.tag.trim() : null,
        description: parsed.data.description,
        goalAmount: goal,
        raisedAmount: raised,
        coverImageUrl:
          parsed.data.removeCover === '1'
            ? null
            : uploadedCoverUrl !== null
              ? uploadedCoverUrl
              : undefined,
        gallery: [],
        publishedAt,
        archivedAt,
        authorId: session.id,
      },
    })
    revalidatePath('/donate')
    revalidatePath('/')
    return { success: true, id }
  } catch {
    return { error: 'generic' }
  }
}

export async function goToFundraisersListAction(): Promise<void> {
  await requireAdmin()
  redirect('/admin/fundraisers')
}
