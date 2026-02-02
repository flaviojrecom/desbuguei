#!/bin/bash

################################################################################
# Backup Utility Functions for Desbuquei Database
# Purpose: Provide reusable functions for backup operations
# Usage: Source this file in other backup scripts
################################################################################

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration (source from environment or .env)
BACKUP_DIR="${BACKUP_DIR:-./backups}"
BACKUP_RETENTION_DAILY="${BACKUP_RETENTION_DAILY:-30}"  # days
BACKUP_RETENTION_HOURLY="${BACKUP_RETENTION_HOURLY:-7}" # days
S3_BUCKET="${S3_BUCKET:-desbuquei-backups}"
S3_REGION="${S3_REGION:-us-east-1}"
LOG_FILE="${LOG_FILE:-${BACKUP_DIR}/backup.log}"

################################################################################
# Utility Functions
################################################################################

# Log message with timestamp
log_info() {
  local msg="$1"
  echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} ${msg}" | tee -a "$LOG_FILE"
}

log_success() {
  local msg="$1"
  echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] ✓${NC} ${msg}" | tee -a "$LOG_FILE"
}

log_error() {
  local msg="$1"
  echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ✗ ERROR${NC}: ${msg}" | tee -a "$LOG_FILE"
}

log_warning() {
  local msg="$1"
  echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] ⚠${NC} ${msg}" | tee -a "$LOG_FILE"
}

# Initialize backup directory and logging
init_backup_env() {
  mkdir -p "$BACKUP_DIR"
  touch "$LOG_FILE"
  log_info "Backup environment initialized: $BACKUP_DIR"
}

# Generate backup ID based on type and timestamp
generate_backup_id() {
  local backup_type="$1"
  local timestamp=$(date +'%Y-%m-%d-%H%M%S')
  echo "${backup_type}-${timestamp}"
}

# Calculate MD5 checksum
calculate_md5() {
  local file="$1"
  if command -v md5sum &> /dev/null; then
    md5sum "$file" | awk '{print $1}'
  elif command -v md5 &> /dev/null; then
    md5 -q "$file"
  else
    log_error "Neither md5sum nor md5 command found"
    return 1
  fi
}

# Calculate SHA256 checksum
calculate_sha256() {
  local file="$1"
  if command -v sha256sum &> /dev/null; then
    sha256sum "$file" | awk '{print $1}'
  elif command -v shasum &> /dev/null; then
    shasum -a 256 "$file" | awk '{print $1}'
  else
    log_error "SHA256 hash command not found"
    return 1
  fi
}

# Get file size in bytes
get_file_size() {
  local file="$1"
  if [[ -f "$file" ]]; then
    stat -f%z "$file" 2>/dev/null || stat -c%s "$file" 2>/dev/null || du -b "$file" | awk '{print $1}'
  else
    echo "0"
  fi
}

# Compress file with gzip
compress_backup() {
  local source="$1"
  local target="${source}.gz"
  
  log_info "Compressing backup: $source"
  gzip -9 -f "$source"
  
  if [[ -f "$target" ]]; then
    log_success "Backup compressed: $target"
    echo "$target"
  else
    log_error "Failed to compress backup"
    return 1
  fi
}

# Upload to S3
upload_to_s3() {
  local file="$1"
  local backup_type="$2"
  
  if ! command -v aws &> /dev/null; then
    log_warning "AWS CLI not found, skipping S3 upload"
    return 0
  fi
  
  local s3_key="${backup_type}/$(basename "$file")"
  local s3_uri="s3://${S3_BUCKET}/${s3_key}"
  
  log_info "Uploading to S3: $s3_uri"
  
  if aws s3 cp "$file" "$s3_uri" --region "$S3_REGION"; then
    log_success "S3 upload completed: $s3_uri"
    echo "$s3_uri"
  else
    log_error "S3 upload failed"
    return 1
  fi
}

# Check disk space
check_disk_space() {
  local threshold="${1:-80}"  # Default 80%
  local usage=$(df "$BACKUP_DIR" | awk 'NR==2 {print $5}' | sed 's/%//')
  
  if [[ $usage -ge $threshold ]]; then
    log_warning "Disk usage at ${usage}% (threshold: ${threshold}%)"
    return 1
  else
    log_info "Disk usage: ${usage}% (OK)"
    return 0
  fi
}

# Cleanup old backups based on retention policy
cleanup_old_backups() {
  local backup_type="$1"
  local retention_days="$2"
  
  log_info "Cleaning up backups older than $retention_days days"
  
  local count=0
  while IFS= read -r file; do
    rm -f "$file"
    log_info "Removed old backup: $(basename "$file")"
    ((count++))
  done < <(find "$BACKUP_DIR" -name "${backup_type}-*" -mtime "+${retention_days}" 2>/dev/null)
  
  log_success "Cleaned up $count old backups"
}

# Verify backup integrity
verify_backup() {
  local backup_file="$1"
  local expected_md5="$2"
  
  if [[ ! -f "$backup_file" ]]; then
    log_error "Backup file not found: $backup_file"
    return 1
  fi
  
  local actual_md5=$(calculate_md5 "$backup_file")
  
  if [[ "$actual_md5" == "$expected_md5" ]]; then
    log_success "Backup integrity verified (MD5 match)"
    return 0
  else
    log_error "Backup integrity check failed (MD5 mismatch)"
    log_error "Expected: $expected_md5"
    log_error "Actual: $actual_md5"
    return 1
  fi
}

# Export functions for use in other scripts
export -f log_info log_success log_error log_warning
export -f init_backup_env generate_backup_id
export -f calculate_md5 calculate_sha256 get_file_size
export -f compress_backup upload_to_s3
export -f check_disk_space cleanup_old_backups verify_backup

log_success "Backup utility functions loaded"
