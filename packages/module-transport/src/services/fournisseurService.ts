import { connectDb } from "@sadic/core";
import { Fournisseur } from "../models/Fournisseur";
import type { TypeFournisseur, StatutFournisseur } from "../models/Fournisseur";

/**
 * API publique du module Transport pour la gestion des Fournisseurs
 * (voir CDC section 2.5). Depuis la fusion Groupe → Fournisseur (11 sept.
 * 2026), couvre aussi bien les sous-traitants transport (`type: "transport"`,
 * ex-Groupe) que les prestataires manutention/achat. `tenantId` explicite à
 * chaque appel.
 */

export interface CreateFournisseurInput {
  tenantId: string;
  nom: string;
  type?: TypeFournisseur;
  societe?: string;
  contact?: string;
  telephone?: string;
  facturationDirecte?: boolean;
  statut?: StatutFournisseur;
}

export interface ListFournisseursOptions {
  search?: string;
  type?: TypeFournisseur;
}

export async function createFournisseur(input: CreateFournisseurInput) {
  await connectDb();
  const { tenantId, ...rest } = input;
  const fournisseur = await Fournisseur.create({ tenantId, ...rest });
  return fournisseur.toObject();
}

export async function listFournisseurs(tenantId: string, options: ListFournisseursOptions = {}) {
  await connectDb();
  const filter: Record<string, unknown> = { tenantId };
  if (options.search) {
    filter.nom = { $regex: options.search, $options: "i" };
  }
  if (options.type) {
    filter.type = options.type;
  }
  return Fournisseur.find(filter).sort({ nom: 1 }).lean();
}

export async function getFournisseurById(tenantId: string, fournisseurId: string) {
  await connectDb();
  return Fournisseur.findOne({ tenantId, _id: fournisseurId }).lean();
}

export async function updateFournisseur(
  tenantId: string,
  fournisseurId: string,
  updates: Partial<CreateFournisseurInput>
) {
  await connectDb();
  return Fournisseur.findOneAndUpdate(
    { tenantId, _id: fournisseurId },
    { $set: updates },
    { new: true }
  ).lean();
}
