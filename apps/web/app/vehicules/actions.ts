"use server";

import { redirect } from "next/navigation";
import { createVehicule } from "@sadic/module-transport";
import type { TypeVehicule } from "@sadic/module-transport";
import { getCurrentTenantId } from "../../lib/currentTenant";

export async function createVehiculeAction(formData: FormData) {
  const tenantId = getCurrentTenantId();

  const immatriculation = String(formData.get("immatriculation") || "").trim();
  if (!immatriculation) {
    throw new Error("L'immatriculation est obligatoire.");
  }

  const typeVehicule = String(formData.get("typeVehicule") || "") as TypeVehicule | "";

  await createVehicule({
    tenantId,
    immatriculation,
    typeVehicule: typeVehicule || undefined,
    fournisseurId: String(formData.get("fournisseurId") || "") || undefined,
  });

  redirect("/vehicules");
}
