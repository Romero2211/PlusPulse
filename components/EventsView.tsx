'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'
import { useLanguage } from '@/contexts/LanguageContext'
import EventArchiveForm from '@/components/EventArchiveForm'
import EventDeleteForm from '@/components/EventDeleteForm'
import EventJoinForm from '@/components/EventJoinForm'
import EventLeaveForm from '@/components/EventLeaveForm'

export type EventListItem = {
  id: string
  title: string
  reason: string | null
  description: string | null
  startsAt: string
  location: string
  latitude: number | null
  longitude: number | null
  hostDisplay: string
  participantsCount: number
  maxParticipants: number | null
  isMine: boolean
  isJoined: boolean
  isArchived: boolean
}

function formatStarts(iso: string, locale: string): string {
  try {
    const d = new Date(iso)
    return d.toLocaleString(locale === 'en' ? 'en-GB' : 'uk-UA', {
      dateStyle: 'medium',
      timeStyle: 'short',
    })
  } catch {
    return iso
  }
}

function formatParticipantsLine(
  count: number,
  max: number | null,
  t: (k: string) => string,
  lang: string,
): string {
  if (max == null) {
    return `${count} ${t('events.participants')}`
  }
  return lang === 'en' ? `${count} of ${max} ${t('events.participants')}` : `${count} з ${max} ${t('events.participants')}`
}

/** Local calendar date as YYYY-MM-DD */
function formatLocalYmd(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const da = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${da}`
}

function trimFilterDate(s: string): string | null {
  const trimmed = s.trim()
  return trimmed === '' ? null : trimmed
}

function filterEventsByDateRange(
  items: EventListItem[],
  fromYmd: string | null,
  toYmd: string | null,
): EventListItem[] {
  if (!fromYmd && !toYmd) {
    return items
  }
  const fromMs = fromYmd ? new Date(`${fromYmd}T00:00:00`).getTime() : -Infinity
  const toMs = toYmd ? new Date(`${toYmd}T23:59:59.999`).getTime() : Infinity
  return items.filter((e) => {
    const ms = new Date(e.startsAt).getTime()
    return ms >= fromMs && ms <= toMs
  })
}

export default function EventsView({ events, isLoggedIn }: { events: EventListItem[]; isLoggedIn: boolean }) {
  const { t, language } = useLanguage()
  const locale = language === 'en' ? 'en' : 'uk'

  const todayYmd = formatLocalYmd(new Date())

  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')

  const normFrom = trimFilterDate(fromDate)
  const normTo = trimFilterDate(toDate)

  const minToInput = normFrom !== null && normFrom >= todayYmd ? normFrom : todayYmd
  const fromMaxInput = normTo !== null && normTo >= todayYmd ? normTo : undefined

  const handleFromChange = (next: string) => {
    if (next !== '' && next < todayYmd) {
      return
    }
    setFromDate(next)
    setToDate((prevTo) => {
      if (!next || prevTo === '') return prevTo
      if (prevTo < next) return next
      return prevTo
    })
  }

  const handleToChange = (next: string) => {
    if (next === '') {
      setToDate('')
      return
    }
    const floor =
      fromDate !== '' ? (fromDate >= todayYmd ? fromDate : todayYmd) : todayYmd
    setToDate(next < floor ? floor : next)
  }

  const { activeEvents, archivedEvents } = useMemo(() => {
    const active: EventListItem[] = []
    const archived: EventListItem[] = []
    for (const e of events) {
      ;(e.isArchived ? archived : active).push(e)
    }
    return { activeEvents: active, archivedEvents: archived }
  }, [events])

  const filteredActiveEvents = useMemo(
    () => filterEventsByDateRange(activeEvents, normFrom, normTo),
    [activeEvents, normFrom, normTo],
  )
  const filtersActive = Boolean(normFrom || normTo)

  const filterCountLabel = t('events.filterCount')
    .replace('{shown}', String(filteredActiveEvents.length))
    .replace('{total}', String(activeEvents.length))

  const filterRulesId = 'events-filter-date-rules'

  return (
    <>
      <h1 className="events-page-title">{t('events.pageTitle')}</h1>
      <p className="events-page-lead">
        {isLoggedIn ? t('events.pageLeadAuthed') : t('events.pageLead')}
      </p>

      {!isLoggedIn ? <p className="events-login-hint">{t('events.loginToCreate')}</p> : null}

      <div className="events-layout">
        <div className="events-layout-main">
          <section className="events-list-section" aria-labelledby="events-list-heading">
            <h2 id="events-list-heading" className="events-list-title">
              {t('events.listHeading')}
            </h2>

            {events.length > 0 ? (
              <div className="events-date-filter" role="search" aria-label={t('events.filterAria')}>
                <div className="events-date-filter-fields">
                  <label className="events-date-filter-field">
                    <span>{t('events.filterDateFrom')}</span>
                    <input
                      type="date"
                      aria-describedby={filterRulesId}
                      min={todayYmd}
                      max={fromMaxInput}
                      value={fromDate}
                      onChange={(e) => handleFromChange(e.target.value)}
                      className="events-date-filter-input"
                    />
                  </label>
                  <label className="events-date-filter-field">
                    <span>{t('events.filterDateTo')}</span>
                    <input
                      type="date"
                      aria-describedby={filterRulesId}
                      min={minToInput}
                      value={toDate}
                      onChange={(e) => handleToChange(e.target.value)}
                      className="events-date-filter-input"
                    />
                  </label>
                </div>
                <div className="events-date-filter-actions">
                  {filtersActive ? (
                    <button
                      type="button"
                      className="events-date-filter-clear"
                      onClick={() => {
                        setFromDate('')
                        setToDate('')
                      }}
                    >
                      {t('events.filterClear')}
                    </button>
                  ) : null}
                  {filtersActive ? <p className="events-filter-count">{filterCountLabel}</p> : null}
                </div>
              </div>
            ) : null}

            {events.length === 0 ? (
              <p className="events-empty">{t('events.empty')}</p>
            ) : filteredActiveEvents.length === 0 ? (
              <p className="events-empty">{t('events.filterNoResults')}</p>
            ) : (
              <ul className="events-cards">
                {filteredActiveEvents.map((e) => (
                  <li key={e.id} className="events-card">
                    <h3 className="events-card-title">
                      <Link href={`/events/${e.id}`} className="events-card-title-link">
                        {e.title}
                      </Link>
                    </h3>
                    <p className="events-card-meta">
                      <time dateTime={e.startsAt}>{formatStarts(e.startsAt, locale)}</time>
                      {' · '}
                      <span>{e.location}</span>
                    </p>
                    {e.latitude != null && e.longitude != null ? (
                      <p className="events-card-map-link-wrap">
                        <a
                          className="events-card-map-link"
                          href={`https://www.openstreetmap.org/?mlat=${e.latitude}&mlon=${e.longitude}#map=15/${e.latitude}/${e.longitude}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {t('events.openOnMap')}
                        </a>
                      </p>
                    ) : null}
                    {e.reason ? <p className="events-card-reason">{e.reason}</p> : null}
                    {e.description ? <p className="events-card-desc">{e.description}</p> : null}
                    <p className="events-card-host">
                      {t('events.host')}: <strong>{e.hostDisplay}</strong>
                      <span className="events-card-count">
                        {' '}
                        · {formatParticipantsLine(e.participantsCount, e.maxParticipants, t, locale)}
                      </span>
                    </p>
                    {isLoggedIn && !e.isMine ? (
                      <div className="events-card-join-row">
                        {e.isJoined ? (
                          <EventLeaveForm eventId={e.id} />
                        ) : (
                          <EventJoinForm
                            eventId={e.id}
                            disabled={
                              e.maxParticipants !== null && e.participantsCount >= e.maxParticipants
                            }
                          />
                        )}
                      </div>
                    ) : null}
                    {e.isMine ? (
                      <div className="events-card-actions">
                        <Link href={`/events/${e.id}/edit`} className="events-card-edit-btn">
                          {t('events.edit')}
                        </Link>
                        <EventArchiveForm eventId={e.id} />
                        <EventDeleteForm eventId={e.id} />
                      </div>
                    ) : null}
                  </li>
                ))}
              </ul>
            )}

            {archivedEvents.length > 0 ? (
              <details className="events-archived-details">
                <summary className="events-archived-summary">
                  {t('events.archivedHeading').replace('{count}', String(archivedEvents.length))}
                </summary>
                <ul className="events-cards events-cards-archived">
                  {archivedEvents.map((e) => (
                    <li key={e.id} className="events-card events-card-archived">
                      <h3 className="events-card-title">
                        <span className="events-card-title-link events-card-title-link--disabled" aria-disabled="true">
                          {e.title}
                        </span>
                      </h3>
                      <p className="events-card-meta">
                        <time dateTime={e.startsAt}>{formatStarts(e.startsAt, locale)}</time>
                        {' · '}
                        <span>{e.location}</span>
                        <span className="events-archived-badge">{t('events.archivedBadge')}</span>
                      </p>
                      {e.reason ? <p className="events-card-reason">{e.reason}</p> : null}
                      {e.description ? <p className="events-card-desc">{e.description}</p> : null}
                      <p className="events-card-host">
                        {t('events.host')}: <strong>{e.hostDisplay}</strong>
                        <span className="events-card-count">
                          {' '}
                          · {formatParticipantsLine(e.participantsCount, e.maxParticipants, t, locale)}
                        </span>
                      </p>
                      {e.isMine ? (
                        <div className="events-card-actions">
                          <EventDeleteForm eventId={e.id} />
                        </div>
                      ) : null}
                    </li>
                  ))}
                </ul>
              </details>
            ) : null}
          </section>
        </div>

        {isLoggedIn ? (
          <aside className="events-layout-aside" aria-label={t('events.asideLabel')}>
            <Link href="/events/new" className="events-create-side-btn">
              {t('events.createSideCta')}
            </Link>
          </aside>
        ) : null}
      </div>
    </>
  )
}
