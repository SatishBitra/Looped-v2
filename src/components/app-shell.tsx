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
} from "lucide-react";
import { useState, type ReactNode } from "react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "motion/react";

const nav = [
  { to: "/home", icon: Home, label: "Home" },
  { to: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/projects", icon: FolderKanban, label: "Projects" },
  { to: "/tasks", icon: CheckSquare, label: "Tasks" },
  { to: "/approvals", icon: ShieldCheck, label: "Approvals" },
  { to: "/notifications", icon: Bell, label: "Notifications" },
  { to: "/messages", icon: MessageSquare, label: "Messages" },
  { to: "/reports", icon: BarChart3, label: "Reports" },
  { to: "/clients", icon: Users, label: "Clients" },
  { to: "/settings", icon: Settings, label: "Settings" },
] as const;

function Sidebar() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <aside className="hidden md:flex fixed left-4 top-4 bottom-4 w-[72px] z-30 flex flex-col items-center py-5 bg-card border border-border rounded-[32px] shadow-[var(--shadow-soft)]">
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
}: {
  searchQuery?: string;
  setSearchQuery?: (val: string) => void;
  onQuickAdd?: () => void;
  onMenuToggle?: () => void;
}) {
  return (
    <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6 border-b border-[#E7E7EC] dark:border-[#323238] pb-6 mb-8 select-none">
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
      <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto">
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
        <div className="flex items-center justify-between sm:justify-start gap-3 w-full sm:w-auto">
          <div className="flex items-center gap-2">
            {/* Calendar */}
            <button
              onClick={() => {
                toast.info("Opening Calendar...");
              }}
              className="h-10 w-10 rounded-[18px] bg-white dark:bg-[#242428] border border-[#E7E7EC] dark:border-[#323238] grid place-items-center text-[#757575] hover:text-[#111111] dark:hover:text-white hover:border-[#A8A8A8] transition-all"
            >
              <Calendar className="w-[18px] h-[18px]" strokeWidth={1.75} />
            </button>

            {/* Notifications */}
            <button
              onClick={() => {
                toast.info("No new notifications");
              }}
              className="h-10 w-10 rounded-[18px] bg-white dark:bg-[#242428] border border-[#E7E7EC] dark:border-[#323238] grid place-items-center text-[#757575] hover:text-[#111111] dark:hover:text-white hover:border-[#A8A8A8] transition-all relative"
            >
              <Bell className="w-[18px] h-[18px]" strokeWidth={1.75} />
              <span className="absolute top-2.5 right-2.5 w-1.5 h-1.5 rounded-full bg-[#E4664F]" />
            </button>
          </div>

          {/* Profile Badge */}
          <button
            onClick={() => toast.info("Sandy's Profile")}
            className="h-10 w-10 rounded-[18px] bg-white dark:bg-[#242428] border border-[#E7E7EC] dark:border-[#323238] grid place-items-center hover:border-[#A8A8A8] transition-all"
          >
            <div className="w-8 h-8 rounded-full bg-[#5A82E8]/10 text-[#5A82E8] grid place-items-center text-[12px] font-semibold font-mono">
              S
            </div>
          </button>
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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });

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
                  return (
                    <Link
                      key={item.to}
                      to={item.to}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`flex items-center gap-3.5 px-4 h-11 rounded-2xl transition-colors ${
                        active
                          ? "bg-foreground text-background font-medium"
                          : "text-muted-foreground hover:bg-[#F4F4F7] dark:hover:bg-[#242428] hover:text-foreground"
                      }`}
                    >
                      <Icon className="w-5 h-5" strokeWidth={1.75} />
                      <span className="text-[14px]">{item.label}</span>
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

      <main className="pl-4 pr-4 md:pl-[104px] md:pr-6 py-6 transition-all duration-300">
        {!hideTopNav && (
          <TopNav
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            onQuickAdd={onQuickAdd}
            onMenuToggle={() => setIsMobileMenuOpen(true)}
          />
        )}
        {children}
      </main>
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
      className={`bg-card border border-border rounded-[28px] shadow-[var(--shadow-soft)] ${className}`}
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
    blue: "bg-status-blue-bg text-status-blue",
    green: "bg-status-green-bg text-status-green",
    yellow: "bg-status-yellow-bg text-status-yellow",
    orange: "bg-status-orange-bg text-status-orange",
    red: "bg-status-red-bg text-status-red",
    purple: "bg-status-purple-bg text-status-purple",
  } as const;
  return (
    <span
      className={`inline-flex items-center gap-1.5 h-6 px-2.5 rounded-full text-[11px] font-medium ${map[tone]}`}
    >
      {children}
    </span>
  );
}
