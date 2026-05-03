'use client'

import { useFormStatus } from 'react-dom'
import { useLanguage } from '@/contexts/LanguageContext'
import { registerAction, type RegisterFormState } from '@/app/register/actions'
import { useActionState } from 'react'

const initialState: RegisterFormState = {}

function errorLabel(key: RegisterFormState['errorKey'], t: (k: string) => string): string {
  switch (key) {
    case 'duplicate':
      return t('register.errorDuplicate')
    case 'mismatch':
      return t('register.errorMismatch')
    case 'short':
      return t('register.errorShort')
    case 'email':
      return t('register.errorEmail')
    case 'validation':
      return t('register.errorValidation')
    case 'generic':
    default:
      return t('register.errorGeneric')
  }
}

function SubmitButton() {
  const { pending } = useFormStatus()
  const { t } = useLanguage()
  return (
    <button type="submit" className="register-form-submit" disabled={pending}>
      {pending ? t('register.pending') : t('register.submit')}
    </button>
  )
}

export default function RegisterForm() {
  const { t } = useLanguage()
  const [state, formAction] = useActionState(registerAction, initialState)

  if (state.success) {
    return (
      <div className="register-form-card register-form-success" role="status">
        <h1 className="register-form-title">{t('register.title')}</h1>
        <p className="register-form-message">{t('register.success')}</p>
      </div>
    )
  }

  return (
    <div className="register-form-card">
      <h1 className="register-form-title">{t('register.title')}</h1>
      <p className="register-form-subtitle">{t('register.subtitle')}</p>

      {state.errorKey ? (
        <p className="register-form-alert" role="alert">
          {errorLabel(state.errorKey, t)}
        </p>
      ) : null}

      <form action={formAction} className="register-form">
        <label className="register-form-field">
          <span>{t('register.email')}</span>
          <input name="email" type="email" autoComplete="email" required maxLength={254} />
        </label>
        <label className="register-form-field">
          <span>{t('register.name')}</span>
          <input name="name" type="text" autoComplete="name" maxLength={120} />
        </label>
        <label className="register-form-field">
          <span>{t('register.password')}</span>
          <input name="password" type="password" autoComplete="new-password" required minLength={8} />
        </label>
        <label className="register-form-field">
          <span>{t('register.confirmPassword')}</span>
          <input name="confirmPassword" type="password" autoComplete="new-password" required minLength={8} />
        </label>
        <SubmitButton />
      </form>
    </div>
  )
}
