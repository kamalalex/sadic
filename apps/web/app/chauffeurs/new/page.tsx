import { ArrowLeft } from "lucide-react";
import { listFournisseurs, listVehicules } from "@sadic/module-transport";
import { getCurrentTenantId } from "../../../lib/currentTenant";
import { createChauffeurAction } from "../actions";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block space-y-1">
      <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{label}</span>
      {children}
    </label>
  );
}

const inputClass =
  "w-full rounded-md border border-slate-200 dark:border-slate-700 bg-transparent px-3 py-1.5 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-accent";

export default async function NewChauffeurPage() {
  const tenantId = getCurrentTenantId();
  const [fournisseurs, vehicules] = await Promise.all([
    listFournisseurs(tenantId, { type: "transport" }),
    listVehicules(tenantId),
  ]);

  return (
    <div className="max-w-2xl space-y-4">
      <a
        href="/chauffeurs"
        className="inline-flex items-center gap-1 text-sm text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-colors"
      >
        <ArrowLeft size={14} />
        Retour aux chauffeurs
      </a>

      <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-[var(--sadic-surface)] p-6">
        <h1 className="mb-4 text-lg font-semibold text-slate-900 dark:text-slate-100">Nouveau chauffeur</h1>
        <p className="mb-4 text-xs text-slate-500 dark:text-slate-400">
          Si le chauffeur est propriétaire de son propre camion, créez d'abord un fournisseur de type «
          Transport » pour lui (même nom), puis rattachez-le ici.
        </p>

        <form action={createChauffeurAction} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Nom *">
              <input name="nom" required className={inputClass} />
            </Field>
            <Field label="Téléphone">
              <input name="telephone" className={`${inputClass} font-mono`} />
            </Field>
            <Field label="CIN">
              <input name="cin" className={`${inputClass} font-mono`} />
            </Field>
            <Field label="Fournisseur (patron)">
              <select name="fournisseurId" defaultValue="" className={inputClass}>
                <option value="">— Aucun —</option>
                {fournisseurs.map((f: any) => (
                  <option key={f._id} value={f._id}>
                    {f.nom}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Véhicule actuel">
              <select name="vehiculeActuelId" defaultValue="" className={inputClass}>
                <option value="">— Aucun —</option>
                {vehicules.map((v: any) => (
                  <option key={v._id} value={v._id}>
                    {v.immatriculation}
                    {v.typeVehicule ? ` — ${v.typeVehicule}` : ""}
                  </option>
                ))}
              </select>
            </Field>
          </div>

          {fournisseurs.length === 0 && (
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Aucun fournisseur de type « Transport » créé pour l'instant —{" "}
              <a href="/fournisseurs/new" className="text-accent hover:underline">
                créer un fournisseur
              </a>{" "}
              d'abord si ce chauffeur en dépend.
            </p>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <a
              href="/chauffeurs"
              className="rounded-md border border-slate-200 dark:border-slate-700 px-3 py-1.5 text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors"
            >
              Annuler
            </a>
            <button
              type="submit"
              className="rounded-md bg-accent px-3 py-1.5 text-sm font-medium text-white hover:bg-accent/90 transition-colors"
            >
              Créer
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
