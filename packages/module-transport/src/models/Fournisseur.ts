import mongoose, { Schema, type Document, type Model } from "mongoose";
import { tenantPlugin } from "@sadic/core";

/**
 * Fournisseur — voir CDC section 2.5 / 4.5.
 *
 * **Correction métier de Kamal (11 sept. 2026)** : "Groupe" et "Fournisseur"
 * désignaient la même réalité — un fournisseur reste un fournisseur, qu'il
 * fournisse un service de transport (chauffeur/camion sous-traité) ou une
 * prestation de manutention/achat. Le modèle `Groupe` est donc **supprimé**
 * et fusionné ici : le type `"transport"` couvre ce que couvrait
 * auparavant `Groupe`.
 *
 * Un Chauffeur (voir Chauffeur.ts) référence un Fournisseur — le "patron"
 * qui est payé pour la prestation. Cas particulier explicitement validé :
 * quand le chauffeur est propriétaire de son propre camion, on crée quand
 * même un Fournisseur (représentant son activité de sous-traitant), et le
 * Chauffeur pointe vers ce Fournisseur — c'est le même mécanisme de
 * paiement (grand-livre fournisseur, module Finance) qu'un patron qui
 * emploie plusieurs chauffeurs.
 *
 * C'est également ce Fournisseur qui est désormais systématiquement visé
 * par `Prestation.beneficiaireId` (voir Prestation.ts), quel que soit le
 * type de prestation (transport, manutention, achat_produit).
 */

export const TYPES_FOURNISSEUR = ["transport", "manutention", "fourniture_achat", "autre"] as const;
export type TypeFournisseur = (typeof TYPES_FOURNISSEUR)[number];

export const LABELS_TYPE_FOURNISSEUR: Record<TypeFournisseur, string> = {
  transport: "Transport (chauffeur / camion sous-traité)",
  manutention: "Manutention",
  fourniture_achat: "Fourniture / Achat",
  autre: "Autre",
};

export const STATUTS_FOURNISSEUR = ["actif", "inactif"] as const;
export type StatutFournisseur = (typeof STATUTS_FOURNISSEUR)[number];

export interface FournisseurDoc extends Document {
  tenantId: string;
  nom: string;
  type?: TypeFournisseur;
  societe?: string;
  contact?: string;
  telephone?: string;
  // Pertinent surtout pour type = "transport" (ex-champ Groupe.facturationDirecte) :
  // certains sous-traitants facturent en direct plutôt que d'être payés via
  // le paiement fournisseur classique (module Finance).
  facturationDirecte: boolean;
  statut: StatutFournisseur;
  statutDepuis: Date;
}

const fournisseurSchema = new Schema<FournisseurDoc>(
  {
    tenantId: { type: String, required: true, index: true },
    nom: { type: String, required: true },
    type: { type: String, enum: TYPES_FOURNISSEUR },
    societe: { type: String },
    contact: { type: String },
    telephone: { type: String },
    facturationDirecte: { type: Boolean, default: false },
    statut: { type: String, enum: STATUTS_FOURNISSEUR, default: "actif" },
    statutDepuis: { type: Date, default: () => new Date() },
  },
  { timestamps: true }
);

fournisseurSchema.plugin(tenantPlugin);
fournisseurSchema.index({ tenantId: 1, nom: 1 });

export const Fournisseur: Model<FournisseurDoc> =
  (mongoose.models?.Fournisseur as Model<FournisseurDoc>) ||
  mongoose.model<FournisseurDoc>("Fournisseur", fournisseurSchema);
