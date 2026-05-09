'use client'

import Link from 'next/link'
import { useLanguage } from '@/contexts/LanguageContext'

export type AdminNewsListRow = {
  id: string
  title: string
  slug: string
  publishedAt: Date | null
}

export default function AdminNewsList({ rows }: { rows: AdminNewsListRow[] }) {
  const { t } = useLanguage()

  return (
    <section className="admin-page">
      <div className="admin-page-head">
        <h1 className="admin-title">{t('admin.newsTitle')}</h1>
        <Link className="admin-btn" href="/admin/news/new">
          {t('admin.create')}
        </Link>
      </div>

      {rows.length === 0 ? (
        <p className="admin-empty">{t('admin.emptyNews')}</p>
      ) : (
        <ul className="admin-list">
          {rows.map((r) => (
            <li key={r.id} className="admin-list-item">
              <div className="admin-list-main">
                <strong>{r.title}</strong>
                <div className="admin-list-meta">
                  <span>/{r.slug}</span>
                  <span>·</span>
                  <span>{r.publishedAt ? t('admin.statusPublished') : t('admin.statusDraft')}</span>
                </div>
              </div>
              <div className="admin-list-actions">
                <Link className="admin-link" href={`/admin/news/${r.id}/edit`}>
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
