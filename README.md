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

Le site met en cache sur l’appareil du visiteur les derniers réglages lus avec succès dans Supabase et les affiche si le backend est momentanément indisponible. Ce cache est local à chaque navigateur ; il ne remplace pas une copie globale de la base. L’administration désactive toute sauvegarde lorsqu’elle affiche ce contenu de secours. La première visite d’un nouvel appareil sans Supabase utilise toujours les valeurs intégrées au code.

### Activer l’envoi direct du formulaire de contact

Le formulaire envoie par défaut à la fonction Supabase `contact-message`. Le lien mailto reste visible comme secours. Pour activer l’envoi :

1. **Créer le compte d’envoi Resend.** Dans Resend, ajoutez et vérifiez un domaine que vous contrôlez. Créez une API key réservée à l’envoi. Conservez-la secrète.
2. **Appliquer la migration de limitation de débit.** Dans le projet Supabase lié au portfolio, ouvrez **SQL Editor → New query**. Copiez le contenu de `supabase/migrations/20261107140000_add_contact_rate_limit.sql`, exécutez-le et vérifiez qu’il réussit. La table ne conserve qu’un hash salé des adresses clients, pas leur IP en clair.
3. **Vérifier le déploiement de la fonction.** Le dépôt connecté à GitHub ne déploie pas automatiquement une Edge Function, sauf si un workflow dédié a été configuré. Depuis un terminal avec la Supabase CLI installée, connectez le CLI à l’organisation, liez le projet correspondant à l’URL `VITE_SUPABASE_URL`, puis exécutez `supabase functions deploy contact-message`. Vérifiez dans **Supabase → Edge Functions** que `contact-message` est déployée.
4. **Définir les secrets de la fonction.** Dans **Supabase → Edge Functions → Secrets**, ajoutez :
	- `RESEND_API_KEY` : la clé API Resend ;
	- `CONTACT_TO_EMAIL` : votre adresse qui reçoit les messages ;
	- `CONTACT_FROM_EMAIL` : une adresse d’expédition sur le domaine vérifié, par exemple `Portfolio <contact@votre-domaine.example>` ;
	- `CONTACT_RATE_LIMIT_SALT` : une chaîne aléatoire longue, privée et propre à ce projet (au moins 32 octets aléatoires) ;
	- facultatif `ALLOWED_ORIGINS` : origines séparées par des virgules. La valeur par défaut comprend `https://benhuruma.github.io` et `http://localhost:5173`.

	Supabase fournit normalement `SUPABASE_URL` et `SUPABASE_SERVICE_ROLE_KEY` à l’environnement serveur des Edge Functions. La fonction utilise cette dernière uniquement côté serveur pour appeler la fonction SQL de limitation de débit. **Ne la copiez jamais dans le frontend, dans GitHub Pages ou dans une variable `VITE_*`.**
5. **Tester.** Ouvrez le portfolio déployé, envoyez un message de test et vérifiez sa réception. Testez également le lien mailto de secours. La fonction applique une limite de 5 demandes par adresse hachée sur 10 minutes ; en cas d’erreur de configuration ou de base de données, elle bloque l’envoi plutôt que de fonctionner sans limite. Pour une exposition importante, ajoutez un CAPTCHA et surveillez les journaux Edge Functions.

Si le projet est seulement « lié » à GitHub dans le tableau de bord Supabase, cela ne garantit pas que la fonction Edge est déployée. Confirmez le déploiement dans **Edge Functions** ; les migrations SQL et le déploiement de fonction sont deux opérations distinctes sauf si votre dépôt possède des workflows explicites pour les automatiser.

Les textes publics configurables, la navigation, les points forts et les certificats sont enregistrés dans le champ `site_copy` de `site_settings` et modifiables depuis l’administration en français. Google Translate est chargé uniquement lorsqu’un visiteur choisit une langue autre que le français. Les traductions et connexions externes nécessitent Internet. Les dix langues sont triées alphabétiquement : arabe, bengali, chinois, anglais, français, hindi, portugais, russe, espagnol et swahili. La langue par défaut est configurable dans l’administration. La photo d’accueil peut être fournie par URL ou téléversée (JPEG, PNG, WebP, GIF ou AVIF, 10 Mo maximum) ; le téléversement et la sauvegarde exigent une vérification sudo. Appliquez les migrations de `supabase/migrations` dans l’ordre chronologique. L’administration est limitée au compte autorisé par la base de données.

## Publication

Le workflow `.github/workflows/deploy-pages.yml` construit et publie le site sur GitHub Pages lors d’un push vers `main` ou `master`. Adresse actuelle : <https://benhuruma.github.io/hmb-portfolio/>.

## Contact

- Email : benjaminhuruma@gmail.com
- Localisation : Goma, Nord-Kivu, RDC
