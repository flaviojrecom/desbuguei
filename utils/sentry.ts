import * as Sentry from '@sentry/react';
import { BrowserTracing } from '@sentry/tracing';
import { getEnv } from './env';

export const initializeSentry = () => {
  const dsn = getEnv('SENTRY_DSN');

  // Only initialize if DSN is provided (typically in production)
  if (!dsn) {
    console.log('Sentry DSN not configured. Error tracking disabled.');
    return;
  }

  Sentry.init({
    dsn,
    environment: import.meta.env.MODE || 'production',
    integrations: [
      new BrowserTracing(),
    ],
    // Performance Monitoring
    tracesSampleRate: import.meta.env.MODE === 'development' ? 1.0 : 0.1,
    // Release tracking
    release: '1.0.0',
    // Error filtering
    beforeSend(event, hint) {
      // Ignore certain errors
      if (event.exception) {
        const error = hint.originalException;
        // Ignore network errors and user-cancelled requests
        if (
          error instanceof Error &&
          (error.message.includes('Network') ||
            error.message.includes('abort') ||
            error.message.includes('Failed to fetch'))
        ) {
          return null;
        }
      }
      return event;
    },
  });
};

// Error boundary wrapper component
export const ErrorBoundary = Sentry.ErrorBoundary;
