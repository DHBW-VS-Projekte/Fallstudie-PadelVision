/**
 * postcss.config.mjs – NEU!!
 * Zweck: Bindet Tailwind CSS v4 über das offizielle PostCSS-Plugin in Next.js ein.
 * Warum: Ohne diese Datei wird `@import "tailwindcss";` in globals.css nicht
 * verarbeitet und KEINE Tailwind-Klasse greift.
 * Voraussetzung: einmalig `npm install -D @tailwindcss/postcss` ausführen.
 * (Falls Tailwind bei dir nachweislich schon funktioniert, kannst du diese Datei weglassen.)
 */
const config = {
  plugins: {
    "@tailwindcss/postcss": {},
  },
};

export default config;
