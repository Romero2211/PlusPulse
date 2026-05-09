'use client'

import { useActionState, useEffect } from 'react'
import { useFormStatus } from 'react-dom'
import { useRouter } from 'next/navigation'
import { useLanguage } from '@/contexts/LanguageContext'
import { joinEventAction, type JoinLeaveFormState } from '@/app/events/actions'

const initialState: JoinLeaveFormState = {}

function joinErrorLabel(key: JoinLeaveFormState['errorKey'], t: (k: string) => string): string {
  switch (key) {
    case 'unauth':
      return t('events.unauth')
    case 'host':
      return t('events.joinErrorHost')
    case 'full':
      return t('events.joinErrorFull')
    case 'already':
      return t('events.joinErrorAlready')
    case 'archived':
      return t('events.joinErrorArchived')
    case 'generic':
    default:
      return t('events.joinErrorGeneric')
  }
}

function JoinSubmit({ disabled }: { disabled?: boolean }) {
  const { pending } = useFormStatus()
  const { t } = useLanguage()
  return (
    <button type="submit" className="events-join-btn" disabled={disabled || pending}>
      {pending ? t('events.joinPending') : t('events.join')}
    </button>
  )
}

export default function EventJoinForm({ eventId, disabled }: { eventId: string; disabled?: boolean }) {
  const { t } = useLanguage()
  const router = useRouter()
  const [state, formAction] = useActionState(joinEventAction, initialState)

  useEffect(() => {
    if (!state.success) return
    const tmr = window.setTimeout(() => {
      router.refresh()
    }, 150)
    return () => window.clearTimeout(tmr)
  }, [state.success, router])

  return (
    <form action={formAction} className="events-join-form">
      <input type="hidden" name="eventId" value={eventId} />
      {state.errorKey ? (
        <p className="register-form-alert events-join-alert" role="alert">
          {joinErrorLabel(state.errorKey, t)}
        </p>
      ) : null}
      <JoinSubmit disabled={disabled} />
    </form>
  )
}
