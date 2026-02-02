#!/usr/bin/env node

/**
 * Sentry Source Map Upload Script
 * Uploads source maps to Sentry after production build
 * Only runs if VITE_SENTRY_DSN is configured
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { config } from 'dotenv';

// Load environment variables
config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const sentryDsn = process.env.VITE_SENTRY_DSN;
const sentryToken = process.env.SENTRY_AUTH_TOKEN;
const distDir = path.join(__dirname, '..', 'dist');

// If no Sentry DSN, skip upload
if (!sentryDsn) {
  console.log('✓ Sentry DSN not configured. Source maps upload skipped.');
  process.exit(0);
}

// Extract project and org from DSN
// DSN format: https://<key>@<host>/<org-slug>/<project-slug>
try {
  const dsnUrl = new URL(sentryDsn);
  const pathParts = dsnUrl.pathname.split('/').filter(Boolean);
  const org = pathParts[0];
  const project = pathParts[1];

  if (!org || !project) {
    console.warn('⚠ Could not parse Sentry organization and project from DSN');
    process.exit(0);
  }

  // Check if dist folder exists
  if (!fs.existsSync(distDir)) {
    console.warn('⚠ Dist folder not found. Skipping source map upload.');
    process.exit(0);
  }

  console.log('📤 Uploading source maps to Sentry...');

  let sentryCommand = `sentry-cli `;
  if (sentryToken) {
    sentryCommand += `--auth-token ${sentryToken} `;
  }

  sentryCommand += `releases -o ${org} -p ${project} files upload-sourcemaps ${distDir}`;

  try {
    execSync(sentryCommand, {
      stdio: 'inherit',
      cwd: __dirname,
    });
    console.log('✓ Source maps uploaded to Sentry successfully');
  } catch (error) {
    console.warn('⚠ Source map upload failed. Continuing build.');
    console.warn('  Make sure SENTRY_AUTH_TOKEN is set for production builds.');
    // Don't exit with error - build succeeded, just upload failed
    process.exit(0);
  }
} catch (error) {
  console.error('✗ Error during source map upload:', error.message);
  // Don't fail the build if upload fails
  process.exit(0);
}
