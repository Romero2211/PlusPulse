'use client'

import Image from 'next/image'
import { useLanguage } from '@/contexts/LanguageContext'

export default function Hero() {
  const { t } = useLanguage()

  const handleSmoothScroll = (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
    e.preventDefault()
    if (typeof window === 'undefined') return

    const target = document.querySelector(targetId)
    if (target) {
      const headerOffset = 80
      const elementPosition = target.getBoundingClientRect().top
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      })
    }
  }

  return (
    <section id="home" className="hero">
      <div className="hero-overlay" aria-hidden />
      <div className="container hero-inner">
        <div className="hero-text">
          <h1 className="hero-headline">{t('hero.headline')}</h1>
          <p className="hero-tagline">{t('hero.tagline')}</p>
          <div className="hero-buttons">
            <a href="#programs" className="btn btn-primary" onClick={(e) => handleSmoothScroll(e, '#programs')}>
              {t('hero.donate')}
            </a>
            <a href="#about" className="btn btn-secondary" onClick={(e) => handleSmoothScroll(e, '#about')}>
              {t('hero.learn')}
            </a>
          </div>
        </div>
        <div className="hero-visual">
          <div className="hero-image-wrap">
            <Image
              src="/images/hero-children.jpg"
              alt=""
              width={440}
              height={520}
              className="hero-image"
              priority
              sizes="(max-width: 968px) 360px, 440px"
            />
          </div>
        </div>
      </div>
    </section>
  )
}
