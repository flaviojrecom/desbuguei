-- Rollback Script: 003_rollback.sql
-- Purpose: Safely remove all indexes created in migration 003
-- Author: Dara (Data Engineer)
-- Date: 2026-02-02

BEGIN;

-- Drop all 4 indexes created in migration 003
DROP INDEX IF EXISTS idx_terms_category_created;
DROP INDEX IF EXISTS idx_terms_active;
DROP INDEX IF EXISTS idx_terms_term_gin;
DROP INDEX IF EXISTS idx_terms_related_terms_gin;

-- Verify no indexes remain (for safety)
-- SELECT indexname FROM pg_indexes WHERE tablename = 'terms' AND indexname LIKE 'idx_terms_%';

COMMIT;

-- Notes:
-- - This rollback is safe: no data loss
-- - Query performance will revert to ~50ms (no indexes)
-- - Can be re-run without errors (DROP IF EXISTS)
-- - Partial indexes auto-cleanup: no manual cleanup needed
