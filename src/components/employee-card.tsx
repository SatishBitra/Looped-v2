import { useState, useEffect } from "react";
import {
  MessageSquare,
  Phone,
  Mail,
  Calendar as CalendarIcon,
  UserPlus,
  MoreHorizontal,
  ChevronRight,
  Sparkles,
  MapPin,
  Clock,
  Briefcase,
  CheckSquare,
  TrendingUp,
  FileText,
  UserCheck,
  X,
  Edit,
  Trash2,
  Lock,
  Plus,
  ArrowRight,
  Moon,
  AlertCircle,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";
import {
  Employee,
  PresenceStatus,
  EmploymentType,
  DepartmentType,
  PodType,
} from "../types/employee";

// Color maps for Microsoft Teams-inspired presence status
export const STATUS_COLORS: Record<
  PresenceStatus,
  { dot: string; border: string; bg: string; text: string }
> = {
  Online: {
    dot: "bg-emerald-500",
    border: "border-emerald-500",
    bg: "bg-emerald-500/10",
    text: "text-emerald-600 dark:text-emerald-400",
  },
  Busy: {
    dot: "bg-rose-500",
    border: "border-rose-500",
    bg: "bg-rose-500/10",
    text: "text-rose-600 dark:text-rose-400",
  },
  "In Meeting": {
    dot: "bg-purple-500",
    border: "border-purple-500",
    bg: "bg-purple-500/10",
    text: "text-purple-600 dark:text-purple-400",
  },
  "Focus Time": {
    dot: "bg-blue-500",
    border: "border-blue-500",
    bg: "bg-blue-500/10",
    text: "text-blue-600 dark:text-blue-400",
  },
  Away: {
    dot: "bg-amber-500",
    border: "border-amber-500",
    bg: "bg-amber-500/10",
    text: "text-amber-600 dark:text-amber-400",
  },
  Offline: {
    dot: "bg-neutral-400",
    border: "border-neutral-400",
    bg: "bg-neutral-400/10",
    text: "text-neutral-500 dark:text-neutral-400",
  },
  "Do Not Disturb": {
    dot: "bg-rose-600",
    border: "border-rose-600",
    bg: "bg-rose-600/10",
    text: "text-rose-700 dark:text-rose-300",
  },
};

// 1. Reusable Glass Card Container
export function GlassCard({
  children,
  className = "",
  onClick,
}: {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}) {
  return (
    <div
      onClick={onClick}
      className={`relative overflow-hidden bg-white/55 dark:bg-[#121926]/55 backdrop-blur-[28px] border border-white/35 dark:border-white/10 rounded-[32px] shadow-[0_20px_60px_rgba(20,20,20,0.08)] transition-all duration-300 ${
        onClick
          ? "cursor-pointer hover:-translate-y-1 hover:shadow-[0_25px_65px_rgba(20,20,20,0.12)]"
          : ""
      } ${className}`}
    >
      {/* Background soft radial gradient glow for depth */}
      <div className="absolute -inset-[100px] bg-gradient-to-tr from-transparent via-[#5A82E8]/3 to-transparent pointer-events-none -z-10" />
      {children}
    </div>
  );
}

// 2. Avatar with Presence Ring
export function AvatarWithPresence({
  avatar,
  status,
  name,
  size = "md",
  onEditClick,
}: {
  avatar: string;
  status: PresenceStatus;
  name: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  onEditClick?: () => void;
}) {
  const isImage = avatar.startsWith("http") || avatar.startsWith("/");

  const sizeMap = {
    xs: {
      container: "w-8 h-8",
      text: "text-xs",
      ringOffset: "border-2",
      badge: "w-2.5 h-2.5 border-1",
    },
    sm: {
      container: "w-11 h-11",
      text: "text-sm",
      ringOffset: "border-2",
      badge: "w-3 h-3 border-2",
    },
    md: {
      container: "w-16 h-16",
      text: "text-lg",
      ringOffset: "border-[3px]",
      badge: "w-4 h-4 border-[2px]",
    },
    lg: {
      container: "w-[96px] h-[96px]",
      text: "text-3xl",
      ringOffset: "border-4",
      badge: "w-6 h-6 border-[3px]",
    },
    xl: {
      container: "w-28 h-28",
      text: "text-4xl",
      ringOffset: "border-4",
      badge: "w-7 h-7 border-[3px]",
    },
  };

  const colors = STATUS_COLORS[status] || STATUS_COLORS.Offline;

  return (
    <div className="relative inline-block select-none group">
      {/* Outer Presence Ring */}
      <div className={`rounded-full p-[2px] transition-all duration-300 ${colors.bg}`}>
        <div
          className={`rounded-full overflow-hidden ${sizeMap[size].ringOffset} border-white dark:border-slate-900 ${sizeMap[size].container} relative bg-slate-100 dark:bg-slate-800 flex items-center justify-center`}
        >
          {isImage ? (
            <img
              src={avatar}
              alt={name}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <span
              className={`font-medium text-slate-600 dark:text-slate-300 ${sizeMap[size].text}`}
            >
              {avatar ||
                name
                  .split(" ")
                  .map((n) => n[0])
                  .slice(0, 2)
                  .join("")}
            </span>
          )}

          {/* Hover Edit Action Overlay */}
          {onEditClick && (
            <div
              onClick={(e) => {
                e.stopPropagation();
                onEditClick();
              }}
              className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
            >
              <Edit className="w-4 h-4 text-white" />
            </div>
          )}
        </div>
      </div>

      {/* Real Presence Badge Indicator (Teams Style) */}
      <div
        className={`absolute bottom-[2px] right-[2px] rounded-full ${colors.dot} border-white dark:border-slate-950 ${sizeMap[size].badge} flex items-center justify-center shadow-sm`}
        title={status}
      >
        {status === "Do Not Disturb" && <div className="w-1.5 h-0.5 bg-white rounded-full" />}
        {status === "Away" && <div className="w-1 h-1 bg-white rounded-full" />}
      </div>
    </div>
  );
}

// 3. Mini Calendar Component
export function MiniCalendar({ events }: { events: Employee["calendarEvents"] }) {
  return (
    <div className="bg-slate-50/50 dark:bg-slate-900/30 rounded-2xl p-4.5 border border-slate-100 dark:border-slate-800/40">
      <div className="flex items-center justify-between mb-3">
        <span className="text-[11px] text-slate-400 uppercase tracking-wider font-medium">
          Calendar Preview
        </span>
        <span className="text-[11px] text-slate-500 font-medium">Today</span>
      </div>
      <div className="space-y-2">
        {events.length === 0 ? (
          <div className="text-center py-4 text-xs text-slate-400 font-normal">
            No scheduled events today
          </div>
        ) : (
          events.map((ev) => {
            const toneMap = {
              meeting:
                "bg-purple-100 dark:bg-purple-950/30 text-purple-600 dark:text-purple-400 border-purple-200/40",
              focus:
                "bg-blue-100 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 border-blue-200/40",
              leave:
                "bg-neutral-100 dark:bg-neutral-850 text-neutral-600 dark:text-neutral-400 border-neutral-200/40",
              deadline:
                "bg-rose-100 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 border-rose-200/40",
            };

            return (
              <div
                key={ev.id}
                className={`p-2.5 rounded-xl border text-xs flex items-center justify-between ${toneMap[ev.type]}`}
              >
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-current" />
                  <span className="font-medium truncate max-w-[150px]">{ev.title}</span>
                </div>
                <span className="text-[10px] opacity-80 font-medium font-mono shrink-0">
                  {ev.time}
                </span>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

// 4. Employee Profile Card (XS / Small / Medium / Large Sizes)
export function EmployeeProfileCard({
  employee,
  size = "Large",
  onClick,
  onAssignWork,
  onMessage,
  onViewProfile,
  onDeleteRequest,
  onEditRequest,
}: {
  employee: Employee;
  size?: "XS" | "Small" | "Medium" | "Large";
  onClick?: () => void;
  onAssignWork?: (employee: Employee) => void;
  onMessage?: (employee: Employee) => void;
  onViewProfile?: (employee: Employee) => void;
  onDeleteRequest?: (employee: Employee) => void;
  onEditRequest?: (employee: Employee) => void;
}) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Return specific render based on size variant
  if (size === "XS") {
    return (
      <div
        onClick={onClick}
        className="inline-block cursor-pointer"
        title={`${employee.name} (${employee.role})`}
      >
        <AvatarWithPresence
          avatar={employee.avatar}
          status={employee.status}
          name={employee.name}
          size="xs"
        />
      </div>
    );
  }

  if (size === "Small") {
    return (
      <div
        onClick={onClick}
        className="flex items-center gap-2.5 p-1.5 rounded-2xl bg-white/20 dark:bg-slate-900/10 hover:bg-white/40 dark:hover:bg-slate-900/30 border border-transparent hover:border-slate-200/40 dark:hover:border-slate-800/20 cursor-pointer transition-all duration-200 select-none"
      >
        <AvatarWithPresence
          avatar={employee.avatar}
          status={employee.status}
          name={employee.name}
          size="sm"
        />
        <div className="min-w-0 pr-2">
          <div className="text-xs font-medium text-slate-800 dark:text-slate-200 truncate">
            {employee.name}
          </div>
          <div className="text-[10px] text-slate-400 dark:text-slate-500 truncate font-normal">
            {employee.role}
          </div>
        </div>
      </div>
    );
  }

  if (size === "Medium") {
    return (
      <GlassCard
        onClick={onClick}
        className="p-5 w-full max-w-[320px] bg-white/45 dark:bg-[#121926]/45"
      >
        <div className="flex items-start justify-between">
          <div className="flex gap-4">
            <AvatarWithPresence
              avatar={employee.avatar}
              status={employee.status}
              name={employee.name}
              size="md"
            />
            <div className="min-w-0">
              <h3 className="text-base font-medium text-slate-800 dark:text-slate-200 truncate leading-tight">
                {employee.name}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5 font-normal">
                {employee.role}
              </p>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-[10px] px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-full font-medium">
                  {employee.employmentType}
                </span>
                <span className="text-[10px] text-slate-400 font-medium">{employee.pod}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <span
              className={`w-2 h-2 rounded-full ${STATUS_COLORS[employee.status]?.dot || "bg-neutral-400"}`}
            />
            <span className="text-[10px] text-slate-500 font-medium font-mono">
              {employee.status}
            </span>
          </div>
        </div>

        {employee.currentActivity && (
          <div className="mt-4 pt-3.5 border-t border-slate-100 dark:border-slate-800/40 text-xs">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider font-medium">
              Currently
            </span>
            <div className="flex items-center justify-between mt-1">
              <span className="text-slate-600 dark:text-slate-300 font-medium truncate">
                {employee.currentActivity.title}
              </span>
              {employee.currentActivity.eta && (
                <span className="text-[10px] text-[#5A82E8] bg-[#5A82E8]/5 px-2 py-0.5 rounded font-medium font-mono shrink-0">
                  ETA {employee.currentActivity.eta}
                </span>
              )}
            </div>
          </div>
        )}
      </GlassCard>
    );
  }

  // LARGE PRIMARY GLASS PROFILE CARD
  const bannerBg =
    employee.bannerType === "solid"
      ? employee.bannerValue
      : employee.bannerType === "gradient"
        ? `bg-gradient-to-r ${employee.bannerValue}`
        : "bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500";

  return (
    <GlassCard className="w-full max-w-[400px] select-none flex flex-col group/large">
      {/* 1. Custom Banner */}
      <div className={`h-[110px] relative ${bannerBg} overflow-hidden w-full shrink-0`}>
        {employee.bannerType === "illustration" && (
          <div className="absolute inset-0 opacity-25 bg-[radial-gradient(circle_at_bottom_left,_var(--tw-gradient-stops))] from-yellow-200 via-pink-500 to-purple-800" />
        )}
        {employee.bannerType === "ai" && (
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: `url(${employee.bannerValue})` }}
          >
            <div className="absolute inset-0 bg-black/10 backdrop-blur-[2px]" />
          </div>
        )}
        {employee.bannerType === "company" && (
          <div className="absolute inset-0 flex items-center justify-center opacity-10 text-white font-mono text-[50px] tracking-widest leading-none">
            LOOOPED
          </div>
        )}

        {/* Action Controls on Banner */}
        <div className="absolute right-4 top-4 flex items-center gap-1.5 z-10">
          {onEditRequest && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEditRequest(employee);
              }}
              title="Edit Profile"
              className="w-8 h-8 rounded-full bg-black/20 hover:bg-black/40 backdrop-blur-md text-white flex items-center justify-center transition-all cursor-pointer border border-white/10"
            >
              <Edit className="w-3.5 h-3.5" />
            </button>
          )}

          {onDeleteRequest && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDeleteRequest(employee);
              }}
              title="Archive Employee"
              className="w-8 h-8 rounded-full bg-black/20 hover:bg-red-500/85 backdrop-blur-md text-white hover:text-white flex items-center justify-center transition-all cursor-pointer border border-white/10"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}

          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsMenuOpen(!isMenuOpen);
              }}
              title="More Actions"
              className="w-8 h-8 rounded-full bg-black/20 hover:bg-black/40 backdrop-blur-md text-white flex items-center justify-center transition-all cursor-pointer border border-white/10"
            >
              <MoreHorizontal className="w-4 h-4" />
            </button>

            <AnimatePresence>
              {isMenuOpen && (
                <>
                  <div className="fixed inset-0 z-30" onClick={() => setIsMenuOpen(false)} />
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: -10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -10 }}
                    className="absolute right-0 mt-2 w-48 rounded-2xl bg-white dark:bg-[#1c2436] border border-slate-100 dark:border-slate-800 p-2.5 shadow-xl z-40 text-left font-normal"
                  >
                    <button
                      onClick={() => {
                        setIsMenuOpen(false);
                        toast.success(`Scheduled sync meeting with ${employee.name}`);
                      }}
                      className="w-full text-left px-3 py-2 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-all flex items-center gap-2"
                    >
                      <CalendarIcon className="w-3.5 h-3.5" /> Schedule Sync
                    </button>
                    <button
                      onClick={() => {
                        setIsMenuOpen(false);
                        toast.info(`Opening ${employee.name}'s calendar...`);
                      }}
                      className="w-full text-left px-3 py-2 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-all flex items-center gap-2"
                    >
                      <Clock className="w-3.5 h-3.5" /> View Calendar
                    </button>
                    <button
                      onClick={() => {
                        setIsMenuOpen(false);
                        toast.info(`Opening open tasks assigned to ${employee.name}`);
                      }}
                      className="w-full text-left px-3 py-2 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-all flex items-center gap-2"
                    >
                      <CheckSquare className="w-3.5 h-3.5" /> Open Tasks
                    </button>
                    <button
                      onClick={() => {
                        setIsMenuOpen(false);
                        navigator.clipboard.writeText(employee.email);
                        toast.success("Email copied to clipboard!");
                      }}
                      className="w-full text-left px-3 py-2 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-all flex items-center gap-2 border-t border-slate-50 dark:border-slate-800 mt-1.5 pt-1.5"
                    >
                      <Mail className="w-3.5 h-3.5" /> Copy Email
                    </button>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* 2. Avatar with 4px Border overlapping the Banner */}
      <div className="px-6 relative -mt-[48px] flex items-end justify-between shrink-0">
        <AvatarWithPresence
          avatar={employee.avatar}
          status={employee.status}
          name={employee.name}
          size="lg"
          onEditClick={() => toast.info(`Change avatar for ${employee.name}`)}
        />

        {/* Employment and Department badges */}
        <div className="flex flex-col items-end gap-1 mb-2.5">
          <span className="text-[10px] px-2.5 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-full font-medium tracking-wide">
            {employee.employmentType}
          </span>
          <span className="text-[10px] text-slate-400 font-medium">
            {employee.department} · {employee.pod}
          </span>
        </div>
      </div>

      {/* 3. Employee Basic Information */}
      <div className="px-6 pt-3 shrink-0">
        <h2 className="text-[22px] font-medium tracking-tight text-slate-800 dark:text-slate-100 leading-tight">
          {employee.name}
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 font-normal mt-1 leading-normal">
          {employee.role}
        </p>

        {employee.bio && (
          <p className="text-xs text-slate-400 dark:text-slate-500 font-normal mt-2 line-clamp-2 leading-relaxed">
            {employee.bio}
          </p>
        )}
      </div>

      {/* Divider */}
      <div className="mx-6 border-b border-slate-100 dark:border-slate-800/40 my-4.5 shrink-0" />

      {/* 4. Current Activity / Assignment */}
      <div className="px-6 space-y-4 shrink-0">
        {employee.currentActivity && (
          <div className="text-xs">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider font-medium">
              Current Activity
            </span>
            <div className="flex items-center justify-between mt-1.5">
              <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span className="font-normal">{employee.currentActivity.title}</span>
              </div>
              <span className="text-[10px] text-slate-400 font-mono font-normal">
                Since {employee.currentActivity.startTime}
              </span>
            </div>
          </div>
        )}

        {employee.currentAssignment && (
          <div className="text-xs">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider font-medium">
              Active Assignment
            </span>
            <div
              onClick={() =>
                toast.info(`Opening details for task: ${employee.currentAssignment?.task}`)
              }
              className="flex items-center justify-between mt-1.5 p-2 bg-slate-50 hover:bg-slate-100/80 dark:bg-slate-900/40 dark:hover:bg-slate-800/40 rounded-xl border border-slate-100/50 dark:border-slate-800/20 cursor-pointer transition-all duration-200"
            >
              <div className="min-w-0 pr-2">
                <div className="font-medium text-slate-700 dark:text-slate-300 truncate">
                  {employee.currentAssignment.task}
                </div>
                <div className="text-[10px] text-slate-400 truncate font-normal mt-0.5">
                  {employee.currentAssignment.client} · {employee.currentAssignment.project}
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
            </div>
          </div>
        )}
      </div>

      {/* Divider */}
      <div className="mx-6 border-b border-slate-100 dark:border-slate-800/40 my-4.5 shrink-0" />

      {/* 5. Productivity metrics (Four cards stats) */}
      <div className="px-6 grid grid-cols-2 gap-2.5 shrink-0">
        <div className="p-3 bg-slate-50/50 dark:bg-slate-900/20 border border-slate-100/40 dark:border-slate-800/25 rounded-2xl">
          <div className="text-[10px] text-slate-400 uppercase tracking-wider font-medium">
            Active Tasks
          </div>
          <div className="text-base font-medium text-slate-700 dark:text-slate-300 mt-1">
            {employee.productivity.activeTasks}
          </div>
        </div>
        <div className="p-3 bg-slate-50/50 dark:bg-slate-900/20 border border-slate-100/40 dark:border-slate-800/25 rounded-2xl">
          <div className="text-[10px] text-slate-400 uppercase tracking-wider font-medium">
            Projects
          </div>
          <div className="text-base font-medium text-slate-700 dark:text-slate-300 mt-1">
            {employee.productivity.projects}
          </div>
        </div>
        <div className="p-3 bg-slate-50/50 dark:bg-slate-900/20 border border-slate-100/40 dark:border-slate-800/25 rounded-2xl">
          <div className="text-[10px] text-slate-400 uppercase tracking-wider font-medium">
            Logged Hours
          </div>
          <div className="text-base font-medium text-slate-700 dark:text-slate-300 mt-1">
            {employee.productivity.loggedHours} hrs
          </div>
        </div>
        <div className="p-3 bg-slate-50/50 dark:bg-slate-900/20 border border-slate-100/40 dark:border-slate-800/25 rounded-2xl">
          <div className="text-[10px] text-slate-400 uppercase tracking-wider font-medium">
            Completion Rate
          </div>
          <div className="text-base font-medium text-slate-700 dark:text-slate-300 mt-1">
            {employee.productivity.completionRate}%
          </div>
        </div>
      </div>

      {/* Spacer pushing actions to bottom */}
      <div className="flex-1 min-h-[18px]" />

      {/* 6. Quick Action and Contact Buttons */}
      <div className="p-6 pt-2 border-t border-slate-100/40 dark:border-slate-800/20 mt-auto shrink-0 flex flex-col gap-3">
        {/* Contact Quick Icons */}
        <div className="flex items-center justify-around py-1 bg-slate-50/30 dark:bg-slate-900/10 rounded-2xl border border-slate-100/20">
          <button
            onClick={() => onMessage?.(employee)}
            title="Send Message"
            className="p-2 text-slate-400 hover:text-[#5A82E8] hover:bg-[#5A82E8]/5 rounded-xl transition-all cursor-pointer"
          >
            <MessageSquare className="w-4 h-4" />
          </button>
          <button
            onClick={() => toast.success(`Calling ${employee.name} via VoIP...`)}
            title="Call Voice"
            className="p-2 text-slate-400 hover:text-emerald-500 hover:bg-emerald-500/5 rounded-xl transition-all cursor-pointer"
          >
            <Phone className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              window.location.href = `mailto:${employee.email}`;
              toast.info(`Opening default mail client to ${employee.email}`);
            }}
            title="Send Email"
            className="p-2 text-slate-400 hover:text-amber-500 hover:bg-amber-500/5 rounded-xl transition-all cursor-pointer"
          >
            <Mail className="w-4 h-4" />
          </button>
          <button
            onClick={() => toast.success(`Viewing calendar sync for ${employee.name}`)}
            title="Calendar View"
            className="p-2 text-slate-400 hover:text-purple-500 hover:bg-purple-500/5 rounded-xl transition-all cursor-pointer"
          >
            <CalendarIcon className="w-4 h-4" />
          </button>
          <button
            onClick={() => onAssignWork?.(employee)}
            title="Assign Task"
            className="p-2 text-slate-400 hover:text-indigo-500 hover:bg-indigo-500/5 rounded-xl transition-all cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
          </button>
        </div>

        {/* Primary and secondary button links */}
        <div className="flex items-center gap-2 w-full">
          <button
            onClick={() => onMessage?.(employee)}
            className="flex-1 h-9 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-900 transition-all cursor-pointer flex items-center justify-center gap-1"
          >
            Message
          </button>
          <button
            onClick={() => onAssignWork?.(employee)}
            className="flex-1 h-9 rounded-xl bg-[#5A82E8] hover:bg-[#5A82E8]/95 text-white text-xs font-medium transition-all cursor-pointer flex items-center justify-center gap-1"
          >
            Assign Task
          </button>
          <button
            onClick={() => onViewProfile?.(employee)}
            className="h-9 w-9 shrink-0 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-900 transition-all cursor-pointer flex items-center justify-center"
            title="Expanded Profile"
          >
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </GlassCard>
  );
}

// 5. Expanded Profile Drawer Component
export function ExpandedProfileDrawer({
  employee,
  isOpen,
  onClose,
  onAssignWork,
  onMessage,
}: {
  employee: Employee | null;
  isOpen: boolean;
  onClose: () => void;
  onAssignWork?: (employee: Employee) => void;
  onMessage?: (employee: Employee) => void;
}) {
  const [activeTab, setActiveTab] = useState<"Overview" | "Timeline" | "Calendar">("Overview");

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!employee) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 z-50 backdrop-blur-sm"
          />

          {/* Drawer Sheet */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 180 }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-[550px] bg-white dark:bg-[#0d121f] border-l border-slate-200 dark:border-slate-800/80 z-50 shadow-2xl p-0 flex flex-col overflow-hidden font-normal"
          >
            {/* Custom Banner in Drawer Header */}
            <div
              className={`h-[150px] relative ${
                employee.bannerType === "solid"
                  ? employee.bannerValue
                  : employee.bannerType === "gradient"
                    ? `bg-gradient-to-r ${employee.bannerValue}`
                    : "bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500"
              } w-full shrink-0`}
            >
              <button
                onClick={onClose}
                className="absolute right-4 top-4 w-9 h-9 rounded-full bg-black/30 hover:bg-black/55 backdrop-blur-md text-white flex items-center justify-center transition-all cursor-pointer border border-white/10"
              >
                <X className="w-4.5 h-4.5" />
              </button>
            </div>

            {/* Profile Avatar Overlay */}
            <div className="px-8 relative -mt-12 shrink-0 flex items-end justify-between">
              <AvatarWithPresence
                avatar={employee.avatar}
                status={employee.status}
                name={employee.name}
                size="xl"
              />
              <div className="flex flex-col items-end gap-1 mb-1.5 text-right">
                <span className="text-[11px] px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-full font-medium">
                  {employee.employmentType}
                </span>
                <span className="text-[11px] text-slate-400 font-medium">
                  {employee.department} · {employee.pod}
                </span>
              </div>
            </div>

            {/* Title & Info */}
            <div className="px-8 pt-4 shrink-0">
              <h2 className="text-2xl font-medium tracking-tight text-slate-800 dark:text-slate-100 leading-tight">
                {employee.name}
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 font-normal">
                {employee.role}
              </p>
              <div className="flex items-center gap-4 text-xs text-slate-400 mt-2">
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5" /> {employee.location}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" /> {employee.workingHours}
                </span>
              </div>
            </div>

            {/* Tab selection */}
            <div className="px-8 border-b border-slate-100 dark:border-slate-800/40 mt-6 shrink-0 flex gap-6">
              {(["Overview", "Timeline", "Calendar"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`pb-3 text-sm font-medium border-b-2 transition-all relative cursor-pointer ${
                    activeTab === tab
                      ? "text-[#5A82E8] border-[#5A82E8]"
                      : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 border-transparent"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Scrollable Content Body */}
            <div className="flex-1 overflow-y-auto p-8 space-y-6">
              {activeTab === "Overview" && (
                <div className="space-y-6">
                  {/* Bio */}
                  {employee.bio && (
                    <div className="space-y-1.5">
                      <h4 className="text-xs uppercase tracking-wider text-slate-400 font-medium">
                        Professional Biography
                      </h4>
                      <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
                        {employee.bio}
                      </p>
                    </div>
                  )}

                  {/* Monthly Performance statistics */}
                  <div className="space-y-2">
                    <h4 className="text-xs uppercase tracking-wider text-slate-400 font-medium">
                      Monthly Performance
                    </h4>
                    <div className="grid grid-cols-2 gap-3.5">
                      <div className="bg-slate-50/60 dark:bg-slate-900/40 p-4 rounded-2xl border border-slate-100/50 dark:border-slate-800/20">
                        <span className="text-[11px] text-slate-400 font-medium">
                          Tasks Completed
                        </span>
                        <div className="text-[20px] font-medium text-slate-800 dark:text-slate-200 mt-1">
                          {employee.stats.completed}
                        </div>
                        <p className="text-[10px] text-slate-400 mt-1 font-normal">
                          Active deliverables
                        </p>
                      </div>

                      <div className="bg-slate-50/60 dark:bg-slate-900/40 p-4 rounded-2xl border border-slate-100/50 dark:border-slate-800/20">
                        <span className="text-[11px] text-slate-400 font-medium">
                          Total logged hours
                        </span>
                        <div className="text-[20px] font-medium text-slate-800 dark:text-slate-200 mt-1">
                          {employee.stats.timeLogged} hrs
                        </div>
                        <p className="text-[10px] text-slate-400 mt-1 font-normal">
                          Current month logs
                        </p>
                      </div>

                      <div className="bg-slate-50/60 dark:bg-slate-900/40 p-4 rounded-2xl border border-slate-100/50 dark:border-slate-800/20">
                        <span className="text-[11px] text-slate-400 font-medium">
                          Approvals handled
                        </span>
                        <div className="text-[20px] font-medium text-slate-800 dark:text-slate-200 mt-1">
                          {employee.stats.approvals}
                        </div>
                        <p className="text-[10px] text-slate-400 mt-1 font-normal">
                          Approvals this quarter
                        </p>
                      </div>

                      <div className="bg-slate-50/60 dark:bg-slate-900/40 p-4 rounded-2xl border border-slate-100/50 dark:border-slate-800/20">
                        <span className="text-[11px] text-slate-400 font-medium">
                          Experience with Loooped
                        </span>
                        <div className="text-[20px] font-medium text-slate-800 dark:text-slate-200 mt-1">
                          {employee.stats.experience} yrs
                        </div>
                        <p className="text-[10px] text-slate-400 mt-1 font-normal">
                          Team seniority multiplier
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Active Task / Handoff info */}
                  {employee.currentAssignment && (
                    <div className="space-y-2">
                      <h4 className="text-xs uppercase tracking-wider text-slate-400 font-medium">
                        Active Deliverables
                      </h4>
                      <div className="p-4 rounded-2xl bg-slate-50/40 dark:bg-slate-900/30 border border-slate-100/40 dark:border-slate-800/30">
                        <div className="text-xs text-[#5A82E8] font-medium uppercase font-mono tracking-wider">
                          {employee.currentAssignment.client}
                        </div>
                        <div className="text-sm font-medium text-slate-700 dark:text-slate-200 mt-1">
                          {employee.currentAssignment.task}
                        </div>
                        <div className="text-xs text-slate-400 mt-0.5 font-normal">
                          Project: {employee.currentAssignment.project}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Quick Contact Specs */}
                  <div className="space-y-2 pt-2 border-t border-slate-100/40 dark:border-slate-800/20">
                    <h4 className="text-xs uppercase tracking-wider text-slate-400 font-medium">
                      Contact Credentials
                    </h4>
                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between py-1.5 border-b border-slate-50 dark:border-slate-900">
                        <span className="text-slate-400">Email Address</span>
                        <span className="text-slate-700 dark:text-slate-300 font-mono select-all">
                          {employee.email}
                        </span>
                      </div>
                      <div className="flex justify-between py-1.5 border-b border-slate-50 dark:border-slate-900">
                        <span className="text-slate-400">Direct Phone</span>
                        <span className="text-slate-700 dark:text-slate-300 font-mono select-all">
                          {employee.phone}
                        </span>
                      </div>
                      <div className="flex justify-between py-1.5">
                        <span className="text-slate-400">Office Coordinates</span>
                        <span className="text-slate-700 dark:text-slate-300">
                          {employee.location}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "Timeline" && (
                <div className="space-y-5">
                  <h4 className="text-xs uppercase tracking-wider text-slate-400 font-medium">
                    Activity Timeline
                  </h4>
                  <div className="relative pl-6 border-l border-slate-100 dark:border-slate-800 space-y-6">
                    {employee.timeline.length === 0 ? (
                      <div className="text-center py-6 text-xs text-slate-400 font-normal">
                        No recent activities recorded
                      </div>
                    ) : (
                      employee.timeline.map((act) => {
                        const iconMap = {
                          completed: "bg-emerald-500/10 text-emerald-500",
                          commented: "bg-blue-500/10 text-blue-500",
                          approved: "bg-purple-500/10 text-purple-500",
                          meeting: "bg-amber-500/10 text-amber-500",
                          status: "bg-neutral-500/10 text-neutral-500",
                        };

                        return (
                          <div key={act.id} className="relative">
                            {/* Dot on line */}
                            <span className="absolute -left-[31px] top-1.5 w-2.5 h-2.5 rounded-full bg-slate-200 dark:bg-slate-700 border-2 border-white dark:border-slate-950" />

                            <div className="flex items-start justify-between gap-4">
                              <div>
                                <p className="text-xs text-slate-600 dark:text-slate-300 font-normal leading-normal">
                                  {act.text}
                                </p>
                                <span className="text-[10px] text-slate-400 mt-1 block font-mono font-normal">
                                  {act.timestamp}
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              )}

              {activeTab === "Calendar" && (
                <div className="space-y-4">
                  <MiniCalendar events={employee.calendarEvents} />
                </div>
              )}
            </div>

            {/* Bottom Actions Row */}
            <div className="p-6 border-t border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/20 flex gap-3 shrink-0">
              <button
                onClick={() => {
                  onMessage?.(employee);
                  onClose();
                }}
                className="flex-1 h-10 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-900 transition-all cursor-pointer flex items-center justify-center"
              >
                Message Profile
              </button>
              <button
                onClick={() => {
                  onAssignWork?.(employee);
                  onClose();
                }}
                className="flex-1 h-10 rounded-xl bg-[#5A82E8] hover:bg-[#5A82E8]/95 text-white text-xs font-medium transition-all cursor-pointer flex items-center justify-center"
              >
                Assign New Deliverable
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// 6. Assignment modal with workload warnings
export function TaskAssignmentModal({
  employee,
  isOpen,
  onClose,
  onConfirm,
}: {
  employee: Employee | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (
    employee: Employee,
    taskName: string,
    clientName: string,
    projectName: string,
  ) => void;
}) {
  const [taskName, setTaskName] = useState("");
  const [clientName, setClientName] = useState("Northwind");
  const [projectName, setProjectName] = useState("Brand guidelines");

  if (!employee) return null;

  // Let's check status to warn if employee is not available (e.g. Busy, Meeting, Focus Time)
  const isBusy =
    employee.status === "Busy" ||
    employee.status === "In Meeting" ||
    employee.status === "Do Not Disturb" ||
    employee.status === "Focus Time";

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-55 flex items-center justify-center p-4 overflow-hidden select-none">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/50 backdrop-blur-xs"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            className="bg-white dark:bg-[#121927] border border-slate-200 dark:border-slate-800 p-6 rounded-[28px] shadow-2xl relative w-full max-w-[420px] z-55 font-normal"
          >
            <h3 className="text-base font-medium text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-[#5A82E8]" />
              <span>Assign Work to {employee.name}</span>
            </h3>

            {/* Micro warning indicator if status is busy/focus/meeting */}
            {isBusy && (
              <div className="mt-4 p-3.5 bg-rose-50/60 dark:bg-rose-950/20 border border-rose-100/50 dark:border-rose-900/30 rounded-xl flex items-start gap-2.5 text-xs text-rose-700 dark:text-rose-300">
                <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium">Status Warning: Already engaged</p>
                  <p className="opacity-90 mt-0.5 font-normal">
                    {employee.name} is currently flagged as{" "}
                    <span className="font-medium">"{employee.status}"</span>. Assign anyway or
                    choose another available teammate.
                  </p>
                </div>
              </div>
            )}

            <div className="space-y-4 mt-5">
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-medium text-slate-400">
                  Task Deliverable Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Redesign Product Details drawer"
                  value={taskName}
                  onChange={(e) => setTaskName(e.target.value)}
                  className="w-full h-9 px-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-medium text-slate-400">Client</label>
                  <select
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    className="w-full h-9 px-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none text-slate-600 dark:text-slate-300"
                  >
                    <option value="Northwind">Northwind</option>
                    <option value="Kite Motors">Kite Motors</option>
                    <option value="Aurora Coffee">Aurora Coffee</option>
                    <option value="Helix Health">Helix Health</option>
                    <option value="Meridian">Meridian</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-medium text-slate-400">
                    Project
                  </label>
                  <input
                    type="text"
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    className="w-full h-9 px-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-2.5 mt-6 pt-4 border-t border-slate-100 dark:border-slate-800/40">
              <button
                onClick={onClose}
                className="flex-1 h-9.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900 transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                disabled={!taskName.trim()}
                onClick={() => {
                  onConfirm(employee, taskName, clientName, projectName);
                  setTaskName("");
                  onClose();
                }}
                className="flex-1 h-9.5 rounded-xl bg-[#5A82E8] hover:opacity-95 text-white text-xs font-medium transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                Assign Anyway
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

// 7. Loading Skeletons
export function EmployeeSkeleton() {
  return (
    <div className="w-full max-w-[400px] h-[480px] rounded-[32px] border border-slate-100 dark:border-slate-850 p-0 overflow-hidden bg-slate-50/40 dark:bg-slate-900/10 animate-pulse flex flex-col justify-between">
      <div className="h-[110px] bg-slate-200/50 dark:bg-slate-800/40" />
      <div className="px-6 -mt-12">
        <div className="w-[96px] h-[96px] rounded-full bg-slate-200 dark:bg-slate-800 border-4 border-white dark:border-slate-950" />
      </div>
      <div className="px-6 space-y-2 pt-3">
        <div className="h-6 w-1/2 bg-slate-200 dark:bg-slate-800 rounded-lg" />
        <div className="h-4 w-3/4 bg-slate-100 dark:bg-slate-850 rounded-lg" />
      </div>
      <div className="px-6 my-4">
        <div className="border-b border-slate-100 dark:border-slate-850" />
      </div>
      <div className="px-6 space-y-3">
        <div className="h-4 w-1/3 bg-slate-100 dark:bg-slate-850 rounded-lg" />
        <div className="h-10 bg-slate-100 dark:bg-slate-850 rounded-xl" />
      </div>
      <div className="px-6 my-4">
        <div className="border-b border-slate-100 dark:border-slate-850" />
      </div>
      <div className="px-6 grid grid-cols-2 gap-2">
        <div className="h-12 bg-slate-100 dark:bg-slate-850 rounded-2xl" />
        <div className="h-12 bg-slate-100 dark:bg-slate-850 rounded-2xl" />
      </div>
      <div className="p-6 mt-auto flex gap-2">
        <div className="flex-1 h-9 bg-slate-200/60 dark:bg-slate-800/40 rounded-xl" />
        <div className="flex-1 h-9 bg-slate-200/60 dark:bg-slate-800/40 rounded-xl" />
      </div>
    </div>
  );
}

// 8. Empty state
export function EmployeeEmptyState({ onReset }: { onReset: () => void }) {
  return (
    <div className="text-center py-16 px-6 max-w-sm mx-auto select-none">
      <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-850 text-slate-400 flex items-center justify-center mx-auto mb-4">
        <Sparkles className="w-7 h-7" />
      </div>
      <h3 className="text-base font-medium text-slate-800 dark:text-slate-200">
        No employees match filters
      </h3>
      <p className="text-xs text-slate-400 dark:text-slate-500 mt-2 leading-relaxed">
        Try adjusting your query, department, or presence filters to locate your teammates.
      </p>
      <button
        onClick={onReset}
        className="mt-5 h-9 px-4.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900 transition-all cursor-pointer"
      >
        Clear Filters
      </button>
    </div>
  );
}
