'use client'

import { useActionState, useEffect } from 'react'
import { useFormStatus } from 'react-dom'
import { useRouter } from 'next/navigation'
import { useLanguage } from '@/contexts/LanguageContext'
import { deleteEventAction, type DeleteEventFormState } from '@/app/events/actions'

const initialState: DeleteEventFormState = {}

function deleteErrorLabel(key: DeleteEventFormState['errorKey'], t: (k: string) => string): string {
  switch (key) {
    case 'unauth':
      return t('events.unauth')
    case 'forbidden':
      return t('events.errorForbidden')
    case 'generic':
    default:
      return t('events.deleteError')
  }
}

function DeleteSubmit() {
  const { pending } = useFormStatus()
  const { t } = useLanguage()
  return (
    <button type="submit" className="events-delete-btn" disabled={pending}>
      {pending ? t('events.deleting') : t('events.delete')}
    </button>
  )
}

export default function EventDeleteForm({ eventId }: { eventId: string }) {
  const { t } = useLanguage()
  const router = useRouter()
  const [state, formAction] = useActionState(deleteEventAction, initialState)

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
      className="events-delete-form"
      onSubmit={(e) => {
        if (!window.confirm(t('events.deleteConfirm'))) {
          e.preventDefault()
        }
      }}
    >
      <input type="hidden" name="eventId" value={eventId} />
      {state.errorKey ? (
        <p className="register-form-alert events-delete-alert" role="alert">
          {deleteErrorLabel(state.errorKey, t)}
        </p>
      ) : null}
      <DeleteSubmit />
    </form>
  )
}
