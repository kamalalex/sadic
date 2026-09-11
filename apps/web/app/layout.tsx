import type { ReactNode } from "react";
import { Plus_Jakarta_Sans } from "next/font/google";
import { Boxes } from "lucide-react";
import { ThemeToggle } from "../components/ThemeToggle";
import "./globals.css";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plus-jakarta-sans",
  display: "swap",
});

export const metadata = {
  title: "SADIC",
  description: "Système Automatisé des Données Interconnectées",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="fr" className={plusJakartaSans.variable}>
      <body className="font-sans antialiased bg-[var(--sadic-bg)] text-[var(--sadic-text)] min-h-screen">
        <header className="border-b border-slate-200 dark:border-slate-800 bg-[var(--sadic-surface)]">
          <div className="mx-auto max-w-6xl flex items-center gap-6 px-6 py-3">
            <a href="/" className="flex items-center gap-2 font-semibold text-slate-900 dark:text-slate-100">
              <Boxes size={18} className="text-accent dark:text-accent-light" />
              SADIC
            </a>
            <nav className="flex items-center gap-4 text-sm text-slate-600 dark:text-slate-400">
              <a href="/" className="hover:text-slate-900 dark:hover:text-slate-100 transition-colors">
                Accueil
              </a>
              <a href="/clients" className="hover:text-slate-900 dark:hover:text-slate-100 transition-colors">
                Clients
              </a>
              <a href="/chauffeurs" className="hover:text-slate-900 dark:hover:text-slate-100 transition-colors">
                Chauffeurs
              </a>
              <a href="/vehicules" className="hover:text-slate-900 dark:hover:text-slate-100 transition-colors">
                Véhicules
              </a>
              <a href="/fournisseurs" className="hover:text-slate-900 dark:hover:text-slate-100 transition-colors">
                Fournisseurs
              </a>
            </nav>
            <div className="ml-auto">
              <ThemeToggle />
            </div>
          </div>
        </header>
        <main className="mx-auto max-w-6xl px-6 py-8">{children}</main>
      </body>
    </html>
  );
}
