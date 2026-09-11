import { ArrowLeft } from "lucide-react";
import { TYPES_FOURNISSEUR, LABELS_TYPE_FOURNISSEUR } from "@sadic/module-transport";
import { createFournisseurAction } from "../actions";

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

export default function NewFournisseurPage() {
  return (
    <div className="max-w-2xl space-y-4">
      <a
        href="/fournisseurs"
        className="inline-flex items-center gap-1 text-sm text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-colors"
      >
        <ArrowLeft size={14} />
        Retour aux fournisseurs
      </a>

      <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-[var(--sadic-surface)] p-6">
        <h1 className="mb-4 text-lg font-semibold text-slate-900 dark:text-slate-100">Nouveau fournisseur</h1>
        <p className="mb-4 text-xs text-slate-500 dark:text-slate-400">
          Un sous-traitant transport (chauffeur/camion) est un fournisseur de type « Transport » — y compris
          quand le chauffeur est propriétaire de son propre camion.
        </p>

        <form action={createFournisseurAction} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Nom *">
              <input name="nom" required className={inputClass} />
            </Field>
            <Field label="Type">
              <select name="type" defaultValue="" className={inputClass}>
                <option value="">— Sélectionner —</option>
                {TYPES_FOURNISSEUR.map((t) => (
                  <option key={t} value={t}>
                    {LABELS_TYPE_FOURNISSEUR[t]}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Société">
              <input name="societe" className={inputClass} />
            </Field>
            <Field label="Contact">
              <input name="contact" className={inputClass} />
            </Field>
            <Field label="Téléphone">
              <input name="telephone" className={`${inputClass} font-mono`} />
            </Field>
          </div>

          <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
            <input
              type="checkbox"
              name="facturationDirecte"
              className="h-4 w-4 rounded border-slate-300 dark:border-slate-700 text-accent focus:ring-accent"
            />
            Facture en direct (plutôt qu'un paiement fournisseur classique)
          </label>

          <div className="flex justify-end gap-2 pt-2">
            <a
              href="/fournisseurs"
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
