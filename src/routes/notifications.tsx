import { createFileRoute } from "@tanstack/react-router";
import { AppShell, Card, StatusPill } from "@/components/app-shell";
import {
  AlertTriangle,
  ShieldCheck,
  MessageSquare,
  UserPlus,
  AtSign,
  Info,
  Zap,
  Archive,
} from "lucide-react";

export const Route = createFileRoute("/notifications")({
  component: NotificationsPage,
});

type Notif = {
  icon: any;
  tone: "blue" | "green" | "yellow" | "orange" | "red" | "purple";
  title: string;
  desc: string;
  time: string;
  project: string;
  who: string;
};

const sections: { label: string; items: Notif[] }[] = [
  {
    label: "Today",
    items: [
      {
        icon: AlertTriangle,
        tone: "red",
        title: "Task overdue",
        desc: "Print campaign layout is 2 days overdue in Approval.",
        time: "12m",
        project: "Meridian",
        who: "System",
      },
      {
        icon: ShieldCheck,
        tone: "yellow",
        title: "Approval needed",
        desc: "Motion boards v2 waiting on your review.",
        time: "1h",
        project: "Kite Motors",
        who: "Luca F.",
      },
      {
        icon: Zap,
        tone: "orange",
        title: "Capacity warning",
        desc: "Design pod is at 92% for this week.",
        time: "2h",
        project: "Ops",
        who: "System",
      },
      {
        icon: MessageSquare,
        tone: "green",
        title: "Client approved",
        desc: "Northwind approved the website hero direction.",
        time: "3h",
        project: "Northwind",
        who: "Client",
      },
    ],
  },
  {
    label: "Yesterday",
    items: [
      {
        icon: AtSign,
        tone: "purple",
        title: "You were mentioned",
        desc: "Sara D. mentioned you in Q4 Rebrand kickoff.",
        time: "1d",
        project: "Northwind",
        who: "Sara D.",
      },
      {
        icon: Info,
        tone: "orange",
        title: "Client requested changes",
        desc: "Helix Health left 4 comments on Campaign concepts.",
        time: "1d",
        project: "Helix Health",
        who: "Client",
      },
    ],
  },
  {
    label: "This week",
    items: [
      {
        icon: UserPlus,
        tone: "blue",
        title: "New assignment",
        desc: "You were assigned to Podcast branding as producer.",
        time: "2d",
        project: "Loop FM",
        who: "Marta L.",
      },
      {
        icon: ShieldCheck,
        tone: "green",
        title: "Regularization approved",
        desc: "Your regularization ticket TR-482 was approved.",
        time: "3d",
        project: "Ops",
        who: "Anna R.",
      },
    ],
  },
];

function NotificationsPage() {
  return (
    <AppShell breadcrumb={["Workspace", "Notifications"]}>
      <div className="flex items-end justify-between mb-8">
        <div>
          <h1 className="text-[30px] font-semibold tracking-tight">Notifications</h1>
          <p className="text-[14px] text-muted-foreground mt-1">8 unread · 4 requiring action</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex bg-card border border-border rounded-[14px] p-1">
            {["All", "Unread", "Mentions", "Approvals"].map((t, i) => (
              <button
                key={t}
                className={`h-8 px-3 rounded-[10px] text-[12px] font-medium ${
                  i === 0 ? "bg-foreground text-background" : "text-muted-foreground"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
          <button className="h-10 px-3.5 rounded-[18px] bg-card border border-border text-[13px] font-medium">
            Mark all read
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-8">
        {sections.map((s) => (
          <div key={s.label}>
            <div className="text-[12px] font-medium text-muted-foreground uppercase tracking-wide mb-3 px-2">
              {s.label}
            </div>
            <Card className="divide-y divide-border">
              {s.items.map((n, i) => {
                const Icon = n.icon;
                return (
                  <div
                    key={i}
                    className="flex items-start gap-4 px-6 py-4 hover:bg-surface/60 transition-colors"
                  >
                    <div
                      className={`w-10 h-10 rounded-full bg-status-${n.tone}-bg text-status-${n.tone} grid place-items-center shrink-0`}
                    >
                      <Icon className="w-4 h-4" strokeWidth={1.75} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-[14px] font-medium">{n.title}</span>
                        <span className="text-[11px] text-muted-foreground">· {n.project}</span>
                      </div>
                      <div className="text-[13px] text-muted-foreground leading-relaxed">
                        {n.desc}
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-[12px] text-muted-foreground">{n.time}</span>
                      <button className="h-8 px-3 rounded-full text-[12px] bg-surface text-foreground font-medium">
                        Open
                      </button>
                      <button className="w-8 h-8 rounded-full grid place-items-center text-subtle hover:text-foreground hover:bg-surface">
                        <Archive className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </Card>
          </div>
        ))}
      </div>
    </AppShell>
  );
}
