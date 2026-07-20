import { useState, useEffect, useMemo } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { AppShell, Card } from "@/components/app-shell";
import {
  Bell,
  Check,
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
  Search,
  Filter,
  CheckCircle2,
  Moon,
  AlertTriangle,
  Folder,
  User,
  Activity,
  Maximize2,
} from "lucide-react";
import { Notification, NotifType, notificationStore } from "@/lib/notifications-store";
import {
  NotificationCard,
  NotificationDetailDrawer,
  NotificationSettingsPanel,
  NotificationEmptyState,
  NotificationSkeleton,
  getRelativeGroup,
  getNotifTypeColor,
} from "@/components/notification-components";
import { toast } from "sonner";

export const Route = createFileRoute("/notifications")({
  component: NotificationsPage,
});

export function NotificationsPage() {
  // Sync with global store
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [settings, setSettings] = useState(notificationStore.getSettings());
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilterCategory, setSelectedFilterCategory] = useState<string>("All");
  const [selectedFilterTime, setSelectedFilterTime] = useState<string>("All Days");

  // Dropdown Filter States
  const [selectedProject, setSelectedProject] = useState<string>("All Projects");
  const [selectedPriority, setSelectedPriority] = useState<string>("All Priorities");
  const [selectedRole, setSelectedRole] = useState<string>("All Roles");

  // Detail panel state
  const [selectedDetailNotif, setSelectedDetailNotif] = useState<Notification | null>(null);

  // Bulk operation state
  const [selectedNotifIds, setSelectedNotifIds] = useState<string[]>([]);
  const [isBulkActive, setIsBulkActive] = useState(false);

  // Deletion Modal
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  // Simulation Panel state
  const [isSimOpen, setIsSimOpen] = useState(true);

  // Subscribe to store updates
  useEffect(() => {
    setNotifications(notificationStore.getNotifications());
    setSettings(notificationStore.getSettings());

    const unsubscribe = notificationStore.subscribe(() => {
      setNotifications([...notificationStore.getNotifications()]);
      setSettings({ ...notificationStore.getSettings() });
    });
    return unsubscribe;
  }, []);

  // Compute available projects dynamically from the store
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

      // 1. Category tab
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

      // 2. Time Chip Filter
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

      // 3. Dropdowns
      if (selectedProject !== "All Projects" && n.project !== selectedProject) return false;
      if (selectedPriority !== "All Priorities" && n.priority !== selectedPriority) return false;
      if (
        selectedRole !== "All Roles" &&
        n.sender.role.toLowerCase() !== selectedRole.toLowerCase()
      )
        return false;

      // 4. Free-text Search
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

  // Grouping for elegant dashboard sections
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

  // Bulk actions handlers
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

  const handleBulkMarkRead = () => {
    notificationStore.bulkMarkRead(selectedNotifIds);
    setSelectedNotifIds([]);
    setIsBulkActive(false);
  };

  const handleBulkArchive = () => {
    notificationStore.bulkArchive(selectedNotifIds);
    setSelectedNotifIds([]);
    setIsBulkActive(false);
  };

  const handleBulkMute = () => {
    notificationStore.bulkMute(selectedNotifIds);
    setSelectedNotifIds([]);
    setIsBulkActive(false);
  };

  const handleBulkDelete = () => {
    notificationStore.bulkDelete(selectedNotifIds);
    setSelectedNotifIds([]);
    setIsBulkActive(false);
  };

  const handleConfirmDelete = () => {
    if (deleteTargetId) {
      notificationStore.delete(deleteTargetId);
      setDeleteTargetId(null);
    }
  };

  // Simulators
  const triggerQuickSim = (type: NotifType) => {
    switch (type) {
      case "task":
        notificationStore.triggerSimulated(
          "task",
          "Rahul assigned you a task",
          "Homepage UI Redesign concepts",
          "Aurora Coffee",
          "HIGH",
          "Rahul S.",
          "RS",
          "Manager",
          ["Accept", "Decline", "Open"],
        );
        break;
      case "approval":
        notificationStore.triggerSimulated(
          "approval",
          "Luca F. requested approval",
          "Motion boards v2 design handoff",
          "Kite Motors",
          "HIGH",
          "Luca F.",
          "LF",
          "Interaction Designer",
          ["Approve", "Reject", "Review"],
        );
        break;
      case "capacity":
        notificationStore.triggerSimulated(
          "capacity",
          "Capacity Warning",
          "Design pod is at 92% of scheduled hours for this week",
          "Ops",
          "HIGH",
          "System Coordinator",
          "SY",
          "Automated Bot",
          ["Regularize", "Dismiss"],
        );
        break;
      case "meeting":
        notificationStore.triggerSimulated(
          "meeting",
          "UX Huddle Rescheduled",
          "Rescheduled by Supraja. New time: 02:00 PM today.",
          "Helix Health",
          "MEDIUM",
          "Supraja K.",
          "SK",
          "UX Lead",
          ["Join", "Reschedule", "View"],
        );
        break;
      case "client":
        notificationStore.triggerSimulated(
          "client",
          "Client left feedback",
          "Helix Health left 4 comments on Campaign concepts",
          "Helix Health",
          "MEDIUM",
          "Sarah M. (Client)",
          "SM",
          "Product Owner",
          ["Review", "Reply"],
        );
        break;
    }
  };

  const unreadTotal = notifications.filter((n) => n.status === "unread").length;

  return (
    <AppShell breadcrumb={["Workspace", "Action Center Inbox"]}>
      {/* 1. Page Header with Title, Stats Summary & Main Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-[30px] font-semibold tracking-tight text-foreground select-none">
              Action Center Inbox
            </h1>
            {settings.quietHours.enabled && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-500/10 text-amber-600 rounded-full text-[10px] font-extrabold tracking-wide uppercase">
                <Moon className="w-3 h-3" />
                <span>Quiet Hours</span>
              </span>
            )}
          </div>
          <p className="text-[14px] text-muted-foreground mt-1 select-none">
            {unreadTotal} unread actionable items · {notifications.length} total active alerts
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Simulation Toggle */}
          <button
            onClick={() => setIsSimOpen(!isSimOpen)}
            className={`h-10 px-4 rounded-[18px] border text-[13px] font-medium flex items-center gap-2 transition-all ${
              isSimOpen
                ? "bg-[#5A82E8]/10 border-[#5A82E8]/35 text-[#5A82E8]"
                : "bg-white dark:bg-[#1c2436]/60 border-border hover:text-foreground"
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>Simulator {isSimOpen ? "On" : "Off"}</span>
          </button>

          {/* Settings Trigger */}
          <button
            onClick={() => setIsSettingsOpen(!isSettingsOpen)}
            className={`h-10 px-4 rounded-[18px] border text-[13px] font-medium flex items-center gap-2 transition-all ${
              isSettingsOpen
                ? "bg-[#5A82E8] text-white border-transparent"
                : "bg-white dark:bg-[#1c2436]/60 border-border hover:text-foreground hover:border-[#A8A8A8]"
            }`}
          >
            <Settings2 className="w-4 h-4" />
            <span>Inbox Settings</span>
          </button>

          {/* Mark All Read */}
          <button
            onClick={() => notificationStore.markAllAsRead()}
            className="h-10 px-4.5 rounded-[18px] bg-[#111111] dark:bg-white text-white dark:text-[#111111] text-[13px] font-medium hover:opacity-90 transition-opacity flex items-center gap-1.5"
          >
            <Check className="w-4 h-4" />
            <span>Mark all read</span>
          </button>
        </div>
      </div>

      {/* Settings Modal (Overlay Panel inside Route) */}
      {isSettingsOpen && (
        <Card className="p-6 mb-8 border-[#5A82E8]/30 bg-white dark:bg-[#121927]">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[16px] font-semibold text-foreground flex items-center gap-2">
              <Sliders className="w-4 h-4 text-[#5A82E8]" />
              <span>Inbox Preferences & Notification Channels</span>
            </h2>
            <button
              onClick={() => setIsSettingsOpen(false)}
              className="text-muted-foreground hover:text-foreground"
            >
              Close Preferences
            </button>
          </div>
          <NotificationSettingsPanel settings={settings} onClose={() => setIsSettingsOpen(false)} />
        </Card>
      )}

      {/* 2. Simulation Sandbox Board */}
      {isSimOpen && (
        <div className="bg-[#5A82E8]/5 border border-[#5A82E8]/10 rounded-3xl p-5 mb-8 select-none">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-4 h-4 text-[#5A82E8]" />
            <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">
              Loooped Workflow Events Simulation Dashboard
            </h3>
          </div>
          <p className="text-xs text-muted-foreground mb-4 max-w-[700px] leading-relaxed">
            Click any trigger button below to fire real, high-fidelity notification scenarios.
            Observe how they update the active unread counter badge in real-time, generate alerts,
            support CTA actions, and populate specific filters instantly.
          </p>
          <div className="flex flex-wrap gap-2.5">
            <button
              onClick={() => triggerQuickSim("task")}
              className="h-9 px-4 rounded-xl bg-blue-100 dark:bg-blue-950/40 text-blue-800 dark:text-blue-300 font-bold text-xs border border-blue-200/40 hover:opacity-90"
            >
              ⚡ Simulated Task Assignment
            </button>
            <button
              onClick={() => triggerQuickSim("approval")}
              className="h-9 px-4 rounded-xl bg-purple-100 dark:bg-purple-950/40 text-purple-800 dark:text-purple-300 font-bold text-xs border border-purple-200/40 hover:opacity-90"
            >
              ⚡ Simulate Approval Request
            </button>
            <button
              onClick={() => triggerQuickSim("capacity")}
              className="h-9 px-4 rounded-xl bg-orange-100 dark:bg-orange-950/40 text-orange-800 dark:text-orange-300 font-bold text-xs border border-orange-200/40 hover:opacity-90"
            >
              ⚡ Simulate Capacity Alert
            </button>
            <button
              onClick={() => triggerQuickSim("meeting")}
              className="h-9 px-4 rounded-xl bg-green-100 dark:bg-green-950/40 text-green-800 dark:text-green-300 font-bold text-xs border border-green-200/40 hover:opacity-90"
            >
              ⚡ Simulate Rescheduled Meeting
            </button>
            <button
              onClick={() => triggerQuickSim("client")}
              className="h-9 px-4 rounded-xl bg-indigo-100 dark:bg-indigo-950/40 text-indigo-800 dark:text-indigo-300 font-bold text-xs border border-indigo-200/40 hover:opacity-90"
            >
              ⚡ Simulate Client Handoff Comments
            </button>
          </div>
        </div>
      )}

      {/* 3. Main Dashboard Board with Sidebar Filters + Content Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-8 select-none">
        {/* Left Side Filter Panel (Row 1 Category list as a sidebar stack!) */}
        <div className="xl:col-span-1 space-y-6">
          <div className="bg-card border border-border rounded-[28px] p-5 space-y-5">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">
                Smart Categories
              </h3>
              <nav className="flex flex-col gap-1">
                {[
                  { id: "All", label: "All Alerts", icon: Bell },
                  { id: "Unread", label: "Unread Actions", icon: CheckCircle2 },
                  { id: "Assigned", label: "Task Assignments", icon: Check },
                  { id: "Approvals", label: "Client Approvals", icon: Sliders },
                  { id: "Overdue", label: "Overdue Locks", icon: AlertTriangle },
                  { id: "Meetings", label: "Meetings Calendar", icon: Clock },
                  { id: "Messages", label: "Direct Mentions", icon: HelpCircle },
                  { id: "Files", label: "Files & Handoffs", icon: Folder },
                  { id: "Client", label: "Client Feedback", icon: User },
                  { id: "System", label: "System Alerts", icon: Activity },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setSelectedFilterCategory(item.id)}
                    className={`flex items-center justify-between px-3.5 h-10 rounded-xl text-xs font-bold transition-all ${
                      selectedFilterCategory === item.id
                        ? "bg-[#5A82E8] text-white"
                        : "text-muted-foreground hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-foreground"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <item.icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </div>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        selectedFilterCategory === item.id
                          ? "bg-white/20 text-white"
                          : "bg-slate-100 dark:bg-slate-800 text-muted-foreground"
                      }`}
                    >
                      {item.id === "All"
                        ? notifications.length
                        : item.id === "Unread"
                          ? unreadTotal
                          : notifications.filter((n) => {
                              if (item.id === "Assigned" && n.type === "task") return true;
                              if (item.id === "Approvals" && n.type === "approval") return true;
                              if (item.id === "Overdue" && n.type === "overdue") return true;
                              if (item.id === "Meetings" && n.type === "meeting") return true;
                              if (item.id === "Messages" && n.type === "message") return true;
                              if (item.id === "Files" && n.type === "file") return true;
                              if (item.id === "Client" && n.type === "client") return true;
                              if (item.id === "System" && n.type === "system") return true;
                              if (
                                item.id === "Mentions" &&
                                n.title.toLowerCase().includes("mentioned")
                              )
                                return true;
                              return false;
                            }).length}
                    </span>
                  </button>
                ))}
              </nav>
            </div>

            {/* Time Chips (Row 2 Filters) */}
            <div className="border-t border-border pt-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2.5">
                Time Horizon
              </h3>
              <div className="grid grid-cols-2 gap-1.5">
                {["All Days", "Today", "Yesterday", "7 Days", "30 Days"].map((time) => (
                  <button
                    key={time}
                    onClick={() => setSelectedFilterTime(time)}
                    className={`h-8 rounded-xl text-[11px] font-bold border transition-all ${
                      selectedFilterTime === time
                        ? "bg-slate-900 dark:bg-white text-white dark:text-[#111111] border-transparent"
                        : "bg-slate-50 dark:bg-slate-900 text-muted-foreground border-border hover:text-foreground"
                    }`}
                  >
                    {time}
                  </button>
                ))}
              </div>
            </div>

            {/* Dropdown Filters (Row 3 Filters) */}
            <div className="border-t border-border pt-4 space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground leading-none">
                Granular Filtering
              </h3>

              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase text-muted-foreground">
                  Project
                </label>
                <select
                  value={selectedProject}
                  onChange={(e) => setSelectedProject(e.target.value)}
                  className="w-full h-8 px-2.5 bg-slate-50 dark:bg-slate-900 border rounded-xl text-xs text-muted-foreground focus:outline-none"
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
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase text-muted-foreground">
                  Priority
                </label>
                <select
                  value={selectedPriority}
                  onChange={(e) => setSelectedPriority(e.target.value)}
                  className="w-full h-8 px-2.5 bg-slate-50 dark:bg-slate-900 border rounded-xl text-xs text-muted-foreground focus:outline-none"
                >
                  <option value="All Priorities">All Priorities</option>
                  <option value="HIGH">High Priority</option>
                  <option value="MEDIUM">Medium Priority</option>
                  <option value="LOW">Low Priority</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase text-muted-foreground">
                  Sender Role
                </label>
                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
                  className="w-full h-8 px-2.5 bg-slate-50 dark:bg-slate-900 border rounded-xl text-xs text-muted-foreground focus:outline-none"
                >
                  {availableRoles.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side Content (Inbox Card List) */}
        <div className="xl:col-span-3 space-y-4">
          {/* List Search & Bulk Mode Select */}
          <div className="bg-white dark:bg-transparent border border-border p-3.5 rounded-[22px] flex flex-col md:flex-row items-center gap-3.5">
            {/* Search Input */}
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A8A8A8]" />
              <input
                type="text"
                placeholder="Instant filter by task name, project, employee description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-10 pl-10 pr-4 bg-slate-50 dark:bg-[#151c2a] border border-border rounded-xl text-xs focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto shrink-0">
              {/* Bulk Edit mode toggle */}
              <button
                onClick={() => {
                  setIsBulkActive(!isBulkActive);
                  setSelectedNotifIds([]);
                }}
                className={`h-10 px-4.5 rounded-xl border text-xs font-semibold flex items-center gap-2 transition-colors w-full md:w-auto justify-center ${
                  isBulkActive
                    ? "bg-amber-500/15 border-amber-500/30 text-amber-600"
                    : "bg-slate-50 dark:bg-slate-900 hover:border-[#A8A8A8]"
                }`}
              >
                <span>Bulk Selection Mode</span>
              </button>
            </div>
          </div>

          {/* Bulk Action Toolbar if items selected */}
          {isBulkActive && filteredNotifications.length > 0 && (
            <div className="bg-amber-500/5 border border-amber-500/15 p-4 rounded-2xl flex flex-col sm:flex-row justify-between items-center gap-3">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={
                    selectedNotifIds.length === filteredNotifications.length &&
                    filteredNotifications.length > 0
                  }
                  onChange={handleToggleSelectAll}
                  className="rounded border-gray-300 text-[#5A82E8] h-4.5 w-4.5 cursor-pointer"
                />
                <span className="text-xs font-bold text-foreground">
                  Select All ({selectedNotifIds.length} / {filteredNotifications.length} items
                  checked)
                </span>
              </div>

              {selectedNotifIds.length > 0 && (
                <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto justify-end">
                  <button
                    onClick={handleBulkMarkRead}
                    className="h-8.5 px-3.5 rounded-lg bg-[#5A82E8] text-white text-xs font-bold hover:opacity-95 shrink-0"
                  >
                    Mark Read
                  </button>
                  <button
                    onClick={handleBulkArchive}
                    className="h-8.5 px-3.5 rounded-lg bg-emerald-500 text-white text-xs font-bold hover:opacity-95 shrink-0"
                  >
                    Archive
                  </button>
                  <button
                    onClick={handleBulkMute}
                    className="h-8.5 px-3.5 rounded-lg bg-slate-500 text-white text-xs font-bold hover:opacity-95 shrink-0"
                  >
                    Mute
                  </button>
                  <button
                    onClick={handleBulkDelete}
                    className="h-8.5 px-3.5 rounded-lg bg-red-500 text-white text-xs font-bold hover:opacity-95 shrink-0"
                  >
                    Delete Selected
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Grouped lists of Notification cards */}
          <div className="space-y-6">
            {isLoading ? (
              <NotificationSkeleton />
            ) : filteredNotifications.length === 0 ? (
              <NotificationEmptyState
                onGoDashboard={() => toast.success("Refreshed notification state!")}
              />
            ) : (
              groupedNotifications.map(([groupName, items]) => (
                <div key={groupName} className="space-y-3">
                  <div className="flex items-center justify-between border-b pb-2 px-1">
                    <h3 className="text-xs font-extrabold text-muted-foreground uppercase tracking-widest">
                      {groupName} Feed
                    </h3>
                    <span className="text-xs text-muted-foreground font-mono">
                      {items.length} notifications
                    </span>
                  </div>

                  <div className="grid grid-cols-1 gap-3">
                    {items.map((n) => (
                      <NotificationCard
                        key={n.id}
                        notification={n}
                        selected={selectedDetailNotif?.id === n.id}
                        onClick={() => setSelectedDetailNotif(n)}
                        onOpenDetails={() => setSelectedDetailNotif(n)}
                        onDeleteRequest={() => setDeleteTargetId(n.id)}
                        showSelectionBox={isBulkActive}
                        isChecked={selectedNotifIds.includes(n.id)}
                        onToggleCheck={() => handleToggleSelectItem(n.id)}
                      />
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Reusable Expanded Notification Drawer */}
      <NotificationDetailDrawer
        notification={selectedDetailNotif}
        isOpen={selectedDetailNotif !== null}
        onClose={() => setSelectedDetailNotif(null)}
      />

      {/* Delete Confirmation Modal */}
      {deleteTargetId !== null && (
        <div className="fixed inset-0 z-55 flex items-center justify-center p-4 overflow-hidden select-none">
          <div
            onClick={() => setDeleteTargetId(null)}
            className="absolute inset-0 bg-black/50 backdrop-blur-xs"
          />
          <div className="bg-card border border-border p-5 rounded-[24px] shadow-2xl relative w-full max-w-[340px] z-55 text-center">
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-3">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-foreground">Delete notification?</h3>
            <p className="text-xs text-muted-foreground mt-1 max-w-[260px] mx-auto leading-relaxed">
              This action only removes this alert from your personal inbox feed. System operational
              history remains intact.
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
          </div>
        </div>
      )}
    </AppShell>
  );
}
