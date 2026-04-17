'use client'

import { useMemo } from 'react'
import { useLanguage } from '@/contexts/LanguageContext'

export default function Activities() {
  const { t } = useLanguage()

  const directions = useMemo(
    () => [
      { icon: '🛡️', titleKey: 'activities.directions.defense' },
      { icon: '🚨', titleKey: 'activities.directions.emergency' },
      { icon: '🎓', titleKey: 'activities.directions.education' },
      { icon: '🏥', titleKey: 'activities.directions.health' },
      { icon: '🤲', titleKey: 'activities.directions.poverty' },
      { icon: '🕊️', titleKey: 'activities.directions.warAffected' },
      { icon: '🧳', titleKey: 'activities.directions.idp' },
      { icon: '🌿', titleKey: 'activities.directions.ecology' },
      { icon: '⚖️', titleKey: 'activities.directions.humanRights' },
      { icon: '🎭', titleKey: 'activities.directions.cultureScienceSport' },
      { icon: '🌍', titleKey: 'activities.directions.communitiesIntl' },
    ],
    []
  )

  return (
    <section id="activities" className="activities">
      <div className="container">
        <div className="section-header">
          <h2 className="section-title">{t('activities.title')}</h2>
          <div className="section-divider"></div>
          <p className="section-description">{t('activities.description')}</p>
        </div>
        <div className="activities-grid">
          {directions.map((direction, index) => (
            <div key={index} className="activity-card">
              <div className="activity-icon">{direction.icon}</div>
              <h3>{t(direction.titleKey)}</h3>
              <p className="activity-note">{t('activities.expandNote')}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
