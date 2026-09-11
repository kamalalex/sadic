import mongoose, { Schema } from "mongoose";
import { tenantPlugin } from "@sadic/core";

/**
 * Prestation — voir CDC section 2.2/2.3/2.4/2.5 et 4.4.
 * Chaque élément facturable d'une Operation. Le discriminant `type`
 * détermine quels champs spécifiques s'appliquent (voir les discriminators
 * enregistrés en bas de ce fichier).
 */
const montantSchema = new Schema(
  {
    valeur: { type: Number, required: true },
    devise: { type: String, enum: ["MAD", "EUR", "USD"], default: "MAD" },
  },
  { _id: false }
);

const prestationBaseSchema = new Schema(
  {
    operationId: { type: Schema.Types.ObjectId, required: true, ref: "Operation" },
    type: {
      type: String,
      required: true,
      enum: [
        "transport_national",
        "transport_maritime",
        "transport_aerien",
        "transport_routier_international",
        "manutention",
        "immobilisation",
        "achat_produit",
        "autre",
      ],
    },
    description: { type: String },
    prixVente: { type: montantSchema, required: true },
    tauxChange: { type: Number }, // requis si prixVente.devise !== "MAD" — voir CDC 5.9
    cout: { type: montantSchema }, // prix payé au sous-traitant / fournisseur
    marge: { type: Number },
    // Depuis la fusion Groupe → Fournisseur (11 sept. 2026), le bénéficiaire
    // payé pour TOUTE prestation (transport, manutention, achat_produit)
    // est systématiquement un Fournisseur — voir Fournisseur.ts. Les
    // informations opérationnelles propres au transport (qui a conduit,
    // quel véhicule) sont portées par les champs spécifiques du
    // discriminator transport_national ci-dessous, pas par beneficiaireId.
    beneficiaireId: { type: Schema.Types.ObjectId, ref: "Fournisseur" },
    statut: {
      type: String,
      enum: ["planifiee", "en_cours", "realisee", "facturee"],
      default: "planifiee",
    },
  },
  { timestamps: true, discriminatorKey: "type" }
);

prestationBaseSchema.plugin(tenantPlugin);
prestationBaseSchema.index({ tenantId: 1, operationId: 1 });

export const Prestation =
  mongoose.models?.Prestation || mongoose.model("Prestation", prestationBaseSchema);

// --- Discriminators par type de prestation (voir CDC 4.4) ---
// Chaque `discriminator` n'ajoute que les champs propres à son type ;
// enregistrés une seule fois pour éviter l'erreur "Cannot overwrite" en dev
// (hot-reload Next.js).

function registerDiscriminator(name: string, fields: Record<string, unknown>) {
  if (!Prestation.discriminators || !Prestation.discriminators[name]) {
    Prestation.discriminator(name, new Schema(fields));
  }
}

registerDiscriminator("transport_national", {
  villeDepart: { type: String, required: true },
  villeDestination: { type: String, required: true },
  chauffeurId: { type: Schema.Types.ObjectId, ref: "Chauffeur" },
  // Véhicule réellement utilisé pour CETTE mission — un chauffeur peut
  // conduire des véhicules différents selon les missions (voir Chauffeur.ts
  // et Vehicule.ts), donc ce champ ne se déduit pas automatiquement du
  // chauffeur : il se choisit à chaque prestation.
  vehiculeId: { type: Schema.Types.ObjectId, ref: "Vehicule" },
});

registerDiscriminator("transport_maritime", {
  incoterm: { type: String },
  numeroBL: { type: String },
  numeroBooking: { type: String },
  numeroVoyage: { type: String },
  navire: { type: String },
  nombreConteneurs: { type: Number },
  typeConteneur: { type: String },
  numeroConteneur: { type: String },
});

registerDiscriminator("transport_routier_international", {
  incoterm: { type: String },
  numeroCMR: { type: String },
  conducteur: { type: String },
  tracteur: { type: String },
  remorque: { type: String },
  typeRemorque: { type: String },
  numeroScelle: { type: String },
});

registerDiscriminator("transport_aerien", {
  incoterm: { type: String },
  numeroLTA: { type: String },
  numeroVol: { type: String },
  compagnieAerienne: { type: String },
});

registerDiscriminator("manutention", {
  lieu: { type: String },
});

registerDiscriminator("immobilisation", {
  dateDebut: { type: Date },
  dateFin: { type: Date },
  nombreJours: { type: Number },
  tarifJournalier: { type: Number },
  lieuStockage: { type: String },
});

registerDiscriminator("achat_produit", {
  designation: { type: String, required: true },
  quantite: { type: Number, required: true },
  prixUnitaire: { type: Number, required: true },
});
