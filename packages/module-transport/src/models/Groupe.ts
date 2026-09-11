import mongoose, { Schema, type Document, type Model } from "mongoose";
import { tenantPlugin } from "@sadic/core";
import { TYPES_VEHICULE, type TypeVehicule } from "./vehiculeTypes";

/**
 * Groupe — sous-traitant transport / "patron", propriétaire d'un ou
 * plusieurs camions (voir CDC section 2.5 / 4.5). Chaque Chauffeur est
 * rattaché à un Groupe ; c'est le Groupe qui est réglé via le grand-livre
 * fournisseur (module Finance, à venir), sauf s'il facture en direct
 * (`facturationDirecte`).
 */

export const STATUTS_GROUPE = ["actif", "inactif"] as const;
export type StatutGroupe = (typeof STATUTS_GROUPE)[number];

export interface GroupeDoc extends Document {
  tenantId: string;
  nom: string;
  telephone?: string;
  societe?: string;
  facturationDirecte: boolean;
  typeVehicule?: TypeVehicule;
  statut: StatutGroupe;
  statutDepuis: Date;
}

const groupeSchema = new Schema<GroupeDoc>(
  {
    tenantId: { type: String, required: true, index: true },
    nom: { type: String, required: true },
    telephone: { type: String },
    societe: { type: String },
    facturationDirecte: { type: Boolean, default: false },
    typeVehicule: { type: String, enum: TYPES_VEHICULE },
    statut: { type: String, enum: STATUTS_GROUPE, default: "actif" },
    statutDepuis: { type: Date, default: () => new Date() },
  },
  { timestamps: true }
);

groupeSchema.plugin(tenantPlugin);
groupeSchema.index({ tenantId: 1, nom: 1 });

export const Groupe: Model<GroupeDoc> =
  (mongoose.models?.Groupe as Model<GroupeDoc>) ||
  mongoose.model<GroupeDoc>("Groupe", groupeSchema);
