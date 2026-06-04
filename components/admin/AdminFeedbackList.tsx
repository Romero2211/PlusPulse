'use client'

import Link from 'next/link'
import { useLanguage } from '@/contexts/LanguageContext'

export type AdminFeedbackRow = {
  id: string
  name: string | null
  email: string | null
  message: string
  createdAtIso: string
}

function formatWhen(iso: string, locale: string): string {
  try {
    const d = new Date(iso)
    if (Number.isNaN(d.getTime())) return iso
    return d.toLocaleString(locale === 'en' ? 'en-GB' : 'uk-UA', {
      dateStyle: 'medium',
      timeStyle: 'short',
    })
  } catch {
    return iso
  }
}

export default function AdminFeedbackList({ rows }: { rows: AdminFeedbackRow[] }) {
  const { t, language } = useLanguage()

  return (
    <section className="admin-page">
      <div className="admin-page-head">
        <h1 className="admin-title">{t('admin.feedbackTitle')}</h1>
        <Link className="admin-btn admin-btn-secondary" href="/admin">
          {t('admin.back')}
        </Link>
      </div>

      {rows.length === 0 ? (
        <p className="admin-empty">{t('admin.feedbackEmpty')}</p>
      ) : (
        <ul className="admin-feedback-list">
          {rows.map((r) => (
            <li key={r.id} className="admin-feedback-card">
              <div className="admin-feedback-card-head">
                <time dateTime={r.createdAtIso}>{formatWhen(r.createdAtIso, language)}</time>
              </div>
              <dl className="admin-feedback-dl">
                <div>
                  <dt>{t('admin.feedbackFieldName')}</dt>
                  <dd>{r.name?.trim() ? r.name : '—'}</dd>
                </div>
                <div>
                  <dt>{t('admin.feedbackFieldEmail')}</dt>
                  <dd>{r.email?.trim() ? r.email : '—'}</dd>
                </div>
                <div className="admin-feedback-message-block">
                  <dt>{t('admin.feedbackFieldMessage')}</dt>
                  <dd className="admin-feedback-message">{r.message}</dd>
                </div>
              </dl>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
