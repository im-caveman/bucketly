// This file configures the initialization of Sentry on the server side.
import * as Sentry from "@sentry/nextjs";

const SENTRY_DSN = process.env.NEXT_PUBLIC_SENTRY_DSN;

Sentry.init({
  dsn: SENTRY_DSN,
  // Adjust this value in production, or use tracesSampler for greater control
  tracesSampleRate: 1.0,
  // Setting this option to true will print useful information to the console while you're setting up Sentry.
  debug: false,
  environment: process.env.NODE_ENV,
  beforeSend(event) {
    // Filter out certain errors in production
    if (process.env.NODE_ENV === 'production') {
      // Filter out client-side JavaScript errors that are not actionable
      if (event.exception) {
        const error = event.exception.values?.[0];
        if (error?.type === 'TypeError' && error?.value?.includes('Cannot read property')) {
          return null; // Ignore common React hydration errors
        }
      }
    }
    return event;
  }
});

export const config = {
  // Capture unhandled exceptions and rejections
  captureUnhandledRejections: true,
};