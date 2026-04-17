'use client'

import { useLanguage } from '@/contexts/LanguageContext'

export default function Transparency() {
  const { t } = useLanguage()

  const transparencyItems = [
    {
      icon: '📋',
      title: t('transparency.reports'),
      description: t('transparency.reportsDesc'),
    },
    {
      icon: '💰',
      title: t('transparency.finances'),
      description: t('transparency.financesDesc'),
    },
    {
      icon: '📊',
      title: t('transparency.programs'),
      description: t('transparency.programsDesc'),
    },
    {
      icon: '✅',
      title: t('transparency.accountability'),
      description: t('transparency.accountabilityDesc'),
    },
  ]

  return (
    <section id="transparency" className="transparency">
      <div className="container">
        <div className="section-header">
          <h2 className="section-title">{t('transparency.title')}</h2>
          <div className="section-divider"></div>
          <p className="section-description">{t('transparency.description')}</p>
        </div>
        <div className="transparency-grid">
          {transparencyItems.map((item, index) => (
            <div key={index} className="transparency-card">
              <div className="transparency-icon">{item.icon}</div>
              <h3>{item.title}</h3>
              <p>{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
