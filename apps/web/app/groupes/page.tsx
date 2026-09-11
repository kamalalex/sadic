import { redirect } from "next/navigation";

/**
 * "Groupe" a été fusionné dans Fournisseur (type "transport") le
 * 11 sept. 2026 — voir @sadic/module-transport Fournisseur.ts. Cette route
 * ne fait plus que rediriger, pour ne pas casser un lien existant.
 *
 * À supprimer, avec le reste de ce dossier `app/groupes/` ainsi que
 * `packages/module-transport/src/models/Groupe.ts` et
 * `packages/module-transport/src/services/groupeService.ts` (devenus
 * orphelins, non exportés), dès qu'un accès shell au dossier sera possible.
 */
export default function GroupesRedirectPage() {
  redirect("/fournisseurs");
}
