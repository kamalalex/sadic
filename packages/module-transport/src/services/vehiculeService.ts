import { connectDb } from "@sadic/core";
import { Vehicule } from "../models/Vehicule";
import { Fournisseur } from "../models/Fournisseur";
import type { StatutVehicule } from "../models/Vehicule";
import type { TypeVehicule } from "../models/vehiculeTypes";

/**
 * API publique du module Transport pour la gestion des Véhicules
 * (voir CDC section 2.5 / 4.5, ajouté le 11 sept. 2026).
 */

export interface CreateVehiculeInput {
  tenantId: string;
  immatriculation: string;
  typeVehicule?: TypeVehicule;
  fournisseurId?: string;
  statut?: StatutVehicule;
}

export interface ListVehiculesOptions {
  search?: string;
  fournisseurId?: string;
}

export async function createVehicule(input: CreateVehiculeInput) {
  await connectDb();
  const { tenantId, fournisseurId, ...rest } = input;
  const vehicule = await Vehicule.create({
    tenantId,
    fournisseurId: fournisseurId || undefined,
    ...rest,
  });
  return vehicule.toObject();
}

export async function listVehicules(tenantId: string, options: ListVehiculesOptions = {}) {
  await connectDb();
  const filter: Record<string, unknown> = { tenantId };
  if (options.search) {
    filter.immatriculation = { $regex: options.search, $options: "i" };
  }
  if (options.fournisseurId) {
    filter.fournisseurId = options.fournisseurId;
  }
  return Vehicule.find(filter)
    .sort({ immatriculation: 1 })
    .populate({ path: "fournisseurId", select: "nom", match: { tenantId } })
    .lean();
}

export async function getVehiculeById(tenantId: string, vehiculeId: string) {
  await connectDb();
  return Vehicule.findOne({ tenantId, _id: vehiculeId })
    .populate({ path: "fournisseurId", select: "nom", match: { tenantId } })
    .lean();
}

export async function updateVehicule(
  tenantId: string,
  vehiculeId: string,
  updates: Partial<CreateVehiculeInput>
) {
  await connectDb();
  const { fournisseurId, ...rest } = updates;
  const setDoc: Record<string, unknown> = { ...rest };
  if (fournisseurId !== undefined) {
    setDoc.fournisseurId = fournisseurId || undefined;
  }
  return Vehicule.findOneAndUpdate(
    { tenantId, _id: vehiculeId },
    { $set: setDoc },
    { new: true }
  ).lean();
}
