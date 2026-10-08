import { motion } from "motion/react";
import { Play, Pause, Square, Maximize2, Clock } from "lucide-react";
import { ActiveTimerSession, formatTimeParts } from "./types";

interface FloatingTimerBarProps {
  session: ActiveTimerSession;
  onOpenModal: () => void;
  onTogglePlayPause: () => void;
  onStopAndLog: () => void;
}

export function FloatingTimerBar({
  session,
  onOpenModal,
  onTogglePlayPause,
  onStopAndLog,
}: FloatingTimerBarProps) {
  const remaining = formatTimeParts(session.secondsRemaining);
  const isTimeUp = session.secondsRemaining <= 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      className="fixed bottom-6 right-6 z-40 bg-white/95 dark:bg-[#1E1E22]/95 backdrop-blur-md border border-[#E7E7EC] dark:border-[#323238] rounded-2xl p-3 shadow-[0_12px_36px_rgba(0,0,0,0.14)] flex items-center gap-4 select-none max-w-md"
    >
      {/* Clickable Area to Expand */}
      <div
        onClick={onOpenModal}
        className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity min-w-0"
      >
        {/* Pulsing indicator icon */}
        <div
          className={`w-9 h-9 rounded-xl grid place-items-center shrink-0 ${
            isTimeUp
              ? "bg-[#E4664F]/15 text-[#E4664F]"
              : session.isPaused
                ? "bg-[#D79A2C]/15 text-[#D79A2C]"
                : "bg-[#33A579]/15 text-[#33A579]"
          }`}
        >
          <Clock
            className={`w-4 h-4 ${session.isRunning && !session.isPaused ? "animate-spin" : ""}`}
            style={{ animationDuration: "12s" }}
          />
        </div>

        <div className="min-w-0 pr-1">
          <div className="flex items-center gap-1.5">
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                isTimeUp
                  ? "bg-[#E4664F] animate-ping"
                  : session.isPaused
                    ? "bg-[#D79A2C]"
                    : "bg-[#33A579] animate-pulse"
              }`}
            />
            <p className="text-[13px] font-semibold text-foreground truncate max-w-[160px]">
              {session.taskTitle}
            </p>
          </div>
          <div className="flex items-center gap-1 text-[11px] text-[#757575] dark:text-[#A0A0A5]">
            <span>{session.client}</span>
            <span>•</span>
            <span
              className={`font-mono font-medium ${
                isTimeUp
                  ? "text-[#E4664F] font-bold"
                  : session.isPaused
                    ? "text-[#D79A2C]"
                    : "text-[#33A579]"
              }`}
            >
              {remaining.fullFormatted}
            </span>
          </div>
        </div>
      </div>

      {/* Quick Action Buttons */}
      <div className="flex items-center gap-1.5 shrink-0 pl-2 border-l border-[#E7E7EC] dark:border-[#323238]">
        {/* Pause / Resume */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onTogglePlayPause();
          }}
          title={session.isPaused ? "Resume Timer" : "Pause Timer"}
          className="w-8 h-8 rounded-lg hover:bg-accent grid place-items-center text-foreground transition-colors cursor-pointer"
        >
          {session.isPaused ? (
            <Play className="w-3.5 h-3.5 fill-current text-[#33A579]" />
          ) : (
            <Pause className="w-3.5 h-3.5 fill-current text-[#D79A2C]" />
          )}
        </button>

        {/* Stop Button */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onStopAndLog();
          }}
          title="Stop & Log Hours"
          className="w-8 h-8 rounded-lg hover:bg-accent grid place-items-center text-foreground transition-colors cursor-pointer"
        >
          <Square className="w-3.5 h-3.5 fill-current" />
        </button>

        {/* Maximize / Open Modal */}
        <button
          type="button"
          onClick={onOpenModal}
          title="Expand Capacity Timer"
          className="w-8 h-8 rounded-lg hover:bg-accent grid place-items-center text-[#757575] hover:text-foreground transition-colors cursor-pointer"
        >
          <Maximize2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </motion.div>
  );
}
