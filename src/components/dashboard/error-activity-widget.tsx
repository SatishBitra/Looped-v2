import { useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Bug,
  RefreshCw,
  Clock,
  Filter,
  Check,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  ShieldAlert,
  ArrowUpRight,
  Sparkles,
} from "lucide-react";
import { Card, SectionTitle, StatusPill } from "@/components/app-shell";
import {
  useErrorActivity,
  AppErrorActivityItem,
  recordErrorActivity,
} from "@/lib/error-activity-store";
import { toast } from "sonner";
import * as Sentry from "@sentry/tanstackstart-react";

export function ErrorActivityWidget() {
  const { errors, updateStatus, clearResolved, resetDefaults } = useErrorActivity();
  const [filter, setFilter] = useState<"all" | "Active" | "Investigating" | "Resolved">("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filtered = errors.filter((e) => {
    if (filter === "all") return true;
    return e.status === filter;
  });

  const activeCount = errors.filter(
    (e) => e.status === "Active" || e.status === "Investigating",
  ).length;
  const resolvedCount = errors.filter((e) => e.status === "Resolved").length;

  const handleSimulateTestError = () => {
    try {
      const err = new Error(
        `Simulated test runtime exception at ${new Date().toLocaleTimeString()}`,
      );
      let sentryId = "";
      try {
        sentryId = Sentry.captureException(err, {
          tags: { source: "dashboard_error_activity_widget" },
        });
      } catch {
        // Fallback
      }

      const item = recordErrorActivity({
        message: err.message,
        source: "Dashboard Diagnostics",
        mechanism: "manual",
        severity: "error",
        status: "Active",
        sentryEventId: sentryId || `sen_${Math.random().toString(36).slice(2, 8)}`,
        details: "User initiated diagnostic test from Error Activity dashboard widget.",
        route: window.location.pathname,
      });

      toast.error("Test Error Recorded in Activity Log", {
        description: `Logged with Sentry & Error store (ID: ${item.id})`,
      });
    } catch (e) {
      toast.error("Failed to simulate test error");
    }
  };

  const getStatusTone = (
    status: AppErrorActivityItem["status"],
  ): "red" | "yellow" | "green" | "neutral" => {
    switch (status) {
      case "Active":
        return "red";
      case "Investigating":
        return "yellow";
      case "Resolved":
        return "green";
      case "Ignored":
        return "neutral";
    }
  };

  return (
    <Card className="p-5 sm:p-6 mb-8 border border-border bg-card">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-3">
          <div
            className={`w-9 h-9 rounded-xl grid place-items-center transition-colors ${
              activeCount > 0
                ? "bg-rose-500/10 text-rose-600 dark:text-rose-400"
                : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
            }`}
          >
            {activeCount > 0 ? (
              <AlertTriangle className="w-4 h-4" strokeWidth={2.2} />
            ) : (
              <CheckCircle2 className="w-4 h-4" strokeWidth={2.2} />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-[16px] font-semibold tracking-tight text-foreground">
                Error Activity
              </h3>
              <span
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold border ${
                  activeCount > 0
                    ? "bg-rose-500/10 text-rose-600 border-rose-500/20"
                    : "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    activeCount > 0 ? "bg-rose-500 animate-pulse" : "bg-emerald-500"
                  }`}
                />
                {activeCount > 0 ? `${activeCount} Active` : "All Healthy"}
              </span>
            </div>
            <p className="text-[12px] text-muted-foreground mt-0.5">
              Live application error telemetry, boundary exceptions, and runtime status
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          <button
            type="button"
            onClick={handleSimulateTestError}
            className="h-8 px-3 rounded-xl bg-foreground text-background text-[11px] font-semibold flex items-center gap-1.5 hover:opacity-90 transition-opacity cursor-pointer shadow-xs"
          >
            <Bug className="w-3.5 h-3.5" />
            <span>Simulate Error</span>
          </button>

          {resolvedCount > 0 && (
            <button
              type="button"
              onClick={() => {
                clearResolved();
                toast.success("Cleared resolved errors from activity list");
              }}
              className="h-8 px-2.5 rounded-xl bg-surface hover:bg-muted border border-border text-[11px] font-medium text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              title="Clear resolved"
            >
              Clear Resolved
            </button>
          )}

          <button
            type="button"
            onClick={() => {
              resetDefaults();
              toast.info("Reset error activity to standard test logs");
            }}
            className="h-8 w-8 rounded-xl bg-surface hover:bg-muted border border-border text-muted-foreground hover:text-foreground grid place-items-center transition-colors cursor-pointer"
            title="Reset to default mock logs"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Filter Tabs & Quick Stats */}
      <div className="flex items-center justify-between border-b border-border pb-3 mb-3 text-xs">
        <div className="flex items-center gap-1">
          {(["all", "Active", "Investigating", "Resolved"] as const).map((tab) => {
            const isSel = filter === tab;
            const count =
              tab === "all" ? errors.length : errors.filter((e) => e.status === tab).length;
            return (
              <button
                key={tab}
                type="button"
                onClick={() => setFilter(tab)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium capitalize transition-all cursor-pointer flex items-center gap-1.5 ${
                  isSel
                    ? "bg-surface text-foreground font-semibold shadow-xs border border-border"
                    : "text-muted-foreground hover:text-foreground hover:bg-surface/50"
                }`}
              >
                <span>{tab === "all" ? "All Activity" : tab}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    isSel ? "bg-foreground/10 text-foreground" : "bg-surface text-muted-foreground"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        <span className="text-[11px] text-muted-foreground hidden sm:inline">
          Persistence: LocalStorage + Sentry
        </span>
      </div>

      {/* Errors List */}
      <div className="divide-y divide-border/60">
        {filtered.length === 0 ? (
          <div className="py-8 text-center">
            <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2 opacity-80" />
            <p className="text-xs font-semibold text-foreground">No errors match this filter</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              The application runtime is running smoothly with 0 matching issues.
            </p>
          </div>
        ) : (
          filtered.map((item) => {
            const isExpanded = expandedId === item.id;
            return (
              <div key={item.id} className="py-3 first:pt-1 last:pb-1 group">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 min-w-0 flex-1">
                    <span
                      className={`mt-1.5 w-2 h-2 rounded-full shrink-0 ${
                        item.status === "Active"
                          ? "bg-rose-500 animate-pulse"
                          : item.status === "Investigating"
                            ? "bg-amber-500"
                            : item.status === "Resolved"
                              ? "bg-emerald-500"
                              : "bg-muted-foreground"
                      }`}
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[13px] font-medium text-foreground leading-snug break-words">
                          {item.message}
                        </span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-surface border border-border text-muted-foreground font-mono shrink-0">
                          {item.source}
                        </span>
                        {item.route && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-surface/70 text-muted-foreground/80 shrink-0">
                            {item.route}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2 mt-1 text-[11px] text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-subtle" />
                          {item.timeFormatted}
                        </span>
                        {item.sentryEventId && (
                          <>
                            <span>•</span>
                            <span className="font-mono text-[10px]">
                              Sentry: {item.sentryEventId}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Status Toggle & Details Button */}
                  <div className="flex items-center gap-2 shrink-0">
                    <div className="relative">
                      <select
                        value={item.status}
                        onChange={(e) => {
                          const newStatus = e.target.value as AppErrorActivityItem["status"];
                          updateStatus(item.id, newStatus);
                          toast.success(`Error status updated to ${newStatus}`);
                        }}
                        className={`text-[11px] font-semibold py-1 px-2.5 rounded-lg border appearance-none pr-6 cursor-pointer outline-none transition-colors ${
                          item.status === "Active"
                            ? "bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-900/50"
                            : item.status === "Investigating"
                              ? "bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-900/50"
                              : item.status === "Resolved"
                                ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-900/50"
                                : "bg-surface text-muted-foreground border-border"
                        }`}
                      >
                        <option value="Active">Active</option>
                        <option value="Investigating">Investigating</option>
                        <option value="Resolved">Resolved</option>
                        <option value="Ignored">Ignored</option>
                      </select>
                      <ChevronDown className="w-3 h-3 text-muted-foreground absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none opacity-60" />
                    </div>

                    <button
                      type="button"
                      onClick={() => setExpandedId(isExpanded ? null : item.id)}
                      className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-surface transition-colors cursor-pointer"
                      title={isExpanded ? "Collapse details" : "Expand details"}
                    >
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Collapsible Details */}
                {isExpanded && (
                  <div className="mt-2.5 ml-5 p-3 rounded-xl bg-surface/70 border border-border/70 text-xs space-y-1.5">
                    <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                      <span>
                        Mechanism: <strong className="text-foreground">{item.mechanism}</strong>
                      </span>
                      <span>
                        Severity:{" "}
                        <strong className="text-foreground capitalize">{item.severity}</strong>
                      </span>
                      <span>
                        Timestamp: <strong>{new Date(item.timestamp).toLocaleString()}</strong>
                      </span>
                    </div>
                    {item.details && (
                      <div className="pt-1 text-[11px] font-mono text-muted-foreground break-all bg-card/60 p-2 rounded-lg border border-border/40">
                        {item.details}
                      </div>
                    )}
                    <div className="flex justify-end gap-2 pt-1">
                      {item.status !== "Resolved" ? (
                        <button
                          type="button"
                          onClick={() => {
                            updateStatus(item.id, "Resolved");
                            toast.success("Marked as resolved");
                          }}
                          className="text-[11px] font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 cursor-pointer"
                        >
                          <Check className="w-3 h-3" /> Mark Resolved
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            updateStatus(item.id, "Active");
                            toast.info("Re-opened error");
                          }}
                          className="text-[11px] font-semibold text-rose-600 hover:text-rose-700 flex items-center gap-1 cursor-pointer"
                        >
                          Re-open
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </Card>
  );
}
