'use client'

import Link from 'next/link'
import { useLanguage } from '@/contexts/LanguageContext'

export default function AdminDashboard() {
  const { t } = useLanguage()

  return (
    <section className="admin-dash">
      <h1 className="admin-title">{t('admin.dashboardTitle')}</h1>
      <div className="admin-grid">
        <Link className="admin-tile" href="/admin/news">
          {t('admin.tileNews')}
        </Link>
        <Link className="admin-tile" href="/admin/fundraisers">
          {t('admin.tileFundraisers')}
        </Link>
        <Link className="admin-tile" href="/admin/events">
          {t('admin.tileEvents')}
        </Link>
      </div>
    </section>
  )
}
