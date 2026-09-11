/**
 * Résolution du tenant courant.
 *
 * TEMPORAIRE : tant qu'Auth.js (voir CDC section 3.6) n'est pas branché,
 * on lit un tenantId fixe depuis l'environnement pour permettre de
 * développer et tester le module CRM de façon isolée (Phase 1 de la
 * roadmap, CDC section 7.2). Cette fonction sera remplacée par une lecture
 * de la session utilisateur authentifiée en fin de Phase 0.
 */
export function getCurrentTenantId(): string {
  const tenantId = process.env.DEV_TENANT_ID;
  if (!tenantId) {
    throw new Error(
      "DEV_TENANT_ID n'est pas défini (voir .env.example). " +
        "Créez un Tenant (script scripts/seed.ts à venir) et renseignez son id."
    );
  }
  return tenantId;
}
