/*
# Create site_settings table for dynamic portfolio content

1. New Tables
- `site_settings` — single-row table storing all portfolio content
  - `id` (int, primary key, always 1 — singleton)
  - `cv_url` (text) — Google Drive link to CV document
  - `hero_name`, `hero_subtitle`, `hero_status` (text) — hero section
  - `about_text`, `about_location`, `about_education`, `about_languages`, `about_email` (text) — about section
  - `skills_mastered`, `skills_progress` (text) — skills section
  - `education_items` (jsonb) — array of education/experience entries
  - `achievements` (jsonb) — array of achievement entries
  - `contact_email`, `contact_phone`, `contact_location` (text) — contact section
  - `hero_photo_url`, `about_photo_url` (text) — URLs for dynamic photos (Google Drive or direct URLs)
  - `linkedin_url`, `github_url`, `twitter_url`, `whatsapp_url` (text) — social media links
  - `updated_at` (timestamptz)

2. Initial Data
- Seeds the singleton row with Benjamin Huruma's default portfolio content
  and the Google Drive CV link.

3. Security
- Enable RLS on `site_settings`.
- Public SELECT: anyone can read portfolio content (TO anon, authenticated).
- Only authenticated users can UPDATE (admin only, after sign-in).
- No INSERT or DELETE needed (singleton row pre-seeded).
*/

CREATE TABLE IF NOT EXISTS site_settings (
  id integer PRIMARY KEY DEFAULT 1,
  cv_url text NOT NULL DEFAULT '',
  hero_name text NOT NULL DEFAULT '',
  hero_subtitle text NOT NULL DEFAULT '',
  hero_status text NOT NULL DEFAULT '',
  about_text text NOT NULL DEFAULT '',
  about_location text NOT NULL DEFAULT '',
  about_education text NOT NULL DEFAULT '',
  about_languages text NOT NULL DEFAULT '',
  about_email text NOT NULL DEFAULT '',
  skills_mastered text NOT NULL DEFAULT '',
  skills_progress text NOT NULL DEFAULT '',
  education_items jsonb NOT NULL DEFAULT '[]',
  achievements jsonb NOT NULL DEFAULT '[]',
  contact_email text NOT NULL DEFAULT '',
  contact_phone text NOT NULL DEFAULT '',
  contact_location text NOT NULL DEFAULT '',
  hero_photo_url text NOT NULL DEFAULT '',
  about_photo_url text NOT NULL DEFAULT '',
  linkedin_url text NOT NULL DEFAULT '',
  github_url text NOT NULL DEFAULT '',
  twitter_url text NOT NULL DEFAULT '',
  whatsapp_url text NOT NULL DEFAULT '',
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT singleton CHECK (id = 1)
);

ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read the portfolio content (it's public)
GRANT SELECT ON site_settings TO anon, authenticated;
-- Only authenticated users (admin) can update content
GRANT UPDATE ON site_settings TO authenticated;

DROP POLICY IF EXISTS "public_read_settings" ON site_settings;
CREATE POLICY "public_read_settings" ON site_settings FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "admin_update_settings" ON site_settings;
CREATE POLICY "admin_update_settings" ON site_settings FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

-- Seed the singleton row with default content
INSERT INTO site_settings (id, cv_url, hero_name, hero_subtitle, hero_status, about_text, about_location, about_education, about_languages, about_email, skills_mastered, skills_progress, education_items, achievements, contact_email, contact_phone, contact_location, hero_photo_url, about_photo_url, linkedin_url, github_url, twitter_url, whatsapp_url, updated_at)
VALUES (
  1,
  'https://docs.google.com/document/d/1EOIh9wNgKYaMSbg86QWllAPNDgXcjEuU/edit?usp=drivesdk&ouid=112920642265533580795&rtpof=true&sd=true',
  'Benjamin Huruma',
  'Développeur Web & Logiciel, passionné par la blockchain, la cybersécurité et la création de solutions numériques durables.',
  'Disponible pour des opportunités',
  'Je suis Huruma Musagara Benjamin, jeune développeur logiciel passionné par la programmation et animé par la conviction que l''informatique et les nouvelles technologies peuvent contribuer à un monde meilleur, en unissant nos efforts.

Je m''intéresse particulièrement au développement web, aux systèmes distribués et aux blockchains, à la cybersécurité et à l''informatique en général, avec une volonté claire de comprendre, utiliser et transformer. J''aborde chaque projet comme une opportunité d''apprentissage concret, en privilégiant des solutions durables et fonctionnelles.

Mon objectif est de développer des applications fiables, cohérentes et utiles à la communauté.',
  'Goma, RDC',
  'ISIG Goma — Génie logiciel',
  'Français, Swahili, Anglais',
  'benjaminhuruma@gmail.com',
  'HTML5 & CSS3, JavaScript, Git & GitHub, Photoshop, Suite Office, Swahili / Français',
  'React, Python, C#, PostgreSQL, Dév. Backend, Blockchain',
  '[
    {"period":"En cours","title":"Licence en Génie Logiciel","place":"ISIG Goma, RDC","description":"Parcours en génie logiciel couvrant la programmation, les bases de données, le développement web et les systèmes distribués."},
    {"period":"Obtenu","title":"Diplôme d''État","place":"République Démocratique du Congo","description":"Diplôme d''État complétant le cycle secondaire, prélude à mes études supérieures en informatique."},
    {"period":"Expérience","title":"Opérateur de saisie & Formateur technique","place":"Les Optiques World","description":"Saisie de données et formation technique — développement de la rigueur, de l''attention au détail et du sens du service."}
  ]'::jsonb,
  '[
    {"year":"2026","title":"Validateur B-Nodes sur Safrochain","description":"Lancement de mon validateur B-Nodes sur la blockchain Safrochain, contribuant à la sécurité et à la décentralisation du réseau.","link_label":"safrochain.com","link_url":"https://safrochain.com/"},
    {"year":"2025","title":"Réviseur communautaire — Cardano Catalyst","description":"Participation à deux reprises au programme de révision communautaire de Catalyst dans l''écosystème Cardano, analyse et évaluation de propositions de projets.","link_label":"cardano.org","link_url":"https://cardano.org/"},
    {"year":"2025 →","title":"Membre actif — Midnight Network","description":"Implication régulière dans l''écosystème Midnight, une blockchain de quatrième génération axée sur la confidentialité et les agents numériques.","link_label":"midnight.network","link_url":"https://midnight.network/"},
    {"year":"2025 →","title":"Membre actif — Safrochain","description":"Engagement continu dans l''écosystème Safrochain, participation au réseau et à la communauté.","link_label":"safrochain.com","link_url":"https://safrochain.com/"}
  ]'::jsonb,
  'benjaminhuruma@gmail.com',
  '+243 981 082 394',
  'Goma, Nord-Kivu, RDC',
  '',
  '',
  'https://www.linkedin.com/in/benjamin-huruma-6a893539b',
  'https://github.com/BenHuruma',
  'https://x.com/ben_huruma?s=21',
  'https://wa.me/243981082394',
  now()
)
ON CONFLICT (id) DO NOTHING;
