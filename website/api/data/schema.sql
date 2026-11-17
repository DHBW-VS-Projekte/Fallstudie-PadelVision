-- =====================================================================
-- schema.sql – Tabellen des PadelVision-Buchungssystems
--
-- Kompatibel mit MySQL 5.7 / 8.0 und MariaDB 10.4+ (InnoDB, utf8mb4).
-- Bewusst NICHT verwendet: CHECK-Constraints (MySQL 5.7 ignoriert sie),
-- JSON-Spalten, Window-Functions, CTEs – damit alles bei jedem Hoster läuft.
-- CREATE TABLE IF NOT EXISTS: mehrfaches Ausführen macht nichts kaputt.
-- Alle Zeitpunkte sind DATETIME in UTC (die PHP-Verbindung setzt time_zone '+00:00').
-- VARCHAR(190) bei indizierten Textspalten: 190 × 4 Byte (utf8mb4) = 760 Byte
-- bleibt unter der alten InnoDB-Indexgrenze von 767 Byte (ältere MySQL-Versionen).
-- =====================================================================

CREATE TABLE IF NOT EXISTS locations (
  slug      VARCHAR(40)  NOT NULL,
  name      VARCHAR(120) NOT NULL,
  timezone  VARCHAR(64)  NOT NULL,
  PRIMARY KEY (slug)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS courts (
  id             VARCHAR(40)  NOT NULL,
  location_slug  VARCHAR(40)  NOT NULL,
  name           VARCHAR(120) NOT NULL,
  kind           ENUM('indoor','outdoor') NOT NULL,
  is_panorama    TINYINT(1)   NOT NULL DEFAULT 0,
  PRIMARY KEY (id),
  KEY idx_courts_location (location_slug),
  CONSTRAINT fk_courts_location FOREIGN KEY (location_slug) REFERENCES locations (slug) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- slot_cells: ÖFFENTLICHE Belegung in 30-Minuten-Zellen, OHNE persönliche Daten.
-- Eine 90-Minuten-Buchung belegt genau 3 aufeinanderfolgende Zellen.
--
-- DAS HERZSTÜCK gegen Doppelbuchungen: UNIQUE KEY uq_cell (court_id, cell_start).
-- Dieselbe Zelle kann physisch nur EINMAL existieren. Kommen 30 Anfragen in
-- derselben Millisekunde, lässt InnoDB genau EIN INSERT gewinnen; alle anderen
-- bekommen Fehler 1062 (Duplicate entry) und rollen ihre Transaktion zurück.
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS slot_cells (
  id               BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  court_id         VARCHAR(40)  NOT NULL,
  cell_start       DATETIME     NOT NULL,
  status           ENUM('hold','confirmed') NOT NULL,
  hold_id          CHAR(36)     NOT NULL,
  hold_token_hash  CHAR(64)     NULL,
  device_id        CHAR(32)     NULL,
  expires_at       DATETIME     NULL,
  booking_id       BIGINT UNSIGNED NULL,
  created_at       DATETIME(3)  NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_cell (court_id, cell_start),
  -- Belegung "alle Zellen eines Courts an einem Tag" (Bereich auf cell_start);
  -- enthält zusätzlich status, damit die Abfrage ihn direkt aus dem Index liest.
  KEY idx_cells_lookup (court_id, cell_start, status),
  KEY idx_cells_expires (expires_at),
  KEY idx_cells_hold (hold_id),
  KEY idx_cells_device (device_id),
  KEY idx_cells_booking (booking_id),
  CONSTRAINT fk_cells_court FOREIGN KEY (court_id) REFERENCES courts (id) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- bookings: PRIVATE Daten (Name, E-Mail). Werden NIE von öffentlichen Endpunkten ausgegeben.
CREATE TABLE IF NOT EXISTS bookings (
  id                BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  booking_code      CHAR(9)      NOT NULL,
  court_id          VARCHAR(40)  NOT NULL,
  booking_type      ENUM('court','event') NOT NULL DEFAULT 'court',
  event_id          VARCHAR(40)  NULL,
  event_title       VARCHAR(160) NULL,
  event_type        VARCHAR(40)  NULL,
  starts_at         DATETIME     NOT NULL,
  ends_at           DATETIME     NOT NULL,
  full_name         VARCHAR(80)  NOT NULL,
  email             VARCHAR(190) NOT NULL,
  email_normalized  VARCHAR(190) NOT NULL,
  rackets           TINYINT UNSIGNED NOT NULL DEFAULT 0,
  balls             TINYINT UNSIGNED NOT NULL DEFAULT 0,
  price_cents       INT UNSIGNED NOT NULL,
  status            ENUM('confirmed','cancelled') NOT NULL DEFAULT 'confirmed',
  idempotency_key   CHAR(36)     NOT NULL,
  device_id         CHAR(32)     NULL,
  created_at        DATETIME(3)  NOT NULL,
  cancelled_at      DATETIME     NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_booking_code (booking_code),
  UNIQUE KEY uq_idempotency (idempotency_key),
  -- "offene Buchungen dieser E-Mail zählen" (email_normalized + status + ends_at)
  KEY idx_bookings_email (email_normalized, status, ends_at),
  KEY idx_bookings_court_start (court_id, starts_at),
  -- Admin-Liste "neueste zuerst" und "heute erstellt"
  KEY idx_bookings_created (created_at),
  CONSTRAINT fk_bookings_court FOREIGN KEY (court_id) REFERENCES courts (id) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- email_guards: genau eine Zeile pro E-Mail. Sie wird beim Buchen mit
-- SELECT … FOR UPDATE gesperrt. Zwei gleichzeitige Buchungen derselben E-Mail
-- laufen dadurch NACHEINANDER – die Regel "max. 2 offene Buchungen" kann nicht
-- durch ein Wettrennen umgangen werden.
CREATE TABLE IF NOT EXISTS email_guards (
  email_normalized  VARCHAR(190) NOT NULL,
  created_at        DATETIME     NOT NULL,
  PRIMARY KEY (email_normalized)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- rate_events: einfache Zähltabelle für das Rate Limit (pro Gerät / pro IP-Hash)
CREATE TABLE IF NOT EXISTS rate_events (
  id          BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  bucket      VARCHAR(100) NOT NULL,
  created_at  DATETIME     NOT NULL,
  PRIMARY KEY (id),
  KEY idx_rate_bucket (bucket, created_at),
  KEY idx_rate_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- app_state: EINE Zeile. availability_version steigt bei JEDER Änderung an
-- slot_cells um 1 (in derselben Transaktion). Browser fragen nur diese Zahl ab
-- und laden die Belegung nur neu, wenn sie sich geändert hat.
CREATE TABLE IF NOT EXISTS app_state (
  id                    TINYINT UNSIGNED NOT NULL,
  availability_version  BIGINT UNSIGNED  NOT NULL DEFAULT 0,
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;