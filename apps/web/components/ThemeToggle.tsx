"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

/**
 * Bascule clair/sombre — le dark mode est natif au système de design SADIC
 * (voir docs/design-system-sadic.md), pas ajouté après coup.
 * Préférence mémorisée en localStorage (confort par appareil, pas une
 * donnée métier).
 */
export function ThemeToggle() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem("sadic-theme");
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      const dark = stored ? stored === "dark" : prefersDark;
      setIsDark(dark);
      document.documentElement.classList.toggle("dark", dark);
    } catch {
      // localStorage indisponible (mode privé, etc.) — on reste en clair.
    }
  }, []);

  function toggle() {
    const next = !isDark;
    setIsDark(next);
    document.documentElement.classList.toggle("dark", next);
    try {
      window.localStorage.setItem("sadic-theme", next ? "dark" : "light");
    } catch {
      // ignoré volontairement
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label="Basculer le thème clair/sombre"
      className="inline-flex items-center justify-center rounded-md border border-slate-200 dark:border-slate-800 p-1.5 text-slate-500 dark:text-slate-400 hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors"
    >
      {isDark ? <Sun size={16} /> : <Moon size={16} />}
    </button>
  );
}
