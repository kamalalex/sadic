// API publique du module CRM — voir CDC section 3.2.
// D'autres modules (ex. module-transport, module-finance) doivent passer
// par ces exports pour toute interaction avec les clients, jamais par un
// import direct de `./models/Client`.

export {
  Client,
  TYPES_CLIENT,
  LABELS_TYPE_CLIENT,
  type ClientDoc,
  type TypeClient,
  type AdresseClient,
  type ContactClient,
} from "./models/Client";
export {
  createClient,
  listClients,
  getClientById,
  updateClient,
  isClientMarocain,
  type CreateClientInput,
  type ListClientsOptions,
} from "./services/clientService";
