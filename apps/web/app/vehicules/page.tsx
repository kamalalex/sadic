import { Plus, Search } from "lucide-react";
import { listVehicules } from "@sadic/module-transport";
import { getCurrentTenantId } from "../../lib/currentTenant";
import { Badge } from "../../components/Badge";

// Page dynamique par nature (données par tenant) — voir CDC section 3.4.
export const dynamic = "force-dynamic";

export default async function VehiculesPage({
  searchParams,
}: {
  searchParams: { q?: string };
}) {
  const tenantId = getCurrentTenantId();
  const q = searchParams.q ?? "";
  const vehicules = await listVehicules(tenantId, { search: q });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Véhicules</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {vehicules.length} véhicule{vehicules.length > 1 ? "s" : ""}
          </p>
        </div>
        <a
          href="/vehicules/new"
          className="inline-flex items-center gap-1.5 rounded-md bg-accent px-3 py-2 text-sm font-medium text-white hover:bg-accent/90 transition-colors"
        >
          <Plus size={16} />
          Nouveau véhicule
        </a>
      </div>

      <div className="flex items-center gap-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-[var(--sadic-surface)] p-2">
        <form method="get" className="flex-1">
          <div className="relative">
            <Search
              size={16}
              className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              name="q"
              defaultValue={q}
              placeholder="Rechercher par immatriculation..."
              className="w-full rounded-md border border-slate-200 dark:border-slate-700 bg-transparent py-1.5 pl-8 pr-3 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-accent"
            />
          </div>
        </form>
      </div>

      <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-800 bg-[var(--sadic-surface)]">
        {vehicules.length === 0 ? (
          <p className="p-6 text-sm text-slate-500 dark:text-slate-400">
            {q ? `Aucun véhicule ne correspond à "${q}".` : "Aucun véhicule pour l'instant."}
          </p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-left text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
                <th className="py-2.5 px-4 font-medium">Immatriculation</th>
                <th className="py-2.5 px-4 font-medium">Type</th>
                <th className="py-2.5 px-4 font-medium">Fournisseur propriétaire</th>
                <th className="py-2.5 px-4 font-medium">Statut</th>
              </tr>
            </thead>
            <tbody>
              {vehicules.map((v: any) => (
                <tr
                  key={v._id}
                  className="border-b border-slate-100 dark:border-slate-800/60 last:border-0 hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors"
                >
                  <td className="py-2.5 px-4 font-mono font-medium text-slate-900 dark:text-slate-100">
                    {v.immatriculation}
                  </td>
                  <td className="py-2.5 px-4 text-slate-600 dark:text-slate-400">{v.typeVehicule || "—"}</td>
                  <td className="py-2.5 px-4 text-slate-600 dark:text-slate-400">
                    {v.fournisseurId?.nom || "—"}
                  </td>
                  <td className="py-2.5 px-4">
                    <Badge variant={v.statut === "actif" ? "success" : "neutral"}>
                      {v.statut === "actif" ? "Actif" : "Inactif"}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
