/**
 * scripts/copy-catalog.mjs – kopiert catalog.json und die SQL-Dateien nach api/data/
 *
 * Warum? PHP auf dem Webspace soll exakt dieselben Standorte, Öffnungszeiten
 * und Preise lesen wie das Frontend. install.php braucht schema.sql und
 * seed.sql auf dem Server. api/data/ ist per .htaccess für Besucher gesperrt.
 * Läuft automatisch bei npm run build.
 */
import { copyFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
mkdirSync(join(root, "api/data"), { recursive: true });
for (const [from, to] of [
  ["src/data/catalog.json", "catalog.json"],
  ["database/schema.sql", "schema.sql"],
  ["database/seed.sql", "seed.sql"],
  ["database/reset.sql", "reset.sql"],
  ["database/event-bookings-migration.sql", "event-bookings-migration.sql"],
]) {
  copyFileSync(join(root, from), join(root, "api/data", to));
  console.log(`kopiert: ${from} → api/data/${to}`);
}