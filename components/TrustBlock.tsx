'use client'

import Link from 'next/link'
import { useLanguage } from '@/contexts/LanguageContext'

export default function TrustBlock() {
  const { t } = useLanguage()

  const items = [
    { icon: '📄', title: t('trust.items.statute'), note: t('trust.items.statuteNote') },
    { icon: '📈', title: t('trust.items.reporting'), note: t('trust.items.reportingNote') },
    { icon: '🏷️', title: t('trust.items.nonprofit'), note: t('trust.items.nonprofitNote') },
  ]

  return (
    <section id="trust" className="trust">
      <div className="container">
        <div className="section-header">
          <h2 className="section-title">{t('trust.title')}</h2>
          <div className="section-divider"></div>
          <p className="section-description">{t('trust.description')}</p>
        </div>

        <div className="trust-grid">
          {items.map((item) => (
            <div key={item.title} className="trust-card">
              <div className="trust-icon">{item.icon}</div>
              <h3>{item.title}</h3>
              <p>{item.note}</p>
            </div>
          ))}
        </div>

        <div className="trust-actions">
          <Link className="btn btn-secondary" href="/transparency">
            {t('trust.cta')}
          </Link>
        </div>
      </div>
    </section>
  )
}

