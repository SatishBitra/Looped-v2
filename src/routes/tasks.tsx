import { createFileRoute } from "@tanstack/react-router";
import { AppShell, Card, StatusPill } from "@/components/app-shell";
import {
  Plus,
  MoreHorizontal,
  CheckSquare,
  LayoutGrid,
  Calendar as CalendarIcon,
  Search,
  X,
  Trash2,
  CheckCircle2,
  ArrowRight,
  AlertCircle,
  Tag,
  Clock,
  Sparkles,
} from "lucide-react";
import { useState, useMemo, useEffect } from "react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "motion/react";

export const Route = createFileRoute("/tasks")({
  component: TasksPage,
});

export interface TaskCardItem {
  id: string;
  title: string;
  client: string;
  stage: "Pod Allocation" | "In Progress" | "Approval" | "Client Review";
  tone: "blue" | "purple" | "green" | "orange" | "yellow" | "red";
  tag: string;
  pts: number;
  urgent?: boolean;
  revision?: boolean;
  completed?: boolean;
  description?: string;
  assignees: string[];
}

const DEFAULT_STAGES = ["Pod Allocation", "In Progress", "Approval", "Client Review"] as const;

type StageType = (typeof DEFAULT_STAGES)[number];

const INITIAL_TASKS: TaskCardItem[] = [
  {
    id: "tk_1",
    title: "Kickoff — Q4 Rebrand",
    client: "Northwind",
    stage: "Pod Allocation",
    tone: "blue",
    tag: "Brand",
    pts: 5,
    assignees: ["#88A9F8", "#F3D36B"],
    description: "Align team on deliverable expectations, sprint milestones, and brand guidelines.",
  },
  {
    id: "tk_2",
    title: "Landing wireframes",
    client: "Helix Health",
    stage: "Pod Allocation",
    tone: "purple",
    tag: "Web",
    pts: 3,
    assignees: ["#A48AF8"],
    description: "Low-fidelity wireframe passes exploring navigation layout variations.",
  },
  {
    id: "tk_3",
    title: "Discovery interviews",
    client: "Meridian",
    stage: "Pod Allocation",
    tone: "green",
    tag: "Research",
    pts: 8,
    assignees: ["#88A9F8", "#A48AF8"],
    description: "Executive stakeholder Q&A synthesis and user persona insights.",
  },
  {
    id: "tk_4",
    title: "Product film cut v3",
    client: "Kite Motors",
    stage: "In Progress",
    tone: "blue",
    tag: "Video",
    pts: 8,
    assignees: ["#F3D36B", "#88A9F8"],
    description: "Color grade, audio stems mix, and 4K ProRes master rendering.",
  },
  {
    id: "tk_5",
    title: "Design system tokens",
    client: "Internal",
    stage: "In Progress",
    tone: "green",
    tag: "Design",
    pts: 5,
    assignees: ["#88A9F8"],
    description: "Automated sync scripts linking Figma style dictionaries to Tailwind config.",
  },
  {
    id: "tk_6",
    title: "Aurora social — week 3",
    client: "Aurora Coffee",
    stage: "In Progress",
    tone: "orange",
    tag: "Social",
    pts: 3,
    assignees: ["#F3D36B"],
    description: "Product photography carousels, caption typography, and release schedule.",
  },
  {
    id: "tk_7",
    title: "Motion boards v2",
    client: "Kite Motors",
    stage: "In Progress",
    tone: "purple",
    tag: "Motion",
    pts: 5,
    assignees: ["#A48AF8", "#F3D36B"],
    description: "Kinetic type layouts and logo transition animation tests in After Effects.",
  },
  {
    id: "tk_8",
    title: "Print campaign layout",
    client: "Meridian",
    stage: "Approval",
    tone: "red",
    tag: "Print",
    pts: 8,
    urgent: true,
    assignees: ["#88A9F8", "#F3D36B"],
    description: "Final spreads for Autumn release catalogue. Verified CMYK color profile.",
  },
  {
    id: "tk_9",
    title: "Podcast cover v2",
    client: "Loop FM",
    stage: "Approval",
    tone: "yellow",
    tag: "Brand",
    pts: 2,
    assignees: ["#A48AF8"],
    description: "3000x3000px high-contrast cover art raster for Spotify & Apple Podcasts.",
  },
  {
    id: "tk_10",
    title: "Website hero direction",
    client: "Northwind",
    stage: "Client Review",
    tone: "green",
    tag: "Web",
    pts: 5,
    assignees: ["#88A9F8"],
    description: "Interactive WebGL hero section prototypes with hover states.",
  },
  {
    id: "tk_11",
    title: "Campaign concepts",
    client: "Helix Health",
    stage: "Client Review",
    tone: "purple",
    tag: "Brand",
    pts: 3,
    revision: true,
    assignees: ["#F3D36B", "#A48AF8"],
    description: "Revised healthcare messaging and accessible color hierarchy options.",
  },
];

const STORAGE_KEY = "looped_tasks_data_v2";

function TasksPage() {
  const [mounted, setMounted] = useState(false);
  const [taskList, setTaskList] = useState<TaskCardItem[]>(() => {
    if (typeof window === "undefined") return INITIAL_TASKS;
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return INITIAL_TASKS;
  });

  const [viewMode, setViewMode] = useState<"Board" | "List" | "Calendar">("Board");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeStageFilter, setActiveStageFilter] = useState<string>("all");

  // Modal States
  const [isNewTaskOpen, setIsNewTaskOpen] = useState(false);
  const [defaultStageForModal, setDefaultStageForModal] = useState<StageType>("Pod Allocation");
  const [selectedTask, setSelectedTask] = useState<TaskCardItem | null>(null);
  const [activeMenuTaskId, setActiveMenuTaskId] = useState<string | null>(null);

  // New Task Form
  const [newTitle, setNewTitle] = useState("");
  const [newClient, setNewClient] = useState("");
  const [newStage, setNewStage] = useState<StageType>("Pod Allocation");
  const [newTag, setNewTag] = useState("Design");
  const [newPoints, setNewPoints] = useState(3);
  const [newIsUrgent, setNewIsUrgent] = useState(false);
  const [newIsRevision, setNewIsRevision] = useState(false);
  const [newDescription, setNewDescription] = useState("");

  useEffect(() => {
    setMounted(true);
  }, []);

  const saveTasks = (items: TaskCardItem[]) => {
    setTaskList(items);
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
      } catch {
        // silent
      }
    }
  };

  // Filtered tasks
  const filteredTasks = useMemo(() => {
    return taskList.filter((t) => {
      if (activeStageFilter !== "all" && t.stage !== activeStageFilter) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          t.title.toLowerCase().includes(q) ||
          t.client.toLowerCase().includes(q) ||
          t.tag.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [taskList, activeStageFilter, searchQuery]);

  // Tasks by stage
  const tasksByStage = useMemo(() => {
    const map: Record<StageType, TaskCardItem[]> = {
      "Pod Allocation": [],
      "In Progress": [],
      Approval: [],
      "Client Review": [],
    };
    filteredTasks.forEach((t) => {
      if (map[t.stage]) {
        map[t.stage].push(t);
      }
    });
    return map;
  }, [filteredTasks]);

  // Handle open New Task Modal with preselected stage
  const handleOpenNewTask = (stage?: StageType) => {
    const s = stage || "Pod Allocation";
    setDefaultStageForModal(s);
    setNewStage(s);
    setIsNewTaskOpen(true);
  };

  // Handle Create Task
  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newClient.trim()) {
      toast.error("Please provide both task title and client");
      return;
    }

    const tones: Record<string, TaskCardItem["tone"]> = {
      Brand: "blue",
      Web: "purple",
      Research: "green",
      Video: "blue",
      Design: "green",
      Social: "orange",
      Print: "red",
      Motion: "purple",
    };

    const newTask: TaskCardItem = {
      id: "tk_" + Date.now(),
      title: newTitle.trim(),
      client: newClient.trim(),
      stage: newStage,
      tone: tones[newTag] || "blue",
      tag: newTag,
      pts: Number(newPoints) || 3,
      urgent: newIsUrgent,
      revision: newIsRevision,
      completed: false,
      assignees: ["#88A9F8", "#F3D36B"],
      description: newDescription.trim() || "Task added directly to workspace.",
    };

    const updated = [newTask, ...taskList];
    saveTasks(updated);
    toast.success(`Task created in ${newStage}: ${newTask.title}`);

    // Reset Form
    setNewTitle("");
    setNewClient("");
    setNewDescription("");
    setNewIsUrgent(false);
    setNewIsRevision(false);
    setIsNewTaskOpen(false);
  };

  // Handle Move Stage
  const handleMoveStage = (taskId: string, targetStage: StageType) => {
    const updated = taskList.map((t) => (t.id === taskId ? { ...t, stage: targetStage } : t));
    saveTasks(updated);
    setActiveMenuTaskId(null);
    if (selectedTask?.id === taskId) {
      setSelectedTask({ ...selectedTask, stage: targetStage });
    }
    toast.success(`Moved task to ${targetStage}`);
  };

  // Handle Toggle Complete
  const handleToggleComplete = (taskId: string) => {
    const updated = taskList.map((t) => (t.id === taskId ? { ...t, completed: !t.completed } : t));
    saveTasks(updated);
    const item = taskList.find((t) => t.id === taskId);
    if (item) {
      toast.info(item.completed ? `Unmarked completed: ${item.title}` : `Completed: ${item.title}`);
    }
  };

  // Handle Delete Task
  const handleDeleteTask = (taskId: string, title: string) => {
    const updated = taskList.filter((t) => t.id !== taskId);
    saveTasks(updated);
    setActiveMenuTaskId(null);
    if (selectedTask?.id === taskId) {
      setSelectedTask(null);
    }
    toast.success(`Deleted task "${title}"`);
  };

  return (
    <AppShell breadcrumb={["Workspace", "Tasks"]}>
      {/* Top Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-[30px] font-semibold tracking-tight text-foreground">
            Tasks
          </h1>
          <p className="text-[14px] text-muted-foreground mt-1">
            Workflow across pods · {taskList.length} total tasks · {filteredTasks.length} active in
            view
          </p>
        </div>

        {/* Action Toolbar */}
        <div className="flex flex-wrap items-center gap-2">
          {/* View Mode Switcher: Board, List, Calendar */}
          <div className="flex bg-card border border-border rounded-[14px] p-1 w-full sm:w-auto">
            {(["Board", "List", "Calendar"] as const).map((v) => {
              const isSelected = viewMode === v;
              return (
                <button
                  key={v}
                  type="button"
                  onClick={() => {
                    setViewMode(v);
                    toast.info(`Switched to ${v} view`);
                  }}
                  className={`h-8 flex-1 sm:flex-initial px-3 rounded-[10px] text-[12px] font-medium transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    isSelected
                      ? "bg-foreground text-background shadow-xs font-semibold"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {v === "Board" && <LayoutGrid className="w-3.5 h-3.5" />}
                  {v === "List" && <CheckSquare className="w-3.5 h-3.5" />}
                  {v === "Calendar" && <CalendarIcon className="w-3.5 h-3.5" />}
                  <span>{v}</span>
                </button>
              );
            })}
          </div>

          {/* New Task Button */}
          <button
            type="button"
            onClick={() => handleOpenNewTask()}
            className="h-10 px-4 rounded-[18px] bg-foreground text-background text-[13px] font-medium flex items-center justify-center gap-2 w-full sm:w-auto hover:opacity-90 transition-opacity cursor-pointer shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>New task</span>
          </button>
        </div>
      </div>

      {/* Search & Stage Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div className="relative flex-1 max-w-xs">
          <Search className="w-3.5 h-3.5 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search tasks by title, tag, or client..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-8 pl-8 pr-7 text-xs bg-card border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-foreground"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            type="button"
            onClick={() => setActiveStageFilter("all")}
            className={`h-7 px-3 rounded-full text-xs font-medium cursor-pointer transition-all ${
              activeStageFilter === "all"
                ? "bg-foreground text-background font-semibold"
                : "bg-card border border-border text-muted-foreground hover:text-foreground"
            }`}
          >
            All Stages ({taskList.length})
          </button>
          {DEFAULT_STAGES.map((s) => {
            const count = taskList.filter((t) => t.stage === s).length;
            const isSel = activeStageFilter === s;
            return (
              <button
                key={s}
                type="button"
                onClick={() => setActiveStageFilter(s)}
                className={`h-7 px-3 rounded-full text-xs font-medium cursor-pointer transition-all ${
                  isSel
                    ? "bg-foreground text-background font-semibold"
                    : "bg-card border border-border text-muted-foreground hover:text-foreground"
                }`}
              >
                {s} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* ================= VIEW 1: KANBAN BOARD VIEW ================= */}
      {viewMode === "Board" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {DEFAULT_STAGES.map((stage) => {
            const cards = tasksByStage[stage];
            return (
              <div
                key={stage}
                className="bg-surface rounded-[28px] p-3 flex flex-col justify-start"
              >
                {/* Column Header */}
                <div className="flex items-center justify-between px-3 py-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[13px] font-semibold text-foreground">{stage}</span>
                    <span className="text-[11px] text-muted-foreground bg-card border border-border rounded-full px-1.5 font-mono">
                      {cards.length}
                    </span>
                  </div>
                  {/* Plus button inside stage header */}
                  <button
                    type="button"
                    onClick={() => handleOpenNewTask(stage)}
                    title={`Add new task to ${stage}`}
                    className="w-7 h-7 grid place-items-center rounded-lg hover:bg-card text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Column Cards */}
                <div className="flex flex-col gap-2.5">
                  {cards.length === 0 ? (
                    <div className="py-8 text-center text-xs text-muted-foreground border-2 border-dashed border-border/60 rounded-2xl p-4">
                      <span>No tasks in {stage}</span>
                      <button
                        type="button"
                        onClick={() => handleOpenNewTask(stage)}
                        className="block mt-2 text-foreground font-semibold hover:underline cursor-pointer mx-auto"
                      >
                        + Add first task
                      </button>
                    </div>
                  ) : (
                    cards.map((c) => (
                      <div
                        key={c.id}
                        onClick={() => setSelectedTask(c)}
                        className="bg-card border border-border rounded-[20px] p-4 shadow-2xs hover:shadow-md hover:border-foreground/20 transition-all cursor-pointer group relative"
                      >
                        {/* Top row: Tag Pill & Action Menu */}
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-1.5">
                            <StatusPill tone={c.tone}>{c.tag}</StatusPill>
                            {c.urgent && (
                              <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/10 text-rose-600 border border-rose-500/20">
                                Urgent
                              </span>
                            )}
                            {c.revision && (
                              <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-600 border border-amber-500/20">
                                Revision
                              </span>
                            )}
                          </div>

                          {/* Options menu */}
                          <div className="relative" onClick={(e) => e.stopPropagation()}>
                            <button
                              type="button"
                              onClick={() =>
                                setActiveMenuTaskId(activeMenuTaskId === c.id ? null : c.id)
                              }
                              className="w-6 h-6 rounded-md hover:bg-surface grid place-items-center text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                              title="Task actions"
                            >
                              <MoreHorizontal className="w-4 h-4" />
                            </button>

                            {/* Dropdown Menu */}
                            {activeMenuTaskId === c.id && (
                              <div className="absolute right-0 top-7 z-20 w-44 p-1.5 bg-card border border-border rounded-xl shadow-xl space-y-1">
                                <div className="text-[10px] uppercase font-semibold text-muted-foreground px-2 py-1">
                                  Move Stage
                                </div>
                                {DEFAULT_STAGES.filter((s) => s !== c.stage).map((nextSt) => (
                                  <button
                                    key={nextSt}
                                    type="button"
                                    onClick={() => handleMoveStage(c.id, nextSt)}
                                    className="w-full text-left px-2 py-1 rounded-md text-xs text-foreground hover:bg-surface flex items-center justify-between cursor-pointer"
                                  >
                                    <span>{nextSt}</span>
                                    <ArrowRight className="w-3 h-3 text-muted-foreground" />
                                  </button>
                                ))}
                                <div className="border-t border-border pt-1">
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteTask(c.id, c.title)}
                                    className="w-full text-left px-2 py-1 rounded-md text-xs text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 flex items-center gap-1.5 cursor-pointer"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                    <span>Delete Task</span>
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Title & Client */}
                        <div className="text-[14px] font-medium leading-snug mb-1 text-foreground group-hover:underline">
                          {c.title}
                        </div>
                        <div className="text-[12px] text-muted-foreground mb-3">{c.client}</div>

                        {/* Bottom Row: Assignee Avatars & Points */}
                        <div className="flex items-center justify-between pt-1 border-t border-border/50">
                          <div className="flex -space-x-1.5">
                            {c.assignees.map((col, idx) => (
                              <span
                                key={idx}
                                className="w-5 h-5 rounded-full border-2 border-card shadow-2xs"
                                style={{ background: col }}
                              />
                            ))}
                          </div>
                          <span className="text-[11px] font-mono text-muted-foreground bg-surface px-1.5 py-0.5 rounded-md">
                            {c.pts} pts
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ================= VIEW 2: LIST VIEW ================= */}
      {viewMode === "List" && (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left min-w-[700px] sm:min-w-0">
              <thead className="text-[12px] text-muted-foreground border-b border-border">
                <tr>
                  <th className="py-4 pl-6 pr-3 font-medium w-10">Done</th>
                  <th className="py-4 px-3 font-medium">Task Title</th>
                  <th className="py-4 px-3 font-medium">Client</th>
                  <th className="py-4 px-3 font-medium">Stage</th>
                  <th className="py-4 px-3 font-medium">Tag</th>
                  <th className="py-4 px-3 font-medium">Story Pts</th>
                  <th className="py-4 px-3 pr-6 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredTasks.map((t) => (
                  <tr
                    key={t.id}
                    onClick={() => setSelectedTask(t)}
                    className="border-b border-border last:border-0 hover:bg-surface/70 transition-colors cursor-pointer group"
                  >
                    <td className="py-4 pl-6 pr-3" onClick={(e) => e.stopPropagation()}>
                      <button
                        type="button"
                        onClick={() => handleToggleComplete(t.id)}
                        className={`w-5 h-5 rounded-md border grid place-items-center transition-colors cursor-pointer ${
                          t.completed
                            ? "bg-foreground border-foreground text-background"
                            : "border-border hover:border-foreground"
                        }`}
                      >
                        {t.completed && <CheckCircle2 className="w-3.5 h-3.5" />}
                      </button>
                    </td>
                    <td className="py-4 px-3">
                      <div
                        className={`text-[14px] font-medium text-foreground ${
                          t.completed ? "line-through opacity-50" : "group-hover:underline"
                        }`}
                      >
                        {t.title}
                      </div>
                      {t.description && (
                        <div className="text-[11px] text-muted-foreground truncate max-w-xs">
                          {t.description}
                        </div>
                      )}
                    </td>
                    <td className="py-4 px-3 text-[13px] text-muted-foreground">{t.client}</td>
                    <td className="py-4 px-3">
                      <StatusPill tone={t.tone}>{t.stage}</StatusPill>
                    </td>
                    <td className="py-4 px-3">
                      <span className="text-xs text-muted-foreground">{t.tag}</span>
                    </td>
                    <td className="py-4 px-3 font-mono text-xs text-muted-foreground">
                      {t.pts} pts
                    </td>
                    <td className="py-4 px-3 pr-6 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="inline-flex items-center gap-1.5">
                        <select
                          value={t.stage}
                          onChange={(e) => handleMoveStage(t.id, e.target.value as StageType)}
                          className="h-7 px-2 text-xs rounded-lg bg-surface border border-border text-foreground cursor-pointer focus:outline-none"
                        >
                          {DEFAULT_STAGES.map((s) => (
                            <option key={s} value={s}>
                              {s}
                            </option>
                          ))}
                        </select>
                        <button
                          type="button"
                          onClick={() => handleDeleteTask(t.id, t.title)}
                          className="p-1.5 rounded-lg text-muted-foreground hover:text-rose-600 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* ================= VIEW 3: CALENDAR / TIMELINE VIEW ================= */}
      {viewMode === "Calendar" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {[
            {
              label: "Today's Pod Focus",
              filterFn: (t: TaskCardItem) => t.stage === "In Progress",
            },
            {
              label: "Due for Client / QA",
              filterFn: (t: TaskCardItem) => t.stage === "Approval" || t.stage === "Client Review",
            },
            {
              label: "Backlog & Allocation",
              filterFn: (t: TaskCardItem) => t.stage === "Pod Allocation",
            },
          ].map((col) => {
            const list = taskList.filter(col.filterFn);
            return (
              <div key={col.label} className="bg-surface rounded-3xl p-4 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-border">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    {col.label}
                  </h3>
                  <span className="text-xs font-mono font-medium text-foreground bg-card px-2 py-0.5 rounded-full border border-border">
                    {list.length} tasks
                  </span>
                </div>
                <div className="space-y-2.5">
                  {list.map((task) => (
                    <div
                      key={task.id}
                      onClick={() => setSelectedTask(task)}
                      className="p-3.5 rounded-2xl bg-card border border-border hover:border-foreground/30 shadow-2xs transition-all cursor-pointer space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <StatusPill tone={task.tone}>{task.stage}</StatusPill>
                        <span className="text-[11px] font-mono text-muted-foreground">
                          {task.pts} pts
                        </span>
                      </div>
                      <div className="text-xs font-semibold text-foreground">{task.title}</div>
                      <div className="text-[11px] text-muted-foreground flex items-center justify-between">
                        <span>{task.client}</span>
                        <span>{task.tag}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ================= MODAL: CREATE NEW TASK ================= */}
      <AnimatePresence>
        {isNewTaskOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsNewTaskOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-xs"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 12 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 12 }}
              className="bg-card border border-border rounded-3xl max-w-lg w-full p-6 shadow-2xl z-10 relative space-y-5"
            >
              <div className="flex items-center justify-between pb-3 border-b border-border">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-foreground text-background grid place-items-center">
                    <Plus className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-foreground">Create New Task</h3>
                    <p className="text-xs text-muted-foreground">
                      Target stage: <strong>{newStage}</strong>
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsNewTaskOpen(false)}
                  className="w-8 h-8 rounded-full hover:bg-surface grid place-items-center text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleCreateTask} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">
                    Task Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="e.g. Design responsive hero variations"
                    className="w-full h-10 px-3 rounded-xl bg-surface border border-border text-xs text-foreground focus:outline-none focus:border-foreground"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-foreground mb-1">
                      Client *
                    </label>
                    <input
                      type="text"
                      required
                      value={newClient}
                      onChange={(e) => setNewClient(e.target.value)}
                      placeholder="e.g. Northwind"
                      className="w-full h-10 px-3 rounded-xl bg-surface border border-border text-xs text-foreground focus:outline-none focus:border-foreground"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-foreground mb-1">
                      Stage
                    </label>
                    <select
                      value={newStage}
                      onChange={(e) => setNewStage(e.target.value as StageType)}
                      className="w-full h-10 px-3 rounded-xl bg-surface border border-border text-xs text-foreground focus:outline-none focus:border-foreground"
                    >
                      {DEFAULT_STAGES.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-foreground mb-1">
                      Tag / Category
                    </label>
                    <select
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      className="w-full h-10 px-3 rounded-xl bg-surface border border-border text-xs text-foreground focus:outline-none focus:border-foreground"
                    >
                      {[
                        "Design",
                        "Brand",
                        "Web",
                        "Video",
                        "Motion",
                        "Social",
                        "Print",
                        "Research",
                      ].map((tag) => (
                        <option key={tag} value={tag}>
                          {tag}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-foreground mb-1">
                      Story Points
                    </label>
                    <select
                      value={newPoints}
                      onChange={(e) => setNewPoints(Number(e.target.value))}
                      className="w-full h-10 px-3 rounded-xl bg-surface border border-border text-xs text-foreground focus:outline-none focus:border-foreground"
                    >
                      {[1, 2, 3, 5, 8, 13].map((pts) => (
                        <option key={pts} value={pts}>
                          {pts} pts
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex items-center gap-4 py-1">
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-foreground">
                    <input
                      type="checkbox"
                      checked={newIsUrgent}
                      onChange={(e) => setNewIsUrgent(e.target.checked)}
                      className="rounded accent-foreground cursor-pointer"
                    />
                    <span>Mark as Urgent Priority</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-foreground">
                    <input
                      type="checkbox"
                      checked={newIsRevision}
                      onChange={(e) => setNewIsRevision(e.target.checked)}
                      className="rounded accent-foreground cursor-pointer"
                    />
                    <span>Client Revision Request</span>
                  </label>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">
                    Description / Scope
                  </label>
                  <textarea
                    rows={2}
                    value={newDescription}
                    onChange={(e) => setNewDescription(e.target.value)}
                    placeholder="Brief description of requirements..."
                    className="w-full p-2.5 rounded-xl bg-surface border border-border text-xs text-foreground focus:outline-none focus:border-foreground resize-none"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
                  <button
                    type="button"
                    onClick={() => setIsNewTaskOpen(false)}
                    className="h-10 px-4 rounded-xl text-xs font-medium text-muted-foreground hover:text-foreground cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="h-10 px-5 rounded-xl bg-foreground text-background text-xs font-semibold hover:opacity-90 transition-opacity cursor-pointer shadow-xs"
                  >
                    Create Task
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ================= MODAL: TASK DETAIL & STAGE SWITCHER ================= */}
      <AnimatePresence>
        {selectedTask && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedTask(null)}
              className="fixed inset-0 bg-black/60 backdrop-blur-xs"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 12 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 12 }}
              className="bg-card border border-border rounded-3xl max-w-lg w-full p-6 shadow-2xl z-10 relative space-y-5"
            >
              <div className="flex items-start justify-between pb-3 border-b border-border">
                <div>
                  <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                    <StatusPill tone={selectedTask.tone}>{selectedTask.tag}</StatusPill>
                    <span className="text-[11px] font-mono text-muted-foreground bg-surface px-2 py-0.5 rounded-full border border-border">
                      {selectedTask.pts} pts
                    </span>
                    {selectedTask.urgent && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/10 text-rose-600 border border-rose-500/20">
                        Urgent
                      </span>
                    )}
                  </div>
                  <h3 className="text-lg font-semibold text-foreground">{selectedTask.title}</h3>
                  <p className="text-xs text-muted-foreground">Client: {selectedTask.client}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedTask(null)}
                  className="w-8 h-8 rounded-full hover:bg-surface grid place-items-center text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {selectedTask.description && (
                <div className="p-3 rounded-xl bg-surface border border-border text-xs text-foreground leading-relaxed">
                  {selectedTask.description}
                </div>
              )}

              {/* Stage Transition Selector */}
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1.5">
                  Change Stage
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {DEFAULT_STAGES.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => handleMoveStage(selectedTask.id, s)}
                      className={`h-9 px-3 rounded-xl text-xs font-medium flex items-center justify-between transition-colors cursor-pointer ${
                        selectedTask.stage === s
                          ? "bg-foreground text-background font-semibold"
                          : "bg-surface text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <span>{s}</span>
                      {selectedTask.stage === s && <CheckCircle2 className="w-3.5 h-3.5" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="flex items-center justify-between pt-3 border-t border-border">
                <button
                  type="button"
                  onClick={() => handleDeleteTask(selectedTask.id, selectedTask.title)}
                  className="text-xs text-rose-600 hover:text-rose-700 flex items-center gap-1.5 font-medium cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete Task</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleToggleComplete(selectedTask.id)}
                    className="h-9 px-3.5 rounded-xl bg-surface hover:bg-muted text-xs font-medium text-foreground flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>{selectedTask.completed ? "Mark Incomplete" : "Mark Complete"}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedTask(null)}
                    className="h-9 px-4 rounded-xl bg-foreground text-background text-xs font-semibold hover:opacity-90 cursor-pointer"
                  >
                    Done
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </AppShell>
  );
}
