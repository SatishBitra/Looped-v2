import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AppShell, Card, SectionTitle } from "@/components/app-shell";
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
} from "lucide-react";
import * as Sentry from "@sentry/tanstackstart-react";
import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";

export const Route = createFileRoute("/settings")({
  component: SettingsPage,
});

const groups = [
  { icon: User, title: "Profile", desc: "Name, role, avatar and personal preferences" },
  { icon: Bell, title: "Notifications", desc: "Email, in-app and digest cadence" },
  { icon: Users, title: "Team & pods", desc: "Members, roles, allocations" },
  { icon: Shield, title: "Permissions", desc: "Role-based visibility and approvals" },
  { icon: Palette, title: "Appearance", desc: "Theme, density, sidebar" },
  { icon: KeyRound, title: "Security", desc: "SSO, sessions, API keys" },
  { icon: Activity, title: "Status", desc: "System health, uptime & Sentry monitoring" },
];

function SettingsPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("Profile");

  // State for Profile
  const [profileName, setProfileName] = useState("Anna Rossi");
  const [profileEmail, setProfileEmail] = useState("anna@loooped.studio");
  const [profileRole, setProfileRole] = useState("Producer");
  const [profilePod, setProfilePod] = useState("Design Pod");

  // State for Notifications
  const [notifApprovals, setNotifApprovals] = useState(true);
  const [notifClient, setNotifClient] = useState(true);
  const [notifCapacity, setNotifCapacity] = useState(true);
  const [notifWeekly, setNotifWeekly] = useState(false);
  const [notifSlack, setNotifSlack] = useState(true);
  const [notifPush, setNotifPush] = useState(false);
  const [digestFrequency, setDigestFrequency] = useState("Weekly");

  // State for Appearance
  const [selectedTheme, setSelectedTheme] = useState("light");
  const [selectedDensity, setSelectedDensity] = useState("spacious");
  const [sidebarExpanded, setSidebarExpanded] = useState("expanded");

  // State for Security
  const [currentPass, setCurrentPass] = useState("");
  const [newPass, setNewPass] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [apiKeys, setApiKeys] = useState([
    {
      name: "Live Client Portal Integration",
      prefix: "LOOOPED_LIVE_1s9f3a...",
      created: "July 02, 2026",
    },
    { name: "Handoff Automated Sync", prefix: "LOOOPED_DEV_29ka81...", created: "June 14, 2026" },
  ]);
  const [newKeyName, setNewKeyName] = useState("");

  // State for Permissions
  const [selectedRoleGroup, setSelectedRoleGroup] = useState("Manager");
  const [permApprovals, setPermApprovals] = useState(true);
  const [permInvite, setPermInvite] = useState(true);
  const [permClientFolders, setPermClientFolders] = useState(true);
  const [permEditBudgets, setPermEditBudgets] = useState(false);
  const [permAccessBilling, setPermAccessBilling] = useState(false);
  const [approvalTiers, setApprovalTiers] = useState("single");

  // Save actions
  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Profile details updated successfully.");
  };

  const handleSaveSecurity = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPass) {
      toast.error("Please enter your current password to make security changes.");
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

  const handleCreateApiKey = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKeyName.trim()) {
      toast.error("Please provide a name for the API Key.");
      return;
    }
    const randomHex = Array.from({ length: 12 }, () =>
      Math.floor(Math.random() * 16).toString(16),
    ).join("");
    const newKey = {
      name: newKeyName,
      prefix: `LOOOPED_LIVE_${randomHex}...`,
      created: "Today",
    };
    setApiKeys([...apiKeys, newKey]);
    setNewKeyName("");
    toast.success(`API Key "${newKey.name}" generated.`);
  };

  const handleDeleteApiKey = (name: string) => {
    setApiKeys(apiKeys.filter((k) => k.name !== name));
    toast.info("API token revoked.");
  };

  return (
    <AppShell breadcrumb={["Workspace", "Settings"]}>
      <div className="mb-8">
        <h1 className="text-2xl sm:text-[30px] font-semibold tracking-tight">Settings</h1>
        <p className="text-[14px] text-muted-foreground mt-1">
          Personal and workspace-level preferences
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6">
        {/* Navigation Sidebar */}
        <Card className="p-3 h-fit">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-1 gap-1">
            {groups.map((g) => {
              const Icon = g.icon;
              const isActive = activeTab === g.title;
              return (
                <button
                  key={g.title}
                  onClick={() => setActiveTab(g.title)}
                  className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-[16px] text-left transition-all cursor-pointer ${
                    isActive
                      ? "bg-foreground text-background font-semibold"
                      : "hover:bg-surface text-muted-foreground hover:text-foreground font-medium"
                  }`}
                >
                  <Icon
                    className={`w-4 h-4 ${isActive ? "text-background" : "text-muted-foreground"}`}
                    strokeWidth={isActive ? 2.5 : 1.75}
                  />
                  <span className="text-[13px] flex-1 truncate">{g.title}</span>
                  <ChevronRight
                    className={`w-3.5 h-3.5 hidden lg:inline-block ${isActive ? "text-background opacity-80" : "text-subtle"}`}
                  />
                </button>
              );
            })}
          </div>
        </Card>

        {/* Content Panel */}
        <div className="flex flex-col gap-4">
          <AnimatePresence mode="wait">
            {activeTab === "Profile" && (
              <motion.div
                key="profile"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ duration: 0.15 }}
              >
                <Card className="p-5 sm:p-6">
                  <SectionTitle title="Profile" />
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-3xl bg-[#5A82E8]/10 text-[#5A82E8] grid place-items-center text-[20px] font-bold flex-shrink-0">
                        {profileName
                          .split(" ")
                          .map((s) => s[0])
                          .join("")}
                      </div>
                      <div>
                        <div className="text-[16px] font-bold text-foreground">{profileName}</div>
                        <div className="text-[13px] text-muted-foreground">
                          {profileRole} · {profilePod}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => toast.info("Image upload dialog opened")}
                      className="sm:ml-auto h-9 px-4 rounded-xl bg-surface border border-border text-[12px] font-semibold hover:border-foreground/30 transition-all cursor-pointer text-foreground"
                    >
                      Change photo
                    </button>
                  </div>

                  <form onSubmit={handleSaveProfile} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block">
                          Display name
                        </label>
                        <input
                          value={profileName}
                          onChange={(e) => setProfileName(e.target.value)}
                          className="w-full h-11 px-3.5 bg-slate-50 dark:bg-[#151518] border border-border/60 rounded-xl text-xs font-semibold focus:outline-none focus:border-foreground/30 text-foreground"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block">
                          Email
                        </label>
                        <input
                          type="email"
                          value={profileEmail}
                          onChange={(e) => setProfileEmail(e.target.value)}
                          className="w-full h-11 px-3.5 bg-slate-50 dark:bg-[#151518] border border-border/60 rounded-xl text-xs font-semibold focus:outline-none focus:border-foreground/30 text-foreground"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block">
                          Role
                        </label>
                        <input
                          value={profileRole}
                          onChange={(e) => setProfileRole(e.target.value)}
                          className="w-full h-11 px-3.5 bg-slate-50 dark:bg-[#151518] border border-border/60 rounded-xl text-xs font-semibold focus:outline-none focus:border-foreground/30 text-foreground"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block">
                          Pod
                        </label>
                        <input
                          value={profilePod}
                          onChange={(e) => setProfilePod(e.target.value)}
                          className="w-full h-11 px-3.5 bg-slate-50 dark:bg-[#151518] border border-border/60 rounded-xl text-xs font-semibold focus:outline-none focus:border-foreground/30 text-foreground"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end pt-4">
                      <button
                        type="submit"
                        className="h-10 px-6 rounded-xl bg-foreground text-background font-semibold text-xs hover:opacity-90 transition-opacity cursor-pointer shadow-sm"
                      >
                        Save Preferences
                      </button>
                    </div>
                  </form>
                </Card>

                {/* Account & Active Session */}
                <Card className="p-5 sm:p-6">
                  <SectionTitle title="Account Session" />
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
                    <div>
                      <p className="text-xs font-semibold text-foreground">
                        Active Workspace Session
                      </p>
                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        Logged in as {profileEmail}. Sign out anytime to return to the login screen.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => signOutUser(navigate)}
                      className="flex items-center gap-2 h-9 px-4 rounded-xl bg-destructive/10 hover:bg-destructive/20 text-destructive text-xs font-semibold transition-colors cursor-pointer w-fit"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign Out of Looped</span>
                    </button>
                  </div>
                </Card>
              </motion.div>
            )}

            {activeTab === "Notifications" && (
              <motion.div
                key="notifications"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ duration: 0.15 }}
                className="space-y-4"
              >
                <Card className="p-6">
                  <SectionTitle title="Notification Channels" />
                  <p className="text-xs text-muted-foreground mb-6 -mt-1">
                    Control how and where you receive project status updates and digest alerts
                  </p>

                  <div className="flex flex-col divide-y divide-border/65">
                    {[
                      {
                        l: "Approvals waiting",
                        d: "Ping me when work is submitted for my review",
                        val: notifApprovals,
                        setter: setNotifApprovals,
                      },
                      {
                        l: "Client responses",
                        d: "Emails and in-app when clients comment",
                        val: notifClient,
                        setter: setNotifClient,
                      },
                      {
                        l: "Capacity warnings",
                        d: "Alerts when any pod exceeds 85% bandwidth",
                        val: notifCapacity,
                        setter: setNotifCapacity,
                      },
                      {
                        l: "Weekly summary digest",
                        d: "Receive email reports every Monday, 9:00 am",
                        val: notifWeekly,
                        setter: setNotifWeekly,
                      },
                      {
                        l: "Slack notifications",
                        d: "Sync updates instantly inside your designated team channel",
                        val: notifSlack,
                        setter: setNotifSlack,
                      },
                      {
                        l: "Mobile push alerts",
                        d: "Send native push notifications via web app browser socket",
                        val: notifPush,
                        setter: setNotifPush,
                      },
                    ].map((n) => (
                      <div
                        key={n.l}
                        className="flex items-center justify-between py-4 first:pt-0 last:pb-0"
                      >
                        <div className="pr-4">
                          <div className="text-[14px] font-bold text-foreground">{n.l}</div>
                          <div className="text-[12px] font-medium text-muted-foreground mt-0.5">
                            {n.d}
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => n.setter(!n.val)}
                          className={`w-11 h-6 rounded-full p-0.5 transition-colors cursor-pointer flex-shrink-0 ${n.val ? "bg-foreground" : "bg-slate-200 dark:bg-[#323238]"}`}
                        >
                          <span
                            className={`block w-5 h-5 rounded-full bg-background transition-transform duration-200 ${n.val ? "translate-x-5" : "translate-x-0"}`}
                          />
                        </button>
                      </div>
                    ))}
                  </div>
                </Card>

                <Card className="p-6">
                  <SectionTitle title="Digest Frequency Cadence" />
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-3">
                    {["Instant", "Daily", "Weekly"].map((freq) => {
                      const isSel = digestFrequency === freq;
                      return (
                        <button
                          key={freq}
                          onClick={() => {
                            setDigestFrequency(freq);
                            toast.success(`Digest frequency adjusted to ${freq}`);
                          }}
                          className={`p-4 rounded-xl text-left border transition-all cursor-pointer ${
                            isSel
                              ? "border-foreground bg-slate-50 dark:bg-[#242428] ring-1 ring-foreground"
                              : "border-border hover:border-foreground/35 bg-transparent"
                          }`}
                        >
                          <div className="text-xs font-bold text-foreground uppercase tracking-wide">
                            {freq} Updates
                          </div>
                          <p className="text-[11px] text-muted-foreground mt-1">
                            {freq === "Instant" && "Deliver alerts immediately when events occur"}
                            {freq === "Daily" &&
                              "Batch all messages into a single daily briefing at 5 PM"}
                            {freq === "Weekly" &&
                              "Bundle stats and weekly accomplishments into a single review"}
                          </p>
                        </button>
                      );
                    })}
                  </div>
                </Card>
              </motion.div>
            )}

            {activeTab === "Team & pods" && (
              <motion.div
                key="team"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ duration: 0.15 }}
                className="space-y-4"
              >
                <Card className="p-6">
                  <SectionTitle title="Team Allocation Overview" />
                  <p className="text-xs text-muted-foreground mb-6 -mt-1">
                    Your active team folder and allocation limits
                  </p>

                  <div className="space-y-4">
                    {[
                      {
                        name: "Pod Alpha",
                        projects: "Q4 Rebrand, Landing Revamp",
                        usage: 82,
                        color: "bg-emerald-500",
                      },
                      {
                        name: "Pod Beta",
                        projects: "Product Film, Podcast Branding",
                        usage: 44,
                        color: "bg-amber-500",
                      },
                      {
                        name: "Pod Gamma",
                        projects: "Social Pack Q3",
                        usage: 95,
                        color: "bg-rose-500",
                      },
                    ].map((pod) => (
                      <div
                        key={pod.name}
                        className="p-4 rounded-xl border border-border bg-slate-50/50 dark:bg-[#1c1c20]"
                      >
                        <div className="flex justify-between items-center mb-2">
                          <div>
                            <span className="text-xs font-bold text-foreground">{pod.name}</span>
                            <span className="text-[10px] text-muted-foreground ml-2 font-medium">
                              ({pod.projects})
                            </span>
                          </div>
                          <span className="text-xs font-semibold text-foreground">
                            {pod.usage}% capacity
                          </span>
                        </div>
                        <div className="h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                          <div
                            className={`h-full rounded-full ${pod.color}`}
                            style={{ width: `${pod.usage}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              </motion.div>
            )}

            {activeTab === "Permissions" && (
              <motion.div
                key="permissions"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ duration: 0.15 }}
                className="space-y-4"
              >
                <Card className="p-6">
                  <div className="flex items-center gap-2 mb-2">
                    <Shield className="w-5 h-5 text-foreground" />
                    <SectionTitle title="Role Permissions Profile" />
                  </div>
                  <p className="text-xs text-muted-foreground mb-6 -mt-1">
                    Manage role-based access control, tier clearances, and validation rules for
                    submitted timesheets and client files
                  </p>

                  {/* Role Selector Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-6">
                    {["Viewer", "Designer", "Manager", "Admin"].map((role) => {
                      const isSel = selectedRoleGroup === role;
                      return (
                        <button
                          key={role}
                          onClick={() => {
                            setSelectedRoleGroup(role);
                            // Adjust toggles for mock feel
                            if (role === "Admin") {
                              setPermApprovals(true);
                              setPermInvite(true);
                              setPermClientFolders(true);
                              setPermEditBudgets(true);
                              setPermAccessBilling(true);
                            } else if (role === "Manager") {
                              setPermApprovals(true);
                              setPermInvite(true);
                              setPermClientFolders(true);
                              setPermEditBudgets(false);
                              setPermAccessBilling(false);
                            } else if (role === "Designer") {
                              setPermApprovals(false);
                              setPermInvite(false);
                              setPermClientFolders(true);
                              setPermEditBudgets(false);
                              setPermAccessBilling(false);
                            } else {
                              setPermApprovals(false);
                              setPermInvite(false);
                              setPermClientFolders(false);
                              setPermEditBudgets(false);
                              setPermAccessBilling(false);
                            }
                            toast.success(`Clearance matrix adjusted for: ${role}`);
                          }}
                          className={`py-2.5 rounded-xl text-center border text-xs font-bold transition-all cursor-pointer ${
                            isSel
                              ? "bg-foreground text-background border-foreground shadow-sm"
                              : "border-border hover:border-foreground/35 text-muted-foreground hover:text-foreground bg-transparent"
                          }`}
                        >
                          {role}
                        </button>
                      );
                    })}
                  </div>

                  <div className="space-y-4 divide-y divide-border">
                    <div className="flex items-center justify-between py-3">
                      <div>
                        <div className="text-[13.5px] font-bold text-foreground">
                          Can Review Approvals
                        </div>
                        <p className="text-[11.5px] text-muted-foreground">
                          Authorize time logs, milestones, and design submissions
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setPermApprovals(!permApprovals)}
                        className={`w-11 h-6 rounded-full p-0.5 transition-colors cursor-pointer ${permApprovals ? "bg-foreground" : "bg-slate-200 dark:bg-[#323238]"}`}
                      >
                        <span
                          className={`block w-5 h-5 rounded-full bg-background transition-transform duration-200 ${permApprovals ? "translate-x-5" : ""}`}
                        />
                      </button>
                    </div>

                    <div className="flex items-center justify-between py-3">
                      <div>
                        <div className="text-[13.5px] font-bold text-foreground">
                          Can Invite Teammates
                        </div>
                        <p className="text-[11.5px] text-muted-foreground">
                          Add new producers, developers, or clients directly into workspaces
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setPermInvite(!permInvite)}
                        className={`w-11 h-6 rounded-full p-0.5 transition-colors cursor-pointer ${permInvite ? "bg-foreground" : "bg-slate-200 dark:bg-[#323238]"}`}
                      >
                        <span
                          className={`block w-5 h-5 rounded-full bg-background transition-transform duration-200 ${permInvite ? "translate-x-5" : ""}`}
                        />
                      </button>
                    </div>

                    <div className="flex items-center justify-between py-3">
                      <div>
                        <div className="text-[13.5px] font-bold text-foreground">
                          Can Manage Client Folders
                        </div>
                        <p className="text-[11.5px] text-muted-foreground">
                          Create, archive, and modify client brand directories
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setPermClientFolders(!permClientFolders)}
                        className={`w-11 h-6 rounded-full p-0.5 transition-colors cursor-pointer ${permClientFolders ? "bg-foreground" : "bg-slate-200 dark:bg-[#323238]"}`}
                      >
                        <span
                          className={`block w-5 h-5 rounded-full bg-background transition-transform duration-200 ${permClientFolders ? "translate-x-5" : ""}`}
                        />
                      </button>
                    </div>

                    <div className="flex items-center justify-between py-3">
                      <div>
                        <div className="text-[13.5px] font-bold text-foreground">
                          Can Edit Project Budgets
                        </div>
                        <p className="text-[11.5px] text-muted-foreground">
                          Modify monetary thresholds, hour quotas, and retainer fees
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setPermEditBudgets(!permEditBudgets)}
                        className={`w-11 h-6 rounded-full p-0.5 transition-colors cursor-pointer ${permEditBudgets ? "bg-foreground" : "bg-slate-200 dark:bg-[#323238]"}`}
                      >
                        <span
                          className={`block w-5 h-5 rounded-full bg-background transition-transform duration-200 ${permEditBudgets ? "translate-x-5" : ""}`}
                        />
                      </button>
                    </div>

                    <div className="flex items-center justify-between py-3">
                      <div>
                        <div className="text-[13.5px] font-bold text-foreground">
                          Can Access Billing Reports
                        </div>
                        <p className="text-[11.5px] text-muted-foreground">
                          Read sensitive financial statements, margin yields, and pricing charts
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setPermAccessBilling(!permAccessBilling)}
                        className={`w-11 h-6 rounded-full p-0.5 transition-colors cursor-pointer ${permAccessBilling ? "bg-foreground" : "bg-slate-200 dark:bg-[#323238]"}`}
                      >
                        <span
                          className={`block w-5 h-5 rounded-full bg-background transition-transform duration-200 ${permAccessBilling ? "translate-x-5" : ""}`}
                        />
                      </button>
                    </div>
                  </div>
                </Card>

                <Card className="p-6">
                  <SectionTitle title="Sign-Off Approval Tier Structure" />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    {[
                      {
                        tier: "single",
                        label: "Single-Signature Approval",
                        desc: "Logs are immediately authorized once any Manager signs off. Ideal for fast-moving workflows.",
                      },
                      {
                        tier: "double",
                        label: "Double-Signature Validation",
                        desc: "Requires clearance from both a design lead and an account producer before final log submission.",
                      },
                    ].map((item) => (
                      <button
                        key={item.tier}
                        onClick={() => {
                          setApprovalTiers(item.tier);
                          toast.success(`Approval pattern set to ${item.label}`);
                        }}
                        className={`p-4 rounded-xl text-left border transition-all cursor-pointer ${
                          approvalTiers === item.tier
                            ? "border-foreground bg-slate-50 dark:bg-[#242428] ring-1 ring-foreground"
                            : "border-border hover:border-foreground/35 bg-transparent"
                        }`}
                      >
                        <div className="text-xs font-bold text-foreground">{item.label}</div>
                        <p className="text-[11px] text-muted-foreground mt-1">{item.desc}</p>
                      </button>
                    ))}
                  </div>
                </Card>
              </motion.div>
            )}

            {activeTab === "Appearance" && (
              <motion.div
                key="appearance"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ duration: 0.15 }}
                className="space-y-4"
              >
                <Card className="p-6">
                  <div className="flex items-center gap-2 mb-2">
                    <Palette className="w-5 h-5 text-foreground" />
                    <SectionTitle title="App Interface Themes" />
                  </div>
                  <p className="text-xs text-muted-foreground mb-6 -mt-1">
                    Select a look that keeps you focused during late-night sprints or client reviews
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {[
                      {
                        id: "light",
                        name: "Aero Light Theme",
                        desc: "Pristine white canvas",
                        colors: "from-slate-100 to-white",
                      },
                      {
                        id: "charcoal",
                        name: "Charcoal Dark Theme",
                        desc: "Subtle workspace charcoal",
                        colors: "from-[#242428] to-[#1c1c1f]",
                      },
                      {
                        id: "cosmic",
                        name: "Cosmic Slate Theme",
                        desc: "Aesthetic cosmic depth",
                        colors: "from-[#111111] to-[#0d0d0f]",
                      },
                    ].map((theme) => {
                      const isSel = selectedTheme === theme.id;
                      return (
                        <button
                          key={theme.id}
                          onClick={() => {
                            setSelectedTheme(theme.id);
                            // Trigger system theme adjustment if desired, otherwise mock is super elegant
                            if (theme.id === "light") {
                              document.documentElement.classList.remove("dark");
                            } else {
                              document.documentElement.classList.add("dark");
                            }
                            toast.success(`Applied ${theme.name}`);
                          }}
                          className={`p-4 rounded-2xl text-left border transition-all cursor-pointer relative overflow-hidden group ${
                            isSel
                              ? "border-foreground bg-slate-50 dark:bg-[#242428] ring-1 ring-foreground"
                              : "border-border hover:border-foreground/35 bg-transparent"
                          }`}
                        >
                          <div
                            className={`w-full h-20 rounded-xl mb-3 bg-gradient-to-br ${theme.colors} border border-border flex items-end p-2`}
                          >
                            <div className="w-6 h-1 bg-foreground/30 rounded-full" />
                          </div>
                          <div className="text-xs font-bold text-foreground">{theme.name}</div>
                          <p className="text-[10px] text-muted-foreground mt-0.5">{theme.desc}</p>
                          {isSel && (
                            <div className="absolute right-3 bottom-3 w-5 h-5 bg-foreground text-background rounded-full grid place-items-center">
                              <Check className="w-3 h-3" strokeWidth={3} />
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </Card>

                <Card className="p-6">
                  <SectionTitle title="Layout Density" />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    {[
                      {
                        id: "compact",
                        name: "Compact Density",
                        desc: "Tight spacing and micro-padding ideal for dense analytics dashboards",
                      },
                      {
                        id: "spacious",
                        name: "Spacious Density",
                        desc: "Generous breathing space and negative margin pairings for premium clarity",
                      },
                    ].map((dens) => {
                      const isSel = selectedDensity === dens.id;
                      return (
                        <button
                          key={dens.id}
                          onClick={() => {
                            setSelectedDensity(dens.id);
                            toast.success(`Density updated to ${dens.name}`);
                          }}
                          className={`p-4 rounded-xl text-left border transition-all cursor-pointer ${
                            isSel
                              ? "border-foreground bg-slate-50 dark:bg-[#242428] ring-1 ring-foreground"
                              : "border-border hover:border-foreground/35 bg-transparent"
                          }`}
                        >
                          <span className="text-xs font-bold text-foreground block">
                            {dens.name}
                          </span>
                          <span className="text-[11px] text-muted-foreground mt-1 block">
                            {dens.desc}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </Card>

                <Card className="p-6">
                  <SectionTitle title="Sidebar Configuration" />
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                    {[
                      { id: "expanded", name: "Expanded Title View" },
                      { id: "icons", name: "Minimalist Icons Only" },
                      { id: "collapsed", name: "Auto-Hide Drawer" },
                    ].map((opt) => {
                      const isSel = sidebarExpanded === opt.id;
                      return (
                        <button
                          key={opt.id}
                          onClick={() => {
                            setSidebarExpanded(opt.id);
                            toast.success(`Sidebar style: ${opt.name}`);
                          }}
                          className={`py-3 px-4 rounded-xl text-center border text-xs font-semibold transition-all cursor-pointer ${
                            isSel
                              ? "border-foreground bg-slate-50 dark:bg-[#242428] text-foreground"
                              : "border-border hover:border-foreground/35 text-muted-foreground hover:text-foreground"
                          }`}
                        >
                          {opt.name}
                        </button>
                      );
                    })}
                  </div>
                </Card>
              </motion.div>
            )}

            {activeTab === "Security" && (
              <motion.div
                key="security"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ duration: 0.15 }}
                className="space-y-4"
              >
                {/* Password Form */}
                <Card className="p-5 sm:p-6">
                  <SectionTitle title="Update Password" />
                  <form onSubmit={handleSaveSecurity} className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block">
                        Current Password
                      </label>
                      <input
                        type="password"
                        placeholder="••••••••••••"
                        value={currentPass}
                        onChange={(e) => setCurrentPass(e.target.value)}
                        className="w-full h-11 px-3.5 bg-slate-50 dark:bg-[#151518] border border-border/60 rounded-xl text-xs font-semibold focus:outline-none focus:border-foreground/30 text-foreground"
                      />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block">
                          New Password
                        </label>
                        <input
                          type="password"
                          placeholder="At least 8 characters"
                          value={newPass}
                          onChange={(e) => setNewPass(e.target.value)}
                          className="w-full h-11 px-3.5 bg-slate-50 dark:bg-[#151518] border border-border/60 rounded-xl text-xs font-semibold focus:outline-none focus:border-foreground/30 text-foreground"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block">
                          Confirm New Password
                        </label>
                        <input
                          type="password"
                          placeholder="Re-type new password"
                          value={confirmPass}
                          onChange={(e) => setConfirmPass(e.target.value)}
                          className="w-full h-11 px-3.5 bg-slate-50 dark:bg-[#151518] border border-border/60 rounded-xl text-xs font-semibold focus:outline-none focus:border-foreground/30 text-foreground"
                        />
                      </div>
                    </div>
                    <div className="flex justify-end pt-2">
                      <button
                        type="submit"
                        className="h-10 px-5 rounded-xl bg-foreground text-background font-semibold text-xs shadow-sm hover:opacity-90 cursor-pointer"
                      >
                        Change Password
                      </button>
                    </div>
                  </form>
                </Card>

                {/* API Keys Panel */}
                <Card className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <SectionTitle title="Developer API Integration Tokens" />
                      <p className="text-xs text-muted-foreground -mt-1">
                        Generate live keys to pipe workspace stats, time logs, or calendar feeds
                        into external APIs.
                      </p>
                    </div>
                  </div>

                  <form onSubmit={handleCreateApiKey} className="flex gap-2 mb-6">
                    <input
                      type="text"
                      required
                      placeholder="e.g. Notion Sync Integration, Webhook Endpoint..."
                      value={newKeyName}
                      onChange={(e) => setNewKeyName(e.target.value)}
                      className="flex-1 h-10 px-3.5 bg-slate-50 dark:bg-[#151518] border border-border/60 rounded-xl text-xs font-semibold focus:outline-none focus:border-foreground/30 text-foreground"
                    />
                    <button
                      type="submit"
                      className="h-10 px-4 rounded-xl bg-foreground text-background font-semibold text-xs hover:opacity-90 cursor-pointer flex items-center gap-1.5 shrink-0"
                    >
                      <Plus className="w-3.5 h-3.5" strokeWidth={2.5} /> Generate Token
                    </button>
                  </form>

                  <div className="space-y-2">
                    {apiKeys.map((key) => (
                      <div
                        key={key.name}
                        className="flex items-center justify-between p-3.5 rounded-xl border border-border bg-slate-50/40 dark:bg-[#151518]/60"
                      >
                        <div>
                          <div className="text-xs font-bold text-foreground">{key.name}</div>
                          <div className="flex items-center gap-3 mt-1">
                            <code className="text-[10px] font-mono text-muted-foreground bg-slate-100 dark:bg-[#242428] px-1.5 py-0.5 rounded">
                              {key.prefix}
                            </code>
                            <span className="text-[10px] text-muted-foreground">
                              Created {key.created}
                            </span>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleDeleteApiKey(key.name)}
                          className="w-8 h-8 rounded-lg hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/20 text-muted-foreground grid place-items-center transition-colors cursor-pointer"
                          title="Revoke key"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                    {apiKeys.length === 0 && (
                      <div className="text-center py-6 border border-dashed border-border rounded-xl text-xs text-muted-foreground">
                        No active API keys found. Generate one above.
                      </div>
                    )}
                  </div>
                </Card>

                {/* Session Management */}
                <Card className="p-6">
                  <SectionTitle title="Session Tracking" />
                  <p className="text-xs text-muted-foreground mb-4 -mt-1">
                    Manage active device entries logged into your Loooped Account
                  </p>
                  <div className="space-y-3">
                    {[
                      {
                        icon: Monitor,
                        device: "Chrome on macOS",
                        location: "Cupertino, CA",
                        status: "Active Now",
                        color: "text-emerald-500 font-bold bg-emerald-500/10 border-emerald-500/20",
                      },
                      {
                        icon: Smartphone,
                        device: "Safari on iPhone 15 Pro",
                        location: "San Jose, CA",
                        status: "Logged In 2 hrs ago",
                        color:
                          "text-muted-foreground bg-slate-100 dark:bg-[#242428] border-border/60",
                      },
                    ].map((ses, i) => {
                      const Icon = ses.icon;
                      return (
                        <div
                          key={i}
                          className="flex items-center justify-between p-3 rounded-xl border border-border"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-lg bg-surface grid place-items-center">
                              <Icon className="w-4 h-4 text-muted-foreground" />
                            </div>
                            <div>
                              <div className="text-xs font-bold text-foreground">{ses.device}</div>
                              <div className="text-[10px] text-muted-foreground mt-0.5">
                                {ses.location}
                              </div>
                            </div>
                          </div>
                          <span
                            className={`px-2 py-0.5 border text-[9px] uppercase tracking-wider rounded-full ${ses.color}`}
                          >
                            {ses.status}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </Card>

                {/* Security Health Status */}
                <Card className="p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 grid place-items-center shrink-0">
                        <Shield className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-foreground">
                            Security & Error Telemetry Status
                          </span>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                            Active & Protected
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Sentry monitoring active for org <strong>sandesigns</strong>, project{" "}
                          <strong>looped-v2</strong>
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setActiveTab("Status")}
                      className="h-9 px-4 rounded-xl bg-surface border border-border text-xs font-semibold hover:border-foreground/30 text-foreground flex items-center gap-1.5 cursor-pointer shrink-0 transition-all"
                    >
                      <Activity className="w-3.5 h-3.5 text-emerald-500" />
                      <span>View System Status</span>
                    </button>
                  </div>
                </Card>
              </motion.div>
            )}

            {activeTab === "Status" && (
              <motion.div
                key="status"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ duration: 0.15 }}
                className="space-y-4"
              >
                {/* Top Operational Status Banner */}
                <Card className="p-5 sm:p-6 border border-emerald-500/20 bg-emerald-500/[0.03]">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3.5">
                      <div className="w-11 h-11 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 grid place-items-center shrink-0">
                        <Radio className="w-5 h-5 animate-pulse" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h2 className="text-base font-bold text-foreground">
                            All Systems Operational
                          </h2>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                            99.98% UPTIME
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Zero incidents reported. Real-time error monitoring active via Sentry
                          SaaS.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          toast.success("Health check re-evaluated: All systems optimal.");
                        }}
                        className="h-9 px-3.5 rounded-xl bg-surface border border-border hover:border-foreground/30 text-xs font-semibold text-foreground flex items-center gap-1.5 transition-all cursor-pointer"
                      >
                        <RefreshCw className="w-3.5 h-3.5 text-muted-foreground" />
                        <span>Recheck</span>
                      </button>
                    </div>
                  </div>

                  {/* Quick Metric Pills */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5 pt-4 border-t border-border">
                    <div className="p-3 rounded-xl bg-surface/60 border border-border/80">
                      <div className="text-[11px] font-semibold text-muted-foreground">
                        Uptime (90d)
                      </div>
                      <div className="text-sm font-bold text-foreground mt-0.5 font-mono">
                        99.98%
                      </div>
                    </div>
                    <div className="p-3 rounded-xl bg-surface/60 border border-border/80">
                      <div className="text-[11px] font-semibold text-muted-foreground">
                        Client Response
                      </div>
                      <div className="text-sm font-bold text-foreground mt-0.5 font-mono">16ms</div>
                    </div>
                    <div className="p-3 rounded-xl bg-surface/60 border border-border/80">
                      <div className="text-[11px] font-semibold text-muted-foreground">
                        Sentry Health
                      </div>
                      <div className="text-sm font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
                        Connected
                      </div>
                    </div>
                    <div className="p-3 rounded-xl bg-surface/60 border border-border/80">
                      <div className="text-[11px] font-semibold text-muted-foreground">
                        Active Outages
                      </div>
                      <div className="text-sm font-bold text-foreground mt-0.5 font-mono">0</div>
                    </div>
                  </div>
                </Card>

                {/* Sentry Configuration Card */}
                <Card className="p-5 sm:p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-border">
                    <div>
                      <div className="flex items-center gap-2">
                        <Bug className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                        <SectionTitle title="Sentry Error Monitoring" />
                      </div>
                      <p className="text-xs text-muted-foreground -mt-1">
                        Configured for organization{" "}
                        <strong className="text-foreground font-semibold">sandesigns</strong>,
                        project <strong className="text-foreground font-semibold">looped-v2</strong>
                      </p>
                    </div>

                    <a
                      href="https://sandesigns.sentry.io/issues/?project=looped-v2"
                      target="_blank"
                      rel="noreferrer"
                      className="h-8 px-3 rounded-xl bg-foreground text-background text-xs font-semibold flex items-center gap-1.5 hover:opacity-90 transition-opacity shrink-0 cursor-pointer"
                    >
                      <span>Sentry Issues</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 my-4">
                    <div className="p-3 rounded-xl bg-slate-50/60 dark:bg-[#151518]/60 border border-border">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                        Organization
                      </div>
                      <div className="text-xs font-mono font-bold text-foreground mt-1">
                        sandesigns
                      </div>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-50/60 dark:bg-[#151518]/60 border border-border">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                        Project
                      </div>
                      <div className="text-xs font-mono font-bold text-foreground mt-1">
                        looped-v2
                      </div>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-50/60 dark:bg-[#151518]/60 border border-border">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                        SDK Status
                      </div>
                      <div className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 mt-1 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        Initialized
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => navigate({ to: "/sentry-example-page" })}
                      className="h-9 px-4 rounded-xl bg-foreground text-background text-xs font-semibold hover:opacity-90 transition-opacity flex items-center gap-1.5 cursor-pointer"
                    >
                      <Bug className="w-3.5 h-3.5" />
                      <span>Visit /sentry-example-page</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        try {
                          // @ts-expect-error test undefined function
                          window.myUndefinedFunction();
                        } catch (err: unknown) {
                          const error = err as Error;
                          const eventId = Sentry.captureException(error);
                          toast.error("myUndefinedFunction() triggered & captured by Sentry!", {
                            description: `Event ID: ${eventId || "captured"}`,
                          });
                        }
                      }}
                      className="h-9 px-4 rounded-xl bg-rose-50 dark:bg-rose-950/20 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-900/40 text-xs font-semibold hover:bg-rose-100 dark:hover:bg-rose-900/30 transition-all cursor-pointer flex items-center gap-1.5"
                    >
                      <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
                      <span>Trigger Sample Error</span>
                    </button>
                  </div>
                </Card>

                {/* Services Telemetry List */}
                <Card className="p-5 sm:p-6">
                  <SectionTitle title="Services & Infrastructure" />
                  <div className="space-y-2.5 mt-3">
                    {[
                      {
                        name: "Frontend Client & TanStack Router",
                        type: "Edge / Client SPA",
                        latency: "14ms",
                        status: "Operational",
                      },
                      {
                        name: "Sentry Error Monitoring Pipeline",
                        type: "sandesigns / looped-v2",
                        latency: "38ms",
                        status: "Operational",
                      },
                      {
                        name: "Application Server Gateway",
                        type: "Express Server / Node",
                        latency: "22ms",
                        status: "Operational",
                      },
                      {
                        name: "Workspace Authentication & Sessions",
                        type: "Auth Service",
                        latency: "19ms",
                        status: "Operational",
                      },
                    ].map((service, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-3.5 rounded-xl border border-border bg-slate-50/40 dark:bg-[#151518]/60"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-surface grid place-items-center">
                            <Server className="w-4 h-4 text-muted-foreground" />
                          </div>
                          <div>
                            <div className="text-xs font-bold text-foreground">{service.name}</div>
                            <div className="text-[11px] text-muted-foreground">{service.type}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="text-[11px] font-mono text-muted-foreground hidden sm:inline">
                            {service.latency}
                          </span>
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            {service.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </AppShell>
  );
}
