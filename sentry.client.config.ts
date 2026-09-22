// This file configures the initialization of Sentry on the client.
// The config you add here will be used whenever a users loads a page in their browser.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/tanstackstart-react";

Sentry.init({
  dsn:
    (typeof window !== "undefined"
      ? window.localStorage.getItem("VITE_SENTRY_DSN") || window.localStorage.getItem("SENTRY_DSN")
      : null) ||
    process.env.NEXT_PUBLIC_SENTRY_DSN ||
    process.env.VITE_SENTRY_DSN,

  // Adjust this value in production, or use tracesSampler for greater control
  tracesSampleRate: 1,

  // Setting this option to true will print useful information to the console while you're setting up Sentry.
  debug: false,

  replaysOnErrorSampleRate: 1.0,
  replaysSessionSampleRate: 0.1,
});
