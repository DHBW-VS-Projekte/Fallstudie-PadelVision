/**
 * scoring.ts – reine Zähl-Logik für EIN Spiel (Game) im Padel
 *
 * Kein React, keine Browser-APIs: nur Funktionen, die einen Zustand
 * bekommen und einen NEUEN Zustand zurückgeben (unveränderlich/immutable).
 * Vorteil: leicht verständlich und später einfach mit Unit-Tests prüfbar.
 * Verwendet von: ScoreCounter.tsx (Client Component).
 *
 * Interne Zählung: pointsA/pointsB zählen gewonnene Punkte (0, 1, 2, 3, 4 …).
 * Anzeige: 0 → "0", 1 → "15", 2 → "30", 3 → "40".
 */

/** Einstand-Variante bei 40:40 */
export type DeuceMode = "advantage" | "golden" | "star";
export type Team = "A" | "B";

export interface GameState {
  pointsA: number;
  pointsB: number;
  /** Wie oft war es bisher Einstand (40:40 bzw. Gleichstand ab 3:3)? */
  deuceCount: number;
  /** Gewinner des Spiels oder null, solange es läuft */
  winner: Team | null;
  /** Verlauf: welches Team hat welchen Punkt gemacht (für die Anzeige) */
  history: Team[];
}

/** Was die Oberfläche anzeigen soll */
export interface ScoreDisplay {
  /** Anzeigewert Team A, z. B. "40" oder "AD" */
  scoreA: string;
  scoreB: string;
  /** Großer Status, z. B. "Einstand", "Vorteil Team A", "Golden Point" */
  status: string;
  /** Erklärender Satz zum aktuellen Zustand */
  hint: string;
  /** Nur beim Star Point: der wievielte Einstand läuft gerade (sonst null) */
  deuceNumber: number | null;
}

const TENNIS_POINTS = ["0", "15", "30", "40"] as const;

/** Startzustand: 0:0, kein Einstand, kein Gewinner */
export function createInitialState(): GameState {
  return { pointsA: 0, pointsB: 0, deuceCount: 0, winner: null, history: [] };
}

/** Ab wie vielen Einständen beim Star Point der entscheidende Punkt gilt */
const STAR_POINT_DEUCE = 3;

/**
 * Ist der NÄCHSTE Punkt im gegebenen Zustand spielentscheidend?
 * Das ist der Fall, wenn Einstand herrscht UND
 *  - Golden Point: sofort beim ersten 40:40
 *  - Star Point: erst beim dritten Einstand
 *  - Vorteil: nie (man braucht immer zwei Punkte in Folge)
 */
export function isDecidingPoint(state: GameState, mode: DeuceMode): boolean {
  const isDeuce = state.pointsA >= 3 && state.pointsA === state.pointsB;
  if (!isDeuce || state.winner) return false;
  if (mode === "golden") return true;
  if (mode === "star") return state.deuceCount >= STAR_POINT_DEUCE;
  return false;
}

/**
 * Vergibt einen Punkt an `team` und gibt den neuen Zustand zurück.
 * @param state aktueller Zustand (wird NICHT verändert)
 * @param team  Team, das den Punkt gewonnen hat
 * @param mode  gewählte Einstand-Variante
 */
export function addPoint(state: GameState, team: Team, mode: DeuceMode): GameState {
  // Schritt 0: Ist das Spiel schon vorbei, ändert sich nichts.
  if (state.winner) return state;

  // Schritt 1: Entscheidender Punkt (Golden Point / Star Point)?
  // Dann gewinnt, wer diesen einen Punkt macht – egal wie es vorher stand.
  if (isDecidingPoint(state, mode)) {
    return {
      ...state,
      pointsA: state.pointsA + (team === "A" ? 1 : 0),
      pointsB: state.pointsB + (team === "B" ? 1 : 0),
      winner: team,
      history: [...state.history, team],
    };
  }

  // Schritt 2: Punkt ganz normal hochzählen.
  const pointsA = state.pointsA + (team === "A" ? 1 : 0);
  const pointsB = state.pointsB + (team === "B" ? 1 : 0);
  const history = [...state.history, team];

  // Schritt 3: Spielgewinn? Mindestens 4 Punkte ("über 40 hinaus") UND
  // 2 Punkte Vorsprung. Beispiele: 4:2 → Spiel. Ab Einstand: 5:3 → Spiel
  // (Vorteil verwandelt). 4:3 ist dagegen nur "Vorteil".
  const leader = Math.max(pointsA, pointsB);
  if (leader >= 4 && Math.abs(pointsA - pointsB) >= 2) {
    return { ...state, pointsA, pointsB, history, winner: pointsA > pointsB ? "A" : "B" };
  }

  // Schritt 4: Neuer Einstand? Gleichstand ab 3:3 (40:40). Das passiert
  // beim ersten 40:40 und jedes Mal, wenn ein Vorteil wieder verloren geht
  // (z. B. 4:3 → 4:4). Wir zählen mit – wichtig für den Star Point.
  const deuceCount = pointsA >= 3 && pointsA === pointsB ? state.deuceCount + 1 : state.deuceCount;

  return { ...state, pointsA, pointsB, history, deuceCount };
}

/**
 * Übersetzt den Zustand in Anzeige-Texte für die Oberfläche.
 */
export function getScoreLabel(state: GameState, mode: DeuceMode): ScoreDisplay {
  const { pointsA, pointsB, winner, deuceCount } = state;
  const starDeuce = mode === "star" && deuceCount > 0 ? Math.min(deuceCount, STAR_POINT_DEUCE) : null;

  // Spiel vorbei
  if (winner) {
    return {
      scoreA: winner === "A" ? "Spiel" : "–",
      scoreB: winner === "B" ? "Spiel" : "–",
      status: `Spiel Team ${winner}`,
      hint: "Glückwunsch! Mit „Zurücksetzen“ startest du ein neues Spiel.",
      deuceNumber: starDeuce,
    };
  }

  // Noch vor dem Einstand-Bereich: normale Tennis-Anzeige
  if (pointsA < 3 || pointsB < 3) {
    return {
      scoreA: TENNIS_POINTS[Math.min(pointsA, 3)],
      scoreB: TENNIS_POINTS[Math.min(pointsB, 3)],
      status: `${TENNIS_POINTS[Math.min(pointsA, 3)]} : ${TENNIS_POINTS[Math.min(pointsB, 3)]}`,
      hint:
        pointsA === 3 || pointsB === 3
          ? "Ein Team steht bei 40 – der nächste Punkt kann das Spiel entscheiden."
          : "Punkte zählen 15, 30, 40, Spiel.",
      deuceNumber: null,
    };
  }

  // Gleichstand ab 40:40 → Einstand bzw. entscheidender Punkt
  if (pointsA === pointsB) {
    if (isDecidingPoint(state, mode)) {
      return {
        scoreA: "40",
        scoreB: "40",
        status: mode === "golden" ? "Golden Point" : "Star Point",
        hint: "Jetzt entscheidet ein einziger Punkt!",
        deuceNumber: starDeuce,
      };
    }
    return {
      scoreA: "40",
      scoreB: "40",
      status: "Einstand",
      hint:
        mode === "star"
          ? `Einstand Nr. ${deuceCount} – noch mit Vorteil. Beim 3. Einstand entscheidet ein Punkt.`
          : "Ein Team braucht jetzt zwei Punkte in Folge.",
      deuceNumber: starDeuce,
    };
  }

  // Ein Punkt Vorsprung nach Einstand → Vorteil
  const leader: Team = pointsA > pointsB ? "A" : "B";
  return {
    scoreA: leader === "A" ? "Vorteil" : "40",
    scoreB: leader === "B" ? "Vorteil" : "40",
    status: `Vorteil Team ${leader}`,
    hint: `Macht Team ${leader} den nächsten Punkt, gewinnt es das Spiel. Sonst: wieder Einstand.`,
    deuceNumber: starDeuce,
  };
}

/* =====================================================================
   BEISPIEL-ABLÄUFE (für spätere Unit-Tests)
   Notation: Punktfolge → erwartete status-Anzeige nach dem letzten Punkt

   Modus "advantage" (Vorteil):
     A                         → "15 : 0"
     A A A                     → "40 : 0"
     A A A A                   → "Spiel Team A"
     A A A B B B               → "Einstand"           (deuceCount 1)
     A A A B B B A             → "Vorteil Team A"
     A A A B B B A B           → "Einstand"           (deuceCount 2)
     A A A B B B A B B B       → "Spiel Team B"

   Modus "golden" (Golden Point):
     A A A B B B               → "Golden Point"
     A A A B B B B             → "Spiel Team B"

   Modus "star" (Star Point):
     A A A B B B               → "Einstand"           (Einstand Nr. 1)
     A A A B B B A             → "Vorteil Team A"
     A A A B B B A B           → "Einstand"           (Einstand Nr. 2)
     A A A B B B A B B         → "Vorteil Team B"
     A A A B B B A B B A       → "Star Point"         (3. Einstand)
     A A A B B B A B B A A     → "Spiel Team A"
     A A A B B B A A           → "Spiel Team A"       (Vorteil verwandelt)
   ===================================================================== */