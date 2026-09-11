import mongoose, { Schema, type Document, type Model } from "mongoose";
import { tenantPlugin } from "@sadic/core";

/**
 * Client — voir CDC section 2.1 / 4.3.
 *
 * `email`/`telephone` sont les coordonnées GLOBALES de l'entreprise cliente.
 * Les personnes à contacter (une ou plusieurs) sont dans `contacts[]`.
 *
 * Il n'y a plus de champ `residence` : la règle d'affichage devise/MAD de
 * la facture (CDC section 5.9) se base directement sur
 * `client.adresse.pays === "Maroc"`.
 */

export const TYPES_CLIENT = [
  "SARL",
  "SA",
  "auto_entrepreneur",
  "cooperative",
  "association",
  "autre",
] as const;
export type TypeClient = (typeof TYPES_CLIENT)[number];

export const LABELS_TYPE_CLIENT: Record<TypeClient, string> = {
  SARL: "SARL",
  SA: "SA",
  auto_entrepreneur: "Auto-entrepreneur",
  cooperative: "Coopérative",
  association: "Association",
  autre: "Autre",
};

export interface ContactClient {
  nom: string;
  email?: string;
  telephone?: string;
  poste?: string;
}

export interface AdresseClient {
  ligne1?: string;
  ville?: string;
  codePostal?: string;
  pays: string;
}

export interface ClientDoc extends Document {
  tenantId: string;
  nom: string;
  type?: TypeClient;
  typeAutrePrecision?: string;
  ice?: string;
  email?: string;
  telephone?: string;
  adresse: AdresseClient;
  contacts: ContactClient[];
  modeFacturation: "operation" | "groupee";
  modePaiementDefaut?: string;
  echeanceJours: number;
  agent?: string;
}

const contactSchema = new Schema<ContactClient>(
  {
    nom: { type: String, required: true },
    email: { type: String },
    telephone: { type: String },
    poste: { type: String },
  },
  { _id: false }
);

const adresseSchema = new Schema<AdresseClient>(
  {
    ligne1: { type: String },
    ville: { type: String },
    codePostal: { type: String },
    pays: { type: String, required: true, default: "Maroc" },
  },
  { _id: false }
);

const clientSchema = new Schema<ClientDoc>(
  {
    tenantId: { type: String, required: true, index: true },
    nom: { type: String, required: true },
    type: { type: String, enum: TYPES_CLIENT },
    typeAutrePrecision: { type: String },
    ice: { type: String },
    email: { type: String },
    telephone: { type: String },
    adresse: { type: adresseSchema, required: true, default: () => ({ pays: "Maroc" }) },
    contacts: { type: [contactSchema], default: [] },
    modeFacturation: {
      type: String,
      enum: ["operation", "groupee"],
      default: "operation",
    },
    modePaiementDefaut: { type: String },
    echeanceJours: { type: Number, default: 30 },
    agent: { type: String },
  },
  { timestamps: true }
);

// NB : le plugin `tenantPlugin` (@sadic/core) ajoute normalement le champ
// `tenantId` + les gardes-fous sur les requêtes. Ici `tenantId` est aussi
// déclaré explicitement dans le schéma pour un typage TypeScript propre ;
// le plugin reste appliqué pour les gardes-fous à l'exécution.
clientSchema.plugin(tenantPlugin);
clientSchema.index({ tenantId: 1, nom: 1 });

export const Client: Model<ClientDoc> =
  (mongoose.models?.Client as Model<ClientDoc>) ||
  mongoose.model<ClientDoc>("Client", clientSchema);
