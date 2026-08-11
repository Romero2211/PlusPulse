'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { useLanguage } from '@/contexts/LanguageContext'
import {
  daysUntilEnd,
  formatMoneyUAH,
  fundraiserPercent,
  type FundraiserPublicRow,
  type FundraiserReportRow,
} from '@/lib/fundraisers'
import FundraiserHelpMethods from '@/components/FundraiserHelpMethods'

function formatReportDate(iso: string, locale: 'uk' | 'en'): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  try {
    return d.toLocaleDateString(locale === 'en' ? 'en-GB' : 'uk-UA', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })
  } catch {
    return ''
  }
}

export default function FundraiserDetailView({
  fundraiser,
  reports,
}: {
  fundraiser: FundraiserPublicRow
  reports: FundraiserReportRow[]
}) {
  const { t, language } = useLanguage()
  const locale = language === 'en' ? 'en' : 'uk'
  const [showAllReports, setShowAllReports] = useState(false)
  const [shareHint, setShareHint] = useState<string | null>(null)

  const pct = fundraiserPercent(fundraiser.raisedAmount, fundraiser.goalAmount)
  const remaining = Math.max(0, fundraiser.goalAmount - fundraiser.raisedAmount)
  const daysLeft = daysUntilEnd(fundraiser.endsAtIso ? new Date(fundraiser.endsAtIso) : null)

  const visibleReports = useMemo(() => {
    const sorted = [...reports].sort(
      (a, b) => new Date(b.occurredAtIso).getTime() - new Date(a.occurredAtIso).getTime(),
    )
    return showAllReports ? sorted : sorted.slice(0, 4)
  }, [reports, showAllReports])

  const handleShare = async () => {
    const url = typeof window !== 'undefined' ? window.location.href : ''
    try {
      if (typeof navigator !== 'undefined' && navigator.share) {
        await navigator.share({ title: fundraiser.title, url })
        return
      }
      await navigator.clipboard.writeText(url)
      setShareHint(t('fundraiserDetail.shareCopied'))
      window.setTimeout(() => setShareHint(null), 2500)
    } catch {
      setShareHint(t('fundraiserDetail.shareError'))
      window.setTimeout(() => setShareHint(null), 2500)
    }
  }

  const scrollToHelp = () => {
    document.getElementById('fundraiser-help')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const monobankUrl = fundraiser.monobankUrl?.trim() || null

  return (
    <div className="fundraiser-detail">
      <nav className="fundraiser-breadcrumbs" aria-label={t('fundraiserDetail.breadcrumbAria')}>
        <Link href="/">{t('nav.home')}</Link>
        <span aria-hidden>/</span>
        <Link href="/donate">{t('nav.donate')}</Link>
        <span aria-hidden>/</span>
        <span className="fundraiser-breadcrumbs-current">{fundraiser.title}</span>
      </nav>

      <section className="fundraiser-detail-hero">
        <div className="fundraiser-detail-cover-wrap">
          {fundraiser.tag ? <span className="fundraiser-detail-tag">{fundraiser.tag}</span> : null}
          {fundraiser.coverImageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={fundraiser.coverImageUrl} alt="" className="fundraiser-detail-cover" />
          ) : (
            <div className="fundraiser-detail-cover fundraiser-detail-cover--placeholder" aria-hidden />
          )}
        </div>

        <div className="fundraiser-detail-summary">
          <h1 className="fundraiser-detail-title">{fundraiser.title}</h1>
          <p className="fundraiser-detail-lead">{fundraiser.description}</p>

          <p className="fundraiser-detail-collected-label">{t('fundraiserDetail.collectedLabel')}</p>
          <div className="fundraiser-detail-amount-row">
            <strong className="fundraiser-detail-raised">
              {formatMoneyUAH(fundraiser.raisedAmount, locale)} {t('fundraiserDetail.currency')}
            </strong>
            <span className="fundraiser-detail-goal">
              {t('fundraiserDetail.ofGoal')} {formatMoneyUAH(fundraiser.goalAmount, locale)} {t('fundraiserDetail.currency')}
            </span>
          </div>

          <div className="fundraiser-detail-progress">
            <div className="fundraiser-detail-progress-bar" aria-hidden>
              <div className="fundraiser-detail-progress-fill" style={{ width: `${pct}%` }} />
            </div>
            <span className="fundraiser-detail-progress-pct">{pct}%</span>
          </div>

          <div className="fundraiser-detail-actions">
            {monobankUrl ? (
              <a
                href={monobankUrl}
                className="btn fundraiser-detail-donate-btn"
                target="_blank"
                rel="noopener noreferrer"
              >
                {t('fundraiserDetail.monobankDonate')}
              </a>
            ) : (
              <button type="button" className="btn fundraiser-detail-donate-btn" onClick={scrollToHelp}>
                {t('fundraiserDetail.donateNow')}
              </button>
            )}
            <button type="button" className="btn fundraiser-detail-share-btn" onClick={handleShare}>
              <ShareIcon />
              {t('fundraiserDetail.share')}
            </button>
          </div>
          {shareHint ? <p className="fundraiser-detail-share-hint">{shareHint}</p> : null}
        </div>
      </section>

      <section className="fundraiser-detail-about card-panel">
        <h2 className="fundraiser-detail-section-title">{t('fundraiserDetail.aboutTitle')}</h2>
        <p className="fundraiser-detail-about-text">{fundraiser.description}</p>

        <dl className="fundraiser-detail-stats">
          <div>
            <dt>{t('fundraiserDetail.statGoal')}</dt>
            <dd>
              {formatMoneyUAH(fundraiser.goalAmount, locale)} {t('fundraiserDetail.currencyShort')}
            </dd>
          </div>
          <div>
            <dt>{t('fundraiserDetail.statRaised')}</dt>
            <dd>
              {formatMoneyUAH(fundraiser.raisedAmount, locale)} {t('fundraiserDetail.currencyShort')}
            </dd>
          </div>
          <div>
            <dt>{t('fundraiserDetail.statRemaining')}</dt>
            <dd>
              {formatMoneyUAH(remaining, locale)} {t('fundraiserDetail.currencyShort')}
            </dd>
          </div>
          <div>
            <dt>{t('fundraiserDetail.statDaysLeft')}</dt>
            <dd>
              {daysLeft === null
                ? '—'
                : t('fundraiserDetail.daysLeftValue').replace('{n}', String(daysLeft))}
            </dd>
          </div>
        </dl>

        <h3 className="fundraiser-detail-reporting-title">{t('fundraiserDetail.tabReporting')}</h3>

        {reports.length === 0 ? (
          <p className="fundraiser-detail-reports-empty">{t('fundraiserDetail.reportsEmpty')}</p>
        ) : (
          <ul className="fundraiser-detail-reports">
            {visibleReports.map((r) => (
              <li key={r.id} className="fundraiser-detail-report-row">
                <span className="fundraiser-detail-report-date">{formatReportDate(r.occurredAtIso, locale)}</span>
                <span className="fundraiser-detail-report-desc">{r.description}</span>
                <span className="fundraiser-detail-report-amount">
                  {r.amount < 0 ? '− ' : '+ '}
                  {formatMoneyUAH(Math.abs(r.amount), locale)} {t('fundraiserDetail.currencyShort')}
                </span>
              </li>
            ))}
          </ul>
        )}

        {reports.length > 4 && !showAllReports ? (
          <div className="fundraiser-detail-reports-more">
            <button type="button" className="btn fundraiser-detail-show-more" onClick={() => setShowAllReports(true)}>
              {t('fundraiserDetail.showMore')}
            </button>
          </div>
        ) : null}
      </section>

      <FundraiserHelpMethods monobankUrl={monobankUrl} />
    </div>
  )
}

function ShareIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <circle cx="18" cy="5" r="3" />
      <circle cx="6" cy="12" r="3" />
      <circle cx="18" cy="19" r="3" />
      <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
      <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
    </svg>
  )
}
