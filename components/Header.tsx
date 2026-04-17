'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useLanguage } from '@/contexts/LanguageContext'
import './Header.css'

export default function Header() {
  const { language, setLanguage, t } = useLanguage()
  const pathname = usePathname()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const isHome = pathname === '/'

  useEffect(() => {
    if (typeof window === 'undefined') return

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 100)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

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
    setIsMenuOpen(false)
  }

  return (
    <header className={`header ${isScrolled ? 'scrolled' : ''}`}>
      <nav className="navbar">
        <div className="container">
          <div className="nav-wrapper">
            <Link href="/" className="logo" title="PlusPulse — благодійна організація">
              <Image
                src="/logo.png"
                alt="PlusPulse — благодійна організація"
                width={300}
                height={90}
                className="logo-image"
                priority
              />
            </Link>
            <ul className={`nav-menu ${isMenuOpen ? 'active' : ''}`}>
              <li>
                {isHome ? (
                  <a href="#home" className="nav-link" onClick={(e) => handleSmoothScroll(e, '#home')}>
                    {t('nav.home')}
                  </a>
                ) : (
                  <Link href="/" className="nav-link" onClick={() => setIsMenuOpen(false)}>
                    {t('nav.home')}
                  </Link>
                )}
              </li>
              <li>
                <Link href="/about" className="nav-link" onClick={() => setIsMenuOpen(false)}>
                  {t('nav.about')}
                </Link>
              </li>
              <li>
                <Link href="/news" className="nav-link" onClick={() => setIsMenuOpen(false)}>
                  {t('newsPreview.ctaAll')}
                </Link>
              </li>
              <li>
                <Link href="/contacts" className="nav-link" onClick={() => setIsMenuOpen(false)}>
                  {t('nav.contact')}
                </Link>
              </li>
              <li>
                <Link href="/donate" className="nav-link nav-link-donate" onClick={() => setIsMenuOpen(false)}>
                  {t('nav.donate')}
                </Link>
              </li>
            </ul>
            <div className="language-switcher">
              <button
                className={`lang-btn ${language === 'uk' ? 'active' : ''}`}
                onClick={() => setLanguage('uk')}
              >
                UA
              </button>
              <button
                className={`lang-btn ${language === 'en' ? 'active' : ''}`}
                onClick={() => setLanguage('en')}
              >
                EN
              </button>
            </div>
            <button
              className={`hamburger ${isMenuOpen ? 'active' : ''}`}
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="Меню"
            >
              <span></span>
              <span></span>
              <span></span>
            </button>
          </div>
        </div>
      </nav>
    </header>
  )
}
