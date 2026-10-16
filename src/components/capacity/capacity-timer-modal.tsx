import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Clock,
  Play,
  Pause,
  Square,
  Plus,
  RotateCcw,
  AlertTriangle,
  CheckCircle2,
  Minimize2,
  X,
  Briefcase,
  Layers,
  FileText,
  Volume2,
} from "lucide-react";
import { ActiveTimerSession, formatTimeParts } from "./types";
import { playCapacityAlertChime } from "./audio-chime";

interface CapacityTimerModalProps {
  isOpen: boolean;
  onClose: () => void;
  session: ActiveTimerSession;
  onTogglePlayPause: () => void;
  onStopAndLog: (notes?: string) => void;
  onExtendTimer: (minutes: number) => void;
  onResetTimer: () => void;
}

export function CapacityTimerModal({
  isOpen,
  onClose,
  session,
  onTogglePlayPause,
  onStopAndLog,
  onExtendTimer,
  onResetTimer,
}: CapacityTimerModalProps) {
  const [sessionNotes, setSessionNotes] = useState(session.notes || "");
  const [showNotesField, setShowNotesField] = useState(false);

  if (!isOpen) return null;

  const remaining = formatTimeParts(session.secondsRemaining);
  const elapsed = formatTimeParts(session.secondsElapsed);

  // Calculate circular dial progress (from 100% down to 0%)
  const progressRatio =
    session.totalSecondsAllocated > 0
      ? Math.max(0, Math.min(1, session.secondsRemaining / session.totalSecondsAllocated))
      : 0;

  // SVG ring properties
  const size = 260;
  const strokeWidth = 10;
  const center = size / 2;
  const radius = center - strokeWidth - 8;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - progressRatio);

  // Status color styling
  const isTimeUp = session.secondsRemaining <= 0;
  const isWarning = progressRatio <= 0.2 && !isTimeUp;

  const statusColor = isTimeUp
    ? "text-[#E4664F] stroke-[#E4664F]"
    : isWarning
      ? "text-[#D79A2C] stroke-[#D79A2C]"
      : "text-[#33A579] stroke-[#33A579]";

  const ringBgColor = "stroke-[#E7E7EC] dark:stroke-[#323238]";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.6 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm"
      />

      {/* Main Card Modal with Generous Padding & Visual Enhancers */}
      <motion.div
        initial={{ scale: 0.94, opacity: 0, y: 16 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.94, opacity: 0, y: 16 }}
        transition={{ type: "spring", duration: 0.38, bounce: 0.1 }}
        className="bg-white dark:bg-[#1A1A1E] border border-[#E7E7EC] dark:border-[#323238] rounded-[36px] max-w-lg w-full p-7 sm:p-8 shadow-[0_28px_72px_rgba(0,0,0,0.24)] z-10 relative space-y-6 text-foreground select-none"
      >
        {/* Ambient Glow behind Timer */}
        <div
          className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full blur-[80px] pointer-events-none opacity-25 dark:opacity-20 transition-all ${
            isTimeUp ? "bg-[#E4664F]" : session.isPaused ? "bg-[#D79A2C]" : "bg-[#33A579]"
          }`}
        />

        {/* Top Header Bar */}
        <div className="flex items-start justify-between border-b border-[#E7E7EC] dark:border-[#323238] pb-4.5 relative z-10">
          <div className="space-y-1.5 min-w-0 pr-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-[#757575] dark:text-[#A0A0A5]">
                Capacity Countdown Timer
              </span>
              <span className="text-[#E7E7EC] dark:text-[#323238]">•</span>
              <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${
                  isTimeUp
                    ? "bg-[#E4664F]/10 text-[#E4664F] border-[#E4664F]/25"
                    : session.isPaused
                      ? "bg-[#D79A2C]/10 text-[#D79A2C] border-[#D79A2C]/25"
                      : "bg-[#33A579]/10 text-[#33A579] border-[#33A579]/25"
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    isTimeUp
                      ? "bg-[#E4664F] animate-ping"
                      : session.isPaused
                        ? "bg-[#D79A2C]"
                        : "bg-[#33A579] animate-pulse"
                  }`}
                />
                {isTimeUp ? "Time Reached" : session.isPaused ? "Paused" : "Running"}
              </span>
            </div>

            <h3 className="text-[20px] font-bold text-[#111111] dark:text-white tracking-tight truncate max-w-[340px]">
              {session.taskTitle}
            </h3>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={onClose}
              title="Minimize to floating widget"
              className="w-8 h-8 rounded-full hover:bg-[#F4F4F7] dark:hover:bg-[#2C2C30] grid place-items-center text-[#757575] hover:text-foreground transition-colors cursor-pointer"
            >
              <Minimize2 className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={onClose}
              title="Close modal"
              className="w-8 h-8 rounded-full hover:bg-[#F4F4F7] dark:hover:bg-[#2C2C30] grid place-items-center text-[#757575] hover:text-foreground transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Task Context Strip */}
        <div className="flex items-center justify-between text-[13px] text-[#757575] dark:text-[#A0A0A5] px-1 relative z-10">
          <div className="flex items-center gap-2 truncate">
            <Briefcase className="w-3.5 h-3.5 shrink-0 text-foreground/70" />
            <span className="font-semibold text-foreground">{session.client}</span>
            <span className="text-[#E7E7EC] dark:text-[#323238]">•</span>
            <span>{session.department}</span>
          </div>
          <div className="flex items-center gap-1 font-mono text-[12px] shrink-0 bg-surface px-2.5 py-0.5 rounded-lg border border-border/60">
            <span>Allocated:</span>
            <span className="font-semibold text-foreground">{session.initialHours}h</span>
          </div>
        </div>

        {/* Time's Up Alert Banner (Appears when timer reaches 00:00:00) */}
        <AnimatePresence>
          {isTimeUp && (
            <motion.div
              initial={{ opacity: 0, height: 0, y: -6 }}
              animate={{ opacity: 1, height: "auto", y: 0 }}
              exit={{ opacity: 0, height: 0, y: -6 }}
              className="p-4 rounded-2xl bg-[#E4664F]/10 border border-[#E4664F]/30 flex items-start justify-between gap-3 relative z-10 shadow-xs"
            >
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-4 h-4 text-[#E4664F] shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <h4 className="text-[13px] font-bold text-[#E4664F]">
                    Capacity Allocation Completed!
                  </h4>
                  <p className="text-[12px] text-[#757575] dark:text-[#A0A0A5] leading-relaxed">
                    Allocated capacity ({session.initialHours} hrs) has ended. Stop and log hours,
                    or extend below.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => playCapacityAlertChime()}
                title="Play test alert sound"
                className="p-1.5 rounded-lg hover:bg-[#E4664F]/20 text-[#E4664F] transition-colors cursor-pointer shrink-0"
              >
                <Volume2 className="w-4 h-4" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Central Circular Dial Animation with Tabular Monospace Digits */}
        <div className="flex flex-col items-center justify-center py-2 relative z-10">
          <div className="relative w-[260px] h-[260px] flex items-center justify-center">
            {/* SVG Progress Ring */}
            <svg className="w-full h-full -rotate-90 transform" viewBox={`0 0 ${size} ${size}`}>
              {/* Background track circle */}
              <circle
                cx={center}
                cy={center}
                r={radius}
                className={ringBgColor}
                strokeWidth={strokeWidth}
                fill="transparent"
              />
              {/* Animated Progress Arc */}
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

            {/* Inner Content: Large Tabular Countdown Digits */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="text-[10px] font-bold tracking-widest uppercase text-[#757575] dark:text-[#888890] mb-1.5">
                Remaining Time
              </span>

              {/* Countdown Digits: HH : MM : SS */}
              <div className="flex items-baseline justify-center text-[40px] sm:text-[46px] font-mono font-bold tracking-tight text-[#111111] dark:text-white tabular-nums leading-none">
                <span>{remaining.hoursStr}</span>
                <span className="text-[#A8A8A8] dark:text-[#555] mx-1 animate-pulse">:</span>
                <span>{remaining.minutesStr}</span>
                <span className="text-[#A8A8A8] dark:text-[#555] mx-1 animate-pulse">:</span>
                <span>{remaining.secondsStr}</span>
              </div>

              {/* Relative Progress Percentage Subtitle */}
              <span className="text-[12px] text-[#757575] dark:text-[#A0A0A5] mt-2.5 font-mono">
                {Math.round(progressRatio * 100)}% capacity remaining
              </span>
            </div>
          </div>

          {/* Secondary Telemetry Indicators */}
          <div className="flex items-center justify-center gap-6 mt-4 text-[12px] text-[#757575] dark:text-[#A0A0A5]">
            <div className="flex items-center gap-1.5 font-mono">
              <span className="w-2 h-2 rounded-full bg-[#5A82E8]" />
              <span>Elapsed:</span>
              <span className="font-semibold text-foreground">{elapsed.fullFormatted}</span>
            </div>
            <span className="text-[#E7E7EC] dark:text-[#323238]">•</span>
            <div className="flex items-center gap-1.5 font-mono">
              <span className="w-2 h-2 rounded-full bg-[#8A6CE0]" />
              <span>Extended:</span>
              <span className="font-semibold text-foreground">
                +{session.extendedMinutes || 0}m
              </span>
            </div>
          </div>
        </div>

        {/* Primary Controls Row: Pause/Play, Stop & Log */}
        <div className="grid grid-cols-2 gap-3 relative z-10">
          {/* Pause / Resume Button */}
          <button
            type="button"
            onClick={onTogglePlayPause}
            className={`h-12 px-4 rounded-2xl font-semibold text-[14px] flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs ${
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

          {/* Stop & Log Hours Button */}
          <button
            type="button"
            onClick={() => onStopAndLog(sessionNotes)}
            className="h-12 px-4 rounded-2xl bg-foreground text-background hover:opacity-90 font-semibold text-[14px] flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs"
          >
            <Square className="w-4 h-4 fill-current" />
            <span>Stop & Log Hours</span>
          </button>
        </div>

        {/* Extend Timer Controls */}
        <div className="p-4 rounded-2xl bg-[#F4F4F7] dark:bg-[#222226] border border-[#E7E7EC] dark:border-[#323238] space-y-2.5 relative z-10">
          <div className="flex items-center justify-between text-[12px]">
            <span className="font-semibold text-[#757575] dark:text-[#A0A0A5] flex items-center gap-1.5">
              <Plus className="w-3.5 h-3.5 text-[#5A82E8]" />
              Extend Capacity Allocation
            </span>
            <button
              type="button"
              onClick={onResetTimer}
              title="Reset countdown back to original duration"
              className="text-[#757575] hover:text-foreground text-[11px] font-medium flex items-center gap-1 cursor-pointer transition-colors"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset</span>
            </button>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => onExtendTimer(15)}
              className="h-8.5 rounded-xl bg-white dark:bg-[#1A1A1E] hover:border-[#5A82E8] border border-[#E7E7EC] dark:border-[#323238] text-[12px] font-semibold text-foreground transition-all cursor-pointer hover:text-[#5A82E8] active:scale-98 shadow-2xs"
            >
              +15 min
            </button>
            <button
              type="button"
              onClick={() => onExtendTimer(30)}
              className="h-8.5 rounded-xl bg-white dark:bg-[#1A1A1E] hover:border-[#5A82E8] border border-[#E7E7EC] dark:border-[#323238] text-[12px] font-semibold text-foreground transition-all cursor-pointer hover:text-[#5A82E8] active:scale-98 shadow-2xs"
            >
              +30 min
            </button>
            <button
              type="button"
              onClick={() => onExtendTimer(60)}
              className="h-8.5 rounded-xl bg-white dark:bg-[#1A1A1E] hover:border-[#5A82E8] border border-[#E7E7EC] dark:border-[#323238] text-[12px] font-semibold text-foreground transition-all cursor-pointer hover:text-[#5A82E8] active:scale-98 shadow-2xs"
            >
              +1 hour
            </button>
          </div>
        </div>

        {/* Optional Notes Toggle */}
        <div className="space-y-1.5 relative z-10">
          {!showNotesField ? (
            <button
              type="button"
              onClick={() => setShowNotesField(true)}
              className="text-[12px] text-[#757575] hover:text-foreground flex items-center gap-1.5 transition-colors cursor-pointer font-medium"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>+ Add session notes for timesheet</span>
            </button>
          ) : (
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-[#757575] dark:text-[#A0A0A5]">
                Timesheet Note (Optional)
              </label>
              <input
                type="text"
                value={sessionNotes}
                onChange={(e) => setSessionNotes(e.target.value)}
                placeholder="e.g. Completed initial layout designs and client review"
                className="w-full h-9.5 px-3 rounded-xl border border-[#E7E7EC] dark:border-[#323238] bg-transparent text-[13px] text-foreground focus:outline-none focus:border-[#5A82E8]"
              />
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
