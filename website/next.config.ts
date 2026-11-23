/**
 * next.config.ts – GEÄNDERT für den statischen Export auf klassischem Webhosting
 *
 * output: "export"       → npm run build erzeugt den Ordner out/ mit fertigen
 *                          HTML-Dateien. Die kommen per FTP auf den Webspace –
 *                          dort läuft kein Node.js, nur Apache + PHP.
 * trailingSlash: true    → Seiten werden als /buchung/index.html erzeugt. Apache
 *                          findet sie so ohne Zusatzregeln unter /buchung/.
 * images.unoptimized     → next/image kann ohne Node-Server keine Bilder
 *                          verkleinern; die Bilder werden direkt ausgeliefert.
 */
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  images: { unoptimized: true },
  experimental: { agentUpgrade: "security" },
};

export default nextConfig;