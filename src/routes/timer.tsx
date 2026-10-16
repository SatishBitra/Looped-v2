import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AppShell, Card, StatusPill } from "@/components/app-shell";
import {
  Clock,
  Play,
  Pause,
  Square,
  Plus,
  RotateCcw,
  AlertTriangle,
  CheckCircle2,
  Briefcase,
  Volume2,
  Calendar,
  Sparkles,
  ArrowRight,
  FileText,
  Layers,
  History,
} from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "motion/react";
import { ActiveTimerSession, formatTimeParts } from "@/components/capacity/types";
import { playCapacityAlertChime } from "@/components/capacity/audio-chime";

export const Route = createFileRoute("/timer")({
  component: TimerPage,
});

interface LoggedTimeRecord {
  id: string;
  taskTitle: string;
  client: string;
  hours: number;
  timeFormatted: string;
  timestamp: string;
  notes?: string;
}

const DEFAULT_SESSION: ActiveTimerSession = {
  taskId: "t1",
  taskTitle: "Q4 Brand Campaign Spreads",
  client: "Meridian Luxury",
  department: "Typography & Print",
  priority: "HIGH",
  initialHours: 2.0,
  totalSecondsAllocated: 7200,
  secondsRemaining: 7199,
  secondsElapsed: 1,
  isRunning: true,
  isPaused: false,
  isCompleted: false,
  extendedMinutes: 0,
  startedAt: Date.now(),
};

const SAMPLE_TASKS = [
  {
    id: "t1",
    title: "Q4 Brand Campaign Spreads",
    client: "Meridian Luxury",
    dept: "Typography & Print",
    hours: 2.0,
  },
  {
    id: "t2",
    title: "Podcast Cover Art System v2",
    client: "Loop Studios",
    dept: "Brand Design",
    hours: 1.5,
  },
  {
    id: "t3",
    title: "Website Viewport Prototype",
    client: "Northwind",
    dept: "UI / WebGL",
    hours: 3.0,
  },
  {
    id: "t4",
    title: "Onboarding Flow Copy Package",
    client: "Helix Health",
    dept: "Copywriting",
    hours: 1.0,
  },
];

function TimerPage() {
  const navigate = useNavigate();
  const [mounted, setMounted] = useState(false);

  // Active Timer Session initialized from localStorage
  const [session, setSession] = useState<ActiveTimerSession>(() => {
    if (typeof window === "undefined") return DEFAULT_SESSION;
    try {
      const saved = localStorage.getItem("looped_active_timer_session");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed.secondsRemaining === "number") {
          return parsed;
        }
      }
    } catch {
      // fallback
    }
    return DEFAULT_SESSION;
  });

  const [sessionNotes, setSessionNotes] = useState("");
  const [loggedHistory, setLoggedHistory] = useState<LoggedTimeRecord[]>([
    {
      id: "log-1",
      taskTitle: "Design System Token Tree",
      client: "Internal Core",
      hours: 1.5,
      timeFormatted: "1h 30m",
      timestamp: "Today, 10:45 AM",
      notes: "Configured color semantic ramp and export tokens.",
    },
    {
      id: "log-2",
      taskTitle: "Northwind Wireframes Feedback",
      client: "Northwind",
      hours: 0.8,
      timeFormatted: "48m",
      timestamp: "Today, 9:15 AM",
      notes: "Addressed comments on hero typography spacing.",
    },
  ]);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Save session state to localStorage
  useEffect(() => {
    if (!mounted) return;
    try {
      localStorage.setItem("looped_active_timer_session", JSON.stringify(session));
    } catch {
      // ignore
    }
  }, [session, mounted]);

  // Tick interval for countdown timer
  useEffect(() => {
    if (!session.isRunning || session.isPaused) return;

    const interval = setInterval(() => {
      setSession((prev) => {
        if (!prev.isRunning || prev.isPaused) return prev;

        const nextRemaining = prev.secondsRemaining - 1;
        const nextElapsed = prev.secondsElapsed + 1;

        if (nextRemaining <= 0) {
          playCapacityAlertChime();
          toast.warning(`Capacity limit reached for "${prev.taskTitle}"!`, {
            description: "Allocated task capacity has completed (00:00:00).",
          });
          return {
            ...prev,
            secondsRemaining: 0,
            secondsElapsed: nextElapsed,
            isRunning: false,
            isCompleted: true,
          };
        }

        return {
          ...prev,
          secondsRemaining: nextRemaining,
          secondsElapsed: nextElapsed,
        };
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [session.isRunning, session.isPaused]);

  // Controls
  const handleTogglePlayPause = () => {
    setSession((prev) => {
      const willPause = !prev.isPaused;
      if (willPause) {
        toast.info(`Paused timer for ${prev.taskTitle}`);
      } else {
        toast.info(`Resumed timer for ${prev.taskTitle}`);
      }
      return {
        ...prev,
        isPaused: willPause,
        isRunning: true,
      };
    });
  };

  const handleExtendTimer = (minutes: number) => {
    const additionalSec = minutes * 60;
    setSession((prev) => {
      toast.success(`Extended timer by +${minutes} minutes`);
      return {
        ...prev,
        totalSecondsAllocated: prev.totalSecondsAllocated + additionalSec,
        secondsRemaining: prev.secondsRemaining + additionalSec,
        extendedMinutes: (prev.extendedMinutes || 0) + minutes,
        isRunning: true,
        isCompleted: false,
      };
    });
  };

  const handleResetTimer = () => {
    setSession((prev) => {
      toast.info(`Reset timer to initial ${prev.initialHours} hours`);
      return {
        ...prev,
        secondsRemaining: prev.initialHours * 3600,
        secondsElapsed: 0,
        isRunning: true,
        isPaused: false,
        isCompleted: false,
        extendedMinutes: 0,
      };
    });
  };

  const handleStopAndLog = () => {
    const loggedHours = Math.max(0.1, Number((session.secondsElapsed / 3600).toFixed(2)));
    const parts = formatTimeParts(session.secondsElapsed);

    const record: LoggedTimeRecord = {
      id: "log-" + Date.now(),
      taskTitle: session.taskTitle,
      client: session.client,
      hours: loggedHours,
      timeFormatted: `${parts.hoursStr}h ${parts.minutesStr}m`,
      timestamp: "Just now",
      notes: sessionNotes.trim() || "Capacity work completed.",
    };

    setLoggedHistory((prev) => [record, ...prev]);
    toast.success(`Logged ${loggedHours} hrs for "${session.taskTitle}"!`);

    // Reset notes
    setSessionNotes("");

    // Reset timer to paused state
    setSession((prev) => ({
      ...prev,
      secondsRemaining: prev.initialHours * 3600,
      secondsElapsed: 0,
      isRunning: false,
      isPaused: true,
      isCompleted: false,
      extendedMinutes: 0,
    }));
  };

  const handleSwitchTask = (task: (typeof SAMPLE_TASKS)[0]) => {
    if (session.taskId === task.id) return;

    setSession({
      taskId: task.id,
      taskTitle: task.title,
      client: task.client,
      department: task.dept,
      initialHours: task.hours,
      totalSecondsAllocated: task.hours * 3600,
      secondsRemaining: task.hours * 3600 - 1,
      secondsElapsed: 1,
      isRunning: true,
      isPaused: false,
      isCompleted: false,
      extendedMinutes: 0,
      startedAt: Date.now(),
    });

    toast.info(`Switched timer to ${task.title}`);
  };

  const remaining = formatTimeParts(session.secondsRemaining);
  const elapsed = formatTimeParts(session.secondsElapsed);

  const progressRatio =
    session.totalSecondsAllocated > 0
      ? Math.max(0, Math.min(1, session.secondsRemaining / session.totalSecondsAllocated))
      : 0;

  const size = 300;
  const strokeWidth = 12;
  const center = size / 2;
  const radius = center - strokeWidth - 10;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - progressRatio);

  const isTimeUp = session.secondsRemaining <= 0;
  const isWarning = progressRatio <= 0.2 && !isTimeUp;

  const statusColor = isTimeUp
    ? "text-[#E4664F] stroke-[#E4664F]"
    : isWarning
      ? "text-[#D79A2C] stroke-[#D79A2C]"
      : "text-[#33A579] stroke-[#33A579]";

  return (
    <AppShell breadcrumb={["Workspace", "Capacity Timer"]}>
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-7">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Capacity Management
            </span>
            <span className="text-border">•</span>
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${
                isTimeUp
                  ? "bg-rose-500/10 text-rose-600 border-rose-500/20"
                  : session.isPaused
                    ? "bg-amber-500/10 text-amber-600 border-amber-500/20"
                    : "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  isTimeUp
                    ? "bg-rose-500 animate-ping"
                    : session.isPaused
                      ? "bg-amber-500"
                      : "bg-emerald-500 animate-pulse"
                }`}
              />
              {isTimeUp ? "Time Reached" : session.isPaused ? "Paused" : "Running"}
            </span>
          </div>
          <h1 className="text-2xl sm:text-[32px] font-semibold tracking-tight text-foreground">
            Capacity Timer
          </h1>
          <p className="text-[14px] text-muted-foreground mt-1">
            Live task countdown timer · counts backward from allocated capacity hours to zero
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => playCapacityAlertChime()}
            className="h-10 px-3.5 rounded-[18px] bg-card border border-border text-[13px] font-medium flex items-center gap-2 text-foreground hover:bg-surface cursor-pointer shadow-2xs"
            title="Test alert sound chime"
          >
            <Volume2 className="w-4 h-4 text-muted-foreground" />
            <span>Test Sound</span>
          </button>
          <button
            type="button"
            onClick={() => navigate({ to: "/home" })}
            className="h-10 px-4 rounded-[18px] bg-foreground text-background text-[13px] font-medium flex items-center gap-2 hover:opacity-90 cursor-pointer shadow-xs"
          >
            <span>Back to Dashboard</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Clock Timer Card + Sidebar Context */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-7">
        {/* Left: Redesigned Clock Timer Card (8 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <Card className="p-7 sm:p-9 rounded-[36px] border border-border bg-card shadow-sm relative overflow-hidden text-center select-none">
            {/* Ambient Radial Glow */}
            <div
              className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full blur-[100px] pointer-events-none opacity-20 dark:opacity-15 transition-all ${
                isTimeUp ? "bg-rose-500" : session.isPaused ? "bg-amber-500" : "bg-emerald-500"
              }`}
            />

            {/* Task Context Strip */}
            <div className="flex items-center justify-between pb-5 border-b border-border/80 text-xs text-muted-foreground relative z-10">
              <div className="flex items-center gap-2 truncate">
                <Briefcase className="w-4 h-4 text-foreground/80 shrink-0" />
                <span className="font-semibold text-foreground text-sm">{session.client}</span>
                <span>•</span>
                <span>{session.department}</span>
              </div>
              <div className="font-mono text-xs px-2.5 py-1 rounded-lg bg-surface border border-border/60 text-foreground">
                Allocated: {session.initialHours}h
              </div>
            </div>

            {/* Task Title Heading */}
            <div className="mt-6 mb-2 relative z-10">
              <h2 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight">
                {session.taskTitle}
              </h2>
            </div>

            {/* Time's Up Alert */}
            <AnimatePresence>
              {isTimeUp && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-4 p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/25 flex items-center justify-center gap-2 text-rose-600 dark:text-rose-400 text-xs font-semibold relative z-10"
                >
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>
                    Allocated capacity ({session.initialHours}h) completed! Extend or log your
                    hours.
                  </span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Central Circular Progress Clock */}
            <div className="flex flex-col items-center justify-center my-6 relative z-10">
              <div className="relative w-[300px] h-[300px] flex items-center justify-center">
                <svg className="w-full h-full -rotate-90 transform" viewBox={`0 0 ${size} ${size}`}>
                  {/* Track */}
                  <circle
                    cx={center}
                    cy={center}
                    r={radius}
                    className="stroke-[#E7E7EC] dark:stroke-[#323238]"
                    strokeWidth={strokeWidth}
                    fill="transparent"
                  />
                  {/* Progress Arc */}
                  <circle
                    cx={center}
                    cy={center}
                    r={radius}
                    className={`${statusColor} transition-all duration-700 ease-out`}
                    strokeWidth={strokeWidth}
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    fill="transparent"
                  />
                </svg>

                {/* Digits Display: HH:MM:SS */}
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <span className="text-[11px] font-bold tracking-widest uppercase text-muted-foreground mb-2">
                    Remaining Capacity
                  </span>

                  <div className="flex items-baseline justify-center text-[48px] sm:text-[54px] font-mono font-bold tracking-tight text-foreground tabular-nums leading-none">
                    <span>{remaining.hoursStr}</span>
                    <span className="text-muted-foreground/40 mx-1 animate-pulse">:</span>
                    <span>{remaining.minutesStr}</span>
                    <span className="text-muted-foreground/40 mx-1 animate-pulse">:</span>
                    <span>{remaining.secondsStr}</span>
                  </div>

                  <span className="text-xs text-muted-foreground mt-3 font-mono">
                    {Math.round(progressRatio * 100)}% remaining ({elapsed.fullFormatted} elapsed)
                  </span>
                </div>
              </div>
            </div>

            {/* Primary Action Buttons */}
            <div className="grid grid-cols-2 gap-3.5 relative z-10 max-w-md mx-auto">
              <button
                type="button"
                onClick={handleTogglePlayPause}
                className={`h-12 px-5 rounded-2xl font-semibold text-[14px] flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs ${
                  session.isPaused
                    ? "bg-[#33A579] hover:bg-[#2B9168] text-white"
                    : "bg-amber-500/15 hover:bg-amber-500/25 text-amber-700 dark:text-amber-400 border border-amber-500/25"
                }`}
              >
                {session.isPaused ? (
                  <>
                    <Play className="w-4 h-4 fill-current" />
                    <span>Resume Timer</span>
                  </>
                ) : (
                  <>
                    <Pause className="w-4 h-4 fill-current" />
                    <span>Pause Timer</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleStopAndLog}
                className="h-12 px-5 rounded-2xl bg-foreground text-background hover:opacity-90 font-semibold text-[14px] flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs"
              >
                <Square className="w-4 h-4 fill-current" />
                <span>Stop & Log Hours</span>
              </button>
            </div>

            {/* Extension Buttons */}
            <div className="mt-5 p-4 rounded-2xl bg-surface border border-border/80 max-w-md mx-auto space-y-2.5 relative z-10">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-muted-foreground flex items-center gap-1.5">
                  <Plus className="w-3.5 h-3.5 text-[#5A82E8]" />
                  Extend Capacity Allocation
                </span>
                <button
                  type="button"
                  onClick={handleResetTimer}
                  className="text-muted-foreground hover:text-foreground text-[11px] flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Reset to {session.initialHours}h</span>
                </button>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => handleExtendTimer(15)}
                  className="h-8.5 rounded-xl bg-card border border-border hover:border-[#5A82E8] text-xs font-semibold text-foreground transition-all cursor-pointer hover:text-[#5A82E8]"
                >
                  +15 min
                </button>
                <button
                  type="button"
                  onClick={() => handleExtendTimer(30)}
                  className="h-8.5 rounded-xl bg-card border border-border hover:border-[#5A82E8] text-xs font-semibold text-foreground transition-all cursor-pointer hover:text-[#5A82E8]"
                >
                  +30 min
                </button>
                <button
                  type="button"
                  onClick={() => handleExtendTimer(60)}
                  className="h-8.5 rounded-xl bg-card border border-border hover:border-[#5A82E8] text-xs font-semibold text-foreground transition-all cursor-pointer hover:text-[#5A82E8]"
                >
                  +1 hour
                </button>
              </div>
            </div>

            {/* Session Timesheet Notes Input */}
            <div className="mt-5 max-w-md mx-auto text-left relative z-10">
              <label className="block text-[11px] font-semibold text-muted-foreground mb-1">
                Timesheet Note for this session
              </label>
              <input
                type="text"
                value={sessionNotes}
                onChange={(e) => setSessionNotes(e.target.value)}
                placeholder="e.g. Iterated responsive variations, reviewed specs with lead"
                className="w-full h-10 px-3.5 rounded-xl border border-border bg-surface text-xs text-foreground focus:outline-none focus:border-foreground"
              />
            </div>
          </Card>
        </div>

        {/* Right: Task Switcher & History (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Select / Switch Active Task */}
          <Card className="p-6 rounded-[32px] border border-border bg-card space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-border">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-muted-foreground" />
                <h3 className="text-sm font-semibold text-foreground">Select Active Task</h3>
              </div>
              <span className="text-xs text-muted-foreground">Click to start timer</span>
            </div>

            <div className="space-y-2">
              {SAMPLE_TASKS.map((t) => {
                const isSelected = session.taskId === t.id;
                return (
                  <div
                    key={t.id}
                    onClick={() => handleSwitchTask(t)}
                    className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                      isSelected
                        ? "bg-surface border-foreground/30 shadow-xs"
                        : "bg-card border-border/80 hover:bg-surface/50 hover:border-border"
                    }`}
                  >
                    <div className="min-w-0 pr-2">
                      <div className="text-xs font-semibold text-foreground truncate">
                        {t.title}
                      </div>
                      <div className="text-[11px] text-muted-foreground mt-0.5">
                        <span>{t.client}</span> • <span>{t.dept}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-xs font-mono text-muted-foreground">{t.hours} hrs</span>
                      {isSelected ? (
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      ) : (
                        <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Today's Logged Timesheet Records */}
          <Card className="p-6 rounded-[32px] border border-border bg-card space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-border">
              <div className="flex items-center gap-2">
                <History className="w-4 h-4 text-muted-foreground" />
                <h3 className="text-sm font-semibold text-foreground">Logged Capacity History</h3>
              </div>
              <span className="text-xs font-mono text-muted-foreground">
                {loggedHistory.reduce((acc, c) => acc + c.hours, 0).toFixed(1)} hrs total
              </span>
            </div>

            <div className="space-y-2.5">
              {loggedHistory.map((log) => (
                <div
                  key={log.id}
                  className="p-3 rounded-xl bg-surface border border-border/60 text-xs space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-foreground">{log.taskTitle}</span>
                    <span className="font-mono text-emerald-600 dark:text-emerald-400 font-semibold">
                      +{log.hours}h
                    </span>
                  </div>
                  <div className="text-[11px] text-muted-foreground flex items-center justify-between">
                    <span>{log.client}</span>
                    <span>{log.timestamp}</span>
                  </div>
                  {log.notes && (
                    <div className="text-[11px] text-muted-foreground/80 italic pt-0.5">
                      "{log.notes}"
                    </div>
                  )}
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
