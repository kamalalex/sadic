import { Plus, Search, Download } from "lucide-react";
import { listClients, LABELS_TYPE_CLIENT, type TypeClient } from "@sadic/module-crm";
import { getCurrentTenantId } from "../../lib/currentTenant";
import { Badge } from "../../components/Badge";

// Page dynamique par nature (données par tenant, jamais prérendues
// statiquement) — voir CDC section 3.4 (multi-tenant).
export const dynamic = "force-dynamic";

export default async function ClientsPage({
  searchParams,
}: {
  searchParams: { q?: string };
}) {
  const tenantId = getCurrentTenantId();
  const q = searchParams.q ?? "";
  const clients = await listClients(tenantId, { search: q });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Clients</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {clients.length} client{clients.length > 1 ? "s" : ""}
          </p>
        </div>
        <a
          href="/clients/new"
          className="inline-flex items-center gap-1.5 rounded-md bg-accent px-3 py-2 text-sm font-medium text-white hover:bg-accent/90 transition-colors"
        >
          <Plus size={16} />
          Nouveau client
        </a>
      </div>

      {/* Barre d'outils — recherche + export (voir docs/design-system-sadic.md) */}
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
              placeholder="Rechercher par nom, ICE ou email..."
              className="w-full rounded-md border border-slate-200 dark:border-slate-700 bg-transparent py-1.5 pl-8 pr-3 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-accent"
            />
          </div>
        </form>
        <button
          type="button"
          disabled
          title="Export à venir"
          className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 dark:border-slate-700 px-3 py-1.5 text-sm text-slate-500 dark:text-slate-400 opacity-60 cursor-not-allowed"
        >
          <Download size={14} />
          Exporter
        </button>
      </div>

      <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-800 bg-[var(--sadic-surface)]">
        {clients.length === 0 ? (
          <p className="p-6 text-sm text-slate-500 dark:text-slate-400">
            {q ? `Aucun client ne correspond à "${q}".` : "Aucun client pour l'instant."}
          </p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-left text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
                <th className="py-2.5 px-4 font-medium">Nom</th>
                <th className="py-2.5 px-4 font-medium">Type</th>
                <th className="py-2.5 px-4 font-medium">ICE</th>
                <th className="py-2.5 px-4 font-medium">Ville, Pays</th>
                <th className="py-2.5 px-4 font-medium">Contact principal</th>
                <th className="py-2.5 px-4 font-medium">Échéance</th>
              </tr>
            </thead>
            <tbody>
              {clients.map((c: any) => {
                const contactPrincipal = c.contacts?.[0];
                const type: TypeClient | undefined = c.type;
                return (
                  <tr
                    key={c._id}
                    className="border-b border-slate-100 dark:border-slate-800/60 last:border-0 hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors"
                  >
                    <td className="py-2.5 px-4 font-medium text-slate-900 dark:text-slate-100">{c.nom}</td>
                    <td className="py-2.5 px-4">
                      {type ? (
                        <Badge variant="neutral">
                          {type === "autre" && c.typeAutrePrecision ? c.typeAutrePrecision : LABELS_TYPE_CLIENT[type]}
                        </Badge>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>
                    <td className="py-2.5 px-4 font-mono text-slate-600 dark:text-slate-400">{c.ice || "—"}</td>
                    <td className="py-2.5 px-4 text-slate-600 dark:text-slate-400">
                      {[c.adresse?.ville, c.adresse?.pays].filter(Boolean).join(", ") || "—"}
                    </td>
                    <td className="py-2.5 px-4 text-slate-600 dark:text-slate-400">
                      {contactPrincipal ? (
                        <>
                          <span className="text-slate-900 dark:text-slate-100">{contactPrincipal.nom}</span>
                          {contactPrincipal.poste ? ` — ${contactPrincipal.poste}` : ""}
                        </>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="py-2.5 px-4 font-mono text-slate-600 dark:text-slate-400">{c.echeanceJours} j</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
