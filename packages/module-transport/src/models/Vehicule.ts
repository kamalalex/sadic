import mongoose, { Schema, type Document, type Model } from "mongoose";
import { tenantPlugin } from "@sadic/core";
import { TYPES_VEHICULE, type TypeVehicule } from "./vehiculeTypes";

/**
 * Véhicule — voir CDC section 2.5 / 4.5.
 *
 * **Ajout suite à la correction métier de Kamal (11 sept. 2026)** : même en
 * 100% sous-traitance, un chauffeur est souvent lié à un véhicule précis, et
 * cette affectation peut changer dans le temps ("un chauffeur employé peut
 * apparaître avec plusieurs véhicules selon son affectation par son
 * employeur"). Le Véhicule devient donc sa propre entité dès maintenant
 * (et non réservée au futur module Flotte — CDC 4.6 — qui gère lui la
 * maintenance/prime-salaire d'une flotte propre).
 *
 * `fournisseurId` porte le propriétaire du véhicule (le sous-traitant
 * "transport" à qui il appartient). `Chauffeur.vehiculeActuelId` (voir
 * Chauffeur.ts) est une affectation *par défaut/indicative* ; l'affectation
 * réelle par mission est portée par `Prestation.vehiculeId` (type
 * transport_national, voir Prestation.ts) pour ne jamais figer un chauffeur
 * sur un seul véhicule.
 */

export const STATUTS_VEHICULE = ["actif", "inactif"] as const;
export type StatutVehicule = (typeof STATUTS_VEHICULE)[number];

export interface VehiculeDoc extends Document {
  tenantId: string;
  immatriculation: string;
  typeVehicule?: TypeVehicule;
  fournisseurId?: mongoose.Types.ObjectId;
  statut: StatutVehicule;
  statutDepuis: Date;
}

const vehiculeSchema = new Schema<VehiculeDoc>(
  {
    tenantId: { type: String, required: true, index: true },
    immatriculation: { type: String, required: true },
    typeVehicule: { type: String, enum: TYPES_VEHICULE },
    fournisseurId: { type: Schema.Types.ObjectId, ref: "Fournisseur" },
    statut: { type: String, enum: STATUTS_VEHICULE, default: "actif" },
    statutDepuis: { type: Date, default: () => new Date() },
  },
  { timestamps: true }
);

vehiculeSchema.plugin(tenantPlugin);
vehiculeSchema.index({ tenantId: 1, immatriculation: 1 }, { unique: true });
vehiculeSchema.index({ tenantId: 1, fournisseurId: 1 });

export const Vehicule: Model<VehiculeDoc> =
  (mongoose.models?.Vehicule as Model<VehiculeDoc>) ||
  mongoose.model<VehiculeDoc>("Vehicule", vehiculeSchema);
