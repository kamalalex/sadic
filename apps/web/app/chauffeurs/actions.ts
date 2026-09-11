"use server";

import { redirect } from "next/navigation";
import { createChauffeur } from "@sadic/module-transport";
import { getCurrentTenantId } from "../../lib/currentTenant";

export async function createChauffeurAction(formData: FormData) {
  const tenantId = getCurrentTenantId();

  const nom = String(formData.get("nom") || "").trim();
  if (!nom) {
    throw new Error("Le nom du chauffeur est obligatoire.");
  }

  await createChauffeur({
    tenantId,
    nom,
    telephone: String(formData.get("telephone") || "") || undefined,
    cin: String(formData.get("cin") || "") || undefined,
    fournisseurId: String(formData.get("fournisseurId") || "") || undefined,
    vehiculeActuelId: String(formData.get("vehiculeActuelId") || "") || undefined,
  });

  redirect("/chauffeurs");
}
