import { useState, useEffect } from "react";
import * as Sentry from "@sentry/tanstackstart-react";

export interface AppErrorActivityItem {
  id: string;
  timestamp: number;
  timeFormatted: string;
  message: string;
  source: string;
  mechanism:
    | "react_error_boundary"
    | "sentry"
    | "window_onerror"
    | "unhandledrejection"
    | "manual"
    | "network";
  severity: "error" | "warning" | "critical" | "info";
  status: "Active" | "Investigating" | "Resolved" | "Ignored";
  sentryEventId?: string;
  details?: string;
  route?: string;
}

const STORAGE_KEY = "looped_error_activity_v1";

const INITIAL_ERRORS: AppErrorActivityItem[] = [
  {
    id: "err-init-1",
    timestamp: Date.now() - 1000 * 60 * 18,
    timeFormatted: "18m ago",
    message: "Figma asset preview thumbnail 404 on /deliverables/banner-v2.fig",
    source: "Asset Loader",
    mechanism: "network",
    severity: "warning",
    status: "Investigating",
    route: "/approvals",
    details: "Failed to resolve CDN thumbnail. Fallback icon rendered successfully.",
  },
  {
    id: "err-init-2",
    timestamp: Date.now() - 1000 * 60 * 45,
    timeFormatted: "45m ago",
    message: "WebSocket heartbeat delay on /api/messages socket channel",
    source: "Messenger Client",
    mechanism: "network",
    severity: "warning",
    status: "Resolved",
    route: "/messages",
    details: "Reconnected automatically after 320ms jitter latency.",
  },
  {
    id: "err-init-3",
    timestamp: Date.now() - 1000 * 60 * 120,
    timeFormatted: "2h ago",
    message: "Sentry telemetry heartbeat check: Handled verification event",
    source: "Sentry Telemetry",
    mechanism: "sentry",
    severity: "info",
    status: "Resolved",
    sentryEventId: "sen_9b83f019",
    route: "/settings",
    details: "Operational verification ping captured with zero downtime.",
  },
  {
    id: "err-init-4",
    timestamp: Date.now() - 1000 * 60 * 360,
    timeFormatted: "6h ago",
    message: "Hydration mismatch recovered on dark mode root preference",
    source: "React Error Boundary",
    mechanism: "react_error_boundary",
    severity: "info",
    status: "Resolved",
    route: "/dashboard",
    details: "Theme sync adjusted server-rendered markup to client preference.",
  },
];

type Listener = () => void;
const listeners = new Set<Listener>();

function notify() {
  listeners.forEach((cb) => {
    try {
      cb();
    } catch (e) {
      console.error("Error in error-activity listener", e);
    }
  });
}

export function getErrorActivity(): AppErrorActivityItem[] {
  if (typeof window === "undefined") return INITIAL_ERRORS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_ERRORS));
      return INITIAL_ERRORS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : INITIAL_ERRORS;
  } catch {
    return INITIAL_ERRORS;
  }
}

export function recordErrorActivity(
  item: Partial<AppErrorActivityItem> & { message: string },
): AppErrorActivityItem {
  const current = getErrorActivity();
  const id = item.id || `err-${Math.random().toString(36).slice(2, 9)}`;
  const now = Date.now();

  const newItem: AppErrorActivityItem = {
    id,
    timestamp: now,
    timeFormatted: "Just now",
    message: item.message,
    source: item.source || "Application Core",
    mechanism: item.mechanism || "manual",
    severity: item.severity || "error",
    status: item.status || "Active",
    sentryEventId: item.sentryEventId,
    details: item.details,
    route: item.route || (typeof window !== "undefined" ? window.location.pathname : "/"),
  };

  const updated = [newItem, ...current.filter((e) => e.id !== id)].slice(0, 50);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error("Failed to persist error activity", e);
  }
  notify();
  return newItem;
}

export function updateErrorStatus(id: string, newStatus: AppErrorActivityItem["status"]): void {
  const current = getErrorActivity();
  const updated = current.map((e) => (e.id === id ? { ...e, status: newStatus } : e));
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error("Failed to update error status", e);
  }
  notify();
}

export function clearResolvedErrors(): void {
  const current = getErrorActivity();
  const updated = current.filter((e) => e.status !== "Resolved");
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error("Failed to clear resolved errors", e);
  }
  notify();
}

export function resetDefaultErrorActivity(): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_ERRORS));
  } catch (e) {
    console.error("Failed to reset error activity", e);
  }
  notify();
}

// Hook for React components
export function useErrorActivity() {
  const [errors, setErrors] = useState<AppErrorActivityItem[]>(() => getErrorActivity());

  useEffect(() => {
    const handleUpdate = () => {
      setErrors(getErrorActivity());
    };
    listeners.add(handleUpdate);

    // Also listen to storage events from other tabs
    const handleStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) {
        setErrors(getErrorActivity());
      }
    };
    window.addEventListener("storage", handleStorage);

    return () => {
      listeners.delete(handleUpdate);
      window.removeEventListener("storage", handleStorage);
    };
  }, []);

  return {
    errors,
    recordError: recordErrorActivity,
    updateStatus: updateErrorStatus,
    clearResolved: clearResolvedErrors,
    resetDefaults: resetDefaultErrorActivity,
  };
}

// Global browser listeners initialization
if (typeof window !== "undefined") {
  window.addEventListener("error", (event) => {
    try {
      const msg =
        event.message || (event.error instanceof Error ? event.error.message : String(event.error));
      if (!msg) return;
      recordErrorActivity({
        message: msg,
        source: "Window Runtime",
        mechanism: "window_onerror",
        severity: "error",
        status: "Active",
        details: event.filename ? `${event.filename}:${event.lineno}:${event.colno}` : undefined,
      });
    } catch {
      // Safe fallback
    }
  });

  window.addEventListener("unhandledrejection", (event) => {
    try {
      const reason = event.reason;
      const msg = reason instanceof Error ? reason.message : String(reason);
      if (!msg || msg === "undefined") return;
      recordErrorActivity({
        message: `Unhandled Promise Rejection: ${msg}`,
        source: "Promise Runtime",
        mechanism: "unhandledrejection",
        severity: "warning",
        status: "Investigating",
      });
    } catch {
      // Safe fallback
    }
  });
}
