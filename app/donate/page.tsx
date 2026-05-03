import Header from '@/components/Header'
import ProgramsPreview from '@/components/ProgramsPreview'
import Transparency from '@/components/Transparency'
import Donate from '@/components/Donate'
import Footer from '@/components/Footer'

export const metadata = {
  title: 'Допомогти | Програми, прозорість | БО БФ «ПЛЮС ПУЛЬС»',
  description: 'Програми та збори, прозорість та звітність, як зробити внесок — благодійний фонд «ПЛЮС ПУЛЬС».',
}

export default function DonatePage() {
  return (
    <>
      <Header />
      <main className="donate-page page-below-header">
        <section className="donate-page-hero" aria-label="Допомогти фонду">
          <div className="container">
            <h1 className="donate-page-hero-title">Допомогти фонду</h1>
            <p className="donate-page-hero-desc">
              Ознайомтесь з нашими програмами, звітністю та способами підтримки.
            </p>
          </div>
        </section>
        <ProgramsPreview />
        <Transparency />
        <Donate />
      </main>
      <Footer />
    </>
  )
}
