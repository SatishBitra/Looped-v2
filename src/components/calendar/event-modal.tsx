import { useState } from "react";
import { X, Calendar as CalendarIcon, Clock, MapPin, Video, Tag } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";
import { CalendarEventItem, EventColorTheme, COLOR_THEME_STYLES } from "./calendar-types";

interface EventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (event: CalendarEventItem) => void;
  initialDate?: string;
  editEvent?: CalendarEventItem | null;
}

const THEME_OPTIONS: { label: string; value: EventColorTheme }[] = [
  { label: "Neutral", value: "neutral" },
  { label: "Violet", value: "purple" },
  { label: "Blue", value: "blue" },
  { label: "Pink", value: "pink" },
  { label: "Green", value: "green" },
  { label: "Orange", value: "orange" },
  { label: "Yellow", value: "yellow" },
  { label: "Indigo", value: "indigo" },
];

export function EventModal({
  isOpen,
  onClose,
  onSave,
  initialDate = "2025-01-10",
  editEvent,
}: EventModalProps) {
  const [title, setTitle] = useState(editEvent?.title || "");
  const [date, setDate] = useState(editEvent?.date || initialDate);
  const [timeStart, setTimeStart] = useState(editEvent?.timeStart || "9:00 AM");
  const [timeEnd, setTimeEnd] = useState(editEvent?.timeEnd || "10:00 AM");
  const [theme, setTheme] = useState<EventColorTheme>(editEvent?.theme || "blue");
  const [scope, setScope] = useState<CalendarEventItem["scope"]>(editEvent?.scope || "all");
  const [project, setProject] = useState(editEvent?.project || "General");
  const [location, setLocation] = useState(editEvent?.location || "");
  const [meetingLink, setMeetingLink] = useState(editEvent?.meetingLink || "");
  const [description, setDescription] = useState(editEvent?.description || "");
  const [hasBullet, setHasBullet] = useState(editEvent?.hasBullet || false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error("Please enter an event title");
      return;
    }

    const eventItem: CalendarEventItem = {
      id: editEvent?.id || `evt-${Date.now()}`,
      title: title.trim(),
      date,
      timeStart,
      timeEnd,
      theme,
      scope,
      project: project.trim() || "General",
      location: location.trim() || undefined,
      meetingLink: meetingLink.trim() || undefined,
      description: description.trim() || undefined,
      hasBullet: hasBullet || theme === "green" || theme === "orange" || theme === "indigo",
    };

    onSave(eventItem);
    toast.success(editEvent ? "Event updated" : "Event scheduled", {
      description: `${eventItem.title} on ${eventItem.date} at ${eventItem.timeStart}`,
    });
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="relative w-full max-w-lg bg-card border border-border/90 rounded-[28px] p-6 shadow-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-border/60">
            <div>
              <h3 className="text-lg font-semibold text-foreground tracking-tight">
                {editEvent ? "Edit Event" : "Add New Event"}
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Schedule a meeting, task, sync, or milestone.
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-full grid place-items-center text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <form
            onSubmit={handleSubmit}
            className="mt-5 space-y-4 max-h-[75vh] overflow-y-auto pr-1"
          >
            {/* Title */}
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1.5">
                Event Title *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Design sync, Friday standup..."
                required
                className="w-full h-10 px-3.5 rounded-xl border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-foreground transition-all"
              />
            </div>

            {/* Date & Times */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1.5 flex items-center gap-1">
                  <CalendarIcon className="w-3 h-3 text-muted-foreground" /> Date
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border border-border bg-background text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-foreground"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1.5 flex items-center gap-1">
                  <Clock className="w-3 h-3 text-muted-foreground" /> Start
                </label>
                <input
                  type="text"
                  value={timeStart}
                  onChange={(e) => setTimeStart(e.target.value)}
                  placeholder="9:00 AM"
                  className="w-full h-10 px-3 rounded-xl border border-border bg-background text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-foreground"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1.5 flex items-center gap-1">
                  <Clock className="w-3 h-3 text-muted-foreground" /> End
                </label>
                <input
                  type="text"
                  value={timeEnd}
                  onChange={(e) => setTimeEnd(e.target.value)}
                  placeholder="10:00 AM"
                  className="w-full h-10 px-3 rounded-xl border border-border bg-background text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-foreground"
                />
              </div>
            </div>

            {/* Color Theme Selector */}
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1.5">
                Color Palette
              </label>
              <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
                {THEME_OPTIONS.map((opt) => {
                  const style = COLOR_THEME_STYLES[opt.value];
                  const isSelected = theme === opt.value;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setTheme(opt.value)}
                      className={`h-9 rounded-xl flex items-center justify-center text-[11px] font-medium border transition-all ${
                        style.bg
                      } ${style.text} ${style.border} ${
                        isSelected
                          ? "ring-2 ring-foreground ring-offset-2 scale-105 shadow-sm"
                          : "opacity-80 hover:opacity-100"
                      }`}
                      title={opt.label}
                    >
                      {opt.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Scope / Calendar Category */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1.5">
                  Filter Scope
                </label>
                <select
                  value={scope}
                  onChange={(e) => setScope(e.target.value as CalendarEventItem["scope"])}
                  className="w-full h-10 px-3 rounded-xl border border-border bg-background text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-foreground"
                >
                  <option value="all">All events</option>
                  <option value="shared">Shared</option>
                  <option value="public">Public</option>
                  <option value="archived">Archived</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1.5 flex items-center gap-1">
                  <Tag className="w-3 h-3 text-muted-foreground" /> Project / Pod
                </label>
                <input
                  type="text"
                  value={project}
                  onChange={(e) => setProject(e.target.value)}
                  placeholder="e.g. Design, Internal Ops..."
                  className="w-full h-10 px-3 rounded-xl border border-border bg-background text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-foreground"
                />
              </div>
            </div>

            {/* Meeting Link & Location */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1.5 flex items-center gap-1">
                  <Video className="w-3 h-3 text-muted-foreground" /> Video Call Link
                </label>
                <input
                  type="url"
                  value={meetingLink}
                  onChange={(e) => setMeetingLink(e.target.value)}
                  placeholder="https://meet.google.com/..."
                  className="w-full h-10 px-3 rounded-xl border border-border bg-background text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-foreground"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1.5 flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-muted-foreground" /> Location / Room
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Studio Room 2, Downtown..."
                  className="w-full h-10 px-3 rounded-xl border border-border bg-background text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-foreground"
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1.5">
                Notes / Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Add agenda topics, deliverables, or notes..."
                rows={2}
                className="w-full p-3 rounded-xl border border-border bg-background text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-foreground resize-none"
              />
            </div>

            {/* Bullet Dot toggle */}
            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="bullet-toggle"
                checked={hasBullet}
                onChange={(e) => setHasBullet(e.target.checked)}
                className="rounded text-foreground focus:ring-0 cursor-pointer"
              />
              <label
                htmlFor="bullet-toggle"
                className="text-xs text-muted-foreground cursor-pointer"
              >
                Display bullet accent indicator on chip (like{" "}
                <span className="font-semibold text-foreground">• Dinner / House inspection</span>)
              </label>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-border/60">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl border border-border text-xs font-medium text-foreground hover:bg-accent transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-foreground text-background text-xs font-semibold hover:opacity-90 transition-all shadow-sm active:scale-[0.99] cursor-pointer"
              >
                {editEvent ? "Save Changes" : "Schedule Event"}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
