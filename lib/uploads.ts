import { randomUUID } from 'crypto'
import { mkdir, writeFile } from 'fs/promises'
import path from 'path'

const MAX_BYTES = 5 * 1024 * 1024
const ALLOWED_MIME = new Set(['image/jpeg', 'image/png', 'image/webp'])

function extForMime(mime: string): string | null {
  switch (mime) {
    case 'image/jpeg':
      return 'jpg'
    case 'image/png':
      return 'png'
    case 'image/webp':
      return 'webp'
    default:
      return null
  }
}

function yyyymm(d = new Date()): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  return `${y}-${m}`
}

export type UploadKind = 'news' | 'fundraisers'

export async function saveUploadedImage(opts: {
  file: File
  kind: UploadKind
}): Promise<{ url: string }> {
  const { file, kind } = opts

  if (!file || typeof file.arrayBuffer !== 'function') {
    throw new Error('invalid_file')
  }
  if (!ALLOWED_MIME.has(file.type)) {
    throw new Error('invalid_type')
  }
  if (file.size <= 0 || file.size > MAX_BYTES) {
    throw new Error('invalid_size')
  }

  const ext = extForMime(file.type)
  if (!ext) {
    throw new Error('invalid_type')
  }

  const folder = path.join(process.cwd(), 'public', 'uploads', kind, yyyymm())
  await mkdir(folder, { recursive: true })

  const filename = `${randomUUID()}.${ext}`
  const abs = path.join(folder, filename)
  const buf = Buffer.from(await file.arrayBuffer())
  await writeFile(abs, buf)

  const url = `/uploads/${kind}/${yyyymm()}/${filename}`
  return { url }
}

/** Reads `galleryUpload` entries from FormData (supports `multiple`) and saves each non-empty file. */
export async function saveGalleryUploadsFromForm(formData: FormData, kind: UploadKind): Promise<string[]> {
  const urls: string[] = []
  for (const item of formData.getAll('galleryUpload')) {
    if (!(item instanceof File) || item.size <= 0) continue
    urls.push((await saveUploadedImage({ file: item, kind })).url)
  }
  return urls
}

