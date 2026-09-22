import * as Sentry from "@sentry/tanstackstart-react";
import { QueryClient } from "@tanstack/react-query";
import { createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";

export const getRouter = () => {
  const queryClient = new QueryClient();

  const router = createRouter({
    routeTree,
    context: { queryClient },
    scrollRestoration: true,
    defaultPreloadStaleTime: 0,
  });

  if (!router.isServer) {
    const dsn =
      (typeof window !== "undefined"
        ? window.localStorage.getItem("VITE_SENTRY_DSN") ||
          window.localStorage.getItem("SENTRY_DSN")
        : null) ||
      import.meta.env.VITE_SENTRY_DSN ||
      (typeof process !== "undefined" ? process.env.SENTRY_DSN : undefined);

    if (dsn) {
      Sentry.init({
        dsn,
        integrations: [Sentry.tanstackRouterBrowserTracingIntegration(router)],
        tracesSampleRate: 1.0,
        replaysSessionSampleRate: 0.1,
        replaysOnErrorSampleRate: 1.0,
      });
    }
  }

  return router;
};
