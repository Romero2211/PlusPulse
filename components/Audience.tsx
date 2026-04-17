'use client'

import { useLanguage } from '@/contexts/LanguageContext'

export default function Audience() {
  const { t } = useLanguage()

  const primary = [
    t('audience.primary.donors'),
    t('audience.primary.partners'),
    t('audience.primary.volunteers'),
    t('audience.primary.beneficiaries'),
  ]

  const secondary = [
    t('audience.secondary.media'),
    t('audience.secondary.government'),
    t('audience.secondary.internationalFunds'),
    t('audience.secondary.public'),
  ]

  return (
    <section id="audience" className="audience">
      <div className="container">
        <div className="section-header">
          <h2 className="section-title">{t('audience.title')}</h2>
          <div className="section-divider"></div>
          <p className="section-description">{t('audience.description')}</p>
        </div>

        <div className="audience-columns">
          <div className="audience-card">
            <div className="audience-card-header">
              <span className="audience-card-icon">🎯</span>
              <h3>{t('audience.primary.title')}</h3>
            </div>
            <ul className="audience-list">
              {primary.map((item) => (
                <li key={item}>
                  <span className="audience-pill">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="audience-card audience-card-secondary">
            <div className="audience-card-header">
              <span className="audience-card-icon">📌</span>
              <h3>{t('audience.secondary.title')}</h3>
            </div>
            <ul className="audience-list">
              {secondary.map((item) => (
                <li key={item}>
                  <span className="audience-pill">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  )
}

