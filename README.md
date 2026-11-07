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

Le formulaire essaie d’envoyer les messages par une Supabase Edge Function utilisant Resend. Le lien mailto reste visible comme secours. **La liaison GitHub–Supabase ne déploie pas automatiquement cette fonction** : migration SQL, secrets et fonction doivent être configurés séparément. Procédez dans cet ordre.

#### Étape 1 — Préparer l’expéditeur dans Resend

1. Ouvrez <https://resend.com/>, connectez-vous ou créez un compte.
2. Dans Resend, ouvrez **Domains → Add Domain**. Ajoutez un domaine que vous possédez ou que vous êtes autorisé à administrer. Pour envoyer depuis `contact@exemple.com`, vérifiez le domaine `exemple.com`.
3. Resend fournit des enregistrements DNS, généralement SPF et DKIM. Ouvrez le panneau DNS de votre fournisseur de domaine, ajoutez les enregistrements exactement comme Resend les donne, puis attendez leur vérification. Revenez dans Resend et vérifiez que le domaine est marqué **Verified**. N’utilisez pas les valeurs d’exemple de ce README comme enregistrements DNS.
4. Dans **API Keys**, cliquez **Create API Key**, donnez-lui un nom reconnaissable et copiez la clé. Gardez-la secrète ; elle ne doit pas figurer dans Git, le frontend, un fichier `VITE_*` ni un message.
5. Notez votre adresse de réception (par exemple votre boîte Gmail) et l’adresse d’envoi sur le domaine vérifié (par exemple `Portfolio <contact@exemple.com>`). Le destinataire et l’expéditeur peuvent être différents.

#### Étape 2 — Exécuter la migration de limitation dans Supabase

1. Ouvrez <https://supabase.com/dashboard>, puis sélectionnez **le projet utilisé par ce portfolio**.
2. Dans la barre latérale du projet, cliquez **SQL Editor → New query**.
3. Dans cette fenêtre VS Code, ouvrez `supabase/migrations/20261107140000_add_contact_rate_limit.sql`, sélectionnez tout (`Ctrl+A`), copiez et collez dans SQL Editor.
4. Cliquez **Run**. Continuez seulement si Supabase confirme la réussite. Cette migration crée une table privée et une fonction SQL de limitation ; elle conserve des hashes salés, pas les adresses IP en clair.

#### Étape 3 — Ouvrir le terminal VS Code et lier la CLI au bon projet

1. Ouvrez dans VS Code le dossier `hmb-portfolio`, celui qui contient `package.json` et `supabase/`.
2. Choisissez **Terminal → New Terminal**. Le terminal intégré PowerShell doit être ouvert à la racine du dépôt. Sinon, utilisez `cd` pour entrer dans le dossier du dépôt.
3. Vérifiez Node.js et npm avec `node --version` et `npm --version`. Si l’une des commandes n’est pas reconnue, installez Node.js LTS, redémarrez VS Code et réessayez.
4. Dans le terminal intégré, lancez `npx supabase@latest login`. La CLI ouvre une page d’authentification ou demande un access token Supabase. Si elle demande un token, créez-le dans votre compte Supabase et collez-le uniquement dans le terminal. Ne le transmettez pas ici.
5. Trouvez le **Project Reference / Project ID** dans les réglages du projet. Il correspond à la partie avant `.supabase.co` dans `VITE_SUPABASE_URL` : `https://PROJECT_REF.supabase.co`.
6. Dans le terminal intégré, exécutez `npx supabase@latest link --project-ref PROJECT_REF`, en remplaçant `PROJECT_REF` par la valeur réelle. Si le CLI demande le mot de passe de la base, entrez celui du projet Supabase dans le terminal. Ce n’est ni le mot de passe Resend, ni la clé `service_role`.

La liaison du dépôt GitHub dans Supabase ne remplace pas ces étapes CLI et ne prouve pas que le dossier local est lié au même projet. Comparez toujours le Project Reference avec le domaine de `VITE_SUPABASE_URL` du dépôt `BenHuruma/hmb-portfolio`.

#### Étape 4 — Ajouter les secrets de l’Edge Function

Dans le tableau de bord Supabase, ouvrez **Edge Functions → Secrets**. Selon la version de l’interface, cette page peut aussi se trouver sous **Project Settings → Edge Functions → Secrets**. Ajoutez les noms suivants exactement, un par un :

| Nom du secret | Valeur à mettre |
| --- | --- |
| `RESEND_API_KEY` | La clé API créée dans Resend |
| `CONTACT_TO_EMAIL` | L’adresse qui doit recevoir les messages |
| `CONTACT_FROM_EMAIL` | Un expéditeur sur le domaine Resend vérifié, par exemple `Portfolio <contact@exemple.com>` |
| `CONTACT_RATE_LIMIT_SALT` | Une chaîne aléatoire privée d’au moins 32 octets, propre à ce projet |
| `ALLOWED_ORIGINS` | `https://benhuruma.github.io,http://localhost:5173` |

Pour générer un sel dans PowerShell, exécutez :

```powershell
[Convert]::ToHexString([System.Security.Cryptography.RandomNumberGenerator]::GetBytes(32))
```

Copiez la valeur affichée directement dans le secret `CONTACT_RATE_LIMIT_SALT`. Ne la mettez pas dans un fichier du dépôt.

Supabase fournit normalement `SUPABASE_URL` et `SUPABASE_SERVICE_ROLE_KEY` à l’environnement serveur des Edge Functions. La fonction utilise la clé `service_role` uniquement côté serveur pour appeler la fonction SQL de limitation. **Ne créez jamais une variable `VITE_SUPABASE_SERVICE_ROLE_KEY`, ne l’ajoutez pas aux secrets de build GitHub Actions et ne la mettez jamais dans le frontend.** Si les journaux indiquent que la variable système est absente, configurez-la uniquement dans les secrets Edge Function côté Supabase.

#### Étape 5 — Déployer l’Edge Function

Dans le terminal intégré VS Code, toujours à la racine du dépôt, exécutez :

```powershell
npx supabase@latest functions deploy contact-message --project-ref PROJECT_REF
```

Remplacez `PROJECT_REF` par la référence vérifiée à l’étape 3. Attendez le message de réussite. Puis, dans Supabase, ouvrez **Edge Functions** et vérifiez que `contact-message` apparaît avec un déploiement. Le workflow GitHub Pages publie le site statique ; cette commande publie la fonction côté Supabase : ce sont deux déploiements distincts.

#### Étape 6 — Tester l’envoi réel

1. Ouvrez <https://benhuruma.github.io/hmb-portfolio/>, allez à **Contact** et envoyez un message test depuis une adresse que vous pouvez consulter.
2. Vérifiez la boîte de réception et les indésirables de `CONTACT_TO_EMAIL`. Répondez au message reçu pour vérifier que Reply-To utilise l’adresse saisie par le visiteur.
3. Si l’envoi échoue, ouvrez **Supabase → Edge Functions → contact-message → Logs** et consultez **Resend → Emails/Logs**. Testez aussi le lien mailto de secours visible sous le formulaire.
4. La fonction limite un client à cinq messages par dix minutes et refuse l’envoi si la base de rate-limit est indisponible. Pour une exposition importante, ajoutez un CAPTCHA (par exemple Cloudflare Turnstile) et surveillez régulièrement les logs.

Les textes publics configurables, la navigation, les points forts et les certificats sont enregistrés dans le champ `site_copy` de `site_settings` et modifiables depuis l’administration en français. Google Translate est chargé uniquement lorsqu’un visiteur choisit une langue autre que le français. Les traductions et connexions externes nécessitent Internet. Les dix langues sont triées alphabétiquement : arabe, bengali, chinois, anglais, français, hindi, portugais, russe, espagnol et swahili. La langue par défaut est configurable dans l’administration. La photo d’accueil peut être fournie par URL ou téléversée (JPEG, PNG, WebP, GIF ou AVIF, 10 Mo maximum) ; le téléversement et la sauvegarde exigent une vérification sudo. Appliquez les migrations de `supabase/migrations` dans l’ordre chronologique. L’administration est limitée au compte autorisé par la base de données.

## Publication

Le workflow `.github/workflows/deploy-pages.yml` construit et publie le site sur GitHub Pages lors d’un push vers `main` ou `master`. Adresse actuelle : <https://benhuruma.github.io/hmb-portfolio/>.

## Contact

- Email : benjaminhuruma@gmail.com
- Localisation : Goma, Nord-Kivu, RDC
