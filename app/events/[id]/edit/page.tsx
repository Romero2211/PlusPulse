import type { Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import EditEventView from '@/components/EditEventView'
import type { EditEventFormEvent } from '@/components/EditEventForm'
import { getSession } from '@/lib/session'
import { prisma } from '@/lib/prisma'

export const metadata: Metadata = {
  title: 'Редагування заходу | БО БФ «ПЛЮС ПУЛЬС»',
  description: 'Редагування волонтерського заходу.',
  robots: { index: false, follow: false },
}

type Props = { params: Promise<{ id: string }> }

export default async function EditEventPage({ params }: Props) {
  const { id } = await params
  const session = await getSession()
  if (!session) {
    redirect('/login')
  }

  const row = await prisma.event.findUnique({
    where: { id },
    select: {
      id: true,
      title: true,
      reason: true,
      description: true,
      startsAt: true,
      archivedAt: true,
      maxParticipants: true,
      latitude: true,
      longitude: true,
      hostId: true,
    },
  })

  if (!row) {
    notFound()
  }
  if (row.hostId !== session.id) {
    redirect('/events')
  }
  const archivedNow = Boolean(row.archivedAt) || row.startsAt.getTime() < Date.now() - 24 * 60 * 60 * 1000
  if (archivedNow) {
    redirect('/events')
  }

  const event: EditEventFormEvent = {
    id: row.id,
    title: row.title,
    reason: row.reason,
    description: row.description,
    startsAt: row.startsAt.toISOString(),
    maxParticipants: row.maxParticipants,
    latitude: row.latitude,
    longitude: row.longitude,
  }

  return (
    <>
      <Header />
      <main className="page-below-header events-page events-new-page">
        <div className="container">
          <EditEventView event={event} />
        </div>
      </main>
      <Footer />
    </>
  )
}
