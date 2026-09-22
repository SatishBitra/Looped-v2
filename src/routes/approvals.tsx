import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Check,
  X,
  MessageSquare,
  Search,
  Clock,
  AlertCircle,
  FileText,
  Video,
  Layers,
  CheckCircle2,
  ExternalLink,
  ChevronRight,
  Sparkles,
  Download,
  RefreshCw,
  Send,
  Link as LinkIcon,
  User,
  Tag,
  ThumbsUp,
  FileCode,
  FileSpreadsheet,
} from "lucide-react";
import { useState, useMemo, useEffect } from "react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "motion/react";

export const Route = createFileRoute("/approvals")({
  component: ApprovalsPage,
});

export interface ApprovalFeedback {
  id: string;
  author: string;
  avatar?: string;
  role: string;
  category: "Revision Required" | "Visual Polish" | "Copy & Specs" | "Approval Note" | "Question";
  recommendation: "Needs Changes" | "Approved with Comments" | "General Note";
  content: string;
  timestamp: string;
  tags?: string[];
  referenceLink?: string;
}

export interface ApprovalItem {
  id: string;
  title: string;
  project: string;
  client: string;
  category: "Print" | "Brand" | "Web" | "Motion" | "Copy" | "UI/UX";
  assetType: "PDF" | "Figma" | "MP4" | "Docs" | "PNG";
  fileName: string;
  fileSize: string;
  fileUrl: string;
  secondaryLink?: { name: string; url: string; type: string };
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
  commentCount: number;
  description: string;
  feedbacks: ApprovalFeedback[];
}

const INITIAL_QUEUE: ApprovalItem[] = [
  {
    id: "appr_1",
    title: "Print campaign editorial layout",
    project: "Meridian Luxury",
    client: "Meridian Corp",
    category: "Print",
    assetType: "PDF",
    fileName: "meridian_autumn_editorial_spreads_v3.2.pdf",
    fileSize: "18.4 MB",
    fileUrl: "https://assets.looped.internal/meridian-editorial-v3.2.pdf",
    secondaryLink: {
      name: "CMYK_Color_Profile_Spec_Sheet.pdf",
      url: "#",
      type: "PDF",
    },
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
    commentCount: 6,
    description:
      "Final spreads for Autumn release catalogue. Verified CMYK color profile, 3mm bleed margins, and spot UV varnishes.",
    feedbacks: [
      {
        id: "fb-1",
        author: "Sandy K.",
        role: "Lead Product Designer",
        category: "Visual Polish",
        recommendation: "Approved with Comments",
        content: "Typography on page 14 needs 2pt extra line-height for optimal optical rhythm.",
        timestamp: "Yesterday, 4:15 PM",
        tags: ["Typography", "Bleed / Margins"],
      },
    ],
  },
  {
    id: "appr_2",
    title: "Podcast cover art system v2",
    project: "Loop FM",
    client: "Loop Studios",
    category: "Brand",
    assetType: "PNG",
    fileName: "loop_fm_cover_3000x3000px_master.png",
    fileSize: "4.8 MB",
    fileUrl: "https://assets.looped.internal/loop-fm-cover-v2.png",
    secondaryLink: {
      name: "Spotify_Apple_Podcast_Specs.pdf",
      url: "#",
      type: "PDF",
    },
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
    commentCount: 3,
    description:
      "Updated 3000x3000px high-contrast cover art raster for Spotify, Pocket Casts, and Apple Podcasts launch.",
    feedbacks: [],
  },
  {
    id: "appr_3",
    title: "Website hero 3D direction",
    project: "Northwind Energy",
    client: "Northwind HQ",
    category: "Web",
    assetType: "Figma",
    fileName: "northwind_hero_interactive_viewport_v4.1.fig",
    fileSize: "Figma Live File",
    fileUrl: "https://figma.com/file/northwind-hero-v4.1",
    secondaryLink: {
      name: "Spline_3D_Production_Scene.spline",
      url: "#",
      type: "3D",
    },
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
    commentCount: 8,
    description:
      "Interactive Spline 3D canvas viewport integration with responsive lighting states and fallback static vectors.",
    feedbacks: [
      {
        id: "fb-2",
        author: "Client (Northwind)",
        role: "Stakeholder Reviewer",
        category: "Approval Note",
        recommendation: "Approved with Comments",
        content:
          "Love the ambient particle illumination. Checking mobile canvas battery draw next.",
        timestamp: "Sep 17, 11:20 AM",
        tags: ["Responsive", "Performance / Specs"],
      },
    ],
  },
  {
    id: "appr_4",
    title: "Kite Motors motion boards",
    project: "Kite Motors",
    client: "Kite Group",
    category: "Motion",
    assetType: "MP4",
    fileName: "kite_motors_telemetry_cuts_60fps_v2.4.mp4",
    fileSize: "42.0 MB",
    fileUrl: "https://assets.looped.internal/kite-motors-cut-v2.4.mp4",
    secondaryLink: {
      name: "Audio_Mix_Spatial_Stem_48kHz.wav",
      url: "#",
      type: "Audio",
    },
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
    commentCount: 4,
    description:
      "60fps kinetic transition passes between product spec slides and live telemetry HUD graphs.",
    feedbacks: [],
  },
  {
    id: "appr_5",
    title: "Landing page micro-copy package",
    project: "Helix Health",
    client: "Helix Biotech",
    category: "Copy",
    assetType: "Docs",
    fileName: "helix_onboarding_microcopy_package_v1.8.docx",
    fileSize: "14 KB",
    fileUrl: "https://docs.looped.internal/helix-microcopy-v1.8.docx",
    secondaryLink: {
      name: "HIPAA_Compliance_Wording_Guide.pdf",
      url: "#",
      type: "PDF",
    },
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
    commentCount: 2,
    description:
      "Revised onboarding prompts, tooltip explanations, and HIPAA consent dialogues checked with legal team.",
    feedbacks: [],
  },
  {
    id: "appr_6",
    title: "Design token semantic colors",
    project: "Looped Core",
    client: "Internal Team",
    category: "UI/UX",
    assetType: "Figma",
    fileName: "looped_design_tokens_semantic_palette_v2.0.tokens.json",
    fileSize: "Token Tree (18 KB)",
    fileUrl: "https://figma.com/file/looped-core-tokens-v2",
    secondaryLink: {
      name: "WCAG_Contrast_Matrix_Report.pdf",
      url: "#",
      type: "PDF",
    },
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
    commentCount: 5,
    description:
      "Expanded WCAG AA compliant surface neutrals, accessible high-contrast dark mode ramps, and CSS variable exports.",
    feedbacks: [],
  },
];

const ASSET_TYPE_CONFIG: Record<
  string,
  { bg: string; text: string; border: string; icon: any; label: string }
> = {
  PDF: {
    bg: "bg-rose-50 dark:bg-rose-950/40",
    text: "text-rose-700 dark:text-rose-400",
    border: "border-rose-200 dark:border-rose-900/40",
    icon: FileText,
    label: "PDF Document",
  },
  Figma: {
    bg: "bg-purple-50 dark:bg-purple-950/40",
    text: "text-purple-700 dark:text-purple-400",
    border: "border-purple-200 dark:border-purple-900/40",
    icon: Layers,
    label: "Figma File",
  },
  MP4: {
    bg: "bg-amber-50 dark:bg-amber-950/40",
    text: "text-amber-700 dark:text-amber-400",
    border: "border-amber-200 dark:border-amber-900/40",
    icon: Video,
    label: "Video Asset",
  },
  Docs: {
    bg: "bg-blue-50 dark:bg-blue-950/40",
    text: "text-blue-700 dark:text-blue-400",
    border: "border-blue-200 dark:border-blue-900/40",
    icon: FileCode,
    label: "Copy Document",
  },
  PNG: {
    bg: "bg-emerald-50 dark:bg-emerald-950/40",
    text: "text-emerald-700 dark:text-emerald-400",
    border: "border-emerald-200 dark:border-emerald-900/40",
    icon: FileSpreadsheet,
    label: "Raster Asset",
  },
};

const CATEGORY_ICONS: Record<string, any> = {
  Print: FileText,
  Brand: Sparkles,
  Web: Layers,
  Motion: Video,
  Copy: FileText,
  "UI/UX": Layers,
};

function ApprovalsPage() {
  const [items, setItems] = useState<ApprovalItem[]>(INITIAL_QUEUE);
  const [isLoading, setIsLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<
    "All" | "Pending" | "Overdue" | "Client review" | "Approved" | "Changes requested"
  >("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPreview, setSelectedPreview] = useState<ApprovalItem | null>(null);

  // Feedback Popup State
  const [feedbackTarget, setFeedbackTarget] = useState<ApprovalItem | null>(null);
  const [feedbackCategory, setFeedbackCategory] =
    useState<ApprovalFeedback["category"]>("Revision Required");
  const [feedbackRecommendation, setFeedbackRecommendation] =
    useState<ApprovalFeedback["recommendation"]>("Needs Changes");
  const [feedbackContent, setFeedbackContent] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [referenceUrl, setReferenceUrl] = useState("");

  // Simulate initial data fetching skeleton
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 600);
    return () => clearTimeout(timer);
  }, []);

  // Global escape key listener to dismiss open inspection or feedback modals
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setFeedbackTarget(null);
        setSelectedPreview(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Refresh handler to demonstrate skeleton loading states
  const handleRefresh = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      toast.success("Approvals queue updated");
    }, 650);
  };

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
        const matchesFile = item.fileName.toLowerCase().includes(query);
        if (
          !matchesTitle &&
          !matchesProject &&
          !matchesRequester &&
          !matchesCategory &&
          !matchesFile
        ) {
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

  // Open feedback modal prepped for specific deliverable
  const handleOpenFeedback = (item: ApprovalItem) => {
    setFeedbackTarget(item);
    setFeedbackContent("");
    setFeedbackCategory("Revision Required");
    setFeedbackRecommendation("Needs Changes");
    setSelectedTags([]);
    setReferenceUrl("");
  };

  // Submit feedback popup
  const handleSubmitFeedback = (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedbackTarget) return;

    if (!feedbackContent.trim()) {
      toast.error("Please enter your feedback comments before submitting.");
      return;
    }

    const newFeedback: ApprovalFeedback = {
      id: `fb-${Date.now()}`,
      author: "Sandy K.",
      role: "Lead Product Designer",
      category: feedbackCategory,
      recommendation: feedbackRecommendation,
      content: feedbackContent.trim(),
      timestamp: "Just now",
      tags: selectedTags.length > 0 ? selectedTags : undefined,
      referenceLink: referenceUrl.trim() || undefined,
    };

    setItems((prev) =>
      prev.map((item) => {
        if (item.id === feedbackTarget.id) {
          let updatedStatus = item.status;
          let updatedTone = item.tone;

          if (feedbackRecommendation === "Needs Changes") {
            updatedStatus = "Changes requested";
            updatedTone = "red";
          } else if (feedbackRecommendation === "Approved with Comments") {
            updatedStatus = "Approved";
            updatedTone = "green";
          }

          return {
            ...item,
            status: updatedStatus,
            tone: updatedTone,
            commentCount: item.commentCount + 1,
            feedbacks: [newFeedback, ...item.feedbacks],
          };
        }
        return item;
      }),
    );

    // Also update current inspection view if open
    if (selectedPreview && selectedPreview.id === feedbackTarget.id) {
      setSelectedPreview((prev) =>
        prev
          ? {
              ...prev,
              commentCount: prev.commentCount + 1,
              feedbacks: [newFeedback, ...prev.feedbacks],
            }
          : null,
      );
    }

    toast.success(`Feedback submitted for "${feedbackTarget.title}"`);
    setFeedbackTarget(null);
  };

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    );
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

          {/* Quick Search, Filter & Refresh Toolbar */}
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search files, deliverables..."
                className="w-full h-9 pl-9 pr-4 rounded-xl border border-[#E7E7EC] dark:border-[#323238] bg-white dark:bg-[#242428] text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-foreground transition-all shadow-xs"
              />
            </div>

            <button
              type="button"
              onClick={handleRefresh}
              className="h-9 px-3 rounded-xl border border-[#E7E7EC] dark:border-[#323238] bg-white dark:bg-[#242428] hover:bg-[#F4F4F7] dark:hover:bg-[#2c2c32] text-xs font-semibold text-muted-foreground hover:text-foreground flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
              title="Refresh queue with skeleton loading"
            >
              <RefreshCw
                className={`w-3.5 h-3.5 ${isLoading ? "animate-spin text-foreground" : ""}`}
              />
              <span className="hidden sm:inline">Refresh</span>
            </button>
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

        {/* SKELETON LOADING STATE (Feature function before/during data fetching) */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 6 }).map((_, idx) => (
              <div
                key={`skel-${idx}`}
                className="p-5 rounded-3xl border border-[#E7E7EC] dark:border-[#323238] bg-white dark:bg-[#242428] shadow-xs flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  {/* Top metadata skeleton */}
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-4 w-28 rounded-md" />
                    <Skeleton className="h-5 w-20 rounded-full" />
                  </div>
                  {/* Title skeleton */}
                  <Skeleton className="h-5 w-3/4 rounded-md" />

                  {/* File card skeleton */}
                  <div className="p-3.5 rounded-2xl border border-[#E7E7EC] dark:border-[#323238] bg-[#F8F8FA] dark:bg-[#1E1E22] space-y-2">
                    <div className="flex items-center gap-3">
                      <Skeleton className="w-9 h-9 rounded-xl shrink-0" />
                      <div className="space-y-1.5 flex-1">
                        <Skeleton className="h-3.5 w-4/5 rounded-md" />
                        <Skeleton className="h-3 w-1/2 rounded-md" />
                      </div>
                    </div>
                  </div>

                  {/* Requester skeleton */}
                  <div className="flex items-center justify-between pt-1">
                    <div className="flex items-center gap-2">
                      <Skeleton className="w-5 h-5 rounded-full" />
                      <Skeleton className="h-3 w-28 rounded-md" />
                    </div>
                    <Skeleton className="h-3 w-16 rounded-md" />
                  </div>
                </div>

                {/* Footer buttons skeleton */}
                <div className="pt-3 border-t border-[#E7E7EC]/60 dark:border-[#323238]/60 flex items-center justify-between">
                  <Skeleton className="h-8 w-24 rounded-xl" />
                  <div className="flex gap-2">
                    <Skeleton className="h-8 w-16 rounded-xl" />
                    <Skeleton className="h-8 w-20 rounded-xl" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredItems.length === 0 ? (
          /* Empty Search or Filter State */
          <div className="py-20 text-center flex flex-col items-center justify-center p-8 rounded-3xl border border-dashed border-[#E7E7EC] dark:border-[#323238] bg-white/40 dark:bg-[#242428]/40">
            <CheckCircle2 className="w-12 h-12 text-muted-foreground/40 mb-3" />
            <h3 className="text-base font-bold text-foreground">No approvals found</h3>
            <p className="text-xs text-muted-foreground mt-1 max-w-sm">
              {searchQuery
                ? `No items match "${searchQuery}". Try searching by another file name or keyword.`
                : "You're all caught up with this queue filter."}
            </p>
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="mt-4 px-4 py-2 rounded-xl bg-foreground text-background text-xs font-semibold hover:opacity-90 transition-opacity cursor-pointer"
              >
                Clear search query
              </button>
            )}
          </div>
        ) : (
          /* Real Deliverable Approvals Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredItems.map((q) => {
              const CatIcon = CATEGORY_ICONS[q.category] || Layers;
              const assetConfig = ASSET_TYPE_CONFIG[q.assetType] || ASSET_TYPE_CONFIG.PDF;
              const AssetIcon = assetConfig.icon;

              return (
                <div
                  key={q.id}
                  className="p-5 rounded-3xl border border-[#E7E7EC] dark:border-[#323238] bg-white dark:bg-[#242428] shadow-xs hover:border-foreground/20 hover:shadow-md transition-all flex flex-col justify-between group text-left"
                >
                  <div>
                    {/* Deliverable Header Row: Project Name & Status Badge */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 truncate">
                        <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider truncate">
                          {q.project}
                        </span>
                        <span className="text-xs text-muted-foreground">•</span>
                        <span className="text-[11px] font-semibold text-foreground/70">
                          {q.client}
                        </span>
                      </div>

                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-tight whitespace-nowrap shrink-0 ${
                          q.status === "Overdue"
                            ? "bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400"
                            : q.status === "Client review"
                              ? "bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-400"
                              : q.status === "Approved"
                                ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400"
                                : q.status === "Changes requested"
                                  ? "bg-orange-100 text-orange-700 dark:bg-orange-950/60 dark:text-orange-400"
                                  : "bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400"
                        }`}
                      >
                        {q.status}
                      </span>
                    </div>

                    {/* Deliverable Title & Category Tag */}
                    <div className="mt-2.5">
                      <h3
                        onClick={() => setSelectedPreview(q)}
                        className="text-base font-bold text-foreground hover:underline cursor-pointer line-clamp-1"
                        title={q.title}
                      >
                        {q.title}
                      </h3>
                      <div className="flex items-center gap-2 mt-1 text-[11px] text-muted-foreground font-medium">
                        <span className="flex items-center gap-1">
                          <CatIcon className="w-3 h-3 text-muted-foreground" />
                          {q.category}
                        </span>
                        <span>•</span>
                        <span className="font-mono">{q.version}</span>
                      </div>
                    </div>

                    {/* DELIVERABLE FILE & LINK ATTACHMENT CARD (NO IMAGE SHOWN) */}
                    <div className="mt-3.5 p-3.5 rounded-2xl border border-[#E7E7EC] dark:border-[#323238] bg-[#F8F8FA] dark:bg-[#1C1C20] flex flex-col gap-2.5 transition-all hover:border-foreground/30">
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <div
                            className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border font-bold text-xs ${assetConfig.bg} ${assetConfig.text} ${assetConfig.border}`}
                          >
                            <AssetIcon className="w-4 h-4" />
                          </div>
                          <div className="min-w-0">
                            <button
                              type="button"
                              onClick={() => setSelectedPreview(q)}
                              className="text-xs font-bold text-foreground hover:underline truncate block text-left cursor-pointer"
                              title={q.fileName}
                            >
                              {q.fileName}
                            </button>
                            <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground mt-0.5">
                              <span className="font-semibold text-foreground/80">{q.fileSize}</span>
                              <span>•</span>
                              <span>{assetConfig.label}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Secondary Reference Link / Deliverable Actions replacing Open Link text */}
                      <div className="pt-2 border-t border-[#E7E7EC]/70 dark:border-[#323238]/70 flex items-center justify-between text-[11px]">
                        <div className="flex items-center gap-1.5 text-muted-foreground truncate min-w-0">
                          <LinkIcon className="w-3 h-3 text-blue-500 shrink-0" />
                          <span className="truncate">{q.secondaryLink?.name || q.fileName}</span>
                        </div>
                        <div className="flex items-center gap-1 shrink-0 ml-2">
                          <button
                            type="button"
                            onClick={() => setSelectedPreview(q)}
                            className="p-1.5 rounded-lg border border-[#E7E7EC] dark:border-[#323238] bg-white dark:bg-[#242428] text-muted-foreground hover:text-foreground hover:border-[#A8A8A8] transition-colors cursor-pointer"
                            title="Inspect Deliverable & Notes"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => toast.success(`Downloading ${q.fileName}...`)}
                            className="p-1.5 rounded-lg border border-[#E7E7EC] dark:border-[#323238] bg-white dark:bg-[#242428] text-muted-foreground hover:text-foreground hover:border-[#A8A8A8] transition-colors cursor-pointer"
                            title="Download File"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </button>
                        </div>
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

                  {/* Card Footer: Feedback Popup Trigger, Notes Counter & Decision Actions */}
                  <div className="mt-4 pt-3 border-t border-[#E7E7EC]/60 dark:border-[#323238]/60 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      {/* Give Feedback button - opens feedback popup */}
                      <button
                        type="button"
                        onClick={() => handleOpenFeedback(q)}
                        className="h-8 px-2.5 rounded-xl border border-[#E7E7EC] dark:border-[#323238] bg-[#F4F4F7] dark:bg-[#1a1a1c] hover:bg-[#EAEAEF] text-foreground text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                        title="Open feedback popup to leave review comments"
                      >
                        <MessageSquare className="w-3.5 h-3.5 text-muted-foreground" />
                        <span>Feedback</span>
                        {q.feedbacks.length > 0 && (
                          <span className="ml-0.5 px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-foreground text-background">
                            {q.feedbacks.length}
                          </span>
                        )}
                      </button>
                    </div>

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
                        <button
                          type="button"
                          onClick={() => handleApprove(q.id, q.title)}
                          className="h-8 px-3.5 rounded-xl bg-foreground text-background text-xs font-semibold flex items-center gap-1.5 hover:opacity-90 transition-all cursor-pointer active:scale-95 shadow-xs"
                        >
                          <Check className="w-3.5 h-3.5" strokeWidth={2.5} />
                          <span>Approve</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ========================================================================= */}
        {/* FEEDBACK POPUP MODAL (Allows anyone to give feedback on deliverable files) */}
        {/* ========================================================================= */}
        <AnimatePresence>
          {feedbackTarget && (
            <div
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs cursor-pointer"
              onClick={() => setFeedbackTarget(null)}
            >
              <motion.div
                onClick={(e) => e.stopPropagation()}
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                transition={{ duration: 0.15 }}
                className="relative w-full max-w-lg bg-white dark:bg-[#242428] rounded-3xl border border-[#E7E7EC] dark:border-[#323238] shadow-2xl overflow-hidden cursor-default flex flex-col max-h-[90vh]"
              >
                {/* Header */}
                <div className="p-5 border-b border-[#E7E7EC] dark:border-[#323238] flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-foreground text-background grid place-items-center text-xs font-bold">
                      <MessageSquare className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-foreground">Give Review Feedback</h3>
                      <p className="text-xs text-muted-foreground truncate max-w-xs sm:max-w-sm">
                        {feedbackTarget.title} • {feedbackTarget.version}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setFeedbackTarget(null)}
                    className="w-8 h-8 rounded-xl border border-[#E7E7EC] dark:border-[#323238] grid place-items-center text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Feedback Form Body */}
                <form onSubmit={handleSubmitFeedback} className="p-6 overflow-y-auto space-y-4">
                  {/* Target Deliverable File Summary Pill */}
                  <div className="p-3.5 rounded-2xl bg-[#F8F8FA] dark:bg-[#1E1E22] border border-[#E7E7EC] dark:border-[#323238] flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <FileText className="w-4 h-4 text-muted-foreground shrink-0" />
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-foreground truncate">
                          {feedbackTarget.fileName}
                        </div>
                        <div className="text-[11px] text-muted-foreground">
                          {feedbackTarget.fileSize} • Requested by {feedbackTarget.requested.name}
                        </div>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-foreground/10 text-foreground shrink-0">
                      {feedbackTarget.assetType}
                    </span>
                  </div>

                  {/* Feedback Category Selection */}
                  <div>
                    <label className="block text-xs font-semibold text-foreground mb-1.5">
                      Feedback Type
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                      {(
                        [
                          "Revision Required",
                          "Visual Polish",
                          "Copy & Specs",
                          "Approval Note",
                          "Question",
                        ] as const
                      ).map((cat) => (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => setFeedbackCategory(cat)}
                          className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-all text-left cursor-pointer ${
                            feedbackCategory === cat
                              ? "border-foreground bg-foreground text-background shadow-xs"
                              : "border-[#E7E7EC] dark:border-[#323238] bg-[#F8F8FA] dark:bg-[#1C1C20] text-muted-foreground hover:text-foreground"
                          }`}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Review Recommendation */}
                  <div>
                    <label className="block text-xs font-semibold text-foreground mb-1.5">
                      Decision Recommendation
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {(
                        [
                          { key: "Needs Changes", tone: "text-rose-600" },
                          { key: "Approved with Comments", tone: "text-emerald-600" },
                          { key: "General Note", tone: "text-foreground" },
                        ] as const
                      ).map((rec) => (
                        <button
                          key={rec.key}
                          type="button"
                          onClick={() => setFeedbackRecommendation(rec.key)}
                          className={`p-2.5 rounded-xl text-[11px] font-semibold border text-center transition-all cursor-pointer ${
                            feedbackRecommendation === rec.key
                              ? "border-foreground bg-[#111111]/5 dark:bg-white/5 font-bold"
                              : "border-[#E7E7EC] dark:border-[#323238] text-muted-foreground hover:text-foreground"
                          }`}
                        >
                          {rec.key}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Tag Quick Toggles */}
                  <div>
                    <label className="block text-xs font-semibold text-foreground mb-1.5">
                      Focus Areas & Tags
                    </label>
                    <div className="flex flex-wrap gap-1.5">
                      {[
                        "Bleed / Margins",
                        "Typography",
                        "Color Contrast",
                        "Responsive",
                        "Resolution",
                        "Performance / Specs",
                      ].map((tag) => {
                        const isSelected = selectedTags.includes(tag);
                        return (
                          <button
                            key={tag}
                            type="button"
                            onClick={() => toggleTag(tag)}
                            className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-all cursor-pointer ${
                              isSelected
                                ? "bg-foreground text-background border-foreground"
                                : "bg-transparent border-[#E7E7EC] dark:border-[#323238] text-muted-foreground hover:text-foreground"
                            }`}
                          >
                            {isSelected ? "✓ " : "+ "}
                            {tag}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Feedback Text Input */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-semibold text-foreground">
                        Your Feedback Notes
                      </label>
                      <span className="text-[10px] text-muted-foreground">
                        {feedbackContent.length}/600 chars
                      </span>
                    </div>
                    <textarea
                      required
                      rows={4}
                      maxLength={600}
                      value={feedbackContent}
                      onChange={(e) => setFeedbackContent(e.target.value)}
                      placeholder="Specify clear revision requests, typographic guidance, or approval criteria..."
                      className="w-full p-3 rounded-2xl border border-[#E7E7EC] dark:border-[#323238] bg-white dark:bg-[#1C1C20] text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-foreground transition-all resize-none shadow-xs"
                    />
                  </div>

                  {/* Optional Reference Link */}
                  <div>
                    <label className="block text-xs font-semibold text-foreground mb-1.5">
                      Reference Link or Figma Frame (Optional)
                    </label>
                    <div className="relative">
                      <LinkIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                      <input
                        type="url"
                        value={referenceUrl}
                        onChange={(e) => setReferenceUrl(e.target.value)}
                        placeholder="https://figma.com/file/... or design spec link"
                        className="w-full h-9 pl-9 pr-3 rounded-xl border border-[#E7E7EC] dark:border-[#323238] bg-white dark:bg-[#1C1C20] text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-foreground transition-all shadow-xs"
                      />
                    </div>
                  </div>

                  {/* Submit Actions */}
                  <div className="pt-2 flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setFeedbackTarget(null)}
                      className="h-9 px-4 rounded-xl border border-[#E7E7EC] dark:border-[#323238] text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="h-9 px-4 rounded-xl bg-foreground text-background text-xs font-semibold hover:opacity-90 transition-all flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-95"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Submit Feedback</span>
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* ========================================================================= */}
        {/* DETAILED DELIVERABLE INSPECTION MODAL (NO IMAGE - FILES, SPECS & COMMENTS) */}
        {/* ========================================================================= */}
        <AnimatePresence>
          {selectedPreview && (
            <div
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs cursor-pointer"
              onClick={() => setSelectedPreview(null)}
            >
              <motion.div
                onClick={(e) => e.stopPropagation()}
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.15 }}
                className="w-full max-w-2xl bg-white dark:bg-[#242428] rounded-3xl border border-[#E7E7EC] dark:border-[#323238] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] cursor-default"
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
                    className="w-8 h-8 rounded-xl border border-[#E7E7EC] dark:border-[#323238] grid place-items-center text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Modal Body */}
                <div className="p-6 overflow-y-auto space-y-4">
                  {/* Primary File Asset Banner (No image shown) */}
                  <div className="p-4 rounded-2xl border border-[#E7E7EC] dark:border-[#323238] bg-[#F8F8FA] dark:bg-[#1E1E22] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-11 h-11 rounded-2xl bg-foreground text-background grid place-items-center shrink-0">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-sm font-bold text-foreground truncate">
                          {selectedPreview.fileName}
                        </div>
                        <div className="text-xs text-muted-foreground flex items-center gap-2 mt-0.5">
                          <span>{selectedPreview.fileSize}</span>
                          <span>•</span>
                          <span>{selectedPreview.assetType} Production Asset</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => toast.success(`Downloading ${selectedPreview.fileName}`)}
                        className="h-8 px-3 rounded-xl border border-[#E7E7EC] dark:border-[#323238] bg-white dark:bg-[#242428] text-xs font-semibold text-foreground flex items-center gap-1.5 hover:bg-[#F4F4F7] dark:hover:bg-[#2c2c32] transition-colors cursor-pointer"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Download</span>
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          toast.info(`Opening asset link: ${selectedPreview.fileName}`)
                        }
                        className="h-8 px-3 rounded-xl bg-foreground text-background text-xs font-semibold flex items-center gap-1.5 hover:opacity-90 transition-opacity cursor-pointer"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Open File</span>
                      </button>
                    </div>
                  </div>

                  {/* Requester Deliverable Note */}
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

                  {/* Specifications Grid */}
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
                        Review Notes
                      </div>
                      <div className="font-bold text-foreground mt-0.5">
                        {selectedPreview.feedbacks.length} feedbacks
                      </div>
                    </div>
                  </div>

                  {/* Past Feedback Comments Stream */}
                  <div className="space-y-2.5 pt-2">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">
                        Feedback History ({selectedPreview.feedbacks.length})
                      </h4>
                      <button
                        type="button"
                        onClick={() => {
                          handleOpenFeedback(selectedPreview);
                        }}
                        className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>Add Feedback</span>
                      </button>
                    </div>

                    {selectedPreview.feedbacks.length === 0 ? (
                      <div className="p-4 rounded-xl border border-dashed border-[#E7E7EC] dark:border-[#323238] text-center text-xs text-muted-foreground">
                        No feedback has been recorded yet. Click "Add Feedback" above to leave
                        review comments.
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {selectedPreview.feedbacks.map((fb) => (
                          <div
                            key={fb.id}
                            className="p-3.5 rounded-xl border border-[#E7E7EC] dark:border-[#323238] bg-[#F8F8FA] dark:bg-[#1E1E22] space-y-1.5"
                          >
                            <div className="flex items-center justify-between text-xs">
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-foreground">{fb.author}</span>
                                <span className="text-[10px] px-2 py-0.2 rounded-full font-semibold bg-foreground/10 text-foreground">
                                  {fb.category}
                                </span>
                              </div>
                              <span className="text-[11px] text-muted-foreground">
                                {fb.timestamp}
                              </span>
                            </div>
                            <p className="text-xs text-muted-foreground leading-relaxed">
                              {fb.content}
                            </p>
                            {fb.tags && fb.tags.length > 0 && (
                              <div className="flex flex-wrap gap-1 pt-1">
                                {fb.tags.map((t) => (
                                  <span
                                    key={t}
                                    className="text-[10px] px-2 py-0.5 rounded-md bg-muted text-muted-foreground"
                                  >
                                    #{t}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
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
                      className="h-9 px-4 rounded-xl border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100 text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />
                      <span>Request Changes</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleApprove(selectedPreview.id, selectedPreview.title)}
                      className="h-9 px-4 rounded-xl bg-foreground text-background text-xs font-semibold flex items-center gap-1.5 hover:opacity-90 cursor-pointer transition-opacity"
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
