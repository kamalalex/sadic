/**
 * Types de véhicules — référentiel partagé entre Chauffeur et Groupe
 * (voir CDC section 2.5 / 4.5). Liste fermée mais courante dans le métier
 * du transport routier (voir aussi docs/design-system-sadic.md, section
 * "Exigences de contenu" qui cite ces mêmes types comme données réalistes).
 *
 * À terme ce référentiel pourra être piloté par tenant via le module
 * Paramètres (CDC 2.7) ; on démarre avec une liste fermée en dur, comme
 * pour TYPES_CLIENT dans le module CRM.
 */
export const TYPES_VEHICULE = [
  "Tautliner",
  "Frigo",
  "Plateau",
  "Fourgon",
  "Semi-remorque",
  "Autre",
] as const;
export type TypeVehicule = (typeof TYPES_VEHICULE)[number];
