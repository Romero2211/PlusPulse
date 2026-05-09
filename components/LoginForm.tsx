'use client'

import { useActionState } from 'react'
import { useFormStatus } from 'react-dom'
import Link from 'next/link'
import { useLanguage } from '@/contexts/LanguageContext'
import { loginAction, type LoginFormState } from '@/app/auth/actions'

const initialState: LoginFormState = {}

function errorLabel(key: LoginFormState['errorKey'], t: (k: string) => string): string {
  switch (key) {
    case 'email':
      return t('login.errorEmail')
    case 'invalid':
      return t('login.errorInvalid')
    case 'generic':
    default:
      return t('login.errorGeneric')
  }
}

function SubmitButton() {
  const { pending } = useFormStatus()
  const { t } = useLanguage()
  return (
    <button type="submit" className="register-form-submit" disabled={pending}>
      {pending ? t('login.pending') : t('login.submit')}
    </button>
  )
}

type LoginFormProps = {
  /** `modal` — форма в модалці (наприклад з хедера); `page` — повна сторінка */
  variant?: 'page' | 'modal'
  /** Перед переходом на реєстрацію (закрити модалку) */
  onBeforeRegister?: () => void
  /** `id` заголовка для aria-labelledby у модалці */
  titleId?: string
}

export default function LoginForm({ variant = 'page', onBeforeRegister, titleId }: LoginFormProps) {
  const { t } = useLanguage()
  const [state, formAction] = useActionState(loginAction, initialState)

  const TitleTag = variant === 'modal' ? 'h2' : 'h1'

  return (
    <div className={`register-form-card${variant === 'modal' ? ' register-form-card--modal' : ''}`}>
      <TitleTag className="register-form-title" id={titleId}>
        {t('login.title')}
      </TitleTag>
      <p className="register-form-subtitle">{t('login.subtitle')}</p>

      {state.errorKey ? (
        <p className="register-form-alert" role="alert">
          {errorLabel(state.errorKey, t)}
        </p>
      ) : null}

      <form action={formAction} className="register-form">
        <label className="register-form-field">
          <span>{t('login.email')}</span>
          <input name="email" type="email" autoComplete="email" required maxLength={254} />
        </label>
        <label className="register-form-field">
          <span>{t('login.password')}</span>
          <input name="password" type="password" autoComplete="current-password" required />
        </label>
        <SubmitButton />
      </form>

      <p className="login-form-footer">
        <Link href="/register" onClick={() => onBeforeRegister?.()}>
          {t('login.linkRegister')}
        </Link>
      </p>
    </div>
  )
}
