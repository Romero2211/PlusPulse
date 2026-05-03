import Header from '@/components/Header'
import NewsPreview from '@/components/NewsPreview'
import Footer from '@/components/Footer'

export const metadata = {
  title: 'Новини | БО БФ «ПЛЮС ПУЛЬС»',
  description: 'Новини, події та оновлення благодійного фонду «ПЛЮС ПУЛЬС».',
}

export default function NewsPage() {
  return (
    <>
      <Header />
      <main className="page-below-header">
        <NewsPreview />
      </main>
      <Footer />
    </>
  )
}
