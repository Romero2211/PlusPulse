'use server'

import { mkdir, readdir, unlink, writeFile } from 'fs/promises'
import path from 'path'
import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/session'
import { extForImageMime, validateImageBuffer } from '@/lib/imageValidation'

export type CabinetFormState = {
  success?: boolean
  errorKey?: 'unauth' | 'filesize' | 'filetype' | 'bio' | 'phone' | 'generic'
}

// Файли пишуться в public/uploads — на serverless (Vercel) краще підключити S3 / Uploadthing.
const MAX_BYTES = 2 * 1024 * 1024
const ALLOWED = new Set(['image/jpeg', 'image/png', 'image/webp'])

export async function updateCabinetProfileAction(
  _prev: CabinetFormState,
  formData: FormData,
): Promise<CabinetFormState> {
  const session = await getSession()
  if (!session) {
    return { errorKey: 'unauth' }
  }

  const displayName = typeof formData.get('displayName') === 'string' ? (formData.get('displayName') as string).trim() : ''
  const bio = typeof formData.get('bio') === 'string' ? (formData.get('bio') as string).trim() : ''
  const city = typeof formData.get('city') === 'string' ? (formData.get('city') as string).trim() : ''

  if (displayName.length > 120) {
    return { errorKey: 'generic' }
  }
  if (city.length > 120) {
    return { errorKey: 'generic' }
  }
  if (bio.length > 1500) {
    return { errorKey: 'bio' }
  }

  const rawSuffix = formData.get('phoneSuffix')
  const phoneDigits = typeof rawSuffix === 'string' ? rawSuffix.replace(/\D/g, '') : ''
  let phone: string | null = null
  if (phoneDigits.length > 9) {
    return { errorKey: 'phone' }
  }
  if (phoneDigits.length > 0) {
    if (phoneDigits.length !== 9 || !/^\d{9}$/.test(phoneDigits)) {
      return { errorKey: 'phone' }
    }
    phone = `+380${phoneDigits}`
  }

  const file = formData.get('avatar')
  let avatarUrl: string | undefined

  try {
    if (file instanceof File && file.size > 0) {
      if (file.size > MAX_BYTES) {
        return { errorKey: 'filesize' }
      }
      if (!ALLOWED.has(file.type)) {
        return { errorKey: 'filetype' }
      }

      const buf = Buffer.from(await file.arrayBuffer())
      const mime = validateImageBuffer(buf, file.type)
      if (!mime) {
        return { errorKey: 'filetype' }
      }

      const ext = extForImageMime(mime)
      if (!ext) {
        return { errorKey: 'filetype' }
      }

      const userDir = path.join(process.cwd(), 'public', 'uploads', 'avatars', session.id)
      await mkdir(userDir, { recursive: true })

      const names = await readdir(userDir).catch(() => [] as string[])
      for (const n of names) {
        if (n === '.gitkeep') continue
        await unlink(path.join(userDir, n)).catch(() => {})
      }

      const filename = `avatar.${ext}`
      await writeFile(path.join(userDir, filename), buf)
      avatarUrl = `/uploads/avatars/${session.id}/${filename}`
    }

    await prisma.user.update({
      where: { id: session.id },
      data: {
        name: displayName || null,
        bio: bio || null,
        phone: phone || null,
        city: city || null,
        ...(avatarUrl ? { avatarUrl } : {}),
      },
    })

    revalidatePath('/cabinet')
    revalidatePath('/')
    return { success: true }
  } catch {
    return { errorKey: 'generic' }
  }
}
