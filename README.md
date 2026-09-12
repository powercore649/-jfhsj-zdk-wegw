# Relay — Botlist Discord moderne

Annuaire de bots **et de serveurs** Discord avec connexion Discord (OAuth2),
tableau de bord utilisateur, gestion des serveurs (ajout du bot en un clic) et
soumission / gestion de bots et de serveurs. Construit avec Next.js 14 (App
Router), NextAuth, Prisma et Tailwind CSS.

## Fonctionnalités

- Connexion via Discord (NextAuth, scopes `identify email guilds`)
- **Botlist** (page d'accueil `/`) : recherche, filtre par tags, tri (populaires / nouveautés)
- **Server list** (`/servers`, à la Disboard) : même principe mais pour des serveurs Discord, avec les vraies icônes de serveur (CDN Discord) — page totalement séparée du botlist
- Page bot (`/bots/[id]`) : description, statistiques, vote (cooldown 12h), bouton "Ajouter au serveur"
- Page serveur (`/servers/[id]`) : description, statistiques, vote (cooldown 12h), bouton "Rejoindre le serveur" (lien d'invitation Discord fourni par l'auteur)
- Dashboard :
  - **Mes serveurs** — liste des serveurs Discord où l'utilisateur est admin. Le bouton "Ajouter le bot" ouvre l'invitation, puis "Vérifier l'ajout" confirme *réellement* (via le token du bot) que le bot est présent et débloque la page de gestion (`/dashboard/manage/[guildId]`) : préfixe, salon + message de bienvenue, rôle automatique, et un bouton "Synchroniser" qui va chercher le vrai nombre de membres sur Discord et met à jour l'annonce publique si le serveur est listé
  - un raccourci pour lister ce serveur dans l'annuaire public
  - **Serveurs listés** — serveurs soumis par l'utilisateur à l'annuaire public, statut de validation
  - **Mes bots** — bots soumis par l'utilisateur, statut de validation
  - **Ajouter un bot** — formulaire de soumission (nom, description, tags, préfixe, liens)
  - **Lister un serveur** — formulaire de soumission (nom, description, tags, lien d'invitation)
  - **Gérer un bot / un serveur** — édition / suppression
  - **Paramètres** — infos du compte Discord connecté
- Administration : validation/refus et mise en avant, avec un onglet dédié Bots / Serveurs
- API REST interne (`/api/bots`, `/api/bots/[id]`, `/api/bots/[id]/vote`, `/api/servers`, `/api/servers/[id]`, `/api/servers/[id]/vote`, `/api/discord/guilds`)

## 1. Créer l'application Discord

1. Va sur https://discord.com/developers/applications → **New Application**.
2. Section **OAuth2** :
   - Ajoute une *Redirect URL* : `https://TON_DOMAINE/api/auth/callback/discord` (et `http://localhost:3000/api/auth/callback/discord` en local).
   - Récupère le **Client ID** et le **Client Secret**.
3. Section **Bot** : crée un bot si tu veux aussi permettre son installation directe (le "Client ID" est aussi utilisé comme identifiant du bot pour les liens d'invitation).

## 2. Configuration

Copie `.env.example` vers `.env` et remplis :

```
DISCORD_CLIENT_ID=...
DISCORD_CLIENT_SECRET=...
DISCORD_BOT_ID=...                # généralement identique au CLIENT_ID
DISCORD_BOT_PERMISSIONS=8         # permissions demandées à l'invitation

NEXTAUTH_URL=https://ton-domaine.com
NEXTAUTH_SECRET=...               # openssl rand -base64 32

DATABASE_URL=postgresql://...

NEXT_PUBLIC_DISCORD_BOT_ID=...              # même valeur que DISCORD_BOT_ID
NEXT_PUBLIC_DISCORD_BOT_PERMISSIONS=8
```

## 3. Base de données

Le schéma Prisma (`prisma/schema.prisma`) utilise PostgreSQL par défaut.

```bash
npm install
npx prisma migrate dev --name init
npx prisma db seed   # optionnel, ajoute 3 bots + 2 serveurs de démo
```

> Si tu mets à jour un projet existant après avoir tiré cette fonctionnalité,
> relance simplement `npx prisma migrate dev --name add_managed_guilds` pour
> créer les tables `Server`, `ServerVote` et `ManagedGuild` — aucune donnée
> existante n'est affectée. Pense aussi à renseigner `DISCORD_BOT_TOKEN` dans
> `.env` (onglet "Bot" de ton app sur https://discord.com/developers/applications),
> sinon la vérification du bot renverra une erreur claire au lieu de planter.

> Pour héberger sur un serveur avec disque persistant (typiquement Orihost),
> tu peux remplacer `provider = "postgresql"` par `provider = "sqlite"` dans
> `prisma/schema.prisma` et utiliser `DATABASE_URL="file:./prod.db"`. Sur
> Vercel (serverless, disque non persistant), utilise plutôt un Postgres
> managé (Vercel Postgres, Neon, Supabase, Railway...).

## 4. Déploiement sur Vercel

1. Pousse le projet sur GitHub.
2. Sur https://vercel.com → **New Project** → importe le dépôt.
3. Renseigne les variables d'environnement (celles du `.env`) dans
   **Settings → Environment Variables**.
4. Vercel détecte Next.js automatiquement. La commande de build
   (`prisma generate && prisma migrate deploy && next build`) est déjà
   définie dans `package.json`.
5. Mets à jour `NEXTAUTH_URL` avec l'URL Vercel finale, ainsi que la
   *Redirect URL* dans le portail développeur Discord.

## 5. Déploiement sur Orihost

Orihost permet d'héberger une application Node.js classique :

1. Crée une nouvelle instance Node.js (Node 18+).
2. Uploade le contenu du projet (ou connecte le dépôt Git si l'option existe).
3. Dans le panneau, configure les variables d'environnement listées
   ci-dessus (mêmes valeurs que sur Vercel, avec `NEXTAUTH_URL` pointant
   vers ton domaine Orihost).
4. Définis la commande d'installation : `npm install`
5. Définis la commande de build : `npm run build`
6. Définis la commande de démarrage : `npm start`
   (Next.js écoute par défaut sur le port `3000` ; si Orihost impose un
   port via une variable `PORT`, Next.js le respecte automatiquement.)
7. Si tu utilises SQLite (disque persistant Orihost), pense à committer le
   dossier `prisma/migrations` généré en local puis lancer
   `npx prisma migrate deploy` au premier démarrage (peut être ajouté à la
   commande de build).

## Structure du projet

```
src/
  app/
    page.tsx                 Accueil (liste + recherche)
    bots/[id]/page.tsx        Page détail d'un bot
    login/page.tsx            Connexion Discord
    dashboard/                Espace utilisateur connecté
      servers/                Mes serveurs + invitation du bot
      bots/                   Mes bots, soumission, édition
      settings/               Paramètres du compte
    api/
      auth/[...nextauth]/     NextAuth (Discord OAuth2)
      bots/                   CRUD des bots + votes
      discord/guilds/         Proxy vers l'API Discord (serveurs gérables)
  components/                 UI réutilisable (Navbar, BotCard, ServerCard...)
  lib/                        Prisma client, config NextAuth, helpers Discord
prisma/schema.prisma          Modèle de données
```

## Aller plus loin

- Ajouter un espace **admin** (`isAdmin`) pour valider/refuser les bots en attente (le champ `status` et les vérifications côté API sont déjà en place, il ne manque qu'une page `/admin`).
- Brancher un vrai compteur de serveurs en interrogeant l'API de ton bot au lieu du champ `serverCount` statique.
- Ajouter la pagination sur `/api/bots` si le nombre de bots grandit.
