'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/admin'

export type AdminEventActionState = { success?: boolean; error?: 'unauth' | 'not_found' | 'generic' }

export async function approvePendingEventAction(
  _prev: AdminEventActionState,
  formData: FormData,
): Promise<AdminEventActionState> {
  try {
    await requireAdmin()
  } catch {
    return { error: 'unauth' }
  }

  const idRaw = formData.get('id')
  const id = typeof idRaw === 'string' ? idRaw.trim() : ''
  if (!id) return { error: 'generic' }

  const row = await prisma.eventPendingApproval.findUnique({ where: { id } })
  if (!row) return { error: 'not_found' }

  try {
    if (row.kind === 'create') {
      await prisma.event.create({
        data: {
          title: row.title,
          reason: row.reason,
          description: row.description,
          startsAt: row.startsAt,
          location: row.location,
          district: row.district,
          latitude: row.latitude,
          longitude: row.longitude,
          maxParticipants: row.maxParticipants,
          hostId: row.hostId,
        },
      })
      await prisma.eventPendingApproval.delete({ where: { id } })
    } else {
      const targetId = row.targetEventId
      if (!targetId) return { error: 'generic' }
      const exists = await prisma.event.findUnique({ where: { id: targetId }, select: { id: true } })
      if (!exists) return { error: 'not_found' }
      await prisma.event.update({
        where: { id: targetId },
        data: {
          title: row.title,
          reason: row.reason,
          description: row.description,
          startsAt: row.startsAt,
          location: row.location,
          district: row.district,
          latitude: row.latitude,
          longitude: row.longitude,
          maxParticipants: row.maxParticipants,
        },
      })
      await prisma.eventPendingApproval.deleteMany({ where: { targetEventId: targetId } })
      revalidatePath(`/events/${targetId}`)
      revalidatePath(`/events/${targetId}/edit`)
    }
    revalidatePath('/events')
    revalidatePath('/events/new')
    revalidatePath('/admin/events')
    revalidatePath('/')
    return { success: true }
  } catch {
    return { error: 'generic' }
  }
}

export async function rejectPendingEventAction(
  _prev: AdminEventActionState,
  formData: FormData,
): Promise<AdminEventActionState> {
  try {
    await requireAdmin()
  } catch {
    return { error: 'unauth' }
  }

  const idRaw = formData.get('id')
  const id = typeof idRaw === 'string' ? idRaw.trim() : ''
  if (!id) return { error: 'generic' }

  try {
    await prisma.eventPendingApproval.delete({ where: { id } })
    revalidatePath('/admin/events')
    return { success: true }
  } catch {
    return { error: 'not_found' }
  }
}

export async function adminDeleteEventAction(
  _prev: AdminEventActionState,
  formData: FormData,
): Promise<AdminEventActionState> {
  try {
    await requireAdmin()
  } catch {
    return { error: 'unauth' }
  }

  const eventIdRaw = formData.get('eventId')
  const eventId = typeof eventIdRaw === 'string' ? eventIdRaw.trim() : ''
  if (!eventId) return { error: 'generic' }

  try {
    await prisma.event.delete({ where: { id: eventId } })
    revalidatePath('/events')
    revalidatePath('/events/new')
    revalidatePath('/admin/events')
    revalidatePath('/')
    return { success: true }
  } catch {
    return { error: 'generic' }
  }
}
