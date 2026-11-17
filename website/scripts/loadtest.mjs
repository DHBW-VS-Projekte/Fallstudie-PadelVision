/**
 * scripts/loadtest.mjs – Nachweis "keine Doppelbuchung" gegen die LIVE-API
 *
 * Läuft auf deinem Laptop (Node 20+, nur eingebautes fetch, keine Pakete) und
 * spricht die API über HTTPS an – NICHT die Datenbank direkt.
 *
 * Beispiel:
 *   node scripts/loadtest.mjs --url https://eure-domain.de --court marbella-1 --date 2027-03-14 --time 18:00 --users 30 --token EUER_LOADTEST_TOKEN
 *
 * Ablauf:
 *  1. 30 simulierte Nutzer (je eigenes Geräte-Cookie) fordern GLEICHZEITIG einen Hold
 *     für denselben Slot an → erwartet: genau 1 Erfolg, 29 × SLOT_TAKEN. Der Gewinner bucht.
 *  2. Überlappung: 10 Nutzer greifen gleichzeitig auf 3 überlappende Startzeiten
 *     (3 Stunden später, jeweils ±30 Min.) zu → höchstens 1 Erfolg.
 *  3. 30 Nutzer auf 30 verschiedene, nicht überlappende freie Slots → 30 Erfolge.
 *     (Diese Holds werden danach wieder freigegeben.)
 * Mit --token (= LOADTEST_TOKEN aus config.php) entfällt die Grenze pro Gerät.
 * Danach in /verwaltung "Alle Testdaten zurücksetzen" drücken.
 */

const args = Object.fromEntries(
  process.argv.slice(2).reduce((pairs, arg, i, all) => (arg.startsWith("--") ? [...pairs, [arg.slice(2), all[i + 1]]] : pairs), []),
);
const BASE = (args.url ?? "").replace(/\/+$/, "");
const COURT = args.court ?? "marbella-1";
const DATE = args.date ?? "";
const TIME = args.time ?? "18:00";
const USERS = Number(args.users ?? 30);
const TOKEN = args.token ?? "";

if (!BASE || !/^\d{4}-\d{2}-\d{2}$/.test(DATE) || !/^\d{2}:\d{2}$/.test(TIME)) {
  console.log("Aufruf: node scripts/loadtest.mjs --url https://eure-domain.de --court marbella-1 --date JJJJ-MM-TT --time 18:00 [--users 30] [--token LOADTEST_TOKEN]");
  console.log("Das Datum muss innerhalb der nächsten 13 Tage liegen, die Uhrzeit in den Öffnungszeiten.");
  process.exit(1);
}

const toMin = (t) => Number(t.slice(0, 2)) * 60 + Number(t.slice(3));
const toTime = (m) => `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;

/** Ein simulierter Nutzer mit eigenem Cookie-Speicher (= eigenes Gerät) */
function createUser(n) {
  let cookie = "";
  async function call(method, path, body) {
    const headers = { Origin: BASE, Referer: `${BASE}/buchung/` };
    if (cookie) headers.Cookie = cookie;
    if (TOKEN) headers["X-Loadtest-Token"] = TOKEN;
    if (body) headers["Content-Type"] = "application/json";
    const started = performance.now();
    const res = await fetch(`${BASE}/api${path}`, { method, headers, body: body ? JSON.stringify(body) : undefined });
    const ms = performance.now() - started;
    const setCookies = typeof res.headers.getSetCookie === "function" ? res.headers.getSetCookie() : [];
    for (const c of setCookies) if (c.startsWith("pv_device=")) cookie = c.split(";")[0];
    let json = null;
    try {
      json = await res.json();
    } catch {
      json = { ok: false, code: `HTTP_${res.status}` };
    }
    return { ok: json.ok === true, code: json.ok ? "OK" : json.code, data: json.data, details: json.details, ms };
  }
  return { n, call };
}

function stats(times) {
  if (times.length === 0) return "–";
  const min = Math.min(...times), max = Math.max(...times), avg = times.reduce((a, b) => a + b, 0) / times.length;
  return `min ${min.toFixed(0)} ms · Ø ${avg.toFixed(0)} ms · max ${max.toFixed(0)} ms`;
}
function count(results) {
  return results.reduce((acc, r) => ({ ...acc, [r.code]: (acc[r.code] ?? 0) + 1 }), {});
}

const users = Array.from({ length: Math.max(USERS, 30) }, (_, i) => createUser(i + 1));
let allPassed = true;
const report = [];

console.log(`\nPadelVision Lasttest gegen ${BASE}  (Court ${COURT}, ${DATE})`);
console.log(TOKEN ? "Lasttest-Token gesetzt – Gerätegrenze aufgehoben.\n" : "OHNE Lasttest-Token – bei vielen Durchläufen greift ggf. die Gerätegrenze.\n");

// 0) Jedes "Gerät" holt sich ein Cookie (version.php zählt nicht ins Rate Limit)
const versions = await Promise.all(users.map((u) => u.call("GET", "/version.php")));
if (!versions[0].ok) {
  console.log(`✘ API nicht erreichbar (${versions[0].code}). URL, Hochladen von api/ und config.php prüfen.`);
  process.exit(1);
}

// ---------- Test 1: 30 gleichzeitig auf denselben Slot ----------
const t1Users = users.slice(0, USERS);
const t1 = await Promise.all(t1Users.map((u) => u.call("POST", "/hold.php", { courtId: COURT, date: DATE, time: TIME })));
const winners = t1.filter((r) => r.ok);
const t1Pass = winners.length === 1 && t1.filter((r) => r.code === "SLOT_TAKEN").length === USERS - 1;
if (winners.length === 0) console.log(`Hinweis Test 1: kein Erfolg – Antworten: ${JSON.stringify(count(t1))}. Ist der Slot schon belegt oder außerhalb der Öffnungszeiten?`);
report.push({ Test: `1) ${USERS}× derselbe Slot ${TIME}`, Erwartet: `1 Erfolg, ${USERS - 1}× SLOT_TAKEN`, Ergebnis: JSON.stringify(count(t1)), Zeiten: stats(t1.map((r) => r.ms)), OK: t1Pass ? "✔" : "✘" });
allPassed &&= t1Pass;

let booking = null;
if (winners.length === 1) {
  const winner = t1Users[t1.indexOf(winners[0])];
  const hold = winners[0].data;
  const res = await winner.call("POST", "/book.php", {
    holdId: hold.holdId, holdToken: hold.holdToken, fullName: "Lasttest Gewinner", email: `lasttest-${Date.now()}@example.com`,
    rackets: 0, balls: 0, consent: true, idempotencyKey: crypto.randomUUID(),
  });
  booking = res.ok ? res.data.code : null;
  report.push({ Test: "1b) Gewinner bucht", Erwartet: "Buchung bestätigt", Ergebnis: res.ok ? res.data.code : res.code, Zeiten: stats([res.ms]), OK: res.ok ? "✔" : "✘" });
  allPassed &&= res.ok;
}

// ---------- Test 2: überlappende Startzeiten ----------
const base2 = toMin(TIME) + 180;
const times2 = [base2 - 30, base2, base2 + 30].map(toTime);
const t2Users = users.slice(0, 10);
const t2 = await Promise.all(t2Users.map((u, i) => u.call("POST", "/hold.php", { courtId: COURT, date: DATE, time: times2[i % 3] })));
const t2Ok = t2.filter((r) => r.ok).length;
const t2Pass = t2Ok <= 1 && t2.every((r) => r.ok || r.code === "SLOT_TAKEN" || r.code === "OUTSIDE_HOURS");
report.push({ Test: `2) 10× überlappend ${times2.join("/")}`, Erwartet: "höchstens 1 Erfolg", Ergebnis: JSON.stringify(count(t2)), Zeiten: stats(t2.map((r) => r.ms)), OK: t2Pass ? "✔" : "✘" });
allPassed &&= t2Pass;
// eigene Holds aus Test 2 wieder freigeben
await Promise.all(t2.map((r, i) => (r.ok ? t2Users[i].call("POST", "/release.php", { holdId: r.data.holdId, holdToken: r.data.holdToken }) : null)));

// ---------- Test 3: 30 verschiedene, nicht überlappende Slots ----------
const location = COURT.replace(/-\d+$/, "");
const courtIds = Array.from({ length: 6 }, (_, i) => `${location}-${i + 1}`);
const day = new Date(`${DATE}T12:00:00Z`);
const dates = [0, 1, 2, 3].map((d) => new Date(day.getTime() + d * 86400000).toISOString().slice(0, 10));
const free = [];
const scout = users[USERS] ?? users[0];
for (const date of dates) {
  for (const courtId of courtIds) {
    const res = await scout.call("GET", `/availability.php?court=${courtId}&date=${date}`);
    if (!res.ok) continue;
    let lastEnd = -1;
    for (const s of res.data.slots) {
      // nur freie Slots, die sich gegenseitig nicht überlappen (≥ 90 Min. Abstand)
      if (s.status === "free" && s.minute >= lastEnd) {
        free.push({ courtId, date, time: s.time });
        lastEnd = s.minute + 90;
      }
    }
    if (free.length >= USERS) break;
  }
  if (free.length >= USERS) break;
}
const targets = free.slice(0, USERS);
const t3 = await Promise.all(targets.map((slot, i) => t1Users[i].call("POST", "/hold.php", slot)));
const t3Pass = targets.length === USERS && t3.every((r) => r.ok);
report.push({ Test: `3) ${USERS}× verschiedene Slots`, Erwartet: `${USERS} Erfolge`, Ergebnis: targets.length < USERS ? `nur ${targets.length} freie Slots gefunden` : JSON.stringify(count(t3)), Zeiten: stats(t3.map((r) => r.ms)), OK: t3Pass ? "✔" : "✘" });
allPassed &&= t3Pass;
await Promise.all(t3.map((r, i) => (r.ok ? t1Users[i].call("POST", "/release.php", { holdId: r.data.holdId, holdToken: r.data.holdToken }) : null)));

// ---------- Kontrolle: Slot aus Test 1 ist jetzt "belegt" ----------
if (booking) {
  const check = await scout.call("GET", `/availability.php?court=${COURT}&date=${DATE}`);
  const slot = check.ok ? check.data.slots.find((s) => s.time === TIME) : null;
  const okCheck = slot?.status === "booked";
  report.push({ Test: "4) Belegung nach Buchung", Erwartet: `${TIME} = booked`, Ergebnis: slot ? slot.status : "nicht gefunden", Zeiten: stats([check.ms]), OK: okCheck ? "✔" : "✘" });
  allPassed &&= okCheck;
}

console.table(report);
console.log(allPassed ? "\n✔ BESTANDEN – keine Doppelbuchung\n" : "\n✘ FEHLGESCHLAGEN – Details siehe Tabelle\n");
console.log("Danach in /verwaltung „Alle Testdaten zurücksetzen“ drücken.");
process.exit(allPassed ? 0 : 1);