# Système de design SADIC

*Document de référence UI — complète le Cahier des Charges (section 3.9). Toute nouvelle interface développée pour SADIC doit s'y conformer, pour garder un rendu cohérent quel que soit le développeur ou le module.*

**Principe directeur : anti "AI slop".** SADIC est un outil métier B2B utilisé toute la journée par des équipes exploitation/commercial/finance — pas une landing page. On privilégie la densité d'information, la lisibilité et la sobriété à l'esthétique "IA générique" (gros arrondis, ombres portées épaisses, dégradés, emojis, Lorem Ipsum).

## 1. Direction artistique

- **Style** : B2B Modern Pro — épuré, haute densité d'information (data-dense UI).
- **Inspiration** : Linear.app, Stripe Dashboard, Vercel.
- **Couleur d'accent SADIC : Indigo** (`#4F46E5` / Tailwind `indigo-600`). Choisie pour rester distincte des couleurs d'état métier ci-dessous (pas de confusion entre "action/marque" et "statut d'une expédition"), et cohérente avec l'esthétique Linear/Stripe. Ajustable si vous préférez une autre teinte.

### Palette

| Rôle | Light mode | Dark mode |
|---|---|---|
| Fond de page | `#F8FAFC` (slate-50) | `#090D16` |
| Carte / surface | Blanc cassé, bordure `#E2E8F0` (slate-200) | `#1E293B` (slate-800), bordure `#334155` (slate-700) |
| Texte principal | `#0F172A` (slate-900) | `#F1F5F9` (slate-100) |
| Texte secondaire | `#64748B` (slate-500) | `#94A3B8` (slate-400) |
| Accent (marque, actions, liens) | `#4F46E5` (indigo-600) | `#818CF8` (indigo-400) |

### Couleurs d'état métier (logistique)

| État | Couleur | Exemple d'usage |
|---|---|---|
| Neutre | Slate | Brouillon, non défini |
| Succès (émeraude `#10B981`) | En transit, Livré, Facturé, Payé |
| Attente / Alerte (ambre `#F59E0B`) | En attente d'affectation, Retardé, Échéance proche |
| Erreur (rouge/rose `#EF4444`) | Litige, Incomplet, Annulé, Impayé en retard |

Toujours en **badge translucide** : `bg-emerald-500/10 text-emerald-600 dark:text-emerald-400` (jamais un aplat plein sur tout le badge).

## 2. Typographie & lisibilité

- **Interdit** : Inter ou Arial par défaut (trop générique / "AI slop").
- **Police d'interface** : **Plus Jakarta Sans**, chargée via `next/font/google` (pas de dépendance supplémentaire à installer).
- **Police à chasse fixe** (`font-mono`, pile par défaut Tailwind : ui-monospace, SFMono, Menlo, Consolas) pour : numéros de suivi/opération, immatriculations, montants financiers, numéros CMR/BL/LTA. Ces valeurs doivent toujours s'aligner en colonne dans les tableaux — c'est la seule bonne raison technique d'une police mono ici, pas juste un style.

## 3. Composants & spacing

- **Rayons** : `rounded-md` ou `rounded-lg` uniquement. Jamais `rounded-2xl` ou plus.
- **Bordures & ombres** : bordures fines (`border border-slate-200 dark:border-slate-800`) plutôt que des ombres portées. Pas de `shadow-2xl` ni de cartes "flottantes".
- **Densité** : tableaux et listes compacts, `py-2.5` à `py-3` par ligne — plusieurs dizaines d'expéditions doivent tenir à l'écran sans défilement excessif.
- **Badges d'état** : fond translucide + texte coloré (voir palette ci-dessus), `rounded-md`, texte en petite capitale ou minuscule selon le contexte, jamais de badge plein criard.
- **Micro-interactions** : survol de ligne discret (`hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors`), boutons d'action rapide identifiés par icône (Lucide) + libellé court.
- **Barre d'outils** : toujours présente en haut d'une vue liste — recherche, filtres rapides (statut, date), actions d'export. Reste sticky si la liste est longue.

## 4. Exigences de contenu (interfaces métier)

- **Données réalistes**, jamais de Lorem Ipsum : numéro CMR/BL/LTA plausible, types de camion (Tautliner, Frigo, Plateau, Fourgon...), villes de départ/arrivée réelles (cohérentes avec les corridors Maroc ↔ Europe déjà utilisés par Oranostrans), poids/volume, statut douane, montants HT réalistes.
- Toute donnée de démonstration doit rester **crédible pour le métier du transport/fret**, pas générique.

## 5. Stack technique retenue pour l'UI

- **Framework** : React (Next.js App Router) — déjà le choix du CDC section 3.1.
- **Styling** : **Tailwind CSS** (ajout au stack initial — remplace les styles inline utilisés dans le scaffold Phase 0/1).
- **Icônes** : **Lucide Icons** (`lucide-react`).
- **TypeScript** partout, composants modulaires et typés — cohérent avec CDC section 3.1/6.6.
- **Dark mode** : supporté nativement (variables CSS + classe `dark` sur `<html>`), pas une réflexion après coup.

## 6. Application de référence

Le module Client (`apps/web/app/clients`) est la première implémentation de ce système de design — à utiliser comme référence pour tout nouveau module (tableau compact, badges, barre d'outils avec recherche, boutons d'action avec icônes Lucide).
