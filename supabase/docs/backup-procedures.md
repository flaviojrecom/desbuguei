# Backup Procedures - Desbuquei Database

**Version:** 1.0  
**Last Updated:** 2026-02-02  
**Owner:** Dara (Data Engineer)

---

## Overview

This guide covers automated and manual backup procedures for the Desbuquei database using PostgreSQL and AWS S3.

### Backup Strategy

- **Type:** Hourly incremental + Daily full backups
- **Schedule:** Daily at 2:00 AM UTC; Hourly every hour
- **Retention:** 30 days daily, 7 days hourly
- **Offsite:** S3 backup with quarterly archives
- **Validation:** MD5/SHA256 checksums for all backups

### Recovery Guarantees

- **RTO:** 15 minutes (Recovery Time Objective)
- **RPO:** 1 hour (Recovery Point Objective)

---

## Backup Schedule

| Type | Frequency | Retention | Purpose |
|------|-----------|-----------|---------|
| Hourly | Every hour | 24 hours | Quick recovery |
| Daily | 2:00 AM UTC | 30 days | Standard recovery |
| Weekly | Sundays | 12 weeks | Historical |
| Monthly | 1st day | 12 months | Long-term |
| Quarterly | Quarterly | 7 years | Compliance |

---

## Manual Backup

### Full Database Backup

```bash
# Create backup directory
mkdir -p /backups
cd /backups

# Perform full backup
pg_dump -h localhost -U postgres -d desbuquei --format=plain > desbuquei-$(date +%Y-%m-%d-%H%M%S).sql

# Compress
gzip desbuquei-*.sql

# Verify
ls -lh desbuquei-*.sql.gz
```

### Incremental Backup (WAL Archiving)

```bash
# Enable WAL archiving in postgresql.conf
# archive_mode = on
# archive_command = 'cp %p /backups/wal_archive/%f'

# Restart PostgreSQL
systemctl restart postgresql

# WAL files will be automatically archived
ls -la /backups/wal_archive/
```

---

## Automated Backups

### Start Scheduler

```bash
cd /path/to/supabase/scripts

# Run in background (development)
nohup node backup-scheduler.js > backup-scheduler.log 2>&1 &

# Or use systemd service (production)
systemctl start backup-scheduler
systemctl status backup-scheduler
```

### Check Backup Status

```bash
# View recent backups
ls -lth /backups/*.sql.gz | head -10

# Check metadata
cat /backups/backup-metadata.jsonl | jq '.[] | {backup_id, status, size}' | tail -10

# View logs
tail -f /backups/scheduler.log
```

---

## Backup Validation

### Checksum Verification

```bash
# Calculate MD5
md5sum /backups/daily-2026-02-02-020000.sql.gz

# Compare with metadata
grep "daily-2026-02-02-020000" /backups/backup-metadata.jsonl | jq '.checksum_md5'
```

### File Integrity

```bash
# Check file exists and is readable
file /backups/daily-2026-02-02-020000.sql.gz

# Check if gzip is valid
gzip -t /backups/daily-2026-02-02-020000.sql.gz && echo "✓ Valid" || echo "✗ Corrupt"

# View backup header
gunzip -c /backups/daily-2026-02-02-020000.sql.gz | head -20
```

---

## AWS S3 Backup

### Upload to S3

```bash
# Configure AWS credentials
aws configure

# Upload daily backup
aws s3 cp /backups/daily-2026-02-02-020000.sql.gz \
  s3://desbuquei-backups/daily/ \
  --region us-east-1 \
  --storage-class GLACIER  # For long-term

# Verify upload
aws s3 ls s3://desbuquei-backups/daily/ --region us-east-1
```

### Download from S3

```bash
# List available backups
aws s3 ls s3://desbuquei-backups/daily/ --recursive --region us-east-1

# Download for recovery
aws s3 cp s3://desbuquei-backups/daily/daily-2026-02-02-020000.sql.gz \
  /backups/recovery.sql.gz \
  --region us-east-1
```

---

## Monitoring & Alerts

### Disk Space Check

```bash
# Check backup directory
du -sh /backups/
df -h /backups/

# Alert if > 80%
diskusage=$(df /backups | awk 'NR==2 {print $5}' | sed 's/%//')
if [ $diskusage -gt 80 ]; then
  echo "WARNING: Backup disk usage at ${diskusage}%"
fi
```

### Backup Verification Report

```bash
# Generate daily report
psql -d desbuquei << 'SQL'
SELECT 
  backup_id,
  backup_type,
  backup_timestamp,
  backup_size_bytes / 1024 / 1024 as size_mb,
  status,
  recovery_tested,
  EXTRACT(EPOCH FROM (NOW() - backup_timestamp)) / 3600 as hours_old
FROM backup_logs
WHERE backup_timestamp > NOW() - INTERVAL '24 hours'
ORDER BY backup_timestamp DESC;
SQL
```

---

## Troubleshooting

### Backup Failed

```bash
# Check logs
tail -f /backups/scheduler.log

# Verify PostgreSQL is running
systemctl status postgresql
psql -l

# Check disk space
df -h /backups/

# Check permissions
ls -la /backups/
```

### Compression Issues

```bash
# If gzip fails, try with lower compression
gzip -1 /backups/large-backup.sql

# Or use tar for faster compression
tar -czf /backups/backup.tar.gz /backups/*.sql
```

### S3 Upload Fails

```bash
# Verify AWS credentials
aws sts get-caller-identity

# Check S3 bucket access
aws s3 ls s3://desbuquei-backups/

# Verify bucket policy and permissions
aws s3api get-bucket-policy --bucket desbuquei-backups
```

---

## Best Practices

- ✅ Backup every hour for operational resilience
- ✅ Keep 30 days of daily backups minimum
- ✅ Verify backup checksums immediately after creation
- ✅ Test recovery monthly on test database
- ✅ Archive quarterly backups to cold storage
- ✅ Monitor disk space and alert when > 80%
- ✅ Document all manual backup operations
- ✅ Encrypt backups in transit and at rest (S3 SSE)

---

**Related:**
- Disaster Recovery Runbook
- Recovery Procedures
- Migration Infrastructure
