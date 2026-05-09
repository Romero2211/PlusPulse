import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata(props: Props): Promise<Metadata> {
  const { slug } = await props.params
  const row = await prisma.newsPost.findUnique({ where: { slug }, select: { title: true, excerpt: true } })
  if (!row) return { title: 'Новина | БО БФ «ПЛЮС ПУЛЬС»' }
  return { title: `${row.title} | Новини`, description: row.excerpt ?? undefined }
}

function formatDate(d: Date): string {
  try {
    return d.toLocaleDateString('uk-UA', { year: 'numeric', month: 'long', day: 'numeric' })
  } catch {
    return d.toISOString()
  }
}

export default async function NewsDetailPage(props: Props) {
  const { slug } = await props.params
  const row = await prisma.newsPost.findFirst({
    where: { slug, publishedAt: { not: null } },
    select: {
      title: true,
      excerpt: true,
      body: true,
      coverImageUrl: true,
      gallery: true,
      publishedAt: true,
    },
  })
  if (!row) notFound()

  const galleryUrls: string[] =
    Array.isArray(row.gallery) && row.gallery.every((x) => typeof x === 'string') ? (row.gallery as string[]) : []

  return (
    <>
      <Header />
      <main className="page-below-header">
        <section className="news-detail">
          <div className="container">
            <h1 className="events-page-title">{row.title}</h1>
            {row.publishedAt ? <p className="news-item-date">{formatDate(row.publishedAt)}</p> : null}
            {row.coverImageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={row.coverImageUrl} alt="" className="news-detail-cover" />
            ) : null}
            {row.excerpt ? <p className="news-detail-excerpt">{row.excerpt}</p> : null}
            <article className="news-detail-body">
              {row.body.split('\n').map((line, idx) =>
                line.trim() ? <p key={idx}>{line}</p> : <p key={idx} className="news-p-spacer" />,
              )}
            </article>
            {galleryUrls.length ? (
              <div className="news-gallery">
                {galleryUrls.map((u) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img key={u} src={u} alt="" className="news-gallery-img" />
                ))}
              </div>
            ) : null}
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}

