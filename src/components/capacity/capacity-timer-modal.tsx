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
  Sparkles,
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
  const totalAllocated = formatTimeParts(session.totalSecondsAllocated);

  // Calculate circular dial progress (from 100% down to 0%)
  const progressRatio =
    session.totalSecondsAllocated > 0
      ? Math.max(0, Math.min(1, session.secondsRemaining / session.totalSecondsAllocated))
      : 0;

  // SVG ring properties
  const size = 240;
  const strokeWidth = 10;
  const center = size / 2;
  const radius = center - strokeWidth - 6;
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.55 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/60 backdrop-blur-xs"
      />

      {/* Main Card Modal */}
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 12 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 12 }}
        transition={{ type: "spring", duration: 0.35, bounce: 0.12 }}
        className="bg-white dark:bg-[#1E1E22] border border-[#E7E7EC] dark:border-[#323238] rounded-[32px] max-w-lg w-full p-6 sm:p-7 shadow-[0_24px_64px_rgba(0,0,0,0.18)] z-10 relative space-y-6 text-foreground select-none"
      >
        {/* Top Header Bar */}
        <div className="flex items-center justify-between border-b border-[#E7E7EC] dark:border-[#323238] pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-[#757575] dark:text-[#A0A0A5]">
                Log Capacity Hours
              </span>
              <span className="text-[#E7E7EC] dark:text-[#323238]">•</span>
              <span
                className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium ${
                  isTimeUp
                    ? "bg-[#E4664F]/10 text-[#E4664F]"
                    : session.isPaused
                      ? "bg-[#D79A2C]/10 text-[#D79A2C]"
                      : "bg-[#33A579]/10 text-[#33A579]"
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
            <h3 className="text-[19px] font-semibold text-[#111111] dark:text-white tracking-tight truncate max-w-[320px]">
              {session.taskTitle}
            </h3>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={onClose}
              title="Minimize to floating widget"
              className="w-8 h-8 rounded-full hover:bg-[#F4F4F7] dark:hover:bg-[#2C2C30] grid place-items-center text-[#757575] hover:text-foreground transition-colors cursor-pointer"
            >
              <Minimize2 className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              title="Close modal"
              className="w-8 h-8 rounded-full hover:bg-[#F4F4F7] dark:hover:bg-[#2C2C30] grid place-items-center text-[#757575] hover:text-foreground transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Task Context Strip */}
        <div className="flex items-center justify-between text-[13px] text-[#757575] dark:text-[#A0A0A5] px-1">
          <div className="flex items-center gap-2 truncate">
            <Briefcase className="w-3.5 h-3.5 shrink-0" />
            <span className="font-medium text-foreground">{session.client}</span>
            <span className="text-[#E7E7EC] dark:text-[#323238]">•</span>
            <span>{session.department}</span>
          </div>
          <div className="flex items-center gap-1 font-mono text-[12px] shrink-0">
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
              className="p-3.5 rounded-2xl bg-[#E4664F]/10 border border-[#E4664F]/25 flex items-start justify-between gap-3"
            >
              <div className="flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 text-[#E4664F] shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <h4 className="text-[13px] font-semibold text-[#E4664F]">
                    Capacity Allocation Completed!
                  </h4>
                  <p className="text-[12px] text-[#757575] dark:text-[#A0A0A5]">
                    Allocated capacity ({session.initialHours} hrs) has expired. You can wrap up and
                    log time, or extend the session below.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => playCapacityAlertChime()}
                title="Play test alert sound"
                className="p-1 rounded-md hover:bg-[#E4664F]/20 text-[#E4664F] transition-colors cursor-pointer shrink-0"
              >
                <Volume2 className="w-3.5 h-3.5" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Central Circular Dial Animation with Tabular Monospace Digits */}
        <div className="flex flex-col items-center justify-center py-2 relative">
          <div className="relative w-[240px] h-[240px] flex items-center justify-center">
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
              <span className="text-[10px] font-bold tracking-widest uppercase text-[#757575] dark:text-[#888890] mb-1">
                Remaining Time
              </span>

              {/* Countdown Digits: HH : MM : SS */}
              <div className="flex items-baseline justify-center text-[38px] sm:text-[42px] font-mono font-semibold tracking-tight text-[#111111] dark:text-white tabular-nums leading-none">
                <span>{remaining.hoursStr}</span>
                <span className="text-[#A8A8A8] dark:text-[#555] mx-0.5 animate-pulse">:</span>
                <span>{remaining.minutesStr}</span>
                <span className="text-[#A8A8A8] dark:text-[#555] mx-0.5 animate-pulse">:</span>
                <span>{remaining.secondsStr}</span>
              </div>

              {/* Relative Progress Percentage Subtitle */}
              <span className="text-[12px] text-[#757575] dark:text-[#A0A0A5] mt-2 font-mono">
                {Math.round(progressRatio * 100)}% remaining
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

        {/* Primary Controls Row: Pause/Play, Stop & Log, Reset */}
        <div className="grid grid-cols-2 gap-3">
          {/* Pause / Resume Button */}
          <button
            type="button"
            onClick={onTogglePlayPause}
            className={`h-12 px-4 rounded-2xl font-medium text-[14px] flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs ${
              session.isPaused
                ? "bg-[#33A579] hover:bg-[#2B9168] text-white"
                : "bg-amber-500/15 hover:bg-amber-500/25 text-amber-700 dark:text-amber-400 border border-amber-500/20"
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
            className="h-12 px-4 rounded-2xl bg-foreground text-background hover:opacity-90 font-medium text-[14px] flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs"
          >
            <Square className="w-4 h-4 fill-current" />
            <span>Stop & Log Hours</span>
          </button>
        </div>

        {/* Extend Timer Controls */}
        <div className="p-3.5 rounded-2xl bg-[#F4F4F7] dark:bg-[#242428] border border-[#E7E7EC] dark:border-[#323238] space-y-2">
          <div className="flex items-center justify-between text-[12px]">
            <span className="font-medium text-[#757575] dark:text-[#A0A0A5] flex items-center gap-1.5">
              <Plus className="w-3.5 h-3.5 text-[#5A82E8]" />
              Extend Capacity Allocation
            </span>
            <button
              type="button"
              onClick={onResetTimer}
              title="Reset countdown back to original duration"
              className="text-[#757575] hover:text-foreground text-[11px] flex items-center gap-1 cursor-pointer transition-colors"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset</span>
            </button>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => onExtendTimer(15)}
              className="h-8 rounded-xl bg-white dark:bg-[#1E1E22] hover:border-[#5A82E8] border border-[#E7E7EC] dark:border-[#323238] text-[12px] font-medium text-foreground transition-all cursor-pointer hover:text-[#5A82E8] active:scale-98"
            >
              +15 min
            </button>
            <button
              type="button"
              onClick={() => onExtendTimer(30)}
              className="h-8 rounded-xl bg-white dark:bg-[#1E1E22] hover:border-[#5A82E8] border border-[#E7E7EC] dark:border-[#323238] text-[12px] font-medium text-foreground transition-all cursor-pointer hover:text-[#5A82E8] active:scale-98"
            >
              +30 min
            </button>
            <button
              type="button"
              onClick={() => onExtendTimer(60)}
              className="h-8 rounded-xl bg-white dark:bg-[#1E1E22] hover:border-[#5A82E8] border border-[#E7E7EC] dark:border-[#323238] text-[12px] font-medium text-foreground transition-all cursor-pointer hover:text-[#5A82E8] active:scale-98"
            >
              +1 hour
            </button>
          </div>
        </div>

        {/* Optional Notes Toggle */}
        <div className="space-y-1.5">
          {!showNotesField ? (
            <button
              type="button"
              onClick={() => setShowNotesField(true)}
              className="text-[12px] text-[#757575] hover:text-foreground flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>+ Add session notes for timesheet</span>
            </button>
          ) : (
            <div className="space-y-1">
              <label className="text-[11px] font-medium text-[#757575] dark:text-[#A0A0A5]">
                Timesheet Note (Optional)
              </label>
              <input
                type="text"
                value={sessionNotes}
                onChange={(e) => setSessionNotes(e.target.value)}
                placeholder="e.g. Completed initial design variations and client review"
                className="w-full h-9 px-3 rounded-xl border border-[#E7E7EC] dark:border-[#323238] bg-transparent text-[13px] text-foreground focus:outline-hidden focus:border-[#5A82E8]"
              />
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
