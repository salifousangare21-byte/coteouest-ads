# Côte Ouest Ads — Espace annonceurs Novelas Avenue

Portail d'upload sécurisé permettant aux annonceurs de créer un compte,
déposer leurs créas publicitaires (vidéos et visuels, par format), et être
recontactés par l'équipe commerciale pour finaliser leur campagne sur la
chaîne YouTube Novelas Avenue.

**Ce que fait cette v1** : authentification, dépôt de fichiers, notification
de l'équipe. **Ce qu'elle ne fait pas** (volontairement, scope validé) :
paiement en ligne, sélection de formule avec panier, tableau de bord
administrateur. La vente reste manuelle par téléphone/email après réception
des créas.

## Stack

- **Next.js 16** (App Router, TypeScript, Tailwind v4)
- **Clerk** — authentification (inscription / connexion / session)
- **Cloudflare R2** — stockage des fichiers uploadés (upload direct depuis le
  navigateur via URL présignée)
- **Make.com** — récupère les fichiers depuis R2, les pousse vers Google
  Drive, notifie l'équipe commerciale
- **Cloudflare Workers** (via l'adaptateur OpenNext) — hébergement
- **OVH** — uniquement pour le DNS / nom de domaine

## Architecture du flux d'upload

```
Navigateur --upload direct--> Cloudflare R2
     |                             |
     | (apres upload)              | (declenche par notre backend)
     v                             v
Notre API (/api/submit) --webhook--> Make.com --> Google Drive
                                         |
                                         +--> Email equipe commerciale
```

Le navigateur n'envoie jamais le fichier à notre serveur : il obtient une URL
signée (`/api/upload-url`) puis envoie le fichier directement à R2. C'est ce
qui permet de gérer des vidéos volumineuses sans limite de taille côté
serveur applicatif.

---

## 1. Installation locale

Prérequis : Node.js 20+, npm.

```powershell
git clone <url-du-repo> coteouest-ads
cd coteouest-ads
npm install
copy .env.local.example .env.local
```

Remplis ensuite `.env.local` avec les vraies valeurs (étapes 2 à 4 ci-dessous),
puis :

```powershell
npm run dev
```

L'app tourne sur http://localhost:3000.

---

## 2. Configurer Clerk (authentification)

1. Va sur dashboard.clerk.com -> crée une application (ex: "Côte Ouest Ads")
2. **API Keys** -> copie la `Publishable key` et la `Secret key` dans
   `.env.local` :
   ```
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...
   CLERK_SECRET_KEY=sk_live_...
   ```
3. Dans **Paths**, vérifie que les URLs correspondent à celles du `.env.local`
   (`/sign-in`, `/sign-up`, redirection après connexion vers `/dashboard`)
4. Une fois en production, ajoute ton domaine final (ex: `ads.coteouest.tv`)
   dans **Domains** côté Clerk

---

## 3. Configurer Cloudflare R2 (stockage des créas)

1. Dashboard Cloudflare -> **R2** -> **Create bucket** -> nomme-le
   `coteouest-ads-uploads` (ou adapte `R2_BUCKET_NAME` en conséquence)
2. **Manage R2 API Tokens** -> **Create API Token** -> permissions "Object
   Read & Write", limité à ce bucket
3. Copie les 3 valeurs générées dans `.env.local` :
   ```
   R2_ACCOUNT_ID=...
   R2_ACCESS_KEY_ID=...
   R2_SECRET_ACCESS_KEY=...
   ```
4. (Optionnel mais recommandé) Active l'accès public en lecture sur le bucket
   si tu veux que Make puisse retélécharger les fichiers par simple URL --
   sinon Make peut aussi les récupérer via l'API S3/R2 directement avec les
   mêmes clés. Copie l'URL publique dans `R2_PUBLIC_URL`.

---

## 4. Configurer le scénario Make.com

Crée un scénario avec :

1. **Webhook** (module de déclenchement) -- génère une URL, colle-la dans
   `MAKE_WEBHOOK_URL` du `.env.local`. C'est cette URL que notre backend
   appelle une fois l'upload terminé.

   Le webhook reçoit ce payload :
   ```json
   {
     "user_id": "...",
     "email": "...",
     "entreprise": "...",
     "contact": "...",
     "telephone": "...",
     "formule": "Premium — 60 spots",
     "message": "...",
     "fichiers": [
       { "format": "16-9", "nom_original": "spot.mp4", "cle_r2": "user_xxx/167...-16-9-spot.mp4", "url": "https://pub-xxx.r2.dev/...", "bucket": "coteouest-ads-uploads" }
     ],
     "soumis_le": "2026-09-03T..."
   }
   ```

2. **HTTP > Get a file** (ou **Google Drive > Upload a file** avec l'URL du
   fichier) pour chaque élément du tableau `fichiers` -- télécharge le fichier
   depuis R2
3. **Google Drive > Upload a file** -- dépose-le dans un dossier dédié à
   l'annonceur (crée le dossier au nom de `entreprise` s'il n'existe pas)
4. **Email > Send an email** -- notifie l'équipe commerciale avec les
   coordonnées de l'annonceur pour le suivi manuel

---

## 5. Déploiement sur Cloudflare (GitHub + PowerShell)

**Une fois, pour connecter Wrangler à ton compte Cloudflare :**

```powershell
npx wrangler login
```

**Créer le projet Worker (une seule fois) :**

```powershell
npm run cf-build
npx wrangler deploy
```

Note le nom du Worker et son URL `*.workers.dev` affichés à la fin.

**Configurer les variables d'environnement de production** (ne pas mettre de
secrets dans `wrangler.toml`, qui est versionné) :

```powershell
npx wrangler secret put CLERK_SECRET_KEY
npx wrangler secret put R2_ACCESS_KEY_ID
npx wrangler secret put R2_SECRET_ACCESS_KEY
npx wrangler secret put MAKE_WEBHOOK_URL
```

(Chaque commande te demande la valeur en interactif.) Les variables
`NEXT_PUBLIC_*` doivent, elles, être définies dans `wrangler.toml` sous
`[vars]` ou dans le dashboard Cloudflare (Worker -> Settings -> Variables),
car elles sont injectées au moment du build.

**Déploiements suivants**, à chaque mise à jour du code :

```powershell
git add .
git commit -m "describe ton changement"
git push
npm run deploy
```

Pour automatiser complètement (déploiement à chaque push GitHub, sans lancer
la commande à la main), connecte le repo dans **Cloudflare Dashboard ->
Workers & Pages -> ton projet -> Settings -> Builds** -- Cloudflare peut alors
builder et déployer automatiquement sur chaque push vers `main`.

---

## 6. DNS chez OVH

Une fois le Worker déployé (tu as une URL `xxx.workers.dev`) :

1. Dashboard Cloudflare -> ton Worker -> **Settings -> Domains & Routes ->
   Add Custom Domain** -> renseigne ex. `ads.coteouest.tv`
2. Chez OVH (zone DNS de `coteouest.tv`), ajoute l'enregistrement CNAME que
   Cloudflare t'indique (même principe que pour
   `micro-drama.coteouest.tv`)

---

## Limites connues de cette v1

- Le middleware Clerk (`src/proxy.ts`) tourne en runtime Node.js sur
  Cloudflare Workers, un mode encore marqué **expérimental** par l'adaptateur
  OpenNext. Fonctionnel, mais à surveiller si Cloudflare ou OpenNext changent
  leurs recommandations.
- Pas d'historique des dépôts précédents visible par l'annonceur -- chaque
  visite sur `/dashboard` présente un formulaire vierge. Une table
  "soumissions" (D1 ou autre) serait la prochaine étape naturelle si ce
  besoin apparaît.
- Pas de limite de taille de fichier appliquée côté app (au-delà des limites
  propres à R2). À ajouter si des créas anormalement volumineuses posent
  problème en pratique.
