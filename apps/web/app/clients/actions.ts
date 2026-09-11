"use server";

import { redirect } from "next/navigation";
import { createClient } from "@sadic/module-crm";
import type { TypeClient, ContactClient } from "@sadic/module-crm";
import { getCurrentTenantId } from "../../lib/currentTenant";

function parseContacts(formData: FormData): ContactClient[] {
  const noms = formData.getAll("contact_nom").map(String);
  const emails = formData.getAll("contact_email").map(String);
  const telephones = formData.getAll("contact_telephone").map(String);
  const postes = formData.getAll("contact_poste").map(String);

  return noms
    .map((nom, i) => ({
      nom: nom.trim(),
      email: emails[i]?.trim() || undefined,
      telephone: telephones[i]?.trim() || undefined,
      poste: postes[i]?.trim() || undefined,
    }))
    // Une ligne de contact laissée entièrement vide (ajoutée puis non remplie) est ignorée.
    .filter((c) => c.nom || c.email || c.telephone || c.poste);
}

export async function createClientAction(formData: FormData) {
  const tenantId = getCurrentTenantId();

  const nom = String(formData.get("nom") || "").trim();
  if (!nom) {
    throw new Error("Le nom du client est obligatoire.");
  }

  const type = String(formData.get("type") || "") as TypeClient | "";

  await createClient({
    tenantId,
    nom,
    type: type || undefined,
    typeAutrePrecision: String(formData.get("typeAutrePrecision") || "") || undefined,
    ice: String(formData.get("ice") || "") || undefined,
    email: String(formData.get("email") || "") || undefined,
    telephone: String(formData.get("telephone") || "") || undefined,
    adresse: {
      ligne1: String(formData.get("adresse_ligne1") || "") || undefined,
      ville: String(formData.get("adresse_ville") || "") || undefined,
      codePostal: String(formData.get("adresse_codePostal") || "") || undefined,
      pays: String(formData.get("adresse_pays") || "Maroc"),
    },
    contacts: parseContacts(formData),
    echeanceJours: Number(formData.get("echeanceJours") || 30),
    agent: String(formData.get("agent") || "") || undefined,
  });

  redirect("/clients");
}
