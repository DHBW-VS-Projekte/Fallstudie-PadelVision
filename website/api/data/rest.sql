-- =====================================================================
-- reset.sql – löscht alle Testdaten (Buchungen, Belegung, Sperren, Rate Limit).
-- Standorte und Courts bleiben. Entspricht "Alle Testdaten zurücksetzen"
-- in /verwaltung. Ausführen in phpMyAdmin → Datenbank wählen → Reiter "SQL".
-- DELETE statt TRUNCATE: TRUNCATE scheitert bei Fremdschlüsseln.
-- =====================================================================
DELETE FROM slot_cells;
DELETE FROM bookings;
DELETE FROM email_guards;
DELETE FROM rate_events;
UPDATE app_state SET availability_version = availability_version + 1 WHERE id = 1;