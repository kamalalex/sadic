import { ArrowLeft } from "lucide-react";
import { listFournisseurs } from "@sadic/module-transport";
import { getCurrentTenantId } from "../../../lib/currentTenant";
import { createVehiculeAction } from "../actions";
import { VehiculeTypeSelect } from "../../../components/VehiculeTypeSelect";

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

export default async function NewVehiculePage() {
  const tenantId = getCurrentTenantId();
  const fournisseurs = await listFournisseurs(tenantId, { type: "transport" });

  return (
    <div className="max-w-2xl space-y-4">
      <a
        href="/vehicules"
        className="inline-flex items-center gap-1 text-sm text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-colors"
      >
        <ArrowLeft size={14} />
        Retour aux véhicules
      </a>

      <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-[var(--sadic-surface)] p-6">
        <h1 className="mb-4 text-lg font-semibold text-slate-900 dark:text-slate-100">Nouveau véhicule</h1>

        <form action={createVehiculeAction} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Immatriculation *">
              <input name="immatriculation" required className={`${inputClass} font-mono`} />
            </Field>
            <Field label="Type de véhicule">
              <VehiculeTypeSelect />
            </Field>
            <Field label="Fournisseur propriétaire">
              <select name="fournisseurId" defaultValue="" className={inputClass}>
                <option value="">— Aucun —</option>
                {fournisseurs.map((f: any) => (
                  <option key={f._id} value={f._id}>
                    {f.nom}
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
              d'abord si ce véhicule a un propriétaire à rattacher.
            </p>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <a
              href="/vehicules"
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
