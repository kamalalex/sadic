import { redirect } from "next/navigation";

// Voir app/groupes/page.tsx — "Groupe" est fusionné dans Fournisseur.
export default function NewGroupeRedirectPage() {
  redirect("/fournisseurs/new");
}
