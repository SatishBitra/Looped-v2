import { createFileRoute } from "@tanstack/react-router";
import { AppShell, Card } from "@/components/app-shell";
import * as Sentry from "@sentry/tanstackstart-react";
import {
  Bug,
  AlertTriangle,
  CheckCircle2,
  ExternalLink,
  Shield,
  Zap,
  Key,
  RotateCcw,
  Sparkles,
  Info,
} from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/sentry-example-page")({
  component: SentryExamplePage,
});

interface CapturedLog {
  id: string;
  type: "unhandled" | "handled" | "message";
  message: string;
  timestamp: string;
  sentryEventId?: string;
}

function SentryExamplePage() {
  const [dsn, setDsn] = useState("");
  const [isEditingDsn, setIsEditingDsn] = useState(false);
  const [capturedLogs, setCapturedLogs] = useState<CapturedLog[]>([]);

  useEffect(() => {
    const saved =
      (typeof window !== "undefined"
        ? window.localStorage.getItem("VITE_SENTRY_DSN") ||
          window.localStorage.getItem("SENTRY_DSN")
        : null) ||
      import.meta.env.VITE_SENTRY_DSN ||
      "";
    setDsn(saved);
  }, []);

  const handleSaveDsn = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanDsn = dsn.trim();
    if (typeof window !== "undefined") {
      if (cleanDsn) {
        window.localStorage.setItem("VITE_SENTRY_DSN", cleanDsn);
        window.localStorage.setItem("SENTRY_DSN", cleanDsn);
        Sentry.init({
          dsn: cleanDsn,
          tracesSampleRate: 1.0,
          replaysSessionSampleRate: 0.1,
          replaysOnErrorSampleRate: 1.0,
        });
        toast.success("Sentry DSN updated and initialized successfully!");
      } else {
        window.localStorage.removeItem("VITE_SENTRY_DSN");
        window.localStorage.removeItem("SENTRY_DSN");
        toast.info("Cleared custom Sentry DSN.");
      }
    }
    setIsEditingDsn(false);
  };

  // Test 1: Call a function that does not exist (myUndefinedFunction)
  const handleTriggerUndefinedFunction = () => {
    try {
      // Execute the user requested snippet
      // @ts-expect-error intentionally invoking undefined function for Sentry verification
      window.myUndefinedFunction();
    } catch (err: unknown) {
      const error = err as Error;
      const eventId = Sentry.captureException(error);
      const newLog: CapturedLog = {
        id: Math.random().toString(36).slice(2, 9),
        type: "unhandled",
        message: error?.message || "ReferenceError: myUndefinedFunction is not defined",
        timestamp: new Date().toLocaleTimeString(),
        sentryEventId: eventId,
      };
      setCapturedLogs((prev) => [newLog, ...prev]);
      toast.error("Triggered: myUndefinedFunction()! Event sent to Sentry.", {
        description: `Event ID: ${eventId || "captured"}`,
      });
      // Also throw or log to trigger window error listeners
      console.error("Sentry Test Error:", error);
    }
  };

  // Test 2: Standard test error
  const handleTriggerHandledException = () => {
    try {
      throw new Error("Sentry Test Error from looped-v2 (sandesigns)");
    } catch (err: unknown) {
      const error = err as Error;
      const eventId = Sentry.captureException(error, {
        tags: {
          project: "looped-v2",
          org: "sandesigns",
          source: "sentry-example-page",
        },
      });
      const newLog: CapturedLog = {
        id: Math.random().toString(36).slice(2, 9),
        type: "handled",
        message: error.message,
        timestamp: new Date().toLocaleTimeString(),
        sentryEventId: eventId,
      };
      setCapturedLogs((prev) => [newLog, ...prev]);
      toast.success("Captured exception with tags sent to Sentry!", {
        description: `Event ID: ${eventId || "captured"}`,
      });
    }
  };

  // Test 3: Sentry Message
  const handleTriggerMessage = () => {
    const eventId = Sentry.captureMessage(
      "Sentry Verification Ping: sandesigns / looped-v2 operational test",
      "info",
    );
    const newLog: CapturedLog = {
      id: Math.random().toString(36).slice(2, 9),
      type: "message",
      message: "Sentry Verification Ping: sandesigns / looped-v2",
      timestamp: new Date().toLocaleTimeString(),
      sentryEventId: eventId,
    };
    setCapturedLogs((prev) => [newLog, ...prev]);
    toast.info("Logged info message to Sentry!", {
      description: `Event ID: ${eventId || "logged"}`,
    });
  };

  return (
    <AppShell breadcrumb={["Workspace", "Sentry Example Page"]}>
      <div className="max-w-4xl space-y-6 pb-12">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 grid place-items-center">
                <Bug className="w-5 h-5" />
              </div>
              <h1 className="text-2xl sm:text-[28px] font-semibold tracking-tight text-foreground">
                Sentry Example Page
              </h1>
            </div>
            <p className="text-[13px] text-muted-foreground mt-1">
              Verify real-time error tracking and telemetry for organization{" "}
              <strong className="text-foreground font-semibold">sandesigns</strong> and project{" "}
              <strong className="text-foreground font-semibold">looped-v2</strong>.
            </p>
          </div>

          <a
            href="https://sandesigns.sentry.io/issues/?project=looped-v2"
            target="_blank"
            rel="noreferrer"
            className="h-10 px-4 rounded-xl bg-foreground text-background text-xs font-semibold flex items-center gap-2 hover:opacity-90 transition-opacity shrink-0 cursor-pointer shadow-xs"
          >
            <span>Open Sentry Issues</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        {/* Configuration Metadata Card */}
        <Card className="p-5 sm:p-6 border border-border">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-border">
            <div className="flex items-center gap-2.5">
              <Shield className="w-4 h-4 text-emerald-500" />
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Project Target Config
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Sentry Configured
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 text-xs">
            <div>
              <div className="text-[11px] font-semibold text-muted-foreground">Organization</div>
              <div className="font-mono font-bold text-foreground mt-0.5">sandesigns</div>
            </div>
            <div>
              <div className="text-[11px] font-semibold text-muted-foreground">Project Slug</div>
              <div className="font-mono font-bold text-foreground mt-0.5">looped-v2</div>
            </div>
            <div>
              <div className="text-[11px] font-semibold text-muted-foreground">Integration</div>
              <div className="font-medium text-foreground mt-0.5">
                Sentry SaaS (@sentry/tanstackstart-react)
              </div>
            </div>
          </div>

          {/* DSN Configuration Section */}
          <div className="mt-5 pt-4 border-t border-border">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-foreground">
                <Key className="w-3.5 h-3.5 text-muted-foreground" />
                <span>Client Sentry DSN</span>
              </div>
              <button
                type="button"
                onClick={() => setIsEditingDsn(!isEditingDsn)}
                className="text-[11px] text-blue-600 dark:text-blue-400 hover:underline font-medium cursor-pointer"
              >
                {isEditingDsn ? "Cancel" : dsn ? "Change DSN" : "Add DSN Key"}
              </button>
            </div>

            {isEditingDsn ? (
              <form onSubmit={handleSaveDsn} className="flex gap-2">
                <input
                  type="text"
                  placeholder="https://publicKey@o...ingest.us.sentry.io/projectNumber"
                  value={dsn}
                  onChange={(e) => setDsn(e.target.value)}
                  className="flex-1 h-9 px-3 bg-surface border border-border rounded-xl text-xs font-mono text-foreground focus:outline-none focus:border-foreground/30"
                />
                <button
                  type="submit"
                  className="h-9 px-4 rounded-xl bg-foreground text-background text-xs font-semibold hover:opacity-90 transition-opacity cursor-pointer shrink-0"
                >
                  Save & Initialize
                </button>
              </form>
            ) : (
              <div className="p-2.5 rounded-xl bg-surface/60 border border-border/80 flex items-center justify-between text-[11px] font-mono text-muted-foreground truncate">
                <span className="truncate">
                  {dsn || "No custom DSN set (using fallback or local transport)"}
                </span>
                {dsn && (
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-sans font-semibold ml-2 shrink-0">
                    Active
                  </span>
                )}
              </div>
            )}
          </div>
        </Card>

        {/* Trigger Error Testing Actions */}
        <Card className="p-5 sm:p-6 border border-border space-y-5">
          <div>
            <h2 className="text-[15px] font-bold text-foreground">Error Triggering Console</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Click any button below to fire an exception into the Sentry pipeline.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Action 1: undefined function */}
            <button
              type="button"
              onClick={handleTriggerUndefinedFunction}
              className="p-4 rounded-2xl border border-rose-200 dark:border-rose-900/40 bg-rose-50/50 dark:bg-rose-950/20 hover:bg-rose-100/70 dark:hover:bg-rose-900/30 text-left transition-all cursor-pointer group active:scale-[0.98]"
            >
              <div className="w-8 h-8 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 grid place-items-center mb-3">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <div className="text-xs font-bold text-rose-700 dark:text-rose-400">
                Call myUndefinedFunction()
              </div>
              <div className="text-[11px] text-rose-600/80 dark:text-rose-400/80 mt-1">
                Throws a ReferenceError caught by Sentry.
              </div>
            </button>

            {/* Action 2: Handled Sentry exception */}
            <button
              type="button"
              onClick={handleTriggerHandledException}
              className="p-4 rounded-2xl border border-amber-200 dark:border-amber-900/40 bg-amber-50/50 dark:bg-amber-950/20 hover:bg-amber-100/70 dark:hover:bg-amber-900/30 text-left transition-all cursor-pointer group active:scale-[0.98]"
            >
              <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 grid place-items-center mb-3">
                <Zap className="w-4 h-4" />
              </div>
              <div className="text-xs font-bold text-amber-800 dark:text-amber-300">
                Sentry.captureException()
              </div>
              <div className="text-[11px] text-amber-700/80 dark:text-amber-400/80 mt-1">
                Sends custom error tagged with org & project.
              </div>
            </button>

            {/* Action 3: Sentry Message */}
            <button
              type="button"
              onClick={handleTriggerMessage}
              className="p-4 rounded-2xl border border-blue-200 dark:border-blue-900/40 bg-blue-50/50 dark:bg-blue-950/20 hover:bg-blue-100/70 dark:hover:bg-blue-900/30 text-left transition-all cursor-pointer group active:scale-[0.98]"
            >
              <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 grid place-items-center mb-3">
                <Sparkles className="w-4 h-4" />
              </div>
              <div className="text-xs font-bold text-blue-800 dark:text-blue-300">
                Sentry.captureMessage()
              </div>
              <div className="text-[11px] text-blue-700/80 dark:text-blue-400/80 mt-1">
                Sends diagnostic health telemetry ping.
              </div>
            </button>
          </div>

          {/* Code snippet requested by user */}
          <div className="rounded-xl border border-border bg-slate-900 dark:bg-[#121214] text-slate-100 p-4 font-mono text-[11px]">
            <div className="text-slate-400 text-[10px] mb-1 font-sans font-semibold uppercase tracking-wider">
              JavaScript Sample Snippet
            </div>
            <code className="text-rose-400">myUndefinedFunction();</code>
            <div className="text-slate-400 text-[10px] mt-2 font-sans">
              If you see this issue in your{" "}
              <a
                href="https://sandesigns.sentry.io/issues/?project=looped-v2"
                target="_blank"
                rel="noreferrer"
                className="text-blue-400 hover:underline inline-flex items-center gap-0.5"
              >
                Sentry Issues dashboard <ExternalLink className="w-2.5 h-2.5" />
              </a>
              , Sentry is successfully transmitting events!
            </div>
          </div>
        </Card>

        {/* Live Event Log in Session */}
        <Card className="p-5 sm:p-6 border border-border">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Captured Events This Session ({capturedLogs.length})
              </h3>
            </div>
            {capturedLogs.length > 0 && (
              <button
                type="button"
                onClick={() => setCapturedLogs([])}
                className="text-[11px] text-muted-foreground hover:text-foreground flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" /> Clear Log
              </button>
            )}
          </div>

          {capturedLogs.length === 0 ? (
            <div className="text-center py-8 border border-dashed border-border rounded-xl text-xs text-muted-foreground">
              <Info className="w-4 h-4 mx-auto mb-1.5 opacity-60" />
              No events fired yet this session. Click any of the trigger buttons above to test.
            </div>
          ) : (
            <div className="space-y-2">
              {capturedLogs.map((log) => (
                <div
                  key={log.id}
                  className="p-3 rounded-xl border border-border bg-surface/50 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2 py-0.5 text-[9px] font-bold uppercase rounded-md tracking-wider ${
                          log.type === "unhandled"
                            ? "bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20"
                            : log.type === "handled"
                              ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20"
                              : "bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20"
                        }`}
                      >
                        {log.type}
                      </span>
                      <span className="font-semibold text-foreground">{log.message}</span>
                    </div>
                    {log.sentryEventId && (
                      <div className="text-[10px] text-muted-foreground font-mono">
                        Event ID: {log.sentryEventId}
                      </div>
                    )}
                  </div>
                  <div className="text-[11px] text-muted-foreground shrink-0">{log.timestamp}</div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </AppShell>
  );
}
