// API publique du package core — voir CDC section 3.2.
// Les autres modules importent UNIQUEMENT depuis ce fichier, jamais depuis
// packages/core/src/models/* directement.

export { connectDb } from "./db";
export { tenantPlugin } from "./tenantPlugin";
export * from "./types";
export { Tenant, type TenantDoc } from "./models/Tenant";
export { User, type UserDoc } from "./models/User";
