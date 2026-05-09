'use client'

import { useState, useEffect, useCallback } from 'react'
import { createPortal } from 'react-dom'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useLanguage } from '@/contexts/LanguageContext'
import { useSession } from '@/contexts/SessionContext'
import { logoutAction } from '@/app/auth/actions'
import LoginForm from '@/components/LoginForm'
import './Header.css'

export default function Header() {
  const { language, setLanguage, t } = useLanguage()
  const { user } = useSession()
  const pathname = usePathname()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false)
  const [portalReady, setPortalReady] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const isHome = pathname === '/'

  const closeLoginModal = useCallback(() => setIsLoginModalOpen(false), [])

  const openLoginModal = useCallback(() => {
    setIsLoginModalOpen(true)
    setIsMenuOpen(false)
  }, [])

  useEffect(() => {
    setPortalReady(true)
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') return

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 100)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    if (!isLoginModalOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeLoginModal()
    }
    window.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
    }
  }, [isLoginModalOpen, closeLoginModal])

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

  const loginModal =
    portalReady && !user && isLoginModalOpen
      ? createPortal(
          <div className="auth-modal-root">
            <div className="auth-modal-backdrop" aria-hidden onClick={closeLoginModal} />
            <div className="auth-modal" role="dialog" aria-modal="true" aria-labelledby="auth-modal-title">
              <div className="auth-modal-inner">
                <button
                  type="button"
                  className="auth-modal-close"
                  onClick={closeLoginModal}
                  aria-label={t('login.modalClose')}
                >
                  ×
                </button>
                <LoginForm variant="modal" onBeforeRegister={closeLoginModal} titleId="auth-modal-title" />
              </div>
            </div>
          </div>,
          document.body,
        )
      : null

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
                  {t('nav.news')}
                </Link>
              </li>
              <li>
                <Link href="/events" className="nav-link" onClick={() => setIsMenuOpen(false)}>
                  {t('nav.events')}
                </Link>
              </li>
              <li>
                <Link href="/contacts" className="nav-link" onClick={() => setIsMenuOpen(false)}>
                  {t('nav.contact')}
                </Link>
              </li>
              <li>
                {user ? (
                  <Link href="/cabinet" className="nav-link nav-link-cabinet" onClick={() => setIsMenuOpen(false)}>
                    {t('nav.cabinet')}
                  </Link>
                ) : null}
              </li>
              <li>
                {user ? (
                  <form action={logoutAction} className="nav-logout-form">
                    <button type="submit" className="nav-link nav-link-logout">
                      {t('nav.logout')}
                    </button>
                  </form>
                ) : (
                  <button type="button" className="nav-link nav-link-register nav-link-auth-trigger" onClick={openLoginModal}>
                    {t('nav.login')}
                  </button>
                )}
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

      {loginModal}
    </header>
  )
}
