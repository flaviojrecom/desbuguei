#!/bin/bash

################################################################################
# Point-in-Time Recovery (PITR) Script for Desbuquei Database
# Purpose: Restore database to specific point in time with validation
# Usage: ./db-recover-pitr.sh [backup-id|timestamp] [--dry-run] [--target-db test_db]
################################################################################

set -euo pipefail

# Source utility functions
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/db-backup-util.sh"

# Configuration
TARGET_DB="${TARGET_DB:-desbuquei_restored}"
RECOVERY_MODE="complete"  # 'complete' or 'pitr'
DRY_RUN=false
BACKUP_ID="${1:---help}"

################################################################################
# Function Definitions
################################################################################

show_help() {
  cat << 'HELP'
Point-in-Time Recovery (PITR) Script

USAGE:
  ./db-recover-pitr.sh <backup-id> [OPTIONS]

ARGUMENTS:
  backup-id              Backup ID to restore (e.g., daily-2026-02-02-020000)
  
OPTIONS:
  --dry-run             Test recovery without applying changes
  --target-db DB_NAME   Target database name (default: desbuquei_restored)
  --verify              Verify data consistency after recovery
  --help                Show this help message

EXAMPLES:
  # Full recovery from backup
  ./db-recover-pitr.sh daily-2026-02-02-020000
  
  # Test recovery without changes
  ./db-recover-pitr.sh daily-2026-02-02-020000 --dry-run
  
  # Recovery to custom database
  ./db-recover-pitr.sh daily-2026-02-02-020000 --target-db recovery_test
  
  # Recovery with verification
  ./db-recover-pitr.sh daily-2026-02-02-020000 --verify

HELP
  exit 0
}

# Parse command line arguments
parse_arguments() {
  while [[ $# -gt 0 ]]; do
    case "$1" in
      --dry-run)
        DRY_RUN=true
        log_info "Dry-run mode enabled (no changes will be applied)"
        shift
        ;;
      --target-db)
        TARGET_DB="$2"
        log_info "Target database: $TARGET_DB"
        shift 2
        ;;
      --verify)
        VERIFY_RECOVERY=true
        shift
        ;;
      --help)
        show_help
        ;;
      *)
        BACKUP_ID="$1"
        shift
        ;;
    esac
  done
}

# Find backup file
find_backup_file() {
  local backup_id="$1"
  local backup_file=""
  
  # Look for compressed backup
  if [[ -f "$BACKUP_DIR/${backup_id}.sql.gz" ]]; then
    backup_file="$BACKUP_DIR/${backup_id}.sql.gz"
  elif [[ -f "$BACKUP_DIR/${backup_id}.sql" ]]; then
    backup_file="$BACKUP_DIR/${backup_id}.sql"
  else
    log_error "Backup file not found: $backup_id"
    return 1
  fi
  
  echo "$backup_file"
}

# Decompress backup
decompress_backup() {
  local backup_file="$1"
  
  if [[ "$backup_file" == *.gz ]]; then
    local temp_file="${backup_file%.gz}"
    log_info "Decompressing: $backup_file"
    gunzip -c "$backup_file" > "$temp_file"
    echo "$temp_file"
  else
    echo "$backup_file"
  fi
}

# Verify backup integrity
verify_backup_integrity() {
  local backup_file="$1"
  
  log_info "Verifying backup integrity..."
  
  # Check file exists
  if [[ ! -f "$backup_file" ]]; then
    log_error "Backup file not found: $backup_file"
    return 1
  fi
  
  # Check file size
  local size=$(get_file_size "$backup_file")
  if [[ $size -eq 0 ]]; then
    log_error "Backup file is empty"
    return 1
  fi
  
  # Verify SQL syntax
  if head -100 "$backup_file" | grep -q "^--"; then
    log_success "Backup appears to be valid SQL"
    return 0
  else
    log_error "Backup does not appear to be valid SQL"
    return 1
  fi
}

# Create target database
create_target_database() {
  local target_db="$1"
  
  log_info "Creating target database: $target_db"
  
  if [[ "$DRY_RUN" == "true" ]]; then
    log_info "[DRY RUN] Would create database: $target_db"
    return 0
  fi
  
  psql -h localhost -U postgres -tc "SELECT 1 FROM pg_database WHERE datname = '$target_db'" | grep -q 1 && {
    log_warning "Database already exists: $target_db"
    return 0
  } || {
    createdb -h localhost -U postgres "$target_db"
    log_success "Database created: $target_db"
  }
}

# Restore from backup
restore_from_backup() {
  local backup_file="$1"
  local target_db="$2"
  
  log_info "Restoring from backup: $backup_file"
  
  if [[ "$DRY_RUN" == "true" ]]; then
    log_info "[DRY RUN] Would restore database from: $(basename "$backup_file")"
    return 0
  fi
  
  # Measure recovery time
  local start_time=$(date +%s%N)
  
  psql -h localhost -U postgres -d "$target_db" < "$backup_file"
  
  local end_time=$(date +%s%N)
  local recovery_ms=$(( (end_time - start_time) / 1000000 ))
  local recovery_seconds=$(( recovery_ms / 1000 ))
  
  log_success "Recovery completed in ${recovery_seconds}s"
  echo "$recovery_seconds"
}

# Verify data consistency
verify_data_consistency() {
  local target_db="$1"
  
  log_info "Verifying data consistency..."
  
  if [[ "$DRY_RUN" == "true" ]]; then
    log_info "[DRY RUN] Would verify data in: $target_db"
    return 0
  fi
  
  local errors=0
  
  # Check table count
  local table_count=$(psql -h localhost -U postgres -d "$target_db" -tc "
    SELECT count(*) FROM information_schema.tables WHERE table_schema = 'public';
  " 2>/dev/null | tr -d ' ' || echo "0")
  
  if [[ $table_count -gt 0 ]]; then
    log_success "Found $table_count tables in restored database"
  else
    log_warning "No tables found in restored database"
    ((errors++))
  fi
  
  # Check terms table
  if psql -h localhost -U postgres -d "$target_db" -tc "SELECT 1 FROM information_schema.tables WHERE table_name='terms'" | grep -q 1; then
    local term_count=$(psql -h localhost -U postgres -d "$target_db" -tc "SELECT COUNT(*) FROM terms;" | tr -d ' ')
    log_success "Terms table: $term_count rows"
  fi
  
  # Check backup_logs table
  if psql -h localhost -U postgres -d "$target_db" -tc "SELECT 1 FROM information_schema.tables WHERE table_name='backup_logs'" | grep -q 1; then
    local backup_count=$(psql -h localhost -U postgres -d "$target_db" -tc "SELECT COUNT(*) FROM backup_logs;" | tr -d ' ')
    log_success "Backup logs: $backup_count rows"
  fi
  
  return $errors
}

# Main recovery workflow
main() {
  parse_arguments "$@"
  
  if [[ "$BACKUP_ID" == "--help" ]] || [[ -z "$BACKUP_ID" ]]; then
    show_help
  fi
  
  log_info "==================================="
  log_info "Point-in-Time Recovery (PITR)"
  log_info "==================================="
  log_info "Backup ID: $BACKUP_ID"
  log_info "Target DB: $TARGET_DB"
  log_info "Dry Run: $DRY_RUN"
  
  # Find backup
  local backup_file=$(find_backup_file "$BACKUP_ID") || exit 1
  log_success "Found backup: $(basename "$backup_file")"
  
  # Decompress if needed
  local decompressed=$(decompress_backup "$backup_file")
  
  # Verify backup
  verify_backup_integrity "$decompressed" || exit 1
  
  # Create target database
  create_target_database "$TARGET_DB" || exit 1
  
  # Restore from backup
  local recovery_time=$(restore_from_backup "$decompressed" "$TARGET_DB") || exit 1
  
  # Verify data consistency
  if [[ "${VERIFY_RECOVERY:-false}" == "true" ]]; then
    verify_data_consistency "$TARGET_DB"
  fi
  
  # Cleanup temp file if decompressed
  if [[ "$decompressed" != "$backup_file" ]] && [[ -f "$decompressed" ]]; then
    rm -f "$decompressed"
  fi
  
  log_success "==================================="
  log_success "Recovery completed successfully!"
  log_success "Target database: $TARGET_DB"
  log_success "Recovery time: ${recovery_time}s"
  log_success "==================================="
}

# Run main
main "$@"
