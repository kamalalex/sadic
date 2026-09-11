import { connectDb } from "@sadic/core";
import { Groupe } from "../models/Groupe";
import type { StatutGroupe } from "../models/Groupe";
import type { TypeVehicule } from "../models/vehiculeTypes";

/**
 * API publique du module Transport pour la gestion des Groupes
 * (sous-traitants transport / "patrons", voir CDC section 2.5).
 * Même principe que clientService (@sadic/module-crm) : `tenantId`
 * explicite à chaque appel, jamais de valeur implicite.
 */

export interface CreateGroupeInput {
  tenantId: string;
  nom: string;
  telephone?: string;
  societe?: string;
  facturationDirecte?: boolean;
  typeVehicule?: TypeVehicule;
  statut?: StatutGroupe;
}

export interface ListGroupesOptions {
  search?: string;
}

export async function createGroupe(input: CreateGroupeInput) {
  await connectDb();
  const { tenantId, ...rest } = input;
  const groupe = await Groupe.create({ tenantId, ...rest });
  return groupe.toObject();
}

export async function listGroupes(tenantId: string, options: ListGroupesOptions = {}) {
  await connectDb();
  const filter: Record<string, unknown> = { tenantId };
  if (options.search) {
    filter.nom = { $regex: options.search, $options: "i" };
  }
  return Groupe.find(filter).sort({ nom: 1 }).lean();
}

export async function getGroupeById(tenantId: string, groupeId: string) {
  await connectDb();
  return Groupe.findOne({ tenantId, _id: groupeId }).lean();
}

export async function updateGroupe(
  tenantId: string,
  groupeId: string,
  updates: Partial<CreateGroupeInput>
) {
  await connectDb();
  return Groupe.findOneAndUpdate(
    { tenantId, _id: groupeId },
    { $set: updates },
    { new: true }
  ).lean();
}
