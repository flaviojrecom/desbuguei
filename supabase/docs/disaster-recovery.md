# Disaster Recovery Runbook - Desbuquei Database

**Last Updated:** 2026-02-02
**RTO:** 15 minutes (Recovery Time Objective)
**RPO:** 1 hour (Recovery Point Objective)
**Backup Retention:** 30 days daily, 7 days hourly, 12 months monthly

---

## Backup Strategy: 3-2-1 Rule

- 3 copies of data (original + 2 backups)
- 2 different media types (local SSD + AWS S3)
- 1 copy offsite (AWS S3 in different region)

---

## Scenario 1: Data Corruption (Small Dataset)

**Detection:** Queries return incorrect results
**RTO:** 5 minutes
**Steps:**

1. Identify affected tables
2. Choose recovery point (use latest hourly backup)
3. Execute recovery to test database
4. Verify recovered data integrity
5. If verified, restore to production

---

## Scenario 2: Complete Database Loss

**Detection:** Database is inaccessible or deleted
**RTO:** 15 minutes
**RPO:** Latest backup available (up to 24 hours)
**Steps:**

1. Assess damage and locate backup
2. Create fresh database
3. Restore from daily backup
4. Validate all tables and data integrity
5. Promote recovered database to production
6. Verify application connectivity

---

## Scenario 3: Ransomware/Malicious Deletion

**Detection:** Recent backups are encrypted/deleted
**RTO:** 30+ minutes
**RPO:** Latest S3 offsite backup (usually daily)
**Steps:**

1. Isolate affected systems immediately
2. Verify S3 backup integrity
3. Download backup from S3
4. Perform full database wipe if necessary
5. Restore from S3 backup
6. Security audit for unauthorized objects
7. Review application logs for injection attempts

---

## Monthly Backup Testing

- Test restoration of 30-day-old backup
- Run full data integrity validation
- Measure actual recovery time
- Document any issues for remediation

---

## Quarterly Disaster Recovery Drill

- Schedule: First Friday of each quarter
- Duration: 2 hours
- Simulate complete database loss
- Perform full recovery with all teams
- Document recovery metrics
- Create post-mortem if issues found

---

## Monitoring & Alerts

Alert conditions:
- Daily backup missing > 24 hours
- Backup file corrupted (checksum mismatch)
- S3 upload failed
- Disk space > 80%
- Recovery test failed
- Backup size anomaly (> 150% average)

---

## Escalation Contacts

| Role | Slack |
|------|-------|
| DBA Lead | @dara |
| DevOps Lead | @gage |

---

**Related Documentation:**
- Backup Procedures
- Recovery Procedures
- Audit & Compliance
- Migration Infrastructure
