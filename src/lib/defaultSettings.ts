import type { SiteSettings } from './types'
import { DEFAULT_SITE_COPY } from './siteCopy'

/** Static content keeps the public portfolio available without Supabase. */
export const DEFAULT_SITE_SETTINGS: SiteSettings = {
  site_copy: DEFAULT_SITE_COPY,
  hero_name: 'Benjamin Huruma',
  hero_subtitle: 'Développeur Web & Ingénieur Logiciel, passionné par la blockchain, la cybersécurité et la création de solutions numériques durables.',
  hero_status: 'Disponible pour des opportunités',
  about_text: `Je suis Huruma Musagara Benjamin, développeur logiciel passionné par les nouvelles technologies et leurs ,ultiples avantages dans la vie quotidienne d'où ma conviction que l’informatique et les nouvelles technologies peuvent contribuer à un monde meilleur, en unissant nos efforts.

Je m’intéresse particulièrement au développement web, aux systèmes distribués et aux blockchains, à la cybersécurité et à l’informatique en général, avec une volonté claire de comprendre, utiliser et transformer. J’aborde chaque projet comme une opportunité d’apprentissage concret, en privilégiant des solutions durables et fonctionnelles.

Mon objectif est de développer des applications fiables, cohérentes et utiles à la communauté.`,
  about_location: 'Goma, RDC',
  about_education: 'ISIG Goma — Génie logiciel',
  about_languages: 'Français, Swahili, Anglais',
  about_email: 'benjaminhuruma@gmail.com',
  skills_mastered: 'HTML5 & CSS3, JavaScript, Python, C#, PostgreSQL, Git & GitHub, Photoshop, Suite Office, Swahili / Français',
  skills_progress: 'React, Dev Backend, Blockchain, Linux',
  education_items: [
    {
      period: 'En cours',
      title: 'Licence en Génie Logiciel',
      place: 'ISIG Goma, RDC',
      description: "Parcours en génie logiciel à l'Institut Supéprieur d'Informatique et Gestion de Goma/RDC",
    },
    {
      period: 'Obtenu',
      title: 'Diplôme d’État',
      place: 'République Démocratique du Congo',
      description: 'Diplôme d’État complétant le cycle secondaire, prélude à mes études supérieures en informatique.',
    },
    {
      period: 'Expérience',
      title: 'Opérateur de saisie & Formateur en Bureautique et autres logiciels informatiques de la vie courante',
      place: 'Les Optiques World',
      description: 'Saisie de données et formation — développement de la rigueur, de l’attention au détail et du sens du service.',
    },
  ],
  achievements: [
    {
      year: '2026',
      title: 'Validateur B-Nodes sur Safrochain',
      description: 'Lancement de mon validateur B-Nodes sur la blockchain Safrochain, contribuant à la sécurité et à la décentralisation du réseau.',
      link_label: 'safrochain.com',
      link_url: 'https://safrochain.com/',
    },
    {
      year: '2025',
      title: 'Réviseur communautaire — Cardano Catalyst',
      description: 'Participation à deux reprises au programme de révision communautaire de Catalyst dans l’écosystème Cardano, analyse et évaluation de propositions de projets.',
      link_label: 'cardano.org',
      link_url: 'https://cardano.org/',
    },
    {
      year: '2025 →',
      title: 'Membre actif — Midnight Network',
      description: 'Implication régulière dans l’écosystème Midnight, une blockchain de quatrième génération axée sur la confidentialité et les agents numériques.',
      link_label: 'midnight.network',
      link_url: 'https://midnight.network/',
    },
    {
      year: '2025 →',
      title: 'Membre actif — Safrochain',
      description: 'Engagement continu dans l’écosystème Safrochain, participation au réseau et à la communauté.',
      link_label: 'safrochain.com',
      link_url: 'https://safrochain.com/',
    },
  ],
  contact_email: 'benjaminhuruma@gmail.com',
  contact_phone: '+243 981 082 394',
  contact_location: 'Goma, Nord-Kivu, RDC',
  hero_photo_url: '',
  about_photo_url: '',
  linkedin_url: 'https://www.linkedin.com/in/benjamin-huruma-6a893539b',
  github_url: 'https://github.com/BenHuruma',
  twitter_url: 'https://x.com/ben_huruma?s=21',
  whatsapp_url: 'https://wa.me/243981082394',
}
