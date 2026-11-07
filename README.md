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

### Activer l’envoi direct et la protection anti-bots du formulaire

Le formulaire envoie par une Edge Function Supabase. Quand la clé Resend est configurée, Resend est tenté **deux fois** avec la même clé d’idempotence. Si les deux requêtes échouent, le navigateur ouvre un brouillon mailto prérempli ; le lien mailto reste aussi visible sous le formulaire. Si la clé Resend est absente, la fonction détecte la configuration manquante sans requête fournisseur et passe directement au mailto. Un CAPTCHA invalide, un honeypot rempli, une origine interdite ou une limite atteinte ne déclenchent jamais le fallback automatique. La protection CAPTCHA est activée par défaut dans **Admin → Sécurité**. La liaison GitHub–Supabase seule ne déploie ni la fonction, ni ses secrets, ni les migrations.

#### 1. Configurer un expéditeur Resend gratuit

1. Dans VS Code, gardez ouvert le dépôt `hmb-portfolio`. Ouvrez un navigateur et allez sur <https://resend.com/>. Créez/connectez-vous à votre compte.
2. Dans Resend, ouvrez **Domains → Add Domain** et ajoutez un domaine que vous contrôlez. Resend ne permet pas de choisir librement une adresse Gmail comme expéditeur vérifié ; utilisez une adresse sur le domaine que vous vérifierez.
3. Resend affiche les enregistrements DNS à créer (notamment SPF et DKIM). Ouvrez le site où vous gérez le DNS de votre domaine, créez les enregistrements exactement comme indiqués, puis attendez que Resend marque le domaine **Verified**.
4. Dans Resend, ouvrez **API Keys → Create API Key**. Copiez la clé une seule fois et gardez-la secrète. Pour le forfait gratuit, vérifiez dans le tableau de bord Resend les quotas et restrictions actuels ; la fonction ne peut pas contourner ces limites.
5. Notez `CONTACT_FROM_EMAIL`, par exemple `Portfolio <contact@votre-domaine.example>`, et `CONTACT_TO_EMAIL`, votre boîte de réception. Le domaine de l’expéditeur doit être celui que Resend a vérifié.
6. Si Resend indique que votre compte est en mode test, l’envoi peut être limité à l’adresse propriétaire du compte. Respectez le destinataire de test affiché par Resend et vérifiez le domaine avant d’essayer d’envoyer vers une autre boîte. Le forfait gratuit ne supprime pas cette restriction éventuelle.

#### 2. Créer le CAPTCHA gratuit Cloudflare Turnstile

1. Ouvrez <https://dash.cloudflare.com/> et connectez-vous/créez un compte gratuit.
2. Dans le tableau de bord, ouvrez **Turnstile → Add widget**.
3. Donnez-lui un nom, choisissez le mode **Managed**, puis ajoutez les domaines `benhuruma.github.io` et, pour les essais locaux, `localhost`. Enregistrez.
4. Copiez les deux valeurs fournies : **Site Key** et **Secret Key**. La Site Key est publique ; la Secret Key est confidentielle. Le mode administré affiche un défi supplémentaire lorsqu’il le juge nécessaire ; aucun CAPTCHA ne garantit à lui seul que chaque visiteur est humain.

#### 3. Appliquer les migrations SQL dans le bon ordre

1. Ouvrez <https://supabase.com/dashboard> et sélectionnez le projet correspondant à `VITE_SUPABASE_URL` du dépôt.
2. Dans le menu de ce projet, choisissez **SQL Editor → New query**.
3. Depuis VS Code, ouvrez `supabase/migrations/20261107140000_add_contact_rate_limit.sql`, faites `Ctrl+A`, `Ctrl+C`, collez tout le SQL dans la nouvelle requête et cliquez **Run**. Attendez un succès.
4. Recommencez dans une nouvelle requête avec `supabase/migrations/20261107150000_add_contact_security_settings.sql`.
5. Vérifiez qu’aucune requête n’a affiché d’erreur. La première migration ajoute le stockage privé de limitation ; la seconde ajoute les options CAPTCHA publiques et activées par défaut. Les secrets ne sont pas dans ces migrations.

#### 4. Ajouter les secrets au projet Supabase

1. Dans Supabase, toujours dans le bon projet, ouvrez **Edge Functions → Secrets** (selon l’interface : **Project Settings → Edge Functions → Secrets**).
2. Ajoutez ces secrets **un par un**, exactement sous ces noms :

| Nom | Valeur |
| --- | --- |
| `RESEND_API_KEY` | Clé API créée dans Resend |
| `CONTACT_FROM_EMAIL` | Adresse expéditrice du domaine vérifié, ex. `Portfolio <contact@votre-domaine.example>` |
| `CONTACT_TO_EMAIL` | Boîte où vous voulez recevoir les messages |
| `TURNSTILE_SECRET_KEY` | Secret Key donnée par Cloudflare Turnstile |
| `CONTACT_RATE_LIMIT_SALT` | Secret aléatoire propre au projet, d’au moins 32 octets |
| `ALLOWED_ORIGINS` | `https://benhuruma.github.io,http://localhost:5173` |

Pour générer `CONTACT_RATE_LIMIT_SALT` dans PowerShell intégré à VS Code, exécutez :

```powershell
[Convert]::ToHexString([System.Security.Cryptography.RandomNumberGenerator]::GetBytes(32))
```

Collez la valeur directement dans le secret Supabase. Ne l’enregistrez ni dans README, ni dans Git, ni dans un `.env` du frontend. Supabase fournit à la fonction `SUPABASE_URL` et `SUPABASE_SERVICE_ROLE_KEY`; la fonction emploie la clé service uniquement côté serveur pour appeler la limitation SQL. **Ne créez jamais `VITE_SUPABASE_SERVICE_ROLE_KEY` et ne copiez aucune clé Resend/Turnstile secrète dans GitHub Actions ou le code React.**

#### 5. Relier le dépôt dans VS Code et déployer la fonction

La connexion du projet Supabase à GitHub ne déploie pas forcément les Edge Functions. Il faut publier explicitement la fonction :

1. Dans VS Code, ouvrez **Terminal → New Terminal**, et vérifiez que le dossier courant est la racine `hmb-portfolio` (celle qui contient `package.json` et `supabase/`).
2. Vérifiez `node --version` et `npm --version`. Puis authentifiez la CLI :

	```powershell
	npx supabase@latest login
	```

	Si un navigateur s’ouvre, connectez-vous à Supabase. Si la CLI demande un access token, créez-le dans les paramètres de votre compte Supabase et collez-le uniquement dans ce terminal.
3. Dans Supabase **Project Settings → General**, copiez le **Project Reference**. Comparez-le au sous-domaine avant `.supabase.co` de `VITE_SUPABASE_URL` afin de ne pas déployer sur un autre projet.
4. Dans le terminal VS Code, liez précisément le dépôt local à ce projet :

	```powershell
	npx supabase@latest link --project-ref VOTRE_PROJECT_REF
	```

	Remplacez `VOTRE_PROJECT_REF` par la vraie référence. Si la CLI demande le mot de passe de la base, saisissez-le dans le terminal ; ne le partagez pas.
5. Déployez la fonction :

	```powershell
	npx supabase@latest functions deploy contact-message --project-ref VOTRE_PROJECT_REF
	```

6. Dans Supabase, ouvrez **Edge Functions** et vérifiez que `contact-message` est listée comme déployée. GitHub Actions ne publie que le site statique ; cette commande publie la fonction sur Supabase.

#### 6. Configurer la section Sécurité de l’admin

1. Ouvrez l’administration du site et allez dans l’onglet **Sécurité**.
2. Laissez **Activer le CAPTCHA Cloudflare Turnstile** coché. Collez la **Site Key** Cloudflare dans le champ **Clé publique Turnstile**. Ne collez pas sa Secret Key dans ce champ.
3. Laissez aussi **Activer le champ honeypot** coché. Il est invisible aux visiteurs normaux et filtrera certains bots simples. Les deux options sont revérifiées par la fonction serveur à chaque demande ; une modification côté navigateur ne permet pas de désactiver la protection serveur.
4. Cliquez sur **Enregistrer les modifications** et confirmez avec le sudo. Toutes les modifications de configuration restent protégées par sudo.

#### 7. Tester l’envoi et le secours mailto

1. Ouvrez <https://benhuruma.github.io/hmb-portfolio/>, allez à Contact, remplissez le formulaire et complétez le défi Turnstile.
2. Vérifiez la boîte `CONTACT_TO_EMAIL`, y compris les spams. Répondez au message pour vérifier l’adresse Reply-To du visiteur.
3. Si Resend échoue, la fonction le tente deux fois, puis ouvre un brouillon mailto ; si le navigateur n’a pas d’application mail, cliquez sur le lien de secours visible sous le formulaire et copiez/envoyez le texte dans votre messagerie.
4. Si le CAPTCHA est refusé, si la limite (5 demandes par 10 minutes) est dépassée ou si la vérification de sécurité est indisponible, le formulaire **ne contourne pas cette protection par un envoi automatique**. Le visiteur peut toujours utiliser explicitement le mailto de secours.
5. En cas d’échec, consultez **Supabase → Edge Functions → contact-message → Logs** et **Resend → Emails/Logs**. Ne publiez pas les secrets ni les jetons CAPTCHA dans un ticket ou une capture.

Les options CAPTCHA et honeypot sont configurables dans la section **Sécurité** du tableau de bord et sauvegardées avec sudo. Les secrets Resend et Turnstile ne sont configurables que dans les secrets côté serveur de Supabase.

Les textes publics configurables, la navigation, les points forts et les certificats sont enregistrés dans le champ `site_copy` de `site_settings` et modifiables depuis l’administration en français. Google Translate est chargé uniquement lorsqu’un visiteur choisit une langue autre que le français. Les traductions et connexions externes nécessitent Internet. Les dix langues sont triées alphabétiquement : arabe, bengali, chinois, anglais, français, hindi, portugais, russe, espagnol et swahili. La langue par défaut est configurable dans l’administration. La photo d’accueil peut être fournie par URL ou téléversée (JPEG, PNG, WebP, GIF ou AVIF, 10 Mo maximum) ; le téléversement et la sauvegarde exigent une vérification sudo. Appliquez les migrations de `supabase/migrations` dans l’ordre chronologique. L’administration est limitée au compte autorisé par la base de données.

## Publication

Le workflow `.github/workflows/deploy-pages.yml` construit et publie le site sur GitHub Pages lors d’un push vers `main` ou `master`. Adresse actuelle : <https://benhuruma.github.io/hmb-portfolio/>.

## Contact

- Email : benjaminhuruma@gmail.com
- Localisation : Goma, Nord-Kivu, RDC
