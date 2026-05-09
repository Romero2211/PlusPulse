'use client'

import Link from 'next/link'
import FundraiserActiveCards, { type FundraiserActiveCardRow } from '@/components/FundraiserActiveCards'
import { useLanguage } from '@/contexts/LanguageContext'

export default function ProgramsPreview({ fundraiserRows }: { fundraiserRows: FundraiserActiveCardRow[] }) {
  const { t } = useLanguage()

  return (
    <section id="programs" className="programs-preview">
      <div className="container">
        <div className="section-header">
          <h2 className="section-title">{t('programsPreview.title')}</h2>
          <div className="section-divider"></div>
          <p className="section-description">{t('programsPreview.description')}</p>
        </div>

        <div className="programs-preview-fundraisers">
          <FundraiserActiveCards rows={fundraiserRows} emptyMessage={t('programsPreview.emptyFundraisers')} />
        </div>

        <div className="programs-preview-actions">
          <Link className="btn btn-primary" href="/donate#donate">
            {t('programsPreview.ctaDonate')}
          </Link>
        </div>
      </div>
    </section>
  )
}

