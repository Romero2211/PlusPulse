const ALLOWED_MIME = new Set(['image/jpeg', 'image/png', 'image/webp'])

/** Magic-byte sniffing — не довіряємо лише file.type з браузера. */
export function detectImageMime(buf: Buffer): 'image/jpeg' | 'image/png' | 'image/webp' | null {
  if (buf.length >= 3 && buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) {
    return 'image/jpeg'
  }
  if (buf.length >= 8 && buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47) {
    return 'image/png'
  }
  if (
    buf.length >= 12 &&
    buf[0] === 0x52 &&
    buf[1] === 0x49 &&
    buf[2] === 0x46 &&
    buf[3] === 0x46 &&
    buf[8] === 0x57 &&
    buf[9] === 0x45 &&
    buf[10] === 0x42 &&
    buf[11] === 0x50
  ) {
    return 'image/webp'
  }
  return null
}

export function extForImageMime(mime: string): string | null {
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

/** Повертає нормалізований MIME або null, якщо файл не є дозволеним зображенням. */
export function validateImageBuffer(buf: Buffer, declaredMime: string): string | null {
  if (!ALLOWED_MIME.has(declaredMime)) return null
  const detected = detectImageMime(buf)
  if (!detected || detected !== declaredMime) return null
  return detected
}
