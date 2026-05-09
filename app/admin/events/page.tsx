import type { Metadata } from 'next'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import AdminEventsPanel from '@/components/admin/AdminEventsPanel'
import { requireAdmin } from '@/lib/admin'
import { prisma } from '@/lib/prisma'

export const metadata: Metadata = {
  title: 'Адмін · Заходи',
  robots: { index: false, follow: false },
}

export default async function AdminEventsPage() {
  await requireAdmin()

  const [events, pending] = await Promise.all([
    prisma.event.findMany({
      orderBy: { startsAt: 'desc' },
      take: 300,
      select: {
        id: true,
        title: true,
        startsAt: true,
        location: true,
        archivedAt: true,
        host: { select: { email: true } },
        _count: { select: { participants: true } },
      },
    }),
    prisma.eventPendingApproval.findMany({
      orderBy: { createdAt: 'desc' },
      take: 100,
      include: { host: { select: { email: true } } },
    }),
  ])

  return (
    <>
      <Header />
      <main className="page-below-header">
        <div className="container">
          <AdminEventsPanel
            events={events.map((e) => ({
              id: e.id,
              title: e.title,
              startsAt: e.startsAt,
              location: e.location,
              archivedAt: e.archivedAt,
              hostEmail: e.host.email,
              participantCount: e._count.participants,
            }))}
            pending={pending.map((p) => ({
              id: p.id,
              kind: p.kind,
              targetEventId: p.targetEventId,
              title: p.title,
              reason: p.reason,
              description: p.description,
              startsAt: p.startsAt,
              location: p.location,
              source: p.source,
              serviceErrorReason: p.serviceErrorReason,
              hostEmail: p.host.email,
              createdAt: p.createdAt,
            }))}
          />
        </div>
      </main>
      <Footer />
    </>
  )
}
