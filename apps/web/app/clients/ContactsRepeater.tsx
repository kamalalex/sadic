"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";

const inputClass =
  "w-full rounded-md border border-slate-200 dark:border-slate-700 bg-transparent px-2.5 py-1.5 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-accent";

/**
 * Un client peut avoir un ou plusieurs contacts (CDC section 2.1). Chaque
 * ligne utilise les MÊMES `name` (contact_nom, contact_email, ...) — le
 * serveur les récupère avec `formData.getAll("contact_nom")` etc., les
 * tableaux restant alignés par index (voir app/clients/actions.ts).
 */
export function ContactsRepeater() {
  const [rowIds, setRowIds] = useState<number[]>([0]);
  const nextId = rowIds.length ? Math.max(...rowIds) + 1 : 0;

  return (
    <div className="space-y-3">
      <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Contact(s)</span>

      {rowIds.map((id, index) => (
        <div
          key={id}
          className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_1fr_auto] gap-2 rounded-md border border-slate-200 dark:border-slate-800 p-3"
        >
          <input name="contact_nom" placeholder="Nom et prénom" required className={inputClass} />
          <input name="contact_email" type="email" placeholder="Email" className={inputClass} />
          <input name="contact_telephone" placeholder="Téléphone" className={`${inputClass} font-mono`} />
          <div className="flex items-center gap-2">
            <input name="contact_poste" placeholder="Poste" className={inputClass} />
            <button
              type="button"
              onClick={() => setRowIds((ids) => ids.filter((rowId) => rowId !== id))}
              disabled={rowIds.length <= 1}
              title="Retirer ce contact"
              className="shrink-0 rounded-md border border-slate-200 dark:border-slate-700 p-1.5 text-slate-400 hover:text-red-600 hover:border-red-200 dark:hover:border-red-900 disabled:opacity-30 disabled:hover:text-slate-400 transition-colors"
            >
              <Trash2 size={14} />
            </button>
          </div>
        </div>
      ))}

      <button
        type="button"
        onClick={() => setRowIds((ids) => [...ids, nextId])}
        className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 dark:border-slate-700 px-2.5 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors"
      >
        <Plus size={14} />
        Ajouter un contact
      </button>
    </div>
  );
}
