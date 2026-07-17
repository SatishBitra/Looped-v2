import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useMemo, useEffect } from "react";
import { AppShell } from "@/components/app-shell";
import { motion, AnimatePresence } from "motion/react";
import {
  CheckCircle2,
  Clock,
  MoreHorizontal,
  ChevronRight,
  Plus,
  Play,
  FileText,
  MessageSquare,
  Sparkles,
  Calendar,
  AlertTriangle,
  History,
  Activity,
  User,
  Users,
  Briefcase,
  Layers,
  ArrowRight,
  Filter,
  Check,
  Search,
  X,
  Timer,
  Bell,
} from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/home")({
  component: EmployeeDashboardPage,
});

// Types
interface Task {
  id: string;
  title: string;
  client: string;
  department: string;
  due: string;
  priority: "HIGH" | "MEDIUM" | "LOW";
  status: "Locked" | "Due Soon" | "On Track" | "Waiting" | "Approved" | "Review" | "Blocked";
  statusTone: "blue" | "green" | "yellow" | "orange" | "red" | "purple" | "neutral";
  hoursAssigned: number;
  completed?: boolean;
  comments: { user: string; text: string; time: string }[];
  subtasks: { id: string; text: string; completed: boolean }[];
  description: string;
  owner: { name: string; avatar: string };
}

interface Bottleneck {
  id: string;
  stage: string;
  project: string;
  taskTitle: string;
  waitingTime: string;
  owner: { name: string; avatar: string };
  progress: number; // percentage
  stageFrom: string;
  stageTo: string;
}

// Helper to convert status to appropriate Left indicator
const getStatusIndicator = (status: string) => {
  switch (status) {
    case "Due Soon":
      return { label: "🔴 Overdue", color: "text-[#E4664F]", dot: "bg-[#E4664F]" };
    case "Review":
      return { label: "🟠 Due Soon", color: "text-[#D79A2C]", dot: "bg-[#D79A2C]" };
    case "On Track":
      return { label: "🟢 On Track", color: "text-[#33A579]", dot: "bg-[#33A579]" };
    case "Waiting":
      return { label: "🔵 Waiting", color: "text-[#5A82E8]", dot: "bg-[#5A82E8]" };
    case "Approved":
      return { label: "🟣 Approval", color: "text-[#8A6CE0]", dot: "bg-[#8A6CE0]" };
    case "Locked":
    default:
      return { label: "⚫ Locked", color: "text-[#757575]", dot: "bg-[#757575]" };
  }
};

function EmployeeDashboardPage() {
  // Static context simulation for employee Sandy
  const [tasks, setTasks] = useState<Task[]>([
    {
      id: "t1",
      title: "Instagram Carousel",
      client: "ThreadSense AI",
      department: "Marketing",
      due: "Due Yesterday",
      priority: "HIGH",
      status: "Locked",
      statusTone: "neutral",
      hoursAssigned: 2.0,
      description:
        "Design social carousel assets for ThreadSense launch campaign highlighting key AI features and user flow.",
      owner: { name: "Sandy", avatar: "S" },
      comments: [
        {
          user: "Rahul",
          text: "Approved the assets pending content verification",
          time: "2 hours ago",
        },
      ],
      subtasks: [
        { id: "s1", text: "Draft carousel outline", completed: true },
        { id: "s2", text: "Create high-fidelity graphics", completed: true },
        { id: "s3", text: "Verify messaging with copy team", completed: false },
      ],
    },
    {
      id: "t2",
      title: "Homepage Hero Section",
      client: "Helix Health",
      department: "Design",
      due: "Today 4:00 PM",
      priority: "MEDIUM",
      status: "Due Soon",
      statusTone: "orange",
      hoursAssigned: 1.5,
      description:
        "Revamp above-the-fold layout for Helix Health medical suite homepage. Focus on high-contrast visuals.",
      owner: { name: "Sandy", avatar: "S" },
      comments: [
        {
          user: "Marta",
          text: "Sandy, please align with the developer portal before closing this.",
          time: "4 hours ago",
        },
      ],
      subtasks: [
        { id: "s4", text: "Create wireframes", completed: true },
        { id: "s5", text: "Deliver visual design candidates", completed: false },
      ],
    },
    {
      id: "t3",
      title: "SEO Audit Guidelines",
      client: "Internal",
      department: "Strategy",
      due: "Due Friday",
      priority: "LOW",
      status: "On Track",
      statusTone: "green",
      hoursAssigned: 2.0,
      description:
        "Standardize optimization audits across creative pods to ensure consistent SEO standards and best practices.",
      owner: { name: "Sandy", avatar: "S" },
      comments: [],
      subtasks: [
        { id: "s6", text: "Extract top keywords", completed: false },
        { id: "s7", text: "Synthesize PDF playbook", completed: false },
      ],
    },
    {
      id: "t4",
      title: "Brand Strategy Sync",
      client: "Meridian",
      department: "Strategy",
      due: "Today 11:30 AM",
      priority: "HIGH",
      status: "Waiting",
      statusTone: "blue",
      hoursAssigned: 1.0,
      description: "Prepare meridian deck and walk through product alignment with client leads.",
      owner: { name: "Sandy", avatar: "S" },
      comments: [],
      subtasks: [],
    },
  ]);

  // Bottlenecks Data
  const [bottlenecks] = useState<Bottleneck[]>([
    {
      id: "b1",
      stage: "Approval",
      project: "Aurora Coffee",
      taskTitle: "Landing Page Copy",
      waitingTime: "Waiting 2 days",
      owner: { name: "Supraja", avatar: "SU" },
      progress: 70,
      stageFrom: "Draft",
      stageTo: "Approval",
    },
    {
      id: "b2",
      stage: "Client Review",
      project: "ThreadSense AI",
      taskTitle: "Logo Variations",
      waitingTime: "Waiting 4 days",
      owner: { name: "Rahul", avatar: "RA" },
      progress: 90,
      stageFrom: "Approval",
      stageTo: "Client Review",
    },
    {
      id: "b3",
      stage: "Developer",
      project: "Kite Motors",
      taskTitle: "Toggle Portal UI",
      waitingTime: "6 hrs left",
      owner: { name: "Ivan", avatar: "IV" },
      progress: 40,
      stageFrom: "Client Review",
      stageTo: "Developer",
    },
  ]);

  // Timeline Data
  const [timelineItems, setTimelineItems] = useState([
    { time: "10:00 AM", title: "Homepage Review", detail: "Sync with Helix designer", done: true },
    {
      time: "11:30 AM",
      title: "Meridian Strategy call",
      detail: "Pitch decks present",
      done: false,
    },
    {
      time: "2:00 PM",
      title: "Internal Approval Session",
      detail: "Pod allocation review",
      done: false,
    },
    {
      time: "4:00 PM",
      title: "Instagram Carousel Due",
      detail: "ThreadSense AI submission",
      done: false,
    },
    {
      time: "6:00 PM",
      title: "Wrap Up & timesheet logs",
      detail: "Record assigned hours",
      done: false,
    },
  ]);

  // Activity log
  const [activities, setActivities] = useState([
    {
      id: 1,
      user: "Rahul",
      text: "approved Homepage Layout",
      time: "2 mins ago",
      type: "approval",
    },
    {
      id: 2,
      user: "Supraja",
      text: "commented on Landing Page Copy",
      time: "18 mins ago",
      type: "comment",
    },
    {
      id: 3,
      user: "Client",
      text: "approved Banner Guidelines",
      time: "1 hr ago",
      type: "approval",
    },
  ]);

  // UI State Managers
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [bottleneckFilter, setBottleneckFilter] = useState<string | null>(null);
  const [isNewTaskOpen, setIsNewTaskOpen] = useState(false);
  const [isLogTimeOpen, setIsLogTimeOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // New task form state
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskClient, setNewTaskClient] = useState("Internal");
  const [newTaskPriority, setNewTaskPriority] = useState<"HIGH" | "MEDIUM" | "LOW">("MEDIUM");
  const [newTaskHours, setNewTaskHours] = useState(1.5);

  // Time logging temporary state
  const [logTimeHours, setLogTimeHours] = useState("1.0");
  const [logTimeTaskId, setLogTimeTaskId] = useState("");

  // Capacity calculations
  const capacityTotal = 7;
  const assignedHours = useMemo(() => {
    return tasks.reduce((acc, curr) => acc + (curr.completed ? 0 : curr.hoursAssigned), 0);
  }, [tasks]);

  const capacityRemaining = Math.max(0, capacityTotal - assignedHours);
  const dueTodayCount = useMemo(() => {
    return tasks.filter((t) => t.due.toLowerCase().includes("today") && !t.completed).length;
  }, [tasks]);

  // Capacity health variants
  const capacityState = useMemo(() => {
    if (assignedHours > capacityTotal) return "Overloaded";
    if (assignedHours === capacityTotal) return "Completed";
    if (assignedHours >= capacityTotal * 0.75) return "Warning";
    return "Normal";
  }, [assignedHours]);

  const statusBadges = [
    "Locked",
    "Due Soon",
    "On Track",
    "Waiting",
    "Approved",
    "Review",
    "Blocked",
  ];

  // Filter tasks based on search & active filters
  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      const matchesSearch =
        task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.client.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter ? task.status === statusFilter : true;
      return matchesSearch && matchesStatus;
    });
  }, [tasks, searchQuery, statusFilter]);

  // Filter bottlenecks based on stage filter
  const filteredBottlenecks = useMemo(() => {
    if (!bottleneckFilter) return bottlenecks;
    const filterLower = bottleneckFilter.toLowerCase();
    return bottlenecks.filter(
      (b) =>
        b.stage.toLowerCase().includes(filterLower) ||
        b.stageFrom.toLowerCase().includes(filterLower) ||
        b.stageTo.toLowerCase().includes(filterLower),
    );
  }, [bottlenecks, bottleneckFilter]);

  // Handle checking a task complete
  const toggleTaskCompletion = (taskId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId) {
          const nextState = !t.completed;
          toast.success(nextState ? `Task completed: ${t.title}` : `Task reopened: ${t.title}`);
          return { ...t, completed: nextState };
        }
        return t;
      }),
    );
  };

  // Add Comment
  const addCommentToTask = (taskId: string, commentText: string) => {
    if (!commentText.trim()) return;
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId) {
          const updated = {
            ...t,
            comments: [...t.comments, { user: "Sandy (You)", text: commentText, time: "Just now" }],
          };
          setSelectedTask(updated); // Sync current drawer views
          return updated;
        }
        return t;
      }),
    );
    setActivities((prev) => [
      {
        id: Date.now(),
        user: "You",
        text: `commented on ${tasks.find((t) => t.id === taskId)?.title}`,
        time: "Just now",
        type: "comment",
      },
      ...prev,
    ]);
    toast.success("Comment added!");
  };

  // Add subtask
  const toggleSubtask = (taskId: string, subtaskId: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId) {
          const updatedSubtasks = t.subtasks.map((s) =>
            s.id === subtaskId ? { ...s, completed: !s.completed } : s,
          );
          const updated = { ...t, subtasks: updatedSubtasks };
          if (selectedTask?.id === taskId) {
            setSelectedTask(updated);
          }
          return updated;
        }
        return t;
      }),
    );
  };

  // Quick Action: New Task
  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) {
      toast.error("Please provide a task title");
      return;
    }

    const newTask: Task = {
      id: "t_" + Date.now(),
      title: newTaskTitle,
      client: newTaskClient,
      department: "General",
      due: "Due Today",
      priority: newTaskPriority,
      status: "On Track",
      statusTone: "green",
      hoursAssigned: Number(newTaskHours) || 1.0,
      description: "Added quickly from the action board.",
      owner: { name: "Sandy", avatar: "S" },
      comments: [],
      subtasks: [],
    };

    setTasks((prev) => [newTask, ...prev]);
    setActivities((prev) => [
      {
        id: Date.now(),
        user: "You",
        text: `created task: ${newTaskTitle}`,
        time: "Just now",
        type: "create",
      },
      ...prev,
    ]);

    toast.success(`Task Created: ${newTaskTitle}`);
    setNewTaskTitle("");
    setIsNewTaskOpen(false);
  };

  // Quick Action: Log Time
  const handleLogTime = (e: React.FormEvent) => {
    e.preventDefault();
    const hours = parseFloat(logTimeHours);
    if (isNaN(hours) || hours <= 0) {
      toast.error("Enter a valid amount of hours");
      return;
    }

    if (logTimeTaskId) {
      setTasks((prev) =>
        prev.map((t) => {
          if (t.id === logTimeTaskId) {
            const updated = { ...t, hoursAssigned: t.hoursAssigned + hours };
            toast.success(`Logged ${hours}h on ${t.title}. Assigned capacity adjusted!`);
            return updated;
          }
          return t;
        }),
      );
    } else {
      // General logs directly update daily assigned hours manually
      toast.success(`Logged ${hours}h general workspace administration.`);
    }

    setActivities((prev) => [
      {
        id: Date.now(),
        user: "You",
        text: `logged ${hours} hrs of work`,
        time: "Just now",
        type: "log",
      },
      ...prev,
    ]);
    setIsLogTimeOpen(false);
  };

  return (
    <AppShell
      searchQuery={searchQuery}
      setSearchQuery={setSearchQuery}
      onQuickAdd={() => setIsNewTaskOpen(true)}
    >
      <div className="space-y-8 select-none w-full">
        {/* 1. Capacity Hero */}
        <section className="bg-[#f3f3f5] dark:bg-[#162135]/35 border border-[#D5E4F5]/50 dark:border-[#2a384e]/20 rounded-[28px] p-6 shadow-[var(--shadow-soft)] hover:translate-y-[-2px] hover:shadow-[0_12px_45px_rgba(0,0,0,0.06)] transition-all duration-300">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-[13px] font-medium uppercase tracking-wider text-[#757575]">
                  Daily Capacity Tracker
                </span>
                <span
                  className={`h-2 w-2 rounded-full ${
                    capacityState === "Overloaded"
                      ? "bg-[#E4664F] animate-pulse"
                      : capacityState === "Warning"
                        ? "bg-[#D79A2C]"
                        : "bg-[#33A579]"
                  }`}
                />
              </div>
              <h2 className="text-[30px] font-semibold tracking-tight text-[#111111] dark:text-[#F4F4F7] flex items-baseline gap-2">
                {assignedHours.toFixed(1)}{" "}
                <span className="text-[17px] text-[#757575] font-normal">
                  / {capacityTotal} hrs assigned today
                </span>
              </h2>

              {/* Context Summary Bullets */}
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[13px] text-[#757575] pt-1">
                <span className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#5A82E8]" />
                  {capacityRemaining > 0
                    ? `${capacityRemaining.toFixed(1)} hrs available`
                    : "No capacity remaining"}
                </span>
                <span className="text-[#E7E7EC] dark:text-[#323238]">•</span>
                <span className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#E4664F]" />
                  {dueTodayCount} tasks due today
                </span>
                <span className="text-[#E7E7EC] dark:text-[#323238]">•</span>
                <span className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-[#D79A2C]" />
                  Next deadline:{" "}
                  <span className="font-medium text-[#111111] dark:text-white">4:00 PM</span>
                </span>
              </div>
            </div>

            {/* Dynamic Interactive Progress Bar & Info Graphic */}
            <div className="flex-1 max-w-xl w-full">
              <div className="flex justify-between items-center mb-2.5 text-[13px]">
                <span
                  className={`font-medium ${
                    capacityState === "Overloaded"
                      ? "text-[#E4664F]"
                      : capacityState === "Warning"
                        ? "text-[#D79A2C]"
                        : "text-[#33A579]"
                  }`}
                >
                  Status:{" "}
                  {capacityState === "Overloaded"
                    ? "Capacity Overloaded! Reallocate work"
                    : capacityState === "Completed"
                      ? "Perfect Capacity Utilized"
                      : capacityState === "Warning"
                        ? "Approaching capacity limit"
                        : "Capacity Healthy"}
                </span>
                <span className="text-[#757575] font-medium">
                  {Math.round((assignedHours / capacityTotal) * 100)}% Used
                </span>
              </div>

              {/* Progress Container */}
              <div className="h-4 rounded-full bg-[#F4F4F7] dark:bg-[#1a1a1c] overflow-hidden p-[2px] border border-[#E7E7EC] dark:border-[#323238]">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min((assignedHours / capacityTotal) * 100, 100)}%` }}
                  transition={{ type: "spring", stiffness: 80, damping: 15 }}
                  className={`h-full rounded-full transition-all ${
                    capacityState === "Overloaded"
                      ? "bg-[#E4664F]"
                      : capacityState === "Warning"
                        ? "bg-[#D79A2C]"
                        : capacityState === "Completed"
                          ? "bg-[#8A6CE0]"
                          : "bg-[#33A579]"
                  }`}
                />
              </div>

              <div className="flex items-center justify-between mt-3">
                <span className="text-[11px] text-[#A8A8A8]">
                  Capacity status is computed from active assigned hours
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Today's Priorities & Workflow Bottlenecks Separate Containers */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 relative">
          {/* High-intensity, thick and beautiful ambient glowing circle blurs positioned right between the two sections */}
          <div className="absolute top-[45%] left-[50%] lg:left-[59%] -translate-x-1/2 -translate-y-1/2 w-[380px] h-[380px] lg:w-[480px] lg:h-[480px] rounded-full bg-[#5A82E8]/40 dark:bg-[#5A82E8]/30 blur-[75px] pointer-events-none z-0 mix-blend-multiply dark:mix-blend-normal animate-pulse [animation-duration:8s]" />
          <div className="absolute top-[52%] left-[50%] lg:left-[57%] -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] lg:w-[380px] lg:h-[380px] rounded-full bg-[#8A6CE0]/45 dark:bg-[#8A6CE0]/30 blur-[65px] pointer-events-none z-0" />
          <div className="absolute top-[48%] left-[50%] lg:left-[58%] -translate-x-1/2 -translate-y-1/2 w-[180px] h-[180px] lg:w-[220px] lg:h-[220px] rounded-full bg-[#4FC3F7]/50 dark:bg-[#4FC3F7]/35 blur-[45px] pointer-events-none z-0" />

          {/* Today's Priorities Container */}
          <section className="relative z-10 lg:col-span-7 bg-[#f3f3f5]/90 backdrop-blur-[8px] dark:bg-[#162135]/45 border border-[#D5E4F5]/50 dark:border-[#2a384e]/20 rounded-[36px] p-5 sm:p-8 shadow-[var(--shadow-soft)] space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <h3 className="text-[20px] font-medium text-[#111111] dark:text-white">
                  Today's Priorities
                </h3>
                <p className="text-[13px] text-[#757575]">
                  Click rows to reveal details. Use badges below to filter.
                </p>
              </div>

              {/* Filter Reset Button */}
              {statusFilter && (
                <button
                  onClick={() => {
                    setStatusFilter(null);
                    toast.info("Filter cleared");
                  }}
                  className="text-[13px] font-medium text-[#E4664F] flex items-center gap-1 hover:opacity-80 transition"
                >
                  Reset Filters <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Status BADGE Row for filtering */}
            <div className="flex flex-wrap gap-2 py-1">
              {statusBadges.map((badge) => {
                const isActive = statusFilter === badge;
                return (
                  <button
                    key={badge}
                    onClick={() => {
                      setStatusFilter(isActive ? null : badge);
                      toast.info(isActive ? `Cleared ${badge} filter` : `Filtering by: ${badge}`);
                    }}
                    className={`h-7 px-3.5 rounded-full text-[12px] font-medium transition-all ${
                      isActive
                        ? "bg-[#111111] dark:bg-white text-white dark:text-[#111111] scale-105"
                        : "bg-white dark:bg-[#242428] border border-[#E7E7EC] dark:border-[#323238] text-[#757575] hover:border-[#111111] dark:hover:border-white"
                    }`}
                  >
                    {badge}
                  </button>
                );
              })}
            </div>

            {/* Tasks Container */}
            <div className="bg-white dark:bg-[#242428] border border-[#E7E7EC] dark:border-[#323238] rounded-[28px] overflow-hidden shadow-[var(--shadow-soft)]">
              <div className="divide-y divide-[#E7E7EC] dark:divide-[#323238]">
                {filteredTasks.length === 0 ? (
                  <div className="p-12 text-center text-[#757575]">
                    <CheckCircle2 className="w-10 h-10 mx-auto text-[#33A579] mb-3" />
                    <p className="text-[15px] font-medium">No tasks found</p>
                    <p className="text-[13px] text-[#A8A8A8] mt-1">
                      Try resetting filters to show active priorities.
                    </p>
                  </div>
                ) : (
                  filteredTasks.map((task) => {
                    const leftInd = getStatusIndicator(task.status);
                    return (
                      <div
                        key={task.id}
                        onClick={() => setSelectedTask(task)}
                        className={`group p-5 hover:bg-[#F4F4F7] dark:hover:bg-[#28282c] transition-all duration-300 flex items-center justify-between cursor-pointer ${
                          task.completed ? "opacity-60" : ""
                        }`}
                      >
                        {/* Task Name, Client, Priority Details */}
                        <div className="flex items-center gap-4 flex-1 min-w-0">
                          {/* Left Completion Toggle Checkbox */}
                          <button
                            onClick={(e) => toggleTaskCompletion(task.id, e)}
                            className={`w-6 h-6 rounded-md border border-[#E7E7EC] dark:border-[#323238] grid place-items-center hover:border-[#33A579] dark:hover:border-[#33A579] transition-colors shrink-0 ${
                              task.completed ? "bg-[#33A579]/10 border-[#33A579]" : ""
                            }`}
                          >
                            <CheckCircle2
                              className={`w-4 h-4 ${task.completed ? "text-[#33A579]" : "text-transparent"}`}
                            />
                          </button>

                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span
                                className={`text-[17px] font-medium leading-tight truncate ${
                                  task.completed
                                    ? "line-through text-[#A8A8A8]"
                                    : "text-[#111111] dark:text-white"
                                }`}
                              >
                                {task.title}
                              </span>

                              {/* Task priority indicator badge */}
                              <span
                                className={`text-[11px] font-semibold uppercase px-1.5 py-0.5 rounded ${
                                  task.priority === "HIGH"
                                    ? "bg-[#E4664F]/10 text-[#E4664F]"
                                    : task.priority === "MEDIUM"
                                      ? "bg-[#D79A2C]/10 text-[#D79A2C]"
                                      : "bg-[#33A579]/10 text-[#33A579]"
                                }`}
                              >
                                {task.priority}
                              </span>
                            </div>

                            <div className="flex items-center gap-2 text-[13px] text-[#757575] mt-1">
                              <Briefcase className="w-3.5 h-3.5" />
                              <span>{task.client}</span>
                              <span className="text-[#E7E7EC] dark:text-[#323238]">•</span>
                              <span>{task.department}</span>
                              <span className="text-[#E7E7EC] dark:text-[#323238]">•</span>
                              <span>{task.hoursAssigned} hrs</span>
                            </div>
                          </div>
                        </div>

                        {/* Status elements and Quick Actions */}
                        <div className="flex items-center gap-4 shrink-0">
                          {/* Hover action bar that reveals */}
                          <div className="md:opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 bg-white dark:bg-[#242428] border border-[#E7E7EC] dark:border-[#323238] p-1 rounded-full shadow-[var(--shadow-float)]">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedTask(task);
                              }}
                              title="Open Details"
                              className="w-7 h-7 rounded-full hover:bg-[#F4F4F7] dark:hover:bg-[#323238] grid place-items-center text-[#757575]"
                            >
                              <FileText className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                toast.info(`Starting live session for ${task.title}`);
                              }}
                              title="Start timer"
                              className="w-7 h-7 rounded-full hover:bg-[#33A579]/10 hover:text-[#33A579] grid place-items-center text-[#757575]"
                            >
                              <Play className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setLogTimeTaskId(task.id);
                                setIsLogTimeOpen(true);
                              }}
                              title="Log Time"
                              className="w-7 h-7 rounded-full hover:bg-[#5A82E8]/10 hover:text-[#5A82E8] grid place-items-center text-[#757575]"
                            >
                              <Clock className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          {/* Beautiful Rounded Soft Status Badge */}
                          <span
                            className={`text-[12px] font-medium px-3 h-6 rounded-full inline-flex items-center ${
                              task.status === "Locked"
                                ? "bg-[#E7E7EC] text-[#757575] dark:bg-[#323238] dark:text-[#A8A8A8]"
                                : task.status === "Due Soon"
                                  ? "bg-[#E4664F]/10 text-[#E4664F]"
                                  : task.status === "On Track"
                                    ? "bg-[#33A579]/10 text-[#33A579]"
                                    : task.status === "Waiting"
                                      ? "bg-[#5A82E8]/10 text-[#5A82E8]"
                                      : task.status === "Approved"
                                        ? "bg-[#8A6CE0]/10 text-[#8A6CE0]"
                                        : task.status === "Review"
                                          ? "bg-[#D79A2C]/10 text-[#D79A2C]"
                                          : "bg-[#E4664F]/10 text-[#E4664F]"
                            }`}
                          >
                            {task.status}
                          </span>

                          <ChevronRight className="w-4 h-4 text-[#A8A8A8] group-hover:translate-x-1 transition-transform" />
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </section>

          {/* Workflow Bottlenecks Container */}
          <section className="relative z-10 lg:col-span-5 bg-[#f3f3f5]/90 backdrop-blur-[8px] dark:bg-[#162135]/45 border border-[#D5E4F5]/50 dark:border-[#2a384e]/20 rounded-[36px] p-5 sm:p-8 shadow-[var(--shadow-soft)] space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <h3 className="text-[20px] font-medium text-[#111111] dark:text-white">
                  Workflow Bottlenecks
                </h3>
                <p className="text-[13px] text-[#757575]">
                  Current blockers requiring team sync or cross-pod review
                </p>
              </div>

              {/* Bottleneck Filter Reset Button */}
              {bottleneckFilter && (
                <button
                  onClick={() => {
                    setBottleneckFilter(null);
                    toast.info("Bottleneck filter cleared");
                  }}
                  className="text-[13px] font-medium text-[#E4664F] flex items-center gap-1 hover:opacity-80 transition"
                >
                  Reset <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Bottlenecks Badge Row under the description */}
            <div className="flex flex-wrap gap-2 py-1">
              {["Draft", "Approval", "Review"].map((badge) => {
                const isActive = bottleneckFilter === badge;
                return (
                  <button
                    key={badge}
                    onClick={() => {
                      setBottleneckFilter(isActive ? null : badge);
                      toast.info(
                        isActive ? `Cleared ${badge} filter` : `Filtering bottlenecks by: ${badge}`,
                      );
                    }}
                    className={`h-7 px-3.5 rounded-full text-[12px] font-medium transition-all ${
                      isActive
                        ? "bg-[#111111] dark:bg-white text-white dark:text-[#111111] scale-105"
                        : "bg-white dark:bg-[#242428] border border-[#E7E7EC] dark:border-[#323238] text-[#757575] hover:border-[#111111] dark:hover:border-white"
                    }`}
                  >
                    {badge}
                  </button>
                );
              })}
            </div>

            <div className="bg-white dark:bg-[#242428] border border-[#E7E7EC] dark:border-[#323238] rounded-[28px] p-6 shadow-[var(--shadow-soft)] space-y-4">
              <div className="divide-y divide-[#E7E7EC] dark:divide-[#323238]">
                {filteredBottlenecks.length === 0 ? (
                  <div className="p-8 text-center text-[#757575] space-y-2">
                    <p className="text-[14px] font-medium">No bottlenecks in this stage</p>
                    <p className="text-[12px] text-[#A8A8A8]">
                      Try clearing the filter to see all bottlenecks.
                    </p>
                  </div>
                ) : (
                  filteredBottlenecks.map((b) => (
                    <div key={b.id} className="py-4 first:pt-0 last:pb-0 space-y-2.5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-[#8A6CE0]/15 text-[#8A6CE0] grid place-items-center text-[10px] font-semibold uppercase">
                            {b.owner.avatar}
                          </div>
                          <div>
                            <h4 className="text-[15px] font-medium text-[#111111] dark:text-white">
                              {b.taskTitle}
                            </h4>
                            <p className="text-[12px] text-[#757575]">
                              {b.project} • Owner:{" "}
                              <span className="font-medium text-[#111] dark:text-white">
                                {b.owner.name}
                              </span>
                            </p>
                          </div>
                        </div>

                        <div className="text-right">
                          <span className="text-[12px] font-medium text-[#E4664F]">
                            {b.waitingTime}
                          </span>
                          <div className="text-[11px] text-[#A8A8A8] mt-0.5 font-medium px-2 py-0.5 rounded-full bg-[#F4F4F7] dark:bg-[#1a1a1c] inline-block text-[10px]">
                            {b.stage}
                          </div>
                        </div>
                      </div>

                      {/* Progress with Micro timeline representation */}
                      <div className="space-y-1.5 pt-1">
                        <div className="flex items-center justify-between text-[11px] text-[#A8A8A8]">
                          <span>{b.stageFrom}</span>
                          <span>{b.stageTo}</span>
                        </div>
                        <div className="h-1 rounded-full bg-[#F4F4F7] dark:bg-[#1a1a1c] overflow-hidden">
                          <div
                            className="h-full bg-[#8A6CE0]"
                            style={{ width: `${b.progress}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </section>
        </div>
      </div>

      {/* --- MODAL DIALOGS AND SLIDE OVER DRAWERS --- */}

      {/* 1. Slide Over Task Details Drawer */}
      <AnimatePresence>
        {selectedTask && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedTask(null)}
              className="fixed inset-0 bg-black z-40"
            />

            {/* Slide-over Container */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 bottom-0 w-full sm:w-[500px] bg-white dark:bg-[#242428] border-l border-[#E7E7EC] dark:border-[#323238] z-50 shadow-2xl p-8 overflow-y-auto"
            >
              <div className="space-y-6">
                {/* Drawer Header */}
                <div className="flex items-center justify-between border-b border-[#E7E7EC] dark:border-[#323238] pb-4">
                  <div className="space-y-1">
                    <span className="text-[11px] font-semibold text-[#757575] uppercase tracking-wider font-mono">
                      Task Details
                    </span>
                    <h2 className="text-[20px] font-semibold tracking-tight text-[#111111] dark:text-white leading-tight">
                      {selectedTask.title}
                    </h2>
                  </div>
                  <button
                    onClick={() => setSelectedTask(null)}
                    className="w-8 h-8 rounded-full hover:bg-[#F4F4F7] dark:hover:bg-[#323238] grid place-items-center text-[#757575] transition"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Grid info details */}
                <div className="grid grid-cols-2 gap-4 bg-[#F4F4F7] dark:bg-[#1a1a1c] p-4 rounded-[20px] text-[13px]">
                  <div>
                    <span className="text-[#757575]">Client</span>
                    <p className="font-medium text-[#111111] dark:text-white mt-0.5">
                      {selectedTask.client}
                    </p>
                  </div>
                  <div>
                    <span className="text-[#757575]">Status</span>
                    <div className="flex items-center gap-1.5 mt-0.5 font-medium">
                      <span
                        className={`w-2 h-2 rounded-full ${getStatusIndicator(selectedTask.status).dot}`}
                      />
                      <span>{selectedTask.status}</span>
                    </div>
                  </div>
                  <div>
                    <span className="text-[#757575]">Priority</span>
                    <p className="font-semibold text-[#E4664F] mt-0.5">{selectedTask.priority}</p>
                  </div>
                  <div>
                    <span className="text-[#757575]">Capacity Allocated</span>
                    <p className="font-medium text-[#111111] dark:text-white mt-0.5">
                      {selectedTask.hoursAssigned} hrs
                    </p>
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <h4 className="text-[15px] font-medium text-[#111111] dark:text-white">
                    Description
                  </h4>
                  <p className="text-[13px] text-[#757575] leading-relaxed">
                    {selectedTask.description}
                  </p>
                </div>

                {/* Subtask Checklists */}
                {selectedTask.subtasks && selectedTask.subtasks.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="text-[15px] font-medium text-[#111111] dark:text-white">
                      Checkbox Goals
                    </h4>
                    <div className="space-y-2">
                      {selectedTask.subtasks.map((s) => (
                        <div
                          key={s.id}
                          onClick={() => toggleSubtask(selectedTask.id, s.id)}
                          className="flex items-center gap-3 p-2.5 rounded-lg border border-[#E7E7EC] dark:border-[#323238] bg-white dark:bg-[#242428] hover:bg-[#F4F4F7] dark:hover:bg-[#323238] cursor-pointer transition-all"
                        >
                          <div
                            className={`w-5 h-5 rounded border border-[#E7E7EC] dark:border-[#323238] grid place-items-center ${s.completed ? "bg-[#33A579] border-[#33A579]" : ""}`}
                          >
                            {s.completed && <Check className="w-3.5 h-3.5 text-white" />}
                          </div>
                          <span
                            className={`text-[13px] ${s.completed ? "line-through text-[#A8A8A8]" : "text-[#111111] dark:text-white"}`}
                          >
                            {s.text}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Log Time directly on Task */}
                <div className="space-y-3 pt-3 border-t border-[#E7E7EC] dark:border-[#323238]">
                  <h4 className="text-[15px] font-medium text-[#111111] dark:text-white">
                    Add Capacity Hours
                  </h4>
                  <div className="flex gap-2">
                    <input
                      id="task-hours-add"
                      type="number"
                      step="0.5"
                      defaultValue="0.5"
                      className="w-20 px-3 py-1.5 border border-[#E7E7EC] dark:border-[#323238] rounded-xl text-[13px]"
                    />
                    <button
                      onClick={() => {
                        const val = parseFloat(
                          (document.getElementById("task-hours-add") as HTMLInputElement)?.value ||
                            "0.5",
                        );
                        if (!isNaN(val) && val > 0) {
                          setTasks((prev) =>
                            prev.map((t) =>
                              t.id === selectedTask.id
                                ? { ...t, hoursAssigned: t.hoursAssigned + val }
                                : t,
                            ),
                          );
                          setSelectedTask((prev) =>
                            prev ? { ...prev, hoursAssigned: prev.hoursAssigned + val } : null,
                          );
                          toast.success(`Added ${val}h to assignment!`);
                        }
                      }}
                      className="px-4 py-1.5 rounded-xl bg-[#33A579] text-white text-[13px] font-medium"
                    >
                      Update Capacity
                    </button>
                  </div>
                </div>

                {/* Comments listing */}
                <div className="space-y-3 pt-4 border-t border-[#E7E7EC] dark:border-[#323238]">
                  <h4 className="text-[15px] font-medium text-[#111111] dark:text-white">
                    Activity Comments
                  </h4>
                  <div className="space-y-2.5 max-h-[150px] overflow-y-auto pr-2">
                    {selectedTask.comments.length === 0 ? (
                      <p className="text-[12px] text-[#A8A8A8] italic">
                        No comment feedback logged yet.
                      </p>
                    ) : (
                      selectedTask.comments.map((c, i) => (
                        <div
                          key={i}
                          className="bg-[#F4F4F7] dark:bg-[#1a1a1c] p-2.5 rounded-[14px] text-[12px] space-y-1"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-[#111111] dark:text-white">
                              {c.user}
                            </span>
                            <span className="text-[10px] text-[#A8A8A8]">{c.time}</span>
                          </div>
                          <p className="text-[#757575] leading-relaxed">{c.text}</p>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Add comment form input */}
                  <div className="flex items-center gap-2 pt-2">
                    <input
                      id="comment-text-input"
                      type="text"
                      placeholder="Type feedback commentary..."
                      className="flex-1 px-3.5 h-10 border border-[#E7E7EC] dark:border-[#323238] rounded-xl text-[13px] focus:outline-none"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          const val = (e.currentTarget as HTMLInputElement).value;
                          addCommentToTask(selectedTask.id, val);
                          (e.currentTarget as HTMLInputElement).value = "";
                        }
                      }}
                    />
                    <button
                      onClick={() => {
                        const input = document.getElementById(
                          "comment-text-input",
                        ) as HTMLInputElement;
                        addCommentToTask(selectedTask.id, input.value);
                        input.value = "";
                      }}
                      className="px-4 h-10 rounded-xl bg-[#111111] dark:bg-white text-white dark:text-[#111111] text-[13px] font-medium"
                    >
                      Post
                    </button>
                  </div>
                </div>

                {/* Task Checklist Actions */}
                <div className="pt-4 flex gap-2">
                  <button
                    onClick={(e) => {
                      toggleTaskCompletion(selectedTask.id, e);
                      setSelectedTask((prev) =>
                        prev ? { ...prev, completed: !prev.completed } : null,
                      );
                    }}
                    className={`flex-1 h-11 rounded-xl text-[13px] font-medium flex items-center justify-center gap-2 ${
                      selectedTask.completed
                        ? "bg-[#E7E7EC] text-[#757575] dark:bg-[#323238] dark:text-[#A8A8A8]"
                        : "bg-[#33A579] text-white"
                    }`}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    {selectedTask.completed ? "Reopen Task" : "Complete Task"}
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* 2. Create Task Modal */}
      <AnimatePresence>
        {isNewTaskOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsNewTaskOpen(false)}
              className="fixed inset-0 bg-black"
            />

            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-[#242428] border border-[#E7E7EC] dark:border-[#323238] rounded-[28px] max-w-md w-full p-6 shadow-2xl z-10 relative space-y-5"
            >
              <div className="flex items-center justify-between border-b border-[#E7E7EC] dark:border-[#323238] pb-3">
                <h3 className="text-[17px] font-medium text-[#111111] dark:text-white">
                  ＋ Create New Task
                </h3>
                <button
                  onClick={() => setIsNewTaskOpen(false)}
                  className="text-[#A8A8A8] hover:text-[#111]"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleCreateTask} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[12px] font-medium text-[#757575]">Task Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Design Pitch Deck"
                    value={newTaskTitle}
                    onChange={(e) => setNewTaskTitle(e.target.value)}
                    className="w-full h-10 px-3 border border-[#E7E7EC] dark:border-[#323238] rounded-xl text-[13px] focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[12px] font-medium text-[#757575]">Client</label>
                    <select
                      value={newTaskClient}
                      onChange={(e) => setNewTaskClient(e.target.value)}
                      className="w-full h-10 px-2 border border-[#E7E7EC] dark:border-[#323238] rounded-xl text-[13px]"
                    >
                      <option value="Internal">Internal</option>
                      <option value="ThreadSense AI">ThreadSense AI</option>
                      <option value="Helix Health">Helix Health</option>
                      <option value="Meridian">Meridian</option>
                      <option value="Aurora Coffee">Aurora Coffee</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[12px] font-medium text-[#757575]">Priority</label>
                    <select
                      value={newTaskPriority}
                      onChange={(e) => setNewTaskPriority(e.target.value as any)}
                      className="w-full h-10 px-2 border border-[#E7E7EC] dark:border-[#323238] rounded-xl text-[13px]"
                    >
                      <option value="HIGH">HIGH</option>
                      <option value="MEDIUM">MEDIUM</option>
                      <option value="LOW">LOW</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[12px] font-medium text-[#757575]">
                    Assigned Hours (Capacity allocation)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    min="0.5"
                    max="12"
                    value={newTaskHours}
                    onChange={(e) => setNewTaskHours(parseFloat(e.target.value))}
                    className="w-full h-10 px-3 border border-[#E7E7EC] dark:border-[#323238] rounded-xl text-[13px]"
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsNewTaskOpen(false)}
                    className="flex-1 h-10 rounded-xl bg-[#F4F4F7] text-[#111111] text-[13px] font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 h-10 rounded-xl bg-[#111111] dark:bg-white text-white dark:text-[#111111] text-[13px] font-medium"
                  >
                    Add Task
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 3. Log Time Modal */}
      <AnimatePresence>
        {isLogTimeOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsLogTimeOpen(false)}
              className="fixed inset-0 bg-black"
            />

            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-[#242428] border border-[#E7E7EC] dark:border-[#323238] rounded-[28px] max-w-md w-full p-6 shadow-2xl z-10 relative space-y-5"
            >
              <div className="flex items-center justify-between border-b border-[#E7E7EC] dark:border-[#323238] pb-3">
                <h3 className="text-[17px] font-medium text-[#111111] dark:text-white">
                  📝 Log Capacity Hours
                </h3>
                <button
                  onClick={() => setIsLogTimeOpen(false)}
                  className="text-[#A8A8A8] hover:text-[#111]"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleLogTime} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[12px] font-medium text-[#757575]">
                    Select Task to update capacity
                  </label>
                  <select
                    value={logTimeTaskId}
                    onChange={(e) => setLogTimeTaskId(e.target.value)}
                    className="w-full h-10 px-2 border border-[#E7E7EC] dark:border-[#323238] rounded-xl text-[13px]"
                  >
                    <option value="">General Work (Admin/Operational)</option>
                    {tasks.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.title} ({t.client})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[12px] font-medium text-[#757575]">Logged Hours</label>
                  <input
                    type="number"
                    step="0.5"
                    min="0.5"
                    value={logTimeHours}
                    onChange={(e) => setLogTimeHours(e.target.value)}
                    className="w-full h-10 px-3 border border-[#E7E7EC] dark:border-[#323238] rounded-xl text-[13px]"
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsLogTimeOpen(false)}
                    className="flex-1 h-10 rounded-xl bg-[#F4F4F7] text-[#111111] text-[13px] font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 h-10 rounded-xl bg-[#111111] dark:bg-white text-white dark:text-[#111111] text-[13px] font-medium"
                  >
                    Confirm Log Time
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </AppShell>
  );
}
