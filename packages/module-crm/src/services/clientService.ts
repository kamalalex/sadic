import { connectDb } from "@sadic/core";
import { Client, type TypeClient, type AdresseClient, type ContactClient } from "../models/Client";

/**
 * API publique du module CRM pour la gestion des clients.
 * Toute fonction exige explicitement `tenantId` — jamais de valeur
 * implicite/globale — pour que l'isolation multi-tenant reste visible et
 * vérifiable à l'appel (en plus du filet de sécurité du tenantPlugin
 * côté base de données, voir @sadic/core).
 */

export interface CreateClientInput {
  tenantId: string;
  nom: string;
  type?: TypeClient;
  typeAutrePrecision?: string;
  ice?: string;
  email?: string;
  telephone?: string;
  adresse: AdresseClient;
  contacts?: ContactClient[];
  modeFacturation?: "operation" | "groupee";
  modePaiementDefaut?: string;
  echeanceJours?: number;
  agent?: string;
}

export async function createClient(input: CreateClientInput) {
  await connectDb();
  const { tenantId, ...rest } = input;
  const client = await Client.create({ tenantId, ...rest });
  return client.toObject();
}

export interface ListClientsOptions {
  /** Recherche libre sur le nom, l'ICE ou l'email (insensible à la casse). */
  search?: string;
}

export async function listClients(tenantId: string, options: ListClientsOptions = {}) {
  await connectDb();
  const filter: Record<string, unknown> = { tenantId };

  if (options.search && options.search.trim()) {
    const term = options.search.trim();
    const regex = new RegExp(term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
    filter.$or = [{ nom: regex }, { ice: regex }, { email: regex }];
  }

  const clients = await Client.find(filter).sort({ nom: 1 }).lean();
  return clients;
}

export async function getClientById(tenantId: string, clientId: string) {
  await connectDb();
  const client = await Client.findOne({ tenantId, _id: clientId }).lean();
  return client;
}

export async function updateClient(
  tenantId: string,
  clientId: string,
  updates: Partial<CreateClientInput>
) {
  await connectDb();
  const client = await Client.findOneAndUpdate(
    { tenantId, _id: clientId },
    { $set: updates },
    { new: true }
  ).lean();
  return client;
}

/** Un client est marocain si le pays de son adresse est "Maroc" — voir CDC section 5.9. */
export function isClientMarocain(client: { adresse?: { pays?: string } }): boolean {
  return (client.adresse?.pays ?? "Maroc").trim().toLowerCase() === "maroc";
}
