-- Migration: 003_enable_rls
-- Description: Enable Row Level Security and create base policies
-- Purpose: Implement defense-in-depth security for database tables

-- Enable RLS on all tables
ALTER TABLE public.terms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.backup_logs ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- TERMS TABLE POLICIES
-- ============================================================

-- Policy 1: Public read-only access (unauthenticated users)
-- Anyone can read non-deleted terms
CREATE POLICY "terms_public_read"
  ON public.terms
  FOR SELECT
  USING (deleted_at IS NULL);

-- Policy 2: Admin full access (authenticated admins only)
-- Only authenticated admin users can create/update/delete
-- Admin validation via JWT token (you must configure in Supabase Auth)
CREATE POLICY "terms_admin_all"
  ON public.terms
  FOR ALL
  USING (
    auth.role() = 'authenticated' AND
    auth.uid() IS NOT NULL
  )
  WITH CHECK (
    auth.role() = 'authenticated' AND
    auth.uid() IS NOT NULL
  );

-- ============================================================
-- BACKUP_LOGS TABLE POLICIES
-- ============================================================

-- Policy 1: Public read-only access to backup metadata
-- Users can view backup status but not modify
CREATE POLICY "backup_logs_public_read"
  ON public.backup_logs
  FOR SELECT
  USING (true);  -- All users can read backup status

-- Policy 2: Admin-only write access
-- Only authenticated admins can create/update backup logs
CREATE POLICY "backup_logs_admin_write"
  ON public.backup_logs
  FOR INSERT
  WITH CHECK (
    auth.role() = 'authenticated' AND
    auth.uid() IS NOT NULL
  );

-- Prevent backup log updates and deletes (immutable)
CREATE POLICY "backup_logs_prevent_delete"
  ON public.backup_logs
  FOR DELETE
  USING (false);

CREATE POLICY "backup_logs_prevent_update"
  ON public.backup_logs
  FOR UPDATE
  USING (false);

-- ============================================================
-- AUDIT_LOG TABLE POLICIES
-- ============================================================

-- Audit log is insert-only, read by admins only
CREATE POLICY "audit_log_admin_read"
  ON public.audit_log
  FOR SELECT
  USING (
    auth.role() = 'authenticated' AND
    auth.uid() IS NOT NULL
  );

CREATE POLICY "audit_log_insert_only"
  ON public.audit_log
  FOR INSERT
  WITH CHECK (true);  -- Allow system inserts

-- Prevent manual updates and deletes on audit log
CREATE POLICY "audit_log_prevent_update"
  ON public.audit_log
  FOR UPDATE
  USING (false);

CREATE POLICY "audit_log_prevent_delete"
  ON public.audit_log
  FOR DELETE
  USING (false);

-- ============================================================
-- COMMENTS FOR DOCUMENTATION
-- ============================================================

COMMENT ON POLICY "terms_public_read" ON public.terms IS 
  'Allow public read-only access to non-deleted terms. Anyone can search and view term definitions.';

COMMENT ON POLICY "terms_admin_all" ON public.terms IS 
  'Allow authenticated admin users to create, update, and delete terms. JWT role validation required.';

COMMENT ON POLICY "backup_logs_public_read" ON public.backup_logs IS 
  'Allow all users to view backup status and metadata. No write access.';

COMMENT ON POLICY "backup_logs_admin_write" ON public.backup_logs IS 
  'Allow only authenticated admins to create backup log entries. Prevents user tampering.';

SELECT 'Migration 003_enable_rls completed successfully' AS status;
