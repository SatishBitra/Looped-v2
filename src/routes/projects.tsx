import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AppShell, Card, StatusPill } from "@/components/app-shell";
import {
  Filter,
  ArrowUpDown,
  Plus,
  Search,
  X,
  Trash2,
  Calendar,
  Briefcase,
  Users,
  CheckCircle2,
  ExternalLink,
  ChevronDown,
  Sparkles,
} from "lucide-react";
import { useState, useMemo, useEffect } from "react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "motion/react";

export const Route = createFileRoute("/projects")({
  component: ProjectsPage,
});

export interface ProjectItem {
  id: string;
  name: string;
  client: string;
  stage: "Pod Allocation" | "In Progress" | "Client Review" | "Approval" | "Archived";
  tone: "blue" | "purple" | "orange" | "yellow" | "green" | "neutral";
  health: "Healthy" | "Tight" | "Over";
  healthTone: "green" | "yellow" | "red";
  budget: number;
  due: string;
  teamColors: string[];
  description?: string;
}

const DEFAULT_PROJECTS: ProjectItem[] = [
  {
    id: "proj_1",
    name: "Q4 Rebrand",
    client: "Northwind",
    stage: "In Progress",
    tone: "blue",
    health: "Healthy",
    healthTone: "green",
    budget: 68,
    due: "Sep 30",
    teamColors: ["#88A9F8", "#F3D36B", "#A48AF8"],
    description:
      "Holistic visual rebrand including 3D product renders, guidelines, and design tokens.",
  },
  {
    id: "proj_2",
    name: "Product film",
    client: "Kite Motors",
    stage: "Client Review",
    tone: "purple",
    health: "Tight",
    healthTone: "yellow",
    budget: 91,
    due: "Aug 12",
    teamColors: ["#88A9F8", "#F3D36B"],
    description: "60-second automotive cinematic trailer and 15s social performance cutdowns.",
  },
  {
    id: "proj_3",
    name: "Landing revamp",
    client: "Helix Health",
    stage: "Pod Allocation",
    tone: "orange",
    health: "Healthy",
    healthTone: "green",
    budget: 22,
    due: "Oct 04",
    teamColors: ["#F3D36B", "#A48AF8"],
    description: "Conversion-optimized landing page system with interactive SVG anatomy modules.",
  },
  {
    id: "proj_4",
    name: "Social pack Q3",
    client: "Aurora Coffee",
    stage: "Approval",
    tone: "yellow",
    health: "Over",
    healthTone: "red",
    budget: 112,
    due: "Jul 28",
    teamColors: ["#88A9F8", "#A48AF8"],
    description: "24 carousel layouts and reels motion kit for Summer Cold Brew campaign.",
  },
  {
    id: "proj_5",
    name: "Design system",
    client: "Internal",
    stage: "In Progress",
    tone: "green",
    health: "Healthy",
    healthTone: "green",
    budget: 44,
    due: "Nov 15",
    teamColors: ["#88A9F8", "#F3D36B", "#A48AF8"],
    description: "Semantic token architecture, Figma library sync, and React headless primitives.",
  },
  {
    id: "proj_6",
    name: "Podcast branding",
    client: "Loop FM",
    stage: "Client Review",
    tone: "purple",
    health: "Tight",
    healthTone: "yellow",
    budget: 87,
    due: "Aug 02",
    teamColors: ["#F3D36B"],
    description:
      "Master audio visualizer presets, channel badge vector kit, and Spotify banner assets.",
  },
];

const STORAGE_KEY = "looped_projects_data_v2";

type SortField = "name" | "budget" | "due" | "health";
type SortOrder = "asc" | "desc";

function ProjectsPage() {
  const navigate = useNavigate();
  const [mounted, setMounted] = useState(false);
  const [projectList, setProjectList] = useState<ProjectItem[]>(() => {
    if (typeof window === "undefined") return DEFAULT_PROJECTS;
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return DEFAULT_PROJECTS;
  });

  const [activeTab, setActiveTab] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [sortField, setSortField] = useState<SortField>("name");
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");
  const [selectedHealthFilter, setSelectedHealthFilter] = useState<string>("all");

  // Modal States
  const [isNewProjectOpen, setIsNewProjectOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<ProjectItem | null>(null);

  // New Project Form State
  const [newName, setNewName] = useState("");
  const [newClient, setNewClient] = useState("");
  const [newStage, setNewStage] = useState<ProjectItem["stage"]>("In Progress");
  const [newHealth, setNewHealth] = useState<ProjectItem["health"]>("Healthy");
  const [newBudget, setNewBudget] = useState(50);
  const [newDue, setNewDue] = useState("Nov 30");
  const [newDescription, setNewDescription] = useState("");

  useEffect(() => {
    setMounted(true);
  }, []);

  // Sync to local storage
  const saveProjects = (items: ProjectItem[]) => {
    setProjectList(items);
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
      } catch {
        // silent
      }
    }
  };

  // Tab Filtering
  const filteredProjects = useMemo(() => {
    return projectList.filter((p) => {
      // Tab filter
      if (activeTab === "Active" && p.stage !== "In Progress" && p.stage !== "Pod Allocation") {
        return false;
      }
      if (activeTab === "In review" && p.stage !== "Client Review" && p.stage !== "Approval") {
        return false;
      }
      if (activeTab === "At risk" && p.health !== "Tight" && p.health !== "Over") {
        return false;
      }
      if (activeTab === "Archived" && p.stage !== "Archived") {
        return false;
      }
      if (activeTab !== "Archived" && p.stage === "Archived") {
        return false;
      }

      // Health filter
      if (selectedHealthFilter !== "all" && p.health !== selectedHealthFilter) {
        return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          p.name.toLowerCase().includes(q) ||
          p.client.toLowerCase().includes(q) ||
          p.stage.toLowerCase().includes(q)
        );
      }

      return true;
    });
  }, [projectList, activeTab, selectedHealthFilter, searchQuery]);

  // Sorting
  const sortedProjects = useMemo(() => {
    return [...filteredProjects].sort((a, b) => {
      let comparison = 0;
      if (sortField === "name") {
        comparison = a.name.localeCompare(b.name);
      } else if (sortField === "budget") {
        comparison = a.budget - b.budget;
      } else if (sortField === "due") {
        comparison = a.due.localeCompare(b.due);
      } else if (sortField === "health") {
        comparison = a.health.localeCompare(b.health);
      }
      return sortOrder === "asc" ? comparison : -comparison;
    });
  }, [filteredProjects, sortField, sortOrder]);

  // Handle New Project Creation
  const handleCreateProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newClient.trim()) {
      toast.error("Please provide both a project name and client");
      return;
    }

    const stageTones: Record<ProjectItem["stage"], ProjectItem["tone"]> = {
      "Pod Allocation": "orange",
      "In Progress": "blue",
      "Client Review": "purple",
      Approval: "yellow",
      Archived: "neutral",
    };

    const healthTones: Record<ProjectItem["health"], ProjectItem["healthTone"]> = {
      Healthy: "green",
      Tight: "yellow",
      Over: "red",
    };

    const newProject: ProjectItem = {
      id: "proj_" + Date.now(),
      name: newName.trim(),
      client: newClient.trim(),
      stage: newStage,
      tone: stageTones[newStage] || "blue",
      health: newHealth,
      healthTone: healthTones[newHealth] || "green",
      budget: Number(newBudget) || 50,
      due: newDue.trim() || "TBD",
      teamColors: ["#88A9F8", "#F3D36B"],
      description: newDescription.trim() || "Newly initialized workspace project.",
    };

    const updated = [newProject, ...projectList];
    saveProjects(updated);
    toast.success(`Project created: ${newProject.name}`);

    // Reset Form
    setNewName("");
    setNewClient("");
    setNewDescription("");
    setNewBudget(50);
    setIsNewProjectOpen(false);
  };

  // Handle Delete Project
  const handleDeleteProject = (id: string, name: string) => {
    const updated = projectList.filter((p) => p.id !== id);
    saveProjects(updated);
    if (selectedProject?.id === id) {
      setSelectedProject(null);
    }
    toast.success(`Project "${name}" removed`);
  };

  // Handle Update Stage of Selected Project
  const handleUpdateStage = (id: string, nextStage: ProjectItem["stage"]) => {
    const stageTones: Record<ProjectItem["stage"], ProjectItem["tone"]> = {
      "Pod Allocation": "orange",
      "In Progress": "blue",
      "Client Review": "purple",
      Approval: "yellow",
      Archived: "neutral",
    };

    const updated = projectList.map((p) =>
      p.id === id ? { ...p, stage: nextStage, tone: stageTones[nextStage] || "blue" } : p,
    );
    saveProjects(updated);
    if (selectedProject?.id === id) {
      setSelectedProject({
        ...selectedProject,
        stage: nextStage,
        tone: stageTones[nextStage] || "blue",
      });
    }
    toast.success(`Stage updated to ${nextStage}`);
  };

  // Quick stats
  const activeCount = projectList.filter(
    (p) => p.stage === "In Progress" || p.stage === "Pod Allocation",
  ).length;
  const reviewCount = projectList.filter(
    (p) => p.stage === "Client Review" || p.stage === "Approval",
  ).length;
  const archivedCount = projectList.filter((p) => p.stage === "Archived").length;

  return (
    <AppShell breadcrumb={["Workspace", "Projects"]}>
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-[30px] font-semibold tracking-tight text-foreground">
            Projects
          </h1>
          <p className="text-[14px] text-muted-foreground mt-1">
            {activeCount} active · {reviewCount} in review · {archivedCount} archived
          </p>
        </div>

        {/* Action Buttons Toolbar */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Filter Button */}
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setIsFilterOpen(!isFilterOpen);
                setIsSortOpen(false);
              }}
              className={`h-10 px-3.5 rounded-[18px] border text-[13px] font-medium flex items-center gap-2 transition-all cursor-pointer ${
                isFilterOpen || selectedHealthFilter !== "all" || searchQuery
                  ? "bg-foreground text-background border-foreground shadow-xs"
                  : "bg-card border-border text-foreground hover:bg-surface"
              }`}
            >
              <Filter className="w-4 h-4" strokeWidth={1.75} />
              <span>Filter</span>
              {(selectedHealthFilter !== "all" || searchQuery) && (
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              )}
            </button>

            {/* Filter Dropdown Popover */}
            <AnimatePresence>
              {isFilterOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.95 }}
                  className="absolute right-0 sm:left-0 top-12 z-30 w-72 p-4 bg-card border border-border rounded-2xl shadow-xl space-y-3.5"
                >
                  <div className="flex items-center justify-between pb-2 border-b border-border">
                    <span className="text-xs font-semibold text-foreground uppercase tracking-wider">
                      Filter Projects
                    </span>
                    <button
                      type="button"
                      onClick={() => setIsFilterOpen(false)}
                      className="text-muted-foreground hover:text-foreground text-xs"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Search Input */}
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Search title or client..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full h-8 pl-8 pr-3 text-xs bg-surface border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-foreground"
                    />
                  </div>

                  {/* Health Filter */}
                  <div>
                    <label className="text-[11px] font-semibold text-muted-foreground block mb-1.5">
                      Health Status
                    </label>
                    <div className="grid grid-cols-2 gap-1.5">
                      {["all", "Healthy", "Tight", "Over"].map((h) => (
                        <button
                          key={h}
                          type="button"
                          onClick={() => setSelectedHealthFilter(h)}
                          className={`h-7 px-2.5 rounded-lg text-xs font-medium capitalize text-left transition-colors cursor-pointer ${
                            selectedHealthFilter === h
                              ? "bg-foreground text-background font-semibold"
                              : "bg-surface text-muted-foreground hover:text-foreground"
                          }`}
                        >
                          {h}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Reset Filters */}
                  {(selectedHealthFilter !== "all" || searchQuery) && (
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedHealthFilter("all");
                        setSearchQuery("");
                        toast.info("Filters cleared");
                      }}
                      className="w-full h-7 rounded-lg bg-surface text-xs text-[#E4664F] hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors font-medium cursor-pointer"
                    >
                      Reset All Filters
                    </button>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Sort Button */}
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setIsSortOpen(!isSortOpen);
                setIsFilterOpen(false);
              }}
              className={`h-10 px-3.5 rounded-[18px] border text-[13px] font-medium flex items-center gap-2 transition-all cursor-pointer ${
                isSortOpen
                  ? "bg-foreground text-background border-foreground shadow-xs"
                  : "bg-card border-border text-foreground hover:bg-surface"
              }`}
            >
              <ArrowUpDown className="w-4 h-4" strokeWidth={1.75} />
              <span>Sort: {sortField}</span>
            </button>

            {/* Sort Popover */}
            <AnimatePresence>
              {isSortOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.95 }}
                  className="absolute right-0 top-12 z-30 w-52 p-3 bg-card border border-border rounded-2xl shadow-xl space-y-1"
                >
                  <div className="text-[11px] font-semibold text-muted-foreground px-2 py-1 uppercase tracking-wider">
                    Sort by
                  </div>
                  {(
                    [
                      { id: "name", label: "Project Name" },
                      { id: "budget", label: "Budget Used" },
                      { id: "due", label: "Due Date" },
                      { id: "health", label: "Health Status" },
                    ] as const
                  ).map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => {
                        if (sortField === opt.id) {
                          setSortOrder(sortOrder === "asc" ? "desc" : "asc");
                        } else {
                          setSortField(opt.id);
                          setSortOrder("asc");
                        }
                        setIsSortOpen(false);
                        toast.info(
                          `Sorted by ${opt.label} (${sortOrder === "asc" ? "desc" : "asc"})`,
                        );
                      }}
                      className={`w-full h-8 px-2.5 rounded-lg text-xs font-medium flex items-center justify-between text-left cursor-pointer ${
                        sortField === opt.id
                          ? "bg-surface text-foreground font-semibold"
                          : "text-muted-foreground hover:text-foreground hover:bg-surface/50"
                      }`}
                    >
                      <span>{opt.label}</span>
                      {sortField === opt.id && (
                        <span className="text-[10px] uppercase font-mono text-muted-foreground">
                          {sortOrder}
                        </span>
                      )}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* New Project Button */}
          <button
            type="button"
            onClick={() => setIsNewProjectOpen(true)}
            className="h-10 px-4 rounded-[18px] bg-foreground text-background text-[13px] font-medium flex items-center gap-2 hover:opacity-90 transition-opacity cursor-pointer shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>New project</span>
          </button>
        </div>
      </div>

      {/* Tabs Row */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div className="flex flex-wrap gap-2">
          {["All", "Active", "In review", "At risk", "Archived"].map((t) => {
            const isSelected = activeTab === t;
            return (
              <button
                key={t}
                type="button"
                onClick={() => {
                  setActiveTab(t);
                  toast.info(`Filtered view: ${t}`);
                }}
                className={`h-8 px-3.5 rounded-full text-[12px] font-medium transition-all cursor-pointer ${
                  isSelected
                    ? "bg-foreground text-background shadow-xs"
                    : "bg-card border border-border text-muted-foreground hover:text-foreground hover:bg-surface"
                }`}
              >
                {t}
              </button>
            );
          })}
        </div>

        {/* Search status badge if searching */}
        {searchQuery && (
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-card border border-border px-3 py-1 rounded-full">
            <span>Query: "{searchQuery}"</span>
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="hover:text-foreground cursor-pointer"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        )}
      </div>

      {/* Projects Table Card */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left min-w-[700px] sm:min-w-0">
            <thead className="text-[12px] text-muted-foreground">
              <tr className="border-b border-border">
                <th className="py-4 pl-6 pr-3 font-medium">Project</th>
                <th className="py-4 px-3 font-medium">Client</th>
                <th className="py-4 px-3 font-medium">Stage</th>
                <th className="py-4 px-3 font-medium">Health</th>
                <th className="py-4 px-3 font-medium">Budget used</th>
                <th className="py-4 px-3 font-medium">Team</th>
                <th className="py-4 px-3 font-medium">Due</th>
                <th className="py-4 px-3 pr-6 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {sortedProjects.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-muted-foreground text-xs">
                    <CheckCircle2 className="w-8 h-8 mx-auto mb-2 opacity-40" />
                    <p className="font-medium text-foreground">No projects matching criteria</p>
                    <p className="mt-0.5">
                      Try clearing your filters or create a new project above.
                    </p>
                  </td>
                </tr>
              ) : (
                sortedProjects.map((p) => (
                  <tr
                    key={p.id}
                    onClick={() => setSelectedProject(p)}
                    className="border-b border-border last:border-0 hover:bg-surface/70 transition-colors cursor-pointer group"
                  >
                    <td className="py-4 pl-6 pr-3">
                      <div className="text-[14px] font-medium text-foreground group-hover:underline">
                        {p.name}
                      </div>
                      {p.description && (
                        <div className="text-[11px] text-muted-foreground truncate max-w-[220px]">
                          {p.description}
                        </div>
                      )}
                    </td>
                    <td className="py-4 px-3 text-[13px] text-muted-foreground">{p.client}</td>
                    <td className="py-4 px-3">
                      <StatusPill tone={p.tone}>{p.stage}</StatusPill>
                    </td>
                    <td className="py-4 px-3">
                      <StatusPill tone={p.healthTone}>{p.health}</StatusPill>
                    </td>
                    <td className="py-4 px-3">
                      <div className="flex items-center gap-2 w-40">
                        <div className="flex-1 h-1.5 rounded-full bg-surface overflow-hidden">
                          <div
                            className={`h-full rounded-full bg-status-${p.healthTone}`}
                            style={{ width: `${Math.min(p.budget, 100)}%` }}
                          />
                        </div>
                        <span className="text-[12px] text-muted-foreground w-8 text-right font-mono">
                          {p.budget}%
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-3">
                      <div className="flex -space-x-1.5">
                        {p.teamColors.map((c, i) => (
                          <span
                            key={i}
                            className="w-6 h-6 rounded-full border-2 border-card shadow-2xs"
                            style={{ background: c }}
                          />
                        ))}
                      </div>
                    </td>
                    <td className="py-4 px-3 text-[13px] text-muted-foreground font-mono">
                      {p.due}
                    </td>
                    <td className="py-4 px-3 pr-6 text-right">
                      <div
                        className="inline-flex items-center gap-1.5"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          type="button"
                          onClick={() => setSelectedProject(p)}
                          className="px-2.5 py-1 rounded-lg text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-card border border-transparent hover:border-border transition-colors cursor-pointer"
                          title="View Details"
                        >
                          View
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteProject(p.id, p.name)}
                          className="p-1 rounded-lg text-muted-foreground hover:text-rose-600 transition-colors cursor-pointer"
                          title="Delete Project"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* ================= MODAL: CREATE NEW PROJECT ================= */}
      <AnimatePresence>
        {isNewProjectOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsNewProjectOpen(false)}
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
                    <h3 className="text-base font-semibold text-foreground">Create New Project</h3>
                    <p className="text-xs text-muted-foreground">
                      Add deliverable and allocate budget
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsNewProjectOpen(false)}
                  className="w-8 h-8 rounded-full hover:bg-surface grid place-items-center text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleCreateProject} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">
                    Project Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="e.g. Q1 Marketing Campaign"
                    className="w-full h-10 px-3 rounded-xl bg-surface border border-border text-xs text-foreground focus:outline-none focus:border-foreground"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-foreground mb-1">
                      Client / Organization *
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
                      Due Date
                    </label>
                    <input
                      type="text"
                      value={newDue}
                      onChange={(e) => setNewDue(e.target.value)}
                      placeholder="e.g. Dec 15"
                      className="w-full h-10 px-3 rounded-xl bg-surface border border-border text-xs text-foreground focus:outline-none focus:border-foreground"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-foreground mb-1">
                      Stage
                    </label>
                    <select
                      value={newStage}
                      onChange={(e) => setNewStage(e.target.value as ProjectItem["stage"])}
                      className="w-full h-10 px-3 rounded-xl bg-surface border border-border text-xs text-foreground focus:outline-none focus:border-foreground"
                    >
                      <option value="Pod Allocation">Pod Allocation</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Client Review">Client Review</option>
                      <option value="Approval">Approval</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-foreground mb-1">
                      Health
                    </label>
                    <select
                      value={newHealth}
                      onChange={(e) => setNewHealth(e.target.value as ProjectItem["health"])}
                      className="w-full h-10 px-3 rounded-xl bg-surface border border-border text-xs text-foreground focus:outline-none focus:border-foreground"
                    >
                      <option value="Healthy">Healthy</option>
                      <option value="Tight">Tight</option>
                      <option value="Over">Over</option>
                    </select>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center text-xs mb-1">
                    <span className="font-semibold text-foreground">Budget Allocated</span>
                    <span className="text-muted-foreground font-mono">{newBudget}%</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="150"
                    value={newBudget}
                    onChange={(e) => setNewBudget(Number(e.target.value))}
                    className="w-full cursor-pointer accent-foreground"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">
                    Description / Scope
                  </label>
                  <textarea
                    rows={2}
                    value={newDescription}
                    onChange={(e) => setNewDescription(e.target.value)}
                    placeholder="Brief project deliverables overview..."
                    className="w-full p-2.5 rounded-xl bg-surface border border-border text-xs text-foreground focus:outline-none focus:border-foreground resize-none"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
                  <button
                    type="button"
                    onClick={() => setIsNewProjectOpen(false)}
                    className="h-10 px-4 rounded-xl text-xs font-medium text-muted-foreground hover:text-foreground cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="h-10 px-5 rounded-xl bg-foreground text-background text-xs font-semibold hover:opacity-90 transition-opacity cursor-pointer shadow-xs"
                  >
                    Create Project
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ================= MODAL: PROJECT DETAILS & STAGE MANAGEMENT ================= */}
      <AnimatePresence>
        {selectedProject && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedProject(null)}
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
                  <div className="flex items-center gap-2 mb-1">
                    <StatusPill tone={selectedProject.tone}>{selectedProject.stage}</StatusPill>
                    <StatusPill tone={selectedProject.healthTone}>
                      {selectedProject.health}
                    </StatusPill>
                  </div>
                  <h3 className="text-lg font-semibold text-foreground">{selectedProject.name}</h3>
                  <p className="text-xs text-muted-foreground">Client: {selectedProject.client}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedProject(null)}
                  className="w-8 h-8 rounded-full hover:bg-surface grid place-items-center text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {selectedProject.description && (
                <div className="p-3 rounded-xl bg-surface border border-border text-xs text-foreground leading-relaxed">
                  {selectedProject.description}
                </div>
              )}

              {/* Progress & Stats */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-surface border border-border space-y-1">
                  <span className="text-muted-foreground block text-[11px]">Budget Consumed</span>
                  <div className="text-base font-semibold font-mono">{selectedProject.budget}%</div>
                  <div className="w-full h-1.5 rounded-full bg-border overflow-hidden mt-1">
                    <div
                      className={`h-full rounded-full bg-status-${selectedProject.healthTone}`}
                      style={{ width: `${Math.min(selectedProject.budget, 100)}%` }}
                    />
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-surface border border-border space-y-1">
                  <span className="text-muted-foreground block text-[11px]">Deadline Target</span>
                  <div className="text-base font-semibold font-mono">{selectedProject.due}</div>
                  <span className="text-[11px] text-muted-foreground">On schedule</span>
                </div>
              </div>

              {/* Stage Transition Selector */}
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1.5">
                  Move Stage
                </label>
                <div className="grid grid-cols-2 gap-1.5">
                  {(
                    [
                      "Pod Allocation",
                      "In Progress",
                      "Client Review",
                      "Approval",
                      "Archived",
                    ] as const
                  ).map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => handleUpdateStage(selectedProject.id, st)}
                      className={`h-8 px-2.5 rounded-lg text-xs font-medium text-left transition-colors cursor-pointer flex items-center justify-between ${
                        selectedProject.stage === st
                          ? "bg-foreground text-background font-semibold"
                          : "bg-surface text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <span>{st}</span>
                      {selectedProject.stage === st && <CheckCircle2 className="w-3.5 h-3.5" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="flex items-center justify-between pt-3 border-t border-border">
                <button
                  type="button"
                  onClick={() => handleDeleteProject(selectedProject.id, selectedProject.name)}
                  className="text-xs text-rose-600 hover:text-rose-700 flex items-center gap-1.5 cursor-pointer font-medium"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete Project</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      navigate({ to: "/tasks" });
                      setSelectedProject(null);
                    }}
                    className="h-9 px-3.5 rounded-xl bg-surface hover:bg-muted text-xs font-medium text-foreground flex items-center gap-1.5 cursor-pointer transition-colors"
                  >
                    <span>View Tasks</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedProject(null)}
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
