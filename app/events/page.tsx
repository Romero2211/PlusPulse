import type { Metadata } from 'next'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import EventsView, { type EventListItem } from '@/components/EventsView'
import { getSession } from '@/lib/session'
import { prisma } from '@/lib/prisma'

export const metadata: Metadata = {
  title: 'Заходи | БО БФ «ПЛЮС ПУЛЬС»',
  description: 'Волонтерські заходи та зустрічі благодійного фонду «ПЛЮС ПУЛЬС».',
}

export default async function EventsPage() {
  const session = await getSession()

  const rows = await prisma.event.findMany({
    orderBy: { startsAt: 'asc' },
    include: {
      host: { select: { name: true, email: true } },
      _count: { select: { participants: true } },
    },
  })

  const joinedIds = new Set<string>()
  if (session) {
    const joins = await prisma.eventParticipant.findMany({
      where: { userId: session.id, eventId: { in: rows.map((r) => r.id) } },
      select: { eventId: true },
    })
    joins.forEach((j) => joinedIds.add(j.eventId))
  }

  const nowMs = Date.now()
  const autoArchiveMs = 24 * 60 * 60 * 1000

  const events: EventListItem[] = rows.map((e) => {
    const isArchived = Boolean(e.archivedAt) || e.startsAt.getTime() < nowMs - autoArchiveMs
    return {
    id: e.id,
    title: e.title,
    reason: e.reason,
    description: e.description,
    startsAt: e.startsAt.toISOString(),
    location: e.location,
    latitude: e.latitude,
    longitude: e.longitude,
    hostDisplay: e.host.name?.trim() || e.host.email,
    participantsCount: e._count.participants,
    maxParticipants: e.maxParticipants,
    isMine: !!session && e.hostId === session.id,
    isJoined: !!session && joinedIds.has(e.id),
      isArchived,
    }
  })

  return (
    <>
      <Header />
      <main className="page-below-header events-page">
        <div className="container">
          <EventsView events={events} isLoggedIn={!!session} />
        </div>
      </main>
      <Footer />
    </>
  )
}
