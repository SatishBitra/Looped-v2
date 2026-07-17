import { toast } from "sonner";

export type NotifType =
  | "task"
  | "approval"
  | "due_date"
  | "overdue"
  | "capacity"
  | "meeting"
  | "message"
  | "file"
  | "client"
  | "system";

export interface Notification {
  id: string;
  type: NotifType;
  title: string;
  description: string;
  project: string;
  time: string; // Relative time (e.g., "5 mins ago")
  timestamp: Date; // Actual date object for sorting/filtering
  priority: "HIGH" | "MEDIUM" | "LOW";
  sender: {
    name: string;
    avatarInitials: string;
    role: string;
  };
  status: "unread" | "read" | "archived";
  muted?: boolean;
  pinned?: boolean;
  following?: boolean;
  snoozedUntil?: Date | null;
  smartActions: string[];

  // Expanded Detail Fields for Right Drawer without navigation
  activity?: {
    user: string;
    action: string;
    time: string;
  }[];
  taskDetails?: {
    dueDate?: string;
    status?: string;
    assignee?: string;
    description?: string;
  };
  comments?: {
    user: string;
    text: string;
    time: string;
  }[];
  attachments?: {
    name: string;
    size: string;
    url: string;
  }[];
  history?: string[];
  relatedNotifications?: string[];
}

export interface NotificationSettings {
  categories: Record<
    NotifType,
    { email: boolean; push: boolean; desktop: boolean; sound: boolean; digest: boolean }
  >;
  quietHours: {
    enabled: boolean;
    start: string; // "10:00 PM"
    end: string; // "08:00 AM"
  };
}

// Initial default state satisfying the complete list of types and smart actions in PRD
const initialNotifications: Notification[] = [
  {
    id: "notif_1",
    type: "task",
    title: "Rahul assigned you a task",
    description: "Homepage UI Redesign concepts",
    project: "Aurora Coffee",
    time: "5 mins ago",
    timestamp: new Date(Date.now() - 5 * 60 * 1000),
    priority: "HIGH",
    sender: { name: "Rahul S.", avatarInitials: "RS", role: "Manager" },
    status: "unread",
    smartActions: ["Accept", "Decline", "Open"],
    activity: [
      { user: "Rahul S.", action: "Created task 'Homepage UI Redesign'", time: "5 mins ago" },
      { user: "Rahul S.", action: "Assigned Sandy to task", time: "5 mins ago" },
    ],
    taskDetails: {
      dueDate: "2026-07-20",
      status: "Assigned",
      assignee: "Sandy (You)",
      description:
        "Complete full-fidelity design screens for the updated coffee commerce homepage layout.",
    },
    comments: [
      {
        user: "Rahul S.",
        text: "Keep it clean, high-contrast, and focused on product imagery.",
        time: "4 mins ago",
      },
    ],
    attachments: [{ name: "Brand_Asset_Pack.zip", size: "14.2 MB", url: "#" }],
    history: ["Task assigned by Rahul S. at 03:27 PM", "Task registered in Pod-1 at 03:25 PM"],
    relatedNotifications: [],
  },
  {
    id: "notif_2",
    type: "approval",
    title: "Luca F. requested approval",
    description: "Motion boards v2 design handoff",
    project: "Kite Motors",
    time: "45 mins ago",
    timestamp: new Date(Date.now() - 45 * 60 * 1000),
    priority: "HIGH",
    sender: { name: "Luca F.", avatarInitials: "LF", role: "Interaction Designer" },
    status: "unread",
    smartActions: ["Approve", "Reject", "Review"],
    activity: [
      { user: "Luca F.", action: "Uploaded Motion boards v2", time: "50 mins ago" },
      { user: "Luca F.", action: "Requested review from Sandy", time: "45 mins ago" },
    ],
    taskDetails: {
      status: "In Review",
      assignee: "Luca F.",
      description:
        "Lottie animations and micro-interaction specs for the vehicle configurator slider panel.",
    },
    comments: [
      {
        user: "Luca F.",
        text: "This includes the snappy spring transitions we discussed last Monday.",
        time: "45 mins ago",
      },
    ],
    attachments: [
      { name: "Configurator_Lottie_v2.json", size: "340 KB", url: "#" },
      { name: "Interaction_Guide.pdf", size: "2.1 MB", url: "#" },
    ],
    history: ["Handoff requested by Luca F. at 02:47 PM"],
    relatedNotifications: [],
  },
  {
    id: "notif_3",
    type: "client",
    title: "Client left feedback",
    description: "Helix Health left 4 comments on Campaign concepts",
    project: "Helix Health",
    time: "2 hours ago",
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
    priority: "MEDIUM",
    sender: { name: "Sarah M. (Client)", avatarInitials: "SM", role: "Product Owner" },
    status: "unread",
    smartActions: ["Review", "Reply"],
    comments: [
      {
        user: "Sarah M.",
        text: "The color palette in layout B feels too dark. Can we try a softer off-white background?",
        time: "2 hours ago",
      },
      {
        user: "Sarah M.",
        text: "Is it possible to combine the hero structure of concept A with the list of layout B?",
        time: "2 hours ago",
      },
    ],
    history: ["Comments submitted on Figma frame #23 at 01:32 PM"],
    relatedNotifications: [],
  },
  {
    id: "notif_4",
    type: "capacity",
    title: "Capacity Warning",
    description: "Design pod is at 92% of scheduled hours for this week",
    project: "Ops",
    time: "4 hours ago",
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
    priority: "HIGH",
    sender: { name: "System Coordinator", avatarInitials: "SY", role: "Automated Bot" },
    status: "unread",
    smartActions: ["Regularize", "Dismiss"],
    taskDetails: {
      description:
        "Alert triggers when total assigned hours across the active sprint exceed nominal threshold. 2 employees in Pod-1 have exceeded 38 working hours.",
    },
    history: ["Automated threshold alert triggered by Loooped capacity engine."],
    relatedNotifications: [],
  },
  {
    id: "notif_5",
    type: "meeting",
    title: "UX Huddle Rescheduled",
    description: "Rescheduled by Supraja. New time: 02:00 PM today.",
    project: "Helix Health",
    time: "5 hours ago",
    timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000),
    priority: "MEDIUM",
    sender: { name: "Supraja K.", avatarInitials: "SK", role: "UX Lead" },
    status: "unread",
    smartActions: ["Join", "Reschedule", "View"],
    taskDetails: {
      description:
        "Quick daily huddle to review current Figma layout blockers and coordinate with the development team.",
    },
    comments: [
      {
        user: "Supraja K.",
        text: "Sorry for the delay everyone, had a client conflict run over.",
        time: "5 hours ago",
      },
    ],
    history: ["Event rescheduled by Supraja K."],
    relatedNotifications: [],
  },
  {
    id: "notif_6",
    type: "file",
    title: "New File Version Added",
    description: "Ivan uploaded 'Brand_Style_Guide_v2.pdf'",
    project: "Helix Health",
    time: "1 day ago",
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
    priority: "LOW",
    sender: { name: "Ivan P.", avatarInitials: "IP", role: "Brand Lead" },
    status: "read",
    smartActions: ["Preview", "Download"],
    attachments: [{ name: "Brand_Style_Guide_v2.pdf", size: "8.7 MB", url: "#" }],
    history: ["File revision v2 committed by Ivan P. at 10:15 AM yesterday"],
    relatedNotifications: [],
  },
  {
    id: "notif_7",
    type: "overdue",
    title: "Task Overdue (Lock Warning)",
    description: "Print campaign layout is 2 days overdue in approvals",
    project: "Meridian",
    time: "2 days ago",
    timestamp: new Date(Date.now() - 48 * 60 * 60 * 1000),
    priority: "HIGH",
    sender: { name: "Workflow Manager", avatarInitials: "WM", role: "System Automation" },
    status: "read",
    smartActions: ["Regularize", "Open"],
    taskDetails: {
      status: "Overdue",
      dueDate: "2026-07-15",
      description:
        "According to the Loooped business rules: Overdue items require a regularization filing to unlock task submission.",
    },
    history: [
      "Task deadline missed on 2026-07-15",
      "Alert escalation sent to Manager on 2026-07-16",
    ],
    relatedNotifications: [],
  },
  {
    id: "notif_8",
    type: "system",
    title: "Scheduled Maintenance Notification",
    description: "Maintenance scheduled for July 20 at 2:00 AM UTC",
    project: "Ops",
    time: "3 days ago",
    timestamp: new Date(Date.now() - 72 * 60 * 60 * 1000),
    priority: "LOW",
    sender: { name: "IT DevOps Team", avatarInitials: "DV", role: "Admin" },
    status: "read",
    smartActions: ["Info"],
    history: ["System announcement broadcasted globally"],
    relatedNotifications: [],
  },
  {
    id: "notif_9",
    type: "message",
    title: "Sara D. mentioned you",
    description: "'@Sandy let's finalize the typography choices before the sync today'",
    project: "ThreadSense AI",
    time: "5 days ago",
    timestamp: new Date(Date.now() - 120 * 60 * 60 * 1000),
    priority: "MEDIUM",
    sender: { name: "Sara D.", avatarInitials: "SD", role: "Lead Copywriter" },
    status: "read",
    smartActions: ["Reply", "Open"],
    comments: [
      {
        user: "Sara D.",
        text: "I left our branding feedback inside the thread too.",
        time: "5 days ago",
      },
    ],
    history: ["Mention registered in thread #brand-discussion"],
    relatedNotifications: [],
  },
  {
    id: "notif_10",
    type: "due_date",
    title: "Task Due Tomorrow",
    description: "Prepare and submit Helix health client invoice",
    project: "Helix Health",
    time: "Yesterday",
    timestamp: new Date(Date.now() - 25 * 60 * 60 * 1000),
    priority: "MEDIUM",
    sender: { name: "Billing Engine", avatarInitials: "BE", role: "Automated Bot" },
    status: "read",
    smartActions: ["Open", "Dismiss"],
    taskDetails: {
      dueDate: "2026-07-18",
      status: "In Progress",
    },
  },
];

const initialSettings: NotificationSettings = {
  categories: {
    task: { email: true, push: true, desktop: true, sound: true, digest: false },
    approval: { email: true, push: true, desktop: true, sound: true, digest: true },
    due_date: { email: true, push: true, desktop: true, sound: true, digest: false },
    overdue: { email: true, push: true, desktop: true, sound: true, digest: false },
    capacity: { email: false, push: true, desktop: true, sound: false, digest: true },
    meeting: { email: true, push: true, desktop: true, sound: true, digest: false },
    message: { email: false, push: true, desktop: false, sound: true, digest: true },
    file: { email: false, push: false, desktop: true, sound: false, digest: true },
    client: { email: true, push: true, desktop: true, sound: true, digest: false },
    system: { email: true, push: false, desktop: true, sound: false, digest: true },
  },
  quietHours: {
    enabled: true,
    start: "10:00 PM",
    end: "08:00 AM",
  },
};

type Listener = () => void;
class NotificationStore {
  private notifications: Notification[] = [...initialNotifications];
  private settings: NotificationSettings = { ...initialSettings };
  private listeners: Set<Listener> = new Set();

  getNotifications() {
    return this.notifications;
  }

  getSettings() {
    return this.settings;
  }

  subscribe(listener: Listener) {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    this.listeners.forEach((l) => l());
  }

  // --- ACTIONS ---

  markAllAsRead() {
    this.notifications = this.notifications.map((n) =>
      n.status === "unread" ? { ...n, status: "read" } : n,
    );
    this.notify();
    toast.success("All notifications marked as read");
  }

  markAsRead(id: string) {
    this.notifications = this.notifications.map((n) =>
      n.id === id ? { ...n, status: "read" as const } : n,
    );
    this.notify();
  }

  markAsUnread(id: string) {
    this.notifications = this.notifications.map((n) =>
      n.id === id ? { ...n, status: "unread" as const } : n,
    );
    this.notify();
    toast.info("Marked as unread");
  }

  archive(id: string) {
    this.notifications = this.notifications.map((n) =>
      n.id === id ? { ...n, status: "archived" as const } : n,
    );
    this.notify();
    toast.success("Notification moved to Archive");
  }

  mute(id: string) {
    this.notifications = this.notifications.map((n) =>
      n.id === id ? { ...n, muted: !n.muted } : n,
    );
    const item = this.notifications.find((n) => n.id === id);
    this.notify();
    toast.info(item?.muted ? "Muted thread notifications" : "Unmuted thread notifications");
  }

  pin(id: string) {
    this.notifications = this.notifications.map((n) =>
      n.id === id ? { ...n, pinned: !n.pinned } : n,
    );
    const item = this.notifications.find((n) => n.id === id);
    this.notify();
    toast.success(item?.pinned ? "Pinned to top" : "Unpinned");
  }

  toggleFollow(id: string) {
    this.notifications = this.notifications.map((n) =>
      n.id === id ? { ...n, following: !n.following } : n,
    );
    const item = this.notifications.find((n) => n.id === id);
    this.notify();
    toast.success(item?.following ? "Following updates" : "Stopped following");
  }

  delete(id: string) {
    this.notifications = this.notifications.filter((n) => n.id !== id);
    this.notify();
    toast.success("Notification removed from your feed");
  }

  snooze(id: string, mins: number) {
    const time = new Date(Date.now() + mins * 60 * 1000);
    this.notifications = this.notifications.map((n) =>
      n.id === id ? { ...n, snoozedUntil: time } : n,
    );
    this.notify();
    toast.info(`Snoozed for ${mins === 60 ? "1 hour" : mins + " minutes"}`);
  }

  updateSettings(settings: Partial<NotificationSettings>) {
    this.settings = { ...this.settings, ...settings };
    this.notify();
    toast.success("Notification settings updated successfully");
  }

  // Bulk operations
  bulkMarkRead(ids: string[]) {
    this.notifications = this.notifications.map((n) =>
      ids.includes(n.id) ? { ...n, status: "read" as const } : n,
    );
    this.notify();
    toast.success(`Marked ${ids.length} items as read`);
  }

  bulkArchive(ids: string[]) {
    this.notifications = this.notifications.map((n) =>
      ids.includes(n.id) ? { ...n, status: "archived" as const } : n,
    );
    this.notify();
    toast.success(`Archived ${ids.length} notifications`);
  }

  bulkDelete(ids: string[]) {
    this.notifications = this.notifications.filter((n) => !ids.includes(n.id));
    this.notify();
    toast.success(`Removed ${ids.length} items from your feed`);
  }

  bulkMute(ids: string[]) {
    this.notifications = this.notifications.map((n) =>
      ids.includes(n.id) ? { ...n, muted: true } : n,
    );
    this.notify();
    toast.success(`Muted ${ids.length} selected threads`);
  }

  // Simulation Trigger for the playground
  triggerSimulated(
    category: NotifType,
    title: string,
    description: string,
    project: string,
    priority: "HIGH" | "MEDIUM" | "LOW",
    senderName: string,
    avatarInitials: string,
    role: string,
    smartActions: string[],
  ) {
    const newNotif: Notification = {
      id: "sim_" + Date.now(),
      type: category,
      title,
      description,
      project,
      time: "Just now",
      timestamp: new Date(),
      priority,
      sender: { name: senderName, avatarInitials, role },
      status: "unread",
      smartActions,
      activity: [
        { user: senderName, action: `Triggered simulated event: ${title}`, time: "Just now" },
      ],
      comments: [],
      attachments: [],
      history: ["System simulation run"],
    };

    // If quiet hours are enabled and current local hour is in the range, show alert
    const isQuiet = this.checkQuietHours();
    if (isQuiet && priority !== "HIGH") {
      console.log("Simulated notification suppressed/logged due to Quiet Hours (10 PM - 8 AM).");
    }

    this.notifications = [newNotif, ...this.notifications];
    this.notify();
    toast.info(`🔔 New simulation: ${title}`, {
      description: description,
    });
  }

  private checkQuietHours(): boolean {
    if (!this.settings.quietHours.enabled) return false;
    const now = new Date();
    const hrs = now.getHours();
    // 10 PM is hour 22, 8 AM is hour 8
    return hrs >= 22 || hrs < 8;
  }
}

export const notificationStore = new NotificationStore();
