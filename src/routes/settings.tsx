import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AppShell, Card, SectionTitle, StatusPill } from "@/components/app-shell";
import { signOutUser } from "@/lib/auth";
import {
  User,
  Bell,
  Shield,
  Users,
  Palette,
  KeyRound,
  ChevronRight,
  Check,
  ShieldAlert,
  Monitor,
  Sparkles,
  Trash2,
  Plus,
  Eye,
  Key,
  Smartphone,
  AlertCircle,
  LogOut,
  Activity,
  CheckCircle2,
  ExternalLink,
  Server,
  Radio,
  Bug,
  RefreshCw,
  Copy,
  Clock,
  Layers,
  Lock,
  Globe,
  Sliders,
  Send,
  UserCheck,
  Mail,
  Zap,
} from "lucide-react";
import * as Sentry from "@sentry/tanstackstart-react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";
import { BetterStackStatus } from "@/components/betterstack-status";

export const Route = createFileRoute("/settings")({
  component: SettingsPage,
});

interface GroupItem {
  id: string;
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  title: string;
  desc: string;
  badgeTone?: "blue" | "green" | "purple" | "orange" | "rose" | "indigo";
}

const groups: GroupItem[] = [
  {
    id: "Profile",
    icon: User,
    title: "Profile",
    desc: "Personal info, role, avatar and preferences",
    badgeTone: "blue",
  },
  {
    id: "Notifications",
    icon: Bell,
    title: "Notifications",
    desc: "Email, in-app channels and digest cadence",
    badgeTone: "orange",
  },
  {
    id: "Team & pods",
    icon: Users,
    title: "Team & pods",
    desc: "Members, allocations and pod workload",
    badgeTone: "green",
  },
  {
    id: "Permissions",
    icon: Shield,
    title: "Permissions",
    desc: "Role-based clearance and approval rules",
    badgeTone: "purple",
  },
  {
    id: "Appearance",
    icon: Palette,
    title: "Appearance",
    desc: "Canvas themes, density and sidebar layout",
    badgeTone: "rose",
  },
  {
    id: "Security",
    icon: KeyRound,
    title: "Security",
    desc: "Passwords, 2FA, API keys and sessions",
    badgeTone: "indigo",
  },
  {
    id: "Status",
    icon: Activity,
    title: "Status",
    desc: "Live infrastructure, uptime & telemetry",
    badgeTone: "green",
  },
];

interface PodMember {
  id: string;
  name: string;
  email: string;
  role: string;
  pod: string;
  avatar: string;
  status: "active" | "away" | "offline";
}

const INITIAL_MEMBERS: PodMember[] = [
  {
    id: "m-1",
    name: "Anna Rossi",
    email: "anna@loooped.studio",
    role: "Lead Producer",
    pod: "Pod Alpha (Design)",
    avatar:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
    status: "active",
  },
  {
    id: "m-2",
    name: "Marta Lin",
    email: "marta@loooped.studio",
    role: "Senior Art Director",
    pod: "Pod Alpha (Design)",
    avatar:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    status: "active",
  },
  {
    id: "m-3",
    name: "Ivan Petrov",
    email: "ivan@loooped.studio",
    role: "Lead Motion Designer",
    pod: "Pod Beta (Motion)",
    avatar:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    status: "active",
  },
  {
    id: "m-4",
    name: "Sara Davis",
    email: "sara@loooped.studio",
    role: "Brand Strategist",
    pod: "Pod Gamma (Brand)",
    avatar:
      "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80",
    status: "away",
  },
  {
    id: "m-5",
    name: "Lucas Vance",
    email: "lucas@loooped.studio",
    role: "Creative Developer",
    pod: "Pod Delta (Web)",
    avatar:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
    status: "active",
  },
];

function SettingsPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("Profile");

  // Profile State
  const [profileName, setProfileName] = useState(() => {
    return localStorage.getItem("looped_profile_name") || "Anna Rossi";
  });
  const [profileEmail, setProfileEmail] = useState(() => {
    return localStorage.getItem("looped_profile_email") || "anna@loooped.studio";
  });
  const [profileRole, setProfileRole] = useState("Lead Producer");
  const [profilePod, setProfilePod] = useState("Pod Alpha (Design)");
  const [profileTimezone, setProfileTimezone] = useState("Pacific Time (US & Canada) UTC-8");
  const [profileBio, setProfileBio] = useState(
    "Orchestrating design sprints, cross-pod allocations, and milestone handoffs.",
  );

  // Notifications State
  const [notifApprovals, setNotifApprovals] = useState(true);
  const [notifClient, setNotifClient] = useState(true);
  const [notifCapacity, setNotifCapacity] = useState(true);
  const [notifWeekly, setNotifWeekly] = useState(false);
  const [notifSlack, setNotifSlack] = useState(true);
  const [notifPush, setNotifPush] = useState(true);
  const [notifSound, setNotifSound] = useState(false);
  const [digestFrequency, setDigestFrequency] = useState("Weekly");

  // Appearance State
  const [selectedTheme, setSelectedTheme] = useState(() => {
    if (typeof document !== "undefined") {
      return document.documentElement.classList.contains("dark") ? "charcoal" : "light";
    }
    return "light";
  });
  const [selectedDensity, setSelectedDensity] = useState("spacious");
  const [sidebarExpanded, setSidebarExpanded] = useState("expanded");
  const [accentColor, setAccentColor] = useState("blue");

  // Security State
  const [currentPass, setCurrentPass] = useState("");
  const [newPass, setNewPass] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(true);
  const [apiKeys, setApiKeys] = useState([
    {
      id: "key-1",
      name: "Live Client Portal Integration",
      prefix: "LOOOPED_LIVE_1s9f3a8b29c...",
      created: "July 02, 2026",
      scope: "read:approvals, write:comments",
    },
    {
      id: "key-2",
      name: "Automated Figma Sync Webhook",
      prefix: "LOOOPED_DEV_29ka8100ff1...",
      created: "June 14, 2026",
      scope: "read:files, write:deliverables",
    },
  ]);
  const [newKeyName, setNewKeyName] = useState("");
  const [newKeyScope, setNewKeyScope] = useState("read_write");

  // Permissions State
  const [selectedRoleGroup, setSelectedRoleGroup] = useState("Manager");
  const [permApprovals, setPermApprovals] = useState(true);
  const [permInvite, setPermInvite] = useState(true);
  const [permClientFolders, setPermClientFolders] = useState(true);
  const [permEditBudgets, setPermEditBudgets] = useState(false);
  const [permAccessBilling, setPermAccessBilling] = useState(false);
  const [permExportAudit, setPermExportAudit] = useState(true);

  // Team & Pods State
  const [members, setMembers] = useState<PodMember[]>(INITIAL_MEMBERS);
  const [searchMember, setSearchMember] = useState("");
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [inviteName, setInviteName] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("Designer");
  const [invitePod, setInvitePod] = useState("Pod Alpha (Design)");

  // Handle Profile Save
  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem("looped_profile_name", profileName);
    localStorage.setItem("looped_profile_email", profileEmail);
    toast.success("Profile preferences saved successfully.");
  };

  // Handle Security Password Save
  const handleSaveSecurity = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPass) {
      toast.error("Please enter your current password to authorize security updates.");
      return;
    }
    if (newPass.length < 8) {
      toast.error("New password must be at least 8 characters long.");
      return;
    }
    if (newPass !== confirmPass) {
      toast.error("New password and confirmation do not match.");
      return;
    }
    toast.success("Password successfully changed.");
    setCurrentPass("");
    setNewPass("");
    setConfirmPass("");
  };

  // Handle API Key Creation
  const handleCreateApiKey = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKeyName.trim()) {
      toast.error("Please specify a name for the API Token.");
      return;
    }
    const randomHex = Array.from({ length: 16 }, () =>
      Math.floor(Math.random() * 16).toString(16),
    ).join("");
    const newKey = {
      id: `key-${Date.now()}`,
      name: newKeyName.trim(),
      prefix: `LOOOPED_LIVE_${randomHex}...`,
      created: "Today",
      scope: newKeyScope === "read_write" ? "read:all, write:all" : "read:all",
    };
    setApiKeys([newKey, ...apiKeys]);
    setNewKeyName("");
    toast.success(`API Token "${newKey.name}" generated successfully.`);
  };

  const handleDeleteApiKey = (id: string, name: string) => {
    setApiKeys(apiKeys.filter((k) => k.id !== id));
    toast.info(`API Token "${name}" revoked.`);
  };

  const handleCopyKey = (prefix: string) => {
    navigator.clipboard?.writeText(prefix);
    toast.success("Token copied to clipboard");
  };

  // Handle Add Team Member
  const handleInviteMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteName.trim() || !inviteEmail.trim()) {
      toast.error("Please provide both name and email.");
      return;
    }
    const newM: PodMember = {
      id: `m-${Date.now()}`,
      name: inviteName.trim(),
      email: inviteEmail.trim(),
      role: inviteRole,
      pod: invitePod,
      avatar: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80`,
      status: "active",
    };
    setMembers([newM, ...members]);
    setIsInviteModalOpen(false);
    setInviteName("");
    setInviteEmail("");
    toast.success(`Invited ${newM.name} to ${newM.pod}`);
  };

  // Send Test Notification
  const handleSendTestNotification = () => {
    toast.info("Test Notification: New Approval Ready", {
      description: "Q4 Brand Campaign v2 submitted by Pod Alpha",
      action: {
        label: "View",
        onClick: () => navigate({ to: "/approvals" }),
      },
    });
  };

  const filteredMembers = members.filter(
    (m) =>
      m.name.toLowerCase().includes(searchMember.toLowerCase()) ||
      m.role.toLowerCase().includes(searchMember.toLowerCase()) ||
      m.pod.toLowerCase().includes(searchMember.toLowerCase()),
  );

  return (
    <AppShell breadcrumb={["Workspace", "Settings"]}>
      {/* Page Header */}
      <div className="mb-6 pb-2 border-b border-border/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-[28px] font-bold tracking-tight text-foreground">
              Settings & Preferences
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-surface border border-border text-muted-foreground">
              v2.4
            </span>
          </div>
          <p className="text-[13px] text-muted-foreground mt-1">
            Manage your personal profile, notifications, pod allocations, role permissions, and
            system security
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab("Status")}
            className="h-8 px-3 rounded-xl bg-surface hover:bg-muted border border-border text-xs font-semibold text-foreground flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Systems Online</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Sidebar Tabs + Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-[270px_1fr] gap-6 items-start">
        {/* Navigation Sidebar */}
        <Card className="p-2 sm:p-2.5 sticky top-20 border border-border bg-card shadow-xs rounded-2xl">
          <div className="flex lg:flex-col gap-1 overflow-x-auto lg:overflow-visible pb-1 lg:pb-0">
            {groups.map((g) => {
              const Icon = g.icon;
              const isActive = activeTab === g.title;
              return (
                <button
                  key={g.title}
                  type="button"
                  onClick={() => setActiveTab(g.title)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all cursor-pointer shrink-0 lg:shrink ${
                    isActive
                      ? "bg-foreground text-background font-semibold shadow-xs"
                      : "hover:bg-surface text-muted-foreground hover:text-foreground font-medium"
                  }`}
                >
                  <div
                    className={`w-7 h-7 rounded-lg grid place-items-center shrink-0 transition-colors ${
                      isActive
                        ? "bg-background/20 text-background"
                        : "bg-surface text-foreground/80 border border-border/40"
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" strokeWidth={isActive ? 2.4 : 1.8} />
                  </div>
                  <div className="flex-1 min-w-0 pr-1">
                    <span className="text-[13px] block truncate leading-tight">{g.title}</span>
                  </div>
                  <ChevronRight
                    className={`w-3.5 h-3.5 hidden lg:inline-block shrink-0 ${
                      isActive ? "text-background opacity-90" : "text-subtle opacity-50"
                    }`}
                  />
                </button>
              );
            })}
          </div>

          {/* Quick Sign Out Action */}
          <div className="mt-3 pt-3 border-t border-border/60 hidden lg:block px-1">
            <button
              type="button"
              onClick={() => signOutUser(navigate)}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </Card>

        {/* Content Area */}
        <div className="space-y-6 min-w-0">
          <AnimatePresence mode="wait">
            {/* ================= 1. PROFILE TAB ================= */}
            {activeTab === "Profile" && (
              <motion.div
                key="profile"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.15 }}
                className="space-y-6"
              >
                {/* Profile Information Card */}
                <Card className="p-6 sm:p-7 border border-border bg-card rounded-2xl">
                  <div className="flex items-center gap-2.5 mb-1">
                    <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 grid place-items-center shrink-0">
                      <User className="w-4 h-4" />
                    </div>
                    <div>
                      <h2 className="text-[17px] font-bold text-foreground">Profile Information</h2>
                      <p className="text-xs text-muted-foreground">
                        Personal identity, workspace handle, and contact details
                      </p>
                    </div>
                  </div>

                  {/* Avatar & Hero Row */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 mt-5 rounded-2xl bg-surface/50 border border-border/60">
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <img
                          src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80"
                          alt="Avatar"
                          className="w-16 h-16 rounded-2xl object-cover ring-2 ring-border"
                        />
                        <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 ring-2 ring-card" />
                      </div>
                      <div>
                        <div className="text-[16px] font-bold text-foreground">{profileName}</div>
                        <div className="text-xs text-muted-foreground mt-0.5">
                          {profileRole} • {profilePod}
                        </div>
                        <div className="text-[11px] text-muted-foreground/80 mt-1 font-mono">
                          {profileEmail}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => toast.success("Photo upload dialog opened")}
                        className="h-8 px-3 rounded-xl bg-surface hover:bg-muted border border-border text-xs font-semibold text-foreground transition-colors cursor-pointer"
                      >
                        Change Photo
                      </button>
                    </div>
                  </div>

                  {/* Form */}
                  <form onSubmit={handleSaveProfile} className="mt-6 space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-[11.5px] font-semibold text-foreground/80 block mb-1.5">
                          Full Name
                        </label>
                        <input
                          type="text"
                          value={profileName}
                          onChange={(e) => setProfileName(e.target.value)}
                          className="w-full h-10 px-3.5 bg-surface/40 border border-border rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-foreground/20 text-foreground"
                        />
                      </div>
                      <div>
                        <label className="text-[11.5px] font-semibold text-foreground/80 block mb-1.5">
                          Work Email
                        </label>
                        <input
                          type="email"
                          value={profileEmail}
                          onChange={(e) => setProfileEmail(e.target.value)}
                          className="w-full h-10 px-3.5 bg-surface/40 border border-border rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-foreground/20 text-foreground"
                        />
                      </div>
                      <div>
                        <label className="text-[11.5px] font-semibold text-foreground/80 block mb-1.5">
                          Assigned Role
                        </label>
                        <input
                          type="text"
                          value={profileRole}
                          onChange={(e) => setProfileRole(e.target.value)}
                          className="w-full h-10 px-3.5 bg-surface/40 border border-border rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-foreground/20 text-foreground"
                        />
                      </div>
                      <div>
                        <label className="text-[11.5px] font-semibold text-foreground/80 block mb-1.5">
                          Primary Pod
                        </label>
                        <select
                          value={profilePod}
                          onChange={(e) => setProfilePod(e.target.value)}
                          className="w-full h-10 px-3 bg-surface/40 border border-border rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-foreground/20 text-foreground cursor-pointer"
                        >
                          <option value="Pod Alpha (Design)">Pod Alpha (Design)</option>
                          <option value="Pod Beta (Motion)">Pod Beta (Motion)</option>
                          <option value="Pod Gamma (Brand)">Pod Gamma (Brand)</option>
                          <option value="Pod Delta (Web)">Pod Delta (Web)</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="text-[11.5px] font-semibold text-foreground/80 block mb-1.5">
                        Timezone
                      </label>
                      <input
                        type="text"
                        value={profileTimezone}
                        onChange={(e) => setProfileTimezone(e.target.value)}
                        className="w-full h-10 px-3.5 bg-surface/40 border border-border rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-foreground/20 text-foreground"
                      />
                    </div>

                    <div>
                      <label className="text-[11.5px] font-semibold text-foreground/80 block mb-1.5">
                        Bio / Focus Note
                      </label>
                      <textarea
                        rows={2}
                        value={profileBio}
                        onChange={(e) => setProfileBio(e.target.value)}
                        className="w-full p-3 bg-surface/40 border border-border rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-foreground/20 text-foreground resize-none"
                      />
                    </div>

                    <div className="flex justify-end pt-2">
                      <button
                        type="submit"
                        className="h-9 px-5 rounded-xl bg-foreground text-background font-semibold text-xs hover:opacity-90 transition-opacity cursor-pointer shadow-xs"
                      >
                        Save Profile Preferences
                      </button>
                    </div>
                  </form>
                </Card>

                {/* Session & Sign Out Card */}
                <Card className="p-6 border border-border bg-card rounded-2xl">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h3 className="text-sm font-bold text-foreground">
                        Workspace Account Session
                      </h3>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Authenticated as{" "}
                        <span className="font-medium text-foreground">{profileEmail}</span>. Sign
                        out anytime to return to login.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => signOutUser(navigate)}
                      className="h-9 px-4 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer w-fit"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign Out of Loooped</span>
                    </button>
                  </div>
                </Card>
              </motion.div>
            )}

            {/* ================= 2. NOTIFICATIONS TAB ================= */}
            {activeTab === "Notifications" && (
              <motion.div
                key="notifications"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.15 }}
                className="space-y-6"
              >
                <Card className="p-6 sm:p-7 border border-border bg-card rounded-2xl">
                  <div className="flex items-center justify-between gap-3 mb-4">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 grid place-items-center shrink-0">
                        <Bell className="w-4 h-4" />
                      </div>
                      <div>
                        <h2 className="text-[17px] font-bold text-foreground">
                          Notification Channels
                        </h2>
                        <p className="text-xs text-muted-foreground">
                          Configure event delivery across browser, email, and synchronized tools
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleSendTestNotification}
                      className="h-8 px-3 rounded-xl bg-surface hover:bg-muted border border-border text-xs font-semibold text-foreground flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Send className="w-3 h-3 text-amber-500" />
                      <span>Send Test Alert</span>
                    </button>
                  </div>

                  <div className="divide-y divide-border/60">
                    {[
                      {
                        label: "Approvals waiting review",
                        desc: "Instant ping when deliverables are submitted by your team or clients",
                        value: notifApprovals,
                        toggle: () => setNotifApprovals(!notifApprovals),
                      },
                      {
                        label: "Client comments & responses",
                        desc: "Direct messages and threaded remarks from authorized external guests",
                        value: notifClient,
                        toggle: () => setNotifClient(!notifClient),
                      },
                      {
                        label: "Pod capacity warnings",
                        desc: "Alert when pod allocation hits or exceeds 85% weekly threshold",
                        value: notifCapacity,
                        toggle: () => setNotifCapacity(!notifCapacity),
                      },
                      {
                        label: "Slack channel integration",
                        desc: "Post deliverable status changes directly into #creative-ops",
                        value: notifSlack,
                        toggle: () => setNotifSlack(!notifSlack),
                      },
                      {
                        label: "Browser desktop push alerts",
                        desc: "Send native desktop notifications when tab is in background",
                        value: notifPush,
                        toggle: () => setNotifPush(!notifPush),
                      },
                      {
                        label: "Audio notification chimes",
                        desc: "Play subtle acoustic chime on urgent mentions and incoming calls",
                        value: notifSound,
                        toggle: () => setNotifSound(!notifSound),
                      },
                    ].map((item) => (
                      <div
                        key={item.label}
                        className="py-3.5 first:pt-2 last:pb-1 flex items-center justify-between gap-4"
                      >
                        <div className="pr-2">
                          <p className="text-[13.5px] font-semibold text-foreground">
                            {item.label}
                          </p>
                          <p className="text-xs text-muted-foreground mt-0.5">{item.desc}</p>
                        </div>
                        <button
                          type="button"
                          onClick={item.toggle}
                          className={`w-11 h-6 rounded-full p-0.5 transition-colors cursor-pointer shrink-0 ${
                            item.value ? "bg-foreground" : "bg-muted-foreground/30"
                          }`}
                        >
                          <span
                            className={`block w-5 h-5 rounded-full bg-background shadow-xs transition-transform duration-200 ${
                              item.value ? "translate-x-5" : "translate-x-0"
                            }`}
                          />
                        </button>
                      </div>
                    ))}
                  </div>
                </Card>

                {/* Digest Cadence Card */}
                <Card className="p-6 border border-border bg-card rounded-2xl">
                  <h3 className="text-sm font-bold text-foreground">Digest Briefing Cadence</h3>
                  <p className="text-xs text-muted-foreground mt-0.5 mb-4">
                    Choose how often you receive analytical summaries and milestone recaps
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {[
                      {
                        id: "Instant",
                        title: "Real-Time",
                        desc: "Dispatched immediately as events occur across all pods",
                      },
                      {
                        id: "Daily",
                        title: "Daily Digest",
                        desc: "Consolidated morning briefing at 9:00 AM local time",
                      },
                      {
                        id: "Weekly",
                        title: "Weekly Review",
                        desc: "Executive breakdown every Monday morning at 8:30 AM",
                      },
                    ].map((cad) => {
                      const isSel = digestFrequency === cad.id;
                      return (
                        <button
                          key={cad.id}
                          type="button"
                          onClick={() => {
                            setDigestFrequency(cad.id);
                            toast.success(`Digest cadence adjusted to ${cad.title}`);
                          }}
                          className={`p-4 rounded-xl text-left border transition-all cursor-pointer relative ${
                            isSel
                              ? "bg-foreground/5 border-foreground ring-1 ring-foreground"
                              : "bg-surface/30 border-border hover:border-foreground/30"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-foreground">{cad.title}</span>
                            {isSel && <CheckCircle2 className="w-4 h-4 text-foreground shrink-0" />}
                          </div>
                          <p className="text-[11px] text-muted-foreground mt-1.5 leading-relaxed">
                            {cad.desc}
                          </p>
                        </button>
                      );
                    })}
                  </div>
                </Card>
              </motion.div>
            )}

            {/* ================= 3. TEAM & PODS TAB ================= */}
            {activeTab === "Team & pods" && (
              <motion.div
                key="team"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.15 }}
                className="space-y-6"
              >
                {/* Pod Capacity Overview */}
                <Card className="p-6 sm:p-7 border border-border bg-card rounded-2xl">
                  <div className="flex items-center justify-between gap-3 mb-4">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 grid place-items-center shrink-0">
                        <Users className="w-4 h-4" />
                      </div>
                      <div>
                        <h2 className="text-[17px] font-bold text-foreground">
                          Creative Pod Allocations
                        </h2>
                        <p className="text-xs text-muted-foreground">
                          Live capacity usage and project distribution across design squads
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setIsInviteModalOpen(true)}
                      className="h-8 px-3 rounded-xl bg-foreground text-background text-xs font-semibold flex items-center gap-1.5 hover:opacity-90 transition-opacity cursor-pointer shadow-xs"
                    >
                      <Plus className="w-3.5 h-3.5" strokeWidth={2.5} />
                      <span>Allocate Member</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mt-2">
                    {[
                      {
                        name: "Pod Alpha (Design)",
                        projects: "Q4 Rebrand, Helix Landing",
                        usage: 78,
                        color: "bg-blue-500",
                        lead: "Marta Lin",
                      },
                      {
                        name: "Pod Beta (Motion)",
                        projects: "Kite Motors Film v3",
                        usage: 64,
                        color: "bg-purple-500",
                        lead: "Ivan Petrov",
                      },
                      {
                        name: "Pod Gamma (Brand)",
                        projects: "Meridian Print, Loop FM",
                        usage: 89,
                        color: "bg-rose-500",
                        lead: "Sara Davis",
                      },
                      {
                        name: "Pod Delta (Web)",
                        projects: "Aurora E-commerce Handoff",
                        usage: 52,
                        color: "bg-emerald-500",
                        lead: "Lucas Vance",
                      },
                    ].map((pod) => (
                      <div
                        key={pod.name}
                        className="p-4 rounded-xl border border-border bg-surface/40 space-y-2.5"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-foreground">{pod.name}</span>
                          <span
                            className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                              pod.usage > 85
                                ? "bg-rose-500/10 text-rose-600"
                                : "bg-emerald-500/10 text-emerald-600"
                            }`}
                          >
                            {pod.usage}% Capacity
                          </span>
                        </div>
                        <div className="h-2 rounded-full bg-muted overflow-hidden">
                          <div
                            className={`h-full rounded-full ${pod.color} transition-all duration-500`}
                            style={{ width: `${pod.usage}%` }}
                          />
                        </div>
                        <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-0.5">
                          <span className="truncate max-w-[170px]">{pod.projects}</span>
                          <span className="font-medium">Lead: {pod.lead}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>

                {/* Team Members Directory */}
                <Card className="p-6 border border-border bg-card rounded-2xl">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                    <div>
                      <h3 className="text-sm font-bold text-foreground">
                        Workspace Members ({members.length})
                      </h3>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Active talent assigned to workspaces, reviews, and pod sprints
                      </p>
                    </div>

                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Filter member or pod..."
                        value={searchMember}
                        onChange={(e) => setSearchMember(e.target.value)}
                        className="h-8 px-3 text-xs bg-surface border border-border rounded-xl w-48 text-foreground focus:outline-none focus:ring-1 focus:ring-foreground"
                      />
                    </div>
                  </div>

                  <div className="divide-y divide-border/60">
                    {filteredMembers.map((m) => (
                      <div
                        key={m.id}
                        className="py-3 first:pt-1 last:pb-1 flex items-center justify-between gap-3"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="relative shrink-0">
                            <img
                              src={m.avatar}
                              alt={m.name}
                              className="w-9 h-9 rounded-full object-cover"
                            />
                            <span
                              className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full ring-2 ring-card ${
                                m.status === "active" ? "bg-emerald-500" : "bg-amber-500"
                              }`}
                            />
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-foreground truncate">
                                {m.name}
                              </span>
                              <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-surface border border-border text-muted-foreground">
                                {m.role}
                              </span>
                            </div>
                            <span className="text-[11px] text-muted-foreground truncate block">
                              {m.email} •{" "}
                              <strong className="font-medium text-foreground/80">{m.pod}</strong>
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            type="button"
                            onClick={() => {
                              const newPod =
                                m.pod === "Pod Alpha (Design)"
                                  ? "Pod Beta (Motion)"
                                  : "Pod Alpha (Design)";
                              setMembers(
                                members.map((mem) =>
                                  mem.id === m.id ? { ...mem, pod: newPod } : mem,
                                ),
                              );
                              toast.success(`Reallocated ${m.name} to ${newPod}`);
                            }}
                            className="h-7 px-2.5 rounded-lg bg-surface hover:bg-muted border border-border text-[11px] font-medium text-foreground transition-colors cursor-pointer"
                          >
                            Reassign Pod
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>

                {/* Inline Invite Modal */}
                {isInviteModalOpen && (
                  <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
                    <div className="bg-card border border-border rounded-2xl p-6 max-w-md w-full shadow-xl space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-bold text-foreground">Allocate Team Member</h3>
                        <button
                          type="button"
                          onClick={() => setIsInviteModalOpen(false)}
                          className="text-xs text-muted-foreground hover:text-foreground cursor-pointer"
                        >
                          ✕
                        </button>
                      </div>

                      <form onSubmit={handleInviteMember} className="space-y-3">
                        <div>
                          <label className="text-[11px] font-semibold text-foreground/80 block mb-1">
                            Full Name
                          </label>
                          <input
                            required
                            type="text"
                            placeholder="e.g. Jordan Hayes"
                            value={inviteName}
                            onChange={(e) => setInviteName(e.target.value)}
                            className="w-full h-9 px-3 bg-surface border border-border rounded-xl text-xs text-foreground focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="text-[11px] font-semibold text-foreground/80 block mb-1">
                            Email Address
                          </label>
                          <input
                            required
                            type="email"
                            placeholder="jordan@loooped.studio"
                            value={inviteEmail}
                            onChange={(e) => setInviteEmail(e.target.value)}
                            className="w-full h-9 px-3 bg-surface border border-border rounded-xl text-xs text-foreground focus:outline-none"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="text-[11px] font-semibold text-foreground/80 block mb-1">
                              Role
                            </label>
                            <input
                              type="text"
                              value={inviteRole}
                              onChange={(e) => setInviteRole(e.target.value)}
                              className="w-full h-9 px-3 bg-surface border border-border rounded-xl text-xs text-foreground focus:outline-none"
                            />
                          </div>
                          <div>
                            <label className="text-[11px] font-semibold text-foreground/80 block mb-1">
                              Assign Pod
                            </label>
                            <select
                              value={invitePod}
                              onChange={(e) => setInvitePod(e.target.value)}
                              className="w-full h-9 px-2 bg-surface border border-border rounded-xl text-xs text-foreground cursor-pointer focus:outline-none"
                            >
                              <option value="Pod Alpha (Design)">Pod Alpha (Design)</option>
                              <option value="Pod Beta (Motion)">Pod Beta (Motion)</option>
                              <option value="Pod Gamma (Brand)">Pod Gamma (Brand)</option>
                              <option value="Pod Delta (Web)">Pod Delta (Web)</option>
                            </select>
                          </div>
                        </div>

                        <div className="flex justify-end gap-2 pt-2">
                          <button
                            type="button"
                            onClick={() => setIsInviteModalOpen(false)}
                            className="h-8 px-3 rounded-xl bg-surface border border-border text-xs text-muted-foreground hover:text-foreground cursor-pointer"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            className="h-8 px-4 rounded-xl bg-foreground text-background text-xs font-semibold hover:opacity-90 cursor-pointer shadow-xs"
                          >
                            Add to Pod
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {/* ================= 4. PERMISSIONS TAB ================= */}
            {activeTab === "Permissions" && (
              <motion.div
                key="permissions"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.15 }}
                className="space-y-6"
              >
                <Card className="p-6 sm:p-7 border border-border bg-card rounded-2xl">
                  <div className="flex items-center gap-2.5 mb-4">
                    <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 grid place-items-center shrink-0">
                      <Shield className="w-4 h-4" />
                    </div>
                    <div>
                      <h2 className="text-[17px] font-bold text-foreground">
                        Role Permissions Profile
                      </h2>
                      <p className="text-xs text-muted-foreground">
                        Configure authorization matrices, client folder clearances, and budget
                        visibility
                      </p>
                    </div>
                  </div>

                  {/* Role Selector Tabs */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-6">
                    {["Viewer", "Designer", "Manager", "Admin"].map((role) => {
                      const isSel = selectedRoleGroup === role;
                      return (
                        <button
                          key={role}
                          type="button"
                          onClick={() => {
                            setSelectedRoleGroup(role);
                            if (role === "Admin") {
                              setPermApprovals(true);
                              setPermInvite(true);
                              setPermClientFolders(true);
                              setPermEditBudgets(true);
                              setPermAccessBilling(true);
                              setPermExportAudit(true);
                            } else if (role === "Manager") {
                              setPermApprovals(true);
                              setPermInvite(true);
                              setPermClientFolders(true);
                              setPermEditBudgets(false);
                              setPermAccessBilling(false);
                              setPermExportAudit(true);
                            } else if (role === "Designer") {
                              setPermApprovals(false);
                              setPermInvite(false);
                              setPermClientFolders(true);
                              setPermEditBudgets(false);
                              setPermAccessBilling(false);
                              setPermExportAudit(false);
                            } else {
                              setPermApprovals(false);
                              setPermInvite(false);
                              setPermClientFolders(false);
                              setPermEditBudgets(false);
                              setPermAccessBilling(false);
                              setPermExportAudit(false);
                            }
                            toast.success(`Clearance matrix adjusted for: ${role}`);
                          }}
                          className={`py-2 px-3 rounded-xl text-center border text-xs font-bold transition-all cursor-pointer ${
                            isSel
                              ? "bg-foreground text-background border-foreground shadow-xs"
                              : "border-border hover:border-foreground/30 bg-surface/30 text-muted-foreground hover:text-foreground"
                          }`}
                        >
                          {role}
                        </button>
                      );
                    })}
                  </div>

                  <div className="divide-y divide-border/60">
                    {[
                      {
                        label: "Authorize & Review Approvals",
                        desc: "Approve or reject client milestones, time logs, and delivered file bundles",
                        val: permApprovals,
                        toggle: () => setPermApprovals(!permApprovals),
                      },
                      {
                        label: "Workspace Member Invitations",
                        desc: "Add external collaborators or internal team members to workspaces",
                        val: permInvite,
                        toggle: () => setPermInvite(!permInvite),
                      },
                      {
                        label: "Client Folder Management",
                        desc: "Create, archive, and update dedicated client brand asset portals",
                        val: permClientFolders,
                        toggle: () => setPermClientFolders(!permClientFolders),
                      },
                      {
                        label: "Budget & Rate Card Editing",
                        desc: "Modify allocated contract values, hourly rate tiers, and project caps",
                        val: permEditBudgets,
                        toggle: () => setPermEditBudgets(!permEditBudgets),
                      },
                      {
                        label: "Access Invoicing & Billing Feeds",
                        desc: "View financial logs, export revenue statements, and stripe payment status",
                        val: permAccessBilling,
                        toggle: () => setPermAccessBilling(!permAccessBilling),
                      },
                      {
                        label: "Export Audit Logs & Error Telemetry",
                        desc: "Download activity logs, error reports, and Sentry session replays",
                        val: permExportAudit,
                        toggle: () => setPermExportAudit(!permExportAudit),
                      },
                    ].map((p) => (
                      <div
                        key={p.label}
                        className="py-3.5 first:pt-2 last:pb-1 flex items-center justify-between gap-4"
                      >
                        <div className="pr-2">
                          <p className="text-[13.5px] font-semibold text-foreground">{p.label}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">{p.desc}</p>
                        </div>
                        <button
                          type="button"
                          onClick={p.toggle}
                          className={`w-11 h-6 rounded-full p-0.5 transition-colors cursor-pointer shrink-0 ${
                            p.val ? "bg-foreground" : "bg-muted-foreground/30"
                          }`}
                        >
                          <span
                            className={`block w-5 h-5 rounded-full bg-background shadow-xs transition-transform duration-200 ${
                              p.val ? "translate-x-5" : "translate-x-0"
                            }`}
                          />
                        </button>
                      </div>
                    ))}
                  </div>
                </Card>
              </motion.div>
            )}

            {/* ================= 5. APPEARANCE TAB ================= */}
            {activeTab === "Appearance" && (
              <motion.div
                key="appearance"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.15 }}
                className="space-y-6"
              >
                <Card className="p-6 sm:p-7 border border-border bg-card rounded-2xl">
                  <div className="flex items-center gap-2.5 mb-4">
                    <div className="w-8 h-8 rounded-xl bg-pink-500/10 text-pink-600 dark:text-pink-400 grid place-items-center shrink-0">
                      <Palette className="w-4 h-4" />
                    </div>
                    <div>
                      <h2 className="text-[17px] font-bold text-foreground">
                        Canvas & Color Theme
                      </h2>
                      <p className="text-xs text-muted-foreground">
                        Customize visual contrast, typography density, and workspace aesthetics
                      </p>
                    </div>
                  </div>

                  {/* Theme Selector */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                    {[
                      {
                        id: "light",
                        name: "Aero Light Canvas",
                        desc: "Pristine high-contrast daylight theme",
                        gradient: "from-slate-100 to-white",
                      },
                      {
                        id: "charcoal",
                        name: "Charcoal Dark Theme",
                        desc: "Subtle workspace obsidian palette",
                        gradient: "from-[#242428] to-[#1c1c1f]",
                      },
                      {
                        id: "cosmic",
                        name: "Cosmic Midnight",
                        desc: "Aesthetic low-light studio mode",
                        gradient: "from-[#111111] to-[#0a0a0c]",
                      },
                    ].map((theme) => {
                      const isSel = selectedTheme === theme.id;
                      return (
                        <button
                          key={theme.id}
                          type="button"
                          onClick={() => {
                            setSelectedTheme(theme.id);
                            if (theme.id === "light") {
                              document.documentElement.classList.remove("dark");
                            } else {
                              document.documentElement.classList.add("dark");
                            }
                            toast.success(`Applied ${theme.name}`);
                          }}
                          className={`p-4 rounded-xl text-left border transition-all cursor-pointer relative overflow-hidden group ${
                            isSel
                              ? "border-foreground bg-foreground/5 ring-1 ring-foreground"
                              : "border-border hover:border-foreground/30 bg-surface/30"
                          }`}
                        >
                          <div
                            className={`w-full h-16 rounded-lg mb-3 bg-gradient-to-br ${theme.gradient} border border-border flex items-end p-2`}
                          >
                            <div className="w-8 h-1.5 bg-foreground/30 rounded-full" />
                          </div>
                          <div className="text-xs font-bold text-foreground">{theme.name}</div>
                          <p className="text-[11px] text-muted-foreground mt-0.5">{theme.desc}</p>
                          {isSel && (
                            <div className="absolute right-3 top-3 w-5 h-5 bg-foreground text-background rounded-full grid place-items-center">
                              <Check className="w-3 h-3" strokeWidth={3} />
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </Card>

                {/* Layout Density & Sidebar */}
                <Card className="p-6 border border-border bg-card rounded-2xl">
                  <h3 className="text-sm font-bold text-foreground">Layout Density & Sidebar</h3>
                  <p className="text-xs text-muted-foreground mt-0.5 mb-4">
                    Adjust interface padding and navigation behavior
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                    {[
                      {
                        id: "compact",
                        title: "Compact Density",
                        desc: "Tighter row heights and micro-padding ideal for dense task lists",
                      },
                      {
                        id: "spacious",
                        title: "Spacious Density",
                        desc: "Generous breathing space and elegant typography hierarchy",
                      },
                    ].map((den) => {
                      const isSel = selectedDensity === den.id;
                      return (
                        <button
                          key={den.id}
                          type="button"
                          onClick={() => {
                            setSelectedDensity(den.id);
                            toast.success(`Density: ${den.title}`);
                          }}
                          className={`p-3.5 rounded-xl text-left border transition-all cursor-pointer ${
                            isSel
                              ? "border-foreground bg-foreground/5 ring-1 ring-foreground"
                              : "border-border hover:border-foreground/30 bg-surface/30"
                          }`}
                        >
                          <span className="text-xs font-bold text-foreground block">
                            {den.title}
                          </span>
                          <span className="text-[11px] text-muted-foreground mt-1 block">
                            {den.desc}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  <div className="pt-2 border-t border-border/60">
                    <span className="text-[11.5px] font-semibold text-foreground/80 block mb-2">
                      Sidebar Presentation
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      {[
                        { id: "expanded", label: "Full Expanded" },
                        { id: "icons", label: "Icons Only" },
                        { id: "drawer", label: "Auto Drawer" },
                      ].map((sb) => (
                        <button
                          key={sb.id}
                          type="button"
                          onClick={() => {
                            setSidebarExpanded(sb.id);
                            toast.success(`Sidebar style: ${sb.label}`);
                          }}
                          className={`py-2 px-3 rounded-xl text-xs font-semibold border text-center transition-all cursor-pointer ${
                            sidebarExpanded === sb.id
                              ? "bg-foreground text-background border-foreground shadow-xs"
                              : "border-border bg-surface/30 text-muted-foreground hover:text-foreground"
                          }`}
                        >
                          {sb.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </Card>
              </motion.div>
            )}

            {/* ================= 6. SECURITY TAB ================= */}
            {activeTab === "Security" && (
              <motion.div
                key="security"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.15 }}
                className="space-y-6"
              >
                {/* Password Form */}
                <Card className="p-6 sm:p-7 border border-border bg-card rounded-2xl">
                  <div className="flex items-center gap-2.5 mb-4">
                    <div className="w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 grid place-items-center shrink-0">
                      <KeyRound className="w-4 h-4" />
                    </div>
                    <div>
                      <h2 className="text-[17px] font-bold text-foreground">
                        Password & Credentials
                      </h2>
                      <p className="text-xs text-muted-foreground">
                        Keep your workspace credentials secure with regular key rotations
                      </p>
                    </div>
                  </div>

                  <form onSubmit={handleSaveSecurity} className="space-y-4">
                    <div>
                      <label className="text-[11.5px] font-semibold text-foreground/80 block mb-1.5">
                        Current Password
                      </label>
                      <input
                        type="password"
                        placeholder="••••••••••••"
                        value={currentPass}
                        onChange={(e) => setCurrentPass(e.target.value)}
                        className="w-full h-10 px-3.5 bg-surface/40 border border-border rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-foreground/20 text-foreground"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-[11.5px] font-semibold text-foreground/80 block mb-1.5">
                          New Password
                        </label>
                        <input
                          type="password"
                          placeholder="Min. 8 characters"
                          value={newPass}
                          onChange={(e) => setNewPass(e.target.value)}
                          className="w-full h-10 px-3.5 bg-surface/40 border border-border rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-foreground/20 text-foreground"
                        />
                      </div>
                      <div>
                        <label className="text-[11.5px] font-semibold text-foreground/80 block mb-1.5">
                          Confirm New Password
                        </label>
                        <input
                          type="password"
                          placeholder="Re-enter new password"
                          value={confirmPass}
                          onChange={(e) => setConfirmPass(e.target.value)}
                          className="w-full h-10 px-3.5 bg-surface/40 border border-border rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-foreground/20 text-foreground"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end pt-1">
                      <button
                        type="submit"
                        className="h-9 px-5 rounded-xl bg-foreground text-background font-semibold text-xs hover:opacity-90 transition-opacity cursor-pointer shadow-xs"
                      >
                        Update Password
                      </button>
                    </div>
                  </form>
                </Card>

                {/* Developer API Tokens */}
                <Card className="p-6 border border-border bg-card rounded-2xl">
                  <div className="flex items-center justify-between gap-3 mb-2">
                    <div>
                      <h3 className="text-sm font-bold text-foreground">
                        Developer API Integration Tokens
                      </h3>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Generate scoped tokens to pipe approvals, calendar schedules, or asset logs
                        to external tools
                      </p>
                    </div>
                  </div>

                  <form
                    onSubmit={handleCreateApiKey}
                    className="flex flex-col sm:flex-row gap-2 my-4"
                  >
                    <input
                      type="text"
                      required
                      placeholder="e.g. Notion Sync, Slack Bot, Webhook..."
                      value={newKeyName}
                      onChange={(e) => setNewKeyName(e.target.value)}
                      className="flex-1 h-9 px-3.5 bg-surface/40 border border-border rounded-xl text-xs text-foreground focus:outline-none"
                    />
                    <select
                      value={newKeyScope}
                      onChange={(e) => setNewKeyScope(e.target.value)}
                      className="h-9 px-3 bg-surface/40 border border-border rounded-xl text-xs text-foreground cursor-pointer focus:outline-none"
                    >
                      <option value="read_write">Full Access (Read/Write)</option>
                      <option value="read_only">Read-Only Access</option>
                    </select>
                    <button
                      type="submit"
                      className="h-9 px-4 rounded-xl bg-foreground text-background font-semibold text-xs hover:opacity-90 cursor-pointer flex items-center justify-center gap-1.5 shrink-0 shadow-xs"
                    >
                      <Plus className="w-3.5 h-3.5" strokeWidth={2.5} />
                      <span>Generate Token</span>
                    </button>
                  </form>

                  <div className="space-y-2.5">
                    {apiKeys.map((key) => (
                      <div
                        key={key.id}
                        className="flex items-center justify-between p-3.5 rounded-xl border border-border bg-surface/30 gap-3"
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-foreground truncate">
                              {key.name}
                            </span>
                            <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-surface border border-border text-muted-foreground font-mono">
                              {key.scope}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <code className="text-[10px] font-mono text-muted-foreground bg-muted/60 px-1.5 py-0.5 rounded">
                              {key.prefix}
                            </code>
                            <button
                              type="button"
                              onClick={() => handleCopyKey(key.prefix)}
                              className="text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                              title="Copy token"
                            >
                              <Copy className="w-3 h-3" />
                            </button>
                            <span className="text-[10px] text-muted-foreground">
                              • Created {key.created}
                            </span>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleDeleteApiKey(key.id, key.name)}
                          className="p-1.5 rounded-lg hover:bg-rose-500/10 text-muted-foreground hover:text-rose-600 transition-colors cursor-pointer"
                          title="Revoke key"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </Card>

                {/* Session Tracking Card */}
                <Card className="p-6 border border-border bg-card rounded-2xl">
                  <h3 className="text-sm font-bold text-foreground">Active Workspace Sessions</h3>
                  <p className="text-xs text-muted-foreground mt-0.5 mb-4">
                    Authorized browser connections and active login devices
                  </p>

                  <div className="space-y-2.5">
                    {[
                      {
                        icon: Monitor,
                        device: "Chrome on macOS (Sonoma)",
                        location: "San Francisco, CA • 192.168.1.102",
                        status: "Current Session",
                        isCurrent: true,
                      },
                      {
                        icon: Smartphone,
                        device: "Safari on iPhone 15 Pro",
                        location: "San Jose, CA • 10.0.0.45",
                        status: "Active 2h ago",
                        isCurrent: false,
                      },
                    ].map((ses, i) => {
                      const Icon = ses.icon;
                      return (
                        <div
                          key={i}
                          className="flex items-center justify-between p-3 rounded-xl border border-border bg-surface/30"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-surface grid place-items-center">
                              <Icon className="w-4 h-4 text-muted-foreground" />
                            </div>
                            <div>
                              <div className="text-xs font-bold text-foreground">{ses.device}</div>
                              <div className="text-[11px] text-muted-foreground mt-0.5">
                                {ses.location}
                              </div>
                            </div>
                          </div>
                          <span
                            className={`px-2 py-0.5 text-[10px] font-semibold rounded-full border ${
                              ses.isCurrent
                                ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                                : "bg-surface text-muted-foreground border-border"
                            }`}
                          >
                            {ses.status}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </Card>
              </motion.div>
            )}

            {/* ================= 7. STATUS TAB ================= */}
            {activeTab === "Status" && (
              <motion.div
                key="status"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.15 }}
                className="space-y-6"
              >
                <BetterStackStatus />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </AppShell>
  );
}
