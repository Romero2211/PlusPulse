'use client'

import { useActionState, useEffect } from 'react'
import Link from 'next/link'
import {
  approvePendingEventAction,
  rejectPendingEventAction,
  adminDeleteEventAction,
  type AdminEventActionState,
} from '@/app/admin/events/actions'
import { useLanguage } from '@/contexts/LanguageContext'

export type AdminEventRow = {
  id: string
  title: string
  startsAt: Date
  location: string
  archivedAt: Date | null
  hostEmail: string
  participantCount: number
}

export type AdminPendingEventRow = {
  id: string
  kind: string
  targetEventId: string | null
  title: string
  reason: string | null
  description: string | null
  startsAt: Date
  location: string
  source: string
  serviceErrorReason: string | null
  hostEmail: string
  createdAt: Date
}

const initialAction: AdminEventActionState = {}

function formatDt(d: Date, locale: 'uk-UA' | 'en-GB'): string {
  try {
    return new Date(d).toLocaleString(locale, {
      dateStyle: 'short',
      timeStyle: 'short',
    })
  } catch {
    return String(d)
  }
}

export default function AdminEventsPanel({
  events,
  pending,
}: {
  events: AdminEventRow[]
  pending: AdminPendingEventRow[]
}) {
  const { t, language } = useLanguage()
  const loc: 'uk-UA' | 'en-GB' = language === 'en' ? 'en-GB' : 'uk-UA'

  const [approveState, approveAction] = useActionState(approvePendingEventAction, initialAction)
  const [rejectState, rejectAction] = useActionState(rejectPendingEventAction, initialAction)
  const [deleteState, deleteAction] = useActionState(adminDeleteEventAction, initialAction)

  useEffect(() => {
    if (approveState.success || rejectState.success || deleteState.success) {
      window.location.reload()
    }
  }, [approveState.success, rejectState.success, deleteState.success])

  const actionErr =
    approveState.error || rejectState.error || deleteState.error
      ? t('admin.events.actionError')
      : null

  return (
    <section className="admin-page">
      <div className="admin-page-head">
        <h1 className="admin-title">{t('admin.eventsTitle')}</h1>
        <Link className="admin-btn admin-btn-secondary" href="/admin">
          {t('admin.back')}
        </Link>
      </div>

      {actionErr ? (
        <p className="admin-alert" role="alert">
          {actionErr}
        </p>
      ) : null}

      <h2 className="admin-subtitle">{t('admin.eventsPendingHeading')}</h2>
      {pending.length === 0 ? (
        <p className="admin-empty">{t('admin.eventsPendingEmpty')}</p>
      ) : (
        <ul className="admin-list">
          {pending.map((p) => (
            <li key={p.id} className="admin-list-item admin-pending-item">
              <div className="admin-list-main">
                <strong>{p.title}</strong>
                <div className="admin-list-meta">
                  <span>
                    {p.kind === 'edit' ? t('admin.eventsPendingKindEdit') : t('admin.eventsPendingKindCreate')}
                  </span>
                  <span>·</span>
                  <span>{p.hostEmail}</span>
                  <span>·</span>
                  <span>{formatDt(p.startsAt, loc)}</span>
                  <span>·</span>
                  <span>
                    {p.source === 'ambiguous' ? t('admin.eventsSourceAmbiguous') : t('admin.eventsSourceService')}
                    {p.serviceErrorReason ? ` (${p.serviceErrorReason})` : ''}
                  </span>
                </div>
                <div className="admin-pending-detail">
                  <span>{p.location}</span>
                  {p.reason ? <span className="admin-mono">{p.reason}</span> : null}
                </div>
              </div>
              <div className="admin-pending-actions">
                <form action={approveAction}>
                  <input type="hidden" name="id" value={p.id} />
                  <button type="submit" className="admin-btn">
                    {t('admin.eventsApprove')}
                  </button>
                </form>
                <form action={rejectAction}>
                  <input type="hidden" name="id" value={p.id} />
                  <button type="submit" className="admin-btn admin-btn-danger">
                    {t('admin.eventsReject')}
                  </button>
                </form>
              </div>
            </li>
          ))}
        </ul>
      )}

      <h2 className="admin-subtitle admin-subtitle-spaced">{t('admin.eventsListHeading')}</h2>
      {events.length === 0 ? (
        <p className="admin-empty">{t('admin.eventsListEmpty')}</p>
      ) : (
        <ul className="admin-list">
          {events.map((e) => (
            <li key={e.id} className="admin-list-item">
              <div className="admin-list-main">
                <strong>{e.title}</strong>
                <div className="admin-list-meta">
                  <span>{e.hostEmail}</span>
                  <span>·</span>
                  <span>{formatDt(e.startsAt, loc)}</span>
                  <span>·</span>
                  <span>
                    {e.participantCount} {t('admin.eventsParticipants')}
                  </span>
                  {e.archivedAt ? (
                    <>
                      <span>·</span>
                      <span>{t('admin.statusArchived')}</span>
                    </>
                  ) : null}
                </div>
                <div className="admin-mono admin-event-location">{e.location}</div>
              </div>
              <div className="admin-pending-actions">
                <Link className="admin-link" href={`/events/${e.id}`} target="_blank" rel="noopener noreferrer">
                  {t('admin.eventsOpen')}
                </Link>
                <form
                  action={deleteAction}
                  onSubmit={(ev) => {
                    if (!confirm(t('admin.eventsDeleteConfirm'))) ev.preventDefault()
                  }}
                >
                  <input type="hidden" name="eventId" value={e.id} />
                  <button type="submit" className="admin-btn admin-btn-danger">
                    {t('admin.eventsDelete')}
                  </button>
                </form>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
