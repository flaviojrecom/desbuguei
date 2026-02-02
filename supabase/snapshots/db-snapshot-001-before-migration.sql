-- Schema Snapshot: Pre-migration baseline (001)
-- Created: 2026-02-02 by Dara (Data Engineer)
-- Purpose: Baseline snapshot BEFORE applying 001_create_terms_table.sql
-- Use: If rollback needed, can compare to verify successful reversal

-- This snapshot represents the database state before any terms table exists
-- It serves as a point-in-time reference for schema comparison

-- Schema state: EMPTY (migration not yet applied)
-- Expected state after applying 001_create_terms_table.sql:
-- - ENUM type: category_type with 6 values
-- - TABLE: public.terms with 20 columns
-- - INDEXES: 4 supporting indexes
-- - COMMENTS: Full documentation on table, columns, indexes

-- To generate post-migration snapshot, run:
-- pg_dump --schema-only $SUPABASE_DB_URL > db-snapshot-001-after-migration.sql

-- Timeline:
-- Before migration: This snapshot (empty schema)
-- Apply: supabase/migrations/001_create_terms_table.sql
-- After migration: db-snapshot-001-after-migration.sql (should have terms table + type + indexes)
-- Rollback (if needed): supabase/migrations/001_rollback.sql (returns to empty state)
