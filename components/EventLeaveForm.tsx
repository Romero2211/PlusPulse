'use client'

import { useActionState, useEffect } from 'react'
import { useFormStatus } from 'react-dom'
import { useRouter } from 'next/navigation'
import { useLanguage } from '@/contexts/LanguageContext'
import { leaveEventAction, type JoinLeaveFormState } from '@/app/events/actions'

const initialState: JoinLeaveFormState = {}

function leaveErrorLabel(key: JoinLeaveFormState['errorKey'], t: (k: string) => string): string {
  switch (key) {
    case 'unauth':
      return t('events.unauth')
    case 'not_member':
      return t('events.leaveErrorNotMember')
    case 'generic':
    default:
      return t('events.leaveErrorGeneric')
  }
}

function LeaveSubmit() {
  const { pending } = useFormStatus()
  const { t } = useLanguage()
  return (
    <button type="submit" className="events-leave-btn" disabled={pending}>
      {pending ? t('events.leavePending') : t('events.leave')}
    </button>
  )
}

export default function EventLeaveForm({ eventId }: { eventId: string }) {
  const { t } = useLanguage()
  const router = useRouter()
  const [state, formAction] = useActionState(leaveEventAction, initialState)

  useEffect(() => {
    if (!state.success) return
    const tmr = window.setTimeout(() => {
      router.refresh()
    }, 150)
    return () => window.clearTimeout(tmr)
  }, [state.success, router])

  return (
    <form action={formAction} className="events-leave-form">
      <input type="hidden" name="eventId" value={eventId} />
      {state.errorKey ? (
        <p className="register-form-alert events-join-alert" role="alert">
          {leaveErrorLabel(state.errorKey, t)}
        </p>
      ) : null}
      <LeaveSubmit />
    </form>
  )
}
