'use client'

import { useLanguage } from '@/contexts/LanguageContext'

type FundraiserHelpMethodsProps = {
  monobankUrl?: string | null
}

export default function FundraiserHelpMethods({ monobankUrl }: FundraiserHelpMethodsProps) {
  const { t } = useLanguage()
  const hasMonobank = Boolean(monobankUrl?.trim())

  const methods = [
    {
      icon: '💳',
      titleKey: 'fundraiserDetail.helpOnline',
      descKey: hasMonobank ? 'fundraiserDetail.helpMonobankDesc' : 'fundraiserDetail.helpOnlineDesc',
      accent: 'blue',
      href: hasMonobank ? monobankUrl! : null,
    },
    {
      icon: '🏦',
      titleKey: 'fundraiserDetail.helpTransfer',
      descKey: 'fundraiserDetail.helpTransferDesc',
      accent: 'orange',
      href: null,
    },
    {
      icon: '💎',
      titleKey: 'fundraiserDetail.helpCrypto',
      descKey: 'fundraiserDetail.helpCryptoDesc',
      accent: 'green',
      href: null,
    },
  ] as const

  return (
    <section id="fundraiser-help" className="fundraiser-help card-panel">
      <h2 className="fundraiser-detail-section-title">{t('fundraiserDetail.helpTitle')}</h2>

      {hasMonobank ? (
        <div className="fundraiser-monobank-cta">
          <a
            href={monobankUrl!}
            className="btn fundraiser-monobank-btn"
            target="_blank"
            rel="noopener noreferrer"
          >
            {t('fundraiserDetail.monobankDonate')}
          </a>
          <p className="fundraiser-monobank-note">{t('fundraiserDetail.monobankNote')}</p>
        </div>
      ) : null}

      <div className="fundraiser-help-grid">
        {methods.map((m) => {
          const inner = (
            <>
              <span className="fundraiser-help-icon" aria-hidden>
                {m.icon}
              </span>
              <h3>{t(m.titleKey)}</h3>
              <p>{t(m.descKey)}</p>
            </>
          )

          if (m.href) {
            return (
              <a
                key={m.titleKey}
                href={m.href}
                className={`fundraiser-help-card fundraiser-help-card--${m.accent} fundraiser-help-card--link`}
                target="_blank"
                rel="noopener noreferrer"
              >
                {inner}
              </a>
            )
          }

          return (
            <div key={m.titleKey} className={`fundraiser-help-card fundraiser-help-card--${m.accent}`}>
              {inner}
            </div>
          )
        })}
      </div>
      {!hasMonobank ? <p className="fundraiser-help-note">{t('donate.note')}</p> : null}
    </section>
  )
}
