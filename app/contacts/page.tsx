import Header from '@/components/Header'
import PageHero from '@/components/PageHero'
import Contact from '@/components/Contact'
import Footer from '@/components/Footer'

export const metadata = {
  title: 'Контакти | БО БФ «ПЛЮС ПУЛЬС»',
  description: 'Контактна інформація благодійного фонду «ПЛЮС ПУЛЬС».',
}

export default function ContactsPage() {
  return (
    <>
      <Header />
      <main className="page-below-header">
        <PageHero
          title="Контакти"
          description="Зв’яжіться з нами або надішліть побажання та зворотний зв’язок."
        />
        <Contact showFeedbackForm />
      </main>
      <Footer />
    </>
  )
}
