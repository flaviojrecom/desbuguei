# Database Recovery Procedures

## Overview

This document outlines procedures for recovering Desbuquei's PostgreSQL database from backup in case of accidental deletion, corruption, or disaster scenarios.

**Recovery Strategy**: Point-in-time recovery using automated Supabase backups + manual pg_dump backups

---

## Backup Sources

### 1. Supabase Automated Backups (PRIMARY)
- **Frequency**: Daily at 00:00 UTC
- **Retention**: 30 days
- **Location**: Supabase-managed S3 (encrypted, redundant)
- **Access**: Supabase Dashboard → Project Settings → Backups

### 2. Manual Backups (SECONDARY)
- **Frequency**: On-demand via `./scripts/db-backup.sh`
- **Retention**: Last 30 backups locally, can be archived
- **Location**: `/backups/backup_YYYYMMDD_HHMMSS.sql.gz`
- **Size**: ~50MB (compressed)

---

## Recovery Scenarios

### Scenario A: Accidental Data Deletion (Minor)
**Timeline**: < 1 hour recovery
**Steps**:
1. Identify deletion time from audit logs
2. Use Supabase Dashboard to restore from point-in-time backup
3. Select backup from 1-2 hours before deletion
4. Confirm restore to temporary database first
5. Verify data integrity (spot check 5-10 records)
6. If OK, promote to production

**Estimated Time**: 15-30 minutes

---

### Scenario B: Database Corruption (Moderate)
**Timeline**: 1-2 hours recovery
**Steps**:
1. Create snapshot of current corrupted state (for forensics)
2. Stop application writes: `UPDATE app_config SET read_only = true`
3. Use latest manual backup from `backups/`
4. Create restoration script:
   ```bash
   # Stop app connections
   psql "$SUPABASE_DB_URL" -c "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname='postgres' AND pid <> pg_backend_pid()"

   # Restore from backup
   gunzip -c backups/backup_YYYYMMDD_HHMMSS.sql.gz | psql "$SUPABASE_DB_URL"

   # Re-enable writes
   UPDATE app_config SET read_only = false
   ```
5. Verify data integrity (full audit)
6. Monitor for 2 hours post-recovery

**Estimated Time**: 45-90 minutes

---

### Scenario C: Complete Data Loss (Catastrophic)
**Timeline**: 2-4 hours recovery with RTO target
**Steps**:
1. Activate disaster recovery plan
2. Notify stakeholders of RTO/RPO
3. Choose recovery point:
   - If < 24 hours: Use latest automated Supabase backup
   - If > 24 hours: Use latest manual backup (30-day window)
4. Full restore to production:
   ```bash
   # Get list of backups
   ls -lh backups/ | tail -5

   # Select backup older than corruption timestamp
   BACKUP_FILE="backups/backup_20240115_000000.sql.gz"

   # Full restore with transaction safety
   gunzip -c "$BACKUP_FILE" | psql "$SUPABASE_DB_URL" --single-transaction
   ```
5. Post-recovery validation:
   - Verify schema: `select count(*) from information_schema.tables where table_schema='public'`
   - Verify data: Run integrity checks on all tables
   - Verify counts: `SELECT COUNT(*) FROM terms` (should be > 0)
6. Application testing (smoke tests)
7. Return to service

**Estimated Time**: 90-240 minutes

---

## Recovery Testing Procedure

### Monthly Recovery Drill
**Frequency**: First Monday of each month
**Duration**: 30 minutes
**Steps**:

1. Select a backup from 1 week ago
2. Create temporary test database
3. Restore backup to test database:
   ```bash
   # List available Supabase backups
   supabase db list-backups --project-ref YOUR_PROJECT_REF

   # Download backup
   supabase db download-backup BACKUP_ID --output test-restore.sql

   # Restore to test database
   psql "postgresql://user:pass@host:5432/test_db" < test-restore.sql
   ```
4. Run validation queries:
   ```sql
   -- Table count
   SELECT COUNT(*) as table_count FROM information_schema.tables WHERE table_schema='public';

   -- Term count
   SELECT COUNT(*) as term_count FROM terms;

   -- Check for corruption
   SELECT * FROM terms LIMIT 5;
   ```
5. Document results in recovery log
6. Clean up test database

### Backup Validation Script
```bash
#!/bin/bash
# Validate recent backups

BACKUP_DIR="backups"

for backup in $(ls -t "$BACKUP_DIR"/backup_*.sql.gz | head -3); do
  echo "Validating: $backup"

  # Check file integrity
  if gzip -t "$backup" 2>&1; then
    echo "✓ File integrity OK"
  else
    echo "✗ File corrupted!"
    continue
  fi

  # Test decompress
  if gunzip -c "$backup" | head -100 | grep -q "CREATE TABLE"; then
    echo "✓ Contains SQL schema"
  else
    echo "✗ Invalid SQL format"
    continue
  fi
done
```

---

## Monitoring & Alerts

### Backup Status Dashboard
Configure in monitoring system (DataDog, New Relic, etc.):
- [ ] Daily backup completion status
- [ ] Backup file size trend (alert if > 500MB)
- [ ] Manual backup frequency (alert if none in 7 days)
- [ ] Restore test success rate

### Alert Conditions
1. **Backup Failed**: No successful backup in 24 hours
   - Action: Notify ops team, check SUPABASE_DB_URL
2. **Backup Size Anomaly**: File > 2x normal size
   - Action: Investigate for data bloat
3. **Test Restore Failed**: Monthly recovery test fails
   - Action: Investigate backup corruption

---

## Backup Configuration Checklist

### Supabase Automated Backups
- [ ] Daily backups enabled in Project Settings
- [ ] Retention set to 30 days
- [ ] Backup location verified (S3)
- [ ] Backup encryption verified
- [ ] Backup notification email configured

### Manual Backups
- [ ] `scripts/db-backup.sh` executable and version-controlled
- [ ] `SUPABASE_DB_URL` configured in CI/CD secrets
- [ ] Backup directory (`backups/`) excluded from git
- [ ] Backup retention policy set to 30 files
- [ ] Monthly test restore scheduled

### CI/CD Integration
- [ ] Backup script runs weekly in CI pipeline
- [ ] Backup failure triggers PagerDuty alert
- [ ] Backup completion logged to CloudWatch/DataDog
- [ ] Backup files stored with lifecycle policy (30-day retention)

---

## Troubleshooting

### Error: "pg_dump: command not found"
**Solution**: Install PostgreSQL client tools
```bash
# macOS
brew install postgresql

# Ubuntu
sudo apt-get install postgresql-client

# Docker
docker exec <container> pg_dump
```

### Error: "Authentication failed"
**Solution**: Verify connection string and permissions
```bash
# Test connection
psql "$SUPABASE_DB_URL" -c "SELECT version();"

# Check if user has backup permissions
psql "$SUPABASE_DB_URL" -c "\du"
```

### Error: "Backup file corrupted"
**Solution**: Re-run backup script and verify output
```bash
# Check backup file size
du -h backups/backup_*.sql.gz

# Validate compression
gzip -t backups/backup_*.sql.gz

# If empty or corrupted, delete and retry
rm backups/backup_corrupted.sql.gz
./scripts/db-backup.sh
```

### Restore Hangs/Times Out
**Solution**: Check for blocking connections
```bash
# List active connections
psql "$SUPABASE_DB_URL" -c "SELECT pid, usename, state FROM pg_stat_activity;"

# Terminate blocking connections
psql "$SUPABASE_DB_URL" -c "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname='postgres';"
```

---

## Recovery Metrics (SLAs)

| Scenario | RTO | RPO |
|----------|-----|-----|
| Minor data deletion | 30 min | 0 min (point-in-time) |
| Corruption | 90 min | 1 hour (backup interval) |
| Complete loss | 240 min | 24 hours (oldest backup) |

---

## Contacts & Escalation

- **On-Call DBA**: [Slack: #database-oncall]
- **Ops Lead**: [Slack: @ops-lead]
- **Supabase Support**: support@supabase.io (production emergecy)

---

**Last Updated**: 2024-02-02
**Review Schedule**: Monthly (every 1st Monday)
**Version**: 1.0
