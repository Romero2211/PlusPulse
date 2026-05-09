'use client'

import { useActionState, useEffect, useState } from 'react'
import { useFormStatus } from 'react-dom'
import { useRouter } from 'next/navigation'
import { useLanguage } from '@/contexts/LanguageContext'
import { createEventAction, type CreateEventFormState } from '@/app/events/actions'
import EventLocationMapPicker from '@/components/EventLocationMapPicker'

const initialState: CreateEventFormState = {}

function SubmitButton() {
  const { pending } = useFormStatus()
  const { t } = useLanguage()
  return (
    <button type="submit" className="events-form-submit" disabled={pending}>
      {pending ? t('events.saving') : t('events.submit')}
    </button>
  )
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
      return t('events.errorGeneric')
  }
}

type CreateEventFormProps = {
  /** На окремій сторінці заголовок уже зовні — не дублювати h2 і lead */
  hideIntro?: boolean
}

export default function CreateEventForm({ hideIntro }: CreateEventFormProps) {
  const { t } = useLanguage()
  const router = useRouter()
  const [state, formAction] = useActionState(createEventAction, initialState)
  const [minDt, setMinDt] = useState('')

  useEffect(() => {
    const d = new Date()
    const pad = (n: number) => String(n).padStart(2, '0')
    setMinDt(
      `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`,
    )
  }, [])

  useEffect(() => {
    if (!state.success) return
    const tmr = window.setTimeout(() => {
      router.push('/events')
    }, 400)
    return () => window.clearTimeout(tmr)
  }, [state.success, router])

  return (
    <section
      className="events-create"
      aria-labelledby={hideIntro ? undefined : 'events-create-heading'}
      aria-label={hideIntro ? t('events.createHeading') : undefined}
    >
      {hideIntro ? null : (
        <>
          <h2 id="events-create-heading" className="events-create-title">
            {t('events.createHeading')}
          </h2>
          <p className="events-create-lead">{t('events.createLead')}</p>
        </>
      )}

      {state.errorKey ? (
        <p className="register-form-alert" role="alert">
          {errorLabel(state, t)}
        </p>
      ) : null}

      {state.success ? (
        <p className="cabinet-success" role="status">
          {state.pendingModeration ? t('events.pendingModeration') : t('events.created')}
        </p>
      ) : null}

      <form action={formAction} className="events-form">
        <label className="register-form-field">
          <span>{t('events.fieldTitle')}</span>
          <input name="title" type="text" required minLength={2} maxLength={200} />
        </label>
        <label className="register-form-field">
          <span>{t('events.fieldReason')}</span>
          <input name="reason" type="text" maxLength={500} placeholder={t('events.fieldReasonPh')} />
        </label>
        <label className="register-form-field">
          <span>{t('events.fieldDescription')}</span>
          <textarea name="description" rows={3} maxLength={2000} placeholder={t('events.fieldDescriptionPh')} />
        </label>
        <label className="register-form-field">
          <span>{t('events.fieldStartsAt')}</span>
          <input name="startsAt" type="datetime-local" required min={minDt || undefined} />
        </label>
        <div className="events-map-field-label">
          <span>{t('events.fieldMapLocation')}</span>
        </div>
        <EventLocationMapPicker />
        <label className="register-form-field">
          <span>{t('events.fieldMaxParticipants')}</span>
          <input
            name="maxParticipants"
            type="number"
            min={1}
            max={100000}
            step={1}
            placeholder={t('events.fieldMaxParticipantsPh')}
          />
        </label>
        <SubmitButton />
      </form>
    </section>
  )
}
