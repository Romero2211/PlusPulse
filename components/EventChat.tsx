'use client'

import Image from 'next/image'
import { useActionState, useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useLanguage } from '@/contexts/LanguageContext'
import {
  postEventMessageAction,
  type EventMessageFormState,
} from '@/app/events/actions'

export type ChatMemberPublic = {
  id: string
  displayName: string
  bio: string | null
  phone: string | null
  city: string | null
  avatarUrl: string | null
  isHost: boolean
  hostedEventsCount: number
  participatedEventsCount: number
}

export type ChatMessageWire = {
  id: string
  body: string
  createdAt: string
  authorId: string
}

function messageErrorLabel(key: EventMessageFormState['errorKey'], t: (k: string) => string): string {
  switch (key) {
    case 'unauth':
      return t('events.unauth')
    case 'forbidden':
      return t('events.chatErrorForbidden')
    case 'archived':
      return t('events.chatErrorArchived')
    case 'validation':
      return t('events.chatErrorValidation')
    case 'generic':
    default:
      return t('events.chatErrorGeneric')
  }
}

function formatMsgTime(iso: string, locale: string): string {
  try {
    return new Date(iso).toLocaleString(locale === 'en' ? 'en-GB' : 'uk-UA', {
      dateStyle: 'short',
      timeStyle: 'short',
    })
  } catch {
    return iso
  }
}

export default function EventChat({
  eventId,
  initialMessages,
  profilesById,
  currentUserId,
  isArchived,
}: {
  eventId: string
  initialMessages: ChatMessageWire[]
  profilesById: Record<string, ChatMemberPublic>
  currentUserId: string
  isArchived: boolean
}) {
  const { t, language } = useLanguage()
  const router = useRouter()
  const locale = language === 'en' ? 'en' : 'uk'
  const listRef = useRef<HTMLDivElement>(null)
  const formRef = useRef<HTMLFormElement>(null)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [state, formAction] = useActionState(postEventMessageAction, {} as EventMessageFormState)

  useEffect(() => {
    const el = listRef.current
    if (!el) return
    el.scrollTop = el.scrollHeight
  }, [initialMessages])

  useEffect(() => {
    if (!state.success) return
    formRef.current?.reset()
    router.refresh()
  }, [state.success, router])

  useEffect(() => {
    const id = window.setInterval(() => {
      router.refresh()
    }, 14_000)
    return () => window.clearInterval(id)
  }, [router])

  useEffect(() => {
    if (!selectedId) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSelectedId(null)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [selectedId])

  const selected = selectedId ? profilesById[selectedId] : null

  const initialFromLabel = (label: string): string => {
    const ch = (label || '').trim()[0]
    return ch ? ch.toUpperCase() : '?'
  }

  return (
    <section className="event-chat" aria-labelledby="event-chat-heading">
      <h2 id="event-chat-heading" className="event-chat-title">
        {t('events.chatHeading')}
      </h2>
      {isArchived ? (
        <p className="event-chat-archived-hint" role="status">
          {t('events.chatArchivedHint')}
        </p>
      ) : null}
      <div ref={listRef} className="event-chat-messages" role="log" aria-live="polite" aria-relevant="additions">
        {initialMessages.length === 0 ? (
          <p className="event-chat-empty">{t('events.chatEmpty')}</p>
        ) : (
          <ul className="event-chat-list">
            {initialMessages.map((m) => {
              const prof = profilesById[m.authorId]
              const label = prof?.displayName ?? t('events.memberFallback')
              const isSelf = m.authorId === currentUserId
              return (
                <li
                  key={m.id}
                  className={`event-chat-msg ${isSelf ? 'event-chat-msg--mine' : 'event-chat-msg--other'}`}
                >
                  <div className="event-chat-msg-row">
                    {!isSelf ? (
                      <button
                        type="button"
                        className="event-chat-avatar"
                        aria-label={t('events.openParticipantCard').replace('{name}', label)}
                        onClick={() => prof && setSelectedId(prof.id)}
                        disabled={!prof}
                      >
                        {prof?.avatarUrl ? (
                          <Image
                            src={prof.avatarUrl}
                            alt=""
                            width={32}
                            height={32}
                            className="event-chat-avatar-img"
                            unoptimized
                          />
                        ) : (
                          <div className="event-chat-avatar-fallback" aria-hidden>
                            {initialFromLabel(label)}
                          </div>
                        )}
                      </button>
                    ) : null}
                    <div className="event-chat-bubble">
                    <div className="event-chat-msg-head">
                      <button
                        type="button"
                        className="event-chat-author"
                        onClick={() => prof && setSelectedId(prof.id)}
                        disabled={!prof}
                      >
                        {label}
                        {isSelf ? <span className="event-chat-you"> {t('events.you')}</span> : null}
                      </button>
                      {prof?.isHost ? (
                        <span className="event-chat-host-badge">{t('events.participantBadgeHost')}</span>
                      ) : null}
                      <time className="event-chat-time" dateTime={m.createdAt}>
                        {formatMsgTime(m.createdAt, locale)}
                      </time>
                    </div>
                    <p className="event-chat-body">{m.body}</p>
                    </div>
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </div>

      <form ref={formRef} action={formAction} className="event-chat-form">
        <input type="hidden" name="eventId" value={eventId} />
        <textarea
          name="body"
          rows={3}
          maxLength={2000}
          className="event-chat-input"
          placeholder={t('events.chatPlaceholder')}
          aria-label={t('events.chatPlaceholder')}
          defaultValue=""
          required
          disabled={isArchived}
        />
        <div className="event-chat-form-row">
          <button type="submit" className="event-chat-send" disabled={isArchived}>
            {t('events.chatSend')}
          </button>
          {state.errorKey ? (
            <p className="event-chat-alert" role="alert">
              {messageErrorLabel(state.errorKey, t)}
            </p>
          ) : null}
        </div>
      </form>

      {selected ? (
        <div
          className="event-participant-sheet-backdrop"
          role="presentation"
          onClick={() => setSelectedId(null)}
        >
          <div
            className="event-participant-sheet"
            role="dialog"
            aria-modal="true"
            aria-labelledby="participant-sheet-title"
            onClick={(e) => e.stopPropagation()}
          >
            <button type="button" className="event-participant-sheet-close" onClick={() => setSelectedId(null)}>
              {t('events.closePanel')}
            </button>
            <div className="event-participant-sheet-inner">
              <div className="event-participant-avatar-wrap">
                {selected.avatarUrl ? (
                  <Image
                    src={selected.avatarUrl}
                    alt=""
                    width={96}
                    height={96}
                    className="event-participant-avatar-img"
                    unoptimized
                  />
                ) : (
                  <div className="event-participant-avatar-fallback" aria-hidden />
                )}
              </div>
              <h3 id="participant-sheet-title" className="event-participant-name">
                {selected.displayName}
                {selected.isHost ? (
                  <span className="event-chat-host-badge event-chat-host-badge-inline">
                    {' '}
                    · {t('events.participantBadgeHost')}
                  </span>
                ) : null}
              </h3>
              {selected.city ? (
                <p className="event-participant-line">
                  <span className="event-participant-k">{t('events.participantCity')}: </span>
                  {selected.city}
                </p>
              ) : null}
              {selected.phone ? (
                <p className="event-participant-line">
                  <span className="event-participant-k">{t('events.participantPhone')}: </span>
                  {selected.phone}
                </p>
              ) : null}
              {selected.bio ? (
                <div className="event-participant-bio">
                  <p className="event-participant-k">{t('events.participantBio')}</p>
                  <p className="event-participant-bio-text">{selected.bio}</p>
                </div>
              ) : null}
              <div className="event-participant-stats" aria-label={t('events.participantStatsAria')}>
                <p className="event-participant-line">
                  <span className="event-participant-k">{t('events.participantStatsHosted')}: </span>
                  {selected.hostedEventsCount}
                </p>
                <p className="event-participant-line">
                  <span className="event-participant-k">{t('events.participantStatsParticipated')}: </span>
                  {selected.participatedEventsCount}
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  )
}
