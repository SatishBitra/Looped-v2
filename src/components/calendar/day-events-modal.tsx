import { X, Plus, Calendar as CalendarIcon } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { CalendarEventItem, COLOR_THEME_STYLES } from "./calendar-types";

interface DayEventsModalProps {
  isOpen: boolean;
  dateStr: string;
  events: CalendarEventItem[];
  onClose: () => void;
  onSelectEvent: (event: CalendarEventItem) => void;
  onAddEvent: (dateStr: string) => void;
}

export function DayEventsModal({
  isOpen,
  dateStr,
  events,
  onClose,
  onSelectEvent,
  onAddEvent,
}: DayEventsModalProps) {
  if (!isOpen) return null;

  // Format date display
  const dateObj = new Date(dateStr + "T00:00:00");
  const formattedDate = dateObj.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm cursor-pointer"
        onClick={onClose}
      >
        <motion.div
          onClick={(e) => e.stopPropagation()}
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="relative w-full max-w-md bg-card border border-border/90 rounded-[28px] p-6 shadow-2xl overflow-hidden cursor-default"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-border/60">
            <div>
              <h3 className="text-base font-semibold text-foreground tracking-tight flex items-center gap-1.5">
                <CalendarIcon className="w-4 h-4 text-muted-foreground" />
                <span>{formattedDate}</span>
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                {events.length} {events.length === 1 ? "event" : "events"} scheduled
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-full grid place-items-center text-muted-foreground hover:text-foreground hover:bg-accent transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Events List */}
          <div className="mt-4 max-h-[60vh] overflow-y-auto space-y-2 pr-1">
            {events.length === 0 ? (
              <p className="text-xs text-muted-foreground py-6 text-center">
                No events scheduled for this day.
              </p>
            ) : (
              events.map((evt) => {
                const style = COLOR_THEME_STYLES[evt.theme];
                return (
                  <button
                    key={evt.id}
                    type="button"
                    onClick={() => {
                      onSelectEvent(evt);
                      onClose();
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left text-xs font-medium border transition-all ${
                      style.bg
                    } ${style.text} ${style.border} hover:opacity-90 active:scale-[0.99] cursor-pointer shadow-xs`}
                  >
                    <div className="flex items-center gap-2 truncate mr-2">
                      {evt.hasBullet && (
                        <span
                          className={`w-2 h-2 rounded-full shrink-0 ${
                            style.dotColor || "bg-current"
                          }`}
                        />
                      )}
                      <span className="font-semibold truncate">{evt.title}</span>
                    </div>
                    <span className="text-[11px] opacity-80 shrink-0 font-medium">
                      {evt.timeStart}
                    </span>
                  </button>
                );
              })
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between pt-4 mt-4 border-t border-border/60">
            <button
              type="button"
              onClick={() => {
                onAddEvent(dateStr);
                onClose();
              }}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-foreground text-background text-xs font-semibold hover:opacity-90 transition-all cursor-pointer shadow-sm active:scale-95"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Event</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-border text-xs font-medium text-foreground hover:bg-accent transition-colors cursor-pointer"
            >
              Done
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
