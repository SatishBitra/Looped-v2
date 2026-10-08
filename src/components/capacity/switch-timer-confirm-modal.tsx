import { motion } from "motion/react";
import { AlertCircle, Clock, Play, Pause, CheckCircle2, X, ArrowRight } from "lucide-react";
import { ActiveTimerSession, formatTimeParts } from "./types";

interface SwitchTimerConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentSession: ActiveTimerSession;
  incomingTask: {
    id: string;
    title: string;
    client: string;
    department: string;
    hoursAssigned: number;
  };
  onLogAndSwitch: () => void;
  onPauseAndSwitch: () => void;
}

export function SwitchTimerConfirmModal({
  isOpen,
  onClose,
  currentSession,
  incomingTask,
  onLogAndSwitch,
  onPauseAndSwitch,
}: SwitchTimerConfirmModalProps) {
  if (!isOpen) return null;

  const currentRemaining = formatTimeParts(currentSession.secondsRemaining);
  const currentElapsed = formatTimeParts(currentSession.secondsElapsed);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.6 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/70 backdrop-blur-xs"
      />

      {/* Modal Dialog Card */}
      <motion.div
        initial={{ scale: 0.94, opacity: 0, y: 8 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.94, opacity: 0, y: 8 }}
        transition={{ type: "spring", duration: 0.3, bounce: 0.15 }}
        className="bg-white dark:bg-[#1E1E22] border border-[#E7E7EC] dark:border-[#323238] rounded-[28px] max-w-lg w-full p-6 shadow-2xl z-10 relative space-y-6 text-foreground"
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/15 text-amber-600 dark:text-amber-400 grid place-items-center shrink-0">
              <AlertCircle className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <h3 className="text-[18px] font-semibold tracking-tight text-[#111111] dark:text-white">
                Switch Active Project Timer?
              </h3>
              <p className="text-[13px] text-[#757575] dark:text-[#A0A0A5]">
                A capacity timer is already ticking for another project.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-[#F4F4F7] dark:hover:bg-[#2C2C30] grid place-items-center text-[#757575] hover:text-foreground transition-colors cursor-pointer"
            title="Dismiss"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Comparison Cards: Current vs Incoming */}
        <div className="grid grid-cols-1 gap-3">
          {/* Current Active Task Card */}
          <div className="p-4 rounded-2xl border border-amber-500/30 bg-amber-500/5 dark:bg-amber-500/10 space-y-2">
            <div className="flex items-center justify-between text-xs font-medium">
              <span className="text-amber-700 dark:text-amber-300 font-semibold uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                Currently Active Session
              </span>
              <span className="font-mono text-amber-700 dark:text-amber-300">
                {currentRemaining.fullFormatted} remaining
              </span>
            </div>
            <div className="flex items-baseline justify-between">
              <div>
                <h4 className="text-[15px] font-semibold text-[#111111] dark:text-white">
                  {currentSession.taskTitle}
                </h4>
                <p className="text-[12px] text-[#757575] dark:text-[#A0A0A5]">
                  {currentSession.client} · {currentSession.department}
                </p>
              </div>
              <div className="text-right text-[12px] text-[#757575] dark:text-[#A0A0A5]">
                <span>Logged: </span>
                <span className="font-mono font-medium text-foreground">
                  {currentElapsed.fullFormatted}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-center">
            <ArrowRight className="w-4 h-4 text-[#A8A8A8] rotate-90 sm:rotate-0" />
          </div>

          {/* Incoming Task Card */}
          <div className="p-4 rounded-2xl border border-emerald-500/30 bg-emerald-500/5 dark:bg-emerald-500/10 space-y-2">
            <div className="flex items-center justify-between text-xs font-medium">
              <span className="text-emerald-700 dark:text-emerald-300 font-semibold uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                Target Project to Start
              </span>
              <span className="font-mono text-emerald-700 dark:text-emerald-300">
                {incomingTask.hoursAssigned} hrs allocated
              </span>
            </div>
            <div className="flex items-baseline justify-between">
              <div>
                <h4 className="text-[15px] font-semibold text-[#111111] dark:text-white">
                  {incomingTask.title}
                </h4>
                <p className="text-[12px] text-[#757575] dark:text-[#A0A0A5]">
                  {incomingTask.client} · {incomingTask.department}
                </p>
              </div>
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 font-medium">
                Countdown from {(incomingTask.hoursAssigned * 60).toFixed(0)}m
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2 pt-2">
          {/* Primary Action: Log Elapsed & Switch */}
          <button
            type="button"
            onClick={onLogAndSwitch}
            className="w-full h-11 px-4 rounded-xl bg-foreground text-background hover:opacity-90 font-medium text-[13px] flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Log Elapsed Time & Start New Project</span>
          </button>

          {/* Secondary Action: Pause Previous & Switch */}
          <button
            type="button"
            onClick={onPauseAndSwitch}
            className="w-full h-10 px-4 rounded-xl border border-[#E7E7EC] dark:border-[#323238] bg-[#F4F4F7] dark:bg-[#28282D] hover:bg-accent text-foreground font-medium text-[13px] flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <Pause className="w-3.5 h-3.5" />
            <span>Pause Current Session & Switch</span>
          </button>

          {/* Cancel */}
          <button
            type="button"
            onClick={onClose}
            className="w-full h-9 rounded-xl text-[#757575] hover:text-foreground text-[12px] font-medium transition-colors cursor-pointer"
          >
            Cancel and Keep Tracking "{currentSession.taskTitle}"
          </button>
        </div>
      </motion.div>
    </div>
  );
}
