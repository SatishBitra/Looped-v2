import { useState, useEffect, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Bell,
  Check,
  CheckCircle2,
  Trash2,
  Archive,
  VolumeX,
  Volume2,
  Pin,
  Clock,
  ChevronRight,
  X,
  Search,
  Filter,
  CheckSquare,
  Users,
  AlertTriangle,
  Folder,
  Sliders,
  Settings2,
  Mail,
  Smartphone,
  Tv,
  VolumePlus,
  Moon,
  AlertCircle,
  Sparkles,
  Download,
  ExternalLink,
  MessageSquare,
  UserPlus,
  Play,
  Heart,
  HelpCircle,
  FileText,
  User,
  PlusCircle,
  Paperclip,
  CheckSquare2,
} from "lucide-react";
import {
  Notification,
  NotifType,
  NotificationSettings,
  notificationStore,
} from "@/lib/notifications-store";
import { toast } from "sonner";
import { Link } from "@tanstack/react-router";

// Helper to map notification type to color palette
export function getNotifTypeColor(type: NotifType) {
  switch (type) {
    case "task":
      return {
        bg: "bg-blue-50 dark:bg-blue-950/25",
        text: "text-blue-700 dark:text-blue-300",
        border: "border-blue-100 dark:border-blue-900/30",
        pill: "bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300",
        hex: "#3b82f6",
      };
    case "approval":
      return {
        bg: "bg-purple-50 dark:bg-purple-950/25",
        text: "text-purple-700 dark:text-purple-300",
        border: "border-purple-100 dark:border-purple-900/30",
        pill: "bg-purple-100 dark:bg-purple-900/40 text-purple-800 dark:text-purple-300",
        hex: "#a855f7",
      };
    case "due_date":
      return {
        bg: "bg-amber-50 dark:bg-amber-950/25",
        text: "text-amber-700 dark:text-amber-300",
        border: "border-amber-100 dark:border-amber-900/30",
        pill: "bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300",
        hex: "#f59e0b",
      };
    case "overdue":
      return {
        bg: "bg-red-50 dark:bg-red-950/25",
        text: "text-red-700 dark:text-red-300",
        border: "border-red-100 dark:border-red-900/30",
        pill: "bg-red-100 dark:bg-red-900/40 text-red-800 dark:text-red-300",
        hex: "#ef4444",
      };
    case "capacity":
      return {
        bg: "bg-orange-50 dark:bg-orange-950/25",
        text: "text-orange-700 dark:text-orange-300",
        border: "border-orange-100 dark:border-orange-900/30",
        pill: "bg-orange-100 dark:bg-orange-900/40 text-orange-800 dark:text-orange-300",
        hex: "#f97316",
      };
    case "meeting":
      return {
        bg: "bg-green-50 dark:bg-green-950/25",
        text: "text-green-700 dark:text-green-300",
        border: "border-green-100 dark:border-green-900/30",
        pill: "bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-300",
        hex: "#22c55e",
      };
    case "message":
      return {
        bg: "bg-gray-50 dark:bg-gray-800/25",
        text: "text-gray-700 dark:text-gray-300",
        border: "border-gray-100 dark:border-gray-800",
        pill: "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300",
        hex: "#6b7280",
      };
    case "file":
      return {
        bg: "bg-cyan-50 dark:bg-cyan-950/25",
        text: "text-cyan-700 dark:text-cyan-300",
        border: "border-cyan-100 dark:border-cyan-900/30",
        pill: "bg-cyan-100 dark:bg-cyan-900/40 text-cyan-800 dark:text-cyan-300",
        hex: "#06b6d4",
      };
    case "client":
      return {
        bg: "bg-indigo-50 dark:bg-indigo-950/25",
        text: "text-indigo-700 dark:text-indigo-300",
        border: "border-indigo-100 dark:border-indigo-900/30",
        pill: "bg-indigo-100 dark:bg-indigo-900/40 text-indigo-800 dark:text-indigo-300",
        hex: "#6366f1",
      };
    case "system":
      return {
        bg: "bg-slate-100 dark:bg-slate-900/30",
        text: "text-slate-800 dark:text-slate-300",
        border: "border-slate-200 dark:border-slate-800",
        pill: "bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-300",
        hex: "#0f172a",
      };
  }
}

// Map notification type to Icon
export function getNotifIcon(type: NotifType) {
  switch (type) {
    case "task":
      return CheckSquare2;
    case "approval":
      return Users;
    case "due_date":
      return Clock;
    case "overdue":
      return AlertTriangle;
    case "capacity":
      return Sliders;
    case "meeting":
      return Bell;
    case "message":
      return MessageSquare;
    case "file":
      return Paperclip;
    case "client":
      return UserPlus;
    case "system":
      return AlertCircle;
  }
}

// Relative date helper
export function getRelativeGroup(timestamp: Date): "Today" | "Yesterday" | "This Week" | "Earlier" {
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - timestamp.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays <= 1 && now.getDate() === timestamp.getDate()) {
    return "Today";
  } else if (diffDays <= 2 && now.getDate() - timestamp.getDate() === 1) {
    return "Yesterday";
  } else if (diffDays <= 7) {
    return "This Week";
  } else {
    return "Earlier";
  }
}

// Notification Avatar component
export function NotificationAvatar({ initials, name }: { initials: string; name: string }) {
  return (
    <div
      className="w-9 h-9 rounded-full bg-[#5A82E8]/10 text-[#5A82E8] border border-[#5A82E8]/20 flex items-center justify-center text-xs font-bold font-mono shrink-0"
      title={name}
    >
      {initials}
    </div>
  );
}

// 1. Loading Skeleton
export function NotificationSkeleton() {
  return (
    <div className="space-y-3.5 p-1">
      {Array.from({ length: 5 }).map((_, idx) => (
        <div
          key={idx}
          className="flex gap-3.5 p-4 bg-card/60 rounded-[20px] border border-border/40 animate-pulse"
        >
          <div className="w-9 h-9 rounded-full bg-border/50 shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2">
              <div className="h-4 bg-border/60 rounded-md w-1/3" />
              <div className="h-3.5 bg-border/40 rounded-full w-12" />
            </div>
            <div className="h-3.5 bg-border/40 rounded-md w-3/4" />
            <div className="flex items-center gap-4 mt-2">
              <div className="h-3 bg-border/40 rounded-md w-16" />
              <div className="h-3 bg-border/40 rounded-md w-12" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// 2. Empty State
export function NotificationEmptyState({ onGoDashboard }: { onGoDashboard?: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center select-none">
      <div className="w-16 h-16 rounded-full bg-[#33A579]/10 text-[#33A579] flex items-center justify-center mb-4">
        <Sparkles className="w-8 h-8" />
      </div>
      <h3 className="text-[16px] font-semibold text-foreground">You're all caught up! 🎉</h3>
      <p className="text-xs text-muted-foreground mt-1 max-w-[280px]">
        No unread tasks, alerts, or messages require action right now. Enjoy your day!
      </p>
      {onGoDashboard && (
        <button
          onClick={onGoDashboard}
          className="mt-6 h-9 px-4 rounded-xl bg-[#5A82E8] hover:opacity-95 text-white text-xs font-semibold shadow-xs"
        >
          Go to Dashboard
        </button>
      )}
    </div>
  );
}

// 3. Error State
export function NotificationErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center select-none">
      <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mb-3">
        <AlertTriangle className="w-6 h-6" />
      </div>
      <h3 className="text-sm font-semibold text-foreground">Couldn't load notifications</h3>
      <p className="text-xs text-muted-foreground mt-0.5">
        Please check your network and try again.
      </p>
      <button
        onClick={onRetry}
        className="mt-4 h-8 px-3 rounded-lg bg-[#5A82E8] text-white text-xs font-semibold"
      >
        Retry
      </button>
    </div>
  );
}

// 4. Mute/Pin/Delete/Archive overflow buttons inside card hover or overflow menu
interface ActionMenuProps {
  notification: Notification;
  onClose: () => void;
}

export function NotificationActionButtons({
  notification,
  onOpenDetails,
  onDeleteRequest,
}: {
  notification: Notification;
  onOpenDetails: () => void;
  onDeleteRequest: () => void;
}) {
  const isRead = notification.status === "read";
  const isArchived = notification.status === "archived";

  return (
    <div className="flex items-center gap-1">
      {/* Read Toggle */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          if (isRead) {
            notificationStore.markAsUnread(notification.id);
          } else {
            notificationStore.markAsRead(notification.id);
          }
        }}
        className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors ${
          isRead
            ? "text-muted-foreground hover:bg-black/5 dark:hover:bg-white/5"
            : "text-[#5A82E8] bg-[#5A82E8]/10 hover:bg-[#5A82E8]/15"
        }`}
        title={isRead ? "Mark as unread" : "Mark as read"}
      >
        <Check className="w-3.5 h-3.5" />
      </button>

      {/* Pin Toggle */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          notificationStore.pin(notification.id);
        }}
        className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors ${
          notification.pinned
            ? "text-amber-500 bg-amber-500/10"
            : "text-muted-foreground hover:bg-black/5 dark:hover:bg-white/5"
        }`}
        title="Pin notification"
      >
        <Pin className="w-3.5 h-3.5" />
      </button>

      {/* Mute Toggle */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          notificationStore.mute(notification.id);
        }}
        className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors ${
          notification.muted
            ? "text-red-500 bg-red-500/10"
            : "text-muted-foreground hover:bg-black/5 dark:hover:bg-white/5"
        }`}
        title={notification.muted ? "Unmute thread" : "Mute thread"}
      >
        {notification.muted ? (
          <VolumeX className="w-3.5 h-3.5" />
        ) : (
          <Volume2 className="w-3.5 h-3.5" />
        )}
      </button>

      {/* Archive */}
      {!isArchived && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            notificationStore.archive(notification.id);
          }}
          className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
          title="Archive notification"
        >
          <Archive className="w-3.5 h-3.5" />
        </button>
      )}

      {/* Delete Trigger */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onDeleteRequest();
        }}
        className="w-7 h-7 rounded-lg flex items-center justify-center text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors"
        title="Delete notification"
      >
        <Trash2 className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

// 5. Smart CTA actions handler
export function executeSmartAction(id: string, action: string) {
  if (action === "Accept") {
    toast.success("Task accepted! Workflow progressing.");
    notificationStore.markAsRead(id);
    // Simulate updating notification title
    notificationStore.getNotifications().forEach((n) => {
      if (n.id === id) {
        n.title = "Task accepted successfully ✓";
        n.description = "Homepage UI Redesign - you have accepted the task.";
        n.smartActions = ["Open"];
      }
    });
  } else if (action === "Decline") {
    toast.warning("Task declined. Notification routed back to manager.");
    notificationStore.delete(id);
  } else if (action === "Approve") {
    toast.success("Design approved! Committing to Developer Pod workspace.");
    notificationStore.markAsRead(id);
    notificationStore.getNotifications().forEach((n) => {
      if (n.id === id) {
        n.title = "Motion boards approved ✓";
        n.description = "Sign-off complete. Moving to sprint timeline.";
        n.smartActions = ["Review"];
      }
    });
  } else if (action === "Reject") {
    toast.info("Design rejected. Luca F. notified.");
    notificationStore.markAsRead(id);
  } else if (action === "Join") {
    toast.success("Joining Google Meet call...");
    window.open("https://meet.google.com/ux-huddle-loooped", "_blank");
  } else if (action === "Regularize") {
    toast.info("Opening regularization filing form...");
  } else if (action === "Preview") {
    toast.info("Generating style guide asset preview...");
  } else if (action === "Reply") {
    toast.info("Opening reply dialogue in messages tab.");
  } else {
    toast.info(`Smart action triggered: ${action}`);
  }
}

// 6. Notification Card Component with Hover Actions
export function NotificationCard({
  notification,
  selected,
  onClick,
  onOpenDetails,
  onDeleteRequest,
  showSelectionBox = false,
  isChecked = false,
  onToggleCheck,
}: {
  notification: Notification;
  selected: boolean;
  onClick: () => void;
  onOpenDetails: () => void;
  onDeleteRequest: () => void;
  showSelectionBox?: boolean;
  isChecked?: boolean;
  onToggleCheck?: () => void;
}) {
  const c = getNotifTypeColor(notification.type);
  const Icon = getNotifIcon(notification.type);
  const isUnread = notification.status === "unread";

  return (
    <div
      onClick={onClick}
      className={`group relative flex gap-3.5 p-4 rounded-2xl border transition-all cursor-pointer select-none ${
        selected
          ? "bg-[#5A82E8]/5 border-[#5A82E8]/40 shadow-xs"
          : isUnread
            ? "bg-white dark:bg-[#162135]/40 border-border/60 hover:border-border"
            : "bg-white/40 dark:bg-transparent border-border/20 opacity-80 hover:opacity-100 hover:border-border/50"
      }`}
    >
      {/* Red/Blue unread dot */}
      {isUnread && (
        <span className="absolute left-2.5 top-4 w-1.5 h-1.5 rounded-full bg-[#E4664F]" />
      )}

      {/* Checkbox for bulk actions */}
      {showSelectionBox && (
        <div
          onClick={(e) => {
            e.stopPropagation();
            onToggleCheck?.();
          }}
          className="flex items-center justify-center shrink-0 pr-1"
        >
          <input
            type="checkbox"
            checked={isChecked}
            onChange={() => {}}
            className="rounded border-gray-300 dark:border-gray-600 text-[#5A82E8] focus:ring-[#5A82E8] h-3.5 w-3.5 cursor-pointer"
          />
        </div>
      )}

      {/* Avatar / Icon Overlapping */}
      <div className="relative shrink-0 select-none">
        <NotificationAvatar
          initials={notification.sender.avatarInitials}
          name={notification.sender.name}
        />
        <div
          className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full ${c.bg} ${c.text} flex items-center justify-center border-2 border-white dark:border-[#162135] shadow-xs`}
        >
          <Icon className="w-2.5 h-2.5" />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[13px] font-semibold text-foreground leading-none">
            {notification.title}
          </span>
          <span className="text-[10px] text-muted-foreground font-mono bg-slate-50 dark:bg-slate-900/60 px-1.5 py-0.5 rounded-sm">
            {notification.project}
          </span>
          {notification.pinned && (
            <Pin className="w-3 h-3 text-amber-500 fill-amber-500 rotate-45" />
          )}
        </div>

        <p className="text-xs text-muted-foreground mt-1 leading-relaxed line-clamp-2">
          {notification.description}
        </p>

        {/* Smart action triggers */}
        {notification.smartActions.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 mt-3">
            {notification.smartActions.map((act) => (
              <button
                key={act}
                onClick={(e) => {
                  e.stopPropagation();
                  executeSmartAction(notification.id, act);
                }}
                className={`h-7 px-3.5 rounded-lg text-[11px] font-bold transition-all ${
                  act === "Accept" || act === "Approve" || act === "Join"
                    ? "bg-[#5A82E8] text-white hover:opacity-90 shadow-xs"
                    : "bg-slate-100 dark:bg-slate-850 hover:bg-slate-200 dark:hover:bg-slate-800 text-foreground"
                }`}
              >
                {act}
              </button>
            ))}
          </div>
        )}

        <div className="flex items-center gap-3 mt-3.5 text-[10px] font-medium text-muted-foreground">
          <span className="capitalize">{notification.type} alert</span>
          <span>•</span>
          <span>{notification.time}</span>
          {notification.priority && (
            <>
              <span>•</span>
              <span
                className={`uppercase font-bold ${
                  notification.priority === "HIGH"
                    ? "text-red-500"
                    : notification.priority === "MEDIUM"
                      ? "text-amber-500"
                      : "text-blue-500"
                }`}
              >
                {notification.priority}
              </span>
            </>
          )}
        </div>
      </div>

      {/* Hover reveal tool drawer */}
      <div className="hidden group-hover:flex absolute right-4 top-4 bg-white/95 dark:bg-[#1a1a20] p-1.5 rounded-xl border border-border/80 shadow-md backdrop-blur-xs items-center gap-1 z-10 transition-all">
        <NotificationActionButtons
          notification={notification}
          onOpenDetails={onOpenDetails}
          onDeleteRequest={onDeleteRequest}
        />
        <button
          onClick={(e) => {
            e.stopPropagation();
            onOpenDetails();
          }}
          className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-black/5 dark:hover:bg-white/5"
          title="Open Action detail panel"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

// 7. Notification Details Drawer (Slides from the right)
export function NotificationDetailDrawer({
  notification,
  isOpen,
  onClose,
}: {
  notification: Notification | null;
  isOpen: boolean;
  onClose: () => void;
}) {
  const [commentText, setCommentText] = useState("");
  const detailRef = useRef<HTMLDivElement>(null);

  // Focus return on close
  useEffect(() => {
    if (!isOpen) {
      // Find the trigger and restore focus (best-effort)
      const trigger = document.getElementById("notif-bell-trigger");
      trigger?.focus();
    }
  }, [isOpen]);

  if (!isOpen || !notification) return null;

  const handlePostComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    if (notification.comments) {
      notification.comments.push({
        user: "Sandy (You)",
        text: commentText,
        time: "Just now",
      });
    } else {
      notification.comments = [
        {
          user: "Sandy (You)",
          text: commentText,
          time: "Just now",
        },
      ];
    }
    toast.success("Comment added to thread");
    setCommentText("");
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-hidden select-none">
        {/* Backdrop overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.4 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/60 backdrop-blur-xs"
        />

        {/* Slide-out Panel */}
        <motion.div
          ref={detailRef}
          initial={{ x: "100%" }}
          animate={{ x: 0 }}
          exit={{ x: "100%" }}
          transition={{ type: "spring", damping: 25, stiffness: 220 }}
          className="absolute right-0 top-0 bottom-0 w-full sm:w-[460px] bg-white dark:bg-[#121824] shadow-2xl border-l border-border flex flex-col z-50 h-full"
        >
          {/* Header */}
          <div className="p-5 border-b border-border/50 flex items-center justify-between bg-slate-50 dark:bg-slate-900/40">
            <div>
              <p className="text-[10px] uppercase font-bold text-[#5A82E8] tracking-widest leading-none mb-1">
                Action Center • Detail
              </p>
              <h2 className="text-sm font-bold text-foreground">{notification.project} Handoff</h2>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full hover:bg-black/5 dark:hover:bg-white/5 flex items-center justify-center text-muted-foreground hover:text-foreground transition-all"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Body contents scrollable */}
          <div className="flex-1 overflow-y-auto p-5 space-y-6">
            {/* Core Card Brief */}
            <div className="p-4 bg-[#5A82E8]/5 rounded-2xl border border-[#5A82E8]/10">
              <div className="flex items-center gap-2">
                <NotificationAvatar
                  initials={notification.sender.avatarInitials}
                  name={notification.sender.name}
                />
                <div>
                  <h4 className="text-xs font-bold text-foreground">{notification.sender.name}</h4>
                  <p className="text-[10px] text-muted-foreground">{notification.sender.role}</p>
                </div>
              </div>
              <h3 className="text-sm font-bold text-foreground mt-3 leading-snug">
                {notification.title}
              </h3>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                {notification.description}
              </p>

              {/* Detail buttons */}
              {notification.smartActions.length > 0 && (
                <div className="flex items-center gap-2 mt-4 border-t pt-3 border-border/30">
                  {notification.smartActions.map((act) => (
                    <button
                      key={act}
                      onClick={() => {
                        executeSmartAction(notification.id, act);
                        onClose();
                      }}
                      className="h-8 px-4 rounded-lg bg-[#5A82E8] text-white text-xs font-bold"
                    >
                      {act}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Task metadata if exists */}
            {notification.taskDetails && (
              <div className="space-y-2">
                <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                  Workflow Timeline & Specs
                </h4>
                <div className="bg-slate-50 dark:bg-slate-900/30 p-4 rounded-2xl border border-border/40 space-y-3.5">
                  {notification.taskDetails.dueDate && (
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-muted-foreground">Due Date</span>
                      <span className="font-bold text-foreground">
                        {notification.taskDetails.dueDate}
                      </span>
                    </div>
                  )}
                  {notification.taskDetails.status && (
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-muted-foreground">Workflow Stage</span>
                      <span className="px-2.5 py-0.5 bg-[#5A82E8]/10 text-[#5A82E8] rounded-full font-bold">
                        {notification.taskDetails.status}
                      </span>
                    </div>
                  )}
                  {notification.taskDetails.description && (
                    <div className="text-xs space-y-1 border-t border-border/30 pt-2.5">
                      <p className="font-bold text-foreground">Task description:</p>
                      <p className="text-muted-foreground leading-relaxed">
                        {notification.taskDetails.description}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Attachments */}
            {notification.attachments && notification.attachments.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                  Attachments ({notification.attachments.length})
                </h4>
                <div className="grid grid-cols-1 gap-2">
                  {notification.attachments.map((file, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-900/30 rounded-xl border border-border/50 text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-[#5A82E8]" />
                        <div className="min-w-0">
                          <p className="font-semibold text-foreground truncate max-w-[200px]">
                            {file.name}
                          </p>
                          <p className="text-[10px] text-muted-foreground">{file.size}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => toast.success(`Downloading ${file.name}...`)}
                        className="h-7 w-7 rounded-lg bg-white dark:bg-slate-800 border flex items-center justify-center text-muted-foreground hover:text-[#5A82E8] transition-colors"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Related activity timeline */}
            {notification.activity && notification.activity.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                  Activity Timeline
                </h4>
                <div className="relative border-l border-border pl-4 space-y-4 py-1 ml-2">
                  {notification.activity.map((act, i) => (
                    <div key={i} className="relative">
                      <span className="absolute -left-[21px] top-1.5 w-2 h-2 rounded-full bg-[#5A82E8]" />
                      <div className="text-xs">
                        <span className="font-bold text-foreground">{act.user} </span>
                        <span className="text-muted-foreground">{act.action}</span>
                        <p className="text-[10px] text-muted-foreground/60 mt-0.5">{act.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Thread comments */}
            <div className="space-y-3">
              <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                Comments Thread
              </h4>

              {notification.comments && notification.comments.length > 0 ? (
                <div className="space-y-3">
                  {notification.comments.map((comm, idx) => (
                    <div
                      key={idx}
                      className="bg-slate-50 dark:bg-slate-900/20 p-3 rounded-xl border border-border/40"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold text-foreground">{comm.user}</span>
                        <span className="text-[10px] text-muted-foreground">{comm.time}</span>
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed">{comm.text}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground italic pl-1">
                  No comments in this thread. Start conversation below.
                </p>
              )}

              {/* Comment submit form */}
              <form onSubmit={handlePostComment} className="flex gap-2 items-center mt-2.5">
                <input
                  type="text"
                  placeholder="Ask a question or add details..."
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  className="flex-1 h-9 px-3 bg-white dark:bg-[#1f1f23] border rounded-xl text-xs focus:outline-none"
                />
                <button
                  type="submit"
                  className="h-9 px-3.5 bg-[#5A82E8] hover:opacity-95 text-white text-xs font-bold rounded-xl"
                >
                  Post
                </button>
              </form>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

// 8. Notification Settings Panel
export function NotificationSettingsPanel({
  settings,
  onClose,
}: {
  settings: NotificationSettings;
  onClose: () => void;
}) {
  const [localSettings, setLocalSettings] = useState(settings);

  const handleToggle = (
    category: NotifType,
    channel: keyof (typeof settings.categories)[NotifType],
  ) => {
    const updated = { ...localSettings };
    updated.categories[category] = {
      ...updated.categories[category],
      [channel]: !updated.categories[category][channel],
    };
    setLocalSettings(updated);
  };

  const handleSave = () => {
    notificationStore.updateSettings(localSettings);
    onClose();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b pb-4">
        <div>
          <h3 className="text-md font-bold text-foreground">Notification Preferences</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Customize how and when you want to receive alerts.
          </p>
        </div>
      </div>

      {/* Quiet hours slider */}
      <div className="p-4 bg-slate-50 dark:bg-slate-900/30 rounded-2xl border border-border/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Moon className="w-4 h-4 text-[#5A82E8]" />
            <div>
              <p className="text-xs font-bold text-foreground">Quiet Hours Mode</p>
              <p className="text-[10px] text-muted-foreground">
                Only critical high-priority alerts during quiet hours.
              </p>
            </div>
          </div>
          <input
            type="checkbox"
            checked={localSettings.quietHours.enabled}
            onChange={(e) => {
              setLocalSettings({
                ...localSettings,
                quietHours: {
                  ...localSettings.quietHours,
                  enabled: e.target.checked,
                },
              });
            }}
            className="rounded border-gray-300 dark:border-gray-600 text-[#5A82E8] focus:ring-[#5A82E8] h-3.5 w-3.5 cursor-pointer"
          />
        </div>
        {localSettings.quietHours.enabled && (
          <div className="flex items-center gap-3 mt-4 text-xs">
            <div className="flex-1">
              <label className="text-[10px] font-bold text-muted-foreground uppercase">
                Quiet Start
              </label>
              <input
                type="text"
                value={localSettings.quietHours.start}
                onChange={(e) => {
                  setLocalSettings({
                    ...localSettings,
                    quietHours: { ...localSettings.quietHours, start: e.target.value },
                  });
                }}
                className="w-full h-8 px-2.5 bg-white dark:bg-[#1a1a20] border rounded-lg mt-1"
              />
            </div>
            <div className="flex-1">
              <label className="text-[10px] font-bold text-muted-foreground uppercase">
                Quiet End
              </label>
              <input
                type="text"
                value={localSettings.quietHours.end}
                onChange={(e) => {
                  setLocalSettings({
                    ...localSettings,
                    quietHours: { ...localSettings.quietHours, end: e.target.value },
                  });
                }}
                className="w-full h-8 px-2.5 bg-white dark:bg-[#1a1a20] border rounded-lg mt-1"
              />
            </div>
          </div>
        )}
      </div>

      {/* Grid checklist */}
      <div className="space-y-4">
        <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
          Alert Channels matrix
        </h4>
        <div className="border border-border/50 rounded-2xl overflow-hidden">
          <div className="grid grid-cols-5 bg-slate-50 dark:bg-slate-900/60 p-3 text-[10px] font-extrabold text-muted-foreground uppercase tracking-wider text-center border-b">
            <span className="text-left col-span-2">Alert Category</span>
            <span>Push</span>
            <span>Desktop</span>
            <span>Sound</span>
          </div>

          <div className="divide-y divide-border/40 max-h-[300px] overflow-y-auto">
            {(Object.keys(localSettings.categories) as NotifType[]).map((cat) => (
              <div key={cat} className="grid grid-cols-5 p-3 items-center text-xs text-center">
                <span className="text-left font-semibold text-foreground capitalize col-span-2">
                  {cat}
                </span>
                <div className="flex justify-center">
                  <input
                    type="checkbox"
                    checked={localSettings.categories[cat].push}
                    onChange={() => handleToggle(cat, "push")}
                    className="rounded border-gray-300 dark:border-gray-600 text-[#5A82E8] h-3.5 w-3.5"
                  />
                </div>
                <div className="flex justify-center">
                  <input
                    type="checkbox"
                    checked={localSettings.categories[cat].desktop}
                    onChange={() => handleToggle(cat, "desktop")}
                    className="rounded border-gray-300 dark:border-gray-600 text-[#5A82E8] h-3.5 w-3.5"
                  />
                </div>
                <div className="flex justify-center">
                  <input
                    type="checkbox"
                    checked={localSettings.categories[cat].sound}
                    onChange={() => handleToggle(cat, "sound")}
                    className="rounded border-gray-300 dark:border-gray-600 text-[#5A82E8] h-3.5 w-3.5"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-end gap-2.5 pt-4 border-t">
        <button
          onClick={onClose}
          className="h-9 px-4 rounded-xl text-xs font-bold border hover:bg-slate-50 dark:hover:bg-slate-800"
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          className="h-9 px-4 rounded-xl text-xs font-bold bg-[#5A82E8] text-white hover:opacity-95"
        >
          Save Settings
        </button>
      </div>
    </div>
  );
}
