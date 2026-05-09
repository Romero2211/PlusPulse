export type FundraiserActiveCardRow = {
  id: string
  title: string
  tag: string | null
  description: string
  goalAmount: number
  raisedAmount: number
  coverImageUrl: string | null
}

function formatMoneyUAH(n: number): string {
  try {
    return n.toLocaleString('uk-UA')
  } catch {
    return String(n)
  }
}

function percent(raised: number, goal: number): number {
  if (goal <= 0) return 0
  return Math.max(0, Math.min(100, Math.round((raised / goal) * 100)))
}

export default function FundraiserActiveCards({
  rows,
  emptyMessage,
}: {
  rows: FundraiserActiveCardRow[]
  emptyMessage: string
}) {
  if (rows.length === 0) {
    return <p className="events-empty">{emptyMessage}</p>
  }

  return (
    <div className="fundraiser-grid">
      {rows.map((f) => {
        const pct = percent(f.raisedAmount, f.goalAmount)
        return (
          <article key={f.id} className="fundraiser-card">
            <div className="fundraiser-cover">
              {f.tag ? <span className="fundraiser-tag">{f.tag}</span> : null}
              {f.coverImageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={f.coverImageUrl} alt="" className="fundraiser-cover-img" />
              ) : (
                <div className="fundraiser-cover-placeholder" aria-hidden />
              )}
            </div>
            <div className="fundraiser-body">
              <h2 className="fundraiser-title">{f.title}</h2>
              <p className="fundraiser-desc">{f.description}</p>

              <div className="fundraiser-progress">
                <div className="fundraiser-progress-bar" aria-hidden>
                  <div className="fundraiser-progress-fill" style={{ width: `${pct}%` }} />
                </div>
                <div className="fundraiser-progress-meta">
                  <span className="fundraiser-progress-pct">{pct}%</span>
                  <span className="fundraiser-progress-labels">
                    <span>Зібрано</span>
                    <span>Ціль збору</span>
                  </span>
                  <span className="fundraiser-progress-values">
                    <strong>{formatMoneyUAH(f.raisedAmount)} ₴</strong>
                    <strong>{formatMoneyUAH(f.goalAmount)} ₴</strong>
                  </span>
                </div>
              </div>
            </div>
          </article>
        )
      })}
    </div>
  )
}
