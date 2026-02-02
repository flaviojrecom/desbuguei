# Story TD-102: Database Backup & Recovery Infrastructure

**Epic:** EPIC-TD-001 (Technical Debt Resolution - Phase 1)
**Status:** 📋 Draft
**Priority:** P0 - CRITICAL
**Sprint:** Phase 1, Week 2
**Effort:** 12 hours
**Created:** 2026-02-02

---

## 📖 User Story

As a **database engineer**, I want to **establish automated backup and recovery procedures** so that **all database data is protected against loss, and can be recovered to any point in time with guaranteed consistency**.

---

## ✅ Acceptance Criteria

### Backup Infrastructure Setup
- [ ] 3-2-1 backup strategy implemented (3 copies, 2 media types, 1 offsite)
- [ ] Daily full backups to local storage + AWS S3
- [ ] Hourly incremental backups for 24-hour window
- [ ] Backup metadata table created (backup_id, timestamp, size, checksum, status)
- [ ] Automated backup cleanup for retention policy compliance

### Backup Scheduling & Retention
- [ ] Daily backup scheduled at 2:00 AM UTC (off-peak)
- [ ] Hourly backup scheduled every hour for last 24 hours
- [ ] Retention policy: 30 days daily, 7 days hourly, quarterly archives
- [ ] Backup scheduler script (`backup-scheduler.js`) created and tested
- [ ] Retention manager (`retention-manager.js`) removes old backups automatically
- [ ] Disk space monitoring with alerts

### Point-in-Time Recovery (PITR)
- [ ] Recovery script supports restoration to specific timestamp
- [ ] WAL (Write-Ahead Logging) archiving enabled
- [ ] Backup validation with checksums (MD5, SHA256)
- [ ] Data consistency verification after restore
- [ ] Dry-run mode for testing recovery without applying

### Disaster Recovery Procedures
- [ ] RTO (Recovery Time Objective): 15 minutes maximum
- [ ] RPO (Recovery Point Objective): 1 hour maximum
- [ ] Disaster recovery runbook (`supabase/docs/disaster-recovery.md`) created
- [ ] Step-by-step recovery procedures documented
- [ ] Failover procedures for multi-region setup (future)
- [ ] Practiced restore from backup on test database

### Monitoring & Alerting
- [ ] Backup success/failure notifications
- [ ] Disk space monitoring with 80% usage alert
- [ ] Recovery time estimates documented
- [ ] Backup integrity report generated daily
- [ ] Alert integration with team Slack/email

### Documentation & Training
- [ ] Complete backup procedures guide
- [ ] Recovery procedures runbook
- [ ] Team training completed and documented
- [ ] Backup audit procedures defined
- [ ] Quarterly backup rotation drill scheduled

---

## 🎯 Definition of Done

- [ ] Backup infrastructure created and tested
- [ ] Automated scheduling configured
- [ ] Point-in-time recovery validated
- [ ] Disaster recovery runbook complete
- [ ] Monitoring and alerts functional
- [ ] All documentation complete
- [ ] CodeRabbit SQL review passed
- [ ] DBA sign-off obtained
- [ ] Team training completed
- [ ] Story marked "Ready for Review"

---

## 📋 Tasks

### Task 1: Setup Backup Infrastructure
**Subtasks:**
- [ ] 1.1 Create backup metadata table (backup_logs)
- [ ] 1.2 Create S3 bucket for backup storage
- [ ] 1.3 Configure Supabase backup settings
- [ ] 1.4 Setup local backup directory with proper permissions
- [ ] 1.5 Create backup utility script (`db-backup-util.sh`)
- [ ] 1.6 Test backup creation and validation

### Task 2: Implement Backup Scheduling & Retention
**Subtasks:**
- [ ] 2.1 Create backup scheduler script (`backup-scheduler.js`)
- [ ] 2.2 Implement hourly incremental backup logic
- [ ] 2.3 Implement daily full backup logic
- [ ] 2.4 Create retention manager script
- [ ] 2.5 Test retention policy enforcement
- [ ] 2.6 Setup cron jobs for automated execution

### Task 3: Implement Recovery & Validation
**Subtasks:**
- [ ] 3.1 Create PITR recovery script (`db-recover-pitr.sh`)
- [ ] 3.2 Implement checksum validation (MD5, SHA256)
- [ ] 3.3 Create data consistency verification procedure
- [ ] 3.4 Implement dry-run mode for recovery testing
- [ ] 3.5 Test full recovery workflow
- [ ] 3.6 Document recovery step-by-step procedures

### Task 4: Disaster Recovery Procedures
**Subtasks:**
- [ ] 4.1 Create disaster recovery runbook
- [ ] 4.2 Document RTO/RPO targets and SLAs
- [ ] 4.3 Create failover checklist
- [ ] 4.4 Test recovery from 7-day-old backup
- [ ] 4.5 Test recovery from S3 offsite backup
- [ ] 4.6 Practice full disaster recovery drill

### Task 5: Monitoring, Documentation & Quality
**Subtasks:**
- [ ] 5.1 Setup backup success/failure notifications
- [ ] 5.2 Create disk space monitoring script
- [ ] 5.3 Generate daily backup integrity reports
- [ ] 5.4 Create backup procedures guide
- [ ] 5.5 Create audit and compliance documentation
- [ ] 5.6 Run CodeRabbit SQL review
- [ ] 5.7 Obtain DBA sign-off

---

## 🔧 Technical Details

### Backup Strategy: 3-2-1 Rule
```
- 3 copies of data (original + 2 backups)
- 2 different media types (local SSD + AWS S3)
- 1 copy offsite (AWS S3 in different region)
```

### Backup Schedule
| Type | Frequency | Retention | Purpose |
|------|-----------|-----------|---------|
| Hourly | Every hour | 24 hours | Quick recovery window |
| Daily | 2:00 AM UTC | 30 days | Standard recovery |
| Weekly | Sundays | 12 weeks | Historical backup |
| Monthly | 1st day | 12 months | Long-term archival |
| Quarterly | Quarterly | 7 years | Compliance/audit |

### Backup Metadata Schema
```sql
CREATE TABLE IF NOT EXISTS backup_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  backup_id VARCHAR(255) NOT NULL UNIQUE,
  backup_type VARCHAR(50) NOT NULL,
  backup_timestamp TIMESTAMP NOT NULL,
  backup_size_bytes BIGINT,
  checksum_md5 VARCHAR(32),
  checksum_sha256 VARCHAR(64),
  location_local VARCHAR(512),
  location_s3 VARCHAR(512),
  status VARCHAR(50) NOT NULL,
  recovery_tested BOOLEAN DEFAULT FALSE,
  test_timestamp TIMESTAMP,
  recovery_time_seconds INTEGER,
  created_at TIMESTAMP DEFAULT NOW(),
  verified_at TIMESTAMP,
  purged_at TIMESTAMP,
  error_message TEXT
);

CREATE INDEX idx_backup_logs_timestamp ON backup_logs(backup_timestamp DESC);
CREATE INDEX idx_backup_logs_status ON backup_logs(status);
CREATE INDEX idx_backup_logs_type ON backup_logs(backup_type);
```

### Recovery Time Objectives (RTO/RPO)
- **RTO:** 15 minutes (time to restore full database)
- **RPO:** 1 hour (maximum data loss acceptable)
- **Verification:** 5 minutes (time to verify recovery integrity)

### Standards & Tools
- **Database:** Supabase PostgreSQL
- **Backup Tool:** `pg_dump` (full), WAL archiving (incremental)
- **Storage:** Local SSD + AWS S3
- **Scheduling:** Node.js cron jobs or system cron
- **Validation:** MD5/SHA256 checksums

### Dependencies
- Depends on: TD-101 (Database Migrations Infrastructure)

---

## 🧪 Quality Gates

### Pre-Commit
- [ ] All scripts validated (syntax, permissions)
- [ ] Schema SQL reviewed for correctness
- [ ] No hardcoded credentials or secrets
- [ ] Backup paths properly configured

### Pre-PR
- [ ] CodeRabbit SQL approval obtained
- [ ] Full recovery tested successfully
- [ ] PITR tested on 7-day-old backup
- [ ] Documentation complete and reviewed
- [ ] All test backups validated

### Pre-Deploy
- [ ] DBA sign-off obtained
- [ ] Production backup tested (restore to test database)
- [ ] RTO/RPO targets verified
- [ ] Team training completed
- [ ] Monitoring and alerts activated

---

## 📚 File List

### Files to Create
- `supabase/scripts/backup-scheduler.js` - Automated backup scheduling
- `supabase/scripts/retention-manager.js` - Backup retention policy enforcement
- `supabase/scripts/db-backup-util.sh` - Backup utility functions
- `supabase/scripts/db-recover-pitr.sh` - Point-in-time recovery script
- `supabase/scripts/validate-backup.sh` - Backup validation script
- `supabase/migrations/002_create_backup_logs.sql` - Backup metadata table
- `supabase/docs/backup-procedures.md` - Backup operations guide
- `supabase/docs/disaster-recovery.md` - Disaster recovery runbook
- `supabase/docs/recovery-procedures.md` - Step-by-step recovery guide
- `supabase/docs/backup-audit.md` - Audit procedures and compliance
- `.env.example` - Updated with S3 backup configuration

### Files to Modify
- `supabase/docs/SCHEMA.md` - Add backup_logs table documentation
- `package.json` - Add backup-related scripts
- `.gitignore` - Add backup file patterns

---

## 📝 Change Log

### Version 1.0 (Draft)
- Story created from EPIC-TD-001
- All acceptance criteria defined
- 5 tasks with detailed subtasks outlined

---

## 🔗 References

- **Supabase Backups:** https://supabase.com/docs/guides/database/backups
- **PostgreSQL Backup:** https://www.postgresql.org/docs/current/backup.html
- **PITR:** https://www.postgresql.org/docs/current/continuous-archiving.html

---

## 👤 Agent Model Used

**Assigned To:** @data-engineer (Dara)
**Specialized Agents Needed:**
- @data-engineer (Dara) - Backup infrastructure
- @devops (Gage) - Infrastructure automation

---

## 📝 Dev Agent Record

### Current Task
⏳ PENDING - Awaiting developer assignment

---

**Created by:** River (Scrum Master)
**Date:** 2026-02-02
