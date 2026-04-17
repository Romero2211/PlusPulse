'use client'

import { useLanguage } from '@/contexts/LanguageContext'

export default function Donate() {
  const { t, language } = useLanguage()

  const handleDonate = () => {
    alert(
      language === 'uk'
        ? 'Деталі для перерахування коштів будуть додані пізніше.'
        : 'Bank details for transfers will be added later.'
    )
  }

  return (
    <section id="donate" className="donate">
      <div className="container">
        <div className="donate-content">
          <div className="donate-text">
            <h2>{t('donate.title')}</h2>
            <p>{t('donate.description')}</p>
          </div>
          <div className="donate-form-wrapper">
            <div className="donate-form">
              <h3>{t('donate.formTitle')}</h3>
              <p className="donate-subtitle">{t('donate.subtitle')}</p>
              <div className="donate-buttons">
                <button className="donate-btn" onClick={() => handleDonate()}>
                  {t('donate.onetime')}
                </button>
                <button className="donate-btn" onClick={() => handleDonate()}>
                  {t('donate.regular')}
                </button>
              </div>
              <div className="donate-types">
                <p className="donate-types-title">{t('donate.individuals')} • {t('donate.legal')} • {t('donate.international')}</p>
              </div>
              <p className="donate-note">{t('donate.note')}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
