import type { Schema } from "mongoose";

/**
 * Plugin Mongoose à appliquer sur TOUT schéma métier (Client, Operation,
 * Prestation, Facture, ...) — voir CDC section 3.4 "Multi-tenant".
 *
 * Ce qu'il fait concrètement :
 *  1. Ajoute un champ `tenantId` obligatoire + indexé sur le document.
 *  2. Refuse à l'exécution toute requête find/update/delete/count qui n'a
 *     pas explicitement de `tenantId` dans son filtre — un module métier ne
 *     peut donc pas, même par erreur, lire les données d'un autre tenant ou
 *     lister tous les tenants par accident.
 *
 * Un module ne doit jamais faire `Model.find({})` : il doit toujours passer
 * par un filtre contenant `tenantId`, ex. `Model.find({ tenantId, ...autres })`.
 */
export function tenantPlugin(schema: Schema) {
  schema.add({
    tenantId: { type: String, required: true, index: true },
  } as any);

  const queryMiddleware = function (this: any, next: (err?: Error) => void) {
    const filter = this.getFilter ? this.getFilter() : this._conditions;
    if (!filter || !filter.tenantId) {
      next(
        new Error(
          `Requête refusée sur "${this.model?.modelName ?? "modèle inconnu"}" : tenantId manquant dans le filtre. ` +
            "Toute requête doit être explicitement scopée à un tenant (voir CDC section 3.4)."
        )
      );
      return;
    }
    next();
  };

  ["find", "findOne", "findOneAndUpdate", "findOneAndDelete", "updateMany", "deleteMany", "countDocuments"].forEach(
    (op) => schema.pre(op as any, queryMiddleware)
  );
}
