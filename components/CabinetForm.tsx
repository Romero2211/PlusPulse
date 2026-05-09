'use client'

import { useActionState, useEffect } from 'react'
import Image from 'next/image'
import { useFormStatus } from 'react-dom'
import { useLanguage } from '@/contexts/LanguageContext'
import { updateCabinetProfileAction, type CabinetFormState } from '@/app/cabinet/actions'

export type CabinetProfileInitial = {
  email: string
  name: string | null
  bio: string | null
  phone: string | null
  city: string | null
  avatarUrl: string | null
  stats: {
    hostedEventsCount: number
    participatedEventsCount: number
  }
}

const initialState: CabinetFormState = {}

function phoneSuffixFromStored(phone: string | null): string {
  if (!phone) return ''
  const m = phone.match(/^\+380(\d{9})$/)
  return m ? m[1] : ''
}

function SubmitButton() {
  const { pending } = useFormStatus()
  const { t } = useLanguage()
  return (
    <button type="submit" className="cabinet-form-submit" disabled={pending}>
      {pending ? t('cabinet.saving') : t('cabinet.save')}
    </button>
  )
}

function errorLabel(key: CabinetFormState['errorKey'], t: (k: string) => string): string {
  switch (key) {
    case 'unauth':
      return t('cabinet.errorUnauth')
    case 'filesize':
      return t('cabinet.errorFilesize')
    case 'filetype':
      return t('cabinet.errorFiletype')
    case 'bio':
      return t('cabinet.errorBio')
    case 'phone':
      return t('cabinet.errorPhone')
    case 'generic':
    default:
      return t('cabinet.errorGeneric')
  }
}

export default function CabinetForm({ initial }: { initial: CabinetProfileInitial }) {
  const { t } = useLanguage()
  const [state, formAction] = useActionState(updateCabinetProfileAction, initialState)

  useEffect(() => {
    if (!state.success) return
    const timer = window.setTimeout(() => {
      window.location.reload()
    }, 600)
    return () => window.clearTimeout(timer)
  }, [state.success])

  return (
    <div className="cabinet-form-card">
      <h1 className="cabinet-page-title">{t('cabinet.pageTitle')}</h1>
      <p className="cabinet-page-lead">{t('cabinet.pageLead')}</p>

      <div className="cabinet-form-header">
        <div className="cabinet-profile-mini">
          <div className="cabinet-avatar-wrap">
            {initial.avatarUrl ? (
              <Image
                src={initial.avatarUrl}
                alt=""
                width={120}
                height={120}
                className="cabinet-avatar-img"
                unoptimized
              />
            ) : (
              <div className="cabinet-avatar-placeholder" aria-hidden>
                {initial.name?.[0]?.toUpperCase() ?? initial.email[0]?.toUpperCase() ?? '?'}
              </div>
            )}
          </div>
          <p className="cabinet-email">{initial.email}</p>
        </div>
        <section className="cabinet-stats" aria-label={t('cabinet.statsAria')}>
          <div className="cabinet-stat">
            <p className="cabinet-stat-k">{t('cabinet.statsHosted')}</p>
            <p
              className="cabinet-stat-v"
              aria-label={t('cabinet.statsHostedAria').replace('{count}', String(initial.stats.hostedEventsCount))}
            >
              {initial.stats.hostedEventsCount}
            </p>
          </div>
          <div className="cabinet-stat">
            <p className="cabinet-stat-k">{t('cabinet.statsParticipated')}</p>
            <p
              className="cabinet-stat-v"
              aria-label={t('cabinet.statsParticipatedAria').replace('{count}', String(initial.stats.participatedEventsCount))}
            >
              {initial.stats.participatedEventsCount}
            </p>
          </div>
        </section>
      </div>

      {state.errorKey ? (
        <p className="register-form-alert" role="alert">
          {errorLabel(state.errorKey, t)}
        </p>
      ) : null}

      {state.success ? (
        <p className="cabinet-success" role="status">
          {t('cabinet.saved')}
        </p>
      ) : null}

      <form action={formAction} className="cabinet-form">
        <label className="register-form-field">
          <span>{t('cabinet.displayName')}</span>
          <input name="displayName" type="text" maxLength={120} defaultValue={initial.name ?? ''} />
        </label>

        <label className="register-form-field">
          <span>{t('cabinet.bio')}</span>
          <textarea
            name="bio"
            rows={5}
            maxLength={1500}
            defaultValue={initial.bio ?? ''}
            placeholder={t('cabinet.bioPlaceholder')}
          />
          <span className="cabinet-field-hint">{t('cabinet.bioLimit')}</span>
        </label>

        <label className="register-form-field">
          <span>{t('cabinet.phone')}</span>
          <div className="cabinet-phone-row">
            <span className="cabinet-phone-prefix" aria-hidden>
              +380
            </span>
            <input
              name="phoneSuffix"
              type="tel"
              inputMode="numeric"
              autoComplete="tel-national"
              maxLength={9}
              pattern="[0-9]{9}"
              className="cabinet-phone-input"
              defaultValue={phoneSuffixFromStored(initial.phone)}
              placeholder="501234567"
              aria-label={t('cabinet.phoneDigitsAria')}
            />
          </div>
        </label>

        <label className="register-form-field">
          <span>{t('cabinet.city')}</span>
          <input name="city" type="text" maxLength={120} defaultValue={initial.city ?? ''} />
        </label>

        <label className="register-form-field">
          <span>{t('cabinet.avatar')}</span>
          <input name="avatar" type="file" accept="image/jpeg,image/png,image/webp" />
          <span className="cabinet-field-hint">{t('cabinet.avatarHint')}</span>
        </label>

        <SubmitButton />
      </form>
    </div>
  )
}
