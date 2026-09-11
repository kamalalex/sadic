import type { Config } from "tailwindcss";

// Système de design SADIC — voir docs/design-system-sadic.md et
// CDC section 3.9. Ne pas ajouter de rounded-2xl / shadow-2xl ailleurs
// dans le code : tout doit passer par ces tokens.
const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "../../packages/*/src/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        accent: {
          DEFAULT: "#4F46E5", // indigo-600 — couleur d'accent SADIC
          light: "#818CF8", // indigo-400, utilisé en dark mode
        },
      },
      fontFamily: {
        sans: ["var(--font-plus-jakarta-sans)", "system-ui", "sans-serif"],
      },
      borderRadius: {
        // Rappel volontaire : pas de xl/2xl dans ce projet (voir design system).
        lg: "0.5rem",
        md: "0.375rem",
      },
    },
  },
  plugins: [],
};

export default config;
