'use client'

import { useActionState, useEffect, useRef } from 'react'
import {
  addFundraiserReportAction,
  deleteFundraiserReportAction,
  type AdminFundraiserReportFormState,
} from '@/app/admin/fundraisers/actions'
import { formatMoneyUAH } from '@/lib/fundraisers'
import { useLanguage } from '@/contexts/LanguageContext'

export type AdminFundraiserReportRow = {
  id: string
  occurredAtIso: string
  description: string
  amount: number
}

function toDateInputValue(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

function formatReportDate(iso: string, locale: 'uk' | 'en'): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  try {
    return d.toLocaleDateString(locale === 'en' ? 'en-GB' : 'uk-UA', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })
  } catch {
    return ''
  }
}

function reportErrorText(
  error: NonNullable<Extract<AdminFundraiserReportFormState, { error?: string }>['error']>,
  t: (k: string) => string,
): string {
  if (error === 'validation') return t('admin.reportErrValidation')
  if (error === 'not_found') return t('admin.reportErrNotFound')
  if (error === 'unauth') return t('admin.errUnauth')
  return t('admin.errGeneric')
}

export default function AdminFundraiserReportsPanel({
  fundraiserId,
  reports,
}: {
  fundraiserId: string
  reports: AdminFundraiserReportRow[]
}) {
  const { t, language } = useLanguage()
  const locale = language === 'en' ? 'en' : 'uk'
  const addFormRef = useRef<HTMLFormElement>(null)

  const [addState, addAction] = useActionState(addFundraiserReportAction, {} as AdminFundraiserReportFormState)
  const [deleteState, deleteAction] = useActionState(deleteFundraiserReportAction, {} as AdminFundraiserReportFormState)

  useEffect(() => {
    if (addState && 'success' in addState && addState.success) {
      addFormRef.current?.reset()
    }
  }, [addState])

  const todayDefault = toDateInputValue(new Date().toISOString())

  return (
    <section className="admin-form-card admin-reports-panel">
      <h2 className="admin-subtitle">{t('admin.reportsTitle')}</h2>
      <p className="admin-hint admin-reports-lead">{t('admin.reportsLead')}</p>

      {addState && 'success' in addState && addState.success ? (
        <p className="admin-success" role="status">
          {t('admin.reportAdded')}
        </p>
      ) : null}
      {addState && 'error' in addState && addState.error ? (
        <p className="admin-alert" role="alert">
          {reportErrorText(addState.error, t)}
        </p>
      ) : null}
      {deleteState && 'error' in deleteState && deleteState.error ? (
        <p className="admin-alert" role="alert">
          {reportErrorText(deleteState.error, t)}
        </p>
      ) : null}

      {reports.length === 0 ? (
        <p className="admin-empty admin-reports-empty">{t('admin.reportsEmpty')}</p>
      ) : (
        <ul className="admin-reports-list">
          {reports.map((r) => (
            <li key={r.id} className="admin-reports-item">
              <div className="admin-reports-item-main">
                <span className="admin-reports-date">{formatReportDate(r.occurredAtIso, locale)}</span>
                <span className="admin-reports-desc">{r.description}</span>
                <span className={`admin-reports-amount ${r.amount < 0 ? 'admin-reports-amount--expense' : ''}`}>
                  {r.amount < 0 ? '− ' : '+ '}
                  {formatMoneyUAH(Math.abs(r.amount), locale)} ₴
                </span>
              </div>
              <form
                action={deleteAction}
                className="admin-reports-delete-form"
                onSubmit={(e) => {
                  if (!window.confirm(t('admin.reportDeleteConfirm'))) {
                    e.preventDefault()
                  }
                }}
              >
                <input type="hidden" name="reportId" value={r.id} />
                <input type="hidden" name="fundraiserId" value={fundraiserId} />
                <button type="submit" className="admin-btn admin-btn-danger admin-btn-sm">
                  {t('admin.reportDelete')}
                </button>
              </form>
            </li>
          ))}
        </ul>
      )}

      <h3 className="admin-reports-form-title">{t('admin.reportAddTitle')}</h3>
      <form ref={addFormRef} action={addAction} className="admin-form admin-reports-form">
        <input type="hidden" name="fundraiserId" value={fundraiserId} />

        <label className="admin-field">
          <span>{t('admin.reportFieldDate')}</span>
          <input name="occurredAt" type="date" defaultValue={todayDefault} required />
        </label>

        <label className="admin-field">
          <span>{t('admin.reportFieldDescription')}</span>
          <input name="description" type="text" maxLength={500} required placeholder={t('admin.reportFieldDescriptionPh')} />
        </label>

        <label className="admin-field">
          <span>{t('admin.reportFieldAmount')}</span>
          <input name="amount" type="text" inputMode="numeric" required placeholder="48900" />
          <small className="admin-hint">{t('admin.reportFieldAmountHint')}</small>
        </label>

        <label className="admin-field admin-inline">
          <input name="isExpense" type="checkbox" value="1" defaultChecked />
          <span>{t('admin.reportFieldExpense')}</span>
        </label>

        <button type="submit" className="admin-btn">
          {t('admin.reportAddSubmit')}
        </button>
      </form>
    </section>
  )
}
