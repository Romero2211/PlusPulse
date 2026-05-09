'use client'

import { useActionState, useEffect } from 'react'
import { useFormStatus } from 'react-dom'
import { useRouter } from 'next/navigation'
import { useLanguage } from '@/contexts/LanguageContext'
import { archiveEventAction, type ArchiveEventFormState } from '@/app/events/actions'

const initialState: ArchiveEventFormState = {}

function archiveErrorLabel(key: ArchiveEventFormState['errorKey'], t: (k: string) => string): string {
  switch (key) {
    case 'unauth':
      return t('events.unauth')
    case 'forbidden':
      return t('events.errorForbidden')
    case 'generic':
    default:
      return t('events.archiveError')
  }
}

function ArchiveSubmit() {
  const { pending } = useFormStatus()
  const { t } = useLanguage()
  return (
    <button type="submit" className="events-archive-btn" disabled={pending}>
      {pending ? t('events.archiving') : t('events.archive')}
    </button>
  )
}

export default function EventArchiveForm({ eventId }: { eventId: string }) {
  const { t } = useLanguage()
  const router = useRouter()
  const [state, formAction] = useActionState(archiveEventAction, initialState)

  useEffect(() => {
    if (!state.success) return
    const tmr = window.setTimeout(() => {
      router.refresh()
    }, 200)
    return () => window.clearTimeout(tmr)
  }, [state.success, router])

  return (
    <form
      action={formAction}
      className="events-archive-form"
      onSubmit={(e) => {
        if (!window.confirm(t('events.archiveConfirm'))) {
          e.preventDefault()
        }
      }}
    >
      <input type="hidden" name="eventId" value={eventId} />
      {state.errorKey ? (
        <p className="register-form-alert events-archive-alert" role="alert">
          {archiveErrorLabel(state.errorKey, t)}
        </p>
      ) : null}
      <ArchiveSubmit />
    </form>
  )
}

