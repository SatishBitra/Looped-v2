import { Link, useRouterState } from "@tanstack/react-router";
import {
  Home,
  LayoutDashboard,
  FolderKanban,
  CheckSquare,
  ShieldCheck,
  Bell,
  MessageSquare,
  BarChart3,
  Users,
  Settings,
  Sun,
  Search,
  Plus,
  Calendar,
  X,
  Menu,
  Briefcase,
  ArrowRight,
  User,
  LogOut,
  Clock,
  Sparkles,
  CheckCircle2,
  ChevronDown,
  Check,
  Paperclip,
  Send,
  ArrowLeft,
} from "lucide-react";
import {
  useState,
  useEffect,
  type ReactNode,
  createContext,
  useContext,
  lazy,
  Suspense,
} from "react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "motion/react";
import { notificationStore } from "@/lib/notifications-store";
import { NotificationDrawer } from "./notification-drawer";

export const ShellContext = createContext({ isInsideModal: false });

const MessagesPage = lazy(() =>
  import("@/routes/messages").then((m) => ({ default: m.MessagesPage })),
);
const TeamPage = lazy(() => import("@/routes/team").then((m) => ({ default: m.TeamPage })));
const NotificationsPage = lazy(() =>
  import("@/routes/notifications").then((m) => ({ default: m.NotificationsPage })),
);

const nav = [
  { to: "/home", icon: Home, label: "Home" },
  { to: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/projects", icon: FolderKanban, label: "Projects" },
  { to: "/tasks", icon: CheckSquare, label: "Tasks" },
  { to: "/calendar", icon: Calendar, label: "Calendar" },
  { to: "/approvals", icon: ShieldCheck, label: "Approvals" },
  { to: "/reports", icon: BarChart3, label: "Reports" },
  { to: "/clients", icon: Briefcase, label: "Clients" },
  { to: "/settings", icon: Settings, label: "Settings" },
] as const;

function Sidebar() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [unreadCount, setUnreadCount] = useState(
    notificationStore.getNotifications().filter((n) => n.status === "unread").length,
  );

  const [sidebarLeft, setSidebarLeft] = useState<string>("16px");

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 1440) {
        setSidebarLeft(`${(window.innerWidth - 1440) / 2 + 16}px`);
      } else {
        setSidebarLeft("16px");
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const unsubscribe = notificationStore.subscribe(() => {
      setUnreadCount(
        notificationStore.getNotifications().filter((n) => n.status === "unread").length,
      );
    });
    return unsubscribe;
  }, []);

  return (
    <aside
      style={{ left: sidebarLeft }}
      className="hidden md:flex fixed top-4 bottom-4 w-[72px] z-30 flex flex-col items-center py-5 bg-card border border-border rounded-[32px] shadow-[var(--shadow-soft)] transition-[left] duration-150"
    >
      <Link
        to="/home"
        className="w-10 h-10 rounded-full bg-foreground text-background grid place-items-center font-semibold text-[15px] mb-6"
      >
        L
      </Link>

      <nav className="flex-1 flex flex-col gap-1.5 items-center justify-center">
        {nav.map((item) => {
          const active = item.to === "/" ? pathname === "/" : pathname.startsWith(item.to);
          const Icon = item.icon;
          const isBell = item.label === "Notifications";
          return (
            <Link
              key={item.to}
              to={item.to}
              className={`group relative w-11 h-11 rounded-full grid place-items-center transition-colors ${
                active
                  ? "bg-foreground text-background"
                  : "bg-[#F4F4F7] dark:bg-[#242428] text-muted-foreground hover:bg-accent hover:text-foreground"
              }`}
              title={item.label}
            >
              <Icon className="w-[18px] h-[18px]" strokeWidth={1.75} />
              {isBell && unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-[#E4664F] text-white rounded-full flex items-center justify-center text-[9px] font-bold border border-white dark:border-[#242428]">
                  {unreadCount > 99 ? "99+" : unreadCount}
                </span>
              )}
              <span className="pointer-events-none absolute left-full ml-3 px-2.5 py-1 rounded-lg bg-foreground text-background text-[12px] font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>

      <div className="flex flex-col gap-1.5 items-center">
        <button className="w-11 h-11 rounded-full grid place-items-center bg-[#F4F4F7] dark:bg-[#242428] text-muted-foreground hover:bg-accent hover:text-foreground transition-colors">
          <Sun className="w-[18px] h-[18px]" strokeWidth={1.75} />
        </button>
      </div>
    </aside>
  );
}

function TopNav({
  searchQuery = "",
  setSearchQuery,
  onQuickAdd,
  onMenuToggle,
  onNotificationClick,
  unreadCount = 0,
  onOpenModal,
}: {
  searchQuery?: string;
  setSearchQuery?: (val: string) => void;
  onQuickAdd?: () => void;
  onMenuToggle?: () => void;
  onNotificationClick?: () => void;
  unreadCount?: number;
  onOpenModal?: (type: "messages" | "team" | "notifications" | null) => void;
}) {
  const [isNotifPopoverOpen, setIsNotifPopoverOpen] = useState(false);
  const [isProfilePopoverOpen, setIsProfilePopoverOpen] = useState(false);
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);
  const [selectedNotifTab, setSelectedNotifTab] = useState<"inbox" | "general" | "archived">(
    "inbox",
  );
  const [presenceStatus, setPresenceStatus] = useState<
    "Online" | "Busy" | "In Meeting" | "Focus Time" | "Away" | "Offline"
  >(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("employee_presence_status");
      if (saved) return saved as any;
    }
    return "Online";
  });

  const handleStatusChange = (
    status: "Online" | "Busy" | "In Meeting" | "Focus Time" | "Away" | "Offline",
  ) => {
    setPresenceStatus(status);
    localStorage.setItem("employee_presence_status", status);
  };

  const [localNotifications, setLocalNotifications] = useState(
    notificationStore.getNotifications(),
  );

  const [popoverNotifs, setPopoverNotifs] = useState([
    {
      id: "pop_1",
      senderName: "Polly",
      senderAvatar:
        "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150",
      senderPresence: "online" as const,
      actionText: "edited",
      targetText: "Contact page",
      timeText: "36 mins ago",
      groupText: "Craftwork Design",
      status: "unread" as const,
      tab: "inbox" as const,
    },
    {
      id: "pop_2",
      senderName: "James",
      senderAvatar:
        "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150",
      senderPresence: "none" as const,
      actionText: "left a comment on",
      targetText: "ACME 2.1",
      timeText: "2 hours ago",
      groupText: "ACME",
      status: "unread" as const,
      tab: "inbox" as const,
    },
    {
      id: "pop_3",
      senderName: "Mary",
      senderAvatar:
        "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=150",
      senderPresence: "online" as const,
      actionText: "shared the file",
      targetText: "Isometric 2.0 with you",
      timeText: "3 hours ago",
      groupText: "Craftwork Design",
      status: "read" as const, // Mary has no unread dot in the image
      tab: "inbox" as const,
      hasActions: true,
    },
    {
      id: "pop_4",
      senderName: "Dima Phizeg",
      senderAvatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150",
      senderPresence: "none" as const,
      actionText: "edited",
      targetText: "ACME 2.1",
      timeText: "3 hours ago",
      groupText: "ACME",
      status: "read" as const,
      tab: "inbox" as const,
      attachmentName: "ACME_guideline.pdf",
    },
    {
      id: "pop_5",
      senderName: "James",
      senderAvatar:
        "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150",
      senderPresence: "none" as const,
      actionText: "created",
      targetText: "Changelog page for Blank",
      timeText: "1 day ago",
      groupText: "Blank",
      status: "read" as const,
      tab: "inbox" as const,
    },
    {
      id: "pop_gen_1",
      senderName: "System Alert",
      senderAvatar: "",
      senderPresence: "none" as const,
      actionText: "completed running",
      targetText: "Daily codebase audit (0 vulnerabilities)",
      timeText: "4 hours ago",
      groupText: "Security Ops",
      status: "read" as const,
      tab: "general" as const,
    },
    {
      id: "pop_gen_2",
      senderName: "Billing Agent",
      senderAvatar:
        "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=150",
      senderPresence: "online" as const,
      actionText: "sent comments for",
      targetText: "Stripe production subscription check",
      timeText: "5 hours ago",
      groupText: "FinOps",
      status: "unread" as const,
      tab: "general" as const,
    },
  ]);

  useEffect(() => {
    const unsubscribe = notificationStore.subscribe(() => {
      setLocalNotifications([...notificationStore.getNotifications()]);
    });
    return unsubscribe;
  }, []);

  // Merge any real incoming notifications that are not already present in the popover state
  useEffect(() => {
    const existingIds = new Set(popoverNotifs.map((n) => n.id));
    const newNotifs = localNotifications.filter((n) => !existingIds.has(n.id));
    if (newNotifs.length > 0) {
      const mapped = newNotifs.map((n) => ({
        id: n.id,
        senderName: n.sender?.name || "System",
        senderAvatar: "",
        senderPresence: "none" as const,
        actionText: "sent: " + n.title,
        targetText: n.description,
        timeText: n.time,
        groupText: n.project,
        status: n.status,
        tab: "inbox" as const,
      }));
      setPopoverNotifs((prev) => [...mapped, ...prev]);
    }
  }, [localNotifications]);

  // Messages Popover State
  const [isMessagesPopoverOpen, setIsMessagesPopoverOpen] = useState(false);
  const [activeMessageThreadId, setActiveMessageThreadId] = useState<string | null>(null);
  const [messagesSearchQuery, setMessagesSearchQuery] = useState("");
  const [messageInputValue, setMessageInputValue] = useState("");
  const [threads, setThreads] = useState([
    {
      id: "m_1",
      name: "Northwind — Q4 Rebrand",
      last: "Client approved the hero direction.",
      time: "12m",
      unread: 2,
      color: "bg-[#88A9F8]",
      messages: [
        {
          from: "Sara D.",
          side: "them",
          text: "Hero direction is locked. I'll ship the layered version tomorrow.",
          time: "10:14 AM",
        },
        {
          from: "Anna R.",
          side: "me",
          text: "Perfect. Please loop in Marta for the print variant.",
          time: "10:16 AM",
        },
        {
          from: "Marta L.",
          side: "them",
          text: "On it — I'll bring options to the pod sync.",
          time: "10:18 AM",
        },
        {
          from: "Client — Northwind",
          side: "them",
          text: "Approving the direction. Excited to see it come together.",
          time: "10:32 AM",
        },
      ],
    },
    {
      id: "m_2",
      name: "Design pod",
      last: "Sara: pushed the token updates.",
      time: "1h",
      unread: 0,
      color: "bg-[#74C98F]",
      messages: [
        {
          from: "Sara D.",
          side: "them",
          text: "Pushed the design token updates.",
          time: "09:00 AM",
        },
      ],
    },
    {
      id: "m_3",
      name: "Kite Motors — Film",
      last: "Luca: sending cut v3 tonight.",
      time: "2h",
      unread: 0,
      color: "bg-[#A48AF8]",
      messages: [
        {
          from: "Luca",
          side: "them",
          text: "Sending cut v3 tonight for feedback.",
          time: "08:15 AM",
        },
      ],
    },
  ]);

  const handleSendMessage = () => {
    if (!messageInputValue.trim() || !activeMessageThreadId) return;
    setThreads(
      threads.map((t) => {
        if (t.id === activeMessageThreadId) {
          return {
            ...t,
            last: messageInputValue,
            time: "now",
            unread: 0,
            messages: [
              ...t.messages,
              { from: "Sandy K.", side: "me", text: messageInputValue, time: "Just now" },
            ],
          };
        }
        return t;
      }),
    );
    setMessageInputValue("");
  };

  // Team Popover State
  const [isTeamPopoverOpen, setIsTeamPopoverOpen] = useState(false);
  const [teamSearchQuery, setTeamSearchQuery] = useState("");
  const teamMembers = [
    {
      id: "emp-1",
      name: "Sandy M",
      avatar:
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200",
      role: "Frontend Developer",
      status: "Online",
      activity: "Optimizing glassmorphism CSS render loops",
      pod: "Pod Alpha",
    },
    {
      id: "emp-2",
      name: "Luca R",
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200",
      role: "Motion Designer",
      status: "In Meeting",
      activity: "Client alignment on ACME film project",
      pod: "Pod Alpha",
    },
    {
      id: "emp-3",
      name: "Sara D",
      avatar:
        "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200",
      role: "Brand Designer",
      status: "Focus Time",
      activity: "Pushed design token updates for blank site",
      pod: "Pod Beta",
    },
    {
      id: "emp-4",
      name: "Marta L",
      avatar:
        "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200",
      role: "Production Artist",
      status: "Online",
      activity: "Rendering print variants for Northwind Q4",
      pod: "Pod Beta",
    },
  ];

  const filteredTeam = teamMembers.filter(
    (m) =>
      m.name.toLowerCase().includes(teamSearchQuery.toLowerCase()) ||
      m.role.toLowerCase().includes(teamSearchQuery.toLowerCase()),
  );

  const STATUS_DOT_COLORS: Record<string, string> = {
    Online: "bg-[#33A579]",
    Busy: "bg-[#E4664F]",
    "In Meeting": "bg-[#F1C40F]",
    "Focus Time": "bg-[#9B59B6]",
    Away: "bg-[#A8A8A8]",
    Offline: "bg-[#7F8C8D]",
  };

  const inboxUnreadCount = popoverNotifs.filter(
    (n) => n.tab === "inbox" && n.status === "unread",
  ).length;
  const generalUnreadCount = 18; // Fixed matching image

  const filteredNotifs = popoverNotifs.filter((n) => n.tab === selectedNotifTab);

  const handleNotifItemClick = (id: string) => {
    setPopoverNotifs(
      popoverNotifs.map((n) => (n.id === id ? { ...n, status: "read" as const } : n)),
    );
    // Sync to store if it matches
    if (localNotifications.some((n) => n.id === id)) {
      notificationStore.markAsRead(id);
    }
  };

  const handleMarkAllRead = (e: React.MouseEvent) => {
    e.stopPropagation();
    setPopoverNotifs(popoverNotifs.map((n) => ({ ...n, status: "read" as const })));
    notificationStore.markAllAsRead();
    toast.success("Inbox marked as read");
  };

  return (
    <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6 border-b border-[#E7E7EC] dark:border-[#323238] pb-6 mb-8 select-none relative z-30">
      {/* Invisible backdrop to dismiss popovers */}
      {(isNotifPopoverOpen ||
        isProfilePopoverOpen ||
        isMessagesPopoverOpen ||
        isTeamPopoverOpen) && (
        <div
          className="fixed inset-0 z-40 bg-transparent"
          onClick={() => {
            setIsNotifPopoverOpen(false);
            setIsProfilePopoverOpen(false);
            setIsStatusDropdownOpen(false);
            setIsMessagesPopoverOpen(false);
            setIsTeamPopoverOpen(false);
          }}
        />
      )}

      {/* Welcome Sandy Side */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuToggle}
          className="md:hidden w-10 h-10 rounded-[18px] bg-card border border-border text-muted-foreground hover:bg-accent hover:text-foreground transition-colors grid place-items-center"
          title="Open Menu"
        >
          <Menu className="w-4 h-4" />
        </button>
        <div>
          <h1 className="text-2xl sm:text-[32px] font-semibold tracking-tight text-[#111111] dark:text-[#F4F4F7]">
            Welcome, Sandy
          </h1>
          <div className="flex flex-wrap items-center gap-3 text-[13px] text-[#757575] mt-1.5 font-normal">
            <span>Thursday • 16 July 2026</span>
            <span className="text-[#E7E7EC] dark:text-[#323238]">•</span>
            <span className="px-2.5 py-0.5 bg-[#5A82E8]/10 text-[#5A82E8] dark:bg-[#5A82E8]/20 dark:text-[#7ba0ff] font-medium rounded-full text-xs font-mono">
              POD-1
            </span>
          </div>
        </div>
      </div>

      {/* Search, Quick Add, Calendar, Notifications, Profile Badge Stacked Side-by-Side */}
      <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto z-10">
        {/* Search Input bar */}
        <div className="relative w-full sm:w-auto flex-1 sm:flex-initial min-w-[200px] sm:min-w-[240px]">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#A8A8A8]" />
          <input
            type="text"
            placeholder="Search tasks or client..."
            value={searchQuery}
            onChange={(e) => setSearchQuery?.(e.target.value)}
            className="h-10 pl-10 pr-8 w-full rounded-[18px] bg-white dark:bg-[#242428] border border-[#E7E7EC] dark:border-[#323238] text-[13px] placeholder:text-[#A8A8A8] focus:outline-none focus:ring-1 focus:ring-[#5A82E8] transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery?.("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#A8A8A8] hover:text-[#111]"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Quick Add */}
        <button
          onClick={onQuickAdd || (() => toast.info("Opening Quick Add..."))}
          className="h-10 px-4 rounded-[18px] bg-[#111111] dark:bg-white text-white dark:text-[#111111] text-[13px] font-medium flex items-center justify-center gap-2 hover:opacity-90 transition-opacity w-full sm:w-auto"
        >
          <Plus className="w-4 h-4" strokeWidth={2} /> Quick add
        </button>

        {/* Action icons + profile wrapper */}
        <div className="flex items-center justify-between sm:justify-start gap-3 w-full sm:w-auto relative">
          <div className="flex items-center gap-2">
            {/* Calendar */}
            <Link
              to="/calendar"
              className="h-10 w-10 rounded-[18px] bg-white dark:bg-[#242428] border border-[#E7E7EC] dark:border-[#323238] grid place-items-center text-[#757575] hover:text-[#111111] dark:hover:text-white hover:border-[#A8A8A8] transition-all"
            >
              <Calendar className="w-[18px] h-[18px]" strokeWidth={1.75} />
            </Link>

            {/* Messages Button & Popover container */}
            <div className="relative">
              <button
                id="messages-popover-trigger"
                onClick={() => {
                  setIsMessagesPopoverOpen(!isMessagesPopoverOpen);
                  setIsNotifPopoverOpen(false);
                  setIsProfilePopoverOpen(false);
                  setIsTeamPopoverOpen(false);
                }}
                className={`h-10 w-10 rounded-[18px] bg-white dark:bg-[#242428] border border-[#E7E7EC] dark:border-[#323238] grid place-items-center hover:text-[#111111] dark:hover:text-white hover:border-[#A8A8A8] transition-all relative ${
                  isMessagesPopoverOpen
                    ? "text-[#111111] dark:text-white border-[#A8A8A8]"
                    : "text-[#757575]"
                }`}
              >
                <MessageSquare className="w-[18px] h-[18px]" strokeWidth={1.75} />
                {threads.some((t) => t.unread > 0) && (
                  <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-[#E4664F] text-white rounded-full flex items-center justify-center text-[9px] font-bold border border-white dark:border-[#242428]">
                    {threads.reduce((acc, t) => acc + t.unread, 0)}
                  </span>
                )}
              </button>

              <AnimatePresence>
                {isMessagesPopoverOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 top-12 w-[290px] sm:w-[360px] bg-gradient-to-b from-white/95 via-white/90 to-white/80 dark:from-[#1c1c1f]/95 dark:via-[#1c1c1f]/90 dark:to-[#18181b]/80 backdrop-blur-[24px] border border-white/20 dark:border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden text-left"
                  >
                    {activeMessageThreadId ? (
                      /* Active Conversation Chat View */
                      <div className="flex flex-col h-[380px]">
                        {/* Header */}
                        <div className="p-4 border-b border-border flex items-center gap-3 bg-slate-50/40 dark:bg-slate-900/10">
                          <button
                            onClick={() => setActiveMessageThreadId(null)}
                            className="h-8 w-8 rounded-xl bg-accent hover:bg-accent/80 text-muted-foreground hover:text-foreground flex items-center justify-center transition-all"
                          >
                            <ArrowLeft className="w-4 h-4" />
                          </button>
                          <span
                            className="w-8 h-8 rounded-full shrink-0"
                            style={{
                              background:
                                threads.find((t) => t.id === activeMessageThreadId)?.color ===
                                "bg-[#88A9F8]"
                                  ? "#88A9F8"
                                  : threads.find((t) => t.id === activeMessageThreadId)?.color ===
                                      "bg-[#74C98F]"
                                    ? "#74C98F"
                                    : "#A48AF8",
                            }}
                          />
                          <div className="min-w-0 flex-1">
                            <span className="font-extrabold text-[14px] text-foreground block truncate">
                              {threads.find((t) => t.id === activeMessageThreadId)?.name}
                            </span>
                            <span className="text-[10px] text-muted-foreground block truncate">
                              Active Chat
                            </span>
                          </div>
                        </div>

                        {/* Messages List Area */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-3">
                          {threads
                            .find((t) => t.id === activeMessageThreadId)
                            ?.messages.map((m, index) => (
                              <div
                                key={index}
                                className={`flex flex-col ${m.side === "me" ? "items-end" : "items-start"}`}
                              >
                                <span className="text-[10px] font-semibold text-muted-foreground mb-0.5">
                                  {m.from}
                                </span>
                                <div
                                  className={`px-3 py-2 rounded-2xl max-w-[85%] text-[12px] leading-relaxed ${
                                    m.side === "me"
                                      ? "bg-[#7000FF] text-white rounded-tr-none"
                                      : "bg-accent/60 dark:bg-[#242428] text-foreground rounded-tl-none"
                                  }`}
                                >
                                  {m.text}
                                </div>
                                <span className="text-[9px] text-muted-foreground mt-0.5 font-semibold">
                                  {m.time}
                                </span>
                              </div>
                            ))}
                        </div>

                        {/* Message Input Area */}
                        <div className="p-3 border-t border-border bg-slate-50/30 dark:bg-slate-900/5 flex items-center gap-2">
                          <input
                            type="text"
                            placeholder="Type a message..."
                            value={messageInputValue}
                            onChange={(e) => setMessageInputValue(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") handleSendMessage();
                            }}
                            className="flex-1 h-9 px-3.5 rounded-xl bg-white dark:bg-[#242428] border border-border text-[12px] placeholder:text-[#A8A8A8] focus:outline-none"
                          />
                          <button
                            onClick={handleSendMessage}
                            className="h-9 w-9 bg-[#7000FF] hover:bg-[#6000E0] text-white rounded-xl flex items-center justify-center shadow-sm transition-all shrink-0"
                          >
                            <Send className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ) : (
                      /* Conversation Threads List View */
                      <div className="flex flex-col h-[380px]">
                        {/* Header */}
                        <div className="p-4 pb-2 flex items-center justify-between">
                          <span className="font-extrabold text-[15px] text-foreground">
                            Messages
                          </span>
                          <span className="text-[10px] bg-[#7000FF]/10 text-[#7000FF] dark:text-[#8A6CE0] px-2 py-0.5 rounded-full font-bold">
                            Live Chats
                          </span>
                        </div>

                        {/* Search Conversation */}
                        <div className="px-4 py-2 relative">
                          <Search className="w-3.5 h-3.5 absolute left-7 top-1/2 -translate-y-1/2 text-[#A8A8A8]" />
                          <input
                            type="text"
                            placeholder="Search chats..."
                            value={messagesSearchQuery}
                            onChange={(e) => setMessagesSearchQuery(e.target.value)}
                            className="h-8 pl-8 pr-3 w-full rounded-xl bg-accent/40 text-[12px] placeholder:text-[#A8A8A8] focus:outline-none"
                          />
                        </div>

                        {/* Thread List Area */}
                        <div className="flex-1 overflow-y-auto px-2 py-1">
                          {threads
                            .filter((t) =>
                              t.name.toLowerCase().includes(messagesSearchQuery.toLowerCase()),
                            )
                            .map((t) => (
                              <button
                                key={t.id}
                                onClick={() => {
                                  setActiveMessageThreadId(t.id);
                                  // Reset unread count on click
                                  setThreads(
                                    threads.map((item) =>
                                      item.id === t.id ? { ...item, unread: 0 } : item,
                                    ),
                                  );
                                }}
                                className="w-full text-left p-2.5 rounded-xl hover:bg-accent/50 dark:hover:bg-accent/10 transition-all flex items-center gap-3 relative"
                              >
                                <span
                                  className="w-8 h-8 rounded-full shrink-0 flex items-center justify-center font-bold text-[11px] text-white"
                                  style={{
                                    background:
                                      t.color === "bg-[#88A9F8]"
                                        ? "#88A9F8"
                                        : t.color === "bg-[#74C98F]"
                                          ? "#74C98F"
                                          : "#A48AF8",
                                  }}
                                >
                                  {t.name.slice(0, 1)}
                                </span>
                                <div className="flex-1 min-w-0 pr-6">
                                  <div className="flex items-center justify-between mb-0.5">
                                    <span className="text-[12px] font-bold text-foreground truncate block">
                                      {t.name}
                                    </span>
                                    <span className="text-[10px] text-muted-foreground shrink-0 ml-1.5 font-semibold">
                                      {t.time}
                                    </span>
                                  </div>
                                  <span className="text-[11px] text-muted-foreground truncate block font-medium">
                                    {t.last}
                                  </span>
                                </div>
                                {t.unread > 0 && (
                                  <span className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-[#E4664F] text-white text-[9px] font-bold flex items-center justify-center">
                                    {t.unread}
                                  </span>
                                )}
                              </button>
                            ))}
                        </div>

                        {/* View All Messages Button */}
                        <div className="border-t border-[#E7E7EC] dark:border-[#323238] p-3 bg-slate-50/50 dark:bg-slate-900/10 flex items-center justify-center">
                          <button
                            onClick={() => {
                              setIsMessagesPopoverOpen(false);
                              onOpenModal?.("messages");
                            }}
                            className="w-full h-10 rounded-xl bg-[#111111] dark:bg-white text-white dark:text-[#111111] hover:opacity-90 font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-sm cursor-pointer"
                          >
                            <span>View Messenger</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Team Button & Popover container */}
            <div className="relative">
              <button
                id="team-popover-trigger"
                onClick={() => {
                  setIsTeamPopoverOpen(!isTeamPopoverOpen);
                  setIsNotifPopoverOpen(false);
                  setIsProfilePopoverOpen(false);
                  setIsMessagesPopoverOpen(false);
                }}
                className={`h-10 w-10 rounded-[18px] bg-white dark:bg-[#242428] border border-[#E7E7EC] dark:border-[#323238] grid place-items-center hover:text-[#111111] dark:hover:text-white hover:border-[#A8A8A8] transition-all relative ${
                  isTeamPopoverOpen
                    ? "text-[#111111] dark:text-white border-[#A8A8A8]"
                    : "text-[#757575]"
                }`}
              >
                <Users className="w-[18px] h-[18px]" strokeWidth={1.75} />
              </button>

              <AnimatePresence>
                {isTeamPopoverOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 top-12 w-[290px] sm:w-[350px] bg-gradient-to-b from-white/95 via-white/90 to-white/80 dark:from-[#1c1c1f]/95 dark:via-[#1c1c1f]/90 dark:to-[#18181b]/80 backdrop-blur-[24px] border border-white/20 dark:border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden text-left"
                  >
                    <div className="flex flex-col h-[380px]">
                      {/* Header */}
                      <div className="p-4 pb-2 flex items-center justify-between">
                        <span className="font-extrabold text-[15px] text-foreground">
                          Team Members
                        </span>
                        <span className="text-[10px] bg-[#33A579]/10 text-[#33A579] px-2 py-0.5 rounded-full font-bold">
                          {teamMembers.filter((m) => m.status === "Online").length} Active Now
                        </span>
                      </div>

                      {/* Search Team */}
                      <div className="px-4 py-2 relative">
                        <Search className="w-3.5 h-3.5 absolute left-7 top-1/2 -translate-y-1/2 text-[#A8A8A8]" />
                        <input
                          type="text"
                          placeholder="Search members..."
                          value={teamSearchQuery}
                          onChange={(e) => setTeamSearchQuery(e.target.value)}
                          className="h-8 pl-8 pr-3 w-full rounded-xl bg-accent/40 text-[12px] placeholder:text-[#A8A8A8] focus:outline-none"
                        />
                      </div>

                      {/* Team List Area */}
                      <div className="flex-1 overflow-y-auto px-2 py-1">
                        {filteredTeam.map((m) => (
                          <div
                            key={m.id}
                            className="p-2 rounded-xl hover:bg-accent/30 transition-all flex items-start gap-3 relative group"
                          >
                            <div className="relative shrink-0">
                              <img
                                src={m.avatar}
                                alt={m.name}
                                referrerPolicy="no-referrer"
                                className="w-9 h-9 rounded-full object-cover border border-border"
                              />
                              <span
                                className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border border-white dark:border-[#1a1a1c] ${
                                  m.status === "Online"
                                    ? "bg-[#33A579]"
                                    : m.status === "In Meeting"
                                      ? "bg-[#F1C40F]"
                                      : m.status === "Focus Time"
                                        ? "bg-[#9B59B6]"
                                        : "bg-[#A8A8A8]"
                                }`}
                              />
                            </div>
                            <div className="flex-1 min-w-0 pr-14">
                              <span className="text-[12px] font-bold text-foreground block truncate">
                                {m.name}
                              </span>
                              <span className="text-[10px] text-muted-foreground block truncate font-medium">
                                {m.role} •{" "}
                                <span className="font-semibold text-accent-foreground">
                                  {m.pod}
                                </span>
                              </span>
                              <span className="text-[10px] text-muted-foreground block italic truncate mt-0.5 font-medium">
                                "{m.activity}"
                              </span>
                            </div>

                            {/* Nudge/Ping Button */}
                            <button
                              onClick={() => {
                                toast.success(`Sent nudge to ${m.name}!`);
                              }}
                              className="absolute right-2.5 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 px-2 py-1 bg-[#7000FF]/10 text-[#7000FF] hover:bg-[#7000FF] hover:text-white rounded-lg text-[10px] font-bold transition-all shadow-sm"
                            >
                              Nudge
                            </button>
                          </div>
                        ))}
                      </div>

                      {/* View Dedicated Team Directory */}
                      <div className="border-t border-[#E7E7EC] dark:border-[#323238] p-3 bg-slate-50/50 dark:bg-slate-900/10 flex items-center justify-center">
                        <button
                          onClick={() => {
                            setIsTeamPopoverOpen(false);
                            onOpenModal?.("team");
                          }}
                          className="w-full h-10 rounded-xl bg-[#111111] dark:bg-white text-white dark:text-[#111111] hover:opacity-90 font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-sm cursor-pointer"
                        >
                          <span>View Team Directory</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Notifications Button & Popover container */}
            <div className="relative">
              <button
                id="notif-bell-trigger"
                onClick={() => {
                  setIsNotifPopoverOpen(!isNotifPopoverOpen);
                  setIsProfilePopoverOpen(false);
                }}
                className={`h-10 w-10 rounded-[18px] bg-white dark:bg-[#242428] border border-[#E7E7EC] dark:border-[#323238] grid place-items-center hover:text-[#111111] dark:hover:text-white hover:border-[#A8A8A8] transition-all relative ${
                  isNotifPopoverOpen
                    ? "text-[#111111] dark:text-white border-[#A8A8A8]"
                    : "text-[#757575]"
                }`}
              >
                <Bell className="w-[18px] h-[18px]" strokeWidth={1.75} />
                {inboxUnreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-[#E4664F] text-white rounded-full flex items-center justify-center text-[9px] font-bold border border-white dark:border-[#242428]">
                    {inboxUnreadCount > 99 ? "99+" : inboxUnreadCount}
                  </span>
                )}
              </button>

              <AnimatePresence>
                {isNotifPopoverOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 top-12 w-[340px] sm:w-[385px] bg-gradient-to-b from-white/95 via-white/90 to-white/80 dark:from-[#1c1c1f]/95 dark:via-[#1c1c1f]/90 dark:to-[#18181b]/80 backdrop-blur-[24px] border border-white/20 dark:border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden text-left"
                  >
                    {/* Popover Header */}
                    <div className="p-4 pb-2 flex items-center justify-between text-left">
                      <span className="font-extrabold text-[15px] text-foreground">
                        Notifications
                      </span>
                      <button
                        onClick={handleMarkAllRead}
                        className="text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
                      >
                        Mark all as read
                      </button>
                    </div>

                    {/* Popover Tabs Header */}
                    <div className="flex items-center justify-between px-4 border-b border-border bg-slate-50/40 dark:bg-slate-900/10">
                      <div className="flex gap-4">
                        {/* Inbox Tab */}
                        <button
                          onClick={() => setSelectedNotifTab("inbox")}
                          className={`relative py-3.5 text-xs font-bold transition-all flex items-center gap-1.5 ${
                            selectedNotifTab === "inbox"
                              ? "text-foreground border-b-2 border-foreground dark:border-white"
                              : "text-muted-foreground hover:text-foreground"
                          }`}
                        >
                          <span>Inbox</span>
                          <span
                            className={`text-[10px] px-2 py-0.5 rounded-full font-bold transition-all ${
                              selectedNotifTab === "inbox"
                                ? "bg-[#111111] text-white dark:bg-white dark:text-[#111111]"
                                : "bg-muted text-muted-foreground"
                            }`}
                          >
                            {inboxUnreadCount}
                          </span>
                        </button>

                        {/* General Tab */}
                        <button
                          onClick={() => setSelectedNotifTab("general")}
                          className={`relative py-3.5 text-xs font-bold transition-all flex items-center gap-1.5 ${
                            selectedNotifTab === "general"
                              ? "text-foreground border-b-2 border-foreground dark:border-white"
                              : "text-muted-foreground hover:text-foreground"
                          }`}
                        >
                          <span>General</span>
                          <span className="text-[10px] px-2 py-0.5 border border-border rounded-full font-bold text-muted-foreground bg-muted/30">
                            {generalUnreadCount}
                          </span>
                        </button>

                        {/* Archived Tab */}
                        <button
                          onClick={() => setSelectedNotifTab("archived")}
                          className={`relative py-3.5 text-xs font-bold transition-all ${
                            selectedNotifTab === "archived"
                              ? "text-foreground border-b-2 border-foreground dark:border-white"
                              : "text-muted-foreground hover:text-foreground"
                          }`}
                        >
                          Archived
                        </button>
                      </div>

                      {/* Settings Cog */}
                      <Link
                        to="/settings"
                        onClick={() => setIsNotifPopoverOpen(false)}
                        className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent/40 transition-all"
                        title="Notification Settings"
                      >
                        <Settings className="w-4 h-4" />
                      </Link>
                    </div>

                    {/* Popover List */}
                    <div className="max-h-[350px] overflow-y-auto divide-y divide-border/60 scrollbar-thin">
                      {filteredNotifs.length === 0 ? (
                        <div className="p-8 text-center text-muted-foreground flex flex-col items-center">
                          <CheckCircle2 className="w-8 h-8 text-[#33A579] mb-2 opacity-60" />
                          <p className="text-xs font-semibold">No alerts in this folder</p>
                        </div>
                      ) : (
                        filteredNotifs.map((n) => (
                          <div
                            key={n.id}
                            onClick={() => handleNotifItemClick(n.id)}
                            className={`p-3.5 hover:bg-accent/40 transition-colors cursor-pointer text-left flex gap-3 relative ${
                              n.status === "unread" ? "bg-[#5A82E8]/5 dark:bg-[#5A82E8]/10" : ""
                            }`}
                          >
                            {/* Avatar with Presence dot */}
                            <div className="relative shrink-0 mt-0.5">
                              {n.senderAvatar ? (
                                <img
                                  src={n.senderAvatar}
                                  alt={n.senderName}
                                  className="w-10 h-10 rounded-full object-cover border border-border/80"
                                />
                              ) : (
                                <div className="w-10 h-10 rounded-full bg-[#5A82E8]/10 text-[#5A82E8] grid place-items-center text-xs font-extrabold font-mono border border-border">
                                  {n.senderName.slice(0, 2).toUpperCase()}
                                </div>
                              )}
                              {n.senderPresence !== "none" && (
                                <span
                                  className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-card ${
                                    n.senderPresence === "online"
                                      ? "bg-[#33A579]"
                                      : n.senderPresence === "busy"
                                        ? "bg-[#E4664F]"
                                        : "bg-[#F1C40F]"
                                  }`}
                                />
                              )}
                            </div>

                            {/* Content body */}
                            <div className="flex-1 min-w-0 pr-4">
                              <div className="text-[13px] text-foreground leading-normal font-normal">
                                <span className="font-bold text-foreground hover:underline mr-1">
                                  {n.senderName}
                                </span>
                                <span className="text-muted-foreground mr-1">{n.actionText}</span>
                                <span className="font-bold text-foreground hover:underline">
                                  {n.targetText}
                                </span>
                              </div>

                              <div className="text-[11px] text-muted-foreground mt-0.5 font-semibold flex items-center gap-1">
                                <span>{n.timeText}</span>
                                <span>•</span>
                                <span className="hover:underline cursor-pointer">
                                  {n.groupText}
                                </span>
                              </div>

                              {/* CTA Actions */}
                              {n.hasActions && (
                                <div
                                  className="flex items-center gap-2 mt-2"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <button
                                    onClick={() => {
                                      toast.error("Declined request");
                                      setPopoverNotifs(
                                        popoverNotifs.map((item) =>
                                          item.id === n.id ? { ...item, hasActions: false } : item,
                                        ),
                                      );
                                    }}
                                    className="px-3 py-1.5 bg-card hover:bg-accent border border-border text-xs font-bold rounded-xl transition-all"
                                  >
                                    Decline
                                  </button>
                                  <button
                                    onClick={() => {
                                      toast.success("Accepted request successfully!");
                                      setPopoverNotifs(
                                        popoverNotifs.map((item) =>
                                          item.id === n.id ? { ...item, hasActions: false } : item,
                                        ),
                                      );
                                    }}
                                    className="px-3.5 py-1.5 bg-[#7000FF] hover:bg-[#6000E0] text-white text-xs font-bold rounded-xl shadow-sm transition-all"
                                  >
                                    Accept
                                  </button>
                                </div>
                              )}

                              {/* Attachments */}
                              {n.attachmentName && (
                                <div
                                  className="flex items-center gap-1.5 mt-2 p-1.5 rounded-lg border border-border/80 bg-accent/20 hover:bg-accent/40 w-fit cursor-pointer transition-all"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    toast.success(`Downloading ${n.attachmentName}...`);
                                  }}
                                >
                                  <Paperclip className="w-3.5 h-3.5 text-muted-foreground" />
                                  <span className="text-xs font-semibold text-muted-foreground hover:text-foreground">
                                    {n.attachmentName}
                                  </span>
                                </div>
                              )}
                            </div>

                            {/* Unread black/white dot on the far right */}
                            {n.status === "unread" && (
                              <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center">
                                <span className="w-2 h-2 rounded-full bg-[#111111] dark:bg-white" />
                              </div>
                            )}
                          </div>
                        ))
                      )}
                    </div>

                    {/* Popover Footer with Action CTA */}
                    <div className="border-t border-[#E7E7EC] dark:border-[#323238] p-3 bg-slate-50/50 dark:bg-slate-900/10 flex items-center justify-center">
                      <button
                        onClick={() => {
                          setIsNotifPopoverOpen(false);
                          onOpenModal?.("notifications");
                        }}
                        className="w-full h-10 rounded-xl bg-[#111111] dark:bg-white text-white dark:text-[#111111] hover:opacity-90 font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-sm cursor-pointer"
                      >
                        <span>View Full Feed</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Profile Badge Button & Popover container */}
          <div className="relative">
            <button
              onClick={() => {
                setIsProfilePopoverOpen(!isProfilePopoverOpen);
                setIsNotifPopoverOpen(false);
                setIsStatusDropdownOpen(false);
              }}
              className={`h-10 w-10 rounded-[18px] bg-white dark:bg-[#242428] border border-[#E7E7EC] dark:border-[#323238] grid place-items-center hover:border-[#A8A8A8] transition-all relative ${
                isProfilePopoverOpen ? "border-[#A8A8A8]" : ""
              }`}
            >
              <div className="w-8 h-8 rounded-full bg-[#5A82E8]/10 text-[#5A82E8] grid place-items-center text-[12px] font-semibold font-mono relative">
                S
                <span
                  className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border border-white dark:border-[#242428] ${STATUS_DOT_COLORS[presenceStatus]}`}
                />
              </div>
            </button>

            <AnimatePresence>
              {isProfilePopoverOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 top-12 w-[320px] bg-gradient-to-b from-white/95 via-white/90 to-white/80 dark:from-[#1c1c1f]/95 dark:via-[#1c1c1f]/90 dark:to-[#18181b]/80 backdrop-blur-[24px] border border-white/20 dark:border-white/10 rounded-2xl shadow-2xl z-50 text-left overflow-visible"
                >
                  {/* Portrait Card Image */}
                  <div className="p-3 pb-0">
                    <div className="relative h-[240px] w-full overflow-hidden rounded-xl border border-border">
                      <img
                        src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=600"
                        alt="Sandy K."
                        className="w-full h-full object-cover"
                      />
                      {/* Floating Indicator */}
                      <div className="absolute top-3 right-3 px-2.5 py-1 bg-black/75 backdrop-blur-md rounded-full text-white text-[10px] font-bold flex items-center gap-1 border border-white/10">
                        <span
                          className={`w-2 h-2 rounded-full ${STATUS_DOT_COLORS[presenceStatus]}`}
                        />
                        <span>{presenceStatus}</span>
                      </div>
                    </div>
                  </div>

                  {/* Profile Body Info */}
                  <div className="p-5 pt-4 pb-6 text-left">
                    <div className="flex items-center gap-1.5">
                      <h4 className="text-xl font-extrabold text-foreground tracking-tight">
                        Sandy K.
                      </h4>
                      <span
                        className="w-4.5 h-4.5 rounded-full bg-[#10B981] flex items-center justify-center text-white shrink-0"
                        title="Verified Member"
                      >
                        <Check className="w-3 h-3 stroke-[3.5]" />
                      </span>
                    </div>

                    <p className="text-[12px] text-muted-foreground mt-1 leading-relaxed font-medium">
                      Lead Designer | Product Design Intern
                    </p>

                    <p className="text-[11px] font-bold text-muted-foreground mt-2">
                      Yadiba Media Team • POD-1
                    </p>

                    {/* Divider */}
                    <div className="my-4 border-t border-border/60" />

                    {/* Stats & Status Selector Row */}
                    <div className="flex items-center justify-between relative">
                      <div className="flex items-center gap-3">
                        <div
                          className="flex items-center gap-1 cursor-help"
                          title="138 Total Hours Logged"
                        >
                          <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                          <span className="text-[12px] font-extrabold text-foreground">138h</span>
                        </div>
                        <div
                          className="flex items-center gap-1 cursor-help"
                          title="12 Active Tasks"
                        >
                          <CheckSquare className="w-3.5 h-3.5 text-muted-foreground" />
                          <span className="text-[12px] font-extrabold text-foreground">12</span>
                        </div>
                        <div
                          className="flex items-center gap-1 cursor-help"
                          title="5 Projects Enrolled"
                        >
                          <Briefcase className="w-3.5 h-3.5 text-muted-foreground" />
                          <span className="text-[12px] font-extrabold text-foreground">5</span>
                        </div>
                      </div>

                      {/* Status Selector Dropdown */}
                      <div className="relative">
                        <button
                          onClick={() => setIsStatusDropdownOpen(!isStatusDropdownOpen)}
                          className="flex items-center gap-1.5 px-3 py-1 bg-surface dark:bg-[#242428] border border-border text-xs font-bold rounded-full hover:border-foreground/40 transition-all cursor-pointer shadow-sm text-foreground"
                        >
                          <span
                            className={`w-2 h-2 rounded-full ${STATUS_DOT_COLORS[presenceStatus]}`}
                          />
                          <span className="capitalize">{presenceStatus}</span>
                          <ChevronDown className="w-3 h-3 opacity-60" />
                        </button>

                        <AnimatePresence>
                          {isStatusDropdownOpen && (
                            <motion.div
                              initial={{ opacity: 0, scale: 0.95, y: -10 }}
                              animate={{ opacity: 1, scale: 1, y: 0 }}
                              exit={{ opacity: 0, scale: 0.95, y: -10 }}
                              className="absolute right-0 bottom-full mb-2 w-[220px] bg-white dark:bg-[#1c1c1f] border border-border rounded-xl shadow-2xl z-[60] py-1.5 p-1"
                            >
                              <div className="px-2.5 py-1 text-[10px] font-bold text-muted-foreground uppercase tracking-wider border-b border-border/50 mb-1">
                                Set active status
                              </div>
                              {[
                                {
                                  status: "Online",
                                  desc: "Available & working",
                                  color: "bg-[#33A579]",
                                },
                                {
                                  status: "Busy",
                                  desc: "DND • Mute alerts",
                                  color: "bg-[#E4664F]",
                                },
                                {
                                  status: "In Meeting",
                                  desc: "In a huddle call",
                                  color: "bg-[#F1C40F]",
                                },
                                {
                                  status: "Focus Time",
                                  desc: "Heads down mode",
                                  color: "bg-[#9B59B6]",
                                },
                                { status: "Away", desc: "Away from desk", color: "bg-[#A8A8A8]" },
                                {
                                  status: "Offline",
                                  desc: "Appear logged out",
                                  color: "bg-[#7F8C8D]",
                                },
                              ].map(({ status, desc, color }) => (
                                <button
                                  key={status}
                                  onClick={() => {
                                    handleStatusChange(status as any);
                                    setIsStatusDropdownOpen(false);
                                    toast.success(`Status updated to ${status}`);
                                  }}
                                  className={`w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex flex-col gap-0.5 cursor-pointer ${
                                    presenceStatus === status
                                      ? "bg-slate-50 dark:bg-slate-800/60"
                                      : ""
                                  }`}
                                >
                                  <div className="flex items-center justify-between w-full">
                                    <div className="flex items-center gap-2">
                                      <span className={`w-2 h-2 rounded-full ${color}`} />
                                      <span className="text-xs font-semibold text-foreground">
                                        {status}
                                      </span>
                                    </div>
                                    {presenceStatus === status && (
                                      <Check className="w-3 h-3 text-foreground" strokeWidth={3} />
                                    )}
                                  </div>
                                  <span className="text-[10px] text-muted-foreground pl-4">
                                    {desc}
                                  </span>
                                </button>
                              ))}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}

export function AppShell({
  children,
  breadcrumb,
  hideTopNav = false,
  searchQuery,
  setSearchQuery,
  onQuickAdd,
}: {
  children: ReactNode;
  breadcrumb?: string[];
  hideTopNav?: boolean;
  searchQuery?: string;
  setSearchQuery?: (val: string) => void;
  onQuickAdd?: () => void;
}) {
  const { isInsideModal } = useContext(ShellContext);

  const [activeModal, setActiveModal] = useState<"messages" | "team" | "notifications" | null>(
    null,
  );
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isNotificationDrawerOpen, setIsNotificationDrawerOpen] = useState(false);
  const [isUniversalQuickAddOpen, setIsUniversalQuickAddOpen] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskClient, setNewTaskClient] = useState("Internal");
  const [newTaskPriority, setNewTaskPriority] = useState<"HIGH" | "MEDIUM" | "LOW">("MEDIUM");
  const [newTaskHours, setNewTaskHours] = useState(1.5);

  const pathname = useRouterState({ select: (s) => s.location.pathname });

  const [unreadCount, setUnreadCount] = useState(
    notificationStore.getNotifications().filter((n) => n.status === "unread").length,
  );

  useEffect(() => {
    const unsubscribe = notificationStore.subscribe(() => {
      setUnreadCount(
        notificationStore.getNotifications().filter((n) => n.status === "unread").length,
      );
    });
    return unsubscribe;
  }, []);

  if (isInsideModal) {
    return <div className="w-full h-full overflow-y-auto pr-1">{children}</div>;
  }

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />

      {/* Mobile Drawer Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-black z-40 md:hidden"
            />
            {/* Drawer */}
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed left-0 top-0 bottom-0 w-[280px] bg-card border-r border-border z-50 p-6 flex flex-col md:hidden shadow-[var(--shadow-lg)]"
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-8">
                <Link
                  to="/home"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-2 text-lg font-bold tracking-tight text-foreground"
                >
                  <span className="w-8 h-8 rounded-full bg-foreground text-background grid place-items-center text-sm font-semibold">
                    L
                  </span>
                  <span>Loooped</span>
                </Link>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-8 h-8 rounded-full grid place-items-center bg-[#F4F4F7] dark:bg-[#242428] text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Navigation Items with Text Labels */}
              <nav className="flex-1 flex flex-col gap-1.5 overflow-y-auto pr-2">
                {nav.map((item) => {
                  const active = item.to === "/" ? pathname === "/" : pathname.startsWith(item.to);
                  const Icon = item.icon;
                  const isBell = item.label === "Notifications";
                  return (
                    <Link
                      key={item.to}
                      to={item.to}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`flex items-center justify-between px-4 h-11 rounded-2xl transition-colors ${
                        active
                          ? "bg-foreground text-background font-medium"
                          : "text-muted-foreground hover:bg-[#F4F4F7] dark:hover:bg-[#242428] hover:text-foreground"
                      }`}
                    >
                      <div className="flex items-center gap-3.5">
                        <Icon className="w-5 h-5" strokeWidth={1.75} />
                        <span className="text-[14px]">{item.label}</span>
                      </div>
                      {isBell && unreadCount > 0 && (
                        <span className="min-w-[18px] h-[18px] px-1 bg-[#E4664F] text-white rounded-full flex items-center justify-center text-[9px] font-bold">
                          {unreadCount > 99 ? "99+" : unreadCount}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </nav>

              {/* Bottom Theme Controls / Footer */}
              <div className="pt-4 border-t border-border mt-auto flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Appearance</span>
                <button
                  onClick={() => {
                    toast.info("Theme toggle requested");
                  }}
                  className="w-9 h-9 rounded-full grid place-items-center bg-[#F4F4F7] dark:bg-[#242428] text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
                >
                  <Sun className="w-[18px] h-[18px]" strokeWidth={1.75} />
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <main className="pl-4 pr-4 md:pl-[104px] md:pr-6 py-6 transition-all duration-300 max-w-[1440px] mx-auto w-full">
        {!hideTopNav && (
          <TopNav
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            onQuickAdd={onQuickAdd || (() => setIsUniversalQuickAddOpen(true))}
            onMenuToggle={() => setIsMobileMenuOpen(true)}
            onNotificationClick={() => setIsNotificationDrawerOpen(true)}
            unreadCount={unreadCount}
            onOpenModal={setActiveModal}
          />
        )}
        {children}
      </main>

      {/* Loooped Action Center Slide Drawer */}
      <NotificationDrawer
        isOpen={isNotificationDrawerOpen}
        onClose={() => setIsNotificationDrawerOpen(false)}
      />

      {/* Universal Quick Add Task Modal */}
      <AnimatePresence>
        {isUniversalQuickAddOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsUniversalQuickAddOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-xs"
            />

            {/* Modal Box */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-[#1c1c20] border border-[#E7E7EC] dark:border-[#323238] rounded-[28px] max-w-md w-full p-6 shadow-2xl z-50 relative space-y-5 text-left"
            >
              <div className="flex items-center justify-between border-b border-[#E7E7EC] dark:border-[#323238] pb-3">
                <h3 className="text-[17px] font-medium text-foreground flex items-center gap-2">
                  <span className="text-[#5A82E8]">＋</span> Create New Task
                </h3>
                <button
                  onClick={() => setIsUniversalQuickAddOpen(false)}
                  className="text-muted-foreground hover:text-foreground p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!newTaskTitle.trim()) {
                    toast.error("Please provide a task title");
                    return;
                  }
                  toast.success(`Task Created: ${newTaskTitle}`);
                  setNewTaskTitle("");
                  setIsUniversalQuickAddOpen(false);
                }}
                className="space-y-4"
              >
                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                    Task Title
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Design Pitch Deck"
                    value={newTaskTitle}
                    onChange={(e) => setNewTaskTitle(e.target.value)}
                    className="w-full h-10 px-3.5 border border-[#E7E7EC] dark:border-[#323238] rounded-xl text-[13px] bg-transparent focus:outline-none focus:ring-1 focus:ring-[#5A82E8]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                      Client
                    </label>
                    <select
                      value={newTaskClient}
                      onChange={(e) => setNewTaskClient(e.target.value)}
                      className="w-full h-10 px-2.5 border border-[#E7E7EC] dark:border-[#323238] rounded-xl text-[13px] bg-transparent dark:bg-slate-800 focus:outline-none focus:ring-1 focus:ring-[#5A82E8]"
                    >
                      <option value="Internal">Internal</option>
                      <option value="ThreadSense AI">ThreadSense AI</option>
                      <option value="Helix Health">Helix Health</option>
                      <option value="Meridian">Meridian</option>
                      <option value="Aurora Coffee">Aurora Coffee</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                      Priority
                    </label>
                    <select
                      value={newTaskPriority}
                      onChange={(e) => setNewTaskPriority(e.target.value as any)}
                      className="w-full h-10 px-2.5 border border-[#E7E7EC] dark:border-[#323238] rounded-xl text-[13px] bg-transparent dark:bg-slate-800 focus:outline-none focus:ring-1 focus:ring-[#5A82E8]"
                    >
                      <option value="HIGH">HIGH</option>
                      <option value="MEDIUM">MEDIUM</option>
                      <option value="LOW">LOW</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                    Assigned Hours (Capacity allocation)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    min="0.5"
                    max="12"
                    value={newTaskHours}
                    onChange={(e) => setNewTaskHours(parseFloat(e.target.value))}
                    className="w-full h-10 px-3.5 border border-[#E7E7EC] dark:border-[#323238] rounded-xl text-[13px] bg-transparent focus:outline-none focus:ring-1 focus:ring-[#5A82E8]"
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsUniversalQuickAddOpen(false)}
                    className="flex-1 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 text-foreground text-[13px] font-medium hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 h-10 rounded-xl bg-[#5A82E8] hover:bg-[#4a72d8] text-white text-[13px] font-medium transition-colors shadow-sm"
                  >
                    Add Task
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Full-Screen Premium Modal Popups for Messages, Team, and Notifications */}
      <AnimatePresence>
        {activeModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-8">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              exit={{ opacity: 0 }}
              onClick={() => setActiveModal(null)}
              className="fixed inset-0 bg-black backdrop-blur-md cursor-pointer"
            />

            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="bg-white dark:bg-[#1a1a1e] border border-white/20 dark:border-white/10 rounded-[28px] w-full max-w-5xl h-[80vh] shadow-2xl z-50 relative flex flex-col overflow-hidden"
            >
              {/* Modal Header */}
              <div className="px-6 py-4 border-b border-[#E7E7EC] dark:border-[#323238] flex items-center justify-between shrink-0 bg-slate-50/50 dark:bg-slate-900/10">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#111111] dark:bg-white animate-pulse" />
                  <h3 className="text-xs font-extrabold text-foreground uppercase tracking-wider">
                    {activeModal === "messages" && "Interactive Messenger"}
                    {activeModal === "team" && "Team Directory Workspace"}
                    {activeModal === "notifications" && "Notification Feed Center"}
                  </h3>
                </div>
                <button
                  onClick={() => setActiveModal(null)}
                  className="h-8 w-8 rounded-xl bg-accent hover:bg-accent/80 text-muted-foreground hover:text-foreground flex items-center justify-center transition-all cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="flex-1 overflow-hidden p-6">
                <ShellContext.Provider value={{ isInsideModal: true }}>
                  <Suspense
                    fallback={
                      <div className="h-full flex flex-col items-center justify-center space-y-3">
                        <div className="w-6 h-6 border-2 border-t-transparent border-[#111111] dark:border-white rounded-full animate-spin" />
                        <p className="text-xs font-semibold text-muted-foreground animate-pulse">
                          Initializing modular workspace view...
                        </p>
                      </div>
                    }
                  >
                    {activeModal === "messages" && <MessagesPage />}
                    {activeModal === "team" && <TeamPage />}
                    {activeModal === "notifications" && <NotificationsPage />}
                  </Suspense>
                </ShellContext.Provider>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function SectionTitle({ title, action }: { title: string; action?: ReactNode }) {
  return (
    <div className="flex items-center justify-between mb-4">
      <h2 className="text-[17px] font-medium tracking-tight">{title}</h2>
      {action}
    </div>
  );
}

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={`bg-gradient-to-br from-white/60 via-white/40 to-white/10 dark:from-[#162135]/45 dark:via-[#162135]/25 dark:to-[#162135]/10 backdrop-blur-[24px] border border-white/60 dark:border-[#2a384e]/30 rounded-[28px] shadow-[var(--shadow-soft)] ${className}`}
    >
      {children}
    </div>
  );
}

export function StatusPill({
  tone = "blue",
  children,
}: {
  tone?: "blue" | "green" | "yellow" | "orange" | "red" | "purple";
  children: ReactNode;
}) {
  const map = {
    blue: "bg-blue-50 text-blue-700 border border-blue-200/60 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20",
    green:
      "bg-emerald-50 text-emerald-700 border border-emerald-200/60 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20",
    yellow:
      "bg-amber-50 text-amber-700 border border-amber-200/60 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20",
    orange:
      "bg-orange-50 text-orange-700 border border-orange-200/60 dark:bg-orange-500/10 dark:text-orange-400 dark:border-orange-500/20",
    red: "bg-rose-50 text-rose-700 border border-rose-200/60 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20",
    purple:
      "bg-purple-50 text-purple-700 border border-purple-200/60 dark:bg-purple-500/10 dark:text-purple-400 dark:border-purple-500/20",
  } as const;
  return (
    <span
      className={`inline-flex items-center gap-1.5 h-6.5 px-3 rounded-full text-[11px] font-semibold uppercase tracking-wider ${map[tone]}`}
    >
      {children}
    </span>
  );
}
