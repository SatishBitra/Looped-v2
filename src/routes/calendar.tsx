import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { useState, useMemo, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  Plus,
  ChevronDown,
  Clock,
  MapPin,
  Video,
  Users,
  Calendar as CalendarIcon,
  Check,
  CheckCircle2,
  Filter,
  ListFilter,
  Eye,
  CalendarDays,
  Sparkles,
  Layers,
} from "lucide-react";
import {
  CalendarEventItem,
  CalendarScope,
  CalendarViewMode,
  COLOR_THEME_STYLES,
} from "@/components/calendar/calendar-types";
import { INITIAL_CALENDAR_EVENTS } from "@/components/calendar/calendar-events-data";
import { EventModal } from "@/components/calendar/event-modal";
import { EventDetailModal } from "@/components/calendar/event-detail-modal";
import { DayEventsModal } from "@/components/calendar/day-events-modal";

export const Route = createFileRoute("/calendar")({
  component: CalendarPage,
});

const SCOPE_TABS: CalendarScope[] = ["All events", "Shared", "Public", "Archived"];

const VIEW_MODES: CalendarViewMode[] = ["Month view", "Week view", "Day view", "Agenda view"];

const DAYS_OF_WEEK = ["Mon", "Tues", "Wed", "Thu", "Fri", "Sat", "Sun"];

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const MONTH_SHORT = [
  "JAN",
  "FEB",
  "MAR",
  "APR",
  "MAY",
  "JUN",
  "JUL",
  "AUG",
  "SEP",
  "OCT",
  "NOV",
  "DEC",
];

// Helper to format YYYY-MM-DD
function formatYYYYMMDD(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function CalendarPage() {
  // Navigation Date state (Defaulting to September 17, 2026 with live update)
  const [todayDate, setTodayDate] = useState(() => new Date());

  // Live timer: re-checks current system date every 30 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setTodayDate(new Date());
    }, 30000);
    return () => clearInterval(timer);
  }, []);

  const todayStr = useMemo(() => formatYYYYMMDD(todayDate), [todayDate]);

  const [currentYear, setCurrentYear] = useState(() => todayDate.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(() => todayDate.getMonth()); // 8 = September
  const [activeTab, setActiveTab] = useState<CalendarScope>("All events");
  const [viewMode, setViewMode] = useState<CalendarViewMode>("Month view");
  const [isViewDropdownOpen, setIsViewDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isInlineSearchOpen, setIsInlineSearchOpen] = useState(false);

  // Selected date for day view or quick addition (Default today's date)
  const [selectedDate, setSelectedDate] = useState(() => todayStr);

  // Events list with local storage backup
  const [events, setEvents] = useState<CalendarEventItem[]>(() => {
    try {
      const saved = localStorage.getItem("looped_calendar_events_v2026");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.some((e: any) => e.date?.startsWith("2026-09"))) {
          return parsed;
        }
      }
    } catch {
      // ignore
    }
    return INITIAL_CALENDAR_EVENTS;
  });

  useEffect(() => {
    try {
      localStorage.setItem("looped_calendar_events_v2026", JSON.stringify(events));
    } catch {
      // ignore
    }
  }, [events]);

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEventItem | null>(null);
  const [editEventData, setEditEventData] = useState<CalendarEventItem | null>(null);

  // Day overflow modal state
  const [overflowDate, setOverflowDate] = useState<string | null>(null);

  const searchInputRef = useRef<HTMLInputElement>(null);
  const viewDropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (viewDropdownRef.current && !viewDropdownRef.current.contains(e.target as Node)) {
        setIsViewDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Keyboard shortcut for search
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsInlineSearchOpen(true);
        searchInputRef.current?.focus();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Filter events based on active tab and search query
  const filteredEvents = useMemo(() => {
    return events.filter((evt) => {
      // Tab filter
      if (activeTab === "Shared" && evt.scope !== "shared") return false;
      if (activeTab === "Public" && evt.scope !== "public") return false;
      if (activeTab === "Archived" && evt.scope !== "archived") return false;
      if (activeTab === "All events" && evt.scope === "archived") return false;

      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = evt.title.toLowerCase().includes(query);
        const matchesDesc = evt.description?.toLowerCase().includes(query);
        const matchesProject = evt.project?.toLowerCase().includes(query);
        const matchesLocation = evt.location?.toLowerCase().includes(query);
        if (!matchesTitle && !matchesDesc && !matchesProject && !matchesLocation) {
          return false;
        }
      }
      return true;
    });
  }, [events, activeTab, searchQuery]);

  // Build Month Grid Data (Starting on Monday)
  const calendarGrid = useMemo(() => {
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
    const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0);

    // In JS: Sunday is 0, Monday is 1, ..., Saturday is 6
    // In our calendar: Monday is index 0, Sunday is index 6
    const firstDayIndex = (firstDayOfMonth.getDay() + 6) % 7;
    const daysInMonth = lastDayOfMonth.getDate();

    // Previous month filler days
    const prevMonthLastDate = new Date(currentYear, currentMonth, 0).getDate();
    const cells: {
      dateStr: string;
      dayNumber: number;
      isCurrentMonth: boolean;
      isToday: boolean;
    }[] = [];

    // 1. Previous month days
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      const d = prevMonthLastDate - i;
      const prevDate = new Date(currentYear, currentMonth - 1, d);
      const dateStr = formatYYYYMMDD(prevDate);
      cells.push({
        dateStr,
        dayNumber: d,
        isCurrentMonth: false,
        isToday: dateStr === todayStr,
      });
    }

    // 2. Current month days
    for (let d = 1; d <= daysInMonth; d++) {
      const currentDate = new Date(currentYear, currentMonth, d);
      const dateStr = formatYYYYMMDD(currentDate);
      cells.push({
        dateStr,
        dayNumber: d,
        isCurrentMonth: true,
        isToday: dateStr === todayStr,
      });
    }

    // 3. Next month filler days to complete 35 or 42 grid cells
    const totalCellsNeeded = cells.length > 35 ? 42 : 35;
    const nextMonthDaysCount = totalCellsNeeded - cells.length;
    for (let d = 1; d <= nextMonthDaysCount; d++) {
      const nextDate = new Date(currentYear, currentMonth + 1, d);
      const dateStr = formatYYYYMMDD(nextDate);
      cells.push({
        dateStr,
        dayNumber: d,
        isCurrentMonth: false,
        isToday: dateStr === todayStr,
      });
    }

    return cells;
  }, [currentYear, currentMonth, todayStr]);

  // Group events by date string YYYY-MM-DD
  const eventsByDate = useMemo(() => {
    const map = new Map<string, CalendarEventItem[]>();
    for (const evt of filteredEvents) {
      const list = map.get(evt.date) || [];
      list.push(evt);
      map.set(evt.date, list);
    }
    return map;
  }, [filteredEvents]);

  // Week view dates calculation centered around selectedDate
  const weekDays = useMemo(() => {
    const base = new Date(selectedDate + "T12:00:00");
    const dayOfWeek = (base.getDay() + 6) % 7; // Monday = 0
    const monday = new Date(base);
    monday.setDate(base.getDate() - dayOfWeek);

    return Array.from({ length: 7 }).map((_, idx) => {
      const d = new Date(monday);
      d.setDate(monday.getDate() + idx);
      const dateStr = formatYYYYMMDD(d);
      return {
        dayName: DAYS_OF_WEEK[idx],
        dayNum: d.getDate(),
        dateStr,
        isToday: dateStr === todayStr,
      };
    });
  }, [selectedDate, todayStr]);

  // Day view date calculation
  const dayViewDate = useMemo(() => {
    const d = new Date(selectedDate + "T12:00:00");
    return {
      dateStr: selectedDate,
      dayNum: d.getDate(),
      formatted: d.toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric",
      }),
      isToday: selectedDate === todayStr,
    };
  }, [selectedDate, todayStr]);

  // Navigation handlers
  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  const handleGoToday = () => {
    const now = new Date();
    setTodayDate(now);
    setCurrentYear(now.getFullYear());
    setCurrentMonth(now.getMonth());
    const str = formatYYYYMMDD(now);
    setSelectedDate(str);
    toast.info(
      `Showing Today (${MONTH_NAMES[now.getMonth()]} ${now.getDate()}, ${now.getFullYear()})`,
    );
  };

  // Event actions
  const handleSaveEvent = (savedEvent: CalendarEventItem) => {
    setEvents((prev) => {
      const exists = prev.some((e) => e.id === savedEvent.id);
      if (exists) {
        return prev.map((e) => (e.id === savedEvent.id ? savedEvent : e));
      }
      return [savedEvent, ...prev];
    });
    setEditEventData(null);
  };

  const handleDeleteEvent = (id: string) => {
    setEvents((prev) => prev.filter((e) => e.id !== id));
    toast.success("Event deleted from calendar");
  };

  const handleOpenAddEvent = (targetDate?: string) => {
    if (targetDate) {
      setSelectedDate(targetDate);
    }
    setEditEventData(null);
    setIsAddModalOpen(true);
  };

  const handleEditEvent = (evt: CalendarEventItem) => {
    setEditEventData(evt);
    setIsAddModalOpen(true);
  };

  // Range subtitle: e.g. "Jan 1, 2025 – Jan 31, 2025"
  const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const rangeSubtitle = `${MONTH_SHORT[currentMonth]} 1, ${currentYear} – ${MONTH_SHORT[currentMonth]} ${lastDayOfMonth}, ${currentYear}`;

  return (
    <AppShell>
      <div className="w-full max-w-[1400px] mx-auto space-y-6 pb-12">
        {/* Main Calendar Card Container */}
        <div className="bg-white dark:bg-[#242428] border border-[#E7E7EC] dark:border-[#323238] rounded-[28px] sm:rounded-[32px] p-4 sm:p-7 shadow-[var(--shadow-soft)] overflow-hidden">
          {/* Card Top Toolbar */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-[#E7E7EC] dark:border-[#323238]">
            {/* Left: Date Badge + Month Title & Date Range */}
            <div className="flex items-center gap-3.5">
              {/* Date Badge: SEP 17 (Live dynamic current date) */}
              <div className="w-12 h-12 rounded-2xl border border-[#E7E7EC] dark:border-[#323238] bg-[#F4F4F7] dark:bg-[#1a1a1c] flex flex-col items-center justify-center shrink-0 shadow-xs">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground leading-none">
                  {MONTH_SHORT[todayDate.getMonth()]}
                </span>
                <span className="text-base font-extrabold text-foreground leading-none mt-1">
                  {todayDate.getDate()}
                </span>
              </div>

              <div>
                <h2 className="text-lg sm:text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
                  <span>
                    {MONTH_NAMES[currentMonth]} {currentYear}
                  </span>
                  {currentYear === todayDate.getFullYear() &&
                    currentMonth === todayDate.getMonth() && (
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        Live
                      </span>
                    )}
                </h2>
                <p className="text-xs text-muted-foreground font-medium mt-0.5">{rangeSubtitle}</p>
              </div>
            </div>

            {/* Middle: Scope Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto py-1 no-scrollbar">
              {SCOPE_TABS.map((tab) => {
                const isActive = activeTab === tab;
                return (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setActiveTab(tab)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                      isActive
                        ? "bg-[#111111] dark:bg-white text-white dark:text-[#111111] shadow-xs"
                        : "bg-[#F4F4F7] dark:bg-[#1a1a1c] border border-[#E7E7EC] dark:border-[#323238] text-muted-foreground hover:text-foreground hover:bg-[#EAEAEF] dark:hover:bg-[#25252a]"
                    }`}
                  >
                    {tab}
                  </button>
                );
              })}
            </div>

            {/* Right: Search, Date Nav ([ < ] [ Today ] [ > ]), View Dropdown, Add Event */}
            <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
              {/* Quick Search Toggle */}
              <button
                type="button"
                onClick={() => {
                  setIsInlineSearchOpen(!isInlineSearchOpen);
                  if (!isInlineSearchOpen) {
                    setTimeout(() => searchInputRef.current?.focus(), 100);
                  }
                }}
                className={`w-9 h-9 rounded-xl border grid place-items-center transition-colors cursor-pointer ${
                  isInlineSearchOpen || searchQuery
                    ? "bg-foreground text-background border-foreground"
                    : "bg-[#F4F4F7] dark:bg-[#1a1a1c] border-[#E7E7EC] dark:border-[#323238] text-muted-foreground hover:text-foreground hover:bg-[#EAEAEF] dark:hover:bg-[#25252a]"
                }`}
                title="Search events"
              >
                <Search className="w-4 h-4" />
              </button>

              {/* Segmented Month Navigation: [ < ] [ Today ] [ > ] */}
              <div className="flex items-center rounded-xl border border-[#E7E7EC] dark:border-[#323238] bg-[#F4F4F7] dark:bg-[#1a1a1c] p-0.5 shadow-xs">
                <button
                  type="button"
                  onClick={handlePrevMonth}
                  className="w-8 h-8 rounded-lg grid place-items-center text-muted-foreground hover:text-foreground hover:bg-white dark:hover:bg-[#242428] transition-colors cursor-pointer"
                  title="Previous month"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={handleGoToday}
                  className="px-3 h-8 rounded-lg text-xs font-semibold text-foreground hover:bg-white dark:hover:bg-[#242428] transition-colors cursor-pointer"
                >
                  Today
                </button>
                <button
                  type="button"
                  onClick={handleNextMonth}
                  className="w-8 h-8 rounded-lg grid place-items-center text-muted-foreground hover:text-foreground hover:bg-white dark:hover:bg-[#242428] transition-colors cursor-pointer"
                  title="Next month"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              {/* View Selector Dropdown: [ Month view ⌵ ] */}
              <div className="relative" ref={viewDropdownRef}>
                <button
                  type="button"
                  onClick={() => setIsViewDropdownOpen(!isViewDropdownOpen)}
                  className="h-9 px-3.5 rounded-xl border border-[#E7E7EC] dark:border-[#323238] bg-[#F4F4F7] dark:bg-[#1a1a1c] hover:bg-white dark:hover:bg-[#242428] text-xs font-semibold text-foreground flex items-center gap-2 shadow-xs transition-colors cursor-pointer"
                >
                  <span>{viewMode}</span>
                  <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
                </button>

                <AnimatePresence>
                  {isViewDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 4, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 4, scale: 0.98 }}
                      className="absolute right-0 top-11 w-40 bg-white dark:bg-[#242428] border border-[#E7E7EC] dark:border-[#323238] rounded-2xl p-1.5 shadow-xl z-30"
                    >
                      {VIEW_MODES.map((mode) => (
                        <button
                          key={mode}
                          type="button"
                          onClick={() => {
                            setViewMode(mode);
                            setIsViewDropdownOpen(false);
                          }}
                          className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium text-left transition-colors cursor-pointer ${
                            viewMode === mode
                              ? "bg-accent font-semibold text-foreground"
                              : "text-muted-foreground hover:text-foreground hover:bg-[#F4F4F7] dark:hover:bg-[#1a1a1c]"
                          }`}
                        >
                          <span>{mode}</span>
                          {viewMode === mode && <Check className="w-3.5 h-3.5 text-foreground" />}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Primary Action Button: + Add event */}
              <button
                type="button"
                onClick={() => handleOpenAddEvent()}
                className="h-9 px-4 rounded-xl bg-foreground text-background text-xs font-semibold hover:opacity-90 transition-all flex items-center gap-1.5 shadow-sm active:scale-95 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add event</span>
              </button>
            </div>
          </div>

          {/* Quick Inline Search Bar if activated */}
          {isInlineSearchOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="pt-4 pb-1"
            >
              <div className="flex items-center gap-2 p-2 rounded-2xl bg-[#F4F4F7] dark:bg-[#1a1a1c] border border-[#E7E7EC] dark:border-[#323238]">
                <Search className="w-4 h-4 text-muted-foreground ml-2 shrink-0" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Filter events by title, description, team, or location..."
                  className="w-full bg-transparent text-xs text-foreground placeholder:text-muted-foreground focus:outline-none"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="text-xs text-muted-foreground hover:text-foreground mr-2 font-medium"
                  >
                    Clear
                  </button>
                )}
              </div>
            </motion.div>
          )}

          {/* VIEW: MONTH VIEW (Default - Identical to Screenshot) */}
          {viewMode === "Month view" && (
            <div className="mt-5">
              {/* Responsive Container for Calendar Grid */}
              <div className="w-full overflow-x-auto no-scrollbar">
                <div className="min-w-[760px] lg:min-w-full">
                  {/* Days of Week Header */}
                  <div className="grid grid-cols-7 border-b border-[#E7E7EC] dark:border-[#323238] pb-2.5">
                    {DAYS_OF_WEEK.map((dayName) => (
                      <div
                        key={dayName}
                        className="text-xs font-semibold text-muted-foreground/80 px-2 text-left"
                      >
                        {dayName}
                      </div>
                    ))}
                  </div>

                  {/* Calendar Month Grid Cells */}
                  <div className="grid grid-cols-7 border-l border-t border-[#E7E7EC] dark:border-[#323238]">
                    {calendarGrid.map((cell, idx) => {
                      const dayEvents = eventsByDate.get(cell.dateStr) || [];
                      const maxVisible = 3;
                      const visibleEvents = dayEvents.slice(0, maxVisible);
                      const overflowCount = dayEvents.length - maxVisible;

                      return (
                        <div
                          key={cell.dateStr + "-" + idx}
                          onClick={(e) => {
                            // If clicked on cell background, prompt to add event
                            if ((e.target as HTMLElement).tagName === "DIV") {
                              setSelectedDate(cell.dateStr);
                            }
                          }}
                          className={`min-h-[120px] lg:min-h-[135px] p-2 border-r border-b border-[#E7E7EC] dark:border-[#323238] transition-colors flex flex-col justify-between group ${
                            cell.isCurrentMonth
                              ? "bg-white dark:bg-[#242428] hover:bg-[#F4F4F7] dark:hover:bg-[#2a2a30]"
                              : "bg-[#F8F8FA] dark:bg-[#1c1c20] text-muted-foreground/50"
                          }`}
                        >
                          {/* Cell Header: Day Number */}
                          <div className="flex items-center justify-between mb-1.5">
                            {cell.isToday ? (
                              <div className="w-6 h-6 rounded-full bg-foreground text-background flex items-center justify-center font-bold text-xs shadow-xs">
                                {cell.dayNumber}
                              </div>
                            ) : (
                              <span
                                className={`text-xs font-medium pl-0.5 ${
                                  cell.isCurrentMonth
                                    ? "text-foreground"
                                    : "text-muted-foreground/45"
                                }`}
                              >
                                {cell.dayNumber}
                              </span>
                            )}

                            {/* Hover Plus Button for instant event creation */}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOpenAddEvent(cell.dateStr);
                              }}
                              className="opacity-0 group-hover:opacity-100 w-5 h-5 rounded-md hover:bg-accent text-muted-foreground hover:text-foreground grid place-items-center transition-opacity"
                              title={`Add event on ${cell.dateStr}`}
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>

                          {/* Events Pills Container */}
                          <div className="space-y-1 flex-1">
                            {visibleEvents.map((evt) => {
                              const style = COLOR_THEME_STYLES[evt.theme];
                              return (
                                <button
                                  key={evt.id}
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedEvent(evt);
                                  }}
                                  className={`w-full flex items-center justify-between gap-1 px-2 py-1 rounded-lg text-left text-[11px] font-medium border transition-all cursor-pointer shadow-xs truncate ${
                                    style.bg
                                  } ${style.text} ${style.border} hover:opacity-90 active:scale-[0.99]`}
                                  title={`${evt.title} (${evt.timeStart})`}
                                >
                                  <div className="flex items-center gap-1.5 truncate">
                                    {evt.hasBullet && (
                                      <span
                                        className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                                          style.dotColor || "bg-current"
                                        }`}
                                      />
                                    )}
                                    <span className="truncate">{evt.title}</span>
                                  </div>
                                  <span className="text-[10px] opacity-75 shrink-0 font-normal">
                                    {evt.timeStart}
                                  </span>
                                </button>
                              );
                            })}

                            {/* Overflow count link (e.g. "2 more...", "3 more...") */}
                            {overflowCount > 0 && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setOverflowDate(cell.dateStr);
                                }}
                                className="text-[11px] font-medium text-muted-foreground hover:text-foreground pl-1 pt-0.5 text-left block transition-colors cursor-pointer"
                              >
                                {overflowCount} more...
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* VIEW: WEEK VIEW */}
          {viewMode === "Week view" && (
            <div className="mt-5 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-7 gap-3">
                {weekDays.map((dayInfo) => {
                  const dayEvents = eventsByDate.get(dayInfo.dateStr) || [];
                  const isToday = dayInfo.isToday;

                  return (
                    <div
                      key={dayInfo.dayName}
                      className={`p-3.5 rounded-2xl border transition-colors flex flex-col min-h-[300px] ${
                        isToday
                          ? "bg-accent/40 border-foreground/30 shadow-xs"
                          : "bg-white dark:bg-[#242428] border-[#E7E7EC] dark:border-[#323238]"
                      }`}
                    >
                      <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#E7E7EC] dark:border-[#323238]">
                        <div>
                          <p className="text-[11px] font-semibold text-muted-foreground uppercase">
                            {dayInfo.dayName}
                          </p>
                          <p className="text-sm font-bold text-foreground">{dayInfo.dayNum}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleOpenAddEvent(dayInfo.dateStr)}
                          className="w-6 h-6 rounded-lg hover:bg-accent grid place-items-center text-muted-foreground hover:text-foreground"
                          title="Add event"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="space-y-1.5 flex-1">
                        {dayEvents.length === 0 ? (
                          <p className="text-[11px] text-muted-foreground/60 italic pt-2">
                            No events
                          </p>
                        ) : (
                          dayEvents.map((evt) => {
                            const style = COLOR_THEME_STYLES[evt.theme];
                            return (
                              <button
                                key={evt.id}
                                type="button"
                                onClick={() => setSelectedEvent(evt)}
                                className={`w-full p-2 rounded-xl text-left text-xs font-medium border transition-all ${
                                  style.bg
                                } ${style.text} ${style.border} hover:opacity-90 active:scale-[0.99]`}
                              >
                                <div className="flex items-center gap-1.5 truncate">
                                  {evt.hasBullet && (
                                    <span
                                      className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                                        style.dotColor || "bg-current"
                                      }`}
                                    />
                                  )}
                                  <span className="font-semibold truncate">{evt.title}</span>
                                </div>
                                <div className="text-[10px] opacity-80 mt-1 flex items-center justify-between">
                                  <span>{evt.timeStart}</span>
                                  {evt.project && <span>{evt.project}</span>}
                                </div>
                              </button>
                            );
                          })
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* VIEW: DAY VIEW */}
          {viewMode === "Day view" && (
            <div className="mt-5 space-y-4">
              <div className="flex items-center justify-between p-4 rounded-2xl bg-[#F4F4F7] dark:bg-[#1a1a1c] border border-[#E7E7EC] dark:border-[#323238]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-foreground text-background font-bold text-sm grid place-items-center">
                    {dayViewDate.dayNum}
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                      <span>{dayViewDate.formatted}</span>
                      {dayViewDate.isToday && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                          Today
                        </span>
                      )}
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      {(eventsByDate.get(selectedDate) || []).length} scheduled items
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleOpenAddEvent(selectedDate)}
                  className="px-3.5 py-1.5 rounded-xl bg-foreground text-background text-xs font-semibold hover:opacity-90 flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Event</span>
                </button>
              </div>

              {/* Timeline Schedule for Day */}
              <div className="divide-y divide-[#E7E7EC] dark:divide-[#323238] border border-[#E7E7EC] dark:border-[#323238] rounded-2xl overflow-hidden bg-white dark:bg-[#242428]">
                {[
                  "09:00 AM",
                  "10:00 AM",
                  "11:00 AM",
                  "12:00 PM",
                  "01:00 PM",
                  "02:00 PM",
                  "03:00 PM",
                  "04:00 PM",
                  "05:00 PM",
                ].map((hour) => {
                  const dayEvents = (eventsByDate.get(selectedDate) || []).filter((e) =>
                    e.timeStart.startsWith(hour.split(":")[0]),
                  );

                  return (
                    <div
                      key={hour}
                      className="flex flex-col sm:flex-row sm:items-center p-3 sm:p-4 gap-3"
                    >
                      <div className="w-24 text-xs font-semibold text-muted-foreground shrink-0">
                        {hour}
                      </div>
                      <div className="flex-1 space-y-2">
                        {dayEvents.length === 0 ? (
                          <span className="text-xs text-muted-foreground/40 italic">
                            Available slot
                          </span>
                        ) : (
                          dayEvents.map((evt) => {
                            const style = COLOR_THEME_STYLES[evt.theme];
                            return (
                              <button
                                key={evt.id}
                                type="button"
                                onClick={() => setSelectedEvent(evt)}
                                className={`w-full p-3 rounded-xl border flex items-center justify-between text-left transition-all ${
                                  style.bg
                                } ${style.text} ${style.border} hover:opacity-90 active:scale-[0.99]`}
                              >
                                <div>
                                  <h4 className="text-xs font-bold">{evt.title}</h4>
                                  <p className="text-[11px] opacity-80 mt-0.5">
                                    {evt.timeStart} – {evt.timeEnd || "Wrapup"} •{" "}
                                    {evt.project || "General"}
                                  </p>
                                </div>
                                {evt.meetingLink && (
                                  <span className="px-2.5 py-1 rounded-lg bg-background/80 text-[10px] font-semibold">
                                    Join Link
                                  </span>
                                )}
                              </button>
                            );
                          })
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* VIEW: AGENDA VIEW */}
          {viewMode === "Agenda view" && (
            <div className="mt-5 space-y-4">
              <div className="space-y-3">
                {Array.from(eventsByDate.entries())
                  .sort(([a], [b]) => a.localeCompare(b))
                  .map(([dateKey, dayList]) => (
                    <div
                      key={dateKey}
                      className="p-4 rounded-2xl border border-[#E7E7EC] dark:border-[#323238] bg-white dark:bg-[#242428] space-y-3"
                    >
                      <div className="flex items-center justify-between border-b border-[#E7E7EC] dark:border-[#323238] pb-2">
                        <div className="flex items-center gap-2">
                          <CalendarDays className="w-4 h-4 text-muted-foreground" />
                          <span className="text-xs font-bold text-foreground">
                            {new Date(dateKey + "T00:00:00").toLocaleDateString("en-US", {
                              weekday: "short",
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </span>
                        </div>
                        <span className="text-[11px] text-muted-foreground">
                          {dayList.length} events
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                        {dayList.map((evt) => {
                          const style = COLOR_THEME_STYLES[evt.theme];
                          return (
                            <button
                              key={evt.id}
                              type="button"
                              onClick={() => setSelectedEvent(evt)}
                              className={`p-3 rounded-xl border text-left transition-all ${
                                style.bg
                              } ${style.text} ${style.border} hover:opacity-90 active:scale-[0.99]`}
                            >
                              <div className="flex items-center justify-between gap-1">
                                <div className="flex items-center gap-1.5 truncate">
                                  {evt.hasBullet && (
                                    <span
                                      className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                                        style.dotColor || "bg-current"
                                      }`}
                                    />
                                  )}
                                  <span className="font-semibold text-xs truncate">
                                    {evt.title}
                                  </span>
                                </div>
                                <span className="text-[10px] opacity-75 font-medium">
                                  {evt.timeStart}
                                </span>
                              </div>
                              {evt.description && (
                                <p className="text-[11px] opacity-80 mt-1 line-clamp-1">
                                  {evt.description}
                                </p>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <EventModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditEventData(null);
        }}
        onSave={handleSaveEvent}
        initialDate={selectedDate}
        editEvent={editEventData}
      />

      <EventDetailModal
        event={selectedEvent}
        onClose={() => setSelectedEvent(null)}
        onEdit={handleEditEvent}
        onDelete={handleDeleteEvent}
      />

      <DayEventsModal
        isOpen={!!overflowDate}
        dateStr={overflowDate || "2025-01-10"}
        events={overflowDate ? eventsByDate.get(overflowDate) || [] : []}
        onClose={() => setOverflowDate(null)}
        onSelectEvent={(evt) => setSelectedEvent(evt)}
        onAddEvent={(d) => handleOpenAddEvent(d)}
      />
    </AppShell>
  );
}
