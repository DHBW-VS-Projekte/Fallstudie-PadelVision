/**
 * padelContent.ts – ALLE Texte und Daten der Seite "Padel erklärt"
 *
 * Warum eine eigene Datei? Inhalt und Darstellung sind getrennt: Texte
 * änderst du hier, ohne JSX anfassen zu müssen. Die Komponenten rendern
 * nur diese Daten.
 * Kein React in dieser Datei: Icons stehen als String-Schlüssel (IconKey)
 * drin und werden in den Komponenten über eine typsichere Map aufgelöst.
 *
 * Fachliche Grundlage: Regelwerk der International Padel Federation (FIP),
 * "Rules of Padel", gültig seit 01.01.2026. Keine erfundenen Zahlen.
 */

/* ===================== Typen ===================== */

/** Name eines Farbverlaufs aus globals.css (Klassen .fallback-…) */
export type FallbackGradient = "terra" | "sea" | "olive" | "sun" | "dusk";

export interface PadelImage {
  src: string;
  alt: string;
  fallback: FallbackGradient;
}

/** Alle Icon-Schlüssel, die in den Daten vorkommen dürfen */
export type IconKey =
  | "users"
  | "ruler"
  | "layers"
  | "zap"
  | "racket"
  | "ball"
  | "shoe"
  | "arrowDown"
  | "footprints"
  | "hand"
  | "move"
  | "shield"
  | "rotate";

export interface Chapter {
  id: string;
  label: string;
}

export interface FactCard {
  icon: IconKey;
  title: string;
  text: string;
}

export interface TimelineEntry {
  year: string;
  title: string;
  text: string;
}

export interface InfoCard {
  title: string;
  text: string;
}

export interface EquipmentItem {
  icon: IconKey;
  title: string;
  points: string[];
}

export interface ServeStep {
  icon: IconKey;
  text: string;
}

export interface RuleItem {
  text: string;
}

export interface RuleCategory {
  id: "erlaubt" | "fehler";
  label: string;
  kind: "ok" | "fault";
  items: RuleItem[];
}

export interface FaqItem {
  question: string;
  answer: string;
}

export interface DeuceVariant {
  title: string;
  text: string;
}

/* ===================== Kapitel (eine Quelle der Wahrheit für Anker-IDs) ===================== */

export const chapters: Chapter[] = [
  { id: "was-ist-padel", label: "Was ist Padel" },
  { id: "geschichte", label: "Geschichte" },
  { id: "court", label: "Court" },
  { id: "ausruestung", label: "Ausrüstung" },
  { id: "aufschlag", label: "Aufschlag" },
  { id: "spielablauf", label: "Spielablauf" },
  { id: "zaehlweise", label: "Zählweise" },
  { id: "regeln", label: "Regeln" },
  { id: "faq", label: "FAQ" },
];

/** Hilfsfunktion: Eyebrow-Text "Kapitel 03 · Court" aus der Kapitelliste */
export function eyebrowFor(id: string): string {
  const index = chapters.findIndex((c) => c.id === id);
  const label = chapters[index]?.label ?? "";
  return `Kapitel ${String(index + 1).padStart(2, "0")} · ${label}`;
}

/* ===================== Bilder ===================== */

export const images = {
  hero: { src: "/images/padel/hero.jpg", alt: "Padelspieler springt am Netz in die Sonne, um einen Ball zu schmettern", fallback: "dusk" },
  doubles: { src: "/images/padel/doubles.jpg", alt: "Vier Spielerinnen und Spieler im Doppel auf einem Padel-Court mit Glaswänden", fallback: "terra" },
  history: { src: "/images/padel/history.jpg", alt: "Stimmungsvoller Padel-Court im warmen Abendlicht", fallback: "sun" },
  court: { src: "/images/padel/court-overview.jpg", alt: "Padel-Court von schräg oben mit Glaswänden und Metallgitter", fallback: "sea" },
  equipment: { src: "/images/padel/racket-ball.jpg", alt: "Padelschläger mit gelochter Schlagfläche neben zwei Bällen", fallback: "olive" },
  serve: { src: "/images/padel/serve.jpg", alt: "Spieler schlägt den Ball beim Aufschlag von unten auf Hüfthöhe", fallback: "terra" },
  wallPlay: { src: "/images/padel/wall-play.jpg", alt: "Spielerin nimmt den Ball nach dem Abprall von der Glaswand an", fallback: "sea" },
  community: { src: "/images/padel/community.jpg", alt: "Lachende Gruppe nach dem Padel-Match am Court", fallback: "dusk" },
} satisfies Record<string, PadelImage>;

export const heroVideo = "/videos/padel-hero.mp4";

/* ===================== Hero ===================== */

export const hero = {
  headline: "Padel. Einfach zu lernen. Unmöglich, wieder aufzuhören.",
  subline:
    "Schnelle Ballwechsel, Wände, die mitspielen, und ganz viel Teamgeist. Hier erfährst du in wenigen Minuten alles, was du für dein erstes Match brauchst.",
  primary: "Jetzt verstehen",
  secondary: "Court buchen",
};

/* ===================== Was ist Padel ===================== */

export const whatIsPadel = {
  title: "Tennis trifft Squash – nur geselliger.",
  lead:
    "Padel ist ein Rückschlagsport, der Elemente aus Tennis und Squash verbindet. Gespielt wird fast immer im Doppel auf einem kleineren Court, der rundum von Wänden umschlossen ist. Das Besondere: Die Wände gehören zum Spiel.",
  facts: [
    { icon: "users", title: "2 gegen 2", text: "Padel wird fast immer im Doppel gespielt – Teamwork statt Einzelkampf." },
    { icon: "ruler", title: "20 × 10 m Court", text: "Kleiner als ein Tennisplatz, dadurch kurze Wege und viele Ballwechsel." },
    { icon: "layers", title: "Wände spielen mit", text: "Der Ball darf nach dem Aufspringen von Glas und Gitter abprallen." },
    { icon: "zap", title: "Schnell zu lernen", text: "Kurzer Schläger, Aufschlag von unten – schon in der ersten Stunde gibt es echte Ballwechsel." },
  ] satisfies FactCard[],
};

/* ===================== Geschichte ===================== */

export const history = {
  title: "Von Acapulco in die ganze Welt.",
  lead: "Padel ist ein junger Sport – und wächst seit Jahrzehnten rasant.",
  entries: [
    { year: "1969", title: "Die Geburt in Acapulco", text: "Enrique Corcuera baut in Acapulco (Mexiko) den ersten Court – mit Wänden rund um das Spielfeld." },
    { year: "1970er", title: "Ankunft in Marbella", text: "Alfonso de Hohenlohe bringt Padel nach Spanien und eröffnet in Marbella Courts." },
    { year: "Danach", title: "Boom in Argentinien und Spanien", text: "In beiden Ländern wird Padel zum Breitensport – mit vielen Courts und Spielerinnen und Spielern." },
    { year: "1991", title: "Gründung der FIP", text: "Die International Padel Federation wird gegründet und kümmert sich um das offizielle Regelwerk." },
    { year: "Heute", title: "Weltweit im Aufwind", text: "Padel wächst international – auch in Deutschland entstehen immer mehr Courts." },
  ] satisfies TimelineEntry[],
};

/* ===================== Court ===================== */

export const court = {
  title: "20 Meter Spielfeld. Vier Wände voller Möglichkeiten.",
  lead:
    "Der Court ist 20 m lang und 10 m breit. Ein Netz teilt ihn in zwei gleich große Hälften – in der Mitte 88 cm hoch, an den Seiten 92 cm. Rundum begrenzen Glaswände und Metallgitter das Spielfeld.",
  detail:
    "Auf jeder Seite liegt die Aufschlaglinie 6,95 m vom Netz entfernt. Zusammen mit der Mittellinie entstehen so vier Aufschlagfelder.",
  indoorOutdoor: [
    { title: "Indoor", text: "Wetterunabhängig und ganzjährig spielbar – perfekt für feste Trainingszeiten." },
    { title: "Outdoor", text: "Sonne, frische Luft und Sommerfeeling – Padel, wie es in Spanien gespielt wird." },
  ] satisfies InfoCard[],
  padelVisionNote: "Bei PadelVision hast du die Wahl: 2 Indoor-Courts und 1 Outdoor-Court.",
};

/** Bereiche der interaktiven Court-Grafik */
export type CourtAreaId = "aufschlagfeld" | "aufschlaglinie" | "mittellinie" | "netz" | "glaswand" | "gitter";

export interface CourtArea {
  id: CourtAreaId;
  label: string;
  text: string;
  factValue: string;
  factLabel: string;
}

export const courtAreas: CourtArea[] = [
  { id: "aufschlagfeld", label: "Aufschlagfeld", text: "Der Aufschlag muss diagonal im gegenüberliegenden Feld landen. So startet jeder Punkt mit einem klaren Ziel.", factValue: "4 Felder", factLabel: "zwei Aufschlagfelder auf jeder Court-Seite" },
  { id: "aufschlaglinie", label: "Aufschlaglinie", text: "Beim Aufschlag stehst du hinter dieser Linie. Sie markiert die Grenze, von der aus du diagonal ins Feld servierst.", factValue: "6,95 m", factLabel: "Abstand der Linie zum Netz" },
  { id: "mittellinie", label: "Mittellinie", text: "Sie teilt den Bereich zwischen Netz und Aufschlaglinie in zwei gleich große Aufschlagfelder und ragt etwas über die Aufschlaglinie hinaus.", factValue: "2 Felder", factLabel: "pro Court-Seite" },
  { id: "netz", label: "Netz", text: "Das Netz teilt den Court in zwei Hälften. Es ist in der Mitte niedriger als an den Seiten – wie beim Tennis.", factValue: "88 / 92 cm", factLabel: "Netzhöhe in der Mitte / an den Seiten" },
  { id: "glaswand", label: "Glaswand", text: "Die Rückwände und Teile der Seitenwände bestehen aus Glas. Springt der Ball zuerst auf dem Boden auf, darf er von der Wand zurück ins Spiel kommen.", factValue: "Weiter im Spiel", factLabel: "nach Boden- und anschließendem Wandkontakt" },
  { id: "gitter", label: "Gitter", text: "Das Gitter ergänzt die Glasflächen an den Seiten. Im Ballwechsel darf der Ball nach dem Boden davon abprallen – beim Aufschlag wäre ein Gitterkontakt ein Fehler.", factValue: "Boden zuerst", factLabel: "danach darf der Ball das Gitter berühren" },
];

/* ===================== Ausrüstung ===================== */

export const equipment = {
  title: "Mehr brauchst du nicht.",
  lead: "Schläger, Ball, gute Schuhe – fertig. Kein teures Equipment nötig, um loszulegen.",
  items: [
    { icon: "racket", title: "Schläger", points: ["Ohne Saiten", "Gelochte (perforierte) Schlagfläche", "Kern aus Schaumstoff", "Handschlaufe – laut FIP Pflicht, damit dir der Schläger nicht aus der Hand fliegt"] },
    { icon: "ball", title: "Ball", points: ["Sieht aus wie ein Tennisball", "Hat aber etwas weniger Innendruck", "Dadurch etwas langsamer und gut kontrollierbar"] },
    { icon: "shoe", title: "Schuhe & Kleidung", points: ["Sportschuhe mit gutem Grip und seitlichem Halt", "Keine Schuhe mit stark abfärbender Sohle", "Bequeme Sportkleidung"] },
  ] satisfies EquipmentItem[],
  rentalNote: "Kein eigener Schläger? Kein Problem: Bei PadelVision kannst du Schläger und Bälle ausleihen.",
};

/* ===================== Aufschlag ===================== */

export const serve = {
  title: "Der Aufschlag – von unten, diagonal, entspannt.",
  lead: "Anders als im Tennis gibt es beim Padel keinen harten Überkopf-Aufschlag. Das macht den Einstieg leicht.",
  steps: [
    { icon: "arrowDown", text: "Der Aufschlag erfolgt von unten." },
    { icon: "footprints", text: "Stell dich hinter die Aufschlaglinie und lass den Ball dort einmal auf den Boden tippen." },
    { icon: "hand", text: "Triff den Ball auf oder unterhalb der Hüfthöhe." },
    { icon: "move", text: "Spiele diagonal ins gegenüberliegende Aufschlagfeld." },
    { icon: "shield", text: "Nach dem Aufspringen darf der Ball die Glaswand berühren – trifft er dagegen das Gitter, ist es ein Fehler." },
    { icon: "rotate", text: "Du hast zwei Versuche. Berührt der Ball das Netz und landet trotzdem korrekt im Feld, wird der Aufschlag wiederholt." },
  ] satisfies ServeStep[],
};

/* ===================== Spielablauf ===================== */

export const gameplay = {
  title: "Die Wand ist dein Freund.",
  lead: "Genau das macht Padel so besonders: Ballwechsel gehen weiter, wo sie beim Tennis längst vorbei wären.",
  points: [
    "Der Ball darf auf deiner Seite höchstens einmal den Boden berühren – danach darf er von Wänden und Gitter abprallen, bevor du ihn zurückspielst.",
    "Volleys, also Schläge ohne Bodenkontakt, sind erlaubt.",
    "Dein Schlag muss zuerst auf dem Boden der gegnerischen Hälfte landen. Fliegt er direkt gegen Wand oder Gitter des Gegners, ist das ein Fehler.",
    "Du darfst den Ball auch gegen deine eigene Wand spielen, damit er auf die andere Seite gelangt.",
  ],
  steps: ["Ball springt auf", "Prallt von der Glaswand ab", "Wird zurückgespielt"],
};

/* ===================== Zählweise ===================== */

export const scoring = {
  title: "Zählen wie im Tennis – mit einem Twist.",
  lead:
    "Punkte zählen 15, 30, 40, Spiel. Ein Satz geht bis 6 Spiele mit 2 Spielen Vorsprung, bei 6:6 entscheidet ein Tiebreak. Ein Match wird meist auf 2 Gewinnsätze gespielt.",
  deuceIntro: "Was passiert bei 40:40? Dafür gibt es drei Varianten – welche gilt, wird vor dem Match festgelegt.",
  variants: [
    { title: "Vorteil", text: "Klassisch: Ein Team muss zwei Punkte in Folge gewinnen." },
    { title: "Golden Point", text: "Ein einziger Punkt entscheidet das Spiel – volle Spannung." },
    { title: "Star Point", text: "Seit 2026 im FIP-Regelwerk: bis zu zwei Vorteil-Durchgänge. Kommt es zum dritten Einstand, entscheidet ein einziger Punkt." },
  ] satisfies DeuceVariant[],
  casualNote: "Im Freizeitspiel gilt, was ihr vorher gemeinsam vereinbart.",
};

/* ===================== Regeln ===================== */

export const rules = {
  title: "Die wichtigsten Regeln auf einen Blick.",
  lead: "Mehr musst du für den Anfang nicht wissen.",
  categories: [
    {
      id: "erlaubt",
      label: "Erlaubt",
      kind: "ok",
      items: [
        { text: "Volley – den Ball direkt aus der Luft spielen" },
        { text: "Den Ball nach dem Aufspringen von den eigenen Wänden zurückkommen lassen" },
        { text: "Den Ball gegen die eigene Wand spielen, damit er auf die andere Seite fliegt" },
      ],
    },
    {
      id: "fehler",
      label: "Fehler",
      kind: "fault",
      items: [
        { text: "Der Ball berührt auf deiner Seite zweimal den Boden" },
        { text: "Dein Schlag trifft direkt die gegnerische Wand oder das Gitter" },
        { text: "Der Ball berührt einen Spieler" },
        { text: "Du berührst das Netz mit Körper oder Schläger" },
        { text: "Der Ball wird zweimal hintereinander geschlagen" },
        { text: "Verlierst du während des Ballwechsels den Schläger aus der Hand, kann dich das nach aktuellem FIP-Regelwerk den Punkt kosten" },
      ],
    },
  ] satisfies RuleCategory[],
  proTip: "Lass den Ball von der Rückwand kommen, statt panisch vorher zu schlagen – die Wand verschafft dir Zeit.",
};

/* ===================== FAQ ===================== */

export const faq = {
  title: "Fragen vor dem ersten Match?",
  items: [
    { question: "Brauche ich Vorerfahrung im Tennis?", answer: "Nein. Tennis- oder Squash-Erfahrung hilft ein wenig, ist aber keine Voraussetzung. Durch den kurzen Schläger und den Aufschlag von unten kommst du auch als kompletter Neuling schnell ins Spiel." },
    { question: "Kann ich alleine kommen?", answer: "Padel wird meist zu viert gespielt. Wenn du noch keine Mitspieler hast, sind Kurse ein guter Einstieg – dort lernst du andere Einsteiger kennen. Sprich uns gern an." },
    { question: "Was muss ich mitbringen?", answer: "Bequeme Sportkleidung und Sportschuhe mit gutem Grip, die nicht abfärben. Schläger und Bälle kannst du bei uns ausleihen." },
    { question: "Ab welchem Alter kann man spielen?", answer: "Padel eignet sich für Jugendliche und Erwachsene jeden Alters. Wichtig ist vor allem Spaß an Bewegung – bei Fragen zu Kursen für jüngere Spieler kontaktiere uns gern." },
    { question: "Ist Padel anstrengend?", answer: "So anstrengend, wie du es machst. Weil der Court kleiner ist, sind die Wege kurz. Gleichzeitig sorgen lange Ballwechsel für ein richtig gutes Workout." },
    { question: "Indoor oder Outdoor – was ist besser für den Anfang?", answer: "Beides funktioniert. Indoor bist du unabhängig vom Wetter, outdoor genießt du Sonne und frische Luft. Bei PadelVision kannst du beides ausprobieren." },
    { question: "Kann ich mir Schläger ausleihen?", answer: "Ja. Bei PadelVision kannst du Schläger und Bälle ausleihen – ideal, um erst einmal reinzuschnuppern." },
  ] satisfies FaqItem[],
};

/* ===================== Abschluss ===================== */

export const finalCta = {
  title: "Bereit für dein erstes Match?",
  text: "Schnapp dir drei Freunde, buch einen Court und erleb selbst, warum so viele nicht mehr aufhören wollen.",
  primary: "Court buchen",
  secondary: "Kurs finden",
};