import Header from '@/components/Header'
import Hero from '@/components/Hero'
import About from '@/components/About'
import MVV from '@/components/MVV'
import ProgramsPreview from '@/components/ProgramsPreview'
import NewsPreview from '@/components/NewsPreview'
import TrustBlock from '@/components/TrustBlock'
import Contact from '@/components/Contact'
import Footer from '@/components/Footer'

export default function Home() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <About />
        <MVV />
        <ProgramsPreview />
        <NewsPreview />
        <TrustBlock />
        <Contact />
      </main>
      <Footer />
    </>
  )
}
