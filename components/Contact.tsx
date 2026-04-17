'use client'

import { useMemo } from 'react'
import { useLanguage } from '@/contexts/LanguageContext'

export default function Contact() {
  const { t } = useLanguage()

  const contacts = useMemo(() => [
    {
      icon: (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
          <circle cx="12" cy="10" r="3"></circle>
        </svg>
      ),
      titleKey: 'contact.address',
      contentKey: 'about.locationValue',
    },
    {
      icon: (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
          <circle cx="9" cy="7" r="4"></circle>
          <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
          <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
        </svg>
      ),
      titleKey: 'contact.president',
      contentKey: 'about.presidentValue',
    },
  ], [])

  return (
    <section id="contact" className="contact">
      <div className="container">
        <div className="section-header">
          <h2 className="section-title">{t('contact.title')}</h2>
          <div className="section-divider"></div>
        </div>
        <div className="contact-content">
          {contacts.map((contact, index) => (
            <div key={index} className="contact-card">
              <div className="contact-icon">{contact.icon}</div>
              <h3>{t(contact.titleKey)}</h3>
              <p>{t(contact.contentKey)}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
