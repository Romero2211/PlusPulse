import Link from 'next/link'

export type NewsPostListEntry = {
  id: string
  slug: string
  title: string
  excerpt: string | null
  coverImageUrl: string | null
  publishedAtIso: string
}

function formatNewsDate(iso: string, locale: 'uk' | 'en'): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  try {
    return d.toLocaleDateString(locale === 'en' ? 'en-GB' : 'uk-UA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  } catch {
    return ''
  }
}

export default function NewsPostList({
  posts,
  locale,
}: {
  posts: NewsPostListEntry[]
  locale: 'uk' | 'en'
}) {
  return (
    <ul className="news-list">
      {posts.map((p) => (
        <li key={p.id} className="news-item">
          <Link href={`/news/${p.slug}`} className="news-item-link">
            {p.coverImageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={p.coverImageUrl} alt="" className="news-item-cover" />
            ) : null}
            <div className="news-item-body">
              <p className="news-item-date">{formatNewsDate(p.publishedAtIso, locale)}</p>
              <h2 className="news-item-title">{p.title}</h2>
              {p.excerpt ? <p className="news-item-excerpt">{p.excerpt}</p> : null}
            </div>
          </Link>
        </li>
      ))}
    </ul>
  )
}
