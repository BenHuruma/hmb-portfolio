# Portfolio — Benjamin Huruma

Portfolio personnel présentant mon profil, mes compétences, ma formation, mes réalisations et mes coordonnées.

## Fonctionnalités

- Site responsive avec thèmes clair et sombre.
- Sections profil, compétences, formation, réalisations et contact.
- Contenu administré une seule fois en français et traduction à la demande dans 10 langues.
- Sélecteur de langue avec préférence du visiteur et langue par défaut configurable.
- Tableau de bord admin organisé en sections, avec brouillon local restauré après fermeture du navigateur.
- Formulaire de contact envoyé par une fonction Supabase, avec lien mailto de secours.
- Contenu public de secours intégré : le site reste consultable sans Supabase.

## Technologies

- React, TypeScript et Vite.
- React Router.
- Supabase Auth, PostgreSQL avec RLS et Supabase Storage.

## Développement local

```bash
npm ci
npm run dev
```

Pour compiler le site :

```bash
npm run build
```

## Configuration

La configuration Supabase est facultative pour le site public. Pour utiliser l’administration, définissez `VITE_SUPABASE_URL` et `VITE_SUPABASE_ANON_KEY` dans un fichier `.env` local ou dans les secrets GitHub Actions pour la publication. La clé publique anon/Publishable est destinée au navigateur ; ne placez jamais une clé `service_role` dans l’application.

### Envoi direct du formulaire de contact

L’envoi direct passe par `supabase/functions/contact-message` et Resend. Vérifiez un domaine d’envoi chez Resend, puis connectez la CLI au projet Supabase (`supabase login`, puis `supabase link --project-ref <PROJECT_REF>`). Définissez `RESEND_API_KEY`, `CONTACT_TO_EMAIL` (adresse de réception), `CONTACT_FROM_EMAIL` (expéditeur du domaine vérifié) et, si nécessaire, `ALLOWED_ORIGINS` (par défaut `https://benhuruma.github.io,http://localhost:5173`) avec `supabase secrets set`. Déployez ensuite avec `supabase functions deploy contact-message`. La fonction vérifie les champs, inclut un honeypot et une limite de fréquence temporaire par adresse client ; pour un formulaire très exposé, ajoutez également un CAPTCHA tel que Cloudflare Turnstile. Ne mettez jamais la clé Resend ou la clé `service_role` dans une variable `VITE_*`. Tant que la fonction ou Resend n’est pas configuré, le formulaire propose le lien mailto de secours.

Les textes publics configurables, la navigation, les points forts et les certificats sont enregistrés dans le champ `site_copy` de `site_settings` et modifiables depuis l’administration en français. Google Translate est chargé uniquement lorsqu’un visiteur choisit une langue autre que le français. Les traductions et connexions externes nécessitent Internet. Les dix langues sont triées alphabétiquement : arabe, bengali, chinois, anglais, français, hindi, portugais, russe, espagnol et swahili. La langue par défaut est configurable dans l’administration. La photo d’accueil peut être fournie par URL ou téléversée (JPEG, PNG, WebP, GIF ou AVIF, 10 Mo maximum) ; le téléversement et la sauvegarde exigent une vérification sudo. Appliquez les migrations de `supabase/migrations` dans l’ordre chronologique. L’administration est limitée au compte autorisé par la base de données.

## Publication

Le workflow `.github/workflows/deploy-pages.yml` construit et publie le site sur GitHub Pages lors d’un push vers `main` ou `master`. Adresse actuelle : <https://benhuruma.github.io/hmb-portfolio/>.

## Contact

- Email : benjaminhuruma@gmail.com
- Localisation : Goma, Nord-Kivu, RDC
