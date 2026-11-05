import type { Achievement, EducationItem, SiteSettings } from './types'
import { DEFAULT_SITE_COPY, mergeSiteCopy, type SiteCopy } from './siteCopy'

export type Language = 'fr' | 'en' | 'sw'

export const SUPPORTED_LANGUAGES: Array<{ code: Language; label: string; nativeName: string; flag: string }> = [
  { code: 'fr', label: 'Français', nativeName: 'Français', flag: '🇫🇷' },
  { code: 'en', label: 'English', nativeName: 'English', flag: '🇬🇧' },
  { code: 'sw', label: 'Kiswahili', nativeName: 'Kiswahili', flag: '🇨🇩' },
]

export interface LocalizedContent {
  hero_name: string
  hero_subtitle: string
  hero_status: string
  about_text: string
  about_location: string
  about_education: string
  about_languages: string
  about_email: string
  skills_mastered: string
  skills_progress: string
  education_items: EducationItem[]
  achievements: Achievement[]
  site_copy: SiteCopy
}

const EN_COPY: SiteCopy = {
  ...DEFAULT_SITE_COPY,
  nav_links: [
    { id: 'hero', label: 'Home' }, { id: 'about', label: 'About' }, { id: 'skills', label: 'Skills' },
    { id: 'education', label: 'Education' }, { id: 'work', label: 'Achievements' }, { id: 'contact', label: 'Contact' },
  ],
  hero_contact_cta: 'Contact me', about_label: 'About',
  about_heading: 'A software engineer guided by professionalism and precision',
  about_location_label: 'Location', about_education_label: 'Education', about_languages_label: 'Languages', about_email_label: 'Email',
  about_highlights: [
    { icon: 'fa-solid fa-code', label: 'Web Development' }, { icon: 'fa-solid fa-cube', label: 'Blockchain & Web3' },
    { icon: 'fa-solid fa-shield-halved', label: 'Cybersecurity' }, { icon: 'fa-solid fa-server', label: 'Distributed Systems' },
  ],
  skills_label: 'Skills', skills_heading: 'What I know and what I am learning',
  skills_description: 'An overview of my technical skills and the ones I am actively developing.',
  skills_mastered_title: 'Proficient skills', skills_mastered_status: 'Proficient',
  skills_progress_title: 'Currently learning', skills_progress_status: 'Learning',
  education_label: 'Education', education_heading: 'Academic background and experience',
  education_description: 'A software engineering education enriched by practical, hands-on experience.',
  work_label: 'Achievements', work_heading: 'Projects and contributions',
  work_description: 'Over time, I have worked on software projects and actively contributed to several blockchain ecosystems.',
  certificates_title: 'Certificates — Midnight Network',
  certificates: DEFAULT_SITE_COPY.certificates.map((item) => ({ ...item, title: 'Midnight Certificate — Benjamin Huruma', alt: 'Midnight certificate — Benjamin Huruma' })),
  contact_label: 'Contact', contact_heading: 'Let’s get in touch',
  contact_description: 'Have a question, an opportunity, or want to connect? Feel free to reach out.',
  contact_email_label: 'Email', contact_phone_label: 'Phone', contact_location_label: 'Location',
  contact_form_name_label: 'Name', contact_form_email_label: 'Email', contact_form_message_label: 'Message',
  contact_form_name_placeholder: 'Your name', contact_form_email_placeholder: 'you@example.com',
  contact_form_message_placeholder: 'Your message...', contact_form_send_label: 'Send message',
  contact_form_sent_label: 'Message ready to send', footer_credit_prefix: 'Designed and developed by',
  language_selector_label: 'Choose portfolio language', theme_toggle_label: 'Change theme', menu_toggle_label: 'Open menu',
  certificate_enlarge_label: 'Enlarge', contact_email_subject_prefix: 'Message from', contact_email_name_prefix: 'Name', contact_email_address_prefix: 'Email',
  contact_email_visitor_label: 'a visitor',
}

const SW_COPY: SiteCopy = {
  ...DEFAULT_SITE_COPY,
  nav_links: [
    { id: 'hero', label: 'Mwanzo' }, { id: 'about', label: 'Kuhusu' }, { id: 'skills', label: 'Ujuzi' },
    { id: 'education', label: 'Elimu' }, { id: 'work', label: 'Mafanikio' }, { id: 'contact', label: 'Mawasiliano' },
  ],
  hero_contact_cta: 'Wasiliana nami', about_label: 'Kuhusu',
  about_heading: 'Mhandisi wa programu anayezingatia taaluma na umakini',
  about_location_label: 'Mahali', about_education_label: 'Elimu', about_languages_label: 'Lugha', about_email_label: 'Barua pepe',
  about_highlights: [
    { icon: 'fa-solid fa-code', label: 'Utengenezaji wa Wavuti' }, { icon: 'fa-solid fa-cube', label: 'Blockchain na Web3' },
    { icon: 'fa-solid fa-shield-halved', label: 'Usalama wa Mtandao' }, { icon: 'fa-solid fa-server', label: 'Mifumo Inayosambazwa' },
  ],
  skills_label: 'Ujuzi', skills_heading: 'Ninachokijua na ninachojifunza',
  skills_description: 'Muhtasari wa ujuzi wangu wa kiufundi na yale ninayoendelea kujifunza.',
  skills_mastered_title: 'Ujuzi ninaouweza', skills_mastered_status: 'Ninaouweza',
  skills_progress_title: 'Ninajifunza', skills_progress_status: 'Ninaendelea',
  education_label: 'Elimu', education_heading: 'Masomo na uzoefu',
  education_description: 'Masomo ya uhandisi wa programu yaliyoimarishwa na uzoefu wa vitendo.',
  work_label: 'Mafanikio', work_heading: 'Miradi na michango',
  work_description: 'Kwa muda, nimefanya kazi kwenye miradi ya programu na kuchangia kikamilifu katika mifumo mbalimbali ya blockchain.',
  certificates_title: 'Vyeti — Midnight Network',
  certificates: DEFAULT_SITE_COPY.certificates.map((item) => ({ ...item, title: 'Cheti cha Midnight — Benjamin Huruma', alt: 'Cheti cha Midnight — Benjamin Huruma' })),
  contact_label: 'Mawasiliano', contact_heading: 'Tuendelee kuwasiliana',
  contact_description: 'Una swali, fursa, au ungependa kuzungumza? Karibu unitumie ujumbe.',
  contact_email_label: 'Barua pepe', contact_phone_label: 'Simu', contact_location_label: 'Mahali',
  contact_form_name_label: 'Jina', contact_form_email_label: 'Barua pepe', contact_form_message_label: 'Ujumbe',
  contact_form_name_placeholder: 'Jina lako', contact_form_email_placeholder: 'wewe@example.com',
  contact_form_message_placeholder: 'Ujumbe wako...', contact_form_send_label: 'Tuma ujumbe',
  contact_form_sent_label: 'Ujumbe uko tayari kutumwa', footer_credit_prefix: 'Imeundwa na kutengenezwa na',
  language_selector_label: 'Chagua lugha ya tovuti', theme_toggle_label: 'Badilisha mandhari', menu_toggle_label: 'Fungua menyu',
  certificate_enlarge_label: 'Panua', contact_email_subject_prefix: 'Ujumbe kutoka kwa', contact_email_name_prefix: 'Jina', contact_email_address_prefix: 'Barua pepe',
  contact_email_visitor_label: 'mgeni',
}

type BaseSettings = Omit<SiteSettings, 'default_language' | 'translations'>

function translatedContent(base: BaseSettings, language: Language): LocalizedContent {
  if (language === 'fr') {
    return {
      hero_name: base.hero_name,
      hero_subtitle: 'Ingénieur logiciel et Développeur Web, passionné par la blockchain, la cybersécurité et la création de solutions numériques durables.',
      hero_status: base.hero_status,
      about_text: base.about_text,
      about_location: base.about_location,
      about_education: base.about_education,
      about_languages: base.about_languages,
      about_email: base.about_email,
      skills_mastered: base.skills_mastered,
      skills_progress: base.skills_progress,
      education_items: base.education_items.map((item) => ({ ...item })),
      achievements: base.achievements.map((item) => ({ ...item })),
      site_copy: mergeSiteCopy(base.site_copy),
    }
  }

  const english = language === 'en'
  return {
    hero_name: base.hero_name,
    hero_subtitle: english
      ? 'Software Engineer and Web Developer, passionate about blockchain, cybersecurity, and building sustainable digital solutions.'
      : 'Mhandisi wa programu na Msanidi wa Wavuti, ninayependa blockchain, usalama wa mtandao na kujenga suluhisho endelevu za kidijitali.',
    hero_status: english ? 'Available for opportunities' : 'Napatikana kwa fursa za kazi',
    about_text: english
      ? 'I am Huruma Musagara Benjamin, a software engineer passionate about new technologies and their potential to improve everyday life. I believe information technology can help build a better world through shared effort.\n\nI am especially interested in web development, distributed systems and blockchain, cybersecurity, and computing in general. I approach every project as a hands-on learning opportunity and focus on practical, sustainable solutions.\n\nMy goal is to develop reliable, coherent applications that are useful to the community.'
      : 'Mimi ni Huruma Musagara Benjamin, mhandisi wa programu ninayependa teknolojia mpya na uwezo wake wa kuboresha maisha ya kila siku. Ninaamini teknolojia ya habari inaweza kusaidia kujenga dunia bora kupitia juhudi za pamoja.\n\nNinavutiwa hasa na utengenezaji wa wavuti, mifumo inayosambazwa na blockchain, usalama wa mtandao na kompyuta kwa ujumla. Ninaichukulia kila mradi kama nafasi ya kujifunza kwa vitendo na kuunda suluhisho endelevu.\n\nLengo langu ni kutengeneza programu salama, zinazoeleweka na zenye manufaa kwa jamii.',
    about_location: base.about_location,
    about_education: english ? 'ISIG Goma — Software Engineering' : 'ISIG Goma — Uhandisi wa Programu',
    about_languages: english ? 'French, Swahili, English' : 'Kifaransa, Kiswahili, Kiingereza',
    about_email: base.about_email,
    skills_mastered: english ? 'HTML5 & CSS3, JavaScript, Python, C#, PostgreSQL, Git & GitHub, Photoshop, Office Suite, Swahili / French' : 'HTML5 na CSS3, JavaScript, Python, C#, PostgreSQL, Git na GitHub, Photoshop, Ofisi, Kiswahili / Kifaransa',
    skills_progress: english ? 'React, Backend Development, Blockchain, Linux' : 'React, Utengenezaji wa Backend, Blockchain, Linux',
    education_items: base.education_items.map((item, index) => {
      if (english) {
        const translated = [
          { period: 'In progress', title: 'Bachelor’s Degree in Software Engineering', place: 'ISIG Goma, DRC', description: 'Software engineering studies at the Higher Institute of Computer Science and Management in Goma, DRC.' },
          { period: 'Completed', title: 'State Diploma', place: 'Democratic Republic of the Congo', description: 'State diploma completing secondary education and preparing me for higher studies in computing.' },
          { period: 'Experience', title: 'Data Entry Operator & Technical Trainer', place: 'Les Optiques World', description: 'Data entry and technical training, building accuracy, attention to detail, and a service mindset.' },
        ][index]
        return translated ? { ...item, ...translated } : { ...item }
      }
      const translated = [
        { period: 'Inaendelea', title: 'Shahada ya Uhandisi wa Programu', place: 'ISIG Goma, DRC', description: 'Masomo ya uhandisi wa programu katika Taasisi ya Juu ya Sayansi ya Kompyuta na Usimamizi mjini Goma, DRC.' },
        { period: 'Imekamilika', title: 'Diploma ya Serikali', place: 'Jamhuri ya Kidemokrasia ya Kongo', description: 'Diploma ya serikali iliyokamilisha elimu ya sekondari na kunitayarisha kwa masomo ya juu ya kompyuta.' },
        { period: 'Uzoefu', title: 'Muingizaji Data na Mkufunzi wa Kiufundi', place: 'Les Optiques World', description: 'Kuingiza data na kutoa mafunzo ya kiufundi, huku nikikuza usahihi, umakini na huduma bora.' },
      ][index]
      return translated ? { ...item, ...translated } : { ...item }
    }),
    achievements: base.achievements.map((item) => {
      const translations: Record<string, Partial<Achievement>> = english ? {
        'Validateur B-Nodes sur Safrochain': { title: 'B-Nodes Validator on Safrochain', description: 'Launched my B-Nodes validator on the Safrochain blockchain, contributing to the network’s security and decentralization.' },
        'Réviseur communautaire — Cardano Catalyst': { title: 'Community Reviewer — Cardano Catalyst', description: 'Twice participated in Catalyst’s community review program in the Cardano ecosystem, analyzing and evaluating project proposals.' },
        'Membre actif — Midnight Network': { title: 'Active Member — Midnight Network', description: 'Regular involvement in the Midnight ecosystem, a fourth-generation blockchain focused on privacy and digital agents.' },
        'Membre actif — Safrochain': { title: 'Active Member — Safrochain', description: 'Ongoing engagement with the Safrochain ecosystem, its network, and community.' },
      } : {
        'Validateur B-Nodes sur Safrochain': { title: 'Mthibitishaji wa B-Nodes kwenye Safrochain', description: 'Nilianzisha kithibitishaji changu cha B-Nodes kwenye blockchain ya Safrochain, nikichangia usalama na ugatuaji wa mtandao.' },
        'Réviseur communautaire — Cardano Catalyst': { title: 'Mhakiki wa Jamii — Cardano Catalyst', description: 'Nilishiriki mara mbili katika mpango wa mapitio ya jamii wa Catalyst ndani ya mfumo wa Cardano, nikichambua na kutathmini mapendekezo ya miradi.' },
        'Membre actif — Midnight Network': { title: 'Mwanachama Hai — Midnight Network', description: 'Ushiriki wa mara kwa mara katika mfumo wa Midnight, blockchain ya kizazi cha nne inayolenga faragha na mawakala wa kidijitali.' },
        'Membre actif — Safrochain': { title: 'Mwanachama Hai — Safrochain', description: 'Ushiriki unaoendelea katika mtandao na jamii ya Safrochain.' },
      }
      return { ...item, ...(translations[item.title] ?? {}) }
    }),
    site_copy: english ? EN_COPY : SW_COPY,
  }
}

export function ensureTranslations(base: BaseSettings, stored: unknown): Record<Language, LocalizedContent> {
  const values = stored && typeof stored === 'object' ? stored as Partial<Record<Language, Partial<LocalizedContent>>> : {}
  const result = {} as Record<Language, LocalizedContent>
  for (const language of ['fr', 'en', 'sw'] as const) {
    const fallback = translatedContent(base, language)
    const saved = values[language]
    result[language] = saved ? {
      ...fallback,
      ...saved,
      site_copy: mergeSiteCopy(saved.site_copy, fallback.site_copy),
      education_items: Array.isArray(saved.education_items) ? saved.education_items : fallback.education_items,
      achievements: Array.isArray(saved.achievements) ? saved.achievements : fallback.achievements,
    } : fallback
  }
  return result
}

export function getLocalizedSettings(settings: SiteSettings, language: Language): SiteSettings {
  const translation = settings.translations[language]
  return { ...settings, ...translation, default_language: settings.default_language, translations: settings.translations }
}
