# Journal de projet SADIC

*Document de suivi — capture l'historique des décisions et de l'avancement du projet, pour ne plus dépendre de la mémoire de conversation. Mis à jour au fil de l'eau. Les documents de référence normatifs restent `cahier-des-charges-sadic.md` (spec fonctionnelle/technique complète) et `docs/design-system-sadic.md` (charte UI) — ce journal résume le "pourquoi" et l'historique, eux décrivent le "quoi" à jour.*

Dernière mise à jour : 11 septembre 2026 (Phase 2 livrée + révisée — session suspendue, reprise prévue le lendemain).

## 0. Point de reprise — à lire en premier en reprenant

- **Dernière action faite** : fusion Groupe → Fournisseur (type `transport`) + ajout de l'entité Véhicule, dans `packages/module-transport` et `apps/web/app/{chauffeurs,vehicules,fournisseurs}` (voir section 7). CDC et ce journal mis à jour en conséquence.
- **Rien n'a encore été testé par Kamal** après ce refactor (redémarrage de `npm run dev` nécessaire — cache de modèles Mongoose).
- **Prochaine chose à faire en reprenant** : demander à Kamal de redémarrer `npm run dev`, tester la création d'un Fournisseur (type Transport), d'un Véhicule, puis d'un Chauffeur rattaché aux deux — et vérifier la compilation TS (commandes en section "Pas encore vérifié"). Une fois validé → démarrer la Phase 3 (Opération & Prestation, transport national).
- Le dossier `app/groupes/` et les fichiers `Groupe.ts`/`groupeService.ts` sont obsolètes mais toujours sur le disque (voir "À nettoyer", section 7) — à supprimer quand un accès shell au dossier sera possible.

## 1. Contexte et objectif

SADIC (Système Automatisé des Données Interconnectées) est le SaaS de gestion pour Oranostrans, société de transport/logistique de Kamal au Maroc, avec un objectif de commercialisation ultérieure à d'autres sociétés de transport.

Modules cibles : CRM (Devis, Bon de Commande, Facture), Transport national (véhicule, chauffeur, maintenance, prime, salaire), Transport international (Maritime, Aérien, Routier — chacun avec ses documents propres), Finance (Banque, Caisse, Paiement, Avoir).

Contrainte forte exprimée dès le départ : architecture modulaire pour que plusieurs développeurs travaillent en parallèle sans se marcher dessus, avec usage d'un assistant IA pour le développement.

Méthode adoptée : construction du cahier des charges section par section, validée de façon interactive, puis développement progressif — sans imposer un ordre rigide de modules (Kamal a explicitement retiré la contrainte "Facture en premier" : *"je ne suis pas sur que je veux imposer ou prioriser le module facture. fais le nécessaire pour réaliser ce projet jusqu'au bout"*).

## 2. Décisions d'architecture

- **Stack** : Next.js (App Router) + MongoDB, TypeScript partout. (Changement par rapport à l'idée initiale PHP/MySQL, à la demande de Kamal.)
- **Monorepo** : Turborepo + workspaces npm — un package par module métier, avec API publique explicite (`src/index.ts`), pour permettre le travail parallèle sans dépendances croisées internes.
- **Multi-tenant** : base MongoDB partagée + `tenantId` sur chaque document métier, imposé automatiquement par un plugin Mongoose (`tenantPlugin`) qui lève une erreur si une requête ne filtre pas sur `tenantId`.
- **Hébergement** : Vercel + MongoDB Atlas, sans contrainte de localisation des données.
- **Auth** : Auth.js prévu, pas encore implémenté — actuellement un `DEV_TENANT_ID` en variable d'environnement fait office de tenant courant (`apps/web/lib/currentTenant.ts`).
- **API interne** : tRPC prévu (pas encore implémenté), + REST pour les intégrations externes.
- **Design system** : voir `docs/design-system-sadic.md` — style "B2B Modern Pro" (inspiration Linear/Stripe/Vercel), Tailwind CSS, Lucide Icons, Plus Jakarta Sans, accent indigo `#4F46E5`, dark mode natif. Volonté explicite d'éviter le rendu "AI slop" (gros arrondis, ombres épaisses, Lorem Ipsum).

## 3. Modèle métier — la correction clé : l'Opération

Kamal a corrigé un point de conception fondamental en cours de route : une **Opération** n'est pas un enregistrement de transport unique, mais **tout un flux métier** pouvant combiner plusieurs prestations facturables pour un même client autour d'une même marchandise :

> *"une opération de transport c'est ça c'est tout un flux avec des trucs à facturer au client"* — un client peut demander un transport international, puis dans la même opération une livraison nationale, des agents de manutention, une immobilisation de 2-3 jours, et l'achat de palettes en bois — la cargaison reste la même tout du long.

Modèle retenu :
- **Operation** (conteneur neutre) : référence, client, statut, description, marchandise (expéditeur, destinataire, colis, poids, volume, description, type).
- **Prestation** (polymorphe, via discriminators Mongoose) rattachée à une Operation, un des 7 types : `transport_national`, `transport_maritime`, `transport_routier_international`, `transport_aerien`, `manutention`, `immobilisation`, `achat_produit` (+ `autre`). Chaque prestation porte son prix de vente, sa devise, son coût, sa marge, son bénéficiaire (sous-traitant), son statut.
- C'est la somme des prestations d'une Opération qui compose la Facture cliente.

## 4. Règles de facturation multi-devise

- Europe → prix communiqué en **EUR** ; autres pays étrangers → **USD**. Le **MAD** est toujours affiché.
- Client marocain : montant en devise affecté à l'opération, mais c'est le **montant en dirhams** qui est mis en gras et écrit en lettres sur la facture, avec le taux de change.
- Client étranger : montant en devise affiché (chiffres **et** lettres) **et** montant en dirhams affiché également (chiffres et lettres).
- Détail dans `cahier-des-charges-sadic.md` section 5.9.

## 5. Base de départ : le fichier Excel réel

Kamal a fourni son fichier Excel opérationnel réel (OPERATIONS ORANOSTRANS 2026.xlsx) comme socle fonctionnel minimum, en précisant explicitement qu'il ne prétend pas que sa conception est optimale : *"je ne veux pas dire que ma conception ou ma solution est meilleure mais mon fichier contient un minimum pour un mono utilisateur"*. Ce fichier a servi de référence pour cadrer le périmètre fonctionnel réel (facturation, suivi paiements clients/fournisseurs, liste chauffeurs sous-traitants et propriétaires de camions, État des départs tenu séparément de la Facture).

Précisions obtenues en clarification :
- Devis / Bon de Commande : optionnels selon les clients.
- Sous-traitance : quasiment 100% (chauffeurs et camions).
- Transport international : champs documentaires spécifiques par mode (Maritime/Aérien/Routier).
- L'État des départs reste un document séparé de la Facture.

## 6. Emplacement du code et méthode de travail

**Consigne permanente de Kamal** : *"Dorénavant crée les fichier, modifie et fais tout directement dans le dossier sadic de mon desktop"* — tout le travail (docs et code) se fait désormais directement dans le dossier connecté `C:\Users\pc\Desktop\SAAS PROJECT\sadic`, plus d'aller-retour via le workspace cloud avec export/zip.

**Limitation technique découverte** : les liens symboliques npm workspace (`node_modules/@sadic/*`) créés par npm sous Windows ne sont pas lisibles correctement via le pont Linux distant (`device_bash`) — erreur `Input/output error` — alors qu'ils fonctionnent normalement quand Kamal lance `npm run dev` lui-même depuis son éditeur. **Conséquence pour la suite** : les commandes `npm install` / `npm run build` / `npm run dev` / `tsc` ne sont plus exécutées par l'assistant via `device_bash` — elles sont transmises à Kamal en commandes prêtes à copier-coller, qu'il exécute lui-même. Les modifications de fichiers (édition directe) restent, elles, faites directement par l'assistant sur le dossier connecté.

## 7. État d'avancement fonctionnel

### Fait
- **Cahier des charges complet** (7 sections) validé section par section, dans le Project Claude (`cahier-des-charges-sadic.md`).
- **Document système de design** dédié (`docs/design-system-sadic.md`).
- **Scaffold monorepo Phase 0/1** : `packages/core` (connexion Mongo, tenantPlugin, types, modèles Tenant/User), `packages/module-parametres`, `packages/module-crm` (Client), `packages/module-transport` (Operation + Prestation polymorphe, modèles seulement — services prévus Phase 3), `packages/module-finance` et `packages/module-flotte` (squelettes, Phases 5/8), `apps/web` (Next.js).
- **Environnement opérationnel** : MongoDB Atlas connecté, premier tenant "Oranostrans" seedé (`DEV_TENANT_ID=6aa46e58f2ab93f47ce8c75d`), `npm run dev` fonctionnel.
- **Design system appliqué** au module Client comme référence (Tailwind, Lucide, Plus Jakarta Sans, accent indigo, dark mode, badges translucides, tableau dense).
- **Module Client affiné** selon les retours de Kamal :
  - Adresse structurée (ligne1, ville, code postal, pays — pays par défaut "Maroc").
  - `type` en liste déroulante fermée : SARL, SA, Auto-entrepreneur, Coopérative, Association, ou "autre" avec précision libre.
  - Un ou plusieurs contacts par client (nom, email, téléphone, poste), distincts de l'email/téléphone global de l'entreprise.
  - Champ `Résidence` supprimé (redondant avec l'adresse structurée).
  - Recherche (nom/ICE/email) sur la liste clients.
- Kamal a confirmé le fonctionnement global de l'application ("tout est opérationnel") après le redémarrage nécessaire (cache de modèles Mongoose). Test personnel de l'ajout d'un client confirmé sans problème.
- **Phase 2 — Ressources sous-traitance** : modèles, services et UI livrés dans `packages/module-transport` (11 septembre 2026), puis **révisés le même jour** suite à une correction métier de Kamal :
  - *"Fournisseur et Groupe veulent dire la même chose, un fournisseur reste un fournisseur (service ou marchandise)"* → **Groupe fusionné dans Fournisseur** (nouveau type `transport`). Un chauffeur propriétaire de son propre camion a quand même un Fournisseur qui le représente.
  - *"un chauffeur employé peut apparaître avec plusieurs véhicules selon son affectation"* → **Véhicule devient une entité à part entière** dès la Phase 2 (immatriculation, type, fournisseur propriétaire, statut), au lieu d'attendre le futur module Flotte. `Chauffeur.vehiculeActuelId` est une affectation par défaut/indicative ; l'affectation réelle par mission ira sur `Prestation.vehiculeId` (Phase 3).
  - `Prestation.beneficiaireId` (champ générique déjà présent dans le modèle) pointe désormais uniformément vers Fournisseur pour tous les types de prestation (transport, manutention, achat) — suppression des champs `fournisseurId` redondants sur les discriminators manutention/achat_produit.
  - UI : `apps/web/app/{chauffeurs,vehicules,fournisseurs}`. Routes `app/groupes/*` transformées en simples redirections vers `/fournisseurs` (le shell distant était indisponible pour supprimer les fichiers proprement — voir "À nettoyer" ci-dessous).
  - CDC mis à jour (sections 2.5, 4.4, 4.5, 4.7, 4.9).

### À nettoyer (suppression manuelle recommandée, shell distant indisponible au moment du refactor)
- `packages/module-transport/src/models/Groupe.ts`
- `packages/module-transport/src/services/groupeService.ts`
- `apps/web/app/groupes/` (dossier entier — actuellement 3 fichiers qui ne font que rediriger vers `/fournisseurs`)

Ces fichiers ne sont plus exportés ni référencés nulle part ; ils ne cassent rien en l'état, mais peuvent être supprimés dès que pratique.

### Pas encore vérifié
- La compilation TypeScript propre (`tsc --noEmit`) du module Client affiné, ni celle des modules Chauffeur/Fournisseur/Véhicule (et de leur révision Groupe→Fournisseur), n'a été confirmée par Kamal. À vérifier avec :
  ```
  npx tsc --noEmit -p packages/module-crm/tsconfig.json
  npx tsc --noEmit -p packages/module-transport/tsconfig.json
  npx tsc --noEmit -p apps/web/tsconfig.json
  ```
  (nécessite un redémarrage de `npm run dev` au préalable, cache de modèles Mongoose)

### Pas encore commencé
- **Phase 3** — Opération & Prestation, transport national : services (création d'opération, ajout de prestation, calcul de marge) et UI. Les modèles existent déjà (Phase 0/1).
- Modules Finance (Banque, Caisse, Paiement, Avoir) et Flotte (véhicule, maintenance, prime, salaire).
- Auth.js, tRPC, génération de Facture (PDF, gestion multi-devise complète).

## 8. Problèmes techniques rencontrés et résolus

- Erreurs de typage Mongoose+TS sur `Client.create/find/...` → corrigé en typant explicitement les modèles avec `Model<T>`.
- Erreurs Next.js "Module not found" sur les imports relatifs avec extension `.js` → corrigé en retirant les extensions `.js` des imports relatifs (incompatibles avec la résolution webpack de Next.js via `transpilePackages`).
- Erreur TS "composite: true" sur les références de projet → corrigé en retirant les `references` inutiles des tsconfig de modules.
- Erreur de pré-rendu statique sur `/clients` (a besoin d'une connexion DB live) → corrigé avec `export const dynamic = "force-dynamic"`.
- `seed-tenant.mjs` : les scripts Node purs ne chargent pas `.env.local` automatiquement (comportement spécifique à Next.js) → utiliser `node --env-file=apps/web/.env.local scripts/seed-tenant.mjs "Oranostrans"`.
- Erreur `querySrv EBADNAME` → `.env.local` contenait encore le placeholder `<cluster>.mongodb.net` de l'exemple, à remplacer par la vraie chaîne de connexion Atlas.
- Erreur `bad auth` → résolu en régénérant le mot de passe MongoDB Atlas (bouton "Generate" pour éviter les caractères spéciaux mal encodés) et en vérifiant le rôle "Read and write to any database".
- Limitation des liens symboliques npm via `device_bash` sous Windows (voir section 6) → commandes transmises à Kamal désormais.

## 9. Note de sécurité

Le mot de passe de la base MongoDB Atlas a été collé en clair dans la conversation à un moment du projet. Recommandation faite à Kamal : le régénérer depuis Atlas (Database Access → Edit → Generate new password) par précaution, et éviter de coller des identifiants réels dans le chat à l'avenir (préférer les variables d'environnement locales, jamais partagées).

## 10. Prochaines étapes proposées

1. Vérifier la compilation TS des modules Client / Transport (commandes ci-dessus, à lancer par Kamal — nécessite un redémarrage de `npm run dev`).
2. Démarrer la Phase 3 : Opération & Prestation, transport national (services + UI).
3. Poursuivre la feuille de route du CDC (section 7.2) : Facture, Finance, Flotte, Auth, transport international.

---

*Ce fichier vit dans le dossier `docs/` du dépôt SADIC (`C:\Users\pc\Desktop\SAAS PROJECT\sadic\docs\journal-projet-sadic.md`) et est mis à jour au fil du projet pour éviter d'avoir à recompresser/résumer la conversation à chaque fois.*
