import mongoose, { Schema, type Document, type Model } from "mongoose";
import { tenantPlugin } from "../tenantPlugin";
import type { RoleUtilisateur } from "../types";

export interface UserDoc extends Document {
  tenantId: string;
  nom: string;
  email: string;
  motDePasseHash: string;
  roles: RoleUtilisateur[];
  statut: "actif" | "inactif";
}

const userSchema = new Schema<UserDoc>(
  {
    tenantId: { type: String, required: true, index: true },
    nom: { type: String, required: true },
    email: { type: String, required: true, index: true },
    motDePasseHash: { type: String, required: true },
    roles: { type: [String], default: ["commercial"] },
    statut: { type: String, enum: ["actif", "inactif"], default: "actif" },
  },
  { timestamps: true }
);

userSchema.plugin(tenantPlugin);
// Un même email ne doit pas se dupliquer au sein d'un même tenant.
userSchema.index({ tenantId: 1, email: 1 }, { unique: true });

export const User: Model<UserDoc> =
  (mongoose.models?.User as Model<UserDoc>) ||
  mongoose.model<UserDoc>("User", userSchema);
