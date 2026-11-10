/**
 * courtsContent.ts – ALLE Texte und Daten der Seite "Courts" (/courts)
 *
 * Inhalt und Darstellung sind getrennt: Texte und Standortdaten änderst du
 * hier, die Komponenten rendern sie nur. Kein React in dieser Datei – Icons
 * stehen als Text-Schlüssel (AmenityIcon) drin und werden in icons.ts
 * typsicher in lucide-Icons übersetzt.
 *
 * WICHTIG: Alle Standorte sind FIKTIV (Uni-Projekt). Adressen, Events und
 * Platzzahlen sind erfundene Beispieldaten. Echt sind nur die Koordinaten
 * der Orte – sie bestimmen die Position auf der Karte.
 */
import type { PadelImage } from "@/components/padel/padelContent";

/* ===================== Typen ===================== */

export type EventType = "turnier" | "kurs" | "community" | "camp";
export type Level = "einsteiger" | "fortgeschritten" | "alle";

/** Farbton eines Standorts (Punkt im Zeitstrahl, Chips) – wird in Komponenten auf Klassen gemappt */
export type LocationTone = "accent" | "accent-2" | "olive" | "glass" | "mesh";

export type AmenityIcon =
  | "rental"
  | "ball"
  | "shower"
  | "bistro"
  | "food"
  | "terrace"
  | "lounge"
  | "shop"
  | "academy"
  | "physio"
  | "yoga"
  | "sunset"
  | "kids"
  | "parking";

export interface Amenity {
  icon: AmenityIcon;
  label: string;
}

export interface CourtSplit {
  indoor: number;
  outdoor: number;
  /** Panorama-Courts (Glaswände rundum) – zählen bereits zu indoor/outdoor */
  panorama: number;
}

export interface CourtEvent {
  id: string;
  title: string;
  /** ISO-Datum "JJJJ-MM-TT" – sortierbar; Anzeige über formatDate() */
  date: string;
  type: EventType;
  level: Level;
  spotsLeft: number;
  description: string;
}

export interface Location {
  slug: string;
  name: string;
  nickname: string;
  city: string;
  country: string;
  flag: string;
  region: string;
  /** Echte Koordinaten – Grundlage für project() in geo.ts */
  coords: { lat: number; lon: number };
  /**
   * Versatz des Pins in SVG-Einheiten, falls zwei Orte zu nah beieinander
   * liegen. Eine Führungslinie verbindet dann echten Ort und Pin.
   */
  pinOffset?: { dx: number; dy: number };
  isHeadquarters: boolean;
  badge: string;
  courts: CourtSplit;
  mood: string;
  amenities: Amenity[];
  hours: string;
  address: string;
  image: PadelImage;
  tone: LocationTone;
  events: CourtEvent[];
}

export interface FaqItem {
  question: string;
  answer: string;
}

/* ===================== Beschriftungen ===================== */

export const eventTypeLabels: Record<EventType, string> = {
  turnier: "Turnier",
  kurs: "Kurs",
  community: "Community",
  camp: "Camp",
};

export const levelLabels: Record<Level, string> = {
  einsteiger: "Einsteiger",
  fortgeschritten: "Fortgeschritten",
  alle: "Alle Level",
};

/* ===================== Standorte ===================== */

export const locations: Location[] = [
  {
    slug: "konstanz",
    name: "PadelVision Konstanz",
    nickname: "Seeufer",
    city: "Konstanz",
    country: "Deutschland",
    flag: "🇩🇪",
    region: "Bodensee",
    coords: { lat: 47.66, lon: 9.18 },
    isHeadquarters: true,
    badge: "Stammhaus",
    courts: { indoor: 2, outdoor: 1, panorama: 0 },
    mood: "Hier hat alles angefangen: Seeblick, bei klarer Sicht Alpenpanorama und dank Halle das ganze Jahr über spielbar.",
    amenities: [
      { icon: "rental", label: "Schlägerverleih" },
      { icon: "ball", label: "Ballverleih" },
      { icon: "shower", label: "Umkleiden mit Duschen" },
      { icon: "terrace", label: "Bistro mit Seeterrasse" },
      { icon: "shop", label: "Pro-Shop" },
      { icon: "academy", label: "Kurse für Einsteiger" },
    ],
    hours: "Mo–So 7–23 Uhr",
    address: "Seestraße 1 (Platzhalter), 78462 Konstanz",
    image: { src: "/images/courts/konstanz.jpg", alt: "Padel-Halle mit großen Fenstern und Blick auf den Bodensee", fallback: "sea" },
    tone: "accent-2",
    events: [
      { id: "kn-1", title: "Bodensee Winter Cup", date: "2026-12-12", type: "turnier", level: "fortgeschritten", spotsLeft: 6, description: "Doppel-Turnier in der Halle – danach Glühwein auf der Seeterrasse." },
      { id: "kn-2", title: "Einsteigerkurs am Wochenende", date: "2027-01-16", type: "kurs", level: "einsteiger", spotsLeft: 3, description: "Zwei Tage, alle Grundlagen: Griff, Aufschlag, Spiel mit der Wand." },
      { id: "kn-3", title: "Seeufer Community Night", date: "2027-03-05", type: "community", level: "alle", spotsLeft: 12, description: "Wechselnde Doppel, Musik und neue Mitspieler kennenlernen." },
    ],
  },
  {
    slug: "marbella",
    name: "PadelVision Marbella",
    nickname: "Costa del Sol",
    city: "Marbella",
    country: "Spanien",
    flag: "🇪🇸",
    region: "Andalusien",
    coords: { lat: 36.51, lon: -4.88 },
    isHeadquarters: false,
    badge: "Wiege des Padels",
    courts: { indoor: 2, outdoor: 4, panorama: 1 },
    mood: "In den 1970ern brachte Alfonso de Hohenlohe Padel nach Marbella. Heute spielst du hier zwischen Palmen – und abends unter Flutlicht.",
    amenities: [
      { icon: "rental", label: "Schläger- und Ballverleih" },
      { icon: "shop", label: "Pro-Shop" },
      { icon: "lounge", label: "Beach-Lounge" },
      { icon: "physio", label: "Physio-Bereich" },
      { icon: "academy", label: "Trainer-Academy" },
    ],
    hours: "Mo–So 8–24 Uhr",
    address: "Avenida del Mar 1 (Platzhalter), Marbella",
    image: { src: "/images/courts/marbella.jpg", alt: "Outdoor-Padel-Courts zwischen Palmen im warmen Abendlicht", fallback: "sun" },
    tone: "accent",
    events: [
      { id: "mb-1", title: "Costa del Sol Open", date: "2027-02-20", type: "turnier", level: "fortgeschritten", spotsLeft: 4, description: "Unser größtes Turnier im Winter – Finale auf dem Panorama-Court." },
      { id: "mb-2", title: "Academy Intensiv-Camp", date: "2027-03-22", type: "camp", level: "fortgeschritten", spotsLeft: 8, description: "Fünf Tage Training mit dem Academy-Team: Technik, Taktik, Matchpraxis." },
      { id: "mb-3", title: "Flutlicht Social Mix", date: "2027-04-10", type: "community", level: "alle", spotsLeft: 16, description: "Abendmatches mit zugelosten Partnern – danach Tapas in der Lounge." },
    ],
  },
  {
    slug: "porto-vecchio",
    name: "PadelVision Porto-Vecchio",
    nickname: "Corsica",
    city: "Porto-Vecchio",
    country: "Frankreich",
    flag: "🇫🇷",
    region: "Korsika · Corse-du-Sud",
    coords: { lat: 41.59, lon: 9.28 },
    isHeadquarters: false,
    badge: "Insel-Feeling",
    courts: { indoor: 0, outdoor: 3, panorama: 0 },
    mood: "Courts im Pinienwald, türkises Wasser in Sichtweite und eine entspannte Insel-Atmosphäre. Geöffnet in der Saison.",
    amenities: [
      { icon: "rental", label: "Schläger- und Ballverleih" },
      { icon: "bistro", label: "Smoothie-Bar" },
      { icon: "terrace", label: "Schattenterrasse" },
      { icon: "yoga", label: "Yoga-Deck" },
    ],
    hours: "April–Oktober täglich 8–22 Uhr (Saisonbetrieb)",
    address: "Route de la Plage 1 (Platzhalter), Porto-Vecchio",
    image: { src: "/images/courts/porto-vecchio.jpg", alt: "Padel-Court zwischen Pinien mit Blick aufs türkise Meer", fallback: "olive" },
    tone: "olive",
    events: [
      { id: "pv-1", title: "Corsica Padel Camp", date: "2027-04-26", type: "camp", level: "alle", spotsLeft: 10, description: "Eine Woche Padel, Yoga am Morgen und Strand am Nachmittag." },
      { id: "pv-2", title: "Pinienwald Doubles", date: "2027-05-22", type: "turnier", level: "alle", spotsLeft: 2, description: "Lockeres Doppel-Turnier im Schatten der Pinien." },
      { id: "pv-3", title: "Sunrise Einsteigerkurs", date: "2027-06-12", type: "kurs", level: "einsteiger", spotsLeft: 6, description: "Grundlagenkurs am frühen Morgen, bevor es heiß wird." },
    ],
  },
  {
    slug: "santorini",
    name: "PadelVision Santorini",
    nickname: "Caldera",
    city: "Santorini",
    country: "Griechenland",
    flag: "🇬🇷",
    region: "Kykladen",
    coords: { lat: 36.42, lon: 25.43 },
    pinOffset: { dx: 34, dy: -62 },
    isHeadquarters: false,
    badge: "Sunset Courts",
    courts: { indoor: 1, outdoor: 2, panorama: 1 },
    mood: "Weiß-blaue Architektur rundherum und Sunset-Matches mit Blick auf die Caldera.",
    amenities: [
      { icon: "rental", label: "Schläger- und Ballverleih" },
      { icon: "sunset", label: "Rooftop-Bar" },
      { icon: "shower", label: "Umkleiden" },
      { icon: "lounge", label: "Sunset-Sessions" },
    ],
    hours: "Mo–So 9–23 Uhr",
    address: "Caldera Path 1 (Platzhalter), Santorini",
    image: { src: "/images/courts/santorini.jpg", alt: "Padel-Court zwischen weißen Häusern im Sonnenuntergang", fallback: "dusk" },
    tone: "glass",
    events: [
      { id: "st-1", title: "Sunset Mixed Doubles", date: "2027-05-15", type: "turnier", level: "alle", spotsLeft: 7, description: "Mixed-Turnier, das genau zum Sonnenuntergang ins Finale geht." },
      { id: "st-2", title: "Caldera Sunset Session", date: "2027-06-26", type: "community", level: "alle", spotsLeft: 14, description: "Freies Spiel bis die Sonne weg ist – danach Rooftop-Bar." },
    ],
  },
  {
    slug: "chania",
    name: "PadelVision Chania",
    nickname: "Kreta",
    city: "Chania",
    country: "Griechenland",
    flag: "🇬🇷",
    region: "Kreta",
    coords: { lat: 35.51, lon: 24.02 },
    pinOffset: { dx: -46, dy: 18 },
    isHeadquarters: false,
    badge: "Familien-Liebling",
    courts: { indoor: 2, outdoor: 3, panorama: 0 },
    mood: "Venezianischer Hafen, Olivenhaine und eine familiäre Atmosphäre – hier spielen Groß und Klein.",
    amenities: [
      { icon: "rental", label: "Schläger- und Ballverleih" },
      { icon: "food", label: "Taverna" },
      { icon: "kids", label: "Kinder-Kurse" },
      { icon: "parking", label: "Parkplatz" },
    ],
    hours: "Mo–So 8–23 Uhr",
    address: "Odos Limaniou 1 (Platzhalter), Chania",
    image: { src: "/images/courts/chania.jpg", alt: "Padel-Court mit Blick auf Olivenhaine und den alten Hafen", fallback: "terra" },
    tone: "mesh",
    events: [
      { id: "ch-1", title: "Kreta Family Day", date: "2027-03-21", type: "community", level: "alle", spotsLeft: 20, description: "Ein Tag für die ganze Familie: Mini-Matches, Taverna und Spiele." },
      { id: "ch-2", title: "Kinder-Schnupperkurs", date: "2027-04-17", type: "kurs", level: "einsteiger", spotsLeft: 4, description: "Spielerischer Einstieg für Kinder und Jugendliche." },
      { id: "ch-3", title: "Hafen Cup Chania", date: "2027-06-05", type: "turnier", level: "fortgeschritten", spotsLeft: 9, description: "Doppel-Turnier mit Siegerehrung am venezianischen Hafen." },
    ],
  },
];

/** Standardauswahl, solange noch nichts angeklickt wurde: das Stammhaus */
export const DEFAULT_SLUG = "konstanz";

/**
 * Name des Browser-Ereignisses, mit dem die Standortkarten im Raster
 * ("Auf der Karte zeigen") dem CourtsExplorer eine Auswahl melden.
 * Grund: Raster (Server) und Explorer (Client) teilen keinen React-State.
 */
export const SELECT_LOCATION_EVENT = "padelvision:select-location";

/* ===================== Bilder ===================== */

export const pageImages = {
  hero: { src: "/images/courts/courts-hero.jpg", alt: "Panorama-Padel-Court am Meer im Abendlicht", fallback: "dusk" },
  indoor: { src: "/images/courts/indoor.jpg", alt: "Heller Indoor-Padel-Court in einer modernen Halle", fallback: "sea" },
  outdoor: { src: "/images/courts/outdoor.jpg", alt: "Outdoor-Padel-Court in der Sonne mit Meer im Hintergrund", fallback: "sun" },
  cta: { src: "/images/courts/courts-cta.jpg", alt: "Gruppe stößt nach dem Padel-Match lachend an", fallback: "dusk" },
} satisfies Record<string, PadelImage>;

/* ===================== Texte der Abschnitte ===================== */

export const hero = {
  eyebrow: "Unsere Standorte",
  headline: "Fünf Orte. Ein Gefühl. Dein Court.",
  lead: "PadelVision spielt vom Bodensee bis ans Mittelmeer. Such dir deinen Lieblingsort aus – oder spiel sie alle.",
  primary: "Karte entdecken",
  secondary: "Court buchen",
};

export const statsLabels = {
  locations: "Standorte",
  countries: "Länder",
  courts: "Courts",
  events: "kommende Events",
};

export const mapSection = {
  eyebrow: "Die Karte",
  title: "Wo willst du spielen?",
  lead: "Fahr über einen Standort für eine Vorschau oder klick ihn an – rechts siehst du alle Details.",
  legendHq: "Stammhaus",
  legendLocation: "Standort",
  legendArc: "Verbindung zum Stammhaus",
  disclaimer: "Stilisierte Karte – nicht maßstabsgetreu.",
};

export const gridSection = {
  eyebrow: "Alle Standorte",
  title: "Fünf Courts-Welten im Überblick.",
  lead: "Jeder Standort hat seinen eigenen Charakter. Gemeinsam ist allen: gute Courts und gute Leute.",
};

export const eventsSection = {
  eyebrow: "Events",
  title: "Was als Nächstes ansteht",
  lead: "Turniere, Kurse, Camps und Community-Abende an allen Standorten – chronologisch sortiert.",
};

export const indoorOutdoorSection = {
  eyebrow: "Indoor & Outdoor",
  title: "Zwei Welten. Ein Gefühl.",
  indoorTitle: "Indoor – Spielen bei jedem Wetter",
  indoorText: "Halle statt Regenpause: Unsere Indoor-Courts sind unabhängig vom Wetter.",
  outdoorTitle: "Outdoor – Sonne, Wind und Meer",
  outdoorText: "Padel unter freiem Himmel – so, wie es am Mittelmeer gespielt wird.",
};

export const faqSection = {
  eyebrow: "FAQ",
  title: "Fragen zu unseren Standorten",
  items: [
    { question: "Kann ich an jedem Standort Schläger leihen?", answer: "Ja. An allen fünf Standorten kannst du Schläger und Bälle ausleihen – du musst also nichts mitbringen außer Sportkleidung und passenden Schuhen." },
    { question: "Sind die Outdoor-Courts im Winter geöffnet?", answer: "Konstanz, Marbella, Santorini und Chania haben laut Öffnungszeiten täglich geöffnet. Porto-Vecchio ist ein Saisonbetrieb und nur von April bis Oktober offen. Wenn du wetterunabhängig spielen willst, sind die Indoor-Courts in Konstanz, Marbella, Santorini und Chania die sichere Wahl." },
    { question: "Kann ich ein Event an einem anderen Standort besuchen?", answer: "Klar. Alle Events stehen dir offen – egal, an welchem Standort du sonst spielst. Achte nur auf das angegebene Level und die freien Plätze." },
    { question: "Wie buche ich einen Court?", answer: "Wähle deinen Standort und klicke auf „Court buchen“. Du landest auf der Buchungsseite, der gewählte Standort wird dabei direkt mitgegeben." },
  ] satisfies FaqItem[],
};

export const ctaSection = {
  title: "Wo spielst du dein nächstes Match?",
  text: "Ob Seeblick, Palmen oder Caldera – dein Court wartet schon.",
  primary: "Court buchen",
  secondary: "Events ansehen",
};