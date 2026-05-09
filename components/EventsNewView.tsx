'use client'

import Link from 'next/link'
import { useLanguage } from '@/contexts/LanguageContext'
import CreateEventForm from '@/components/CreateEventForm'

export default function EventsNewView() {
  const { t } = useLanguage()

  return (
    <>
      <nav className="events-new-back" aria-label={t('events.newPageNav')}>
        <Link href="/events" className="events-new-back-link">
          {t('events.backToList')}
        </Link>
      </nav>
      <h1 className="events-page-title events-new-page-title">{t('events.createHeading')}</h1>
      <p className="events-page-lead events-new-page-lead">{t('events.createLead')}</p>
      <CreateEventForm hideIntro />
    </>
  )
}
