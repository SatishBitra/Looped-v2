import {
  X,
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  Video,
  Trash2,
  Edit2,
  ExternalLink,
  Users,
  Tag,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { CalendarEventItem, COLOR_THEME_STYLES } from "./calendar-types";

interface EventDetailModalProps {
  event: CalendarEventItem | null;
  onClose: () => void;
  onEdit: (event: CalendarEventItem) => void;
  onDelete: (id: string) => void;
}

export function EventDetailModal({ event, onClose, onEdit, onDelete }: EventDetailModalProps) {
  if (!event) return null;

  const style = COLOR_THEME_STYLES[event.theme];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="relative w-full max-w-md bg-card border border-border/90 rounded-[28px] p-6 shadow-2xl overflow-hidden"
        >
          {/* Header pill & close */}
          <div className="flex items-center justify-between pb-3 border-b border-border/60">
            <div className="flex items-center gap-2">
              <span
                className={`px-2.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wider border ${style.bg} ${style.text} ${style.border}`}
              >
                {event.theme}
              </span>
              <span className="text-xs text-muted-foreground capitalize font-medium">
                {event.scope} Event
              </span>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-full grid place-items-center text-muted-foreground hover:text-foreground hover:bg-accent transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Title & Timing */}
          <div className="mt-4">
            <h3 className="text-xl font-bold text-foreground tracking-tight flex items-center gap-2">
              {event.hasBullet && (
                <span className={`w-2.5 h-2.5 rounded-full ${style.dotColor || "bg-foreground"}`} />
              )}
              {event.title}
            </h3>

            <div className="flex flex-wrap items-center gap-4 mt-3 text-xs text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <CalendarIcon className="w-3.5 h-3.5" />
                <span>{event.date}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                <span>
                  {event.timeStart}
                  {event.timeEnd ? ` – ${event.timeEnd}` : ""}
                </span>
              </div>
              {event.project && (
                <div className="flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5" />
                  <span>{event.project}</span>
                </div>
              )}
            </div>
          </div>

          {/* Description */}
          {event.description && (
            <div className="mt-4 p-3.5 rounded-2xl bg-muted/40 border border-border/60 text-xs text-foreground/90 leading-relaxed">
              {event.description}
            </div>
          )}

          {/* Participants */}
          {event.participants && event.participants.length > 0 && (
            <div className="mt-4">
              <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5" /> Attendees ({event.participants.length})
              </p>
              <div className="flex flex-wrap gap-1.5 mt-2">
                {event.participants.map((person, i) => (
                  <span
                    key={i}
                    className="px-2.5 py-1 rounded-lg bg-accent/60 text-foreground text-xs font-medium border border-border/40"
                  >
                    {person}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Location & Meeting Links */}
          <div className="mt-4 space-y-2">
            {event.location && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <MapPin className="w-3.5 h-3.5 text-foreground shrink-0" />
                <span className="text-foreground font-medium">{event.location}</span>
              </div>
            )}

            {event.meetingLink && (
              <a
                href={event.meetingLink}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between p-3 rounded-xl bg-blue-500/10 hover:bg-blue-500/15 border border-blue-500/20 text-blue-600 dark:text-blue-400 text-xs font-medium transition-colors"
              >
                <div className="flex items-center gap-2 truncate">
                  <Video className="w-4 h-4 shrink-0" />
                  <span className="truncate">Join Video Meeting</span>
                </div>
                <ExternalLink className="w-3.5 h-3.5 shrink-0 ml-2" />
              </a>
            )}
          </div>

          {/* Actions Footer */}
          <div className="flex items-center justify-between pt-5 mt-6 border-t border-border/60">
            <button
              type="button"
              onClick={() => {
                onDelete(event.id);
                onClose();
              }}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium text-destructive hover:bg-destructive/10 transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  onEdit(event);
                  onClose();
                }}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-border text-xs font-medium text-foreground hover:bg-accent transition-colors cursor-pointer"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>Edit</span>
              </button>
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-foreground text-background text-xs font-semibold hover:opacity-90 transition-all cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
