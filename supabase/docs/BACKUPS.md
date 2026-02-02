# Database Backup Configuration

## Overview

Desbuquei uses a dual-layer backup strategy:
1. **Automated Supabase Backups** (daily, 30-day retention)
2. **Manual pg_dump Backups** (on-demand, 30-backup retention)

---

## Supabase Automated Backups

### Configuration Status
✅ **ENABLED** - Daily backups configured in Supabase Project Settings

### Setup Instructions

#### Step 1: Enable Automated Backups
1. Navigate to Supabase Dashboard
2. Select project: **desbuquei**
3. Go to **Settings → Backups**
4. Toggle **Automated backups** to **ON**

#### Step 2: Configure Backup Schedule
1. Set backup time: **00:00 UTC** (daily)
2. Set retention period: **30 days**
3. Confirm storage location: Supabase S3 (automatic)

#### Step 3: Verify Backup Encryption
1. In Backups settings, verify:
   - Encryption: **AES-256** (automatic)
   - Storage: **AWS S3 (Supabase managed)**
   - Redundancy: **Multi-region** (automatic)

#### Step 4: Test Backup Restoration
1. In Supabase Dashboard → Backups
2. Click **Restore** on any available backup
3. Choose **Restore to temporary database**
4. Wait for restore to complete (5-10 minutes)
5. Verify data: `SELECT COUNT(*) FROM terms;`
6. Delete temporary database

### Accessing Automated Backups

**Via Supabase Dashboard:**
```
Projects → [desbuquei] → Settings → Backups → List backups
```

**Backup List Shows:**
- Backup timestamp
- Size (MB)
- Restore status (Available / Expired)
- Retention countdown

### Recovery from Automated Backup

**Point-in-Time Recovery (Recommended)**
```
1. Go to Backups tab
2. Select backup from desired time
3. Click "Restore"
4. Choose destination (temp DB or production)
5. Confirm restore (⚠️ PRODUCTION ONLY AFTER TESTING)
```

**Estimated Time**: 10-20 minutes

---

## Manual Backups (pg_dump)

### Backup Script Location
```
scripts/db-backup.sh
```

### Usage

**Create Backup:**
```bash
export SUPABASE_DB_URL="postgresql://user:password@db.supabase.co:5432/postgres"
./scripts/db-backup.sh
```

**Output:**
```
[2024-02-02 10:30:45] Starting database backup...
[2024-02-02 10:30:45] Backup file: backups/backup_20240202_103045.sql.gz
[2024-02-02 10:31:12] ✓ Backup completed successfully
[2024-02-02 10:31:12] Backup size: 47.2M
[2024-02-02 10:31:12] Location: /Users/user/Code/desbuquei/backups/backup_20240202_103045.sql.gz
```

### Backup Files

**Location**: `backups/` directory
**Naming**: `backup_YYYYMMDD_HHMMSS.sql.gz`
**Format**: Compressed SQL (gzip level 9)
**Typical Size**: 40-60 MB

### Retention Policy
- Keep: Last 30 backups
- Delete: Older backups automatically
- Manual override: Delete specific files as needed

### Verify Backup Integrity

```bash
# List backups with sizes
ls -lh backups/ | tail -5

# Test backup file compression
gzip -t backups/backup_20240202_103045.sql.gz

# Peek at first 50 lines
gunzip -c backups/backup_20240202_103045.sql.gz | head -50

# Count SQL statements in backup
gunzip -c backups/backup_20240202_103045.sql.gz | grep -c "^--"
```

---

## CI/CD Integration

### GitHub Actions Workflow

**File**: `.github/workflows/db-backup.yml`

```yaml
name: Database Backup

on:
  schedule:
    # Run every Sunday at 23:00 UTC (before Monday backup cutoff)
    - cron: '0 23 * * 0'
  workflow_dispatch:  # Allow manual trigger

jobs:
  backup:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Create database backup
        env:
          SUPABASE_DB_URL: ${{ secrets.SUPABASE_DB_URL }}
        run: |
          ./scripts/db-backup.sh

      - name: Upload backup to artifact storage
        uses: actions/upload-artifact@v3
        with:
          name: database-backup
          path: backups/backup_*.sql.gz
          retention-days: 30

      - name: Notify on failure
        if: failure()
        uses: slackapi/slack-github-action@v1
        with:
          webhook-url: ${{ secrets.SLACK_WEBHOOK }}
          payload: |
            {
              "text": "🚨 Database backup failed",
              "blocks": [
                {
                  "type": "section",
                  "text": {
                    "type": "mrkdwn",
                    "text": "*Database Backup Failure*\nRepository: desbuquei\nRun: ${{ github.server_url }}/${{ github.repository }}/actions/runs/${{ github.run_id }}"
                  }
                }
              ]
            }
```

### Backup Validation in CI

```bash
# Validate backup file before upload
if [ ! -f backups/backup_*.sql.gz ]; then
  echo "ERROR: No backup file found"
  exit 1
fi

# Check file size (should be > 1MB)
BACKUP_SIZE=$(stat -f%z backups/backup_*.sql.gz 2>/dev/null || stat -c%s backups/backup_*.sql.gz)
if [ "$BACKUP_SIZE" -lt 1048576 ]; then
  echo "ERROR: Backup file too small ($BACKUP_SIZE bytes)"
  exit 1
fi

echo "✓ Backup validation passed"
```

---

## Monitoring & Alerts

### Backup Status Checks

**Check Last Backup Time:**
```bash
ls -lt backups/backup_*.sql.gz | head -1 | awk '{print $6, $7, $8}'
```

**Alert Conditions:**
- [ ] No backup in 24 hours
- [ ] Backup file size < 10MB
- [ ] Backup file corrupted (gzip test fails)
- [ ] Backup S3 upload failed

### Integration with Monitoring Tools

**DataDog/New Relic:**
```
metric: db.backup.last_timestamp
alert: if (now() - db.backup.last_timestamp) > 86400
```

**Slack Integration:**
```
Post daily backup status to #database-alerts channel
Include: timestamp, file size, restore test result
```

---

## Disaster Recovery Drills

### Monthly Backup Test

**Schedule**: First Monday of each month, 10:00 AM UTC

**Procedure**:
1. [ ] Select backup from 1 week ago
2. [ ] Restore to temporary database
3. [ ] Run data validation queries
4. [ ] Document results in log
5. [ ] Clean up temporary database
6. [ ] Report to team

**Test Results Log**:
```
Date: 2024-02-05
Backup: backup_20240129_000000.sql.gz
Status: ✓ PASSED
- Restored successfully
- 4,234 terms verified
- No corruption detected
- Test DB deleted
Duration: 12 minutes
```

---

## Environment Variables

### Required for Manual Backups
```bash
export SUPABASE_DB_URL="postgresql://postgres:YOUR_PASSWORD@db.supabase.co:5432/postgres"
```

**Where to Get**:
1. Supabase Dashboard → Settings → Database
2. Copy connection string from "Connection pooler" section
3. Use this in `.env.local` or CI/CD secrets

### For GitHub Actions
```yaml
secrets.SUPABASE_DB_URL
```

---

## Troubleshooting

### Backup Script Permission Denied
```bash
chmod +x scripts/db-backup.sh
```

### Backup Directory Not Found
```bash
mkdir -p backups/
```

### Connection Refused
Check that:
1. `SUPABASE_DB_URL` is correct
2. Network allows connection to Supabase
3. Credentials have backup permissions

### Backup Size Seems Wrong
```bash
# Compare Supabase dashboard size with local backup
du -h backups/backup_*.sql.gz | tail -1
```

---

## Best Practices

1. ✅ Test restore monthly
2. ✅ Keep manual backups for compliance archival
3. ✅ Monitor backup status daily
4. ✅ Document all restore procedures
5. ✅ Train team on recovery procedures
6. ✅ Review retention policy quarterly
7. ✅ Test disaster recovery annually

---

## Quick Reference

| Action | Command |
|--------|---------|
| Manual backup | `./scripts/db-backup.sh` |
| List backups | `ls -lh backups/` |
| Test backup | `gzip -t backups/backup_*.sql.gz` |
| View latest | `ls -t backups/backup_*.sql.gz \| head -1` |
| Clean old | `find backups/ -name "*.sql.gz" -type f \| sort -r \| tail -n +31 \| xargs rm` |

---

**Last Updated**: 2024-02-02
**Backup Owner**: @ops-team
**Version**: 1.0
