'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useLanguage } from '@/contexts/LanguageContext'
import { useSession } from '@/contexts/SessionContext'

export default function Footer() {
  const { t, language } = useLanguage()
  const { user } = useSession()
  const currentYear = new Date().getFullYear()

  const fullName = language === 'uk'
    ? 'Благодійна організація «Благодійний фонд «ПЛЮС ПУЛЬС»'
    : 'Charitable Organization "Charity Fund PLUS PULSE"'

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          <div className="footer-section">
            <Link href="/" className="footer-brand">
              <Image
                src="/logo.png"
                alt="PlusPulse — благодійна організація"
                width={240}
                height={72}
                className="footer-logo"
              />
            </Link>
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
              <li>
                <Link href="/events">{t('nav.events')}</Link>
              </li>
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
            <p>{t('about.locationValue')}</p>
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
