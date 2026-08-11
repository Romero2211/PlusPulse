import Header from '@/components/Header'
import PageHero from '@/components/PageHero'
import DonateFundraisersSection from '@/components/DonateFundraisersSection'
import Transparency from '@/components/Transparency'
import Donate from '@/components/Donate'
import Footer from '@/components/Footer'

export const metadata = {
  title: 'Допомогти | Програми, прозорість | БО БФ «ПЛЮС ПУЛЬС»',
  description: 'Програми та збори, прозорість та звітність, як зробити внесок — благодійний фонд «ПЛЮС ПУЛЬС».',
}

export const dynamic = 'force-dynamic'

export default function DonatePage() {
  return (
    <>
      <Header />
      <main className="donate-page page-below-header">
        <PageHero
          title="Допомогти фонду"
          description="Ознайомтесь з нашими програмами, звітністю та способами підтримки."
        />
        <DonateFundraisersSection />
        <Transparency />
        <Donate />
      </main>
      <Footer />
    </>
  )
}
