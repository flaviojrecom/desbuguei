#!/bin/bash

###############################################################################
# Database Backup Script
#
# Purpose: Create automated full database dumps using pg_dump
# Usage: ./scripts/db-backup.sh
#
# Features:
# - Full PostgreSQL database backup via pg_dump
# - Automatic compression (.sql.gz)
# - Timestamped filename for version control
# - Stored locally in backups/ directory
# - Exit code indicates success/failure for CI/CD monitoring
#
# Environment Variables Required:
# - SUPABASE_DB_URL: PostgreSQL connection string
#   Format: postgresql://user:password@host:port/database
#
# Examples:
#   export SUPABASE_DB_URL="postgresql://postgres:pass@db.supabase.co:5432/postgres"
#   ./scripts/db-backup.sh
###############################################################################

set -e

# Configuration
BACKUP_DIR="backups"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="${BACKUP_DIR}/backup_${TIMESTAMP}.sql.gz"
LOG_FILE="${BACKUP_DIR}/backup_${TIMESTAMP}.log"

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Logging function
log() {
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

# Error handler
error_exit() {
  log "${RED}ERROR: $1${NC}"
  exit 1
}

# Check prerequisites
log "${YELLOW}Checking prerequisites...${NC}"

if [ ! -d "$BACKUP_DIR" ]; then
  mkdir -p "$BACKUP_DIR"
  log "Created backup directory: $BACKUP_DIR"
fi

if ! command -v pg_dump &> /dev/null; then
  error_exit "pg_dump not found. Install PostgreSQL client tools."
fi

if [ -z "$SUPABASE_DB_URL" ]; then
  error_exit "SUPABASE_DB_URL environment variable not set"
fi

# Perform backup
log "${YELLOW}Starting database backup...${NC}"
log "Backup file: $BACKUP_FILE"

if pg_dump "$SUPABASE_DB_URL" \
  --compress=9 \
  --format=plain \
  --verbose \
  --no-owner \
  --no-privileges \
  2>&1 | tee -a "$LOG_FILE" | gzip > "$BACKUP_FILE"; then

  # Verify backup file exists and has content
  if [ ! -f "$BACKUP_FILE" ] || [ ! -s "$BACKUP_FILE" ]; then
    error_exit "Backup file created but is empty"
  fi

  BACKUP_SIZE=$(du -h "$BACKUP_FILE" | cut -f1)
  log "${GREEN}✓ Backup completed successfully${NC}"
  log "Backup size: $BACKUP_SIZE"
  log "Location: $(realpath $BACKUP_FILE)"

  # Keep only last 30 backups to manage disk space
  log "Cleaning up old backups (keeping last 30)..."
  find "$BACKUP_DIR" -name "backup_*.sql.gz" -type f | \
    sort -r | \
    tail -n +31 | \
    xargs rm -f 2>/dev/null || true

  log "${GREEN}Backup pipeline completed${NC}"
  exit 0
else
  error_exit "Backup failed. Check logs: $LOG_FILE"
fi
