import { connectDb } from "@sadic/core";
import { Chauffeur } from "../models/Chauffeur";
import { Fournisseur } from "../models/Fournisseur";
import { Vehicule } from "../models/Vehicule";
import type { StatutChauffeur } from "../models/Chauffeur";

/**
 * API publique du module Transport pour la gestion des Chauffeurs
 * (voir CDC section 2.5). `tenantId` explicite à chaque appel.
 */

export interface CreateChauffeurInput {
  tenantId: string;
  nom: string;
  telephone?: string;
  cin?: string;
  fournisseurId?: string;
  vehiculeActuelId?: string;
  statut?: StatutChauffeur;
}

export interface ListChauffeursOptions {
  search?: string;
  fournisseurId?: string;
}

export async function createChauffeur(input: CreateChauffeurInput) {
  await connectDb();
  const { tenantId, fournisseurId, vehiculeActuelId, ...rest } = input;
  const chauffeur = await Chauffeur.create({
    tenantId,
    fournisseurId: fournisseurId || undefined,
    vehiculeActuelId: vehiculeActuelId || undefined,
    ...rest,
  });
  return chauffeur.toObject();
}

export async function listChauffeurs(tenantId: string, options: ListChauffeursOptions = {}) {
  await connectDb();
  const filter: Record<string, unknown> = { tenantId };
  if (options.search) {
    filter.nom = { $regex: options.search, $options: "i" };
  }
  if (options.fournisseurId) {
    filter.fournisseurId = options.fournisseurId;
  }
  return Chauffeur.find(filter)
    .sort({ nom: 1 })
    .populate({ path: "fournisseurId", select: "nom", match: { tenantId } })
    .populate({ path: "vehiculeActuelId", select: "immatriculation typeVehicule", match: { tenantId } })
    .lean();
}

export async function getChauffeurById(tenantId: string, chauffeurId: string) {
  await connectDb();
  return Chauffeur.findOne({ tenantId, _id: chauffeurId })
    .populate({ path: "fournisseurId", select: "nom", match: { tenantId } })
    .populate({ path: "vehiculeActuelId", select: "immatriculation typeVehicule", match: { tenantId } })
    .lean();
}

export async function updateChauffeur(
  tenantId: string,
  chauffeurId: string,
  updates: Partial<CreateChauffeurInput>
) {
  await connectDb();
  const { fournisseurId, vehiculeActuelId, ...rest } = updates;
  const setDoc: Record<string, unknown> = { ...rest };
  if (fournisseurId !== undefined) {
    setDoc.fournisseurId = fournisseurId || undefined;
  }
  if (vehiculeActuelId !== undefined) {
    setDoc.vehiculeActuelId = vehiculeActuelId || undefined;
  }
  return Chauffeur.findOneAndUpdate(
    { tenantId, _id: chauffeurId },
    { $set: setDoc },
    { new: true }
  ).lean();
}
