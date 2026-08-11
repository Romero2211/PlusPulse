export function formatMoneyUAH(n: number, locale: 'uk' | 'en' = 'uk'): string {
  try {
    return n.toLocaleString(locale === 'en' ? 'en-GB' : 'uk-UA')
  } catch {
    return String(n)
  }
}

export function fundraiserPercent(raised: number, goal: number): number {
  if (goal <= 0) return 0
  return Math.max(0, Math.min(100, Math.round((raised / goal) * 100)))
}

export function daysUntilEnd(endsAt: Date | null | undefined): number | null {
  if (!endsAt) return null
  const diff = endsAt.getTime() - Date.now()
  return Math.max(0, Math.ceil(diff / 86_400_000))
}

export type FundraiserPublicRow = {
  id: string
  title: string
  tag: string | null
  description: string
  goalAmount: number
  raisedAmount: number
  coverImageUrl: string | null
  endsAtIso?: string | null
  monobankUrl?: string | null
}

export type FundraiserReportRow = {
  id: string
  occurredAtIso: string
  description: string
  amount: number
}
