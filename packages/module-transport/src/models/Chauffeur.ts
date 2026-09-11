import mongoose, { Schema, type Document, type Model } from "mongoose";
import { tenantPlugin } from "@sadic/core";

/**
 * Chauffeur — voir CDC section 2.5 / 4.5. Aujourd'hui, chez Oranostrans,
 * 100% sous-traitance.
 *
 * **Révisé suite à la correction métier de Kamal (11 sept. 2026)** :
 * - `fournisseurId` remplace l'ancien `groupeId` — le "patron" qui est payé
 *   pour la prestation (voir Fournisseur.ts). Cas particulier : un chauffeur
 *   propriétaire de son propre camion référence quand même un Fournisseur
 *   (créé pour représenter sa propre activité de sous-traitant).
 * - `vehiculeActuelId` remplace les anciens champs plats `typeVehicule` /
 *   `immatriculation` — le véhicule est désormais sa propre entité
 *   (voir Vehicule.ts), car un même chauffeur employé peut conduire
 *   plusieurs véhicules différents selon son affectation. Ce champ est une
 *   affectation *par défaut/indicative* ; l'affectation réelle par mission
 *   sera portée par la Prestation elle-même (Phase 3).
 */

export const STATUTS_CHAUFFEUR = ["actif", "inactif"] as const;
export type StatutChauffeur = (typeof STATUTS_CHAUFFEUR)[number];

export interface ChauffeurDoc extends Document {
  tenantId: string;
  nom: string;
  telephone?: string;
  cin?: string;
  fournisseurId?: mongoose.Types.ObjectId;
  vehiculeActuelId?: mongoose.Types.ObjectId;
  statut: StatutChauffeur;
  statutDepuis: Date;
}

const chauffeurSchema = new Schema<ChauffeurDoc>(
  {
    tenantId: { type: String, required: true, index: true },
    nom: { type: String, required: true },
    telephone: { type: String },
    cin: { type: String },
    fournisseurId: { type: Schema.Types.ObjectId, ref: "Fournisseur" },
    vehiculeActuelId: { type: Schema.Types.ObjectId, ref: "Vehicule" },
    statut: { type: String, enum: STATUTS_CHAUFFEUR, default: "actif" },
    statutDepuis: { type: Date, default: () => new Date() },
  },
  { timestamps: true }
);

chauffeurSchema.plugin(tenantPlugin);
chauffeurSchema.index({ tenantId: 1, nom: 1 });
chauffeurSchema.index({ tenantId: 1, fournisseurId: 1 });

export const Chauffeur: Model<ChauffeurDoc> =
  (mongoose.models?.Chauffeur as Model<ChauffeurDoc>) ||
  mongoose.model<ChauffeurDoc>("Chauffeur", chauffeurSchema);
