-- Rollback: 003a_rollback
-- Description: Remove audit logging infrastructure

DROP TRIGGER IF EXISTS audit_backup_logs_insert ON public.backup_logs;
DROP TRIGGER IF EXISTS audit_terms_delete ON public.terms;
DROP TRIGGER IF EXISTS audit_terms_update ON public.terms;
DROP TRIGGER IF EXISTS audit_terms_insert ON public.terms;
DROP FUNCTION IF EXISTS public.audit_changes();
DROP TABLE IF EXISTS public.audit_log;

SELECT 'Rollback 003a_create_audit_log completed' AS status;
