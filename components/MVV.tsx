'use client'

import { useLanguage } from '@/contexts/LanguageContext'

export default function MVV() {
  const { t } = useLanguage()

  const values = [
    t('mvv.values.legality'),
    t('mvv.values.transparency'),
    t('mvv.values.openness'),
    t('mvv.values.voluntariness'),
    t('mvv.values.humanity'),
    t('mvv.values.responsibility'),
    t('mvv.values.dignity'),
  ]

  return (
    <section id="mvv" className="mvv">
      <div className="container">
        <div className="section-header">
          <h2 className="section-title">{t('mvv.title')}</h2>
          <div className="section-divider"></div>
          <p className="section-description">{t('mvv.description')}</p>
        </div>

        <div className="mvv-grid">
          <div className="mvv-card">
            <div className="mvv-card-header">
              <span className="mvv-icon">🎯</span>
              <h3>{t('mvv.mission.title')}</h3>
            </div>
            <p className="mvv-text">{t('mvv.mission.text')}</p>
          </div>

          <div className="mvv-card">
            <div className="mvv-card-header">
              <span className="mvv-icon">👁️</span>
              <h3>{t('mvv.vision.title')}</h3>
            </div>
            <p className="mvv-text">{t('mvv.vision.text')}</p>
          </div>

          <div className="mvv-card mvv-card-values">
            <div className="mvv-card-header">
              <span className="mvv-icon">❤️</span>
              <h3>{t('mvv.values.title')}</h3>
            </div>
            <ul className="mvv-values">
              {values.map((v) => (
                <li key={v}>
                  <span className="mvv-pill">{v}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  )
}

