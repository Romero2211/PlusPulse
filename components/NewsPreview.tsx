'use client'

import Link from 'next/link'
import { useLanguage } from '@/contexts/LanguageContext'

export default function NewsPreview() {
  const { t } = useLanguage()

  const items = [
    { title: t('newsPreview.items.0.title'), date: t('newsPreview.items.0.date') },
    { title: t('newsPreview.items.1.title'), date: t('newsPreview.items.1.date') },
    { title: t('newsPreview.items.2.title'), date: t('newsPreview.items.2.date') },
  ]

  return (
    <section id="news" className="news-preview">
      <div className="container">
        <div className="section-header">
          <h2 className="section-title">{t('newsPreview.title')}</h2>
          <div className="section-divider"></div>
          <p className="section-description">{t('newsPreview.description')}</p>
        </div>

        <div className="news-preview-list">
          {items.map((item) => (
            <div key={item.title} className="news-preview-item">
              <div className="news-preview-date">{item.date}</div>
              <div className="news-preview-title">{item.title}</div>
            </div>
          ))}
        </div>

        <div className="news-preview-actions">
          <Link className="btn btn-secondary" href="/news">
            {t('newsPreview.ctaAll')}
          </Link>
        </div>
      </div>
    </section>
  )
}

