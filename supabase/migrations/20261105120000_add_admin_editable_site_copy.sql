-- Store public-facing copy that was previously hard-coded in React components.
ALTER TABLE public.site_settings
  ADD COLUMN IF NOT EXISTS site_copy jsonb NOT NULL DEFAULT '{}'::jsonb;

UPDATE public.site_settings
SET site_copy = $site_copy$
{
  "navbar_brand_mark": "BH",
  "navbar_brand_name": "Benjamin Huruma",
  "nav_links": [
    {"id":"hero","label":"Accueil"},
    {"id":"about","label":"À propos"},
    {"id":"skills","label":"Compétences"},
    {"id":"education","label":"Formation"},
    {"id":"work","label":"Réalisations"},
    {"id":"contact","label":"Contact"}
  ],
  "hero_contact_cta": "Me contacter",
  "about_label": "À propos",
  "about_heading": "Un développeur guidé par le professionnalisme et la rigueur",
  "about_location_label": "Localisation",
  "about_education_label": "Études",
  "about_languages_label": "Langues",
  "about_email_label": "Email",
  "about_highlights": [
    {"icon":"fa-solid fa-code","label":"Développement Web"},
    {"icon":"fa-solid fa-cube","label":"Blockchain & Web3"},
    {"icon":"fa-solid fa-shield-halved","label":"Cybersécurité"},
    {"icon":"fa-solid fa-server","label":"Systèmes distribués"}
  ],
  "skills_label": "Compétences",
  "skills_heading": "Ce que je maîtrise et ce que j'apprends",
  "skills_description": "Un aperçu de mes compétences techniques et de celles que je développe activement.",
  "skills_mastered_title": "Compétences maîtrisées",
  "skills_mastered_status": "Maîtrise",
  "skills_progress_title": "En progression",
  "skills_progress_status": "En progression",
  "education_label": "Formation",
  "education_heading": "Parcours académique et expérience",
  "education_description": "Une formation en génie logiciel enrichie par des expériences pratiques sur le terrain.",
  "work_label": "Réalisations",
  "work_heading": "Projets et contributions",
  "work_description": "Au fil du temps, j'ai travaillé sur des projets logiciels et je me suis impliqué activement dans plusieurs écosystèmes blockchain.",
  "certificates_title": "Certificats — Midnight Network",
  "certificates": [
    {"title":"Certificat Midnight — Benjamin Huruma","image_url":"certificatMidnight1.WebP","alt":"Certificat Midnight — Benjamin Huruma"},
    {"title":"Certificat Midnight — Benjamin Huruma","image_url":"CertificatMidnight2.WebP","alt":"Certificat Midnight — Benjamin Huruma"}
  ],
  "contact_label": "Contact",
  "contact_heading": "Restons en contact",
  "contact_description": "Une question, une opportunité ou envie d'échanger ? N'hésitez pas à m'écrire.",
  "contact_email_label": "Email",
  "contact_phone_label": "Téléphone",
  "contact_location_label": "Localisation",
  "contact_form_name_label": "Nom",
  "contact_form_email_label": "Email",
  "contact_form_message_label": "Message",
  "contact_form_name_placeholder": "Votre nom",
  "contact_form_email_placeholder": "vous@exemple.com",
  "contact_form_message_placeholder": "Votre message...",
  "contact_form_send_label": "Envoyer le message",
  "contact_form_sent_label": "Message prêt à être envoyé",
  "footer_brand_mark": "BH",
  "footer_credit_prefix": "Conçu et développé par"
}
$site_copy$::jsonb
WHERE id = 1
  AND (site_copy IS NULL OR site_copy = '{}'::jsonb);

-- The portfolio's public SELECT policy uses column-level grants. Grant only
-- this new copy field; keep prior restrictions on legacy CV fields unchanged.
GRANT SELECT (site_copy) ON public.site_settings TO anon, authenticated;
