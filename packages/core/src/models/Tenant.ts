import mongoose, { Schema, type Document, type Model } from "mongoose";
import type { ModuleActivable } from "../types";

/**
 * Tenant = une société cliente de SADIC (ex. Oranostrans).
 * Collection globale, volontairement NON scopée par tenantId (c'est elle
 * qui définit les tenants) — voir CDC section 4.2.
 */
export interface TenantDoc extends Document {
  nom: string;
  ice?: string;
  modulesActifs: ModuleActivable[];
  parametresFacture: {
    prefixeNumero: string;
  };
}

const tenantSchema = new Schema<TenantDoc>(
  {
    nom: { type: String, required: true },
    ice: { type: String },
    modulesActifs: {
      type: [String],
      default: ["crm", "transport", "finance", "parametres"],
    },
    parametresFacture: {
      prefixeNumero: { type: String, default: "FAC" },
    },
  },
  { timestamps: true }
);

export const Tenant: Model<TenantDoc> =
  (mongoose.models?.Tenant as Model<TenantDoc>) ||
  mongoose.model<TenantDoc>("Tenant", tenantSchema);
