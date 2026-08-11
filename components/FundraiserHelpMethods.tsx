'use client'

import { useLanguage } from '@/contexts/LanguageContext'

export default function FundraiserHelpMethods() {
  const { t } = useLanguage()

  const methods = [
    {
      icon: '💳',
      titleKey: 'fundraiserDetail.helpOnline',
      descKey: 'fundraiserDetail.helpOnlineDesc',
      accent: 'blue',
    },
    {
      icon: '🏦',
      titleKey: 'fundraiserDetail.helpTransfer',
      descKey: 'fundraiserDetail.helpTransferDesc',
      accent: 'orange',
    },
    {
      icon: '💎',
      titleKey: 'fundraiserDetail.helpCrypto',
      descKey: 'fundraiserDetail.helpCryptoDesc',
      accent: 'green',
    },
  ] as const

  return (
    <section id="fundraiser-help" className="fundraiser-help card-panel">
      <h2 className="fundraiser-detail-section-title">{t('fundraiserDetail.helpTitle')}</h2>
      <div className="fundraiser-help-grid">
        {methods.map((m) => (
          <div key={m.titleKey} className={`fundraiser-help-card fundraiser-help-card--${m.accent}`}>
            <span className="fundraiser-help-icon" aria-hidden>
              {m.icon}
            </span>
            <h3>{t(m.titleKey)}</h3>
            <p>{t(m.descKey)}</p>
          </div>
        ))}
      </div>
      <p className="fundraiser-help-note">{t('donate.note')}</p>
    </section>
  )
}
