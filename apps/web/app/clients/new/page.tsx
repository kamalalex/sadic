import { ArrowLeft } from "lucide-react";
import { createClientAction } from "../actions";
import { TypeSelect } from "../TypeSelect";
import { ContactsRepeater } from "../ContactsRepeater";

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

export default function NewClientPage() {
  return (
    <div className="max-w-2xl space-y-4">
      <a
        href="/clients"
        className="inline-flex items-center gap-1 text-sm text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-colors"
      >
        <ArrowLeft size={14} />
        Retour aux clients
      </a>

      <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-[var(--sadic-surface)] p-6">
        <h1 className="mb-4 text-lg font-semibold text-slate-900 dark:text-slate-100">Nouveau client</h1>

        <form action={createClientAction} className="space-y-6">
          {/* Identité entreprise */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Nom *">
              <input name="nom" required className={inputClass} />
            </Field>
            <TypeSelect />
            <Field label="ICE">
              <input name="ice" className={`${inputClass} font-mono`} />
            </Field>
            <Field label="Email (entreprise)">
              <input name="email" type="email" className={inputClass} />
            </Field>
            <Field label="Téléphone (entreprise)">
              <input name="telephone" className={`${inputClass} font-mono`} />
            </Field>
          </div>

          {/* Adresse structurée */}
          <fieldset className="space-y-3 rounded-md border border-slate-200 dark:border-slate-800 p-3">
            <legend className="px-1 text-sm font-medium text-slate-700 dark:text-slate-300">Adresse</legend>
            <Field label="Adresse">
              <input name="adresse_ligne1" className={inputClass} />
            </Field>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Field label="Ville">
                <input name="adresse_ville" className={inputClass} />
              </Field>
              <Field label="Code postal">
                <input name="adresse_codePostal" className={`${inputClass} font-mono`} />
              </Field>
              <Field label="Pays">
                <input name="adresse_pays" defaultValue="Maroc" required className={inputClass} />
              </Field>
            </div>
          </fieldset>

          {/* Contacts (un ou plusieurs) */}
          <ContactsRepeater />

          {/* Facturation */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Échéance (jours)">
              <input name="echeanceJours" type="number" defaultValue={30} className={`${inputClass} font-mono`} />
            </Field>
            <Field label="Agent commercial">
              <input name="agent" className={inputClass} />
            </Field>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <a
              href="/clients"
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
