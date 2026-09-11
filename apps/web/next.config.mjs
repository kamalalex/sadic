/** @type {import('next').NextConfig} */
const nextConfig = {
  // Permet à Next.js de compiler à la volée le code TypeScript des packages
  // du monorepo, sans étape de build séparée pour chaque module — voir CDC
  // section 3.2/3.3.
  transpilePackages: [
    "@sadic/core",
    "@sadic/module-crm",
    "@sadic/module-parametres",
    "@sadic/module-transport",
  ],
};

export default nextConfig;
