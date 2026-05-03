import Header from '@/components/Header'
import About from '@/components/About'
import Activities from '@/components/Activities'
import Mission from '@/components/Mission'
import Audience from '@/components/Audience'
import Footer from '@/components/Footer'

export const metadata = {
  title: 'Про нас | БО БФ «ПЛЮС ПУЛЬС»',
  description: 'Про благодійну організацію «Благодійний фонд «ПЛЮС ПУЛЬС» — напрями, місія, цільова аудиторія.',
}

export default function AboutPage() {
  return (
    <>
      <Header />
      <main className="page-below-header">
        <About />
        <Activities />
        <Mission />
        <Audience />
      </main>
      <Footer />
    </>
  )
}
