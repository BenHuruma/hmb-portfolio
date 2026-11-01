# My Portfolio 2.0 — Benjamin Huruma

Portfolio personnel déployable gratuitement sur GitHub Pages. Le site public fonctionne sans backend avec son contenu statique intégré ; Supabase est optionnel pour l’administration et les mises à jour dynamiques.

## Aperçu

- **Site public** : présentation, compétences, formation, réalisations et contact
- **Administration** à `/admin` : connexion réservée à l’unique compte explicitement autorisé
- **Contenu public** : contenu statique de secours intégré ; Supabase peut fournir des réglages dynamiques
- **CV** : lien Google Drive ou fichier PDF/DOC/DOCX téléversé dans Supabase Storage (10 Mo maximum)
- **Thème sombre/clair**, animations et mise en page responsive
- **Traduction à la demande** du français vers l’anglais par le widget Google Translate ; le français reste la langue source et les données enregistrées ne sont pas modifiées
- **Contact** : prépare un email dans le logiciel de messagerie du visiteur (`mailto:`)

## Technologies

- React + TypeScript + Vite
- React Router (navigation publique et routes admin)
- Supabase Auth, PostgreSQL avec RLS et Supabase Storage

## Installation

```bash
npm install
npm run dev
```

## Administration optionnelle

Le portfolio public n’a pas besoin de Supabase. Sans configuration valide, il affiche automatiquement le contenu statique intégré ; la connexion et les modifications dans `/admin` restent indisponibles.

Pour activer l’administration :

1. Créez un projet Supabase et copiez son URL ainsi que sa clé anon/publishable dans `.env`, à partir de `.env.example`. Ne mettez jamais la clé `service_role` dans le frontend.
2. Appliquez toutes les migrations SQL du dossier `supabase/migrations`.
3. Créez/invitez le compte qui sera l’unique administrateur. Ensuite, désactivez **Allow new users to sign up** dans Supabase Auth et ne partagez pas ce compte.
4. Dans le SQL Editor Supabase, ajoutez son identifiant à l’allowlist en remplaçant l’adresse ci-dessous par son email exact :

	```sql
	INSERT INTO public.portfolio_admin (id, user_id)
	SELECT 1, id FROM auth.users WHERE email = 'ADMIN_EMAIL'
	ON CONFLICT (id) DO UPDATE SET user_id = EXCLUDED.user_id;
	```

	Vérifiez que la requête a inséré ou modifié exactement une ligne et que l’email correspond au compte voulu. La contrainte `id = 1`, l’unicité de `user_id` et l’absence de privilèges SQL côté client empêchent d’ajouter un second administrateur depuis l’application.
5. Connectez-vous avec ce compte sur `/admin`.

La route de l’application et les politiques RLS/Storage vérifient toutes l’UUID de cette ligne. Masquer le formulaire d’inscription côté interface ne suffit pas à sécuriser les données : gardez les migrations appliquées et l’inscription Supabase désactivée. Les fournisseurs OAuth ne donnent accès que si l’identité Auth correspond exactement à l’UUID autorisé.

## Hébergement gratuit sur GitHub Pages

Le workflow `.github/workflows/deploy-pages.yml` construit et publie automatiquement le site à chaque push sur `main` ou `master` :

1. Poussez le dépôt sur GitHub.
2. Dans **Settings → Pages**, choisissez **GitHub Actions** comme source de publication.
3. Le workflow publie le site à `https://benhuruma.github.io/hmb-portfolio/` après son premier passage réussi.

Le chemin du dépôt, les images locales, les routes admin et leur rechargement sont configurés pour GitHub Pages. Le workflow ajoute une page de repli pour React Router. Aucun coût d’hébergement ni secret Supabase n’est requis pour publier le portfolio public. Le bouton de traduction utilise un service Google tiers : Internet est requis, et le texte visible de la page est transmis à Google pour traduction.

Pour activer Supabase en production, ajoutez `VITE_SUPABASE_URL` et `VITE_SUPABASE_ANON_KEY` dans **Settings → Secrets and variables → Actions** comme secrets du dépôt. Pour ce dépôt, l’adresse Pages est `https://benhuruma.github.io/hmb-portfolio/`. Ajoutez cette adresse comme **Site URL** dans Supabase Auth, puis ajoutez `https://benhuruma.github.io/hmb-portfolio/admin/dashboard` aux **Redirect URLs** autorisées. La clé anon/publishable est visible dans le JavaScript livré au navigateur ; ne configurez jamais `service_role` comme variable `VITE_*`.

### Configurer la connexion OAuth GitHub et Google

Pour chaque fournisseur, configurez deux destinations différentes :

- **Callback du fournisseur OAuth** : l’URL de callback Supabase affichée dans **Authentication → Sign In / Providers**. Elle a habituellement la forme `https://<PROJECT_REF>.supabase.co/auth/v1/callback`. Copiez exactement l’URL affichée dans votre projet.
- **URL de retour vers le portfolio** : dans **Authentication → URL Configuration → Redirect URLs**, autorisez `https://benhuruma.github.io/hmb-portfolio/admin/dashboard` (et l’URL localhost exacte si vous testez en local). Le code de l’application redirige l’utilisateur vers cette route après l’authentification.

Pour **GitHub** :

1. Dans GitHub, ouvrez **Settings → Developer settings → OAuth Apps → New OAuth App**.
2. Saisissez le nom public du portfolio, sa page d’accueil `https://benhuruma.github.io/hmb-portfolio/` et, dans **Authorization callback URL**, collez le callback Supabase affiché pour le fournisseur GitHub.
3. Enregistrez l’application, puis copiez son **Client ID** et générez un **Client secret**.
4. Dans Supabase, ouvrez **Authentication → Sign In / Providers → GitHub**, activez le fournisseur et collez le Client ID et le Client secret. Enregistrez.

Pour **Google** :

1. Dans Google Cloud Console, créez ou sélectionnez un projet et ouvrez **Google Auth Platform**. Configurez la marque et l’écran de consentement avec le nom de l’application et les informations demandées. En mode test, ajoutez le compte Google administrateur dans **Test users**.
2. Dans **Clients**, créez un client OAuth de type **Web application**.
3. Dans **Authorized redirect URIs**, collez le callback Supabase affiché pour le fournisseur Google. Ne mettez pas l’URL du portfolio dans ce champ.
4. Créez le client, puis copiez le Client ID et le Client secret dans **Supabase → Authentication → Sign In / Providers → Google**. Activez le fournisseur et enregistrez.

Après configuration, vérifiez dans **Authentication → Users** que la connexion OAuth correspond au compte autorisé dans `portfolio_admin`. L’accès administrateur dépend de l’UUID du compte Supabase, pas seulement de l’adresse email. Si le fournisseur crée un utilisateur avec un UUID différent, cet utilisateur ne sera pas administrateur tant que la ligne unique `portfolio_admin` n’aura pas été provisionnée pour le bon UUID par un administrateur de base de données. Gardez les inscriptions publiques désactivées et ne partagez jamais les secrets OAuth.

### Remplacer un ancien portfolio déjà publié

Pour conserver l’URL de l’ancien site, le nouveau code doit être publié depuis **le dépôt qui contrôle déjà cette URL** (ou depuis un dépôt configuré pour le même domaine personnalisé) :

1. Fais une sauvegarde de l’ancien dépôt ou crée une branche de sauvegarde avant de remplacer ses fichiers.
2. Copie les fichiers de ce portfolio dans le dépôt qui publie déjà l’ancien site, y compris les fichiers cachés `.github/workflows/deploy-pages.yml`, `.gitignore` et `.nojekyll`. Ne copie pas `.git`, `node_modules`, `dist` ni `.env`.
3. Garde le nom et l’historique du dépôt cible. Le build détecte automatiquement son nom dans GitHub Actions : un site utilisateur/organisation utilise la racine du domaine, tandis qu’un site de projet utilise le chemin de son dépôt.
4. Pousse les changements sur la branche configurée dans le workflow (`main` ou `master` par défaut), puis vérifie que **Settings → Pages → Source** est réglé sur **GitHub Actions**.
5. Attends que l’action **Deploy portfolio to GitHub Pages** réussisse ; l’ancien contenu est alors remplacé à la même adresse. Si l’ancien dépôt utilise une autre branche par défaut, adapte le déclencheur `on.push.branches` du workflow à son nom.

Le dépôt actuel publie à `https://benhuruma.github.io/hmb-portfolio/`. Si vous remplacez un autre dépôt historique, son nom ou son domaine personnalisé détermine l’adresse à conserver.

## Contact

- Email: benjaminhuruma@gmail.com
- Localisation: Goma, Nord-Kivu, RDC
