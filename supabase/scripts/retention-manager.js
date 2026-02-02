#!/usr/bin/env node

/**
 * Backup Retention Manager for Desbuquei Database
 * Enforces retention policies and removes old backups
 * 
 * Usage: node retention-manager.js
 */

const fs = require('fs');
const path = require('path');

// Configuration
const CONFIG = {
  backupDir: process.env.BACKUP_DIR || './backups',
  logFile: process.env.LOG_FILE || './backups/retention.log',
  retentionPolicies: {
    hourly: 1,      // 1 day (24 hours)
    daily: 30,      // 30 days
    weekly: 84,     // 84 days (12 weeks)
    monthly: 365,   // 365 days (12 months)
    quarterly: 2555 // 2555 days (7 years)
  },
  minBackupsToKeep: {
    hourly: 3,
    daily: 3,
    weekly: 1,
    monthly: 1,
    quarterly: 1
  }
};

class RetentionManager {
  constructor() {
    this.initializeEnvironment();
  }

  initializeEnvironment() {
    if (!fs.existsSync(CONFIG.backupDir)) {
      fs.mkdirSync(CONFIG.backupDir, { recursive: true });
      this.log(`Created backup directory: ${CONFIG.backupDir}`);
    }
  }

  log(message, level = 'INFO') {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] [${level}] ${message}\n`;
    console.log(logMessage);
    fs.appendFileSync(CONFIG.logFile, logMessage);
  }

  parseBackupDate(filename) {
    // Parse formats like: daily-2026-02-02-020000, hourly-2026-02-02-190000
    const match = filename.match(/^(hourly|daily|weekly|monthly|quarterly)-(\d{4})-(\d{2})-(\d{2})-(\d{6})?/);
    if (!match) return null;
    
    const [, type, year, month, day] = match;
    return {
      type,
      date: new Date(`${year}-${month}-${day}T00:00:00Z`)
    };
  }

  getBackupAge(backupDate) {
    const now = new Date();
    const ageMs = now - backupDate;
    return Math.floor(ageMs / (1000 * 60 * 60 * 24)); // Convert to days
  }

  shouldKeepBackup(filename, type, ageInDays) {
    const maxAge = CONFIG.retentionPolicies[type];
    
    // Never delete if within retention window
    if (ageInDays <= maxAge) {
      return true;
    }
    
    // But keep minimum number of backups even if old
    const minToKeep = CONFIG.minBackupsToKeep[type] || 1;
    if (minToKeep > 0) {
      // This is checked separately by count
      return false;
    }
    
    return false;
  }

  enforceRetention() {
    this.log('='.repeat(60));
    this.log('Starting Retention Policy Enforcement', 'INFO');
    this.log('='.repeat(60));
    
    try {
      const files = fs.readdirSync(CONFIG.backupDir);
      const backups = {};
      let totalDeleted = 0;
      let totalSize = 0;
      
      // Group backups by type
      files.forEach(file => {
        if (!file.endsWith('.sql') && !file.endsWith('.sql.gz')) {
          return; // Skip non-backup files
        }
        
        const parsed = this.parseBackupDate(file);
        if (!parsed) return;
        
        if (!backups[parsed.type]) {
          backups[parsed.type] = [];
        }
        
        const filePath = path.join(CONFIG.backupDir, file);
        const stats = fs.statSync(filePath);
        const ageInDays = this.getBackupAge(parsed.date);
        
        backups[parsed.type].push({
          filename: file,
          path: filePath,
          date: parsed.date,
          ageInDays,
          size: stats.size
        });
      });
      
      // Process each backup type
      Object.entries(backups).forEach(([type, typeBackups]) => {
        // Sort by date descending (newest first)
        typeBackups.sort((a, b) => b.date - a.date);
        
        const maxAge = CONFIG.retentionPolicies[type];
        const minToKeep = CONFIG.minBackupsToKeep[type];
        
        this.log(`\nProcessing ${type} backups: ${typeBackups.length} files, max age: ${maxAge} days, keep min: ${minToKeep}`);
        
        let keptCount = 0;
        typeBackups.forEach((backup, index) => {
          // Keep minimum number regardless of age
          if (index < minToKeep) {
            this.log(`  KEEP [min]: ${backup.filename} (${backup.ageInDays}d old, ${this.formatBytes(backup.size)})`);
            keptCount++;
            return;
          }
          
          // Keep if within retention window
          if (backup.ageInDays <= maxAge) {
            this.log(`  KEEP [policy]: ${backup.filename} (${backup.ageInDays}d old, ${this.formatBytes(backup.size)})`);
            keptCount++;
            return;
          }
          
          // Delete old backup
          try {
            fs.unlinkSync(backup.path);
            totalDeleted++;
            totalSize += backup.size;
            this.log(`  DELETE [old]: ${backup.filename} (${backup.ageInDays}d old, ${this.formatBytes(backup.size)})`, 'WARN');
          } catch (err) {
            this.log(`  FAILED to delete ${backup.filename}: ${err.message}`, 'ERROR');
          }
        });
        
        this.log(`  Summary: Kept ${keptCount}/${typeBackups.length}, deleted ${typeBackups.length - keptCount}`);
      });
      
      this.log(`\n${'='.repeat(60)}`);
      this.log(`Retention enforcement completed`);
      this.log(`Total deleted: ${totalDeleted} files (${this.formatBytes(totalSize)})`, 'SUCCESS');
      this.log(`${'='.repeat(60)}`);
      
      return {
        success: true,
        deleted: totalDeleted,
        freedBytes: totalSize
      };
      
    } catch (error) {
      this.log(`Retention enforcement failed: ${error.message}`, 'ERROR');
      return {
        success: false,
        error: error.message
      };
    }
  }

  formatBytes(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  getDiskUsage() {
    const files = fs.readdirSync(CONFIG.backupDir);
    let totalSize = 0;
    let fileCount = 0;
    
    files.forEach(file => {
      const filePath = path.join(CONFIG.backupDir, file);
      if (fs.statSync(filePath).isFile()) {
        totalSize += fs.statSync(filePath).size;
        fileCount++;
      }
    });
    
    return {
      files: fileCount,
      size: totalSize,
      formatted: this.formatBytes(totalSize)
    };
  }

  generateReport() {
    const usage = this.getDiskUsage();
    
    this.log('\n=== Backup Disk Usage Report ===');
    this.log(`Total files: ${usage.files}`);
    this.log(`Total size: ${usage.formatted}`);
    this.log(`Backup directory: ${CONFIG.backupDir}`);
    this.log(`=================================\n`);
  }
}

// Main
const manager = new RetentionManager();
const result = manager.enforceRetention();
manager.generateReport();

process.exit(result.success ? 0 : 1);
