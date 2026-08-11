'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useLanguage } from '@/contexts/LanguageContext'
import { useSession } from '@/contexts/SessionContext'
import { SHOW_EVENTS_NAV } from '@/lib/featureFlags'
import LogoBrand from '@/components/LogoBrand'

export default function Footer() {
  const { t, language } = useLanguage()
  const { user } = useSession()
  const currentYear = new Date().getFullYear()

  const fullName = language === 'uk'
    ? 'Благодійна організація «Благодійний фонд «ПЛЮС ПУЛЬС»'
    : 'Charitable Organization "Charity Fund PLUS PULSE"'

  return (
    <footer className="footer footer--redesign">
      <div className="footer-bg" aria-hidden />
      <div className="footer-overlay" aria-hidden />
      <div className="container">
        <div className="footer-content">
          <div className="footer-section">
            <LogoBrand variant="footer" className="footer-brand" />
            <p>{fullName}</p>
          </div>
          <div className="footer-section">
            <h4>{t('footer.navigation')}</h4>
            <ul>
              <li>
                <Link href="/">{t('nav.home')}</Link>
              </li>
              <li>
                <Link href="/about">{t('nav.about')}</Link>
              </li>
              <li>
                <Link href="/donate">{t('nav.donate')}</Link>
              </li>
              <li>
                <Link href="/news">{t('nav.news')}</Link>
              </li>
              {SHOW_EVENTS_NAV ? (
                <li>
                  <Link href="/events">{t('nav.events')}</Link>
                </li>
              ) : null}
              <li>
                <Link href="/contacts">{t('nav.contact')}</Link>
              </li>
              <li>
                {user ? (
                  <Link href="/cabinet">{t('nav.cabinet')}</Link>
                ) : (
                  <Link href="/login">{t('nav.login')}</Link>
                )}
              </li>
            </ul>
          </div>
          <div className="footer-section">
            <h4>{t('footer.contact')}</h4>
            <p className="footer-contact-item">
              <span className="footer-contact-icon" aria-hidden>📍</span>
              <span>{t('about.locationValue')}</span>
            </p>
            <p className="footer-contact-item">
              <span className="footer-contact-icon" aria-hidden>✉️</span>
              <a href={`mailto:${t('footer.email')}`}>{t('footer.email')}</a>
            </p>
            <p className="footer-contact-item">
              <span className="footer-contact-icon" aria-hidden>📞</span>
              <a href={`tel:${t('footer.phoneTel')}`}>{t('footer.phone')}</a>
            </p>
          </div>
        </div>
        <div className="footer-bottom">
          <p>
            &copy; {currentYear} {language === 'uk' ? 'БО БФ «ПЛЮС ПУЛЬС»' : 'CO CF "PLUS PULSE"'}. {t('footer.rights')}
          </p>
        </div>
      </div>
    </footer>
  )
}
