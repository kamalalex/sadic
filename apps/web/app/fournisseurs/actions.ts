"use server";

import { redirect } from "next/navigation";
import { createFournisseur } from "@sadic/module-transport";
import type { TypeFournisseur } from "@sadic/module-transport";
import { getCurrentTenantId } from "../../lib/currentTenant";

export async function createFournisseurAction(formData: FormData) {
  const tenantId = getCurrentTenantId();

  const nom = String(formData.get("nom") || "").trim();
  if (!nom) {
    throw new Error("Le nom du fournisseur est obligatoire.");
  }

  const type = String(formData.get("type") || "") as TypeFournisseur | "";

  await createFournisseur({
    tenantId,
    nom,
    type: type || undefined,
    societe: String(formData.get("societe") || "") || undefined,
    contact: String(formData.get("contact") || "") || undefined,
    telephone: String(formData.get("telephone") || "") || undefined,
    facturationDirecte: formData.get("facturationDirecte") === "on",
  });

  redirect("/fournisseurs");
}
