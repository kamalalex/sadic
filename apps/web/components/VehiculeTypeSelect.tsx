import { TYPES_VEHICULE } from "@sadic/module-transport";

const inputClass =
  "w-full rounded-md border border-slate-200 dark:border-slate-700 bg-transparent px-3 py-1.5 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-accent";

/**
 * Sélecteur de type de véhicule — référentiel partagé Chauffeur/Groupe
 * (voir CDC section 2.5, @sadic/module-transport TYPES_VEHICULE).
 */
export function VehiculeTypeSelect({ defaultValue }: { defaultValue?: string }) {
  return (
    <select name="typeVehicule" defaultValue={defaultValue ?? ""} className={inputClass}>
      <option value="">— Sélectionner —</option>
      {TYPES_VEHICULE.map((t) => (
        <option key={t} value={t}>
          {t}
        </option>
      ))}
    </select>
  );
}
