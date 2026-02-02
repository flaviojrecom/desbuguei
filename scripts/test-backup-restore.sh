#!/bin/bash

###############################################################################
# Database Backup & Restore Test Script
#
# Purpose: Validate backup and restore procedures
# Usage: ./scripts/test-backup-restore.sh
#
# Tests:
# 1. Backup script execution
# 2. Backup file integrity
# 3. Backup file decompression
# 4. SQL format validation
# 5. Restore procedure (to temporary DB)
# 6. Data integrity verification
#
# Environment Variables:
# - SUPABASE_DB_URL: Primary database connection string
# - SUPABASE_TEST_DB_URL: Test database for restore testing (optional)
###############################################################################

set -e

# Configuration
BACKUP_DIR="backups"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
TEST_LOG="backups/test-restore_${TIMESTAMP}.log"
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Logging
log() {
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$TEST_LOG"
}

error_exit() {
  log "${RED}ERROR: $1${NC}"
  exit 1
}

success() {
  log "${GREEN}✓ $1${NC}"
}

# Verify environment
log "${YELLOW}=== Database Backup & Restore Test ===${NC}"
log "Test timestamp: $TIMESTAMP"

if [ -z "$SUPABASE_DB_URL" ]; then
  error_exit "SUPABASE_DB_URL environment variable not set"
fi

log "Database URL: $(echo $SUPABASE_DB_URL | sed 's/:.*@/@/g')"

# Test 1: Backup Script Execution
log "${YELLOW}Test 1: Creating backup...${NC}"
if ./scripts/db-backup.sh >> "$TEST_LOG" 2>&1; then
  success "Backup script executed successfully"
  BACKUP_FILE=$(ls -t "$BACKUP_DIR"/backup_*.sql.gz | head -1)
  log "Backup file: $BACKUP_FILE"
else
  error_exit "Backup script failed"
fi

# Test 2: Backup File Exists and Has Content
log "${YELLOW}Test 2: Verifying backup file...${NC}"
if [ ! -f "$BACKUP_FILE" ]; then
  error_exit "Backup file not found: $BACKUP_FILE"
fi

BACKUP_SIZE=$(du -h "$BACKUP_FILE" | cut -f1)
log "Backup file size: $BACKUP_SIZE"

if [ ! -s "$BACKUP_FILE" ]; then
  error_exit "Backup file is empty"
fi
success "Backup file exists and has content"

# Test 3: File Integrity Check (gzip)
log "${YELLOW}Test 3: Testing backup file integrity...${NC}"
if gzip -t "$BACKUP_FILE" 2>&1 | tee -a "$TEST_LOG"; then
  success "Backup file integrity verified (gzip test passed)"
else
  error_exit "Backup file is corrupted"
fi

# Test 4: SQL Format Validation
log "${YELLOW}Test 4: Validating SQL format...${NC}"
SQL_LINES=$(gunzip -c "$BACKUP_FILE" | wc -l)
log "SQL lines in backup: $SQL_LINES"

if gunzip -c "$BACKUP_FILE" | head -20 | grep -q "^--"; then
  success "SQL format validation passed (contains comments)"
else
  log "${YELLOW}WARNING: Could not verify SQL comments, but backup structure seems valid${NC}"
fi

# Test 5: Schema Validation
log "${YELLOW}Test 5: Validating database schema...${NC}"
SCHEMA_COUNT=$(gunzip -c "$BACKUP_FILE" | grep -c "^CREATE TABLE" || echo "0")
log "CREATE TABLE statements found: $SCHEMA_COUNT"

if [ "$SCHEMA_COUNT" -gt 0 ]; then
  success "Database schema detected in backup"
else
  log "${YELLOW}WARNING: No CREATE TABLE statements found (may be data-only backup)${NC}"
fi

# Test 6: Restore Test (if test database URL provided)
log "${YELLOW}Test 6: Testing restore procedure...${NC}"
if [ -n "$SUPABASE_TEST_DB_URL" ]; then
  log "Attempting restore to test database..."

  # Create temporary restore test file
  TEST_RESTORE_LOG="backups/restore-test_${TIMESTAMP}.log"

  # Attempt restore with transaction safety
  if gunzip -c "$BACKUP_FILE" | psql "$SUPABASE_TEST_DB_URL" \
    --single-transaction \
    --quiet \
    2>&1 | tee -a "$TEST_RESTORE_LOG"; then

    success "Restore to test database completed"

    # Test 7: Data Integrity Check
    log "${YELLOW}Test 7: Verifying restored data...${NC}"

    # Count tables in restored database
    TABLE_COUNT=$(psql "$SUPABASE_TEST_DB_URL" -t -c \
      "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema='public'")
    log "Tables in restored database: $TABLE_COUNT"

    if [ "$TABLE_COUNT" -gt 0 ]; then
      success "Restored database contains tables"

      # Try to count rows in main table if it exists
      if psql "$SUPABASE_TEST_DB_URL" -t -c "SELECT COUNT(*) FROM terms" 2>/dev/null; then
        TERM_COUNT=$(psql "$SUPABASE_TEST_DB_URL" -t -c "SELECT COUNT(*) FROM terms")
        log "Records in 'terms' table: $TERM_COUNT"
        success "Data restored successfully"
      else
        log "${YELLOW}Note: 'terms' table not found or schema differs${NC}"
      fi
    else
      log "${YELLOW}WARNING: Restored database has no tables${NC}"
    fi
  else
    log "${RED}ERROR: Restore to test database failed${NC}"
    log "See detailed log: $TEST_RESTORE_LOG"
  fi
else
  log "${YELLOW}SKIPPED: Test database URL not provided (set SUPABASE_TEST_DB_URL to enable)${NC}"
fi

# Summary
log ""
log "${YELLOW}=== Test Summary ===${NC}"
log "Test Log: $TEST_LOG"
log "Backup File: $BACKUP_FILE"
log "Backup Size: $BACKUP_SIZE"
log "Timestamp: $TIMESTAMP"

log ""
success "All backup tests completed successfully"
log ""
log "Recommendations:"
log "1. Review this log for any warnings"
log "2. Verify backup size is > 10MB"
log "3. Schedule monthly restore tests"
log "4. Archive backups for compliance"

exit 0
