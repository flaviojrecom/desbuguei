# Sentry Error Tracking Setup - Desbuquei

## Overview

Desbuquei uses **Sentry** for production error tracking, monitoring, and alerting. All unhandled errors are automatically captured and reported in real-time.

## Configuration

### 1. Get Sentry DSN

1. Go to [sentry.io](https://sentry.io) and create a free account (if not already created)
2. Create a new project:
   - Organization: Create or select your organization
   - Platform: Select "React"
3. Copy the **DSN** (Data Source Name) from the project settings

### 2. Configure Environment Variables

Add to `.env.local`:

```bash
VITE_SENTRY_DSN=https://<key>@<host>/<org>/<project>
```

Example:
```bash
VITE_SENTRY_DSN=https://abc123@o123456.ingest.sentry.io/123456
```

### 3. (Production Only) Configure Auth Token for Source Map Upload

For production builds with source map upload:

```bash
SENTRY_AUTH_TOKEN=your-sentry-auth-token
```

Get auth token from: Sentry Dashboard → Settings → Auth Tokens

## How It Works

### Error Capture

1. **Automatic Capture**: All unhandled JavaScript errors are automatically captured
2. **Error Boundary**: React errors in components are caught by the Error Boundary
3. **Network Errors**: Network failures and API errors are tracked
4. **Performance Monitoring**: Page load times, transaction performance monitored
5. **Session Replay**: User sessions recorded for debugging context

### Error Filtering

The following errors are **ignored** (not sent to Sentry):
- Network connection errors
- Aborted requests (user navigated away)
- Failed fetch requests (generic network errors)

### Source Maps

Source maps are automatically generated during build and uploaded to Sentry. This allows:
- Stack traces show original source code (not minified)
- Better error diagnosis in production
- Line numbers correspond to actual source files

## Using Sentry Dashboard

### View Errors

1. Go to [sentry.io](https://sentry.io)
2. Select your organization and project
3. Click "Issues" to see all errors
4. Click on an error to see:
   - Full stack trace
   - Browser and device info
   - User information (if available)
   - Session replay (if available)
   - Breadcrumbs (user actions leading to error)

### Create Alerts

1. Go to Project Settings → Alerts
2. Click "Create Alert Rule"
3. Set trigger conditions:
   - Error count threshold
   - Error rate threshold
   - Time window
4. Set notification channel:
   - Email
   - Slack (integration required)
   - Discord
   - PagerDuty

### Example Alert

**Trigger**: New issue created
**Condition**: First occurrence in project
**Notify**: Send email to team@example.com

## Monitoring Best Practices

### Production Monitoring

- **Daily Reviews**: Check Sentry dashboard daily for new issues
- **Alert on Critical**: Set up alerts for CRITICAL level errors
- **Track Trends**: Monitor error counts and trends over time
- **User Impact**: Note which users are affected by each error

### Error Response Runbook

When a critical error is detected:

1. **Check Sentry Dashboard**
   - View error details and stack trace
   - Check affected user count
   - Review session replay

2. **Investigate Root Cause**
   - Check error message and stack trace
   - Look at browser/device information
   - Review recent code changes

3. **Respond**
   - Create bug ticket in backlog
   - If critical: Deploy hotfix
   - If minor: Add to sprint backlog

4. **Document**
   - Add note to error in Sentry
   - Update team on Slack/email
   - Create post-mortem if critical

## Development Workflow

### Local Development

Sentry is **disabled** in development (no error reporting). To test locally:

```bash
VITE_SENTRY_DSN=https://YOUR_DSN@o123456.ingest.sentry.io/123456 npm run dev
```

### Testing Error Capture

1. In browser console, trigger an error:
   ```javascript
   throw new Error('Test error');
   ```

2. Or use Sentry's capture function:
   ```javascript
   import * as Sentry from '@sentry/react';
   Sentry.captureException(new Error('Test error'));
   ```

3. Check Sentry dashboard → Issues for the error

### Production Build

The build process automatically:
1. Generates source maps
2. Uploads source maps to Sentry
3. Minifies code (source maps needed for readability)

## Configuration Reference

### Files Modified

- **App.tsx**: Added Sentry initialization and error boundary
- **utils/sentry.ts**: Sentry configuration module
- **utils/env.ts**: Added SENTRY_DSN environment variable
- **vite.config.ts**: Enabled source map generation
- **package.json**: Added Sentry CLI and build script
- **scripts/sentry-upload.js**: Source map upload script

### Environment Variables

| Variable | Purpose | Required | Example |
|----------|---------|----------|---------|
| VITE_SENTRY_DSN | Sentry project DSN | No (dev) | https://abc@o123.ingest.sentry.io/123 |
| SENTRY_AUTH_TOKEN | Auth token for uploads | Prod only | sntrys_aaaabbbbcccc |

### Performance Settings

- **Tracing Sample Rate**: 100% in dev, 10% in prod (adjust as needed)
- **Replay Sample Rate**: 10% of all sessions
- **Replay on Error**: 100% of error sessions

## Troubleshooting

### Source Maps Not Uploading

1. Check SENTRY_AUTH_TOKEN is set
2. Verify DSN is correct
3. Check Sentry organization/project slugs in DSN
4. Run: `sentry-cli --auth-token YOUR_TOKEN releases -o org -p project files list`

### Errors Not Appearing in Sentry

1. Check VITE_SENTRY_DSN is set in `.env.local`
2. Verify DSN is correct in Sentry dashboard
3. Check browser console for Sentry errors
4. Make sure error is not in the filtered list (network errors, etc.)

### Too Many Errors Being Captured

1. Adjust `beforeSend` filter in `utils/sentry.ts`
2. Increase `replaysSessionSampleRate` to 0.05
3. Decrease `tracesSampleRate` to 0.05

## Resources

- [Sentry React Documentation](https://docs.sentry.io/platforms/javascript/guides/react/)
- [Sentry Dashboard](https://sentry.io)
- [Source Maps Guide](https://docs.sentry.io/product/source-maps/)

---

**Last Updated**: 2026-02-02
**Maintained By**: DevOps Team
