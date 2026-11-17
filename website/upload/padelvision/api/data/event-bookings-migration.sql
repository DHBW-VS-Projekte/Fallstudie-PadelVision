-- One-time upgrade for databases created before event bookings were added.
-- Safe to run again: each column is checked before ALTER TABLE.

SET @column_exists = (
  SELECT COUNT(*) FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'bookings' AND COLUMN_NAME = 'booking_type'
);
SET @migration_sql = IF(
  @column_exists = 0,
  'ALTER TABLE bookings ADD COLUMN booking_type ENUM(''court'',''event'') NOT NULL DEFAULT ''court''',
  'SELECT 1'
);
PREPARE migration_stmt FROM @migration_sql;
EXECUTE migration_stmt;
DEALLOCATE PREPARE migration_stmt;

SET @column_exists = (
  SELECT COUNT(*) FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'bookings' AND COLUMN_NAME = 'event_id'
);
SET @migration_sql = IF(
  @column_exists = 0,
  'ALTER TABLE bookings ADD COLUMN event_id VARCHAR(40) NULL',
  'SELECT 1'
);
PREPARE migration_stmt FROM @migration_sql;
EXECUTE migration_stmt;
DEALLOCATE PREPARE migration_stmt;

SET @column_exists = (
  SELECT COUNT(*) FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'bookings' AND COLUMN_NAME = 'event_title'
);
SET @migration_sql = IF(
  @column_exists = 0,
  'ALTER TABLE bookings ADD COLUMN event_title VARCHAR(160) NULL',
  'SELECT 1'
);
PREPARE migration_stmt FROM @migration_sql;
EXECUTE migration_stmt;
DEALLOCATE PREPARE migration_stmt;

SET @column_exists = (
  SELECT COUNT(*) FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'bookings' AND COLUMN_NAME = 'event_type'
);
SET @migration_sql = IF(
  @column_exists = 0,
  'ALTER TABLE bookings ADD COLUMN event_type VARCHAR(40) NULL',
  'SELECT 1'
);
PREPARE migration_stmt FROM @migration_sql;
EXECUTE migration_stmt;
DEALLOCATE PREPARE migration_stmt;
