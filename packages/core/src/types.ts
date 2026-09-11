/**
 * Types partagés entre tous les modules (voir CDC section 3.6 / 6.6).
 * Toute modification ici impacte potentiellement plusieurs modules :
 * un changement de contrat doit être fait avec précaution et fait
 * immédiatement échouer le type-check des modules consommateurs impactés.
 */

export type Devise = "MAD" | "EUR" | "USD";

/** Montant associé à une devise — voir CDC section 4.4 / 5.9 (gestion multi-devise). */
export interface Montant {
  valeur: number;
  devise: Devise;
}

export type RoleUtilisateur =
  | "admin"
  | "commercial"
  | "exploitation"
  | "comptabilite"
  | "direction";

/** Modules métier activables par tenant — voir CDC section 3.4 et 2.7. */
export type ModuleActivable =
  | "crm"
  | "transport"
  | "finance"
  | "flotte"
  | "parametres";

export interface TenantContext {
  tenantId: string;
}
