'use client'

import { useLanguage } from '@/contexts/LanguageContext'

export default function Mission() {
  const { t } = useLanguage()

  const goals = [
    {
      icon: '🤝',
      title: t('mission.trust'),
      description: t('mission.trustDesc'),
    },
    {
      icon: '📊',
      title: t('mission.transparency'),
      description: t('mission.transparencyDesc'),
    },
    {
      icon: '💝',
      title: t('mission.funding'),
      description: t('mission.fundingDesc'),
    },
    {
      icon: '💬',
      title: t('mission.communication'),
      description: t('mission.communicationDesc'),
    },
    {
      icon: '📢',
      title: t('mission.information'),
      description: t('mission.informationDesc'),
    },
  ]

  return (
    <section id="mission" className="mission">
      <div className="container">
        <div className="section-header">
          <h2 className="section-title">{t('mission.title')}</h2>
          <div className="section-divider"></div>
          <p className="section-description">{t('mission.description')}</p>
        </div>
        <div className="mission-grid">
          {goals.map((goal, index) => (
            <div key={index} className="mission-card">
              <div className="mission-icon">{goal.icon}</div>
              <h3>{goal.title}</h3>
              <p>{goal.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
