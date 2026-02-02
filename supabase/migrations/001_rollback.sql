-- Rollback: 001_create_terms_table.sql
-- Description: Safely reverse the terms table creation
-- Author: Dara (Data Engineer)
-- Created: 2026-02-02
-- WARNING: This script is DESTRUCTIVE. Run only to undo 001_create_terms_table.sql

-- SAFETY: This rollback verifies the expected state before destroying

BEGIN;

-- Step 1: Verify we're rolling back the correct migration
-- Check that the table exists and has expected structure
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'terms'
  ) THEN
    RAISE EXCEPTION 'Rollback aborted: terms table not found. Ensure 001_create_terms_table.sql was applied.';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'terms' AND column_name = 'id'
  ) THEN
    RAISE EXCEPTION 'Rollback aborted: terms table missing expected columns. Schema mismatch detected.';
  END IF;
END $$;

-- Step 2: Drop indexes (in correct order to avoid dependency issues)
-- Indexes are safe to drop (no foreign key dependencies)
DROP INDEX IF EXISTS public.idx_terms_related_terms_gin;
DROP INDEX IF EXISTS public.idx_terms_term_gin;
DROP INDEX IF EXISTS public.idx_terms_active;
DROP INDEX IF EXISTS public.idx_terms_category_created;

-- Step 3: Drop the main table
-- This will cascade to any triggers or dependent objects
DROP TABLE IF EXISTS public.terms CASCADE;

-- Step 4: Drop the ENUM type
-- Safe to drop now that table is gone
DROP TYPE IF EXISTS public.category_type;

-- Verification: Confirm rollback success
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'terms'
  ) THEN
    RAISE EXCEPTION 'Rollback failed: terms table still exists!';
  END IF;

  RAISE NOTICE 'Rollback successful: 001_create_terms_table.sql reversed completely';
END $$;

COMMIT;
