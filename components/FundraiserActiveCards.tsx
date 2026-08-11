import Link from 'next/link'
import {
  formatMoneyUAH,
  fundraiserPercent,
  type FundraiserPublicRow,
} from '@/lib/fundraisers'

export type FundraiserActiveCardRow = FundraiserPublicRow

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
        const pct = fundraiserPercent(f.raisedAmount, f.goalAmount)
        return (
          <Link key={f.id} href={`/donate/${f.id}`} className="fundraiser-card-link">
            <article className="fundraiser-card">
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
          </Link>
        )
      })}
    </div>
  )
}
