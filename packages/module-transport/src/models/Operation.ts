import mongoose, { Schema } from "mongoose";
import { tenantPlugin } from "@sadic/core";

/**
 * Operation — voir CDC section 2.2 / 4.4.
 * Le dossier ouvert par le commercial pour un client. Ne porte PAS de mode
 * de transport unique : elle regroupe une ou plusieurs Prestations (voir
 * Prestation.ts), éventuellement de types différents (transport national +
 * transport international + manutention + immobilisation + achat...).
 */
const operationSchema = new Schema(
  {
    reference: { type: String, required: true }, // ex. OP-11092026-01
    clientId: { type: Schema.Types.ObjectId, required: true, ref: "Client" },
    statut: {
      type: String,
      enum: ["ouverte", "en_cours", "cloturee", "annulee"],
      default: "ouverte",
    },
    description: { type: String },

    // Renseigné dès que l'opération contient au moins une prestation
    // internationale (voir CDC 2.3) — la marchandise reste la même tout au
    // long de l'opération, donc portée une seule fois ici.
    marchandise: {
      expediteur: { type: String },
      destinataire: { type: String },
      nombreColis: { type: Number },
      poidsKg: { type: Number },
      volumeCbm: { type: Number },
      description: { type: String },
      typeOperation: { type: String, enum: ["import", "export"] },
    },
  },
  { timestamps: true }
);

operationSchema.plugin(tenantPlugin);
operationSchema.index({ tenantId: 1, clientId: 1, createdAt: -1 });
operationSchema.index({ tenantId: 1, reference: 1 }, { unique: true });

export const Operation =
  mongoose.models?.Operation || mongoose.model("Operation", operationSchema);
