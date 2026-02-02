-- Migration: 003a_create_audit_log
-- Description: Create audit logging infrastructure
-- Purpose: Track all database changes for compliance and security

-- Create audit_log table
CREATE TABLE IF NOT EXISTS public.audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  table_name VARCHAR(255) NOT NULL,
  record_id VARCHAR(255) NOT NULL,
  action VARCHAR(50) NOT NULL,
  user_id UUID,
  old_values JSONB,
  new_values JSONB,
  changed_fields TEXT[],
  change_timestamp TIMESTAMP NOT NULL DEFAULT NOW(),
  ip_address INET,
  user_agent TEXT,
  
  CONSTRAINT audit_log_action CHECK (action IN ('INSERT', 'UPDATE', 'DELETE')),
  CONSTRAINT audit_log_record_id CHECK (record_id IS NOT NULL AND record_id != '')
);

-- Create indexes for common queries
CREATE INDEX IF NOT EXISTS idx_audit_log_table ON public.audit_log(table_name);
CREATE INDEX IF NOT EXISTS idx_audit_log_user ON public.audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_timestamp ON public.audit_log(change_timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_audit_log_record ON public.audit_log(table_name, record_id);

-- Create audit trigger function
CREATE OR REPLACE FUNCTION public.audit_changes()
RETURNS TRIGGER AS $$
DECLARE
  v_old_values JSONB;
  v_new_values JSONB;
  v_changed_fields TEXT[];
BEGIN
  -- Convert old/new to JSONB
  v_old_values := TO_JSONB(OLD);
  v_new_values := TO_JSONB(NEW);
  
  -- Detect changed fields on UPDATE
  IF TG_OP = 'UPDATE' THEN
    SELECT array_agg(key)
    INTO v_changed_fields
    FROM jsonb_object_keys(v_new_values) AS key
    WHERE v_new_values -> key IS DISTINCT FROM v_old_values -> key;
  ELSE
    v_changed_fields := NULL;
  END IF;
  
  -- Insert audit log entry
  INSERT INTO public.audit_log (
    table_name,
    record_id,
    action,
    user_id,
    old_values,
    new_values,
    changed_fields,
    change_timestamp
  ) VALUES (
    TG_TABLE_NAME,
    COALESCE((NEW).id::TEXT, (OLD).id::TEXT),
    TG_OP,
    auth.uid(),
    CASE WHEN TG_OP = 'DELETE' THEN v_old_values ELSE NULL END,
    CASE WHEN TG_OP = 'INSERT' THEN v_new_values ELSE v_new_values END,
    v_changed_fields,
    NOW()
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for terms table
CREATE TRIGGER audit_terms_insert
  AFTER INSERT ON public.terms
  FOR EACH ROW
  EXECUTE FUNCTION public.audit_changes();

CREATE TRIGGER audit_terms_update
  AFTER UPDATE ON public.terms
  FOR EACH ROW
  EXECUTE FUNCTION public.audit_changes();

CREATE TRIGGER audit_terms_delete
  AFTER DELETE ON public.terms
  FOR EACH ROW
  EXECUTE FUNCTION public.audit_changes();

-- Create triggers for backup_logs table
CREATE TRIGGER audit_backup_logs_insert
  AFTER INSERT ON public.backup_logs
  FOR EACH ROW
  EXECUTE FUNCTION public.audit_changes();

-- ============================================================
-- COMMENTS FOR DOCUMENTATION
-- ============================================================

COMMENT ON TABLE public.audit_log IS 
  'Immutable audit trail tracking all database changes. INSERT-only, automatically populated by triggers.';

COMMENT ON COLUMN public.audit_log.table_name IS 'Name of the table that was modified (terms, backup_logs, etc)';
COMMENT ON COLUMN public.audit_log.record_id IS 'UUID of the record that was modified';
COMMENT ON COLUMN public.audit_log.action IS 'Type of change: INSERT, UPDATE, or DELETE';
COMMENT ON COLUMN public.audit_log.user_id IS 'UUID of the user who made the change (from auth.uid())';
COMMENT ON COLUMN public.audit_log.old_values IS 'Complete JSONB snapshot of record before change (for UPDATE/DELETE)';
COMMENT ON COLUMN public.audit_log.new_values IS 'Complete JSONB snapshot of record after change (for INSERT/UPDATE)';
COMMENT ON COLUMN public.audit_log.changed_fields IS 'Array of field names that changed (for UPDATE only)';
COMMENT ON COLUMN public.audit_log.change_timestamp IS 'When the change occurred (UTC)';

SELECT 'Migration 003a_create_audit_log completed successfully' AS status;
