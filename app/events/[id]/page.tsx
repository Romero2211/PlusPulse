import type { Metadata } from 'next'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import EventDetailInteractive, { type EventDetailPayload } from '@/components/EventDetailInteractive'
import type { ChatMemberPublic, ChatMessageWire } from '@/components/EventChat'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/session'
import { notFound } from 'next/navigation'

type Props = { params: Promise<{ id: string }> }

function buildDisplayName(name: string | null, email: string): string {
  const n = name?.trim()
  if (n) return n
  const local = email.split('@')[0]?.trim()
  return local ?? '—'
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const { id } = await props.params
  const e = await prisma.event.findUnique({ where: { id }, select: { title: true } })
  if (!e) {
    return { title: 'Захід | БО БФ «ПЛЮС ПУЛЬС»' }
  }
  return {
    title: `${e.title} | Заходи | БО БФ «ПЛЮС ПУЛЬС»`,
    description: `Сторінка заходу «${e.title}»: опис і чат для учасників.`,
  }
}

export default async function EventDetailPage(props: Props) {
  const { id } = await props.params
  const session = await getSession()

  const row = await prisma.event.findUnique({
    where: { id },
    include: {
      host: {
        select: {
          id: true,
          name: true,
          email: true,
          bio: true,
          phone: true,
          city: true,
          avatarUrl: true,
        },
      },
      participants: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              bio: true,
              phone: true,
              city: true,
              avatarUrl: true,
            },
          },
        },
      },
    },
  })

  if (!row) {
    notFound()
  }

  const isHost = !!session && row.hostId === session.id
  const isJoined = !!session && row.participants.some((p) => p.userId === session.id)
  const canChat = isHost || isJoined

  const profilesMap = new Map<string, ChatMemberPublic>()
  profilesMap.set(row.host.id, {
    id: row.host.id,
    displayName: buildDisplayName(row.host.name, row.host.email),
    bio: row.host.bio,
    phone: row.host.phone,
    city: row.host.city,
    avatarUrl: row.host.avatarUrl,
    isHost: true,
    hostedEventsCount: 0,
    participatedEventsCount: 0,
  })
  for (const p of row.participants) {
    if (p.userId === row.hostId) continue
    const u = p.user
    profilesMap.set(u.id, {
      id: u.id,
      displayName: buildDisplayName(u.name, u.email),
      bio: u.bio,
      phone: u.phone,
      city: u.city,
      avatarUrl: u.avatarUrl,
      isHost: false,
      hostedEventsCount: 0,
      participatedEventsCount: 0,
    })
  }

  let messages: ChatMessageWire[] = []
  if (canChat && session) {
    const mRows = await prisma.eventMessage.findMany({
      where: { eventId: id },
      orderBy: { createdAt: 'asc' },
      take: 400,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            bio: true,
            phone: true,
            city: true,
            avatarUrl: true,
          },
        },
      },
    })
    for (const m of mRows) {
      const uid = m.user.id
      if (!profilesMap.has(uid)) {
        profilesMap.set(uid, {
          id: uid,
          displayName: buildDisplayName(m.user.name, m.user.email),
          bio: m.user.bio,
          phone: m.user.phone,
          city: m.user.city,
          avatarUrl: m.user.avatarUrl,
          isHost: uid === row.hostId,
          hostedEventsCount: 0,
          participatedEventsCount: 0,
        })
      }
    }
    messages = mRows.map((m) => ({
      id: m.id,
      body: m.body,
      createdAt: m.createdAt.toISOString(),
      authorId: m.userId,
    }))
  }

  if (profilesMap.size > 0) {
    const userIds = Array.from(profilesMap.keys())
    const [hosted, participated] = await Promise.all([
      prisma.event.groupBy({
        by: ['hostId'],
        where: { hostId: { in: userIds } },
        _count: { _all: true },
      }),
      prisma.eventParticipant.groupBy({
        by: ['userId'],
        where: { userId: { in: userIds } },
        _count: { _all: true },
      }),
    ])

    const hostedMap = new Map<string, number>(hosted.map((r) => [r.hostId, r._count._all]))
    const participatedMap = new Map<string, number>(participated.map((r) => [r.userId, r._count._all]))

    for (const [uid, prof] of profilesMap.entries()) {
      prof.hostedEventsCount = hostedMap.get(uid) ?? 0
      prof.participatedEventsCount = participatedMap.get(uid) ?? 0
    }
  }

  const profilesById: Record<string, ChatMemberPublic> = Object.fromEntries(profilesMap)

  const payload: EventDetailPayload = {
    id: row.id,
    title: row.title,
    reason: row.reason,
    description: row.description,
    location: row.location,
    latitude: row.latitude,
    longitude: row.longitude,
    startsAt: row.startsAt.toISOString(),
    maxParticipants: row.maxParticipants,
    participantsCount: row.participants.length,
    hostDisplay: buildDisplayName(row.host.name, row.host.email),
    isArchived: Boolean(row.archivedAt) || row.startsAt.getTime() < Date.now() - 24 * 60 * 60 * 1000,
  }

  return (
    <>
      <Header />
      <main className="page-below-header events-page event-detail-page">
        <div className="container">
          <EventDetailInteractive
            event={payload}
            session={session ? { id: session.id } : null}
            isHost={isHost}
            isJoined={isJoined}
            profilesById={profilesById}
            messages={messages}
          />
        </div>
      </main>
      <Footer />
    </>
  )
}
