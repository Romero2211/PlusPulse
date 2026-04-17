'use client'

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
      <div className="hero-overlay"></div>
      <div className="container">
        <div className="hero-content">
          <h2 className="hero-title">{t('hero.title')}</h2>
          <h3 className="hero-subtitle">{t('hero.subtitle')}</h3>
          <p className="hero-description">{t('hero.description')}</p>
          <div className="hero-buttons">
            <a href="#donate" className="btn btn-primary" onClick={(e) => handleSmoothScroll(e, '#donate')}>
              {t('hero.donate')}
            </a>
            <a href="#about" className="btn btn-secondary" onClick={(e) => handleSmoothScroll(e, '#about')}>
              {t('hero.learn')}
            </a>
          </div>
        </div>
      </div>
      <div className="scroll-indicator">
        <div className="mouse"></div>
      </div>
    </section>
  )
}
