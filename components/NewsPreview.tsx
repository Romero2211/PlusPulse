'use client'

import Link from 'next/link'
import NewsPostList, { type NewsPostListEntry } from '@/components/NewsPostList'
import { useLanguage } from '@/contexts/LanguageContext'

export type NewsPreviewPost = NewsPostListEntry

export default function NewsPreview({ posts }: { posts: NewsPreviewPost[] }) {
  const { t, language } = useLanguage()
  const locale = language === 'en' ? 'en' : 'uk'

  return (
    <section id="news" className="news-preview">
      <div className="container">
        <div className="section-header">
          <h2 className="section-title">{t('newsPreview.title')}</h2>
          <div className="section-divider"></div>
          <p className="section-description">{t('newsPreview.description')}</p>
        </div>

        {posts.length === 0 ? (
          <p className="events-empty">{t('newsPreview.empty')}</p>
        ) : (
          <NewsPostList posts={posts} locale={locale} />
        )}

        <div className="news-preview-actions">
          <Link className="btn btn-primary" href="/news">
            {t('newsPreview.ctaAll')}
          </Link>
        </div>
      </div>
    </section>
  )
}
