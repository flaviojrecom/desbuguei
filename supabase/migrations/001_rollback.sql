-- Rollback: 001_rollback.sql
-- Description: Rollback for 001_create_terms_table.sql
-- Reverses all changes from the forward migration

-- Drop trigger first (depends on function)
DROP TRIGGER IF EXISTS trigger_terms_updated_at ON public.terms;

-- Drop function
DROP FUNCTION IF EXISTS update_terms_updated_at();

-- Drop indexes
DROP INDEX IF EXISTS idx_terms_deleted_at;
DROP INDEX IF EXISTS idx_terms_created_at;
DROP INDEX IF EXISTS idx_terms_category;
DROP INDEX IF EXISTS idx_terms_term;

-- Drop table
DROP TABLE IF EXISTS public.terms;

SELECT 'Rollback 001_create_terms_table completed successfully' AS status;
