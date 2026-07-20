import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { useState, useMemo, useEffect, useRef } from "react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "motion/react";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Plus,
  Search,
  Clock,
  Users,
  Play,
  Pause,
  Square,
  CheckCircle2,
  Check,
  AlertTriangle,
  Trash2,
  Video,
  MapPin,
  ExternalLink,
  Filter,
  Folder,
  ChevronDown,
  Award,
  CheckSquare,
  ShieldCheck,
  Activity,
  FileText,
  User,
  Info,
  CalendarCheck2,
} from "lucide-react";

export const Route = createFileRoute("/calendar")({
  component: CalendarPage,
});

// Event Data Types
interface CalendarEvent {
  id: string;
  type:
    "task" | "meeting" | "deadline" | "approval" | "time_log" | "leave" | "reminder" | "birthday";
  title: string;
  project: string;
  timeStart: string; // e.g. "09:00 AM"
  timeEnd?: string; // e.g. "10:30 AM"
  date: string; // e.g. "2026-07-16"
  priority?: "HIGH" | "MEDIUM" | "LOW";
  status?: string;
  hours?: number;
  participants?: string[];
  meetingLink?: string;
  location?: string;
  requestedBy?: string;
  approvalStage?: string;
  checklist?: { id: string; text: string; completed: boolean }[];
  description?: string;
  comments?: { user: string; text: string; time: string }[];
}

// 11 Core Working Hours for Timeline Slot Allocation
const TIMELINE_HOURS = [
  "08:00 AM",
  "09:00 AM",
  "10:00 AM",
  "11:00 AM",
  "12:00 PM",
  "01:00 PM",
  "02:00 PM",
  "03:00 PM",
  "04:00 PM",
  "05:00 PM",
  "06:00 PM",
];

// Hour Bucket matching helper
function getHourBucket(timeStart: string): string {
  const cleaned = timeStart.trim().toUpperCase();
  const ampm = cleaned.includes("PM") ? "PM" : "AM";

  const match = cleaned.match(/(\d+):(\d+)/);
  if (!match) {
    if (cleaned.includes("NOW")) return "02:00 PM";
    return "09:00 AM";
  }

  let hour = parseInt(match[1], 10);
  if (hour < 1 || hour > 12) hour = 9;

  const formattedHour = hour.toString().padStart(2, "0");
  return `${formattedHour}:00 ${ampm}`;
}

function CalendarPage() {
  // Selected Day (Default is Thursday, 16 July 2026)
  const [selectedDate, setSelectedDate] = useState("2026-07-16");
  const [currentView, setCurrentView] = useState<"day" | "week" | "month" | "agenda">("day");
  const [searchQuery, setSearchQuery] = useState("");

  // Dropdown States for Header
  const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false);
  const [isProjectDropdownOpen, setIsProjectDropdownOpen] = useState(false);

  const filterRef = useRef<HTMLDivElement>(null);
  const projectRef = useRef<HTMLDivElement>(null);

  // Timer State
  const [activeTimerTaskId, setActiveTimerTaskId] = useState<string | null>(null);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  // Filters State
  const [filters, setFilters] = useState({
    task: true,
    meeting: true,
    deadline: true,
    approval: true,
    time_log: true,
    leave: true,
    reminder: true,
    birthday: true,
  });

  // Project Filter
  const [projectFilter, setProjectFilter] = useState("All");

  // Selected Event details
  const [selectedEventId, setSelectedEventId] = useState<string | null>("evt_1");

  // Dialog Controls
  const [isAddEventOpen, setIsAddEventOpen] = useState(false);
  const [isWarningOpen, setIsWarningOpen] = useState(false);
  const [pendingMoveEvent, setPendingMoveEvent] = useState<{
    eventId: string;
    newTime: string;
    newDate: string;
  } | null>(null);

  // New Event Form State
  const [newTitle, setNewTitle] = useState("");
  const [newType, setNewType] = useState<CalendarEvent["type"]>("task");
  const [newProject, setNewProject] = useState("Internal");
  const [newCustomProject, setNewCustomProject] = useState("");
  const [newDate, setNewDate] = useState("2026-07-16");
  const [newTimeStart, setNewTimeStart] = useState("09:00 AM");
  const [newTimeEnd, setNewTimeEnd] = useState("10:00 AM");
  const [newPriority, setNewPriority] = useState<"HIGH" | "MEDIUM" | "LOW">("MEDIUM");
  const [newHours, setNewHours] = useState(1.5);
  const [newDescription, setNewDescription] = useState("");
  const [newLocation, setNewLocation] = useState("");
  const [newParticipants, setNewParticipants] = useState("");

  // Master events list
  const [events, setEvents] = useState<CalendarEvent[]>([
    {
      id: "evt_1",
      type: "meeting",
      title: "UX Huddle Call",
      project: "Helix Health",
      timeStart: "09:00 AM",
      timeEnd: "10:00 AM",
      date: "2026-07-16",
      participants: ["Sandy (You)", "Supraja", "Rahul", "Ivan"],
      meetingLink: "https://meet.google.com/ux-huddle-loooped",
      description:
        "Review current design changes & feedback regarding client journey workflow bottlenecks.",
      comments: [
        { user: "Supraja", text: "Please bring current landing templates.", time: "8:30 AM" },
      ],
    },
    {
      id: "evt_2",
      type: "task",
      title: "Standup Meeting & Board Triage",
      project: "Internal",
      timeStart: "09:45 AM",
      timeEnd: "10:45 AM",
      date: "2026-07-16",
      priority: "MEDIUM",
      status: "On Track",
      hours: 1.0,
      description: "Standard morning pod check-in & priority alignment.",
      checklist: [
        { id: "c1", text: "Report project timesheet metrics", completed: true },
        { id: "c2", text: "Coordinate designer handoff", completed: false },
      ],
    },
    {
      id: "evt_3",
      type: "task",
      title: "Design Sync — Website Revamp",
      project: "ThreadSense AI",
      timeStart: "10:00 AM",
      timeEnd: "11:45 AM",
      date: "2026-07-16",
      priority: "HIGH",
      status: "In Progress",
      hours: 1.75,
      description: "Update grid and align landing mockups to new corporate brand design rules.",
    },
    {
      id: "evt_4",
      type: "task",
      title: "UX Audit Sync — Waveflow Studio",
      project: "Helix Health",
      timeStart: "11:00 AM",
      timeEnd: "11:45 AM",
      date: "2026-07-16",
      priority: "LOW",
      status: "Approved",
      hours: 0.75,
      description: "Approve waveflow system audits.",
    },
    {
      id: "evt_5",
      type: "approval",
      title: "Homepage Layout Handoff Approval",
      project: "Meridian",
      timeStart: "11:30 AM",
      timeEnd: "12:00 PM",
      date: "2026-07-16",
      requestedBy: "Rahul",
      approvalStage: "V1 Sign-off",
      description:
        "Sandy needs to approve the Meridian homepage design system spec so it can progress to developer pod.",
    },
    {
      id: "evt_6",
      type: "task",
      title: "Sprint Check-in — Tasklio",
      project: "Aurora Coffee",
      timeStart: "11:00 AM",
      timeEnd: "12:00 PM",
      date: "2026-07-16",
      priority: "LOW",
      status: "On Track",
      hours: 1.0,
      description: "Align Tasklio integration benchmarks.",
    },
    {
      id: "evt_7",
      type: "task",
      title: "Design Review: Dark Mode UI",
      project: "Kite Motors",
      timeStart: "01:00 PM",
      timeEnd: "02:15 PM",
      date: "2026-07-16",
      priority: "HIGH",
      status: "In Progress",
      hours: 1.25,
      description:
        "Refining contrast values and custom twilight mode setups for the buyer portal dashboard.",
    },
    {
      id: "evt_8",
      type: "deadline",
      title: "Brand Style Guide Submission Due",
      project: "Helix Health",
      timeStart: "04:00 PM",
      date: "2026-07-16",
      description: "Critical client review milestone. High importance.",
    },
    {
      id: "evt_9",
      type: "meeting",
      title: "Client Review Call — Waveflow",
      project: "Meridian",
      timeStart: "01:00 PM",
      timeEnd: "02:00 PM",
      date: "2026-07-16",
      participants: ["Sandy", "Acme Representative", "Supraja"],
      meetingLink: "https://meet.google.com/client-review-call",
      description: "Gather feedback regarding newly implemented workspace features.",
    },
    {
      id: "evt_10",
      type: "time_log",
      title: "Logged 2.0 hrs: Wireframe design",
      project: "Helix Health",
      timeStart: "02:30 PM",
      timeEnd: "04:30 PM",
      date: "2026-07-16",
      hours: 2.0,
    },
    {
      id: "evt_11",
      type: "birthday",
      title: "Ivan's Birthday! 🎂",
      project: "Internal",
      timeStart: "12:00 PM",
      date: "2026-07-18",
      description: "Celebrate Ivan's birthday at the lounge.",
    },
    {
      id: "evt_12",
      type: "leave",
      title: "Marketing Team Retreat",
      project: "Internal",
      timeStart: "09:00 AM",
      timeEnd: "05:00 PM",
      date: "2026-07-17",
      description: "Annual out-of-office team building exercise.",
    },
    {
      id: "evt_13",
      type: "reminder",
      title: "Pre-read Meridian proposal docs",
      project: "Meridian",
      timeStart: "08:30 AM",
      date: "2026-07-16",
    },
  ]);

  // Click outside to close dropdowns
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
        setIsFilterDropdownOpen(false);
      }
      if (projectRef.current && !projectRef.current.contains(event.target as Node)) {
        setIsProjectDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Handle active timer tracking
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTimerRunning && activeTimerTaskId) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, activeTimerTaskId]);

  const activeTimerTask = useMemo(() => {
    return events.find((e) => e.id === activeTimerTaskId);
  }, [events, activeTimerTaskId]);

  const formatTimerTime = (totalSecs: number) => {
    const hrs = Math.floor(totalSecs / 3600);
    const mins = Math.floor((totalSecs % 3600) / 60);
    const secs = totalSecs % 60;
    return `${hrs.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Capacity calculations for Selected Day
  const capacityTotal = 7;
  const dayTasks = useMemo(() => {
    return events.filter((e) => e.date === selectedDate && e.type === "task");
  }, [events, selectedDate]);

  const allocatedHoursToday = useMemo(() => {
    return dayTasks.reduce((sum, item) => sum + (item.hours || 0), 0);
  }, [dayTasks]);

  const capacityRemaining = Math.max(0, capacityTotal - allocatedHoursToday);
  const capacityPercent = Math.min(100, (allocatedHoursToday / capacityTotal) * 100);

  // List of active project names
  const projectsList = useMemo(() => {
    const projs = new Set<string>();
    events.forEach((e) => {
      if (e.project) projs.add(e.project);
    });
    return ["All", ...Array.from(projs)];
  }, [events]);

  // Filtered Events based on sidebar config & search query
  const filteredEvents = useMemo(() => {
    return events.filter((e) => {
      if (!filters[e.type as keyof typeof filters]) return false;
      if (projectFilter !== "All" && e.project !== projectFilter) return false;
      if (searchQuery.trim() !== "") {
        const query = searchQuery.toLowerCase();
        const matchesTitle = e.title.toLowerCase().includes(query);
        const matchesProject = e.project.toLowerCase().includes(query);
        const matchesDesc = e.description?.toLowerCase().includes(query) || false;
        if (!matchesTitle && !matchesProject && !matchesDesc) return false;
      }
      return true;
    });
  }, [events, filters, projectFilter, searchQuery]);

  // Selected event object lookup
  const selectedEvent = useMemo(() => {
    return events.find((e) => e.id === selectedEventId) || null;
  }, [events, selectedEventId]);

  // Shift Event timing action (simulates drag/drop timing change)
  const shiftEventTime = (eventId: string, newTime: string, newDate: string) => {
    const event = events.find((e) => e.id === eventId);
    if (!event) return;

    if (event.type === "task" && event.hours) {
      const targetDayTasks = events.filter(
        (e) => e.date === newDate && e.type === "task" && e.id !== eventId,
      );
      const targetDayHours =
        targetDayTasks.reduce((sum, item) => sum + (item.hours || 0), 0) + event.hours;

      if (targetDayHours > capacityTotal) {
        setPendingMoveEvent({ eventId, newTime, newDate });
        setIsWarningOpen(true);
        return;
      }
    }

    setEvents((prev) =>
      prev.map((e) => {
        if (e.id === eventId) {
          toast.success(`Rescheduled "${e.title}" to ${newTime} on ${newDate}`);
          return { ...e, timeStart: newTime, date: newDate };
        }
        return e;
      }),
    );
  };

  const handleConfirmMoveAnyway = () => {
    if (pendingMoveEvent) {
      const { eventId, newTime, newDate } = pendingMoveEvent;
      setEvents((prev) =>
        prev.map((e) => {
          if (e.id === eventId) {
            toast.warning(`Rescheduled with capacity override: "${e.title}" to ${newTime}`);
            return { ...e, timeStart: newTime, date: newDate };
          }
          return e;
        }),
      );
    }
    setIsWarningOpen(false);
    setPendingMoveEvent(null);
  };

  // Add event handler
  const handleCreateEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) {
      toast.error("Please provide an event title");
      return;
    }

    const finalProject =
      newProject === "Other" ? newCustomProject.trim() || "Custom Project" : newProject;

    const newEvt: CalendarEvent = {
      id: "evt_" + Date.now(),
      type: newType,
      title: newTitle,
      project: finalProject,
      timeStart: newTimeStart,
      timeEnd: newType === "deadline" || newType === "reminder" ? undefined : newTimeEnd,
      date: newDate,
      priority: newType === "task" ? newPriority : undefined,
      status: newType === "task" ? "On Track" : undefined,
      hours: newType === "task" || newType === "time_log" ? Number(newHours) || 1.0 : undefined,
      description: newDescription,
      location: newType === "meeting" ? newLocation : undefined,
      participants:
        newType === "meeting" && newParticipants
          ? newParticipants.split(",").map((p) => p.trim())
          : undefined,
    };

    if (newType === "task" && newEvt.hours) {
      const targetDayTasks = events.filter((e) => e.date === newDate && e.type === "task");
      const targetDayHours =
        targetDayTasks.reduce((sum, item) => sum + (item.hours || 0), 0) + newEvt.hours;

      if (targetDayHours > capacityTotal) {
        setPendingMoveEvent({ eventId: newEvt.id, newTime: newTimeStart, newDate: newDate });
        setEvents((prev) => [newEvt, ...prev]);
        setIsWarningOpen(true);
        toast.info("Task added but capacity warning triggered.");
        resetForm();
        setIsAddEventOpen(false);
        return;
      }
    }

    setEvents((prev) => [newEvt, ...prev]);
    toast.success(`Event added successfully: ${newTitle}`);
    resetForm();
    setIsAddEventOpen(false);
  };

  const resetForm = () => {
    setNewTitle("");
    setNewType("task");
    setNewProject("Internal");
    setNewCustomProject("");
    setNewDate("2026-07-16");
    setNewTimeStart("09:00 AM");
    setNewTimeEnd("10:00 AM");
    setNewPriority("MEDIUM");
    setNewHours(1.5);
    setNewDescription("");
    setNewLocation("");
    setNewParticipants("");
  };

  const toggleChecklist = (eventId: string, itemId: string) => {
    setEvents((prev) =>
      prev.map((e) => {
        if (e.id === eventId && e.checklist) {
          const updatedCheck = e.checklist.map((item) =>
            item.id === itemId ? { ...item, completed: !item.completed } : item,
          );
          return { ...e, checklist: updatedCheck };
        }
        return e;
      }),
    );
  };

  const handleDeleteEvent = (eventId: string) => {
    setEvents((prev) => prev.filter((e) => e.id !== eventId));
    if (selectedEventId === eventId) {
      setSelectedEventId(null);
    }
    toast.success("Event deleted from planner");
  };

  // Days of the active week
  const weekDays = [
    { name: "Mon", date: "2026-07-13", num: 13 },
    { name: "Tue", date: "2026-07-14", num: 14 },
    { name: "Wed", date: "2026-07-15", num: 15 },
    { name: "Thu", date: "2026-07-16", num: 16, isToday: true },
    { name: "Fri", date: "2026-07-17", num: 17 },
    { name: "Sat", date: "2026-07-18", num: 18 },
    { name: "Sun", date: "2026-07-19", num: 19 },
  ];

  // Count active filters
  const activeFiltersCount = Object.values(filters).filter(Boolean).length;

  return (
    <AppShell breadcrumb={["Planner", "My Calendar"]}>
      {/* GLOW BACKGROUND EFFECT */}
      <div className="absolute top-[10%] left-[40%] w-[450px] h-[450px] rounded-full bg-[#5A82E8]/12 dark:bg-[#5A82E8]/6 blur-[110px] pointer-events-none z-0" />
      <div className="absolute bottom-[20%] right-[10%] w-[400px] h-[400px] rounded-full bg-[#E4664F]/8 dark:bg-[#E4664F]/4 blur-[120px] pointer-events-none z-0" />

      <div className="relative z-10 space-y-6">
        {/* PAGE HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-[30px] font-semibold tracking-tight">Calendar</h1>
            <p className="text-[14px] text-muted-foreground mt-1">
              Weekly planner · Capacity allocation monitor
            </p>
          </div>
        </div>

        {/* TOP COMPACT NAV BAR (fits capacity monitor + filters + projects dropdown) */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white/80 dark:bg-[#162135]/60 backdrop-blur-md p-4 px-5 rounded-3xl border border-white/60 dark:border-[#2a384e]/30 shadow-[var(--shadow-soft)]">
          {/* 1. HORIZONTAL CAPACITY MONITOR IN TOP NAV */}
          <div className="flex items-center gap-4 flex-wrap lg:flex-nowrap">
            <div className="flex items-center gap-2 bg-[#F4F4F7]/60 dark:bg-[#242428]/40 p-2 px-3.5 rounded-2xl border border-border/30">
              <Activity className="w-4 h-4 text-[#5A82E8]" />
              <div className="text-left">
                <div className="flex items-center gap-1.5 leading-none mb-0.5">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Capacity
                  </span>
                  <span
                    className={`text-[11px] font-semibold px-1.5 py-0.5 rounded-full ${
                      allocatedHoursToday > capacityTotal
                        ? "bg-[#E4664F]/10 text-[#E4664F]"
                        : allocatedHoursToday >= capacityTotal * 0.8
                          ? "bg-[#E29A21]/10 text-[#E29A21]"
                          : "bg-[#33A579]/10 text-[#33A579]"
                    }`}
                  >
                    {allocatedHoursToday > capacityTotal
                      ? "Full"
                      : allocatedHoursToday >= capacityTotal * 0.8
                        ? "Alert"
                        : "OK"}
                  </span>
                </div>
                <p className="text-sm font-semibold text-[#111111] dark:text-white leading-none">
                  {allocatedHoursToday.toFixed(1)}{" "}
                  <span className="text-xs font-normal text-muted-foreground">
                    / {capacityTotal} hrs
                  </span>
                </p>
              </div>
            </div>

            {/* Horizontal mini bar tracker */}
            <div className="hidden sm:block w-[120px] space-y-1">
              <div className="w-full bg-[#E7E7EC] dark:bg-[#323238] h-2 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    allocatedHoursToday > capacityTotal
                      ? "bg-[#E4664F]"
                      : allocatedHoursToday >= capacityTotal * 0.8
                        ? "bg-[#E29A21]"
                        : "bg-[#5A82E8]"
                  }`}
                  style={{ width: `${capacityPercent}%` }}
                />
              </div>
              <p className="text-[11px] text-[#757575] dark:text-gray-400 font-medium tracking-tight text-right leading-none">
                {capacityRemaining.toFixed(1)} hrs left
              </p>
            </div>
          </div>

          {/* 2. ACTIONS / CONTROLS (Filters, Projects dropdown, View selector, Add Event) */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* TIMELINE FILTERS POPUP DROPDOWN */}
            <div className="relative" ref={filterRef}>
              <button
                onClick={() => setIsFilterDropdownOpen(!isFilterDropdownOpen)}
                className={`h-9 px-3.5 rounded-xl border text-[12px] font-semibold flex items-center gap-1.5 transition-all ${
                  isFilterDropdownOpen
                    ? "bg-[#5A82E8] text-white border-[#5A82E8]"
                    : "bg-white dark:bg-[#1f1f23] text-gray-700 dark:text-gray-200 border-border/70 hover:bg-slate-50 dark:hover:bg-[#242428]"
                }`}
              >
                <Filter className="w-3.5 h-3.5" />
                <span>Filters ({activeFiltersCount})</span>
                <ChevronDown className="w-3 h-3 opacity-60" />
              </button>

              <AnimatePresence>
                {isFilterDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 8 }}
                    className="absolute right-0 mt-2 w-56 bg-white dark:bg-[#1c1c20] border border-border/80 rounded-2xl p-4 shadow-xl z-50 space-y-3"
                  >
                    <div className="flex items-center justify-between border-b pb-2">
                      <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                        Show items
                      </span>
                      <button
                        onClick={() => {
                          const allOn = Object.values(filters).some((v) => !v);
                          setFilters({
                            task: allOn,
                            meeting: allOn,
                            deadline: allOn,
                            approval: allOn,
                            time_log: allOn,
                            leave: allOn,
                            reminder: allOn,
                            birthday: allOn,
                          });
                        }}
                        className="text-[10px] text-[#5A82E8] font-semibold hover:underline"
                      >
                        Toggle All
                      </button>
                    </div>

                    <div className="space-y-2.5">
                      {[
                        { key: "task", label: "Tasks", color: "bg-[#5A82E8]" },
                        { key: "meeting", label: "Meetings", color: "bg-[#8A6CE0]" },
                        { key: "approval", label: "Approvals", color: "bg-[#E29A21]" },
                        { key: "deadline", label: "Deadlines", color: "bg-[#E4664F]" },
                        { key: "time_log", label: "Time Logs", color: "bg-[#33A579]" },
                        { key: "reminder", label: "Reminders", color: "bg-yellow-400" },
                        { key: "leave", label: "Leave", color: "bg-gray-400" },
                        { key: "birthday", label: "Birthdays", color: "bg-pink-400" },
                      ].map((item) => (
                        <label
                          key={item.key}
                          className="flex items-center justify-between cursor-pointer group"
                        >
                          <div className="flex items-center gap-2">
                            <span className={`w-2 h-2 rounded-full ${item.color}`} />
                            <span className="text-xs font-medium text-gray-700 dark:text-gray-300 group-hover:text-foreground">
                              {item.label}
                            </span>
                          </div>
                          <input
                            type="checkbox"
                            checked={filters[item.key as keyof typeof filters]}
                            onChange={() =>
                              setFilters((prev) => ({
                                ...prev,
                                [item.key]: !prev[item.key as keyof typeof filters],
                              }))
                            }
                            className="rounded border-gray-300 dark:border-gray-600 text-[#5A82E8] focus:ring-[#5A82E8] h-3.5 w-3.5"
                          />
                        </label>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* MY ACTIVE PROJECTS SELECTOR DROPDOWN */}
            <div className="relative" ref={projectRef}>
              <button
                onClick={() => setIsProjectDropdownOpen(!isProjectDropdownOpen)}
                className="h-9 px-3.5 rounded-xl border border-border/70 bg-white dark:bg-[#1f1f23] text-[12px] font-semibold text-gray-700 dark:text-gray-200 flex items-center gap-1.5 hover:bg-slate-50 dark:hover:bg-[#242428] transition-all"
              >
                <Folder className="w-3.5 h-3.5 text-[#5A82E8]" />
                <span>Project: {projectFilter === "All" ? "All Projects" : projectFilter}</span>
                <ChevronDown className="w-3 h-3 opacity-60" />
              </button>

              <AnimatePresence>
                {isProjectDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 8 }}
                    className="absolute right-0 mt-2 w-52 bg-white dark:bg-[#1c1c20] border border-border/80 rounded-2xl p-1.5 shadow-xl z-50 space-y-0.5"
                  >
                    <p className="text-[9px] font-semibold text-muted-foreground p-2 uppercase tracking-wider border-b mb-1">
                      Select project scope
                    </p>
                    {projectsList.map((proj) => (
                      <button
                        key={proj}
                        onClick={() => {
                          setProjectFilter(proj);
                          setIsProjectDropdownOpen(false);
                          toast.info(`Filtering view to project: ${proj}`);
                        }}
                        className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                          projectFilter === proj
                            ? "bg-[#5A82E8] text-white"
                            : "text-[#555555] dark:text-[#D5E4F5] hover:bg-black/5 dark:hover:bg-white/5"
                        }`}
                      >
                        {proj === "All" ? "📂 All Projects" : `📁 ${proj}`}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="h-4 w-px bg-border/60 mx-1.5" />

            {/* View switching tabs */}
            <div className="flex bg-[#F4F4F7] dark:bg-[#242428] rounded-xl p-1 border border-border/50">
              {(["day", "week", "month", "agenda"] as const).map((v) => (
                <button
                  key={v}
                  onClick={() => {
                    setCurrentView(v);
                    toast.info(`Switched planner to ${v} view`);
                  }}
                  className={`px-3 py-1 text-xs font-semibold rounded-lg capitalize transition-colors ${
                    currentView === v
                      ? "bg-white dark:bg-[#111111] text-[#5A82E8] shadow-xs"
                      : "text-[#757575] hover:text-[#111111] dark:hover:text-white"
                  }`}
                >
                  {v}
                </button>
              ))}
            </div>

            {/* Create Trigger Button */}
            <button
              onClick={() => setIsAddEventOpen(true)}
              className="h-9 px-4 rounded-xl bg-[#5A82E8] text-white text-[12px] font-semibold flex items-center gap-1.5 hover:opacity-90 transition-opacity"
            >
              <Plus className="w-4 h-4" strokeWidth={2.5} />
              Add Event
            </button>
          </div>
        </div>

        {/* ACTIVE TIMER TRACKING CONTAINER */}
        <AnimatePresence>
          {activeTimerTaskId && activeTimerTask && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="flex items-center justify-between bg-gradient-to-r from-[#33A579] to-[#2e946c] text-white px-5 py-3 rounded-2xl shadow-md border border-[#33A579]/20">
                <div className="flex items-center gap-3">
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
                  </span>
                  <div>
                    <p className="text-[10px] font-semibold opacity-80 uppercase tracking-widest">
                      Active tracking logs
                    </p>
                    <p className="text-xs font-semibold">
                      {activeTimerTask.title} — {activeTimerTask.project}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="font-mono font-semibold text-md tracking-widest bg-black/25 px-3 py-1 rounded-xl">
                    {formatTimerTime(timerSeconds)}
                  </div>
                  <div className="flex items-center gap-1 bg-white/20 p-1 rounded-xl">
                    <button
                      onClick={() => setIsTimerRunning(!isTimerRunning)}
                      className="p-1.5 hover:bg-white/10 rounded-lg"
                      title={isTimerRunning ? "Pause" : "Play"}
                    >
                      {isTimerRunning ? (
                        <Pause className="w-3.5 h-3.5" />
                      ) : (
                        <Play className="w-3.5 h-3.5" />
                      )}
                    </button>
                    <button
                      onClick={() => {
                        setIsTimerRunning(false);
                        const loggedHrs = (timerSeconds / 3600).toFixed(2);
                        toast.success(
                          `Logged ${loggedHrs} hrs on task "${activeTimerTask.title}"!`,
                        );

                        const newLog: CalendarEvent = {
                          id: "evt_" + Date.now(),
                          type: "time_log",
                          title: `Recorded ${loggedHrs} hrs for work`,
                          project: activeTimerTask.project,
                          timeStart: "Now",
                          date: selectedDate,
                          hours: Number(loggedHrs),
                        };
                        setEvents((prev) => [newLog, ...prev]);
                        setActiveTimerTaskId(null);
                        setTimerSeconds(0);
                      }}
                      className="p-1.5 hover:bg-white/10 rounded-lg text-red-100"
                      title="Stop & Log"
                    >
                      <Square className="w-3.5 h-3.5 fill-current" />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* WORKSPACE MAIN LAYOUT GRID (Expanded: Calendar taking 9cols, details taking 3cols) */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
          {/* MAIN CALENDAR PANEL (COL-SPAN-9 - EXPANDED SPACE) */}
          <div className="xl:col-span-9 space-y-6">
            {/* SEARCH AND DAY NAVIGATOR */}
            <div className="flex flex-col sm:flex-row items-center gap-3 bg-white/50 dark:bg-[#162135]/30 p-2.5 rounded-2xl border border-border/40">
              <div className="relative w-full sm:flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A8A8A8]" />
                <input
                  type="text"
                  placeholder="Search events, tasks or logs..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-9 pl-10 pr-4 bg-white dark:bg-[#1f1f23] border border-border/50 rounded-xl text-[12px] focus:outline-none"
                />
              </div>

              {/* Weekly Slider navigator */}
              <div className="flex bg-slate-100 dark:bg-[#1c1c20] p-1 rounded-xl w-full sm:w-auto overflow-x-auto justify-between">
                {weekDays.map((d) => (
                  <button
                    key={d.date}
                    onClick={() => {
                      setSelectedDate(d.date);
                      toast.info(`Selected date: ${d.date}`);
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex flex-col items-center min-w-[44px] transition-all ${
                      selectedDate === d.date
                        ? "bg-white dark:bg-[#111111] text-[#5A82E8] shadow-sm scale-105"
                        : "text-[#757575] hover:text-[#111111] dark:hover:text-white"
                    }`}
                  >
                    <span className="text-[10px] uppercase font-medium opacity-75">{d.name}</span>
                    <span className="text-sm mt-0.5">{d.num}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* DAY VIEW: ADVANCED HOUR-BY-HOUR STACKED SIDE-BY-SIDE TIMELINE */}
            {currentView === "day" && (
              <div className="bg-gradient-to-br from-white/90 via-white/70 to-white/30 dark:from-[#162135]/65 dark:via-[#162135]/45 dark:to-[#162135]/20 backdrop-blur-[24px] border border-white/60 dark:border-[#2a384e]/30 rounded-3xl p-6 shadow-[var(--shadow-soft)] min-h-[550px]">
                {/* Header info */}
                <div className="border-b border-border/40 pb-4 mb-6 flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <h3 className="text-md font-semibold text-[#111111] dark:text-white flex items-center gap-2">
                      <CalendarCheck2 className="w-4 h-4 text-[#5A82E8]" />
                      <span>Daily Chronological Timeline</span>
                    </h3>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {selectedDate === "2026-07-16"
                        ? "Thursday, 16 July 2026 (Active)"
                        : `Selected: ${selectedDate}`}
                    </p>
                  </div>
                  <span className="text-xs bg-[#5A82E8]/10 text-[#5A82E8] px-3 py-1 rounded-full font-medium">
                    {filteredEvents.filter((e) => e.date === selectedDate).length} events allocated
                  </span>
                </div>

                {/* Hour-by-Hour Timeline Slot Stack */}
                <div className="space-y-4 max-h-[750px] overflow-y-auto pr-2">
                  {TIMELINE_HOURS.map((hourStr) => {
                    const matchedEvents = filteredEvents.filter(
                      (e) => e.date === selectedDate && getHourBucket(e.timeStart) === hourStr,
                    );

                    return (
                      <div key={hourStr} className="group/row flex items-start gap-4">
                        {/* Hour Indicator */}
                        <div className="w-20 pt-1 text-right flex flex-col justify-start">
                          <span className="text-xs font-medium text-[#111111] dark:text-gray-200">
                            {hourStr}
                          </span>
                          <span className="text-[10px] text-[#757575] font-medium tracking-wider uppercase opacity-60">
                            slot
                          </span>
                        </div>

                        {/* Event list stacked SIDE-BY-SIDE */}
                        <div className="flex-1 min-h-[70px] relative border-l-2 border-dashed border-slate-200 dark:border-slate-800/80 pl-4 pb-2">
                          {/* Grid alignment indicator rule on hover */}
                          <div className="absolute top-4 left-0 right-0 h-px border-t border-dashed border-slate-100 dark:border-slate-800 opacity-0 group-hover/row:opacity-100 pointer-events-none transition-opacity" />

                          {matchedEvents.length === 0 ? (
                            <div className="text-[11px] text-muted-foreground/50 italic font-medium py-3">
                              No scheduled priorities. Open time slot.
                            </div>
                          ) : (
                            <div className="flex flex-col sm:flex-row gap-3 items-stretch w-full">
                              {matchedEvents.map((evt) => (
                                <div key={evt.id} className="flex-1 min-w-[200px]">
                                  <EventCard
                                    event={evt}
                                    isSelected={selectedEventId === evt.id}
                                    onClick={() => setSelectedEventId(evt.id)}
                                    onShiftTime={(newTime) =>
                                      shiftEventTime(evt.id, newTime, selectedDate)
                                    }
                                  />
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}

                  {/* Catchall for events starting before/after the 8am-6pm core tracker */}
                  {(() => {
                    const nonTimelineEvents = filteredEvents.filter(
                      (e) =>
                        e.date === selectedDate &&
                        !TIMELINE_HOURS.includes(getHourBucket(e.timeStart)),
                    );
                    if (nonTimelineEvents.length === 0) return null;
                    return (
                      <div className="pt-4 border-t border-dashed border-border/40">
                        <h4 className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                          Other Daily Reminders
                        </h4>
                        <div className="flex flex-col gap-2">
                          {nonTimelineEvents.map((evt) => (
                            <EventCard
                              key={evt.id}
                              event={evt}
                              isSelected={selectedEventId === evt.id}
                              onClick={() => setSelectedEventId(evt.id)}
                              onShiftTime={(newTime) =>
                                shiftEventTime(evt.id, newTime, selectedDate)
                              }
                            />
                          ))}
                        </div>
                      </div>
                    );
                  })()}
                </div>
              </div>
            )}

            {/* WEEK VIEW */}
            {currentView === "week" && (
              <div className="bg-gradient-to-br from-white/90 via-white/70 to-white/30 dark:from-[#162135]/65 dark:via-[#162135]/45 dark:to-[#162135]/20 backdrop-blur-[24px] border border-white/60 dark:border-[#2a384e]/30 rounded-3xl p-5 shadow-[var(--shadow-soft)] overflow-x-auto">
                <div className="min-w-[650px]">
                  <div className="grid grid-cols-7 gap-2.5 border-b border-border/40 pb-3.5 mb-4">
                    {weekDays.map((day) => {
                      const isSel = selectedDate === day.date;
                      return (
                        <button
                          key={day.date}
                          onClick={() => {
                            setSelectedDate(day.date);
                            toast.info(`Date changed to ${day.date}`);
                          }}
                          className={`p-2.5 rounded-2xl flex flex-col items-center transition-all ${
                            isSel
                              ? "bg-[#5A82E8] text-white shadow-md scale-105"
                              : "bg-[#F4F4F7]/40 dark:bg-[#1c1c20]/40 text-muted-foreground hover:bg-slate-100"
                          }`}
                        >
                          <span className="text-xs uppercase font-medium tracking-wider">
                            {day.name}
                          </span>
                          <span className="text-lg font-medium mt-0.5">{day.num}</span>
                          {day.isToday && (
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${isSel ? "bg-white" : "bg-[#5A82E8]"} mt-1`}
                            />
                          )}
                        </button>
                      );
                    })}
                  </div>

                  <div className="grid grid-cols-7 gap-2.5 items-start min-h-[400px]">
                    {weekDays.map((day) => {
                      const dayEvts = filteredEvents.filter((e) => e.date === day.date);
                      return (
                        <div
                          key={day.date}
                          className={`space-y-2.5 p-1 rounded-2xl min-h-[380px] transition-colors ${
                            selectedDate === day.date
                              ? "bg-[#5A82E8]/5 dark:bg-[#5A82E8]/2 border border-[#5A82E8]/10"
                              : "bg-transparent"
                          }`}
                        >
                          {dayEvts.length === 0 ? (
                            <div className="text-center py-12 text-[10px] text-muted-foreground opacity-60">
                              Free Day
                            </div>
                          ) : (
                            dayEvts.map((evt) => (
                              <MiniEventCard
                                key={evt.id}
                                event={evt}
                                isSelected={selectedEventId === evt.id}
                                onClick={() => setSelectedEventId(evt.id)}
                              />
                            ))
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* MONTH VIEW */}
            {currentView === "month" && (
              <div className="bg-gradient-to-br from-white/90 via-white/70 to-white/30 dark:from-[#162135]/65 dark:via-[#162135]/45 dark:to-[#162135]/20 backdrop-blur-[24px] border border-white/60 dark:border-[#2a384e]/30 rounded-3xl p-5 shadow-[var(--shadow-soft)]">
                <div className="grid grid-cols-7 gap-1 text-center font-medium text-xs text-[#757575] pb-3 mb-2 border-b border-border/40">
                  <span>Mon</span>
                  <span>Tue</span>
                  <span>Wed</span>
                  <span>Thu</span>
                  <span>Fri</span>
                  <span>Sat</span>
                  <span>Sun</span>
                </div>

                <div className="grid grid-cols-7 gap-1 sm:gap-1.5 min-h-[220px] sm:min-h-[350px]">
                  {Array.from({ length: 2 }).map((_, i) => (
                    <div
                      key={`offset-${i}`}
                      className="p-1 sm:p-2 min-h-[40px] sm:min-h-[70px] bg-[#F4F4F7]/20 dark:bg-[#1c1c20]/20 opacity-30 rounded-lg sm:rounded-xl"
                    />
                  ))}

                  {Array.from({ length: 14 }).map((_, i) => {
                    const dayNum = i + 1;
                    const paddedNum = dayNum.toString().padStart(2, "0");
                    const dateStr = `2026-07-${paddedNum}`;
                    const dayEvts = filteredEvents.filter((e) => e.date === dateStr);
                    const isSelected = selectedDate === dateStr;

                    return (
                      <div
                        key={dateStr}
                        onClick={() => setSelectedDate(dateStr)}
                        className={`p-1 sm:p-2 min-h-[50px] sm:min-h-[80px] rounded-lg sm:rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                          isSelected
                            ? "border-[#5A82E8] bg-[#5A82E8]/5 shadow-xs"
                            : "border-border/30 bg-white/30 dark:bg-[#242428]/20 hover:bg-black/[0.02]"
                        }`}
                      >
                        <span
                          className={`text-[11px] font-medium ${isSelected ? "text-[#5A82E8]" : "text-muted-foreground"}`}
                        >
                          {dayNum}
                        </span>

                        <div className="space-y-0.5 mt-1">
                          {/* Desktop/Tablet view: show full text labeled pills */}
                          <div className="hidden sm:block space-y-0.5">
                            {dayEvts.slice(0, 2).map((e) => (
                              <div
                                key={e.id}
                                className={`text-[10px] truncate px-1 py-0.5 rounded-sm font-medium ${
                                  e.type === "task"
                                    ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
                                    : e.type === "meeting"
                                      ? "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300"
                                      : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300"
                                }`}
                              >
                                {e.title}
                              </div>
                            ))}
                            {dayEvts.length > 2 && (
                              <div className="text-[9px] text-[#757575] font-medium text-right">
                                +{dayEvts.length - 2} more
                              </div>
                            )}
                          </div>

                          {/* Mobile view: show compact colored dots to prevent clutter */}
                          <div className="flex sm:hidden flex-wrap gap-0.5 justify-center mt-1">
                            {dayEvts.slice(0, 3).map((e) => (
                              <span
                                key={e.id}
                                className={`w-1.5 h-1.5 rounded-full ${
                                  e.type === "task"
                                    ? "bg-blue-500"
                                    : e.type === "meeting"
                                      ? "bg-purple-500"
                                      : "bg-amber-500"
                                }`}
                              />
                            ))}
                            {dayEvts.length > 3 && (
                              <span className="text-[9px] text-muted-foreground font-medium leading-none">
                                +
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* AGENDA VIEW */}
            {currentView === "agenda" && (
              <div className="bg-gradient-to-br from-white/90 via-white/70 to-white/30 dark:from-[#162135]/65 dark:via-[#162135]/45 dark:to-[#162135]/20 backdrop-blur-[24px] border border-white/60 dark:border-[#2a384e]/30 rounded-3xl p-5 shadow-[var(--shadow-soft)] max-h-[500px] overflow-y-auto">
                <h3 className="text-md font-semibold text-[#111111] dark:text-white border-b border-border/40 pb-3 mb-4">
                  Agenda Action Items
                </h3>

                <div className="space-y-5">
                  {["2026-07-16", "2026-07-17", "2026-07-18"].map((date) => {
                    const dayEvts = filteredEvents.filter((e) => e.date === date);
                    if (dayEvts.length === 0) return null;
                    return (
                      <div key={date} className="space-y-2">
                        <h4 className="text-xs font-semibold text-muted-foreground bg-slate-100 dark:bg-slate-800/60 px-2.5 py-1 rounded-lg">
                          {date === "2026-07-16"
                            ? "📅 Today (16 July)"
                            : date === "2026-07-17"
                              ? "📅 Tomorrow (17 July)"
                              : `📅 Date: ${date}`}
                        </h4>
                        <div className="space-y-2 pl-1">
                          {dayEvts.map((e) => (
                            <div
                              key={e.id}
                              onClick={() => {
                                setSelectedDate(date);
                                setSelectedEventId(e.id);
                              }}
                              className="p-3 bg-white/50 dark:bg-[#162135]/30 rounded-xl border border-border/40 hover:border-[#5A82E8]/40 transition-all cursor-pointer flex justify-between items-center"
                            >
                              <div>
                                <span className="text-xs font-semibold text-[#111111] dark:text-white">
                                  {e.title}
                                </span>
                                <p className="text-[11px] text-muted-foreground">
                                  {e.project} • {e.timeStart}
                                </p>
                              </div>
                              <span
                                className={`text-[10px] uppercase px-2 py-0.5 rounded-full font-medium ${
                                  e.type === "task"
                                    ? "bg-blue-100 text-blue-700"
                                    : e.type === "meeting"
                                      ? "bg-purple-100 text-purple-700"
                                      : "bg-amber-100 text-amber-700"
                                }`}
                              >
                                {e.type}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* RIGHT ADAPTIVE PANEL (COL-SPAN-3 - DETAILS COLUMN) */}
          <div className="xl:col-span-3 space-y-6">
            {/* Event Specific Drawer Card */}
            {selectedEvent ? (
              <div className="bg-white/80 dark:bg-[#162135]/50 backdrop-blur-xl border border-white/60 dark:border-[#2a384e]/30 rounded-3xl p-5 shadow-[var(--shadow-soft)] space-y-5">
                {/* Header info */}
                <div className="flex items-start justify-between border-b border-border/40 pb-3.5">
                  <div className="space-y-1">
                    <span
                      className={`text-[10px] uppercase font-medium px-2 py-0.5 rounded-full ${
                        selectedEvent.type === "task"
                          ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
                          : selectedEvent.type === "meeting"
                            ? "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300"
                            : selectedEvent.type === "approval"
                              ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300"
                              : "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300"
                      }`}
                    >
                      {selectedEvent.type.replace("_", " ")}
                    </span>
                    <h3 className="text-[15px] font-semibold text-[#111111] dark:text-white mt-1.5 leading-tight">
                      {selectedEvent.title}
                    </h3>
                    <p className="text-xs font-medium text-[#757575] dark:text-slate-400">
                      📂 Project scope: {selectedEvent.project}
                    </p>
                  </div>

                  <button
                    onClick={() => handleDeleteEvent(selectedEvent.id)}
                    className="p-1.5 hover:bg-red-50 dark:hover:bg-red-950/25 text-red-500 rounded-lg transition-colors"
                    title="Delete Event"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Info List */}
                <div className="space-y-3 text-xs text-[#555555] dark:text-gray-300">
                  <div className="flex items-center gap-2.5">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    <span className="font-medium">
                      Time: {selectedEvent.timeStart}{" "}
                      {selectedEvent.timeEnd ? ` - ${selectedEvent.timeEnd}` : ""}
                    </span>
                  </div>

                  {selectedEvent.hours && (
                    <div className="flex items-center gap-2.5">
                      <Activity className="w-4 h-4 text-muted-foreground" />
                      <span className="font-medium">
                        Allocated hours: {selectedEvent.hours} hrs
                      </span>
                    </div>
                  )}

                  {selectedEvent.priority && (
                    <div className="flex items-center gap-2.5">
                      <Award className="w-4 h-4 text-muted-foreground" />
                      <span className="font-medium">
                        Task Priority:{" "}
                        <span
                          className={`font-semibold uppercase ${
                            selectedEvent.priority === "HIGH"
                              ? "text-rose-500"
                              : selectedEvent.priority === "MEDIUM"
                                ? "text-indigo-500"
                                : "text-slate-500"
                          }`}
                        >
                          {selectedEvent.priority}
                        </span>
                      </span>
                    </div>
                  )}

                  {selectedEvent.location && (
                    <div className="flex items-center gap-2.5">
                      <MapPin className="w-4 h-4 text-muted-foreground" />
                      <span className="font-medium">Location: {selectedEvent.location}</span>
                    </div>
                  )}

                  {selectedEvent.meetingLink && (
                    <div className="flex items-center gap-2.5">
                      <Video className="w-4 h-4 text-muted-foreground" />
                      <a
                        href={selectedEvent.meetingLink}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[#5A82E8] hover:underline flex items-center gap-1 font-semibold"
                      >
                        Join Meet Call <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  )}
                </div>

                {/* Description */}
                {selectedEvent.description && (
                  <div className="bg-[#F4F4F7]/60 dark:bg-[#1c1c20]/60 p-3.5 rounded-2xl border border-border/30">
                    <h4 className="text-xs font-semibold text-[#757575] dark:text-gray-400 uppercase tracking-wider mb-1">
                      Briefing / Notes
                    </h4>
                    <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed font-medium">
                      {selectedEvent.description}
                    </p>
                  </div>
                )}

                {/* Checklist */}
                {selectedEvent.checklist && (
                  <div className="space-y-2">
                    <h4 className="text-xs font-semibold text-[#757575] dark:text-gray-400 uppercase tracking-wider">
                      Subtask progress
                    </h4>
                    <div className="space-y-1.5">
                      {selectedEvent.checklist.map((item) => (
                        <button
                          key={item.id}
                          onClick={() => toggleChecklist(selectedEvent.id, item.id)}
                          className="w-full flex items-center gap-2.5 text-left hover:bg-slate-50 dark:hover:bg-slate-800/40 p-1.5 rounded-lg transition-colors"
                        >
                          {item.completed ? (
                            <CheckCircle2 className="w-4 h-4 text-[#33A579]" />
                          ) : (
                            <span className="w-4 h-4 rounded-full border border-gray-400 block" />
                          )}
                          <span
                            className={`text-xs font-medium ${item.completed ? "line-through text-muted-foreground" : "text-foreground"}`}
                          >
                            {item.text}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Tracking Timer */}
                {selectedEvent.type === "task" && (
                  <div className="pt-2 border-t border-border/40">
                    {activeTimerTaskId === selectedEvent.id ? (
                      <button
                        onClick={() => {
                          setIsTimerRunning(false);
                          setActiveTimerTaskId(null);
                          setTimerSeconds(0);
                        }}
                        className="w-full h-10 rounded-xl bg-red-500 text-white font-semibold text-xs flex items-center justify-center gap-2"
                      >
                        <Square className="w-3.5 h-3.5 fill-current" /> Stop tracking log
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          setActiveTimerTaskId(selectedEvent.id);
                          setTimerSeconds(0);
                          setIsTimerRunning(true);
                          toast.success(`Timer started for task "${selectedEvent.title}"`);
                        }}
                        className="w-full h-10 rounded-xl bg-[#33A579] text-white font-semibold text-xs flex items-center justify-center gap-2 hover:bg-[#2e946c] transition-colors shadow-sm"
                      >
                        <Play className="w-3.5 h-3.5 fill-current" /> Start Focus Timer
                      </button>
                    )}
                  </div>
                )}

                {/* Approval actions */}
                {selectedEvent.type === "approval" && (
                  <div className="pt-2 border-t border-border/40 space-y-2">
                    <div className="text-[10px] font-semibold text-muted-foreground flex justify-between">
                      <span>By: {selectedEvent.requestedBy}</span>
                      <span>{selectedEvent.approvalStage}</span>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          toast.success("Design System spec approved!");
                          setEvents((prev) => prev.filter((e) => e.id !== selectedEvent.id));
                          setSelectedEventId(null);
                        }}
                        className="flex-1 h-9 bg-[#33A579] text-white font-semibold rounded-xl text-xs flex items-center justify-center gap-1.5"
                      >
                        <Check className="w-4 h-4" /> Approve
                      </button>
                      <button
                        onClick={() => {
                          toast.error("Design handoff rejected with design logs");
                        }}
                        className="flex-1 h-9 bg-[#F4F4F7] dark:bg-slate-800 text-gray-700 dark:text-gray-300 font-semibold rounded-xl text-xs"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-white/80 dark:bg-[#162135]/50 backdrop-blur-xl border border-white/60 dark:border-[#2a384e]/30 rounded-3xl p-6 shadow-[var(--shadow-soft)] text-center py-20 space-y-3">
                <CalendarIcon className="w-10 h-10 text-muted-foreground/30 mx-auto" />
                <p className="text-sm font-semibold text-muted-foreground">Select an item</p>
                <p className="text-xs text-muted-foreground/80 max-w-[180px] mx-auto leading-normal">
                  Select any task or meeting in the chronologically structured timeline to launch
                  active trackers or view checklist logs.
                </p>
              </div>
            )}

            {/* UPCOMING CRITICAL DEADLINES */}
            <div className="bg-white/80 dark:bg-[#162135]/50 backdrop-blur-xl border border-white/60 dark:border-[#2a384e]/30 rounded-3xl p-5 shadow-[var(--shadow-soft)]">
              <h4 className="text-[11px] font-semibold text-[#757575] dark:text-[#A8A8A8] uppercase tracking-wider mb-3.5">
                Upcoming Milestones
              </h4>

              <div className="space-y-3">
                {events
                  .filter((e) => e.type === "deadline")
                  .slice(0, 3)
                  .map((d) => (
                    <div
                      key={d.id}
                      className="flex items-center justify-between p-3 bg-[#F4F4F7]/40 dark:bg-[#1c1c20]/40 rounded-xl border border-border/30"
                    >
                      <div>
                        <p className="text-xs font-semibold text-[#111111] dark:text-white truncate max-w-[130px]">
                          {d.title}
                        </p>
                        <span className="text-[10px] text-rose-500 font-semibold">
                          {d.date === "2026-07-16" ? `Today, ${d.timeStart}` : d.date}
                        </span>
                      </div>
                      <span className="text-[9px] bg-rose-100 text-rose-600 px-2 py-0.5 rounded-full font-semibold uppercase">
                        critical
                      </span>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* --- EVENT SCHEDULER MODAL --- */}
      <AnimatePresence>
        {isAddEventOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAddEventOpen(false)}
              className="fixed inset-0 bg-black"
            />

            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-[#1c1c20] border border-border rounded-[24px] max-w-md w-full p-6 shadow-2xl z-10 relative space-y-4"
            >
              <div className="flex items-center justify-between border-b pb-2">
                <h3 className="text-md font-semibold text-[#111111] dark:text-white">
                  Add New Calendar Event
                </h3>
                <button
                  type="button"
                  onClick={() => setIsAddEventOpen(false)}
                  className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-muted-foreground"
                >
                  <Trash2 className="w-4 h-4 text-red-400" />
                </button>
              </div>

              <form onSubmit={handleCreateEvent} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-[#757575] dark:text-gray-300 uppercase tracking-wider">
                    EVENT TITLE
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Design review session, board handoff..."
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className="w-full h-10 px-3 border border-border rounded-xl text-xs focus:outline-none bg-transparent"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-[#757575] dark:text-gray-300 uppercase tracking-wider">
                      TYPE
                    </label>
                    <select
                      value={newType}
                      onChange={(e) => setNewType(e.target.value as any)}
                      className="w-full h-10 px-2 border border-border rounded-xl text-xs bg-transparent dark:bg-slate-800"
                    >
                      <option value="task">Task</option>
                      <option value="meeting">Meeting</option>
                      <option value="approval">Approval</option>
                      <option value="deadline">Deadline</option>
                      <option value="reminder">Reminder</option>
                      <option value="birthday">Birthday</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-medium text-[#757575] dark:text-gray-300 uppercase tracking-wider">
                      PROJECT
                    </label>
                    <select
                      value={newProject}
                      onChange={(e) => setNewProject(e.target.value)}
                      className="w-full h-10 px-2 border border-border rounded-xl text-xs bg-transparent dark:bg-slate-800"
                    >
                      <option value="Internal">Internal</option>
                      <option value="Helix Health">Helix Health</option>
                      <option value="Meridian">Meridian</option>
                      <option value="Aurora Coffee">Aurora Coffee</option>
                      <option value="Other">Other...</option>
                    </select>
                  </div>
                </div>

                {newProject === "Other" && (
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-[#757575] dark:text-gray-300 uppercase tracking-wider">
                      CUSTOM PROJECT NAME
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Acme Inc, Taskflow project"
                      value={newCustomProject}
                      onChange={(e) => setNewCustomProject(e.target.value)}
                      className="w-full h-10 px-3 border border-border rounded-xl text-xs bg-transparent"
                    />
                  </div>
                )}

                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-[#757575] dark:text-gray-300 uppercase tracking-wider">
                      DATE
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="YYYY-MM-DD"
                      value={newDate}
                      onChange={(e) => setNewDate(e.target.value)}
                      className="w-full h-10 px-3 border border-border rounded-xl text-xs bg-transparent"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-[#757575] dark:text-gray-300 uppercase tracking-wider">
                      START TIME
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 09:00 AM"
                      value={newTimeStart}
                      onChange={(e) => setNewTimeStart(e.target.value)}
                      className="w-full h-10 px-3 border border-border rounded-xl text-xs bg-transparent"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-[#757575] dark:text-gray-300 uppercase tracking-wider">
                      END TIME
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 10:30 AM"
                      value={newTimeEnd}
                      onChange={(e) => setNewTimeEnd(e.target.value)}
                      className="w-full h-10 px-3 border border-border rounded-xl text-xs bg-transparent"
                    />
                  </div>
                </div>

                {newType === "task" && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-[#757575] dark:text-gray-300 uppercase tracking-wider">
                        CAPACITY HOURS
                      </label>
                      <input
                        type="number"
                        step="0.25"
                        value={newHours}
                        onChange={(e) => setNewHours(Number(e.target.value))}
                        className="w-full h-10 px-3 border border-border rounded-xl text-xs bg-transparent"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-[#757575] dark:text-gray-300 uppercase tracking-wider">
                        PRIORITY
                      </label>
                      <select
                        value={newPriority}
                        onChange={(e) => setNewPriority(e.target.value as any)}
                        className="w-full h-10 px-2 border border-border rounded-xl text-xs bg-transparent dark:bg-slate-800"
                      >
                        <option value="HIGH">HIGH</option>
                        <option value="MEDIUM">MEDIUM</option>
                        <option value="LOW">LOW</option>
                      </select>
                    </div>
                  </div>
                )}

                {newType === "meeting" && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-[#757575] dark:text-gray-300 uppercase tracking-wider">
                        LOCATION
                      </label>
                      <input
                        type="text"
                        placeholder="Google Meet, Room B"
                        value={newLocation}
                        onChange={(e) => setNewLocation(e.target.value)}
                        className="w-full h-10 px-3 border border-border rounded-xl text-xs bg-transparent"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-[#757575] dark:text-gray-300 uppercase tracking-wider">
                        PARTICIPANTS
                      </label>
                      <input
                        type="text"
                        placeholder="Supraja, Rahul"
                        value={newParticipants}
                        onChange={(e) => setNewParticipants(e.target.value)}
                        className="w-full h-10 px-3 border border-border rounded-xl text-xs bg-transparent"
                      />
                    </div>
                  </div>
                )}

                <div className="space-y-1">
                  <label className="text-xs font-medium text-[#757575] dark:text-gray-300 uppercase tracking-wider">
                    DESCRIPTION
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Provide description or task specs..."
                    value={newDescription}
                    onChange={(e) => setNewDescription(e.target.value)}
                    className="w-full p-3 border border-border rounded-xl text-xs focus:outline-none resize-none bg-transparent"
                  />
                </div>

                <div className="flex gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsAddEventOpen(false)}
                    className="flex-1 h-10 bg-slate-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300 font-semibold rounded-xl text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 h-10 bg-[#5A82E8] text-white font-semibold rounded-xl text-xs shadow-md"
                  >
                    Create Event
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* --- CAPACITY LIMIT EXCEEDED WARNING DIALOG --- */}
      <AnimatePresence>
        {isWarningOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black"
            />

            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-[#1c1c20] border border-border rounded-[24px] max-w-sm w-full p-6 shadow-2xl z-10 relative text-center space-y-4"
            >
              <div className="w-12 h-12 rounded-full bg-[#E4664F]/10 text-[#E4664F] grid place-items-center mx-auto">
                <AlertTriangle className="w-6 h-6" />
              </div>

              <div className="space-y-1.5">
                <h3 className="text-md font-semibold text-[#111111] dark:text-white">
                  Capacity Warning Triggered
                </h3>
                <p className="text-xs text-muted-foreground leading-normal font-medium">
                  Saving this priority would exceed your daily allocated{" "}
                  <strong>7 hour capacity</strong> for {selectedDate}. Reschedule other tasks to
                  retain timeline efficiency.
                </p>
              </div>

              <div className="flex flex-col gap-2 pt-2">
                <button
                  onClick={handleConfirmMoveAnyway}
                  className="w-full h-10 bg-[#E4664F] text-white font-semibold rounded-xl text-xs"
                >
                  Save Anyway (Force Override)
                </button>
                <button
                  onClick={() => {
                    setIsWarningOpen(false);
                    setPendingMoveEvent(null);
                  }}
                  className="w-full h-10 bg-slate-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300 font-semibold rounded-xl text-xs"
                >
                  Change Event Timing
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </AppShell>
  );
}

// FULL VIEW EVENT CARD COMPONENT (With visual priority colors, timeline stacking design rules)
function EventCard({
  event,
  isSelected,
  onClick,
  onShiftTime,
}: {
  event: CalendarEvent;
  isSelected: boolean;
  onClick: () => void;
  onShiftTime: (newTime: string) => void;
}) {
  const [showShiftDropdown, setShowShiftDropdown] = useState(false);

  // High Fidelity Theme Styles depending on event types and task priorities
  const getStyleTheme = () => {
    if (event.type === "meeting") {
      return {
        bg: "bg-[#8A6CE0]/5 dark:bg-[#8A6CE0]/8 hover:bg-[#8A6CE0]/10 border-[#8A6CE0]/20 text-[#8a6ce0]",
        tag: "bg-[#8A6CE0]/10 text-[#8a6ce0] border-[#8A6CE0]/20",
        border: "border-l-4 border-l-[#8A6CE0]",
        iconColor: "text-[#8a6ce0]",
      };
    }
    if (event.type === "approval") {
      return {
        bg: "bg-[#E29A21]/5 dark:bg-[#E29A21]/8 hover:bg-[#E29A21]/10 border-[#E29A21]/20 text-[#e29a21]",
        tag: "bg-[#E29A21]/10 text-[#e29a21] border-[#E29A21]/20",
        border: "border-l-4 border-l-[#E29A21]",
        iconColor: "text-[#e29a21]",
      };
    }
    if (event.type === "deadline") {
      return {
        bg: "bg-[#E4664F]/5 dark:bg-[#E4664F]/8 hover:bg-[#E4664F]/10 border-[#E4664F]/20 text-[#e4664f]",
        tag: "bg-[#E4664F]/10 text-[#e4664f] border-[#E4664F]/20",
        border: "border-l-4 border-l-[#E4664F]",
        iconColor: "text-[#e4664f]",
      };
    }
    if (event.type === "time_log") {
      return {
        bg: "bg-[#33A579]/5 dark:bg-[#33A579]/8 hover:bg-[#33A579]/10 border-[#33A579]/20 text-[#33a579]",
        tag: "bg-[#33A579]/10 text-[#33a579] border-[#33A579]/20",
        border: "border-l-4 border-l-[#33A579]",
        iconColor: "text-[#33a579]",
      };
    }
    if (event.type === "leave") {
      return {
        bg: "bg-slate-100/50 dark:bg-slate-800/20 hover:bg-slate-100 border-slate-200 dark:border-slate-800 text-slate-500",
        tag: "bg-slate-100 dark:bg-slate-800 text-slate-500 border-slate-200 dark:border-slate-800",
        border: "border-l-4 border-l-slate-400",
        iconColor: "text-slate-400",
      };
    }
    if (event.type === "reminder") {
      return {
        bg: "bg-amber-400/5 dark:bg-amber-400/8 hover:bg-amber-400/10 border-amber-400/20 text-amber-600",
        tag: "bg-amber-400/10 text-amber-600 border-amber-400/20",
        border: "border-l-4 border-l-amber-400",
        iconColor: "text-amber-500",
      };
    }
    if (event.type === "birthday") {
      return {
        bg: "bg-pink-500/5 dark:bg-pink-500/8 hover:bg-pink-500/10 border-pink-500/20 text-pink-600",
        tag: "bg-pink-500/10 text-pink-600 border-pink-500/20",
        border: "border-l-4 border-l-pink-400",
        iconColor: "text-pink-400",
      };
    }

    // Default or Task types colored based on Priority
    if (event.priority === "HIGH") {
      return {
        bg: "bg-red-500/5 dark:bg-red-500/8 hover:bg-red-500/10 border-red-500/20 text-red-600",
        tag: "bg-red-500/10 text-red-600 border-red-500/20",
        border: "border-l-4 border-l-red-500",
        iconColor: "text-red-500",
      };
    }
    if (event.priority === "LOW") {
      return {
        bg: "bg-slate-400/5 dark:bg-slate-400/8 hover:bg-slate-400/10 border-slate-400/20 text-slate-500",
        tag: "bg-slate-400/10 text-slate-500 border-slate-400/20",
        border: "border-l-4 border-l-slate-400",
        iconColor: "text-slate-400",
      };
    }
    // MEDIUM is standard task theme
    return {
      bg: "bg-[#5A82E8]/5 dark:bg-[#5A82E8]/8 hover:bg-[#5A82E8]/10 border-[#5A82E8]/20 text-[#5a82e8]",
      tag: "bg-[#5A82E8]/10 text-[#5a82e8] border-[#5A82E8]/20",
      border: "border-l-4 border-l-[#5A82E8]",
      iconColor: "text-[#5a82e8]",
    };
  };

  const theme = getStyleTheme();

  return (
    <div
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      className={`group/card relative p-3 px-4 rounded-2xl border transition-all cursor-pointer flex justify-between items-center ${theme.border} ${theme.bg} ${
        isSelected
          ? "ring-2 ring-[#5A82E8]/60 scale-[1.01] shadow-md bg-opacity-90"
          : "hover:scale-[1.005] hover:shadow-xs"
      }`}
    >
      <div className="space-y-1.5 flex-1 pr-3">
        {/* Top meta tags */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[11px] font-medium text-[#111111] dark:text-gray-300">
            {event.timeStart} {event.timeEnd ? ` - ${event.timeEnd}` : ""}
          </span>
          <span className="text-[#A8A8A8] text-[10px]">•</span>
          <span className={`text-[11px] font-medium px-2 py-0.5 rounded-md border ${theme.tag}`}>
            📂 {event.project}
          </span>
          {event.priority && (
            <span
              className={`text-[10px] font-medium px-1.5 py-0.5 rounded-md ${
                event.priority === "HIGH"
                  ? "bg-red-100 text-red-600 dark:bg-red-950/40"
                  : "bg-slate-100 text-slate-600 dark:bg-slate-800/40"
              }`}
            >
              {event.priority}
            </span>
          )}
        </div>

        {/* Title */}
        <h4 className="text-sm font-semibold text-[#111111] dark:text-white leading-tight tracking-tight">
          {event.title}
        </h4>

        {/* Short description */}
        {event.description && (
          <p className="text-[12px] text-[#757575] dark:text-gray-300 font-medium line-clamp-1 leading-normal">
            {event.description}
          </p>
        )}

        {/* Bottom meta stats */}
        <div className="flex items-center gap-3 pt-0.5">
          {event.hours && (
            <div className="flex items-center gap-1 text-[11px] font-medium text-muted-foreground">
              <Clock className="w-3 h-3 opacity-70" />
              <span>{event.hours} hrs allocated</span>
            </div>
          )}
          {event.participants && (
            <div className="flex items-center gap-1 text-[11px] font-medium text-muted-foreground">
              <Users className="w-3 h-3 opacity-70" />
              <span>{event.participants.length} attending</span>
            </div>
          )}
        </div>
      </div>

      {/* Quick Quick actions */}
      <div className="flex items-center gap-1.5 opacity-0 group-hover/card:opacity-100 transition-opacity relative">
        <button
          onClick={(e) => {
            e.stopPropagation();
            setShowShiftDropdown(!showShiftDropdown);
          }}
          className="h-7 px-2.5 rounded-lg bg-white dark:bg-[#1a1a1e] border border-border/80 text-xs font-medium hover:bg-slate-50 text-muted-foreground shadow-xs"
        >
          Shift Time
        </button>

        {showShiftDropdown && (
          <div className="absolute right-0 bottom-full mb-1.5 bg-white dark:bg-[#1a1a1e] border border-border/80 shadow-xl rounded-xl p-1.5 z-50 w-32 space-y-1">
            <p className="text-[10px] font-semibold text-center text-muted-foreground border-b pb-1 uppercase">
              Move slot:
            </p>
            {["09:00 AM", "11:00 AM", "01:00 PM", "03:00 PM", "05:00 PM"].map((t) => (
              <button
                key={t}
                onClick={(e) => {
                  e.stopPropagation();
                  onShiftTime(t);
                  setShowShiftDropdown(false);
                }}
                className="w-full text-left p-1 px-1.5 text-xs font-medium rounded hover:bg-slate-50 dark:hover:bg-white/5 text-[#111111] dark:text-white"
              >
                {t}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// MINI CARD COMPONENT FOR GRID COLUMNS (WEEK GRID VIEW)
function MiniEventCard({
  event,
  isSelected,
  onClick,
}: {
  event: CalendarEvent;
  isSelected: boolean;
  onClick: () => void;
}) {
  const getStyleTheme = () => {
    if (event.type === "meeting") {
      return "bg-[#8A6CE0]/10 border-t-2 border-t-[#8A6CE0] text-[#8a6ce0] border-border/20";
    }
    if (event.type === "approval") {
      return "bg-[#E29A21]/10 border-t-2 border-t-[#E29A21] text-[#e29a21] border-border/20";
    }
    if (event.type === "deadline") {
      return "bg-[#E4664F]/10 border-t-2 border-t-[#E4664F] text-[#e4664f] border-border/20";
    }
    if (event.type === "time_log") {
      return "bg-[#33A579]/10 border-t-2 border-t-[#33A579] text-[#33a579] border-border/20";
    }

    // Tasks based on priority
    if (event.priority === "HIGH") {
      return "bg-red-500/10 border-t-2 border-t-red-500 text-red-600 border-border/20";
    }
    if (event.priority === "LOW") {
      return "bg-slate-400/10 border-t-2 border-t-slate-400 text-slate-500 border-border/20";
    }
    return "bg-[#5A82E8]/10 border-t-2 border-t-[#5A82E8] text-[#5a82e8] border-border/20";
  };

  const styling = getStyleTheme();

  return (
    <div
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      className={`p-2 rounded-xl border text-xs leading-tight cursor-pointer transition-all ${styling} ${
        isSelected ? "ring-2 ring-[#5A82E8]/60 shadow-xs scale-102" : "hover:scale-[1.02]"
      }`}
    >
      <div className="flex items-center justify-between text-[10px] font-medium opacity-75">
        <span>{event.timeStart}</span>
        {event.hours && <span>{event.hours}h</span>}
      </div>
      <h5 className="font-semibold truncate mt-1 text-[#111111] dark:text-white text-[12px] tracking-tight">
        {event.title}
      </h5>
      <p className="text-[10px] opacity-80 mt-0.5 font-medium truncate">{event.project}</p>
    </div>
  );
}
