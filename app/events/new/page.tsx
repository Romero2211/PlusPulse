import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import EventsNewView from '@/components/EventsNewView'
import { getSession } from '@/lib/session'

export const metadata: Metadata = {
  title: 'Новий захід | БО БФ «ПЛЮС ПУЛЬС»',
  description: 'Створення волонтерського заходу на сайті благодійного фонду «ПЛЮС ПУЛЬС».',
}

export default async function NewEventPage() {
  const session = await getSession()
  if (!session) {
    redirect('/login')
  }

  return (
    <>
      <Header />
      <main className="page-below-header events-page events-new-page">
        <div className="container">
          <EventsNewView />
        </div>
      </main>
      <Footer />
    </>
  )
}
