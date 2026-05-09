'use client'

import Link from 'next/link'
import { useLanguage } from '@/contexts/LanguageContext'
import EditEventForm, { type EditEventFormEvent } from '@/components/EditEventForm'

export default function EditEventView({ event }: { event: EditEventFormEvent }) {
  const { t } = useLanguage()

  return (
    <>
      <nav className="events-new-back" aria-label={t('events.editPageNav')}>
        <Link href="/events" className="events-new-back-link">
          {t('events.backToList')}
        </Link>
      </nav>
      <h1 className="events-page-title events-new-page-title">{t('events.editHeading')}</h1>
      <p className="events-page-lead events-new-page-lead">{t('events.editLead')}</p>
      <EditEventForm event={event} />
    </>
  )
}
