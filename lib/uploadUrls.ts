import type { UploadKind } from '@/lib/uploads'

/** Дозволені лише локальні шляхи з /uploads/{kind}/ без path traversal. */
export function isAllowedUploadUrl(url: string, kind: UploadKind): boolean {
  if (typeof url !== 'string') return false
  const trimmed = url.trim()
  if (!trimmed.startsWith(`/uploads/${kind}/`)) return false
  if (trimmed.includes('..') || trimmed.includes('\\')) return false
  if (/^https?:\/\//i.test(trimmed)) return false
  return true
}

export function sanitizeUploadUrlList(urls: string[], kind: UploadKind): string[] {
  return urls.filter((url) => isAllowedUploadUrl(url, kind))
}
