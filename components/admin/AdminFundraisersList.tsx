'use client'

import Link from 'next/link'
import { useLanguage } from '@/contexts/LanguageContext'

export type AdminFundraiserListRow = {
  id: string
  title: string
  tag: string | null
  publishedAt: Date | null
  archivedAt: Date | null
  goalAmount: number
  raisedAmount: number
}

export default function AdminFundraisersList({ rows }: { rows: AdminFundraiserListRow[] }) {
  const { t, language } = useLanguage()
  const locale = language === 'en' ? 'en-GB' : 'uk-UA'

  return (
    <section className="admin-page">
      <div className="admin-page-head">
        <h1 className="admin-title">{t('admin.fundraisersTitle')}</h1>
        <Link className="admin-btn" href="/admin/fundraisers/new">
          {t('admin.create')}
        </Link>
      </div>

      {rows.length === 0 ? (
        <p className="admin-empty">{t('admin.emptyFundraisers')}</p>
      ) : (
        <ul className="admin-list">
          {rows.map((r) => (
            <li key={r.id} className="admin-list-item">
              <div className="admin-list-main">
                <strong>{r.title}</strong>
                <div className="admin-list-meta">
                  <span>{r.tag ? `#${r.tag}` : t('admin.noTag')}</span>
                  <span>·</span>
                  <span>{r.publishedAt ? t('admin.statusPublished') : t('admin.statusDraft')}</span>
                  <span>·</span>
                  <span>{r.archivedAt ? t('admin.statusArchived') : t('admin.statusActive')}</span>
                  <span>·</span>
                  <span>
                    {r.raisedAmount.toLocaleString(locale)} / {r.goalAmount.toLocaleString(locale)}
                  </span>
                </div>
              </div>
              <div className="admin-list-actions">
                <Link className="admin-link" href={`/admin/fundraisers/${r.id}/edit`}>
                  {t('admin.edit')}
                </Link>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
