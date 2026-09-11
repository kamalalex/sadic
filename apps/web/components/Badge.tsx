import type { ReactNode } from "react";

/**
 * Badge d'état translucide — voir docs/design-system-sadic.md (CDC 3.9).
 * `neutral`/`accent` pour des catégories (ex. résidence client),
 * `success`/`warning`/`danger` réservés aux statuts opérationnels réels
 * (transit, retard, litige...) à partir de la Phase 3.
 */
type BadgeVariant = "neutral" | "accent" | "success" | "warning" | "danger";

const VARIANT_CLASSES: Record<BadgeVariant, string> = {
  neutral: "bg-slate-500/10 text-slate-600 dark:text-slate-400",
  accent: "bg-accent/10 text-accent dark:text-accent-light",
  success: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  warning: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  danger: "bg-red-500/10 text-red-600 dark:text-red-400",
};

export function Badge({ variant = "neutral", children }: { variant?: BadgeVariant; children: ReactNode }) {
  return (
    <span
      className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ${VARIANT_CLASSES[variant]}`}
    >
      {children}
    </span>
  );
}
