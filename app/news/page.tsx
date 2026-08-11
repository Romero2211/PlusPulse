import Header from '@/components/Header'
import Footer from '@/components/Footer'
import PageHero from '@/components/PageHero'
import NewsPostList from '@/components/NewsPostList'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Новини | БО БФ «ПЛЮС ПУЛЬС»',
  description: 'Новини, події та оновлення благодійного фонду «ПЛЮС ПУЛЬС».',
}

export default async function NewsPage() {
  const posts = await prisma.newsPost.findMany({
    where: { publishedAt: { not: null } },
    orderBy: { publishedAt: 'desc' },
    select: {
      id: true,
      title: true,
      slug: true,
      excerpt: true,
      coverImageUrl: true,
      publishedAt: true,
    },
    take: 50,
  })

  const entries = posts.map((p) => ({
    id: p.id,
    slug: p.slug,
    title: p.title,
    excerpt: p.excerpt,
    coverImageUrl: p.coverImageUrl,
    publishedAtIso: p.publishedAt!.toISOString(),
  }))

  return (
    <>
      <Header />
      <main className="page-below-header">
        <PageHero
          title="Новини"
          description="Новини фонду, звіти з подій, кампанії та інші оновлення."
        />
        <section className="news-page inner-page-body inner-page-body--white">
          <div className="container">
            {posts.length === 0 ? (
              <p className="events-empty">Поки немає опублікованих новин.</p>
            ) : (
              <NewsPostList posts={entries} locale="uk" />
            )}
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
