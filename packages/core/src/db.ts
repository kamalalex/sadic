import mongoose from "mongoose";

/**
 * Connexion MongoDB partagée, réutilisée entre les hot-reloads de Next.js en dev
 * et entre les invocations de fonctions serverless en production (Vercel).
 *
 * Toute autre partie du code (tous les modules) doit passer par `connectDb()`
 * avant d'utiliser un modèle Mongoose — jamais de `mongoose.connect` dupliqué
 * ailleurs dans le monorepo.
 */

declare global {
  // eslint-disable-next-line no-var
  var __sadicMongooseConn: Promise<typeof mongoose> | undefined;
}

export function connectDb(): Promise<typeof mongoose> {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error(
      "MONGODB_URI manquant. Voir apps/web/.env.example pour la variable attendue."
    );
  }

  if (!global.__sadicMongooseConn) {
    mongoose.set("strictQuery", true);
    global.__sadicMongooseConn = mongoose.connect(uri, {
      dbName: process.env.MONGODB_DB_NAME || "sadic",
    });
  }

  return global.__sadicMongooseConn;
}
