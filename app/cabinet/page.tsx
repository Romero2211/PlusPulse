import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import CabinetForm from '@/components/CabinetForm'
import { getSession } from '@/lib/session'
import { prisma } from '@/lib/prisma'

export const metadata: Metadata = {
  title: 'Кабінет | БО БФ «ПЛЮС ПУЛЬС»',
  description: 'Особистий кабінет волонтера / користувача сайту благодійного фонду «ПЛЮС ПУЛЬС».',
}

export default async function CabinetPage() {
  const session = await getSession()
  if (!session) {
    redirect('/login')
  }

  const [hostedEventsCount, participatedEventsCount] = await Promise.all([
    prisma.event.count({ where: { hostId: session.id } }),
    prisma.eventParticipant.count({ where: { userId: session.id } }),
  ])

  const user = await prisma.user.findUnique({
    where: { id: session.id },
    select: {
      email: true,
      name: true,
      bio: true,
      phone: true,
      city: true,
      avatarUrl: true,
    },
  })

  if (!user) {
    redirect('/login')
  }

  return (
    <>
      <Header />
      <main className="page-below-header cabinet-page">
        <div className="container">
          <CabinetForm
            initial={{
              ...user,
              stats: {
                hostedEventsCount,
                participatedEventsCount,
              },
            }}
          />
        </div>
      </main>
      <Footer />
    </>
  )
}
