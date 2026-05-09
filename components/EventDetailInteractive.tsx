'use client'

import Link from 'next/link'
import { useLanguage } from '@/contexts/LanguageContext'
import EventChat, {
  type ChatMemberPublic,
  type ChatMessageWire,
} from '@/components/EventChat'
import EventJoinForm from '@/components/EventJoinForm'
import EventLeaveForm from '@/components/EventLeaveForm'

export type EventDetailPayload = {
  id: string
  title: string
  reason: string | null
  description: string | null
  location: string
  latitude: number | null
  longitude: number | null
  startsAt: string
  maxParticipants: number | null
  participantsCount: number
  hostDisplay: string
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

export default function EventDetailInteractive({
  event,
  session,
  isHost,
  isJoined,
  profilesById,
  messages,
}: {
  event: EventDetailPayload
  session: { id: string } | null
  isHost: boolean
  isJoined: boolean
  profilesById: Record<string, ChatMemberPublic>
  messages: ChatMessageWire[]
}) {
  const { t, language } = useLanguage()
  const locale = language === 'en' ? 'en' : 'uk'
  const canChat = isHost || isJoined

  return (
    <>
      <nav className="event-detail-nav" aria-label={t('events.detailNavAria')}>
        <Link href="/events" className="event-detail-back">
          {t('events.detailBack')}
        </Link>
      </nav>

      <article className="event-detail-article">
        <header className="event-detail-header">
          <h1 className="events-page-title event-detail-title">{event.title}</h1>
          <p className="events-card-meta event-detail-meta">
            <time dateTime={event.startsAt}>{formatStarts(event.startsAt, locale)}</time>
            {' · '}
            <span>{event.location}</span>
          </p>
          {event.isArchived ? <p className="event-detail-archived">{t('events.archivedBadge')}</p> : null}
          {event.latitude != null && event.longitude != null ? (
            <p className="events-card-map-link-wrap">
              <a
                className="events-card-map-link"
                href={`https://www.openstreetmap.org/?mlat=${event.latitude}&mlon=${event.longitude}#map=15/${event.latitude}/${event.longitude}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                {t('events.openOnMap')}
              </a>
            </p>
          ) : null}
        </header>

        {event.reason ? <p className="events-card-reason">{event.reason}</p> : null}
        {event.description ? <p className="events-card-desc">{event.description}</p> : null}

        <p className="events-card-host">
          {t('events.host')}: <strong>{event.hostDisplay}</strong>
          <span className="events-card-count">
            {' '}
            · {formatParticipantsLine(event.participantsCount, event.maxParticipants, t, locale)}
          </span>
        </p>

        {session && !isHost && !event.isArchived ? (
          <div className="events-card-join-row event-detail-join">
            {isJoined ? (
              <EventLeaveForm eventId={event.id} />
            ) : (
              <EventJoinForm
                eventId={event.id}
                disabled={
                  event.maxParticipants !== null && event.participantsCount >= event.maxParticipants
                }
              />
            )}
          </div>
        ) : null}

        {isHost && !event.isArchived ? (
          <p className="event-detail-host-actions">
            <Link href={`/events/${event.id}/edit`} className="events-card-edit-btn">
              {t('events.edit')}
            </Link>
          </p>
        ) : null}
      </article>

      {session ? (
        canChat && session ? (
          <EventChat
            eventId={event.id}
            initialMessages={messages}
            profilesById={profilesById}
            currentUserId={session.id}
            isArchived={event.isArchived}
          />
        ) : !isHost ? (
          <section className="event-chat-gated" aria-live="polite">
            <p className="event-chat-guest-hint">{t('events.chatHintJoin')}</p>
          </section>
        ) : null
      ) : (
        <section className="event-chat-gated">
          <p className="event-chat-guest-hint">{t('events.chatHintLogin')}</p>
          <Link href="/login" className="events-card-edit-btn">
            {t('nav.login')}
          </Link>
        </section>
      )}
    </>
  )
}
