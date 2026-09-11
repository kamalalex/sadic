"use client";

import { useState } from "react";
import { TYPES_CLIENT, LABELS_TYPE_CLIENT, type TypeClient } from "@sadic/module-crm";

const inputClass =
  "w-full rounded-md border border-slate-200 dark:border-slate-700 bg-transparent px-3 py-1.5 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-accent";

/**
 * Sélecteur de type de client — liste fermée (voir CDC section 2.1) avec
 * précision libre uniquement affichée quand "Autre" est choisi.
 */
export function TypeSelect({ defaultValue }: { defaultValue?: TypeClient }) {
  const [type, setType] = useState<TypeClient | "">(defaultValue ?? "");

  return (
    <div className="space-y-3">
      <label className="block space-y-1">
        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Type</span>
        <select
          name="type"
          value={type}
          onChange={(e) => setType(e.target.value as TypeClient)}
          className={inputClass}
        >
          <option value="">— Sélectionner —</option>
          {TYPES_CLIENT.map((t) => (
            <option key={t} value={t}>
              {LABELS_TYPE_CLIENT[t]}
            </option>
          ))}
        </select>
      </label>

      {type === "autre" && (
        <label className="block space-y-1">
          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Préciser le type</span>
          <input name="typeAutrePrecision" className={inputClass} />
        </label>
      )}
    </div>
  );
}
