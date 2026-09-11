# Cahier des Charges — SADIC
## Système Automatisé des Données Interconnectées

*Document vivant. Statut : sections 1 à 7 rédigées et validées — v1 complète.*

*Note méthodologique : la section 2 s'appuie sur le classeur Excel actuel d'Oranostrans (opérations, facturation, suivi des paiements clients/fournisseurs, chauffeurs sous-traitants, propriétaires de camions) fourni par Kamal comme référence du fonctionnement réel de la société.*

---

## 1. Contexte & Objectifs

### 1.1 Contexte

Kamal dirige une société de transport et souhaite digitaliser l'ensemble de ses activités opérationnelles (commercial, transport national et international, exploitation des véhicules et des chauffeurs, finance) au sein d'une seule plateforme : **SADIC**.

Au-delà de l'usage interne, SADIC est conçu dès le départ comme un **produit SaaS commercialisable** : une fois éprouvé sur la société de Kamal, il sera vendu à d'autres sociétés de transport et de logistique.

Cette double contrainte (outil métier interne + produit commercial) structure toutes les décisions qui suivent : architecture multi-tenant, modularité du code pour absorber une équipe de développeurs qui grandit, et une trajectoire de livraison progressive plutôt qu'un développement monolithique livré d'un bloc.

### 1.2 Objectifs métier

- Remplacer les outils dispersés (tableurs, documents papier, échanges manuels) par un système unique couvrant tout le cycle d'activité : du devis client jusqu'au paiement, en passant par l'exécution du transport et la gestion des ressources (véhicules, chauffeurs, paie).
- Fiabiliser et accélérer la facturation et le suivi financier (banque, caisse, paiements, avoirs).
- Donner une visibilité en temps réel sur l'activité transport (national et international — maritime, aérien, routier) et sur l'état de la flotte (maintenance, disponibilité).
- Construire, à partir de cet outil interne, un produit SaaS générant un revenu récurrent auprès d'autres sociétés du secteur.

### 1.3 Objectifs techniques

- **Modularité** : le système est découpé en modules métier indépendants (CRM, Transport national, Transport international, Finance, RH/Paie...) afin que plusieurs développeurs puissent travailler simultanément sur des modules différents sans que le travail de l'un bloque ou casse celui d'un autre.
- **Architecture retenue** : monorepo Next.js (Turborepo/Nx), chaque module vivant dans son propre package, avec des interfaces claires entre modules (voir section 3).
- **Multi-tenant dès la conception** : base MongoDB partagée, isolation des données par `tenantId` sur les documents (voir section 3 et 4), pour permettre l'onboarding de nouvelles sociétés clientes sans réarchitecturer le système.
- **Développement assisté par IA** : le cahier des charges et les modules seront construits avec l'appui d'un assistant IA, d'où l'importance d'une spécification écrite, précise et validée avant chaque étape de développement.
- **Livraison incrémentale** : plutôt qu'un développement "big bang", SADIC est construit module par module, en commençant par la génération de factures (voir section 7 — Roadmap).

### 1.4 Utilisateurs cibles

- **Phase 1 (interne)** : les équipes de la société de transport de Kamal — commercial/exploitation, gestion de flotte, RH, comptabilité/finance, direction.
- **Phase 2 (commercialisation)** : d'autres sociétés de transport et de logistique (transitaires, transporteurs routiers, agences de fret national/international), avec des profils utilisateurs équivalents au sein de chaque société cliente (tenant).

### 1.5 Vision produit

SADIC est positionné comme un **TMS (Transport Management System) intégré**, combinant dans une seule plateforme la gestion commerciale (CRM), l'exploitation transport (national et international, tous modes), la gestion des ressources humaines et véhicules liées au transport, et la finance — là où beaucoup d'acteurs du secteur jonglent aujourd'hui entre plusieurs outils non connectés.

---

## 2. Périmètre fonctionnel (modules)

Cette section décrit le contenu de chaque module. Elle s'appuie sur le fonctionnement réel actuel d'Oranostrans (classeur Excel fourni), complété par les modules encore inexistants dans le fichier mais demandés (Devis, Bon de Commande, Transport international, Maintenance, Prime/Salaire).

**Constat clé issu du fichier Excel** : le modèle économique n'est pas celui d'un simple transporteur avec flotte et chauffeurs salariés. C'est en grande partie un modèle de **courtage/affrètement** : chaque opération est sous-traitée à un chauffeur/camion rattaché à un **Groupe** (le "patron", propriétaire du camion), payé à un **prix sous-traitant**, la différence avec le prix facturé au client constituant la **marge** d'Oranostrans. SADIC doit donc nativement distinguer ressources internes (flotte/chauffeurs salariés) et réseau de sous-traitants — les deux coexistent probablement selon vos réponses aux questions de fin de section.

### 2.1 Module CRM

**Clients** *(champs affinés avec Kamal après premier retour sur le module Phase 1)*
- Nom, ICE, Email et Téléphone **globaux à l'entreprise** (coordonnées générales, distinctes des contacts nominatifs ci-dessous).
- **Type** en liste déroulante fermée : SARL, SA, Auto-entrepreneur, Coopérative, Association, ou Autre (avec un champ de précision libre si "Autre" est choisi).
- **Adresse structurée** : ligne d'adresse, ville, code postal, pays — plutôt qu'un simple champ texte libre.
- **Contact(s)** : un client peut avoir **un ou plusieurs contacts**, chacun avec Nom et prénom, Email, Téléphone, Poste occupé dans l'entreprise. Remplace l'ancien champ "Contact" unique.
- Mode de facturation (par opération ou regroupée sur une période), Mode de paiement par défaut (Chèque, LCN, Virement, Effet, Espèce), Échéance (en jours, ex. 60j), Agent commercial rattaché.
- Le champ "Résidence" (marocain/étranger) initialement prévu est **supprimé** : il est désormais dérivé du pays renseigné dans l'adresse (pays = Maroc ⇒ client marocain), pour ne pas dupliquer une information déjà présente.

**Devis** *(optionnel — validé)*
Le devis est une étape **optionnelle** du cycle : le flux peut démarrer directement à la facture, sans devis préalable. Quand il est utilisé : lignes de prestation, statuts (brouillon, envoyé, accepté, refusé, expiré), transformation en opération.

**Bon de Commande / Bon de Livraison** *(optionnel — validé)*
Également optionnel. Quand il est utilisé, il peut être généré à partir d'un devis accepté et déclenche la création d'une opération. Le système doit donc permettre de créer une opération/facture **directement**, sans passer par devis ni bon de commande.

**Facture**
- Numérotation séquentielle (référentiel "Indice facture" déjà présent dans vos Paramètres), format actuel `AAAA-MM-NNN`.
- Une facture se construit en sélectionnant une ou plusieurs **prestations** à facturer (voir 2.2) — d'une seule opération ou de plusieurs, d'un seul type ou combinant transport + manutention + immobilisation + achat. Ceci couvre aussi bien la facture **par opération** que la facture **groupée** (relevé "État des départs" sur une période).
- Ligne de facture : Description, Montant HT, Montant TVA, Montant TTC — chaque ligne peut tracer la prestation d'origine.
- Mention légale déjà présente à reprendre : *"L'accusé de réception de cette facture est équivalent au bon d'attachement justifiant que l'opération a été bien réalisée..."*
- Export PDF au format actuel (en-tête société, ICE, date, échéance).
- **Facturation partielle dans le temps** *(nouveau besoin, voir 2.2)* : certaines prestations d'une même opération (ex. immobilisation qui court sur plusieurs jours) peuvent être facturées plus tard que le reste — la facture ne doit donc pas obliger à solder toute l'opération d'un coup.

**État / Relevé d'activité client** *(validé — reste un document distinct de la facture)*
Sur demande d'un client, Kamal génère un état récapitulatif des opérations réalisées sur une période (date, description, prix...), partagé pour information avant que le client ne redemande formellement la facture correspondante. Ce document (équivalent à l'onglet "État des départs" actuel) est donc un **document informatif indépendant**, pas la facture elle-même.

**Avoir client** *(nouveau, actuellement absent du fichier — à formaliser dans le module Finance, rattaché au client)*

### 2.2 Cycle opérationnel — l'Opération, unité centrale

**Point structurant validé avec Kamal** : tout commence chez le **commercial**. Il crée d'abord le client (s'il n'existe pas), puis ouvre une **Opération** pour ce client. Une Opération n'est **pas limitée à un seul mode de transport** : c'est un dossier qui peut combiner plusieurs **prestations** de nature différente, décidées au fur et à mesure des besoins exprimés par le client. Exemple donné par Kamal : un client demande un transport international, puis dans la même opération une livraison en transport national (dernier kilomètre), des agents de manutention, l'immobilisation de la marchandise 2 à 3 jours, et l'achat de palettes en bois pour son compte.

Concrètement :
- **Opération** = le dossier (tenantId, référence, client, date, statut, description libre). Elle ne porte plus elle-même un "mode de transport" unique.
- **Prestation** = chaque élément facturable au sein de l'opération, avec son propre type, son propre prix de vente, son coût/sous-traitant éventuel et sa marge. C'est la généralisation de ce que votre fichier appelait déjà une "rubrique" (`shippement_details` contenait déjà FRET, DOCUMENT, IMMOBILISATION, ACHAT DE PRODUIT — la logique existe donc déjà chez vous, on la généralise et on l'étend).
- Une opération contient **une ou plusieurs prestations**, de types éventuellement différents : transport national, transport international (maritime/aérien/routier), manutention, immobilisation, achat pour compte du client, ou autre rubrique définie dans les Paramètres.
- La **Facture** ne facture pas "l'opération" en bloc : elle facture les **prestations** qu'on choisit d'y inclure, ce qui permet de facturer le transport tout de suite et l'immobilisation plus tard une fois le nombre de jours connu, par exemple.

Les types de prestations sont détaillés en 2.3, 2.4 et 2.5 ci-dessous.

### 2.3 Types de prestation — Transport (national & international)

**Transport national**
Ville de départ, ville de destination, chauffeur/transporteur affecté, groupe/patron de rattachement, prix de vente HT, prix payé au sous-traitant, marge — équivalent de ce que couvrait `shippement_details` pour la rubrique FRET.

**Transport international (Maritime, Aérien, Routier)**
Oranostrans pratique déjà ce type de transport, mais les factures correspondantes sont aujourd'hui créées **hors système** — SADIC doit couvrir ce flux de bout en bout.

*Informations générales de la marchandise, portées par l'opération dès qu'elle contient une prestation internationale* : Expéditeur, Destinataire, Nombre de colis, Poids (kg), Volume (CBM), Description de la marchandise, Type d'opération (**Import** / **Export**) avec un intitulé du type *"EXPORT ROUTIER : Kenitra, Maroc → Sausheim, France"*.

*Champs spécifiques par mode (portés par la prestation) :*
- **Maritime** — Incoterm, N° BL (connaissement), N° Booking, N° Voyage, Navire, Nombre de conteneurs, Type de conteneur, N° Conteneur.
- **Routier international** — Incoterm, N° CMR (lettre de voiture), Conducteur, Tracteur, Remorque, Type de remorque, N° Scellé.
- **Aérien** — Incoterm, N° LTA (AWB), N° Vol, Avion / Compagnie aérienne. *(Note : dans votre message ces champs étaient répertoriés sous un second intitulé "Routier" — je les ai classés sous Aérien puisqu'ils correspondent à une LTA/AWB et à un vol ; dites-moi si je me trompe.)*

Une même opération peut donc contenir, par exemple, une prestation "Transport maritime" (le trajet international) **et** une prestation "Transport national" (la livraison finale chez le client) — chacune avec son propre prix, son propre sous-traitant, sa propre marge.

Statuts de prestation à définir précisément lors du développement du module (ex. réservé, en transit, dédouané, livré) — non détaillés à ce stade du CDC.

### 2.4 Types de prestation — Manutention, Immobilisation, Achat pour compte du client *(nouveau, généralisé à partir de vos rubriques existantes)*

**Manutention** *(nouveau)*
Intervention d'agents de manutention (chargement, déchargement, conditionnement) sur une opération. Prix de vente au client, coût du prestataire de manutention (interne ou sous-traité), marge.

**Immobilisation** *(déjà une rubrique existante dans vos Paramètres)*
Facturation de l'immobilisation de la marchandise (stockage/attente), typiquement sur une durée en jours — date de début, date de fin, nombre de jours, tarif journalier ou forfaitaire, lieu de stockage éventuel. C'est ce qui permet de facturer cette prestation après coup, une fois la durée réelle connue.

**Achat pour compte du client** *(déjà la rubrique "Achat de produit" existante dans vos Paramètres)*
Achat de fournitures nécessaires à l'opération pour le compte du client (ex. palettes en bois, emballage). Désignation, quantité, prix unitaire, fournisseur, prix de vente refacturé au client, marge.

**Autre / Rubrique libre**
Le référentiel Paramètres (2.7) reste ouvert : une société cliente de SADIC doit pouvoir ajouter ses propres types de prestation sans développement supplémentaire.

### 2.5 Ressources — Véhicules, Chauffeurs, Groupes (sous-traitants) *(implémenté — voir 4.5 et 7.2 Phase 2)*

**Chauffeurs**
Nom, Téléphone, CIN, Immatriculation, Type de véhicule conduit, Groupe/Patron de rattachement, Statut (actif/inactif) avec historique de date.

**Groupes (propriétaires de camions / "patrons")**
Nom, Téléphone, Société, Facturation directe (oui/non — certains groupes facturent en direct plutôt que d'être payés en paiement fournisseur simple), Type de véhicule exploité, Statut.

**Fournisseurs (manutention, achats)** *(nouveau)*
Généralisation des "Groupes" aux prestataires non-transport : sociétés de manutention, fournisseurs de palettes/emballage, etc. — mêmes mécanismes de paiement fournisseur que les Groupes (module Finance).

**Véhicules**
Actuellement l'immatriculation est un simple champ du chauffeur. Recommandation pour SADIC : en faire une **entité séparée** (Véhicule ↔ Chauffeur), pour pouvoir suivre la maintenance et la disponibilité d'un véhicule indépendamment du chauffeur qui le conduit à un instant donné — utile en particulier pour la flotte propre.

**Maintenance véhicule** *(nouveau)*
Suivi des entretiens, réparations, coûts et échéances (visite technique, assurance, vignette) par véhicule.

**Prime / Salaire** *(nouveau)*
Concerne les chauffeurs internes salariés (à distinguer des chauffeurs sous-traitants payés à l'opération via le module Finance). Bulletin de paie simplifié, primes liées aux opérations réalisées.

> **Validé avec Kamal** : Oranostrans travaille aujourd'hui **100% en sous-traitance** (aucune flotte propre ni chauffeur salarié actuellement). Le sous-module Véhicules/Maintenance/Prime-Salaire est donc pensé **pour les futurs clients SADIC** qui, eux, possèdent leur propre flotte. Conséquence pour l'architecture : ce sous-module doit être **activable/désactivable par tenant** (un client 100% sous-traitance comme Oranostrans n'a pas à le voir), et non une fonctionnalité socle obligatoire.

### 2.6 Module Finance

**Banque**
Types d'opérations déjà utilisés dans vos Paramètres : encaissement chèque, encaissement LCN, paiement chèque, etc. — à modéliser comme journal de banque par établissement (Attijariwafa, Banque Populaire...).

**Caisse**
Paiements en espèces, notamment aux sous-traitants (déjà présent : "Paiement espèce" dans le suivi fournisseurs).

**Paiements clients (grand-livre client)**
- Journal des paiements reçus : Date facture, Client, N° Facture, Montant HT, Taxe, Montant TTC, Échéance, Date de paiement, Mode de paiement, N° du document de paiement, Nombre de jours de retard, Observation.
- Vue de synthèse par client : Chiffre d'affaires, Montant payé, Reste à payer.

**Paiements fournisseurs / sous-traitants (grand-livre fournisseur)**
- Journal des paiements : Date, Fournisseur, Raison du paiement, Montant, Mois.
- Vue de synthèse par fournisseur : Total des opérations, Avances gazoil déjà versées, Paiement espèce, Reste à payer. *(La gestion des avances carburant déduites du solde sous-traitant est une spécificité métier à conserver.)*

**Avoir** *(nouveau)*
Notes de crédit, côté client et côté fournisseur.

### 2.7 Paramètres / Référentiels (transversal, par société cliente)

Listes de configuration déjà identifiées dans votre fichier, à reprendre telles quelles comme données de référence propres à chaque tenant : Types de véhicules, Rubriques de facturation, Types d'opérations bancaires, Modes de paiement, Format/indice de numérotation des factures, États de paiement, Banques, Stations-service.

### Statut de la section

Toutes les questions ouvertes ont été validées avec Kamal (voir notes "Validé" intégrées ci-dessus). Section 2 considérée comme figée, sous réserve d'ajustements lors du développement détaillé de chaque module.

## 3. Architecture technique

### 3.1 Stack retenue

| Couche | Choix | Justification |
|---|---|---|
| Frontend + Backend | **Next.js** (App Router, TypeScript) | Un seul framework pour l'UI et l'API (Route Handlers / Server Actions), écosystème riche, déploiement simple. |
| Base de données | **MongoDB** | Schéma flexible adapté à des documents métier hétérogènes (une opération maritime n'a pas les mêmes champs qu'une opération routière nationale), montée en charge horizontale facilitée pour un SaaS multi-tenant. |
| ORM / accès données | **Mongoose** (ou Prisma + connecteur Mongo) | Validation de schéma, typage, hooks — recommandation : Mongoose pour sa maturité avec MongoDB et ses schémas discriminés (utile pour les 3 sous-types de transport international, voir section 4). |
| Monorepo | **Turborepo** | Plus léger que Nx à mettre en place pour une équipe qui démarre, cache de build incrémental, s'intègre nativement avec Next.js (même éditeur). |
| Langage | **TypeScript** partout | Indispensable en monorepo multi-module pour que les contrats entre modules soient vérifiés à la compilation plutôt que découverts en production. |
| Styling UI | **Tailwind CSS** *(ajouté — voir 3.9)* | Cohérent avec le système de design SADIC (densité, sobriété, dark mode natif), évite le CSS ad hoc dispersé entre modules développés par des devs différents. |
| Icônes | **Lucide Icons** (`lucide-react`) *(ajouté)* | Set d'icônes sobre et cohérent, aligné avec l'esthétique Linear/Stripe/Vercel visée. |

### 3.2 Structure du monorepo

Chaque module métier vit dans son propre package, avec une frontière claire entre "ce qu'un module expose" et "ce qu'il garde privé" :

```
sadic/
├── apps/
│   └── web/                     # Application Next.js unique (l'app livrée)
│       ├── app/                 # Routes — assemble les modules, ne contient pas de logique métier
│       └── ...
├── packages/
│   ├── core/                    # Socle commun à tous les modules
│   │   ├── db/                  # Connexion Mongo, gestion tenantId, helpers de requête
│   │   ├── auth/                # Authentification, sessions, rôles/permissions
│   │   ├── ui/                  # Design system partagé (composants UI)
│   │   └── types/                # Types partagés (Tenant, User, Money, Address...)
│   ├── module-crm/              # Devis, Bon de commande, Factures, Avoirs, Clients
│   ├── module-transport/        # Opération + Prestations (national, maritime, aérien, routier intl,
│   │                             #   manutention, immobilisation, achat), chauffeurs, groupes, fournisseurs
│   ├── module-flotte/           # Véhicules, maintenance, prime/salaire (activable par tenant)
│   ├── module-finance/          # Banque, caisse, paiements, grands-livres
│   └── module-parametres/       # Référentiels par tenant (types véhicule, rubriques, etc.)
└── turbo.json
```

Chaque `module-*` est un package TypeScript indépendant : ses propres modèles Mongoose, sa propre logique métier (services), et une **API publique explicite** (un fichier `index.ts` qui exporte uniquement ce que les autres modules ou l'app `web` ont le droit d'utiliser). Un module ne doit **jamais** importer directement les modèles internes d'un autre module ; il passe par l'API publique de ce module.

### 3.3 Ce que ça change concrètement pour le travail à plusieurs développeurs

- Un développeur affecté à `module-finance` ne touche jamais aux fichiers de `module-transport-national` : son build, ses tests et son lint sont isolés dans son package.
- Turborepo ne rebuild/teste que les packages impactés par un changement (cache incrémental) — les CI restent rapides même quand le monorepo grossit.
- Les dépendances entre modules sont déclarées explicitement dans le `package.json` de chaque module (ex. `module-crm` dépend de `core` mais pas de `module-transport-international`), ce qui rend les couplages visibles et évite les dépendances circulaires.
- Un nouveau module (ex. futur module RH complet) s'ajoute en créant un nouveau package, sans toucher aux modules existants.

### 3.4 Multi-tenant

- Base MongoDB **partagée**, chaque document métier porte un champ `tenantId`.
- Une couche d'accès aux données centralisée dans `core/db` **injecte automatiquement** le filtre `tenantId` sur toute requête — un module métier ne doit pas pouvoir, même par erreur, lire les données d'un autre tenant.
- Index MongoDB composés systématiquement préfixés par `tenantId` (ex. `{ tenantId: 1, date: -1 }`) pour la performance et l'isolation.
- **Activation de modules par tenant** (point issu de la section 2) : chaque tenant a une liste de modules actifs (ex. Oranostrans = CRM + Transport + Finance, **sans** module Flotte ; un futur client avec sa propre flotte active aussi `module-flotte`). À l'intérieur même de `module-transport`, les **types de prestation activables** (national, maritime, aérien, routier international, manutention, immobilisation, achat) sont eux aussi configurables par tenant via les Paramètres (2.7), pour qu'un client SADIC qui ne fait que du national n'affiche pas les champs BL/LTA/CMR. Stocké dans un document `Tenant` avec un tableau `modulesActifs` et une liste de types de prestation activés.

### 3.5 Couche API

- **tRPC** entre le frontend et le backend Next.js pour les échanges internes à l'application : typage de bout en bout sans duplication de schémas, précieux dans un monorepo TypeScript à plusieurs développeurs (une erreur de contrat entre modules casse la compilation, pas la production).
- Des **routes REST classiques** (Route Handlers Next.js) réservées aux besoins d'intégration externe (ex. un futur client SADIC qui veut connecter son propre ERP, ou un export comptable) — documentées via OpenAPI.

### 3.6 Authentification & autorisation

- **Auth.js (NextAuth)** pour l'authentification (email/mot de passe pour démarrer, extensible SSO plus tard).
- Modèle de rôles **par tenant** : un même utilisateur peut avoir un rôle différent selon la société (cas rare mais à ne pas exclure pour un SaaS). Rôles envisagés : Admin société, Commercial, Exploitation, Comptabilité, Direction (lecture globale).
- Permissions **par module** : ex. un profil "Exploitation" peut créer des opérations mais pas voir le détail des marges/finance.

### 3.7 Génération de documents (factures, états, LTA/BL/CMR...)

- Génération de PDF côté serveur (ex. `@react-pdf/renderer` ou Puppeteer sur un template HTML) pour la facture, l'état d'activité, et à terme les documents de transport international.
- Numérotation des factures gérée par un compteur atomique par tenant dans `module-parametres` (évite les doublons en cas d'accès concurrent, contrairement à une formule Excel).

### 3.8 Déploiement & environnements

**Validé avec Kamal** :
- Hébergement applicatif : **Vercel** — déploiements automatiques par preview/branche, ce qui est un vrai plus pour plusieurs développeurs en parallèle (chaque pull request obtient son URL de test isolée avant fusion).
- Base de données : **MongoDB Atlas**, sans contrainte de localisation des données — la région du cluster sera choisie simplement pour la latence la plus faible (probablement Europe, à confirmer selon la localisation réelle des utilisateurs).
- Environnements : `dev` (preview Vercel par branche), `staging`, `production`.

### 3.9 Système de design & UI *(nouveau, validé avec Kamal)*

Directives visuelles obligatoires pour toute interface SADIC — document dédié complet dans le projet (`design-system-sadic.md`). Résumé :

- **Style B2B Modern Pro**, haute densité d'information — inspiration Linear.app / Stripe Dashboard / Vercel. Interdiction explicite du look "AI slop" (gros arrondis `rounded-2xl`+, ombres `shadow-2xl`, Lorem Ipsum, Inter/Arial par défaut).
- **Couleur d'accent SADIC : Indigo** (`#4F46E5`), distincte des couleurs d'état métier : émeraude (en transit/livré/facturé), ambre (en attente/retardé), rouge (litige/incomplet/annulé), slate (neutre).
- **Typographie** : Plus Jakarta Sans (UI), police à chasse fixe pour tout ce qui est numéros CMR/BL/LTA, immatriculations et montants.
- **Composants** : bordures fines plutôt qu'ombres, `rounded-md`/`rounded-lg` uniquement, tableaux compacts (`py-2.5`–`py-3`), badges d'état translucides, barre d'outils (recherche/filtres/export) systématique sur les vues liste.
- **Stack** : Tailwind CSS + Lucide Icons + TypeScript, dark mode natif (pas ajouté après coup).
- Le module Client (Phase 1) sert de **référence d'implémentation** pour tous les modules suivants.

## 4. Modèle de données

### 4.1 Principes de modélisation

- Chaque document métier porte un champ **`tenantId`** (sauf les collections techniques globales).
- Chaque entité a un `_id` MongoDB technique, et pour les documents commerciaux (opérations, factures) un **identifiant métier lisible** généré via un compteur atomique par tenant (ex. `OP-JJMMAAAA-NN`, `2026-01-001`) — évite les doublons possibles avec une formule Excel partagée.
- **Changement important suite à vos précisions** : l'opération n'est plus une collection à discriminant par mode de transport. C'est désormais un **conteneur (dossier)** neutre, et ce sont les **Prestations** qu'il contient qui portent un discriminant de type (`transport_national`, `transport_maritime`, `transport_aerien`, `transport_routier_international`, `manutention`, `immobilisation`, `achat_produit`, `autre`). Une opération peut ainsi combiner plusieurs types de prestations, exactement comme dans votre exemple (transport international + livraison nationale + manutention + immobilisation + achat de palettes, le tout dans une seule opération pour un même client).

### 4.2 Collections cœur (`core`)

- **Tenant** — nom société, ICE, `modulesActifs[]` (ex. `["crm","transport","finance"]`, sans `"flotte"` pour Oranostrans), paramètres de numérotation de facture.
- **User** — tenantId, nom, email, mot de passe (hashé), rôles, statut.
- **Compteur** — tenantId, type (`facture`, `operation`, `devis`...), valeur courante — pour la numérotation atomique.

### 4.3 Module CRM

- **Client** *(affiné, voir 2.1)* — tenantId, nom, ICE, email et téléphone (globaux entreprise), `type` (`SARL` | `SA` | `auto_entrepreneur` | `cooperative` | `association` | `autre`, + `typeAutrePrecision` si `autre`), `adresse` **{ ligne1, ville, codePostal, pays }**, `contacts[]` (sous-documents : nom, email, téléphone, poste), `modeFacturation` (par opération / groupée), mode de paiement par défaut, échéance (jours), agent.
  - Le champ `residence` est **supprimé** : la règle d'affichage devise/MAD de la facture (section 5.9) se base désormais directement sur `client.adresse.pays === "Maroc"` plutôt que sur un champ dédié.
- **Devis** *(optionnel)* — tenantId, clientId, lignes[], statut, dates.
- **BonCommande** *(optionnel)* — tenantId, clientId, devisId (facultatif), lignes[], statut.
- **Facture** — tenantId, numéro, clientId, `lignes[]` où chaque ligne référence une `prestationId` (traçabilité) + description, montant HT, TVA, montant TTC ; totaux, date facture, échéance, statut (payée / non payée / partielle). Une prestation peut être facturée seule, avec d'autres prestations de la même opération, ou avec des prestations d'opérations différentes du même client (facture groupée) — et une opération peut être facturée en plusieurs fois (ex. transport facturé tout de suite, immobilisation facturée plus tard).
  - **Champs multi-devise** *(voir 5.9)* : `devise` (`MAD` par défaut, ou `EUR`/`USD` selon la zone du client), `tauxChange` (si devise ≠ MAD), montants HT/TVA/TTC exprimés en devise **et** leur équivalent en MAD, `montantEnLettresMAD` (toujours généré), `montantEnLettresDevise` (généré uniquement si client étranger).
  - **Règle d'affichage PDF** : client marocain → seul le montant MAD est mis en gras et en toutes lettres ; client étranger → montant devise **et** montant MAD sont tous deux affichés en chiffres et en toutes lettres.
- **EtatActivite** — tenantId, clientId, période (du/au), `operationIds[]` ou `prestationIds[]`, totaux — **document distinct de Facture**, généré à la demande du client avant qu'il ne redemande la facture.
- **Avoir** — tenantId, clientId ou fournisseurId, factureId (facultatif), montant, motif, date.

### 4.4 Opération & Prestation (cœur du modèle métier)

- **Operation** — tenantId, référence (`OP-JJMMAAAA-NN`), clientId, date de création, statut, description libre. Ne porte plus de champ de mode de transport : c'est un dossier qui regroupe une ou plusieurs prestations.
- **Prestation** — tenantId, `operationId`, **type** (discriminant, voir ci-dessous), `prixVente` **{ valeur, devise }** *(MAD par défaut ; EUR pour l'Europe, USD pour les autres pays étrangers, voir 5.9)*, `tauxChange` (si devise ≠ MAD), coût / prixSousTraitant, marge, description, `beneficiaireId` (référence vers Chauffeur+Groupe, ou vers Fournisseur, selon le type), statut.
  - Champs communs "marchandise", présents dès que l'opération contient une prestation internationale, portés au niveau de l'**Operation** (une même marchandise peut traverser plusieurs prestations) : expéditeur, destinataire, nombre de colis, poids (kg), volume (CBM), description marchandise, type d'opération (import/export).
  - **type = `transport_national`** — villeDépart, villeDestination, chauffeurId, groupeId.
  - **type = `transport_maritime`** — incoterm, N° BL, N° Booking, N° Voyage, navire, nombre de conteneurs, type de conteneur, N° conteneur.
  - **type = `transport_routier_international`** — incoterm, N° CMR, conducteur, tracteur, remorque, type de remorque, N° scellé.
  - **type = `transport_aerien`** — incoterm, N° LTA, N° Vol, compagnie aérienne.
  - **type = `manutention`** — fournisseurId (prestataire), description, lieu.
  - **type = `immobilisation`** — dateDébut, dateFin, nombreJours, tarifJournalier, lieu de stockage.
  - **type = `achat_produit`** — désignation, quantité, prixUnitaire, fournisseurId.
  - **type = `autre`** — libellé libre défini dans les Paramètres (2.7), pour rester extensible sans développement.

### 4.5 Ressources — Chauffeurs, Groupes, Fournisseurs *(implémenté — Phase 2, `packages/module-transport`)*

- **Chauffeur** — tenantId, nom, téléphone, CIN, immatriculation, `typeVehicule` (référentiel fermé `TYPES_VEHICULE` : Tautliner, Frigo, Plateau, Fourgon, Semi-remorque, Autre), `groupeId` (référence Groupe, optionnelle), `statut` (`actif` | `inactif`), `statutDepuis` (date). Modèle : `packages/module-transport/src/models/Chauffeur.ts` ; service : `chauffeurService.ts` ; UI : `apps/web/app/chauffeurs`.
- **Groupe** (sous-traitant transport / "patron") — tenantId, nom, téléphone, société, `facturationDirecte` (booléen), `typeVehicule` (même référentiel que Chauffeur), `statut` (`actif` | `inactif`), `statutDepuis`. Modèle : `Groupe.ts` ; service : `groupeService.ts` ; UI : `apps/web/app/groupes`.
- **Fournisseur** *(généralisation)* — tenantId, nom, `type` (`manutention` | `fourniture_achat` | `autre`), contact, téléphone. Utilisé par les prestations `manutention` et `achat_produit`. Payé via le même mécanisme que les Groupes dans le module Finance (grand-livre fournisseur commun aux deux). Modèle : `Fournisseur.ts` ; service : `fournisseurService.ts` ; UI : `apps/web/app/fournisseurs`.

### 4.6 Module Flotte *(collections activées uniquement pour les tenants concernés)*

- **Vehicule** — tenantId, immatriculation, type, chauffeurActuelId, statut.
- **Maintenance** — tenantId, vehiculeId, type (entretien, réparation, visite technique, assurance, vignette), date, coût, prochaine échéance.
- **Employe** (chauffeur salarié) — tenantId, chauffeurId, salaire de base.
- **BulletinPaie** — tenantId, employeId, période, montant de base, primes[], net à payer.

### 4.7 Module Finance

- **EcritureBanque** — tenantId, banque, type d'opération, montant, date, référence.
- **EcritureCaisse** — tenantId, montant, date, motif.
- **PaiementClient** — tenantId, factureId, clientId, montant, date de paiement, mode de paiement, N° document, jours de retard, observation.
- **PaiementFournisseur** — tenantId, `beneficiaireType` (`groupe` | `fournisseur`), `beneficiaireId`, date, raison, montant, mois, observation.
- **SoldeFournisseur** *(vue calculée, pas une collection)* — total des opérations, avances gazoil, paiements espèce, reste à payer, par bénéficiaire.
- **Avoir** — partagée avec le CRM (motif client ou fournisseur).

### 4.8 Module Paramètres

- **ParametreListe** — tenantId, catégorie (type de véhicule, type de prestation/rubrique, type d'opération bancaire, mode de paiement, état de paiement, banque, station), valeur, ordre d'affichage.

### 4.9 Relations clés entre modules

```
Client 1───N Operation 1───N Prestation
Prestation N───1 Chauffeur N───1 Groupe          (si type = transport_national)
Prestation N───1 Fournisseur                      (si type = manutention | achat_produit)
Facture 1───N ligne N───1 Prestation              (une prestation peut être facturée isolément ou groupée)
Client 1───N EtatActivite N───N Operation
Facture 1───N PaiementClient
(Groupe | Fournisseur) 1───N PaiementFournisseur
Vehicule 1───N Maintenance
Tenant  1───N (tout, via tenantId)
```

**Validé avec Kamal** : la marchandise/cargaison reste la même tout au long de l'opération — les champs "marchandise" (expéditeur, destinataire, poids, volume, description) sont donc bien portés une seule fois au niveau de l'Operation, et non répétés sur chaque Prestation.

**Exemple concret (votre scénario)** : une Operation pour le client X contient 4 Prestations — une `transport_maritime` (le trajet international), une `transport_national` (livraison finale), une `manutention` (agents), une `immobilisation` (2-3 jours de stockage) et une `achat_produit` (palettes bois). Chacune a son propre prix/coût/marge. Kamal peut ensuite créer une Facture regroupant tout de suite le transport + la manutention + l'achat, et facturer l'immobilisation séparément une fois la durée réelle connue.

Cette section sera affinée lors du développement de chaque module (champs additionnels, contraintes de validation précises), mais fixe la structure de référence pour démarrer le module Facture.

## 5. Exigences non-fonctionnelles

### 5.1 Sécurité

- Authentification par compte utilisateur (email/mot de passe pour démarrer), sessions sécurisées, possibilité d'ajouter une double authentification (2FA) par la suite.
- Isolation stricte multi-tenant au niveau de la couche d'accès aux données (voir 3.4) : un utilisateur ne peut techniquement pas accéder aux données d'un autre tenant, même en cas de bug applicatif.
- Permissions par rôle et par module (voir 3.6) : ex. un profil "Exploitation" ne voit pas les marges ni le détail financier.
- **Journal d'audit** sur les objets sensibles (Facture, Paiement, Avoir, Prestation) : qui a créé/modifié quoi et quand — important pour un outil qui remplace un suivi financier jusqu'ici tenu sur fichier partagé, où ce contrôle n'existait pas.
- Chiffrement des mots de passe (hash) et des données sensibles au repos ; connexions chiffrées (HTTPS) de bout en bout.

### 5.2 Performance & volumétrie

- Listes d'opérations, factures et paiements consultables avec pagination, recherche et filtres, même avec plusieurs milliers d'enregistrements par tenant sur la durée (votre fichier actuel contient déjà plusieurs centaines d'opérations sur quelques mois).
- Temps de chargement des écrans courants (liste d'opérations, fiche client, génération de facture) : cible sous 2 secondes en usage normal.
- Index MongoDB pensés dès la conception (voir 3.4) pour que la croissance du nombre de tenants ne dégrade pas les temps de réponse des autres tenants.

### 5.3 Disponibilité & sauvegarde

- Service accessible en continu, cohérent avec un usage SaaS commercial (les clients d'Oranostrans et, demain, d'autres sociétés, doivent pouvoir facturer à tout moment).
- Sauvegardes automatiques quotidiennes de la base (fonctionnalité native MongoDB Atlas), avec possibilité de restauration à un point dans le temps.
- Déploiements Vercel par preview/branche (voir 3.8) permettant de tester une évolution sans risque pour la production.

### 5.4 Conformité & spécificités marocaines

- Mentions légales obligatoires sur la facture : ICE, et selon le cas RC/IF/Patente de la société émettrice — à rendre configurables par tenant (chaque société cliente de SADIC a ses propres identifiants).
- TVA paramétrable par tenant et par type de prestation (12% observé dans votre fichier, mais d'autres taux ou une exonération peuvent s'appliquer selon la prestation ou le client).
- Veille à prévoir sur l'évolution de la réglementation marocaine en matière de facturation électronique, pour que SADIC puisse s'y adapter sans refonte.

### 5.5 Internationalisation

- Interface en **français** en priorité (cohérent avec votre fonctionnement actuel).
- Architecture textes/libellés préparée pour ajouter l'arabe et/ou l'anglais plus tard sans réécrire les modules (fichiers de traduction plutôt que texte codé en dur).

### 5.6 Traçabilité & historique

- Horodatage systématique (création, modification) et utilisateur auteur sur chaque document métier.
- Historique des statuts (ex. statut de paiement d'une facture, statut d'une prestation transport international) conservé, pas seulement l'état courant.

### 5.7 Interopérabilité & export

- Export PDF des documents (facture, état d'activité, à terme documents de transport international).
- Export Excel/CSV des listes (opérations, factures, paiements) pour analyse ou transmission à un comptable externe.
- API REST documentée (voir 3.5) pour permettre, à terme, la connexion d'un ERP ou d'un logiciel comptable tiers chez un client SADIC.

### 5.8 Accessibilité des usages

- Application responsive : postes fixes pour l'exploitation/la comptabilité, consultation possible depuis mobile/tablette pour le commercial ou la direction en déplacement.

### 5.9 Gestion multi-devise *(validé avec Kamal)*

Règle métier confirmée :
- Prix communiqué en **EUR** pour les opérations avec l'Europe, en **USD** pour les opérations avec les autres pays étrangers ; le montant en devise est celui rattaché à l'opération, avec un taux de change associé.
- **Client marocain** : la facture met en avant (en gras, et en toutes lettres) le **montant en MAD** uniquement — le montant en devise reste associé à l'opération pour traçabilité/calcul, mais n'est pas mis en avant sur le document.
- **Client étranger** : la facture affiche **les deux montants**, chacun en chiffres et en toutes lettres : le montant en devise **et** le montant en MAD.

Voir la traduction en modèle de données en section 4.3 (Facture) et 4.4 (Prestation).

## 6. Workflow multi-développeurs

### 6.1 Propriété des modules

Chaque package (`module-crm`, `module-transport`, `module-flotte`, `module-finance`, `module-parametres`, `core`) a un **propriétaire désigné** parmi les développeurs, déclaré via un fichier `CODEOWNERS` à la racine du repo. Toute Pull Request touchant un package doit être approuvée par son propriétaire, en plus d'une revue standard — ça évite qu'un changement dans `module-finance` soit fusionné sans que la personne responsable de la finance l'ait vu.

### 6.2 Stratégie de branches

- **Trunk-based development** : une branche `main` toujours déployable, des branches de fonctionnalité courtes créées à partir de `main`.
- Convention de nommage : `feat/<module>/<courte-description>` (ex. `feat/crm/generation-facture-pdf`), `fix/<module>/<description>`, `chore/<description>`.
- Chaque Pull Request obtient automatiquement une **URL de preview Vercel** isolée (voir 3.8) pour être testée avant fusion, sans jamais impacter le travail des autres développeurs.
- Fusion dans `main` uniquement via Pull Request (jamais de push direct), après revue + CI verte.

### 6.3 Convention de commits

**Conventional Commits**, avec le module concerné comme scope : `feat(crm): ajout génération PDF facture`, `fix(transport): correction calcul marge prestation`. Ça permet de générer un changelog lisible et de savoir immédiatement quel module est impacté par un commit donné.

### 6.4 Intégration continue (CI/CD)

- **GitHub Actions** (ou équivalent) + **cache Turborepo** : à chaque Pull Request, seuls les packages impactés par le changement sont lint/type-checké/testés/buildés — pas tout le monorepo à chaque fois, ce qui garde la CI rapide même quand le nombre de modules grandit.
- Pipeline type par PR : lint → vérification des types TypeScript → tests unitaires des packages affectés → build → déploiement preview automatique.
- Sur fusion dans `main` : build complet + déploiement en production (Vercel) + migration de schéma si nécessaire.

### 6.5 Tests

- **Tests unitaires** par package (ex. Vitest) : logique métier de chaque module (calcul de marge, génération de numéro de facture, conversion devise → MAD...).
- **Tests d'intégration** sur les flux qui traversent plusieurs modules (ex. Opération → sélection de prestations → génération de Facture → enregistrement d'un Paiement), pour garantir que les contrats entre modules restent respectés.
- **Tests de bout en bout** (ex. Playwright) sur les parcours critiques uniquement (génération d'une facture, création d'une opération multi-prestations), pas sur l'intégralité de l'application — pour rester rapide à exécuter.

### 6.6 Contrats partagés (`core/types`)

Les types partagés entre modules (Tenant, User, Client, Money/Devise...) vivent dans `core/types` et sont **versionnés comme le reste du monorepo**. Toute modification y est particulièrement sensible : le type-check global en CI fait immédiatement échouer la build de tout module consommateur impacté par un changement de contrat, ce qui rend le risque de "casse silencieuse" entre modules très faible.

### 6.7 Documentation & montée en compétence

- Un `README.md` par package : responsabilité du module, modèles de données qu'il possède, API publique qu'il expose.
- Ce cahier des charges reste le document de référence vivant du produit — à tenir à jour au fil du développement plutôt que de le figer une fois pour toutes.

### 6.8 Suivi de projet

Recommandation : découper le développement en tickets rattachés à un module (ex. dans Linear, Jira, ou un outil équivalent), pour garder la visibilité "qui travaille sur quel module" en cohérence avec le découpage technique du monorepo. Choix de l'outil laissé à votre préférence — non structurant techniquement.

## 7. Roadmap et priorisation

### 7.1 Principe de priorisation

L'intention initiale était de démarrer directement par un module Facture. En regardant le modèle de données (section 4), ce n'est techniquement pas isolable : une Facture facture des **Prestations**, qui appartiennent à une **Opération**, qui appartient à un **Client** — sans ces briques, un module Facture n'a rien à facturer. La priorisation ci-dessous suit donc les **dépendances techniques réelles** plutôt qu'un module imposé : chaque phase construit sur ce que la précédente rend possible.

### 7.2 Phases

**Phase 0 — Fondations techniques** ✅ *implémentée*
Scaffolding du monorepo (Turborepo, TypeScript, Next.js), connexion MongoDB Atlas, `package core` (accès données multi-tenant, authentification, modèles Tenant/User, rôles de base), CI/CD (lint, typecheck, tests, preview Vercel). Rien d'autre ne peut démarrer sans cette base.

**Phase 1 — CRM : Client & Paramètres** ✅ *implémentée*
Fiche Client complète (y compris pays/résidence pour la règle multi-devise), référentiels de base (Paramètres) : types de prestation, modes de paiement, banques... Le socle sur lequel s'appuient toutes les opérations.

**Phase 2 — Ressources sous-traitance** ✅ *implémentée*
Chauffeurs, Groupes (patrons), Fournisseurs — nécessaires car les Prestations les référencent directement. Modèles + services + UI livrés dans `packages/module-transport` (`models/Chauffeur.ts`, `Groupe.ts`, `Fournisseur.ts`, `vehiculeTypes.ts` + services associés) et `apps/web/app/{chauffeurs,groupes,fournisseurs}` — voir section 4.5.

**Phase 3 — Transport national : Opération & Prestation (cœur métier)**
Création d'une Opération, ajout de Prestations de type transport national — le cas le mieux couvert par vos données actuelles (`id_shippement`/`shippement_details`). C'est la première brique qui produit de la valeur opérationnelle réelle. Les modèles `Operation`/`Prestation` existent déjà (Phase 0/1) ; reste à construire les services et l'UI.

**Phase 4 — CRM : Facture**
Génération de facture à partir des prestations sélectionnées (numérotation atomique, PDF, mention légale, gestion multi-devise MAD/EUR/USD, facture unitaire ou groupée). Devient réalisable une fois Client + Opération + Prestation en place.

**Phase 5 — Finance : Paiements & grands-livres**
Paiements clients (suivi des échéances), paiements fournisseurs (avec avances gazoil), Banque, Caisse, Avoir.

**Phase 6 — État d'activité, Devis & Bon de commande** *(optionnels)*
Le relevé informatif client, puis les étapes commerciales amont si vous souhaitez les activer.

**Phase 7 — Transport international**
Ajout des types de prestation maritime/aérien/routier international avec leurs documents spécifiques (BL, LTA, CMR...), sur la base de l'Opération/Prestation déjà en place.

**Phase 8 — Module Flotte** *(pour les futurs clients SADIC)*
Véhicules, maintenance, prime/salaire — activable par tenant, non nécessaire pour Oranostrans aujourd'hui.

**Phase 9 — Préparation à la commercialisation SaaS**
Provisioning d'un nouveau tenant, activation des modules par offre commerciale, page d'administration, plan tarifaire par tenant.

### 7.3 Parallélisation

Ce séquencement est **technique, pas rigide dans le temps** : une fois les Fondations (Phase 0) et le tronc commun Opération/Prestation (Phase 3) stables, plusieurs phases peuvent avancer en parallèle grâce à l'architecture modulaire (section 3) — par exemple un développeur sur la Facture (Phase 4) pendant qu'un autre commence le Transport international (Phase 7).

### 7.4 Démarrage concret

Pour rester cohérent avec "faire le nécessaire pour aller jusqu'au bout" plutôt que d'imposer un point de départ arbitraire, le développement démarre par la **Phase 0 + Phase 1** (fondations + Client), qui ne présuppose aucun module métier en particulier et débloque tout le reste. À date (11 septembre 2026), les Phases 0 à 2 sont implémentées ; la Phase 3 (Opération & Prestation transport national) est la prochaine étape.
