import { ArrowRight } from "lucide-react";

export default function HomePage() {
  return (
    <div className="max-w-2xl space-y-4">
      <h1 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
        SADIC — Phase 0 + Phase 1
      </h1>
      <p className="text-sm text-slate-600 dark:text-slate-400">
        Scaffold du monorepo (voir <code className="font-mono text-xs">README.md</code> à la racine)
        et première tranche verticale fonctionnelle : gestion des clients (module CRM), avec le
        système de design SADIC appliqué comme référence pour les modules suivants.
      </p>
      <a
        href="/clients"
        className="inline-flex items-center gap-1.5 rounded-md bg-accent px-3 py-2 text-sm font-medium text-white hover:bg-accent/90 transition-colors"
      >
        Voir les clients
        <ArrowRight size={16} />
      </a>
      <p className="text-sm text-slate-500 dark:text-slate-400">
        Suite du développement : voir le Cahier des Charges, section 7 (Roadmap et priorisation).
      </p>
    </div>
  );
}
