# Portfolio — Benjamin Huruma

Portfolio personnel présentant mon profil, mes compétences, ma formation, mes réalisations et mes coordonnées.

## Fonctionnalités

- Site responsive avec thèmes clair et sombre.
- Sections profil, compétences, formation, réalisations et contact.
- Interface en français, anglais et swahili avec préférence de langue par visiteur.
- Espace d’administration pour modifier le contenu du portfolio.
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

Les textes publics configurables, la navigation, les points forts et les certificats sont enregistrés dans le champ `site_copy` de `site_settings` et modifiables depuis l’administration. Les traductions et la langue par défaut sont également gérées depuis l’administration. Appliquez les migrations de `supabase/migrations` dans l’ordre chronologique. L’administration est limitée au compte autorisé par la base de données.

## Publication

Le workflow `.github/workflows/deploy-pages.yml` construit et publie le site sur GitHub Pages lors d’un push vers `main` ou `master`. Adresse actuelle : <https://benhuruma.github.io/hmb-portfolio/>.

## Contact

- Email : benjaminhuruma@gmail.com
- Localisation : Goma, Nord-Kivu, RDC
