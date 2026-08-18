'use client'

import { useActionState } from 'react'
import { useFormStatus } from 'react-dom'
import Link from 'next/link'
import { useLanguage } from '@/contexts/LanguageContext'
import { loginAction, type LoginFormState } from '@/app/auth/actions'
import GoogleSignInButton from '@/components/GoogleSignInButton'

const initialState: LoginFormState = {}

function errorLabel(key: LoginFormState['errorKey'], t: (k: string) => string): string {
  switch (key) {
    case 'email':
      return t('login.errorEmail')
    case 'rate_limit':
      return t('auth.rateLimit')
    case 'invalid':
      return t('login.errorInvalid')
    case 'generic':
    default:
      return t('login.errorGeneric')
  }
}

function oauthRedirectLabel(code: string | undefined, t: (k: string) => string): string | null {
  if (!code) return null
  switch (code) {
    case 'not_configured':
      return t('auth.oauthNotConfigured')
    case 'denied':
      return t('auth.oauthDenied')
    case 'account_exists':
      return t('auth.oauthAccountExists')
    case 'account_mismatch':
      return t('auth.oauthAccountMismatch')
    case 'state':
    case 'invalid':
      return t('auth.oauthState')
    case 'failed':
    default:
      return t('auth.oauthFailed')
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
  googleAuthEnabled?: boolean
  oauthError?: string
}

export default function LoginForm({
  variant = 'page',
  onBeforeRegister,
  titleId,
  googleAuthEnabled = false,
  oauthError,
}: LoginFormProps) {
  const { t } = useLanguage()
  const [state, formAction] = useActionState(loginAction, initialState)

  const TitleTag = variant === 'modal' ? 'h2' : 'h1'
  const oauthAlert = oauthRedirectLabel(oauthError, t)

  return (
    <div className={`register-form-card${variant === 'modal' ? ' register-form-card--modal' : ''}`}>
      <TitleTag className="register-form-title" id={titleId}>
        {t('login.title')}
      </TitleTag>
      <p className="register-form-subtitle">{t('login.subtitle')}</p>

      {oauthAlert ? (
        <p className="register-form-alert" role="alert">
          {oauthAlert}
        </p>
      ) : null}

      {state.errorKey ? (
        <p className="register-form-alert" role="alert">
          {errorLabel(state.errorKey, t)}
        </p>
      ) : null}

      {googleAuthEnabled ? (
        <>
          <GoogleSignInButton />
          <p className="auth-divider">
            <span>{t('auth.orDivider')}</span>
          </p>
        </>
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
