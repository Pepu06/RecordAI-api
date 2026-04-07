// Sentry must be initialized before any other require.
// This file is a no-op when SENTRY_DSN or when not in production.
const env = require('./env');

if (env.SENTRY_DSN && env.NODE_ENV === 'production') {
  const Sentry = require('@sentry/node');
  Sentry.init({
    dsn: env.SENTRY_DSN,
    tracesSampleRate: 0.1,
    environment: env.NODE_ENV,
  });
}
