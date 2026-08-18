'use client'

import { useActionState, useEffect, useRef } from 'react'
import { useFormStatus } from 'react-dom'
import { useLanguage } from '@/contexts/LanguageContext'
import {
  submitContactFeedbackAction,
  type ContactFeedbackFormState,
} from '@/app/feedback/actions'

const initialState: ContactFeedbackFormState = {}

function SubmitButton() {
  const { pending } = useFormStatus()
  const { t } = useLanguage()
  return (
    <button type="submit" className="contact-feedback-submit" disabled={pending}>
      {pending ? t('contact.feedbackPending') : t('contact.feedbackSubmit')}
    </button>
  )
}

export default function ContactFeedbackForm() {
  const { t } = useLanguage()
  const [state, formAction] = useActionState(submitContactFeedbackAction, initialState)
  const formRef = useRef<HTMLFormElement>(null)

  useEffect(() => {
    if ('success' in state && state.success) {
      formRef.current?.reset()
    }
  }, [state])

  return (
    <div className="contact-feedback">
      <h3 className="contact-feedback-title">{t('contact.feedbackTitle')}</h3>
      <p className="contact-feedback-lead">{t('contact.feedbackLead')}</p>

      {'error' in state && state.error === 'validation' ? (
        <p className="contact-feedback-alert" role="alert">
          {t('contact.feedbackErrorValidation')}
        </p>
      ) : null}
      {'error' in state && state.error === 'generic' ? (
        <p className="contact-feedback-alert" role="alert">
          {t('contact.feedbackErrorGeneric')}
        </p>
      ) : null}
      {'error' in state && state.error === 'rate_limit' ? (
        <p className="contact-feedback-alert" role="alert">
          {t('auth.rateLimit')}
        </p>
      ) : null}
      {'success' in state && state.success ? (
        <p className="contact-feedback-success" role="status">
          {t('contact.feedbackSuccess')}
        </p>
      ) : null}

      <form ref={formRef} action={formAction} className="contact-feedback-form">
        <label className="contact-feedback-field">
          <span>{t('contact.feedbackName')}</span>
          <input name="name" type="text" autoComplete="name" maxLength={120} />
        </label>
        <label className="contact-feedback-field">
          <span>{t('contact.feedbackEmail')}</span>
          <input name="email" type="email" autoComplete="email" maxLength={254} />
        </label>
        <label className="contact-feedback-field">
          <span>{t('contact.feedbackMessage')}</span>
          <textarea
            name="message"
            required
            rows={6}
            minLength={10}
            maxLength={4000}
            placeholder={t('contact.feedbackMessagePh')}
          />
        </label>
        <SubmitButton />
      </form>
    </div>
  )
}
