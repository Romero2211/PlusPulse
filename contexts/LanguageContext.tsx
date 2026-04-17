'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode, useMemo } from 'react'

type Language = 'uk' | 'en'

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: string) => string
}

const translations: Record<Language, Record<string, string>> = {
  uk: {
    'nav.home': 'Головна',
    'nav.about': 'Про нас',
    'nav.audience': 'Аудиторія',
    'nav.mvv': 'Місія та цінності',
    'nav.activities': 'Напрями',
    'nav.contact': 'Контакти',
    'nav.donate': 'Допомогти',
    'hero.title': 'Благодійна організація',
    'hero.subtitle': '«Благодійний фонд «ПЛЮС ПУЛЬС»',
    'hero.description': 'Офіційний публічний інструмент Фонду для забезпечення довіри, прозорості та ефективної комунікації. Недержавна, неприбуткова благодійна організація, що діє відповідно до законодавства України',
    'hero.donate': 'Допомогти зараз',
    'hero.learn': 'Дізнатися більше',
    'about.title': 'Про організацію',
    'about.description': 'Благодійний фонд «ПЛЮС ПУЛЬС» — це професійна благодійна організація, що працює відповідно до найвищих стандартів прозорості та відповідальності',
    'about.fullName': 'Повна назва',
    'about.fullNameValue': 'Благодійна організація «Благодійний фонд «ПЛЮС ПУЛЬС»',
    'about.shortName': 'Скорочена назва',
    'about.shortNameValue': 'БО БФ «ПЛЮС ПУЛЬС»',
    'about.location': 'Місцезнаходження',
    'about.locationValue': 'Україна, Київська область, м. Українка',
    'about.president': 'Керівник / Президент Фонду',
    'about.presidentValue': 'Золотухіна Анастасія Андріївна',
    'about.status': 'Юридичний статус',
    'about.statusValue': 'Недержавна, неприбуткова благодійна організація, що діє відповідно до законодавства України. Форма: Благодійний фонд.',
    'activities.title': 'Основні напрями діяльності',
    'activities.description': 'Сайт чітко і структуровано відображає всі статутні напрями діяльності Фонду з можливістю подальшого розширення.',
    'activities.expandNote': 'Детальні описи програм і проєктів буде додано в наступних оновленнях.',
    'activities.directions.defense': 'Сприяння обороноздатності та мобілізаційній готовності',
    'activities.directions.emergency': 'Захист населення у надзвичайних ситуаціях',
    'activities.directions.education': 'Освіта',
    'activities.directions.health': 'Охорона здоров’я',
    'activities.directions.poverty': 'Соціальний захист і подолання бідності',
    'activities.directions.warAffected': 'Допомога постраждалим від війни, катастроф, конфліктів',
    'activities.directions.idp': 'Допомога біженцям та ВПО',
    'activities.directions.ecology': 'Екологія та захист довкілля',
    'activities.directions.humanRights': 'Права людини',
    'activities.directions.cultureScienceSport': 'Культура, наука, спорт',
    'activities.directions.communitiesIntl': 'Розвиток громад та міжнародна співпраця',

    'programsPreview.title': 'Актуальні програми / збори',
    'programsPreview.description': 'Тут будуть розміщені активні програми та цільові збори з прозорими цілями, статусом і результатами.',
    'programsPreview.ctaPrograms': 'Перейти до програм',
    'programsPreview.ctaDonate': 'Задонатити',
    'programsPreview.items.0.title': 'Терміновий збір',
    'programsPreview.items.0.note': 'Опис і реквізити будуть додані. Наразі — шаблон для структури.',
    'programsPreview.items.1.title': 'Підтримка бенефіціарів',
    'programsPreview.items.1.note': 'Опис програми та критерії допомоги — буде додано.',
    'programsPreview.items.2.title': 'Партнерська ініціатива',
    'programsPreview.items.2.note': 'Інформація для бізнесу та партнерів — буде додано.',

    'newsPreview.title': 'Останні новини',
    'newsPreview.description': 'Новини фонду, звіти з подій, кампанії та інші оновлення.',
    'newsPreview.ctaAll': 'Усі новини',
    'newsPreview.items.0.title': 'Новина фонду (приклад): старт нового напряму допомоги',
    'newsPreview.items.0.date': 'Сьогодні',
    'newsPreview.items.1.title': 'Звіт з події (приклад): підсумки благодійної акції',
    'newsPreview.items.1.date': 'Цього тижня',
    'newsPreview.items.2.title': 'Кампанія (приклад): партнерський збір для громади',
    'newsPreview.items.2.date': 'Цього місяця',

    'trust.title': 'Блок довіри',
    'trust.description': 'Документи та звітність — критично важливі для довіри донорів і партнерів. Тут ми публікуємо ключові підтвердження прозорості.',
    'trust.items.statute': 'Статут',
    'trust.items.statuteNote': 'PDF для завантаження буде додано (розділ “Звітність і прозорість”).',
    'trust.items.reporting': 'Звітність',
    'trust.items.reportingNote': 'Фінансові звіти, використання коштів, джерела надходжень.',
    'trust.items.nonprofit': 'Неприбутковість',
    'trust.items.nonprofitNote': 'Підтвердження неприбуткового статусу та реєстраційні документи.',
    'trust.cta': 'Перейти до звітності',
    'donate.title': 'Ваша підтримка важлива',
    'donate.description': 'Кожна гривня, кожна хвилина вашого часу - це крок до кращого майбутнього. Ваші донати допомагають нам реалізовувати благодійні програми та допомагати тим, хто цього найбільше потребує. Разом ми можемо більше!',
    'donate.formTitle': 'Зробити внесок',
    'donate.subtitle': 'Підтримайте наші програми',
    'donate.note': 'Деталі для перерахування коштів будуть додані найближчим часом. Ми забезпечуємо повну прозорість використання всіх отриманих коштів.',
    'donate.onetime': 'Одноразовий внесок',
    'donate.regular': 'Регулярна підтримка',
    'donate.individuals': 'Фізичні особи',
    'donate.legal': 'Юридичні особи',
    'donate.international': 'Міжнародні партнери',
    'contact.title': 'Контакти',
    'contact.address': 'Адреса',
    'contact.president': 'Керівник',
    'footer.navigation': 'Навігація',
    'footer.contact': 'Контакти',
    'footer.rights': 'Всі права захищені.',
    'mission.title': 'Мета створення сайту',
    'mission.description': 'Сайт створюється як офіційний публічний інструмент Фонду, що має забезпечити довіру, прозорість та ефективну комунікацію',
    'mission.trust': 'Довіра',
    'mission.trustDesc': 'Забезпечення довіри з боку благодійників, партнерів та громадськості через відкритість та професійність',
    'mission.transparency': 'Прозорість',
    'mission.transparencyDesc': 'Повна прозорість діяльності, фінансів, програм та звітності для всіх зацікавлених сторін',
    'mission.funding': 'Залучення коштів',
    'mission.fundingDesc': 'Прийом донатів від фізичних та юридичних осіб, включно з міжнародними партнерами',
    'mission.communication': 'Комунікація',
    'mission.communicationDesc': 'Ефективна комунікація з бенефіціарами, волонтерами, партнерами, державними та міжнародними структурами',
    'mission.information': 'Інформаційна діяльність',
    'mission.informationDesc': 'Популяризація цілей Фонду та інформування про нашу діяльність широкої громадськості',
    'transparency.title': 'Прозорість та звітність',
    'transparency.description': 'Ми забезпечуємо повну прозорість нашої діяльності та фінансової звітності',
    'transparency.reports': 'Публічна звітність',
    'transparency.reportsDesc': 'Регулярна публікація звітів про діяльність Фонду, використання коштів та досягнуті результати',
    'transparency.finances': 'Фінансова прозорість',
    'transparency.financesDesc': 'Повна інформація про надходження та витрати коштів. Публікація фінансових звітів',
    'transparency.programs': 'Прозорість програм',
    'transparency.programsDesc': 'Детальна інформація про реалізовані та поточні благодійні програми та проекти',
    'transparency.accountability': 'Відповідальність',
    'transparency.accountabilityDesc': 'Відповідальність перед благодійниками, партнерами та громадськістю за результати нашої роботи',

    'audience.title': 'Цільова аудиторія сайту',
    'audience.description': 'Ми будуємо комунікацію так, щоб кожна група могла швидко знайти потрібну інформацію: як допомогти, як співпрацювати або як отримати підтримку.',
    'audience.primary.title': 'Основна аудиторія',
    'audience.primary.donors': 'Благодійники (фізичні особи, бізнес, міжнародні донори)',
    'audience.primary.partners': 'Партнери (НДО, ініціативи, організації)',
    'audience.primary.volunteers': 'Волонтери',
    'audience.primary.beneficiaries': 'Бенефіціари (особи, які потребують допомоги)',
    'audience.secondary.title': 'Додаткова аудиторія',
    'audience.secondary.media': 'Журналісти та медіа',
    'audience.secondary.government': 'Державні та місцеві органи',
    'audience.secondary.internationalFunds': 'Міжнародні фонди та донорські програми',
    'audience.secondary.public': 'Загальна громадськість',

    'mvv.title': 'Місія, візія, цінності',
    'mvv.description': 'Фундамент нашої діяльності — чітка місія, амбітна візія та цінності, яких ми дотримуємося щодня.',
    'mvv.mission.title': 'Місія',
    'mvv.mission.text': 'Надання системної, адресної та ефективної благодійної допомоги задля збереження життя, здоров’я, безпеки людей та розвитку суспільства України в умовах мирного і воєнного часу.',
    'mvv.vision.title': 'Візія',
    'mvv.vision.text': 'Сильний, прозорий та відповідальний благодійний фонд, який об’єднує людей і ресурси для захисту, підтримки та розвитку України.',
    'mvv.values.title': 'Цінності',
    'mvv.values.legality': 'Законність',
    'mvv.values.transparency': 'Прозорість',
    'mvv.values.openness': 'Відкритість',
    'mvv.values.voluntariness': 'Добровільність',
    'mvv.values.humanity': 'Гуманність',
    'mvv.values.responsibility': 'Відповідальність',
    'mvv.values.dignity': 'Повага до людини та її гідності',
  },
  en: {
    'nav.home': 'Home',
    'nav.about': 'About',
    'nav.audience': 'Audience',
    'nav.mvv': 'Mission & Values',
    'nav.activities': 'Directions',
    'nav.contact': 'Contact',
    'nav.donate': 'Donate',
    'hero.title': 'Charitable Organization',
    'hero.subtitle': '«Charity Fund PLUS PULSE»',
    'hero.description': 'Official public tool of the Fund to ensure trust, transparency and effective communication. Non-governmental, non-profit charitable organization operating in accordance with Ukrainian legislation',
    'hero.donate': 'Donate Now',
    'hero.learn': 'Learn More',
    'about.title': 'About the Organization',
    'about.description': 'Charity Fund "PLUS PULSE" is a professional charitable organization operating in accordance with the highest standards of transparency and accountability',
    'about.fullName': 'Full Name',
    'about.fullNameValue': 'Charitable Organization "Charity Fund PLUS PULSE"',
    'about.shortName': 'Short Name',
    'about.shortNameValue': 'CO CF "PLUS PULSE"',
    'about.location': 'Location',
    'about.locationValue': 'Ukraine, Kyiv region, Ukrainka city',
    'about.president': 'President',
    'about.presidentValue': 'Zolotukhina Anastasiia Andriivna',
    'about.status': 'Legal Status',
    'about.statusValue': 'Non-governmental, non-profit charitable organization operating in accordance with Ukrainian legislation. Form: Charity Fund.',
    'activities.title': 'Key Areas of Activity',
    'activities.description': 'The website clearly and structurally presents all statutory areas of the Fund’s work with the ability to expand over time.',
    'activities.expandNote': 'Detailed program and project descriptions will be added in the next updates.',
    'activities.directions.defense': 'Strengthening defense capability and mobilization readiness',
    'activities.directions.emergency': 'Protection of the population in emergencies',
    'activities.directions.education': 'Education',
    'activities.directions.health': 'Healthcare',
    'activities.directions.poverty': 'Social protection and poverty reduction',
    'activities.directions.warAffected': 'Support for people affected by war, disasters, and conflicts',
    'activities.directions.idp': 'Support for refugees and internally displaced persons (IDPs)',
    'activities.directions.ecology': 'Ecology and environmental protection',
    'activities.directions.humanRights': 'Human rights',
    'activities.directions.cultureScienceSport': 'Culture, science, sports',
    'activities.directions.communitiesIntl': 'Community development and international cooperation',

    'programsPreview.title': 'Active Programs / Fundraisers',
    'programsPreview.description': 'This section will contain active programs and targeted fundraisers with clear goals, status and results.',
    'programsPreview.ctaPrograms': 'Go to programs',
    'programsPreview.ctaDonate': 'Donate',
    'programsPreview.items.0.title': 'Urgent fundraiser',
    'programsPreview.items.0.note': 'Description and payment details will be added. This is a structural placeholder.',
    'programsPreview.items.1.title': 'Support for beneficiaries',
    'programsPreview.items.1.note': 'Program description and eligibility criteria will be added.',
    'programsPreview.items.2.title': 'Partner initiative',
    'programsPreview.items.2.note': 'Information for businesses and partners will be added.',

    'newsPreview.title': 'Latest News',
    'newsPreview.description': 'Fund news, event reports, campaigns and other updates.',
    'newsPreview.ctaAll': 'All news',
    'newsPreview.items.0.title': 'Fund news (example): launch of a new aid direction',
    'newsPreview.items.0.date': 'Today',
    'newsPreview.items.1.title': 'Event report (example): results of a charity action',
    'newsPreview.items.1.date': 'This week',
    'newsPreview.items.2.title': 'Campaign (example): partner fundraiser for a community',
    'newsPreview.items.2.date': 'This month',

    'trust.title': 'Trust & Credibility',
    'trust.description': 'Documents and reporting are critical for donor confidence. Here we publish key proofs of transparency.',
    'trust.items.statute': 'Statute',
    'trust.items.statuteNote': 'A downloadable PDF will be added (see “Transparency & Reporting”).',
    'trust.items.reporting': 'Reporting',
    'trust.items.reportingNote': 'Financial reports, use of funds, sources of income.',
    'trust.items.nonprofit': 'Non-profit status',
    'trust.items.nonprofitNote': 'Proof of non-profit status and registration documents.',
    'trust.cta': 'Go to reporting',
    'donate.title': 'Your Support Matters',
    'donate.description': 'Every hryvnia, every minute of your time is a step towards a better future. Your donations help us implement charitable programs and help those who need it most. Together we can do more!',
    'donate.formTitle': 'Make a Donation',
    'donate.subtitle': 'Support our programs',
    'donate.note': 'Bank details for transfers will be added soon. We ensure full transparency in the use of all funds received.',
    'donate.onetime': 'One-time Donation',
    'donate.regular': 'Regular Support',
    'donate.individuals': 'Individuals',
    'donate.legal': 'Legal Entities',
    'donate.international': 'International Partners',
    'contact.title': 'Contact Us',
    'contact.address': 'Address',
    'contact.president': 'President',
    'footer.navigation': 'Navigation',
    'footer.contact': 'Contact',
    'footer.rights': 'All rights reserved.',
    'mission.title': 'Website Purpose',
    'mission.description': 'The website is created as an official public tool of the Fund to ensure trust, transparency and effective communication',
    'mission.trust': 'Trust',
    'mission.trustDesc': 'Building trust among donors, partners and the public through openness and professionalism',
    'mission.transparency': 'Transparency',
    'mission.transparencyDesc': 'Full transparency of activities, finances, programs and reporting for all stakeholders',
    'mission.funding': 'Fundraising',
    'mission.fundingDesc': 'Accepting donations from individuals and legal entities, including international partners',
    'mission.communication': 'Communication',
    'mission.communicationDesc': 'Effective communication with beneficiaries, volunteers, partners, government and international structures',
    'mission.information': 'Information Activities',
    'mission.informationDesc': 'Promoting the Fund\'s goals and informing the general public about our activities',
    'transparency.title': 'Transparency and Accountability',
    'transparency.description': 'We ensure full transparency of our activities and financial reporting',
    'transparency.reports': 'Public Reporting',
    'transparency.reportsDesc': 'Regular publication of reports on the Fund\'s activities, use of funds and achieved results',
    'transparency.finances': 'Financial Transparency',
    'transparency.financesDesc': 'Complete information on income and expenses. Publication of financial reports',
    'transparency.programs': 'Program Transparency',
    'transparency.programsDesc': 'Detailed information about implemented and current charitable programs and projects',
    'transparency.accountability': 'Accountability',
    'transparency.accountabilityDesc': 'Accountability to donors, partners and the public for the results of our work',

    'audience.title': 'Target Audience',
    'audience.description': 'We structure information so every group can quickly find what they need: how to donate, collaborate, volunteer, or request support.',
    'audience.primary.title': 'Primary Audience',
    'audience.primary.donors': 'Donors (individuals, business, international donors)',
    'audience.primary.partners': 'Partners (NGOs, initiatives, organizations)',
    'audience.primary.volunteers': 'Volunteers',
    'audience.primary.beneficiaries': 'Beneficiaries (people who need support)',
    'audience.secondary.title': 'Secondary Audience',
    'audience.secondary.media': 'Journalists and media',
    'audience.secondary.government': 'State and local authorities',
    'audience.secondary.internationalFunds': 'International funds and donor programs',
    'audience.secondary.public': 'General public',

    'mvv.title': 'Mission, Vision, Values',
    'mvv.description': 'Our work is grounded in a clear mission, an ambitious vision, and values we follow every day.',
    'mvv.mission.title': 'Mission',
    'mvv.mission.text': 'Providing systematic, targeted and effective charitable assistance to preserve life, health and safety, and to support the development of Ukrainian society in both peacetime and wartime.',
    'mvv.vision.title': 'Vision',
    'mvv.vision.text': 'A strong, transparent and accountable charity fund that unites people and resources to protect, support and develop Ukraine.',
    'mvv.values.title': 'Values',
    'mvv.values.legality': 'Legality',
    'mvv.values.transparency': 'Transparency',
    'mvv.values.openness': 'Openness',
    'mvv.values.voluntariness': 'Voluntariness',
    'mvv.values.humanity': 'Humanity',
    'mvv.values.responsibility': 'Accountability',
    'mvv.values.dignity': 'Respect for human dignity',
  },
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: ReactNode }) {
  // Завжди починаємо з 'uk' для SSR, потім оновлюємо після монтування
  const [language, setLanguageState] = useState<Language>('uk')
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
    // Завантажуємо мову з localStorage тільки після монтування
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const savedLang = localStorage.getItem('language') as Language
        if (savedLang && (savedLang === 'uk' || savedLang === 'en')) {
          setLanguageState(savedLang)
        }
      }
    } catch (error) {
      // Ігноруємо помилки
    }
  }, [])

  const setLanguage = (lang: Language) => {
    setLanguageState(lang)
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem('language', lang)
      }
    } catch (error) {
      // Ігноруємо помилки
    }
  }

  const t = useMemo(() => {
    return (key: string): string => {
      return translations[language]?.[key] || key
    }
  }, [language])

  const value = useMemo(() => ({
    language,
    setLanguage,
    t,
  }), [language, t])

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
}
