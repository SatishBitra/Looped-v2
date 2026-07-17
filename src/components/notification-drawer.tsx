import { useState, useEffect, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  X,
  Search,
  Filter,
  CheckCircle2,
  Trash2,
  Archive,
  VolumeX,
  Volume2,
  Sliders,
  Settings2,
  PlusCircle,
  HelpCircle,
  Clock,
  Sparkles,
  RefreshCw,
  Bell,
  Check,
} from "lucide-react";
import { Notification, NotifType, notificationStore } from "@/lib/notifications-store";
import {
  NotificationCard,
  NotificationDetailDrawer,
  NotificationSettingsPanel,
  NotificationEmptyState,
  NotificationSkeleton,
  getRelativeGroup,
} from "./notification-components";
import { toast } from "sonner";
import { Link } from "@tanstack/react-router";

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NotificationDrawer({ isOpen, onClose }: NotificationDrawerProps) {
  // Sync with store
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [settings, setSettings] = useState(notificationStore.getSettings());
  const [activeTab, setActiveTab] = useState<"list" | "settings">("list");

  // Loading & error simulation states
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);

  // Filters State
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilterCategory, setSelectedFilterCategory] = useState<string>("All"); // All, Unread, Assigned, Approvals, etc.
  const [selectedFilterTime, setSelectedFilterTime] = useState<string>("All Days"); // Today, Yesterday, 7 Days, 30 Days, Custom

  // Third Row Dropdowns
  const [selectedProject, setSelectedProject] = useState<string>("All Projects");
  const [selectedPriority, setSelectedPriority] = useState<string>("All Priorities");
  const [selectedRole, setSelectedRole] = useState<string>("All Roles");

  // Expanded Detail Drawer State
  const [selectedDetailNotif, setSelectedDetailNotif] = useState<Notification | null>(null);

  // Bulk Operations State
  const [selectedNotifIds, setSelectedNotifIds] = useState<string[]>([]);
  const [isBulkToolbarActive, setIsBulkToolbarActive] = useState(false);

  // Delete Confirmation Dialog State
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  // Simulation Form Accordion
  const [isSimOpen, setIsSimOpen] = useState(false);

  // Subscribe to changes
  useEffect(() => {
    setNotifications(notificationStore.getNotifications());
    setSettings(notificationStore.getSettings());

    const unsubscribe = notificationStore.subscribe(() => {
      setNotifications([...notificationStore.getNotifications()]);
      setSettings({ ...notificationStore.getSettings() });
    });
    return unsubscribe;
  }, []);

  // Keyboard navigation: Escape closes drawer
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Dynamic filter lists
  const availableProjects = useMemo(() => {
    const projs = new Set<string>();
    notifications.forEach((n) => {
      if (n.project) projs.add(n.project);
    });
    return ["All Projects", ...Array.from(projs)];
  }, [notifications]);

  const availableRoles = ["All Roles", "Manager", "Client", "Admin", "System"];

  // Filter & Search Logic
  const filteredNotifications = useMemo(() => {
    return notifications.filter((n) => {
      if (n.status === "archived") return false;

      // 1. First Row (Categories / Status)
      if (selectedFilterCategory === "Unread" && n.status !== "unread") return false;
      if (selectedFilterCategory === "Assigned" && n.type !== "task") return false;
      if (selectedFilterCategory === "Approvals" && n.type !== "approval") return false;
      if (selectedFilterCategory === "Overdue" && n.type !== "overdue") return false;
      if (selectedFilterCategory === "Meetings" && n.type !== "meeting") return false;
      if (selectedFilterCategory === "Messages" && n.type !== "message") return false;
      if (selectedFilterCategory === "Files" && n.type !== "file") return false;
      if (selectedFilterCategory === "Client" && n.type !== "client") return false;
      if (selectedFilterCategory === "System" && n.type !== "system") return false;
      if (selectedFilterCategory === "Mentions" && !n.title.toLowerCase().includes("mentioned"))
        return false;

      // 2. Second Row (Time range)
      const now = new Date();
      const diffTime = Math.abs(now.getTime() - n.timestamp.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (selectedFilterTime === "Today") {
        if (!(diffDays <= 1 && now.getDate() === n.timestamp.getDate())) return false;
      } else if (selectedFilterTime === "Yesterday") {
        if (!(diffDays <= 2 && now.getDate() - n.timestamp.getDate() === 1)) return false;
      } else if (selectedFilterTime === "7 Days") {
        if (diffDays > 7) return false;
      } else if (selectedFilterTime === "30 Days") {
        if (diffDays > 30) return false;
      }

      // 3. Third Row (Dropdowns)
      if (selectedProject !== "All Projects" && n.project !== selectedProject) return false;
      if (selectedPriority !== "All Priorities" && n.priority !== selectedPriority) return false;
      if (selectedRole !== "All Roles") {
        const roleMatch = n.sender.role.toLowerCase() === selectedRole.toLowerCase();
        if (!roleMatch) return false;
      }

      // 4. Instant Search Query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = n.title.toLowerCase().includes(query);
        const matchesProject = n.project.toLowerCase().includes(query);
        const matchesDesc = n.description.toLowerCase().includes(query);
        const matchesSender = n.sender.name.toLowerCase().includes(query);
        if (!matchesTitle && !matchesProject && !matchesDesc && !matchesSender) return false;
      }

      return true;
    });
  }, [
    notifications,
    selectedFilterCategory,
    selectedFilterTime,
    selectedProject,
    selectedPriority,
    selectedRole,
    searchQuery,
  ]);

  // Group notifications
  const groupedNotifications = useMemo(() => {
    const groups: Record<string, Notification[]> = {
      Today: [],
      Yesterday: [],
      "This Week": [],
      Earlier: [],
    };

    filteredNotifications.forEach((n) => {
      const g = getRelativeGroup(n.timestamp);
      groups[g].push(n);
    });

    return Object.entries(groups).filter(([_, items]) => items.length > 0);
  }, [filteredNotifications]);

  // Bulk toggles
  const handleToggleSelectAll = () => {
    if (selectedNotifIds.length === filteredNotifications.length) {
      setSelectedNotifIds([]);
    } else {
      setSelectedNotifIds(filteredNotifications.map((n) => n.id));
    }
  };

  const handleToggleSelectItem = (id: string) => {
    setSelectedNotifIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
  };

  // Bulk actions triggers
  const handleBulkMarkRead = () => {
    notificationStore.bulkMarkRead(selectedNotifIds);
    setSelectedNotifIds([]);
    setIsBulkToolbarActive(false);
  };

  const handleBulkArchive = () => {
    notificationStore.bulkArchive(selectedNotifIds);
    setSelectedNotifIds([]);
    setIsBulkToolbarActive(false);
  };

  const handleBulkDelete = () => {
    notificationStore.bulkDelete(selectedNotifIds);
    setSelectedNotifIds([]);
    setIsBulkToolbarActive(false);
  };

  const handleBulkMute = () => {
    notificationStore.bulkMute(selectedNotifIds);
    setSelectedNotifIds([]);
    setIsBulkToolbarActive(false);
  };

  // Deletion helper
  const handleConfirmDelete = () => {
    if (deleteTargetId) {
      notificationStore.delete(deleteTargetId);
      setDeleteTargetId(null);
    }
  };

  // Quick simulated notification injector triggers
  const simulateTaskAssignment = () => {
    notificationStore.triggerSimulated(
      "task",
      "Rahul assigned you a task",
      "Figma handoff review for ThreadSense AI",
      "ThreadSense AI",
      "MEDIUM",
      "Rahul S.",
      "RS",
      "Manager",
      ["Accept", "Decline", "Open"],
    );
  };

  const simulateApprovalRejected = () => {
    notificationStore.triggerSimulated(
      "approval",
      "Approval Rejected: Campaign Layout",
      "Rejected by Luca F. Reason: Typography contrast issues.",
      "Meridian",
      "HIGH",
      "Luca F.",
      "LF",
      "Interaction Designer",
      ["Review", "Reply"],
    );
  };

  const simulateOverdueEscalation = () => {
    notificationStore.triggerSimulated(
      "overdue",
      "Task Overdue Lock (Workflow alert)",
      "Aurora Coffee banner delivery is 3 days overdue. Lockdown pending.",
      "Aurora Coffee",
      "HIGH",
      "Workflow Engine",
      "WE",
      "System",
      ["Regularize", "Open"],
    );
  };

  const simulateCapacityExceeded = () => {
    notificationStore.triggerSimulated(
      "capacity",
      "Capacity Exceeded alert",
      "Sandy's scheduled hours exceed 42 hrs/week maximum limit",
      "Ops",
      "MEDIUM",
      "Loooped Assistant",
      "LA",
      "Admin",
      ["Dismiss"],
    );
  };

  const simulateClientComment = () => {
    notificationStore.triggerSimulated(
      "client",
      "Client Feedback Added",
      "John from Meridian commented on wireframes",
      "Meridian",
      "LOW",
      "John C. (Client)",
      "JC",
      "Client",
      ["Reply", "Preview"],
    );
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-40 overflow-hidden select-none">
        {/* Backdrop overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.3 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/50 backdrop-blur-xs"
        />

        {/* Action Center Right Slide Drawer */}
        <motion.div
          initial={{ x: "100%" }}
          animate={{ x: 0 }}
          exit={{ x: "100%" }}
          transition={{ type: "spring", damping: 28, stiffness: 220 }}
          className="absolute right-0 top-0 bottom-0 w-full sm:w-[420px] bg-card border-l border-border flex flex-col z-40 h-full shadow-2xl"
        >
          {/* Header */}
          <div className="p-4 border-b border-border flex items-center justify-between bg-white dark:bg-[#161d2b]">
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-full bg-[#E4664F]/10 text-[#E4664F] flex items-center justify-center">
                <Bell className="w-4 h-4" />
              </span>
              <div>
                <h2 className="text-[15px] font-bold text-foreground">Action Center</h2>
                <p className="text-[10px] text-muted-foreground leading-none">
                  {notifications.filter((n) => n.status === "unread").length} unread alerts
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => notificationStore.markAllAsRead()}
                className="h-8 px-2.5 hover:bg-black/5 dark:hover:bg-white/5 rounded-lg text-xs font-bold text-[#5A82E8] flex items-center gap-1 transition-colors"
                title="Mark all as read"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Read All</span>
              </button>

              <button
                onClick={() => {
                  setActiveTab(activeTab === "list" ? "settings" : "list");
                }}
                className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                  activeTab === "settings"
                    ? "bg-[#5A82E8] text-white"
                    : "text-muted-foreground hover:bg-black/5 dark:hover:bg-white/5"
                }`}
                title="Notification Settings"
              >
                <Settings2 className="w-4 h-4" />
              </button>

              <button
                onClick={onClose}
                className="w-8 h-8 rounded-lg text-muted-foreground hover:text-foreground hover:bg-black/5 dark:hover:bg-white/5 flex items-center justify-center transition-all"
                title="Close Drawer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Tab view switcher: List vs Settings */}
          {activeTab === "settings" ? (
            <div className="flex-1 overflow-y-auto p-5">
              <NotificationSettingsPanel settings={settings} onClose={() => setActiveTab("list")} />
            </div>
          ) : (
            <div className="flex-1 flex flex-col min-h-0 overflow-hidden bg-slate-50/40 dark:bg-[#121824]/30">
              {/* 1. Trigger Simulation Accordion for Review/Showcase */}
              <div className="bg-white dark:bg-[#161d2b] border-b border-border/60 px-4 py-2 text-xs">
                <button
                  onClick={() => setIsSimOpen(!isSimOpen)}
                  className="w-full flex items-center justify-between text-muted-foreground hover:text-[#5A82E8] py-1 font-bold"
                >
                  <span className="flex items-center gap-1.5">
                    <PlusCircle className="w-3.5 h-3.5 text-[#5A82E8]" />
                    <span>Loooped Trigger Simulator ({groupedNotifications.length})</span>
                  </span>
                  <span className="text-[10px] text-muted-foreground font-semibold bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-sm">
                    {isSimOpen ? "Hide" : "Show"}
                  </span>
                </button>
                {isSimOpen && (
                  <div className="grid grid-cols-2 gap-1.5 py-2">
                    <button
                      onClick={simulateTaskAssignment}
                      className="px-2.5 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/20 text-blue-700 dark:text-blue-300 font-bold text-left border border-blue-100 hover:opacity-90"
                    >
                      + Task Assigned
                    </button>
                    <button
                      onClick={simulateApprovalRejected}
                      className="px-2.5 py-1.5 rounded-lg bg-purple-50 dark:bg-purple-950/20 text-purple-700 dark:text-purple-300 font-bold text-left border border-purple-100 hover:opacity-90"
                    >
                      + Approval Reject
                    </button>
                    <button
                      onClick={simulateOverdueEscalation}
                      className="px-2.5 py-1.5 rounded-lg bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-300 font-bold text-left border border-red-100 hover:opacity-90"
                    >
                      + Overdue Lock
                    </button>
                    <button
                      onClick={simulateCapacityExceeded}
                      className="px-2.5 py-1.5 rounded-lg bg-orange-50 dark:bg-orange-950/20 text-orange-700 dark:text-orange-300 font-bold text-left border border-orange-100 hover:opacity-90"
                    >
                      + Capacity Alert
                    </button>
                    <button
                      onClick={simulateClientComment}
                      className="px-2.5 py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/20 text-indigo-700 dark:text-indigo-300 font-bold text-left border border-indigo-100 hover:opacity-90 col-span-2"
                    >
                      + Client Feedback Comment
                    </button>
                  </div>
                )}
              </div>

              {/* 2. Three Levels of Visual Filters */}
              <div className="p-3 bg-white dark:bg-[#161d2b] border-b border-border/60 space-y-2.5">
                {/* Search bar */}
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#A8A8A8]" />
                  <input
                    type="text"
                    placeholder="Search task, project, meeting..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full h-8 pl-8 pr-3.5 bg-slate-50 dark:bg-[#1e2638] border border-border/70 rounded-lg text-xs focus:outline-none"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground text-xs font-semibold"
                    >
                      Clear
                    </button>
                  )}
                </div>

                {/* Level 1: Category Chips */}
                <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-0.5 scroll-smooth">
                  {[
                    "All",
                    "Unread",
                    "Assigned",
                    "Approvals",
                    "Overdue",
                    "Meetings",
                    "Messages",
                    "Files",
                    "Client",
                    "Mentions",
                    "System",
                  ].map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setSelectedFilterCategory(cat)}
                      className={`h-6 px-2.5 rounded-md text-[10px] font-extrabold whitespace-nowrap transition-colors shrink-0 ${
                        selectedFilterCategory === cat
                          ? "bg-[#5A82E8] text-white"
                          : "bg-slate-100 dark:bg-slate-800 text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                {/* Level 2: Time chips & Bulk trigger */}
                <div className="flex items-center justify-between gap-2 border-t border-dashed border-border/65 pt-2 flex-wrap sm:flex-nowrap">
                  <div className="flex items-center gap-1 overflow-x-auto">
                    {["All Days", "Today", "Yesterday", "7 Days", "30 Days"].map((time) => (
                      <button
                        key={time}
                        onClick={() => setSelectedFilterTime(time)}
                        className={`h-5 px-2 rounded-md text-[9px] font-bold whitespace-nowrap transition-colors shrink-0 ${
                          selectedFilterTime === time
                            ? "bg-slate-800 dark:bg-slate-200 text-background"
                            : "text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        {time}
                      </button>
                    ))}
                  </div>

                  {/* Bulk Select Trigger checkbox */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => setIsBulkToolbarActive(!isBulkToolbarActive)}
                      className={`h-5.5 px-2 rounded-md text-[9px] font-bold flex items-center gap-1 border transition-colors ${
                        isBulkToolbarActive
                          ? "bg-amber-500/10 text-amber-600 border-amber-500/20"
                          : "bg-white dark:bg-[#1a1a20] text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <span>Bulk Edit</span>
                    </button>
                  </div>
                </div>

                {/* Level 3: Dropdowns Selector */}
                <div className="flex items-center gap-1.5 pt-1 overflow-x-auto">
                  {/* Projects dropdown */}
                  <select
                    value={selectedProject}
                    onChange={(e) => setSelectedProject(e.target.value)}
                    className="h-6 px-2 bg-slate-50 dark:bg-slate-800 border rounded-md text-[10px] text-muted-foreground focus:outline-none"
                  >
                    <option value="All Projects">All Projects</option>
                    {availableProjects
                      .filter((p) => p !== "All Projects")
                      .map((p) => (
                        <option key={p} value={p}>
                          {p}
                        </option>
                      ))}
                  </select>

                  {/* Priorities dropdown */}
                  <select
                    value={selectedPriority}
                    onChange={(e) => setSelectedPriority(e.target.value)}
                    className="h-6 px-2 bg-slate-50 dark:bg-slate-800 border rounded-md text-[10px] text-muted-foreground focus:outline-none"
                  >
                    <option value="All Priorities">All Priorities</option>
                    <option value="HIGH">High Priority</option>
                    <option value="MEDIUM">Medium Priority</option>
                    <option value="LOW">Low Priority</option>
                  </select>

                  {/* Role dropdown */}
                  <select
                    value={selectedRole}
                    onChange={(e) => setSelectedRole(e.target.value)}
                    className="h-6 px-2 bg-slate-50 dark:bg-slate-800 border rounded-md text-[10px] text-muted-foreground focus:outline-none"
                  >
                    {availableRoles.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* 3. Grouped Notifications Lists */}
              <div className="flex-1 overflow-y-auto p-3.5 space-y-4">
                {isLoading ? (
                  <NotificationSkeleton />
                ) : isError ? (
                  <NotificationErrorState onRetry={() => setIsError(false)} />
                ) : filteredNotifications.length === 0 ? (
                  <NotificationEmptyState onGoDashboard={() => onClose()} />
                ) : (
                  groupedNotifications.map(([groupName, items]) => (
                    <div key={groupName} className="space-y-2">
                      <div className="flex items-center justify-between px-1">
                        <h4 className="text-[10px] font-extrabold text-muted-foreground uppercase tracking-widest">
                          {groupName}
                        </h4>
                        <span className="text-[9px] text-muted-foreground/60 font-semibold">
                          {items.length} items
                        </span>
                      </div>

                      <div className="space-y-2">
                        {items.map((n) => (
                          <NotificationCard
                            key={n.id}
                            notification={n}
                            selected={selectedDetailNotif?.id === n.id}
                            onClick={() => setSelectedDetailNotif(n)}
                            onOpenDetails={() => setSelectedDetailNotif(n)}
                            onDeleteRequest={() => setDeleteTargetId(n.id)}
                            showSelectionBox={isBulkToolbarActive}
                            isChecked={selectedNotifIds.includes(n.id)}
                            onToggleCheck={() => handleToggleSelectItem(n.id)}
                          />
                        ))}
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* 4. Bulk Action Toolbar */}
              <AnimatePresence>
                {isBulkToolbarActive && selectedNotifIds.length > 0 && (
                  <motion.div
                    initial={{ y: 50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 50, opacity: 0 }}
                    className="p-3 border-t border-border bg-amber-50 dark:bg-[#1b1c2b] flex items-center justify-between"
                  >
                    <span className="text-xs font-bold text-[#111111] dark:text-amber-100 pr-2 whitespace-nowrap">
                      {selectedNotifIds.length} selected
                    </span>

                    <div className="flex items-center gap-1.5 overflow-x-auto">
                      <button
                        onClick={handleBulkMarkRead}
                        className="h-7 px-2.5 rounded-lg bg-[#5A82E8] hover:opacity-95 text-white text-[10px] font-bold"
                      >
                        Read
                      </button>
                      <button
                        onClick={handleBulkArchive}
                        className="h-7 px-2.5 rounded-lg bg-emerald-500 hover:opacity-95 text-white text-[10px] font-bold"
                      >
                        Archive
                      </button>
                      <button
                        onClick={handleBulkMute}
                        className="h-7 px-2.5 rounded-lg bg-slate-500 hover:opacity-95 text-white text-[10px] font-bold"
                      >
                        Mute
                      </button>
                      <button
                        onClick={handleBulkDelete}
                        className="h-7 px-2.5 rounded-lg bg-red-500 hover:opacity-95 text-white text-[10px] font-bold"
                      >
                        Delete
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Footer View dedicated page link */}
              <div className="p-3 border-t bg-white dark:bg-[#161d2b] flex items-center justify-between text-xs font-semibold">
                <span className="text-muted-foreground font-mono">Loooped Inbox OS</span>
                <Link
                  to="/notifications"
                  onClick={onClose}
                  className="text-[#5A82E8] hover:underline flex items-center gap-0.5"
                >
                  <span>View Dedicated Inbox Page</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          )}
        </motion.div>
      </div>

      {/* 5. Expanded Notification Detail Drawer next to it */}
      <NotificationDetailDrawer
        notification={selectedDetailNotif}
        isOpen={selectedDetailNotif !== null}
        onClose={() => setSelectedDetailNotif(null)}
      />

      {/* 6. Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteTargetId !== null && (
          <div className="fixed inset-0 z-55 flex items-center justify-center p-4 overflow-hidden select-none">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setDeleteTargetId(null)}
              className="absolute inset-0 bg-black/50 backdrop-blur-xs"
            />
            {/* Modal card */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-card border border-border p-5 rounded-[24px] shadow-2xl relative w-full max-w-[340px] z-55 text-center"
            >
              <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-3">
                <Trash2 className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-foreground">Delete notification?</h3>
              <p className="text-xs text-muted-foreground mt-1 max-w-[260px] mx-auto leading-relaxed">
                This action only removes this alert from your personal inbox feed. System
                operational history remains intact.
              </p>
              <div className="flex gap-2.5 mt-5">
                <button
                  onClick={() => setDeleteTargetId(null)}
                  className="flex-1 h-9 rounded-xl border text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-900"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmDelete}
                  className="flex-1 h-9 rounded-xl bg-red-500 text-white text-xs font-bold hover:opacity-95"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </AnimatePresence>
  );
}
