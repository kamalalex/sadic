import mongoose, { Schema } from "mongoose";
import { tenantPlugin } from "@sadic/core";

/**
 * Référentiels par tenant — voir CDC section 2.7 / 4.8.
 * Ex: { categorie: "typeVehicule", valeur: "14T CAMION FOURGON" }
 *     { categorie: "typePrestation", valeur: "manutention" }
 */
const parametreListeSchema = new Schema(
  {
    categorie: {
      type: String,
      required: true,
      enum: [
        "typeVehicule",
        "typePrestation",
        "typeOperationBancaire",
        "modePaiement",
        "etatPaiement",
        "banque",
        "station",
      ],
    },
    valeur: { type: String, required: true },
    ordre: { type: Number, default: 0 },
  },
  { timestamps: true }
);

parametreListeSchema.plugin(tenantPlugin);
parametreListeSchema.index({ tenantId: 1, categorie: 1, valeur: 1 }, { unique: true });

export const ParametreListe =
  mongoose.models?.ParametreListe ||
  mongoose.model("ParametreListe", parametreListeSchema);
