// Script de démarrage : crée le premier Tenant (ex. Oranostrans) en base.
// Usage : MONGODB_URI="..." node scripts/seed-tenant.mjs "Oranostrans"
//
// Affiche l'_id du Tenant créé — à reporter dans apps/web/.env.local comme
// DEV_TENANT_ID tant qu'Auth.js n'est pas branché (voir CDC section 3.6).

import mongoose from "mongoose";

const uri = process.env.MONGODB_URI;
const nom = process.argv[2] || "Oranostrans";

if (!uri) {
  console.error("MONGODB_URI manquant. Voir apps/web/.env.example.");
  process.exit(1);
}

const tenantSchema = new mongoose.Schema(
  {
    nom: String,
    ice: String,
    modulesActifs: [String],
    parametresFacture: { prefixeNumero: String },
  },
  { timestamps: true }
);

async function main() {
  await mongoose.connect(uri, { dbName: process.env.MONGODB_DB_NAME || "sadic" });
  const Tenant = mongoose.model("Tenant", tenantSchema);

  const existing = await Tenant.findOne({ nom });
  if (existing) {
    console.log(`Tenant "${nom}" existe déjà : ${existing._id}`);
    process.exit(0);
  }

  const tenant = await Tenant.create({
    nom,
    modulesActifs: ["crm", "transport", "finance", "parametres"],
    parametresFacture: { prefixeNumero: "FAC" },
  });

  console.log(`Tenant "${nom}" créé : ${tenant._id}`);
  console.log(`→ Ajoutez DEV_TENANT_ID="${tenant._id}" dans apps/web/.env.local`);
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
