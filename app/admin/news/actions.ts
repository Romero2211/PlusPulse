'use server'

import { z } from 'zod'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/admin'
import { slugify } from '@/lib/slug'
import { saveUploadedImage, saveGalleryUploadsFromForm } from '@/lib/uploads'

export type AdminNewsFormState =
  | { success: true; id: string }
  | { success?: false; error?: 'unauth' | 'validation' | 'conflict' | 'upload' | 'generic' }

const schema = z.object({
  title: z.string().trim().min(3).max(200),
  slug: z.string().trim().min(1).max(120),
  excerpt: z.string().trim().max(500).optional(),
  body: z.string().trim().min(1).max(50_000),
  galleryUrls: z.string().optional(),
  removeCover: z.enum(['0', '1']).optional(),
})

/** Checkbox-only `published` — must use getAll (hidden+checkbox duplicate name breaks FormData.get). */
function isPublishedChecked(formData: FormData): boolean {
  return formData.getAll('published').includes('1')
}

function parseGalleryUrls(raw: string | null): string[] {
  if (!raw) return []
  try {
    const parsed = JSON.parse(raw) as unknown
    if (Array.isArray(parsed) && parsed.every((x) => typeof x === 'string')) return parsed as string[]
    return []
  } catch {
    return []
  }
}

export async function createNewsPostAction(_prev: AdminNewsFormState, formData: FormData): Promise<AdminNewsFormState> {
  let session
  try {
    session = await requireAdmin()
  } catch {
    return { error: 'unauth' }
  }

  const parsed = schema.safeParse({
    title: formData.get('title'),
    slug: formData.get('slug'),
    excerpt: formData.get('excerpt'),
    body: formData.get('body'),
    galleryUrls: formData.get('galleryUrls'),
  })
  if (!parsed.success) return { error: 'validation' }

  const cover = formData.get('cover')
  const coverFile = cover instanceof File && cover.size > 0 ? cover : null
  let coverImageUrl: string | null = null
  try {
    if (coverFile) {
      coverImageUrl = (await saveUploadedImage({ file: coverFile, kind: 'news' })).url
    }
  } catch {
    return { error: 'upload' }
  }

  let galleryUploaded: string[] = []
  try {
    galleryUploaded = await saveGalleryUploadsFromForm(formData, 'news')
  } catch {
    return { error: 'upload' }
  }

  const slug = slugify(parsed.data.slug)
  const galleryPreserved = parseGalleryUrls(parsed.data.galleryUrls ?? null)
  const gallery = [...galleryPreserved, ...galleryUploaded]
  const publishedAt = isPublishedChecked(formData) ? new Date() : null

  try {
    const row = await prisma.newsPost.create({
      data: {
        title: parsed.data.title,
        slug,
        excerpt: parsed.data.excerpt?.trim() ? parsed.data.excerpt.trim() : null,
        body: parsed.data.body,
        coverImageUrl,
        gallery: gallery.length ? gallery : [],
        publishedAt,
        authorId: session.id,
      },
      select: { id: true },
    })
    revalidatePath('/news')
    revalidatePath('/')
    return { success: true, id: row.id }
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e)
    if (msg.toLowerCase().includes('unique') || msg.toLowerCase().includes('slug')) {
      return { error: 'conflict' }
    }
    return { error: 'generic' }
  }
}

export async function updateNewsPostAction(_prev: AdminNewsFormState, formData: FormData): Promise<AdminNewsFormState> {
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
    slug: formData.get('slug'),
    excerpt: formData.get('excerpt'),
    body: formData.get('body'),
    galleryUrls: formData.get('galleryUrls'),
    removeCover: formData.get('removeCover'),
  })
  if (!parsed.success) return { error: 'validation' }

  const cover = formData.get('cover')
  const coverFile = cover instanceof File && cover.size > 0 ? cover : null

  let uploadedCoverUrl: string | null = null
  try {
    if (coverFile) {
      uploadedCoverUrl = (await saveUploadedImage({ file: coverFile, kind: 'news' })).url
    }
  } catch {
    return { error: 'upload' }
  }

  let galleryUploaded: string[] = []
  try {
    galleryUploaded = await saveGalleryUploadsFromForm(formData, 'news')
  } catch {
    return { error: 'upload' }
  }

  const slug = slugify(parsed.data.slug)
  const galleryPreserved = parseGalleryUrls(parsed.data.galleryUrls ?? null)
  const gallery = [...galleryPreserved, ...galleryUploaded]
  const publishedAt = isPublishedChecked(formData) ? new Date() : null

  try {
    await prisma.newsPost.update({
      where: { id },
      data: {
        title: parsed.data.title,
        slug,
        excerpt: parsed.data.excerpt?.trim() ? parsed.data.excerpt.trim() : null,
        body: parsed.data.body,
        coverImageUrl:
          parsed.data.removeCover === '1'
            ? null
            : uploadedCoverUrl !== null
              ? uploadedCoverUrl
              : undefined,
        gallery,
        publishedAt,
        authorId: session.id,
      },
    })
    revalidatePath('/news')
    revalidatePath('/')
    revalidatePath(`/news/${slug}`)
    return { success: true, id }
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e)
    if (msg.toLowerCase().includes('unique') || msg.toLowerCase().includes('slug')) {
      return { error: 'conflict' }
    }
    return { error: 'generic' }
  }
}

export async function goToNewsListAction(): Promise<void> {
  await requireAdmin()
  redirect('/admin/news')
}

