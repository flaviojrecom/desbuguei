-- Migration: 002_create_backup_logs
-- Description: Create backup metadata tracking table
-- Purpose: Track all database backups with status, checksums, and recovery information

CREATE TABLE IF NOT EXISTS public.backup_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  backup_id VARCHAR(255) NOT NULL UNIQUE,
  backup_type VARCHAR(50) NOT NULL CHECK (backup_type IN ('hourly', 'daily', 'weekly', 'monthly', 'quarterly')),
  backup_timestamp TIMESTAMP NOT NULL,
  backup_size_bytes BIGINT,
  checksum_md5 VARCHAR(32),
  checksum_sha256 VARCHAR(64),
  location_local VARCHAR(512),
  location_s3 VARCHAR(512),
  status VARCHAR(50) NOT NULL CHECK (status IN ('pending', 'in-progress', 'completed', 'verified', 'failed')),
  recovery_tested BOOLEAN DEFAULT FALSE,
  test_timestamp TIMESTAMP,
  recovery_time_seconds INTEGER,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  verified_at TIMESTAMP,
  purged_at TIMESTAMP,
  error_message TEXT,
  CONSTRAINT valid_backup_size CHECK (backup_size_bytes IS NULL OR backup_size_bytes > 0),
  CONSTRAINT valid_recovery_time CHECK (recovery_time_seconds IS NULL OR recovery_time_seconds > 0)
);

-- Create indexes for common queries
CREATE INDEX IF NOT EXISTS idx_backup_logs_timestamp ON public.backup_logs(backup_timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_backup_logs_status ON public.backup_logs(status);
CREATE INDEX IF NOT EXISTS idx_backup_logs_type ON public.backup_logs(backup_type);
CREATE INDEX IF NOT EXISTS idx_backup_logs_created_at ON public.backup_logs(created_at DESC);

-- Create function for automatic updated_at (if not exists)
CREATE OR REPLACE FUNCTION public.update_backup_logs_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  -- Note: backup_logs doesn't have updated_at, but we'll keep this for consistency
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add comments for documentation
COMMENT ON TABLE public.backup_logs IS 'Tracks all database backups with metadata, status, and recovery information';
COMMENT ON COLUMN public.backup_logs.backup_id IS 'Unique backup identifier (e.g., daily-2026-02-02-020000)';
COMMENT ON COLUMN public.backup_logs.backup_type IS 'Type of backup: hourly (24hr), daily (30d), weekly (12w), monthly (12m), quarterly (7yr)';
COMMENT ON COLUMN public.backup_logs.backup_timestamp IS 'When the backup was created (database snapshot time)';
COMMENT ON COLUMN public.backup_logs.backup_size_bytes IS 'Compressed backup size in bytes';
COMMENT ON COLUMN public.backup_logs.checksum_md5 IS 'MD5 hash for quick integrity check';
COMMENT ON COLUMN public.backup_logs.checksum_sha256 IS 'SHA256 hash for strong integrity verification';
COMMENT ON COLUMN public.backup_logs.location_local IS 'Path to local backup file (e.g., /backups/daily-2026-02-02.sql.gz)';
COMMENT ON COLUMN public.backup_logs.location_s3 IS 'S3 URI for offsite backup (e.g., s3://backups-bucket/daily-2026-02-02.sql.gz)';
COMMENT ON COLUMN public.backup_logs.status IS 'Backup status: pending→in-progress→completed→verified';
COMMENT ON COLUMN public.backup_logs.recovery_tested IS 'Whether this backup has been successfully restored to test database';
COMMENT ON COLUMN public.backup_logs.test_timestamp IS 'When recovery test was performed';
COMMENT ON COLUMN public.backup_logs.recovery_time_seconds IS 'How long recovery took (for RTO measurement)';
COMMENT ON COLUMN public.backup_logs.error_message IS 'Error details if backup failed';

SELECT 'Migration 002_create_backup_logs completed successfully' AS status;
