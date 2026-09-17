import { createFileRoute } from "@tanstack/react-router";
import { AppShell, Card, StatusPill } from "@/components/app-shell";
import {
  Check,
  X,
  MessageSquare,
  Search,
  Clock,
  AlertCircle,
  FileText,
  Image as ImageIcon,
  Video,
  Layers,
  Eye,
  CheckCircle2,
  Filter,
  ExternalLink,
  ChevronRight,
  Sparkles,
  Download,
} from "lucide-react";
import { useState, useMemo } from "react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "motion/react";

export const Route = createFileRoute("/approvals")({
  component: ApprovalsPage,
});

interface ApprovalItem {
  id: string;
  title: string;
  project: string;
  client: string;
  category: "Print" | "Brand" | "Web" | "Motion" | "Copy" | "UI/UX";
  assetType: "PDF" | "Figma" | "MP4" | "Docs" | "PNG";
  fileSize: string;
  version: string;
  requested: {
    name: string;
    avatar?: string;
    role: string;
  };
  when: string;
  dueDate: string;
  tone: "red" | "yellow" | "blue" | "purple" | "green";
  status: "Overdue" | "Waiting" | "Client review" | "Approved" | "Changes requested";
  previewImage: string;
  commentCount: number;
  description: string;
}

const INITIAL_QUEUE: ApprovalItem[] = [
  {
    id: "appr_1",
    title: "Print campaign editorial layout",
    project: "Meridian Luxury",
    client: "Meridian Corp",
    category: "Print",
    assetType: "PDF",
    fileSize: "18.4 MB",
    version: "v3.2",
    requested: {
      name: "Marta Lopez",
      role: "Lead Typographer",
      avatar:
        "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150",
    },
    when: "2d ago",
    dueDate: "Yesterday",
    tone: "red",
    status: "Overdue",
    previewImage:
      "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=600",
    commentCount: 6,
    description:
      "Final spreads for Autumn release catalogue. Verified CMYK color profile and bleed margins.",
  },
  {
    id: "appr_2",
    title: "Podcast cover art system v2",
    project: "Loop FM",
    client: "Loop Studios",
    category: "Brand",
    assetType: "PNG",
    fileSize: "4.8 MB",
    version: "v2.0",
    requested: {
      name: "Ivan Petrov",
      role: "Brand Designer",
      avatar:
        "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150",
    },
    when: "5h ago",
    dueDate: "Today, 5:00 PM",
    tone: "yellow",
    status: "Waiting",
    previewImage:
      "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=600",
    commentCount: 3,
    description:
      "Updated 3000x3000px high-contrast cover art for Spotify and Apple Podcasts launch.",
  },
  {
    id: "appr_3",
    title: "Website hero 3D direction",
    project: "Northwind Energy",
    client: "Northwind HQ",
    category: "Web",
    assetType: "Figma",
    fileSize: "Live File",
    version: "v4.1",
    requested: {
      name: "Sara Davies",
      role: "UI Architect",
      avatar:
        "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=150",
    },
    when: "1d ago",
    dueDate: "Sep 18",
    tone: "blue",
    status: "Client review",
    previewImage:
      "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=600",
    commentCount: 8,
    description:
      "Interactive Spline 3D canvas viewport integration with responsive lighting states.",
  },
  {
    id: "appr_4",
    title: "Kite Motors motion boards",
    project: "Kite Motors",
    client: "Kite Group",
    category: "Motion",
    assetType: "MP4",
    fileSize: "42.0 MB",
    version: "v2.4",
    requested: {
      name: "Luca Ferri",
      role: "Motion Animator",
      avatar:
        "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&q=80&w=150",
    },
    when: "3h ago",
    dueDate: "Tomorrow",
    tone: "purple",
    status: "Waiting",
    previewImage:
      "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&q=80&w=600",
    commentCount: 4,
    description:
      "60fps kinetic transition passes between product spec slides and telemetry graphs.",
  },
  {
    id: "appr_5",
    title: "Landing page micro-copy package",
    project: "Helix Health",
    client: "Helix Biotech",
    category: "Copy",
    assetType: "Docs",
    fileSize: "14 KB",
    version: "v1.8",
    requested: {
      name: "Nora Kim",
      role: "UX Writer",
      avatar:
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150",
    },
    when: "6h ago",
    dueDate: "Today, 6:30 PM",
    tone: "green",
    status: "Waiting",
    previewImage:
      "https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&q=80&w=600",
    commentCount: 2,
    description: "Revised onboarding prompts, tooltip explanations, and HIPPA consent dialogues.",
  },
  {
    id: "appr_6",
    title: "Design token semantic colors",
    project: "Looped Core",
    client: "Internal Team",
    category: "UI/UX",
    assetType: "Figma",
    fileSize: "Token Tree",
    version: "v2.0",
    requested: {
      name: "David Chen",
      role: "Design Systems",
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150",
    },
    when: "1h ago",
    dueDate: "Sep 19",
    tone: "purple",
    status: "Waiting",
    previewImage:
      "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&q=80&w=600",
    commentCount: 5,
    description: "Expanded WCAG AA compliant surface neutrals and high-contrast dark mode ramps.",
  },
];

const CATEGORY_ICONS: Record<string, any> = {
  Print: FileText,
  Brand: Sparkles,
  Web: Layers,
  Motion: Video,
  Copy: FileText,
  "UI/UX": ImageIcon,
};

function ApprovalsPage() {
  const [items, setItems] = useState<ApprovalItem[]>(INITIAL_QUEUE);
  const [activeFilter, setActiveFilter] = useState<
    "All" | "Pending" | "Overdue" | "Client review" | "Approved" | "Changes requested"
  >("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPreview, setSelectedPreview] = useState<ApprovalItem | null>(null);

  // Stats calculation
  const stats = useMemo(() => {
    const total = items.length;
    const overdue = items.filter((i) => i.status === "Overdue").length;
    const clientReview = items.filter((i) => i.status === "Client review").length;
    const waiting = items.filter((i) => i.status === "Waiting").length;
    const approved = items.filter((i) => i.status === "Approved").length;
    return { total, overdue, clientReview, waiting, approved };
  }, [items]);

  // Filtered list
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      // Filter tab
      if (activeFilter === "Pending" && item.status !== "Waiting" && item.status !== "Overdue")
        return false;
      if (activeFilter === "Overdue" && item.status !== "Overdue") return false;
      if (activeFilter === "Client review" && item.status !== "Client review") return false;
      if (activeFilter === "Approved" && item.status !== "Approved") return false;
      if (activeFilter === "Changes requested" && item.status !== "Changes requested") return false;

      // Search
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = item.title.toLowerCase().includes(query);
        const matchesProject = item.project.toLowerCase().includes(query);
        const matchesRequester = item.requested.name.toLowerCase().includes(query);
        const matchesCategory = item.category.toLowerCase().includes(query);
        if (!matchesTitle && !matchesProject && !matchesRequester && !matchesCategory) {
          return false;
        }
      }
      return true;
    });
  }, [items, activeFilter, searchQuery]);

  const handleApprove = (id: string, title: string) => {
    setItems((prev) =>
      prev.map((i) =>
        i.id === id ? { ...i, status: "Approved" as const, tone: "green" as const } : i,
      ),
    );
    toast.success(`"${title}" approved successfully!`);
    if (selectedPreview?.id === id) {
      setSelectedPreview(null);
    }
  };

  const handleReject = (id: string, title: string) => {
    setItems((prev) =>
      prev.map((i) =>
        i.id === id ? { ...i, status: "Changes requested" as const, tone: "red" as const } : i,
      ),
    );
    toast.info(`Changes requested for "${title}"`);
    if (selectedPreview?.id === id) {
      setSelectedPreview(null);
    }
  };

  return (
    <AppShell breadcrumb={["Workspace", "Approvals"]}>
      <div className="w-full max-w-[1400px] mx-auto space-y-6 pb-14">
        {/* Page Top Header with Title, Stats Summary Chips, and Search */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-2">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                Approvals
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-foreground text-background">
                {stats.waiting + stats.overdue} pending
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-2 mt-2 text-xs text-muted-foreground font-medium">
              <span>{stats.total} total deliverables</span>
              <span>•</span>
              <span className="text-rose-600 dark:text-rose-400 font-semibold">
                {stats.overdue} overdue
              </span>
              <span>•</span>
              <span className="text-amber-600 dark:text-amber-400 font-semibold">
                {stats.clientReview} with client
              </span>
              <span>•</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                {stats.approved} approved
              </span>
            </div>
          </div>

          {/* Quick Search & Filter Toolbar */}
          <div className="flex items-center gap-3">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search approvals..."
                className="w-full h-9 pl-9 pr-4 rounded-xl border border-[#E7E7EC] dark:border-[#323238] bg-white dark:bg-[#242428] text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-foreground transition-all shadow-xs"
              />
            </div>
          </div>
        </div>

        {/* Filter Tabs Bar: All | Pending | Overdue | Client Review | Approved | Changes Requested */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar border-b border-[#E7E7EC] dark:border-[#323238]">
          {(
            [
              { key: "All", label: "All items", count: stats.total },
              { key: "Pending", label: "Needs action", count: stats.waiting + stats.overdue },
              { key: "Overdue", label: "Overdue", count: stats.overdue, highlight: true },
              { key: "Client review", label: "With client", count: stats.clientReview },
              { key: "Approved", label: "Approved", count: stats.approved },
              { key: "Changes requested", label: "Changes requested" },
            ] as const
          ).map((tab) => {
            const isActive = activeFilter === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveFilter(tab.key)}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-2 cursor-pointer ${
                  isActive
                    ? "bg-[#111111] dark:bg-white text-white dark:text-[#111111] shadow-xs"
                    : "text-muted-foreground hover:text-foreground hover:bg-[#F4F4F7] dark:hover:bg-[#2c2c32]"
                }`}
              >
                <span>{tab.label}</span>
                {tab.count !== undefined && (
                  <span
                    className={`px-1.5 py-0.2 rounded-md text-[10px] font-bold ${
                      isActive
                        ? "bg-white/20 dark:bg-black/20 text-white dark:text-black"
                        : tab.highlight && tab.count > 0
                          ? "bg-rose-100 text-rose-700 dark:bg-rose-950/50 dark:text-rose-400"
                          : "bg-[#F4F4F7] dark:bg-[#242428] text-muted-foreground"
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Compact, Structured Cards Grid (Optimized small card layout with crisp hierarchy) */}
        {filteredItems.length === 0 ? (
          <div className="py-16 text-center rounded-3xl border border-dashed border-[#E7E7EC] dark:border-[#323238] bg-white/50 dark:bg-[#242428]/50">
            <CheckCircle2 className="w-10 h-10 text-muted-foreground/50 mx-auto mb-3" />
            <h3 className="text-sm font-bold text-foreground">No approvals found</h3>
            <p className="text-xs text-muted-foreground mt-1">
              There are no deliverables matching this filter criterion.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredItems.map((q) => {
              const CategoryIcon = CATEGORY_ICONS[q.category] || FileText;

              return (
                <div
                  key={q.id}
                  className="group rounded-2xl border border-[#E7E7EC] dark:border-[#323238] bg-white dark:bg-[#242428] p-4 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between"
                >
                  {/* Card Header: Project Label, Category Chip, & Status Pill */}
                  <div>
                    <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-[#E7E7EC]/60 dark:border-[#323238]/60">
                      <div className="flex items-center gap-1.5 truncate">
                        <span className="w-1.5 h-1.5 rounded-full bg-foreground shrink-0" />
                        <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider truncate">
                          {q.project}
                        </span>
                      </div>
                      <StatusPill tone={q.tone}>{q.status}</StatusPill>
                    </div>

                    {/* Deliverable Title & Version Details */}
                    <div className="mt-3 flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <h3
                          onClick={() => setSelectedPreview(q)}
                          className="text-[14px] font-bold text-foreground tracking-tight line-clamp-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors cursor-pointer"
                          title={q.title}
                        >
                          {q.title}
                        </h3>
                        <div className="flex items-center gap-2 mt-1 text-[11px] text-muted-foreground">
                          <span className="inline-flex items-center gap-1 font-medium text-foreground">
                            <CategoryIcon className="w-3 h-3 text-muted-foreground" />
                            {q.category}
                          </span>
                          <span>•</span>
                          <span className="px-1.5 py-0.2 rounded bg-[#F4F4F7] dark:bg-[#1a1a1c] border border-[#E7E7EC] dark:border-[#323238] font-mono text-[10px] font-semibold">
                            {q.version}
                          </span>
                          <span>•</span>
                          <span>{q.assetType}</span>
                        </div>
                      </div>
                    </div>

                    {/* Deliverable Small Preview Image with Hover Inspect Badge */}
                    <div
                      onClick={() => setSelectedPreview(q)}
                      className="mt-3 h-28 w-full rounded-xl overflow-hidden relative border border-[#E7E7EC] dark:border-[#323238] bg-[#F4F4F7] dark:bg-[#1a1a1c] cursor-pointer group/img"
                    >
                      <img
                        src={q.previewImage}
                        alt={q.title}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover/img:scale-105"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-black/30 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center gap-2 backdrop-blur-[1px]">
                        <span className="px-2.5 py-1 rounded-lg bg-white/90 dark:bg-black/90 text-[11px] font-semibold text-foreground flex items-center gap-1 shadow-sm">
                          <Eye className="w-3.5 h-3.5" />
                          Inspect
                        </span>
                      </div>
                      <div className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded bg-black/60 text-[10px] font-semibold text-white backdrop-blur-xs">
                        {q.fileSize}
                      </div>
                    </div>

                    {/* Requester Profile & Due Date Metadata */}
                    <div className="mt-3 flex items-center justify-between text-[11px] text-muted-foreground">
                      <div className="flex items-center gap-2 truncate">
                        {q.requested.avatar ? (
                          <img
                            src={q.requested.avatar}
                            alt={q.requested.name}
                            className="w-5 h-5 rounded-full object-cover shrink-0"
                          />
                        ) : (
                          <div className="w-5 h-5 rounded-full bg-foreground text-background grid place-items-center text-[9px] font-bold shrink-0">
                            {q.requested.name[0]}
                          </div>
                        )}
                        <span className="truncate">
                          <strong className="text-foreground font-semibold">
                            {q.requested.name}
                          </strong>{" "}
                          • {q.when}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 shrink-0 font-medium">
                        <Clock className="w-3 h-3 text-muted-foreground" />
                        <span
                          className={
                            q.status === "Overdue"
                              ? "text-rose-600 dark:text-rose-400 font-bold"
                              : ""
                          }
                        >
                          {q.dueDate}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Card Footer: Comments Counter & Action Buttons */}
                  <div className="mt-4 pt-3 border-t border-[#E7E7EC]/60 dark:border-[#323238]/60 flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedPreview(q)}
                      className="h-8 px-2.5 rounded-lg border border-[#E7E7EC] dark:border-[#323238] bg-[#F4F4F7] dark:bg-[#1a1a1c] hover:bg-[#EAEAEF] text-muted-foreground hover:text-foreground text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                      title="View comments"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>{q.commentCount}</span>
                    </button>

                    <div className="flex items-center gap-1.5">
                      {q.status === "Approved" ? (
                        <div className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold border border-emerald-500/20">
                          <Check className="w-3.5 h-3.5" strokeWidth={2.5} />
                          Approved
                        </div>
                      ) : q.status === "Changes requested" ? (
                        <div className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 text-xs font-bold border border-rose-500/20">
                          <X className="w-3.5 h-3.5" strokeWidth={2.5} />
                          Changes Needed
                        </div>
                      ) : (
                        <>
                          <button
                            type="button"
                            onClick={() => handleReject(q.id, q.title)}
                            className="h-8 px-3 rounded-xl border border-rose-200 bg-rose-50/80 text-rose-700 hover:bg-rose-100 dark:border-rose-900/30 dark:bg-rose-950/30 dark:text-rose-400 dark:hover:bg-rose-900/40 text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer active:scale-95"
                          >
                            <X className="w-3.5 h-3.5" strokeWidth={2.5} />
                            <span>Reject</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleApprove(q.id, q.title)}
                            className="h-8 px-3.5 rounded-xl bg-foreground text-background text-xs font-semibold flex items-center gap-1.5 hover:opacity-90 transition-all cursor-pointer active:scale-95 shadow-xs"
                          >
                            <Check className="w-3.5 h-3.5" strokeWidth={2.5} />
                            <span>Approve</span>
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Detailed Deliverable Inspection Modal */}
        <AnimatePresence>
          {selectedPreview && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
              <motion.div
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.15 }}
                className="w-full max-w-2xl bg-white dark:bg-[#242428] rounded-3xl border border-[#E7E7EC] dark:border-[#323238] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
              >
                {/* Modal Header */}
                <div className="p-5 border-b border-[#E7E7EC] dark:border-[#323238] flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-foreground text-background grid place-items-center text-xs font-bold">
                      {selectedPreview.category[0]}
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-foreground">
                        {selectedPreview.title}
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        {selectedPreview.project} • {selectedPreview.client} •{" "}
                        <span className="font-mono font-semibold">{selectedPreview.version}</span>
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedPreview(null)}
                    className="w-8 h-8 rounded-xl border border-[#E7E7EC] dark:border-[#323238] grid place-items-center text-muted-foreground hover:text-foreground cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Modal Body */}
                <div className="p-6 overflow-y-auto space-y-4">
                  <div className="rounded-2xl overflow-hidden border border-[#E7E7EC] dark:border-[#323238] bg-[#F4F4F7] dark:bg-[#1a1a1c] max-h-72">
                    <img
                      src={selectedPreview.previewImage}
                      alt={selectedPreview.title}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>

                  <div className="p-4 rounded-2xl bg-[#F4F4F7] dark:bg-[#1a1a1c] border border-[#E7E7EC] dark:border-[#323238] space-y-2">
                    <div className="text-xs font-bold text-foreground flex items-center justify-between">
                      <span>Requester Deliverable Note</span>
                      <span className="text-[11px] text-muted-foreground font-normal">
                        by {selectedPreview.requested.name} ({selectedPreview.requested.role})
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {selectedPreview.description}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                    <div className="p-3 rounded-xl border border-[#E7E7EC] dark:border-[#323238]">
                      <div className="text-[10px] text-muted-foreground uppercase font-semibold">
                        Format
                      </div>
                      <div className="font-bold text-foreground mt-0.5">
                        {selectedPreview.assetType}
                      </div>
                    </div>
                    <div className="p-3 rounded-xl border border-[#E7E7EC] dark:border-[#323238]">
                      <div className="text-[10px] text-muted-foreground uppercase font-semibold">
                        File Size
                      </div>
                      <div className="font-bold text-foreground mt-0.5">
                        {selectedPreview.fileSize}
                      </div>
                    </div>
                    <div className="p-3 rounded-xl border border-[#E7E7EC] dark:border-[#323238]">
                      <div className="text-[10px] text-muted-foreground uppercase font-semibold">
                        Due Date
                      </div>
                      <div className="font-bold text-foreground mt-0.5">
                        {selectedPreview.dueDate}
                      </div>
                    </div>
                    <div className="p-3 rounded-xl border border-[#E7E7EC] dark:border-[#323238]">
                      <div className="text-[10px] text-muted-foreground uppercase font-semibold">
                        Discussions
                      </div>
                      <div className="font-bold text-foreground mt-0.5">
                        {selectedPreview.commentCount} notes
                      </div>
                    </div>
                  </div>
                </div>

                {/* Modal Footer Actions */}
                <div className="p-5 border-t border-[#E7E7EC] dark:border-[#323238] flex items-center justify-between bg-[#F4F4F7]/50 dark:bg-[#1a1a1c]/50">
                  <div className="text-xs text-muted-foreground font-medium">
                    Status: <strong className="text-foreground">{selectedPreview.status}</strong>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleReject(selectedPreview.id, selectedPreview.title)}
                      className="h-9 px-4 rounded-xl border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                      <span>Request Changes</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleApprove(selectedPreview.id, selectedPreview.title)}
                      className="h-9 px-4 rounded-xl bg-foreground text-background text-xs font-semibold flex items-center gap-1.5 hover:opacity-90 cursor-pointer"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Approve Deliverable</span>
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </AppShell>
  );
}
export default ApprovalsPage;
