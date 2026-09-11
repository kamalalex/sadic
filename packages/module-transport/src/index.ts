// API publique du module Transport — voir CDC section 3.2.
// D'autres modules (ex. module-finance) doivent passer par ces exports pour
// toute interaction avec l'Opération/Prestation ou les ressources de
// sous-traitance, jamais par un import direct de `./models/*`.

export { Operation } from "./models/Operation";
export { Prestation } from "./models/Prestation";

// Les services Opération/Prestation (créer une opération, ajouter une
// prestation, calculer la marge...) arrivent en Phase 3 de la roadmap (voir
// CDC section 7.2) — pas encore implémentés, seuls les modèles de données
// sont posés pour matérialiser le contrat défini dans le CDC.

// Ressources sous-traitance (Phase 2, CDC section 2.5 / 4.5) —
// référencées directement par les Prestations. Depuis la correction métier
// du 11 sept. 2026, "Groupe" a été fusionné dans Fournisseur (type
// "transport") et Véhicule est devenu une entité à part entière.
export {
  TYPES_VEHICULE,
  type TypeVehicule,
} from "./models/vehiculeTypes";
export {
  Fournisseur,
  TYPES_FOURNISSEUR,
  LABELS_TYPE_FOURNISSEUR,
  STATUTS_FOURNISSEUR,
  type FournisseurDoc,
  type TypeFournisseur,
  type StatutFournisseur,
} from "./models/Fournisseur";
export {
  Vehicule,
  STATUTS_VEHICULE,
  type VehiculeDoc,
  type StatutVehicule,
} from "./models/Vehicule";
export {
  Chauffeur,
  STATUTS_CHAUFFEUR,
  type ChauffeurDoc,
  type StatutChauffeur,
} from "./models/Chauffeur";

export {
  createFournisseur,
  listFournisseurs,
  getFournisseurById,
  updateFournisseur,
  type CreateFournisseurInput,
  type ListFournisseursOptions,
} from "./services/fournisseurService";
export {
  createVehicule,
  listVehicules,
  getVehiculeById,
  updateVehicule,
  type CreateVehiculeInput,
  type ListVehiculesOptions,
} from "./services/vehiculeService";
export {
  createChauffeur,
  listChauffeurs,
  getChauffeurById,
  updateChauffeur,
  type CreateChauffeurInput,
  type ListChauffeursOptions,
} from "./services/chauffeurService";
