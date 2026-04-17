'use client'

import Link from 'next/link'
import { useLanguage } from '@/contexts/LanguageContext'

export default function ProgramsPreview() {
  const { t } = useLanguage()

  const items = [
    { title: t('programsPreview.items.0.title'), note: t('programsPreview.items.0.note') },
    { title: t('programsPreview.items.1.title'), note: t('programsPreview.items.1.note') },
    { title: t('programsPreview.items.2.title'), note: t('programsPreview.items.2.note') },
  ]

  return (
    <section id="programs" className="programs-preview">
      <div className="container">
        <div className="section-header">
          <h2 className="section-title">{t('programsPreview.title')}</h2>
          <div className="section-divider"></div>
          <p className="section-description">{t('programsPreview.description')}</p>
        </div>

        <div className="programs-preview-grid">
          {items.map((item) => (
            <div key={item.title} className="programs-preview-card">
              <h3>{item.title}</h3>
              <p>{item.note}</p>
            </div>
          ))}
        </div>

        <div className="programs-preview-actions">
          <Link className="btn btn-secondary" href="/donate#programs">
            {t('programsPreview.ctaPrograms')}
          </Link>
          <Link className="btn btn-primary" href="/donate#donate">
            {t('programsPreview.ctaDonate')}
          </Link>
        </div>
      </div>
    </section>
  )
}

