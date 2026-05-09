'use client'

import { useActionState, useEffect, useMemo } from 'react'
import { useFormStatus } from 'react-dom'
import { useRouter } from 'next/navigation'
import { useLanguage } from '@/contexts/LanguageContext'
import { updateEventAction, type CreateEventFormState } from '@/app/events/actions'
import EventLocationMapPicker from '@/components/EventLocationMapPicker'

const initialState: CreateEventFormState = {}

function isoToDatetimeLocalValue(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

function errorLabel(state: CreateEventFormState, t: (k: string) => string): string {
  const key = state.errorKey
  if (!key) return ''
  if (key === 'aiReject') {
    return t(`events.aiReject.${state.aiRejectCode ?? 'other'}`)
  }
  switch (key) {
    case 'unauth':
      return t('events.unauth')
    case 'validation':
      return t('events.errorValidation')
    case 'mapPin':
      return t('events.errorMapPin')
    case 'outsideKyiv':
      return t('events.errorOutsideKyiv')
    case 'past':
      return t('events.errorPast')
    case 'forbidden':
      return t('events.errorForbidden')
    case 'capacity':
      return t('events.errorMaxBelowJoined')
    case 'aiUnavailable':
      return t('events.aiUnavailable')
    case 'aiTimeout':
      return t('events.aiTimeout')
    case 'aiError':
      return t('events.aiError')
    case 'generic':
    default:
      return t('events.errorSave')
  }
}

function SubmitButton() {
  const { pending } = useFormStatus()
  const { t } = useLanguage()
  return (
    <button type="submit" className="events-form-submit" disabled={pending}>
      {pending ? t('events.updateSaving') : t('events.updateSubmit')}
    </button>
  )
}

export type EditEventFormEvent = {
  id: string
  title: string
  reason: string | null
  description: string | null
  startsAt: string
  maxParticipants: number | null
  latitude: number | null
  longitude: number | null
}

export default function EditEventForm({ event }: { event: EditEventFormEvent }) {
  const { t } = useLanguage()
  const router = useRouter()
  const [state, formAction] = useActionState(updateEventAction, initialState)

  const startsLocal = useMemo(() => isoToDatetimeLocalValue(event.startsAt), [event.startsAt])

  useEffect(() => {
    if (!state.success) return
    const tmr = window.setTimeout(() => {
      router.push('/events')
    }, 400)
    return () => window.clearTimeout(tmr)
  }, [state.success, router])

  return (
    <section className="events-create" aria-label={t('events.editHeading')}>
      {state.errorKey ? (
        <p className="register-form-alert" role="alert">
          {errorLabel(state, t)}
        </p>
      ) : null}

      {state.success ? (
        <p className="cabinet-success" role="status">
          {state.pendingModeration ? t('events.pendingModeration') : t('events.updated')}
        </p>
      ) : null}

      <form action={formAction} className="events-form">
        <input type="hidden" name="eventId" value={event.id} />
        <label className="register-form-field">
          <span>{t('events.fieldTitle')}</span>
          <input name="title" type="text" required minLength={2} maxLength={200} defaultValue={event.title} />
        </label>
        <label className="register-form-field">
          <span>{t('events.fieldReason')}</span>
          <input
            name="reason"
            type="text"
            maxLength={500}
            placeholder={t('events.fieldReasonPh')}
            defaultValue={event.reason ?? ''}
          />
        </label>
        <label className="register-form-field">
          <span>{t('events.fieldDescription')}</span>
          <textarea
            name="description"
            rows={3}
            maxLength={2000}
            placeholder={t('events.fieldDescriptionPh')}
            defaultValue={event.description ?? ''}
          />
        </label>
        <label className="register-form-field">
          <span>{t('events.fieldStartsAt')}</span>
          <input name="startsAt" type="datetime-local" required defaultValue={startsLocal} />
        </label>
        <div className="events-map-field-label">
          <span>{t('events.fieldMapLocation')}</span>
        </div>
        <EventLocationMapPicker initialLatitude={event.latitude} initialLongitude={event.longitude} />
        <label className="register-form-field">
          <span>{t('events.fieldMaxParticipants')}</span>
          <input
            name="maxParticipants"
            type="number"
            min={1}
            max={100000}
            step={1}
            placeholder={t('events.fieldMaxParticipantsPh')}
            defaultValue={event.maxParticipants ?? ''}
          />
        </label>
        <SubmitButton />
      </form>
    </section>
  )
}
