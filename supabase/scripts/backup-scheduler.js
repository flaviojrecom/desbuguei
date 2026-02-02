#!/usr/bin/env node

/**
 * Backup Scheduler for Desbuquei Database
 * Manages automated hourly and daily backups with scheduling and logging
 * 
 * Usage: node backup-scheduler.js [daily|hourly|once]
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const cron = require('node-cron');

// Configuration
const CONFIG = {
  backupDir: process.env.BACKUP_DIR || './backups',
  logFile: process.env.LOG_FILE || './backups/scheduler.log',
  dbHost: process.env.SUPABASE_HOST || 'localhost',
  dbPort: process.env.SUPABASE_PORT || '5432',
  dbName: process.env.SUPABASE_DB || 'postgres',
  retentionDays: {
    hourly: 1,  // 24 hours
    daily: 30,  // 30 days
    weekly: 84, // 12 weeks
  },
  schedules: {
    daily: '0 2 * * *',   // 2:00 AM UTC
    hourly: '0 * * * *',  // Every hour
  }
};

class BackupScheduler {
  constructor() {
    this.initializeEnvironment();
  }

  initializeEnvironment() {
    // Create backup directory
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

  generateBackupId(type) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '').split('T')[0];
    const time = new Date().toISOString().split('T')[1].split('Z')[0].replace(/[:]/g, '');
    return `${type}-${timestamp}-${time}`;
  }

  async performBackup(type = 'daily') {
    const backupId = this.generateBackupId(type);
    const backupFile = path.join(CONFIG.backupDir, `${backupId}.sql`);
    const compressedFile = `${backupFile}.gz`;
    
    try {
      this.log(`Starting ${type} backup: ${backupId}`);

      // Generate pg_dump command
      const pgDumpCmd = `pg_dump --host=${CONFIG.dbHost} --port=${CONFIG.dbPort} --username=postgres --dbname=${CONFIG.dbName} --format=plain > "${backupFile}"`;
      
      this.log(`Executing backup: pg_dump...`);
      execSync(pgDumpCmd, { stdio: 'pipe' });
      
      if (!fs.existsSync(backupFile)) {
        throw new Error('Backup file was not created');
      }

      const fileSize = fs.statSync(backupFile).size;
      this.log(`Backup created successfully: ${fileSize} bytes`, 'SUCCESS');

      // Compress backup
      this.log(`Compressing backup...`);
      execSync(`gzip -9 -f "${backupFile}"`);
      
      if (fs.existsSync(compressedFile)) {
        const compressedSize = fs.statSync(compressedFile).size;
        const ratio = ((1 - compressedSize / fileSize) * 100).toFixed(2);
        this.log(`Backup compressed: ${compressedSize} bytes (${ratio}% compression)`, 'SUCCESS');
      }

      // Calculate checksums
      const md5 = this.calculateHash('md5', compressedFile);
      const sha256 = this.calculateHash('sha256', compressedFile);
      
      this.log(`MD5: ${md5}`);
      this.log(`SHA256: ${sha256}`);

      // Log backup metadata
      this.logBackupMetadata({
        backup_id: backupId,
        backup_type: type,
        backup_timestamp: new Date().toISOString(),
        backup_size_bytes: compressedSize,
        checksum_md5: md5,
        checksum_sha256: sha256,
        location_local: compressedFile,
        status: 'completed'
      });

      return {
        success: true,
        backupId,
        file: compressedFile,
        size: compressedSize,
        md5,
        sha256
      };

    } catch (error) {
      this.log(`Backup failed: ${error.message}`, 'ERROR');
      return {
        success: false,
        error: error.message
      };
    }
  }

  calculateHash(algorithm, file) {
    const crypto = require('crypto');
    const content = fs.readFileSync(file);
    return crypto.createHash(algorithm).update(content).digest('hex');
  }

  logBackupMetadata(metadata) {
    const metadataFile = path.join(CONFIG.backupDir, 'backup-metadata.jsonl');
    fs.appendFileSync(metadataFile, JSON.stringify(metadata) + '\n');
  }

  cleanupOldBackups(type, retentionDays) {
    const now = Date.now();
    const files = fs.readdirSync(CONFIG.backupDir);
    
    let cleaned = 0;
    files.forEach(file => {
      if (file.startsWith(`${type}-`)) {
        const filePath = path.join(CONFIG.backupDir, file);
        const fileTime = fs.statSync(filePath).mtime.getTime();
        const ageInDays = (now - fileTime) / (1000 * 60 * 60 * 24);
        
        if (ageInDays > retentionDays) {
          fs.unlinkSync(filePath);
          this.log(`Removed old backup: ${file}`);
          cleaned++;
        }
      }
    });
    
    if (cleaned > 0) {
      this.log(`Cleanup completed: removed ${cleaned} old backups`, 'SUCCESS');
    }
  }

  scheduleDailyBackup() {
    this.log(`Scheduling daily backup at ${CONFIG.schedules.daily}`);
    cron.schedule(CONFIG.schedules.daily, () => {
      this.log('Executing scheduled daily backup');
      this.performBackup('daily');
      this.cleanupOldBackups('daily', CONFIG.retentionDays.daily);
    });
  }

  scheduleHourlyBackup() {
    this.log(`Scheduling hourly backup at ${CONFIG.schedules.hourly}`);
    cron.schedule(CONFIG.schedules.hourly, () => {
      this.log('Executing scheduled hourly backup');
      this.performBackup('hourly');
      this.cleanupOldBackups('hourly', CONFIG.retentionDays.hourly);
    });
  }

  async runOnce(type) {
    const result = await this.performBackup(type);
    if (result.success) {
      this.log(`${type} backup completed successfully`, 'SUCCESS');
      this.cleanupOldBackups(type, CONFIG.retentionDays[type]);
    } else {
      this.log(`${type} backup failed`, 'ERROR');
      process.exit(1);
    }
  }

  start(mode = 'all') {
    this.log('='.repeat(60));
    this.log('Backup Scheduler Started', 'INFO');
    this.log('='.repeat(60));
    
    if (mode === 'daily' || mode === 'all') {
      this.scheduleDailyBackup();
    }
    if (mode === 'hourly' || mode === 'all') {
      this.scheduleHourlyBackup();
    }
    
    this.log('Scheduler is running. Press Ctrl+C to stop.');
  }
}

// Main
const scheduler = new BackupScheduler();
const arg = process.argv[2] || 'all';

if (arg === 'once') {
  const type = process.argv[3] || 'daily';
  scheduler.runOnce(type);
} else {
  scheduler.start(arg);
}
