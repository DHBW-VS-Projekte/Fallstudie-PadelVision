/**
 * scripts/generate-seed.mjs – erzeugt database/seed.sql aus src/data/catalog.json
 *
 * Warum generiert? catalog.json ist die EINZIGE Quelle der Wahrheit für
 * Standorte und Courts. Eine von Hand gepflegte seed.sql würde irgendwann
 * vom Frontend und von PHP abweichen.
 * Aufruf: npm run seed (läuft auch automatisch bei npm run build).
 * INSERT … ON DUPLICATE KEY UPDATE: wiederholtes Ausführen ist unschädlich.
 * Hinweis: VALUES(spalte) gilt in MySQL 8.0.20+ als "deprecated" (nur eine
 * Warnung), funktioniert aber überall. Die neue Alias-Syntax kennen MySQL 5.7
 * und MariaDB nicht – deshalb bleibt es bewusst bei VALUES().
 */
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const catalog = JSON.parse(readFileSync(join(root, "src/data/catalog.json"), "utf8"));

/** SQL-String maskieren (nur für unsere eigenen Katalogdaten, nie für Nutzereingaben) */
const q = (value) => `'${String(value).replace(/\\/g, "\\\\").replace(/'/g, "''")}'`;

const lines = [
  "-- =====================================================================",
  "-- seed.sql – AUTOMATISCH ERZEUGT aus src/data/catalog.json",
  "-- NICHT von Hand bearbeiten: npm run seed erzeugt die Datei neu.",
  "-- =====================================================================",
  "",
];
for (const loc of catalog.locations) {
  lines.push(
    `INSERT INTO locations (slug, name, timezone) VALUES (${q(loc.slug)}, ${q(loc.name)}, ${q(loc.timezone)}) ON DUPLICATE KEY UPDATE name = VALUES(name), timezone = VALUES(timezone);`,
  );
}
lines.push("");
for (const loc of catalog.locations) {
  for (const court of loc.courts) {
    lines.push(
      `INSERT INTO courts (id, location_slug, name, kind, is_panorama) VALUES (${q(court.id)}, ${q(loc.slug)}, ${q(court.name)}, ${q(court.kind)}, ${court.panorama ? 1 : 0}) ON DUPLICATE KEY UPDATE location_slug = VALUES(location_slug), name = VALUES(name), kind = VALUES(kind), is_panorama = VALUES(is_panorama);`,
    );
  }
}
lines.push("", "INSERT IGNORE INTO app_state (id, availability_version) VALUES (1, 0);", "");
writeFileSync(join(root, "database/seed.sql"), lines.join("\n"), "utf8");
const courts = catalog.locations.reduce((sum, l) => sum + l.courts.length, 0);
console.log(`seed.sql erzeugt: ${catalog.locations.length} Standorte, ${courts} Courts`);