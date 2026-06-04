'use server'

import { Prisma } from '@prisma/client'
import { z } from 'zod'
import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/session'
import { locationInfoFromCoordinates } from '@/lib/reverseGeocode'
import { isCoordinatesInKyiv } from '@/lib/kyivBounds'
import {
  reviewVolunteerEventWithGemini,
  type EventAiRejectCode,
  type EventAiReviewResult,
} from '@/lib/eventGeminiReview'

export type CreateEventFormState = {
  success?: boolean
  /** Заявка збережена для ручного схвалення адміном (збій AI або needs_review) */
  pendingModeration?: boolean
  errorKey?:
    | 'unauth'
    | 'validation'
    | 'mapPin'
    | 'outsideKyiv'
    | 'past'
    | 'generic'
    | 'forbidden'
    | 'capacity'
    | 'aiReject'
    | 'aiUnavailable'
    | 'aiTimeout'
    | 'aiError'
  /** Лише при errorKey === 'aiReject': код від перевірки (Gemini) */
  aiRejectCode?: EventAiRejectCode
}

export type { EventAiRejectCode }

export type DeleteEventFormState = {
  success?: boolean
  errorKey?: 'unauth' | 'forbidden' | 'generic'
}

export type ArchiveEventFormState = {
  success?: boolean
  errorKey?: 'unauth' | 'forbidden' | 'generic'
}

const schema = z.object({
  title: z.string().trim().min(2, '').max(200),
  reason: z.string().trim().max(500).optional(),
  description: z.string().trim().max(2000).optional(),
  startsAt: z.string().min(1),
})

function parseEventCoordinates(
  formData: FormData,
): { ok: true; lat: number | null; lng: number | null } | { ok: false } {
  const latRaw = formData.get('latitude')
  const lngRaw = formData.get('longitude')
  const latStr = typeof latRaw === 'string' ? latRaw.trim() : ''
  const lngStr = typeof lngRaw === 'string' ? lngRaw.trim() : ''

  if (latStr === '' && lngStr === '') {
    return { ok: true, lat: null, lng: null }
  }
  if (latStr === '' || lngStr === '') {
    return { ok: false }
  }

  const lat = Number(latStr)
  const lng = Number(lngStr)
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    return { ok: false }
  }
  if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
    return { ok: false }
  }

  return { ok: true, lat, lng }
}

function parseRequiredMapCoordinates(
  formData: FormData,
): { ok: true; lat: number; lng: number } | { ok: false } {
  const r = parseEventCoordinates(formData)
  if (!r.ok || r.lat === null || r.lng === null) {
    return { ok: false }
  }
  return { ok: true, lat: r.lat, lng: r.lng }
}

function parseMaxParticipantsField(raw: FormDataEntryValue | null): { ok: true; value: number | null } | { ok: false } {
  if (raw === null || raw === undefined) {
    return { ok: true, value: null }
  }
  const s = typeof raw === 'string' ? raw.trim() : ''
  if (s === '') {
    return { ok: true, value: null }
  }
  const n = Number(s)
  if (!Number.isInteger(n) || n < 1 || n > 100_000) {
    return { ok: false }
  }
  return { ok: true, value: n }
}

export type JoinLeaveFormState = {
  success?: boolean
  errorKey?: 'unauth' | 'host' | 'full' | 'already' | 'archived' | 'not_member' | 'generic'
}

function isEventArchivedNow(event: { archivedAt: Date | null; startsAt: Date }): boolean {
  if (event.archivedAt) return true
  return event.startsAt.getTime() < Date.now() - 24 * 60 * 60 * 1000
}

type PendingPayload = {
  kind: 'create' | 'edit'
  targetEventId: string | null
  title: string
  reason: string | null
  description: string | null
  startsAt: Date
  location: string
  district: string | null
  latitude: number | null
  longitude: number | null
  maxParticipants: number | null
  hostId: string
  source: 'ambiguous' | 'service_error'
  serviceErrorReason: string | null
}

async function queueEventForAdminReview(data: PendingPayload): Promise<void> {
  await prisma.eventPendingApproval.create({
    data: {
      kind: data.kind,
      targetEventId: data.targetEventId,
      title: data.title,
      reason: data.reason,
      description: data.description,
      startsAt: data.startsAt,
      location: data.location,
      district: data.district,
      latitude: data.latitude,
      longitude: data.longitude,
      maxParticipants: data.maxParticipants,
      hostId: data.hostId,
      source: data.source,
      serviceErrorReason: data.serviceErrorReason,
    },
  })
  revalidatePath('/events')
  revalidatePath('/events/new')
  revalidatePath('/admin/events')
}

export async function createEventAction(
  _prev: CreateEventFormState,
  formData: FormData,
): Promise<CreateEventFormState> {
  const session = await getSession()
  if (!session) {
    return { errorKey: 'unauth' }
  }

  const maxParsed = parseMaxParticipantsField(formData.get('maxParticipants'))
  if (!maxParsed.ok) {
    return { errorKey: 'validation' }
  }

  const coords = parseRequiredMapCoordinates(formData)
  if (!coords.ok) {
    return { errorKey: 'mapPin' }
  }
  if (!isCoordinatesInKyiv(coords.lat, coords.lng)) {
    return { errorKey: 'outsideKyiv' }
  }

  const raw = {
    title: formData.get('title'),
    reason: formData.get('reason'),
    description: formData.get('description'),
    startsAt: formData.get('startsAt'),
  }

  const parsed = schema.safeParse({
    title: typeof raw.title === 'string' ? raw.title : '',
    reason: typeof raw.reason === 'string' ? raw.reason : '',
    description: typeof raw.description === 'string' ? raw.description : '',
    startsAt: typeof raw.startsAt === 'string' ? raw.startsAt : '',
  })

  if (!parsed.success) {
    return { errorKey: 'validation' }
  }

  const startsAt = new Date(parsed.data.startsAt)
  if (Number.isNaN(startsAt.getTime())) {
    return { errorKey: 'validation' }
  }

  if (startsAt.getTime() < Date.now() - 60_000) {
    return { errorKey: 'past' }
  }

  const reason = parsed.data.reason?.trim() || undefined
  const description = parsed.data.description?.trim() || undefined

  const aiVerdict: EventAiReviewResult = await reviewVolunteerEventWithGemini({
    title: parsed.data.title.trim(),
    reason: reason ?? null,
    description: description ?? null,
  })
  if (aiVerdict.type === 'reject') {
    return { errorKey: 'aiReject', aiRejectCode: aiVerdict.code }
  }

  const { label: locationLabel, districtKey } = await locationInfoFromCoordinates(coords.lat, coords.lng)

  if (aiVerdict.type === 'manual_review' || aiVerdict.type === 'service_error') {
    const source = aiVerdict.type === 'manual_review' ? 'ambiguous' : 'service_error'
    const serviceErrorReason = aiVerdict.type === 'service_error' ? aiVerdict.reason : null
    try {
      await queueEventForAdminReview({
        kind: 'create',
        targetEventId: null,
        title: parsed.data.title.trim(),
        reason: reason ? reason : null,
        description: description ? description : null,
        startsAt,
        location: locationLabel,
        district: districtKey,
        latitude: coords.lat,
        longitude: coords.lng,
        maxParticipants: maxParsed.value,
        hostId: session.id,
        source,
        serviceErrorReason,
      })
      return { success: true, pendingModeration: true }
    } catch {
      return { errorKey: 'generic' }
    }
  }

  try {
    await prisma.event.create({
      data: {
        title: parsed.data.title.trim(),
        reason: reason || null,
        description: description || null,
        location: locationLabel,
        district: districtKey,
        startsAt,
        maxParticipants: maxParsed.value,
        latitude: coords.lat,
        longitude: coords.lng,
        hostId: session.id,
      },
    })
    revalidatePath('/events')
    revalidatePath('/events/new')
    return { success: true }
  } catch {
    return { errorKey: 'generic' }
  }
}

export async function updateEventAction(
  _prev: CreateEventFormState,
  formData: FormData,
): Promise<CreateEventFormState> {
  const session = await getSession()
  if (!session) {
    return { errorKey: 'unauth' }
  }

  const eventIdRaw = formData.get('eventId')
  const eventId = typeof eventIdRaw === 'string' ? eventIdRaw.trim() : ''
  if (!eventId) {
    return { errorKey: 'validation' }
  }

  const maxParsed = parseMaxParticipantsField(formData.get('maxParticipants'))
  if (!maxParsed.ok) {
    return { errorKey: 'validation' }
  }

  const coords = parseRequiredMapCoordinates(formData)
  if (!coords.ok) {
    return { errorKey: 'mapPin' }
  }
  if (!isCoordinatesInKyiv(coords.lat, coords.lng)) {
    return { errorKey: 'outsideKyiv' }
  }

  let existing
  try {
    existing = await prisma.event.findUnique({
      where: { id: eventId },
      include: { _count: { select: { participants: true } } },
    })
  } catch {
    return { errorKey: 'generic' }
  }

  if (!existing) {
    return { errorKey: 'forbidden' }
  }
  if (existing.hostId !== session.id) {
    return { errorKey: 'forbidden' }
  }

  if (maxParsed.value !== null && maxParsed.value < existing._count.participants) {
    return { errorKey: 'capacity' }
  }

  const raw = {
    title: formData.get('title'),
    reason: formData.get('reason'),
    description: formData.get('description'),
    startsAt: formData.get('startsAt'),
  }

  const parsed = schema.safeParse({
    title: typeof raw.title === 'string' ? raw.title : '',
    reason: typeof raw.reason === 'string' ? raw.reason : '',
    description: typeof raw.description === 'string' ? raw.description : '',
    startsAt: typeof raw.startsAt === 'string' ? raw.startsAt : '',
  })

  if (!parsed.success) {
    return { errorKey: 'validation' }
  }

  const startsAt = new Date(parsed.data.startsAt)
  if (Number.isNaN(startsAt.getTime())) {
    return { errorKey: 'validation' }
  }

  const prevStart = existing.startsAt.getTime()
  const nextStart = startsAt.getTime()
  const startUnchanged = Math.abs(nextStart - prevStart) < 60_000
  if (!startUnchanged && nextStart < Date.now() - 60_000) {
    return { errorKey: 'past' }
  }

  const reason = parsed.data.reason?.trim() || undefined
  const description = parsed.data.description?.trim() || undefined

  const aiVerdict: EventAiReviewResult = await reviewVolunteerEventWithGemini({
    title: parsed.data.title.trim(),
    reason: reason ?? null,
    description: description ?? null,
  })
  if (aiVerdict.type === 'reject') {
    return { errorKey: 'aiReject', aiRejectCode: aiVerdict.code }
  }

  const { label: locationLabel, districtKey } = await locationInfoFromCoordinates(coords.lat, coords.lng)

  if (aiVerdict.type === 'manual_review' || aiVerdict.type === 'service_error') {
    const source = aiVerdict.type === 'manual_review' ? 'ambiguous' : 'service_error'
    const serviceErrorReason = aiVerdict.type === 'service_error' ? aiVerdict.reason : null
    try {
      await queueEventForAdminReview({
        kind: 'edit',
        targetEventId: eventId,
        title: parsed.data.title.trim(),
        reason: reason ? reason : null,
        description: description ? description : null,
        startsAt,
        location: locationLabel,
        district: districtKey,
        latitude: coords.lat,
        longitude: coords.lng,
        maxParticipants: maxParsed.value,
        hostId: session.id,
        source,
        serviceErrorReason,
      })
      return { success: true, pendingModeration: true }
    } catch {
      return { errorKey: 'generic' }
    }
  }

  try {
    await prisma.event.update({
      where: { id: eventId },
      data: {
        title: parsed.data.title.trim(),
        reason: reason || null,
        description: description || null,
        location: locationLabel,
        district: districtKey,
        startsAt,
        maxParticipants: maxParsed.value,
        latitude: coords.lat,
        longitude: coords.lng,
      },
    })
    revalidatePath('/events')
    revalidatePath('/events/new')
    revalidatePath(`/events/${eventId}`)
    revalidatePath(`/events/${eventId}/edit`)
    return { success: true }
  } catch {
    return { errorKey: 'generic' }
  }
}

export async function deleteEventAction(
  _prev: DeleteEventFormState,
  formData: FormData,
): Promise<DeleteEventFormState> {
  const session = await getSession()
  if (!session) {
    return { errorKey: 'unauth' }
  }

  const eventIdRaw = formData.get('eventId')
  const eventId = typeof eventIdRaw === 'string' ? eventIdRaw.trim() : ''
  if (!eventId) {
    return { errorKey: 'generic' }
  }

  let existing
  try {
    existing = await prisma.event.findUnique({ where: { id: eventId } })
  } catch {
    return { errorKey: 'generic' }
  }

  if (!existing) {
    return { errorKey: 'forbidden' }
  }
  if (existing.hostId !== session.id) {
    return { errorKey: 'forbidden' }
  }

  try {
    await prisma.event.delete({ where: { id: eventId } })
    revalidatePath('/events')
    revalidatePath('/events/new')
    revalidatePath(`/events/${eventId}`)
    revalidatePath(`/events/${eventId}/edit`)
    return { success: true }
  } catch {
    return { errorKey: 'generic' }
  }
}

export async function archiveEventAction(
  _prev: ArchiveEventFormState,
  formData: FormData,
): Promise<ArchiveEventFormState> {
  const session = await getSession()
  if (!session) {
    return { errorKey: 'unauth' }
  }

  const eventIdRaw = formData.get('eventId')
  const eventId = typeof eventIdRaw === 'string' ? eventIdRaw.trim() : ''
  if (!eventId) {
    return { errorKey: 'generic' }
  }

  const row = await prisma.event.findUnique({
    where: { id: eventId },
    select: { id: true, hostId: true, archivedAt: true },
  })
  if (!row) {
    return { errorKey: 'forbidden' }
  }
  if (row.hostId !== session.id) {
    return { errorKey: 'forbidden' }
  }
  if (row.archivedAt) {
    return { success: true }
  }

  try {
    await prisma.event.update({
      where: { id: eventId },
      data: { archivedAt: new Date() },
    })
    revalidatePath('/events')
    revalidatePath('/events/new')
    revalidatePath(`/events/${eventId}`)
    revalidatePath(`/events/${eventId}/edit`)
    return { success: true }
  } catch {
    return { errorKey: 'generic' }
  }
}

export async function joinEventAction(_prev: JoinLeaveFormState, formData: FormData): Promise<JoinLeaveFormState> {
  const session = await getSession()
  if (!session) {
    return { errorKey: 'unauth' }
  }

  const eventIdRaw = formData.get('eventId')
  const eventId = typeof eventIdRaw === 'string' ? eventIdRaw.trim() : ''
  if (!eventId) {
    return { errorKey: 'generic' }
  }

  try {
    const result = await prisma.$transaction(async (tx) => {
      const event = await tx.event.findUnique({
        where: { id: eventId },
        include: { _count: { select: { participants: true } } },
      })
      if (!event) {
        return 'generic' as const
      }
      if (isEventArchivedNow({ archivedAt: event.archivedAt, startsAt: event.startsAt })) {
        return 'archived' as const
      }
      if (event.hostId === session.id) {
        return 'host' as const
      }
      if (event.maxParticipants !== null && event._count.participants >= event.maxParticipants) {
        return 'full' as const
      }
      const existingJoin = await tx.eventParticipant.findUnique({
        where: { eventId_userId: { eventId, userId: session.id } },
      })
      if (existingJoin) {
        return 'already' as const
      }
      await tx.eventParticipant.create({
        data: { eventId, userId: session.id },
      })
      return 'ok' as const
    })

    if (result === 'ok') {
      revalidatePath('/events')
      revalidatePath('/events/new')
      revalidatePath(`/events/${eventId}`)
      revalidatePath(`/events/${eventId}/edit`)
      return { success: true }
    }
    return { errorKey: result }
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
      return { errorKey: 'already' }
    }
    return { errorKey: 'generic' }
  }
}

export async function leaveEventAction(_prev: JoinLeaveFormState, formData: FormData): Promise<JoinLeaveFormState> {
  const session = await getSession()
  if (!session) {
    return { errorKey: 'unauth' }
  }

  const eventIdRaw = formData.get('eventId')
  const eventId = typeof eventIdRaw === 'string' ? eventIdRaw.trim() : ''
  if (!eventId) {
    return { errorKey: 'generic' }
  }

  try {
    const deleted = await prisma.eventParticipant.deleteMany({
      where: { eventId, userId: session.id },
    })
    if (deleted.count === 0) {
      return { errorKey: 'not_member' }
    }
    revalidatePath('/events')
    revalidatePath('/events/new')
    revalidatePath(`/events/${eventId}`)
    revalidatePath(`/events/${eventId}/edit`)
    return { success: true }
  } catch {
    return { errorKey: 'generic' }
  }
}

const messageSchema = z.object({
  body: z.string().trim().min(1, '').max(2000),
})

export type EventMessageFormState = {
  success?: boolean
  errorKey?: 'unauth' | 'forbidden' | 'archived' | 'validation' | 'generic'
}

export async function postEventMessageAction(
  _prev: EventMessageFormState,
  formData: FormData,
): Promise<EventMessageFormState> {
  const session = await getSession()
  if (!session) {
    return { errorKey: 'unauth' }
  }

  const eventIdRaw = formData.get('eventId')
  const eventId = typeof eventIdRaw === 'string' ? eventIdRaw.trim() : ''
  if (!eventId) {
    return { errorKey: 'validation' }
  }

  const rawBody = formData.get('body')
  const parsed = messageSchema.safeParse({
    body: typeof rawBody === 'string' ? rawBody : '',
  })
  if (!parsed.success) {
    return { errorKey: 'validation' }
  }

  const event = await prisma.event.findUnique({
    where: { id: eventId },
    select: {
      hostId: true,
      startsAt: true,
      archivedAt: true,
      participants: {
        where: { userId: session.id },
        select: { id: true },
      },
    },
  })
  if (!event) {
    return { errorKey: 'forbidden' }
  }
  if (isEventArchivedNow({ archivedAt: event.archivedAt, startsAt: event.startsAt })) {
    return { errorKey: 'archived' }
  }
  const allowed = event.hostId === session.id || event.participants.length > 0
  if (!allowed) {
    return { errorKey: 'forbidden' }
  }

  try {
    await prisma.eventMessage.create({
      data: {
        eventId,
        userId: session.id,
        body: parsed.data.body,
      },
    })
    revalidatePath(`/events/${eventId}`)
    revalidatePath('/events')
    return { success: true }
  } catch {
    return { errorKey: 'generic' }
  }
}
