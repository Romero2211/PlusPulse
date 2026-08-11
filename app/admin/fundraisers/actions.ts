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

export type AdminFundraiserReportFormState =
  | { success: true }
  | { success?: false; error?: 'unauth' | 'validation' | 'not_found' | 'generic' }

const reportSchema = z.object({
  fundraiserId: z.string().trim().min(1),
  occurredAt: z.string().trim().min(1),
  description: z.string().trim().min(1).max(500),
  amount: z.string().trim(),
  isExpense: z.enum(['0', '1']).optional(),
})

const schema = z.object({
  title: z.string().trim().min(3).max(200),
  tag: z.string().trim().max(60).optional(),
  description: z.string().trim().min(1).max(10_000),
  goalAmount: z.string().trim(),
  raisedAmount: z.string().trim().optional(),
  monobankUrl: z.string().trim().max(500).optional(),
  removeCover: z.enum(['0', '1']).optional(),
})

function parseMonobankUrl(raw: unknown): string | null {
  const s = typeof raw === 'string' ? raw.trim() : ''
  if (!s) return null
  try {
    const u = new URL(s)
    if (u.protocol !== 'https:') return null
    if (!u.hostname.endsWith('monobank.ua')) return null
    return u.toString()
  } catch {
    return null
  }
}

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

function parseReportDate(raw: string): Date | null {
  const d = new Date(raw)
  if (Number.isNaN(d.getTime())) return null
  return d
}

function revalidateFundraiserPaths(fundraiserId: string) {
  revalidatePath('/donate')
  revalidatePath('/')
  revalidatePath(`/donate/${fundraiserId}`)
  revalidatePath(`/admin/fundraisers/${fundraiserId}/edit`)
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
    monobankUrl: formData.get('monobankUrl'),
  })
  if (!parsed.success) return { error: 'validation' }

  const goal = parseIntAmount(parsed.data.goalAmount)
  const raised = parsed.data.raisedAmount ? parseIntAmount(parsed.data.raisedAmount) : 0
  if (goal === null || goal <= 0) return { error: 'validation' }
  if (raised === null) return { error: 'validation' }

  const monobankRaw = typeof formData.get('monobankUrl') === 'string' ? String(formData.get('monobankUrl')).trim() : ''
  const monobankUrl = monobankRaw ? parseMonobankUrl(monobankRaw) : null
  if (monobankRaw && !monobankUrl) return { error: 'validation' }

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
        monobankUrl,
        coverImageUrl,
        gallery: [],
        publishedAt,
        archivedAt,
        authorId: session.id,
      },
      select: { id: true },
    })
    revalidateFundraiserPaths(row.id)
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
    monobankUrl: formData.get('monobankUrl'),
    removeCover: formData.get('removeCover'),
  })
  if (!parsed.success) return { error: 'validation' }

  const goal = parseIntAmount(parsed.data.goalAmount)
  const raised = parsed.data.raisedAmount ? parseIntAmount(parsed.data.raisedAmount) : 0
  if (goal === null || goal <= 0) return { error: 'validation' }
  if (raised === null) return { error: 'validation' }

  const monobankRaw = typeof formData.get('monobankUrl') === 'string' ? String(formData.get('monobankUrl')).trim() : ''
  const monobankUrl = monobankRaw ? parseMonobankUrl(monobankRaw) : null
  if (monobankRaw && !monobankUrl) return { error: 'validation' }

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
        monobankUrl,
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
    revalidateFundraiserPaths(id)
    return { success: true, id }
  } catch {
    return { error: 'generic' }
  }
}

export async function goToFundraisersListAction(): Promise<void> {
  await requireAdmin()
  redirect('/admin/fundraisers')
}

export async function addFundraiserReportAction(
  _prev: AdminFundraiserReportFormState,
  formData: FormData,
): Promise<AdminFundraiserReportFormState> {
  try {
    await requireAdmin()
  } catch {
    return { error: 'unauth' }
  }

  const parsed = reportSchema.safeParse({
    fundraiserId: formData.get('fundraiserId'),
    occurredAt: formData.get('occurredAt'),
    description: formData.get('description'),
    amount: formData.get('amount'),
    isExpense: formData.get('isExpense'),
  })
  if (!parsed.success) return { error: 'validation' }

  const occurredAt = parseReportDate(parsed.data.occurredAt)
  const amountAbs = parseIntAmount(parsed.data.amount)
  if (!occurredAt || amountAbs === null || amountAbs <= 0) return { error: 'validation' }

  const amount = parsed.data.isExpense === '1' ? -amountAbs : amountAbs

  const fundraiser = await prisma.fundraiser.findUnique({
    where: { id: parsed.data.fundraiserId },
    select: { id: true },
  })
  if (!fundraiser) return { error: 'not_found' }

  try {
    await prisma.fundraiserReport.create({
      data: {
        fundraiserId: fundraiser.id,
        occurredAt,
        description: parsed.data.description,
        amount,
      },
    })
    revalidateFundraiserPaths(fundraiser.id)
    return { success: true }
  } catch {
    return { error: 'generic' }
  }
}

export async function deleteFundraiserReportAction(
  _prev: AdminFundraiserReportFormState,
  formData: FormData,
): Promise<AdminFundraiserReportFormState> {
  try {
    await requireAdmin()
  } catch {
    return { error: 'unauth' }
  }

  const reportId = typeof formData.get('reportId') === 'string' ? formData.get('reportId') as string : ''
  const fundraiserId = typeof formData.get('fundraiserId') === 'string' ? formData.get('fundraiserId') as string : ''
  if (!reportId.trim() || !fundraiserId.trim()) return { error: 'validation' }

  const report = await prisma.fundraiserReport.findFirst({
    where: { id: reportId, fundraiserId },
    select: { id: true, fundraiserId: true },
  })
  if (!report) return { error: 'not_found' }

  try {
    await prisma.fundraiserReport.delete({ where: { id: report.id } })
    revalidateFundraiserPaths(report.fundraiserId)
    return { success: true }
  } catch {
    return { error: 'generic' }
  }
}
