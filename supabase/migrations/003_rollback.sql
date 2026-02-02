-- Rollback: 003_rollback
-- Description: Disable RLS and remove all policies

ALTER TABLE public.terms DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.backup_logs DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_log DISABLE ROW LEVEL SECURITY;

SELECT 'Rollback 003_enable_rls completed' AS status;
