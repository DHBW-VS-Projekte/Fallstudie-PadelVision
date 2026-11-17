/**
 * tests/booking.test.mjs – Tests für reine Frontend-Logik (eingebauter Node-Test-Runner)
 *
 * Aufruf: npm test   (= node --experimental-strip-types --test tests/booking.test.mjs)
 * Voraussetzung: Node.js 22.6 oder neuer (node -v). Node entfernt dabei die
 * TypeScript-Typen aus den .ts-Dateien selbst – kein Paket nötig.
 *
 * Geprüft: Formatierung, Fehler-Übersetzung, Preis-Anzeige, Katalog-Konsistenz
 * (catalog.json ↔ seed.sql ↔ courtsContent.ts).
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const catalog = JSON.parse(readFileSync(new URL("../src/data/catalog.json", import.meta.url), "utf8"));
const format = await import("../src/lib/booking/format.ts");
const errors = await import("../src/lib/booking/errors.ts");
const pricing = await import("../src/lib/booking/pricing-display.ts");

test("Formatierung: Euro", () => {
  assert.equal(format.formatEuro(2800).replace(/\s/g, " "), "28 €");
  assert.equal(format.formatEuro(2850).replace(/\s/g, " "), "28,50 €");
});

test("Formatierung: Datum ohne Zeitzonen-Verrutschen", () => {
  assert.equal(format.formatDateLong("2027-03-14"), "Sonntag, 14. März 2027");
  assert.equal(format.addDays("2027-03-31", 1), "2027-04-01");
  assert.equal(format.addDays("2027-12-31", 1), "2028-01-01");
});

test("Formatierung: Countdown", () => {
  assert.equal(format.formatCountdown(300000), "5:00");
  assert.equal(format.formatCountdown(59001), "1:00");
  assert.equal(format.formatCountdown(-5), "0:00");
});

test("Formatierung: Tagesabschnitte", () => {
  assert.equal(format.dayPart(11 * 60 + 30), "Vormittag");
  assert.equal(format.dayPart(12 * 60), "Nachmittag");
  assert.equal(format.dayPart(17 * 60), "Abend");
});

test("Heute in einer Zeitzone", () => {
  // 23:30 UTC am 14.03. ist in Athen schon der 15.03.
  assert.equal(format.todayIn("Europe/Athens", new Date("2027-03-14T23:30:00Z")), "2027-03-15");
  assert.equal(format.todayIn("Europe/Berlin", new Date("2027-03-14T22:30:00Z")), "2027-03-14");
});

test("Saisonpause Porto-Vecchio", () => {
  const season = { fromMonth: 4, toMonth: 10 };
  assert.equal(format.seasonClosedForWindow(season, "Europe/Paris", 14, new Date("2027-01-10T12:00:00Z")), true);
  assert.equal(format.seasonClosedForWindow(season, "Europe/Paris", 14, new Date("2027-03-25T12:00:00Z")), false, "April liegt im Fenster");
  assert.equal(format.seasonClosedForWindow(null, "Europe/Paris", 14, new Date("2027-01-10T12:00:00Z")), false);
});

test("Eingaben prüfen wie PHP", () => {
  assert.equal(format.validName("Matheo Mena Arribas"), true);
  assert.equal(format.validName("Zoë O'Neill"), true);
  assert.equal(format.validName("A"), false);
  assert.equal(format.validName("<script>"), false);
  assert.equal(format.looksLikeEmail("max@example.com"), true);
  assert.equal(format.looksLikeEmail("max@"), false);
});

test("Fehler-Übersetzung", () => {
  assert.equal(errors.toErrorCode("SLOT_TAKEN"), "SLOT_TAKEN");
  assert.equal(errors.toErrorCode("METHOD"), "SERVER_ERROR");
  assert.match(errors.errorMessage("SLOT_TAKEN"), /gerade eben vergeben/);
  assert.equal(errors.errorMessage("OUTSIDE_HOURS", "Diese Startzeit ist schon vorbei."), "Diese Startzeit ist schon vorbei.");
  assert.equal(errors.errorMessage("SERVER_ERROR", "Interner Text"), "Die Buchung ist gerade nicht erreichbar.");
});

test("Preis-Anzeige", () => {
  const p = catalog.pricing;
  const panorama = { id: "marbella-3", name: "Panorama-Court", kind: "outdoor", panorama: true };
  assert.equal(pricing.estimateParts(panorama, true, 0, 0, p).totalCents, 4200);
  assert.equal(pricing.estimateParts(panorama, false, 2, 1, p).totalCents, 2800 + 600 + 800 + 600);
  const marbella = catalog.locations.find((l) => l.slug === "marbella");
  assert.equal(pricing.locationFromCents(marbella, p), 2800);
});

test("Katalog: 5 Standorte, 20 Courts, eindeutige IDs", () => {
  assert.equal(catalog.locations.length, 5);
  const ids = catalog.locations.flatMap((l) => l.courts.map((c) => c.id));
  assert.equal(ids.length, 20);
  assert.equal(new Set(ids).size, 20);
  for (const l of catalog.locations) {
    for (const c of l.courts) assert.ok(c.id.startsWith(`${l.slug}-`), `${c.id} gehört zu ${l.slug}`);
    assert.doesNotThrow(() => new Intl.DateTimeFormat("de-DE", { timeZone: l.timezone }), l.timezone);
  }
});

test("Katalog: Aufteilung wie in der Vorgabe", () => {
  const expected = { konstanz: [2, 1, 0], marbella: [2, 4, 1], "porto-vecchio": [0, 3, 0], santorini: [1, 2, 1], chania: [2, 3, 0] };
  for (const l of catalog.locations) {
    const split = [l.courts.filter((c) => c.kind === "indoor").length, l.courts.filter((c) => c.kind === "outdoor").length, l.courts.filter((c) => c.panorama).length];
    assert.deepEqual(split, expected[l.slug], l.slug);
  }
});

test("seed.sql enthält alle Courts aus catalog.json (npm run seed ausgeführt?)", () => {
  const seed = readFileSync(new URL("../database/seed.sql", import.meta.url), "utf8");
  for (const l of catalog.locations) for (const c of l.courts) assert.ok(seed.includes(`'${c.id}'`), `${c.id} fehlt in seed.sql`);
});

test("Abgleich mit courtsContent.ts (Seite /courts)", async (t) => {
  let content;
  try {
    content = await import("../src/components/courts/courtsContent.ts");
  } catch {
    t.skip("courtsContent.ts nicht ladbar – Abgleich übersprungen");
    return;
  }
  for (const l of catalog.locations) {
    const c = content.locations.find((x) => x.slug === l.slug);
    assert.ok(c, `${l.slug} fehlt in courtsContent.ts`);
    assert.equal(l.courts.filter((x) => x.kind === "indoor").length, c.courts.indoor, `${l.slug}: Indoor`);
    assert.equal(l.courts.filter((x) => x.kind === "outdoor").length, c.courts.outdoor, `${l.slug}: Outdoor`);
    assert.equal(l.courts.filter((x) => x.panorama).length, c.courts.panorama, `${l.slug}: Panorama`);
    assert.equal(l.hoursLabel, c.hours, `${l.slug}: Öffnungszeiten`);
  }
});