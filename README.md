# SADIC — Système Automatisé des Données Interconnectées

Monorepo Turborepo (Next.js + TypeScript + MongoDB) pour le SaaS de gestion transport SADIC.
Voir le **Cahier des Charges** (document du projet Claude) pour le contexte complet, le périmètre
fonctionnel, l'architecture détaillée, le modèle de données et la roadmap.

## Ce qui est fait (Phase 0 + Phase 1 de la roadmap)

- Scaffold du monorepo : `apps/web` (Next.js), `packages/core`, `packages/module-crm`,
  `packages/module-parametres`, `packages/module-transport` (modèles seulement),
  `packages/module-finance` et `packages/module-flotte` (squelettes, README seulement).
- `packages/core` : connexion MongoDB partagée, modèles `Tenant`/`User`, `tenantPlugin`
  (isolation multi-tenant automatique — toute requête sans `tenantId` explicite est refusée).
- `packages/module-crm` : modèle `Client` + service (`createClient`, `listClients`,
  `getClientById`, `updateClient`).
- `packages/module-transport` : modèles `Operation` et `Prestation` (avec discriminants par
  type : transport national/maritime/aérien/routier international, manutention, immobilisation,
  achat_produit) — **modèles posés, services pas encore implémentés** (Phase 3 à venir).
- `apps/web` : app Next.js minimale avec une page `/clients` (liste) et `/clients/new`
  (création) — première tranche verticale bout en bout, du formulaire jusqu'à MongoDB.

## Ce qui n'est PAS encore fait

Authentification réelle (Auth.js), UI de gestion des Opérations/Prestations, génération de
Facture, module Finance, module Flotte, transport international bout en bout. Voir la section 7
(Roadmap) du Cahier des Charges pour l'ordre prévu.

## Démarrage

```bash
npm install

# 1. Créer un cluster MongoDB Atlas (ou une instance locale) et copier l'URI
cp apps/web/.env.example apps/web/.env.local
# éditer apps/web/.env.local : MONGODB_URI=...

# 2. Créer le premier Tenant (ex. Oranostrans)
MONGODB_URI="<votre uri>" node scripts/seed-tenant.mjs "Oranostrans"
# → reporter l'_id affiché dans apps/web/.env.local comme DEV_TENANT_ID

# 3. Lancer l'app en dev
npm run dev
```

L'app est ensuite disponible sur http://localhost:3000 — `/clients` liste les clients du tenant
de dev, `/clients/new` permet d'en créer un.

## Déploiement

Pensé pour **Vercel** + **MongoDB Atlas** (voir CDC section 3.8) : connecter ce dépôt à un projet
Vercel, définir `MONGODB_URI` dans les variables d'environnement du projet, chaque Pull Request
obtient automatiquement une URL de preview isolée.

## Organisation du code

Voir CDC section 3.2 et 6.1 : chaque `packages/module-*` est un package TypeScript indépendant
avec son API publique explicite (`src/index.ts`) — un module ne doit jamais importer directement
les fichiers internes d'un autre module.
