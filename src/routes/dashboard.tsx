import { createFileRoute } from "@tanstack/react-router";
import { AppShell, Card, SectionTitle, StatusPill } from "@/components/app-shell";
import {
  ArrowUpRight,
  MoreHorizontal,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Users,
  TrendingUp,
} from "lucide-react";

export const Route = createFileRoute("/dashboard")({
  component: Dashboard,
});

const kpis = [
  { label: "Active projects", value: "24", delta: "+3", tone: "blue" as const },
  { label: "Open tasks", value: "128", delta: "-12", tone: "green" as const },
  { label: "Capacity used", value: "78%", delta: "+4%", tone: "orange" as const },
  { label: "Approvals waiting", value: "9", delta: "+2", tone: "purple" as const },
];

const kanban = {
  "Pod Allocation": [
    {
      title: "Q4 Rebrand kickoff",
      client: "Northwind",
      due: "Fri",
      tone: "blue" as const,
      tag: "Brand",
    },
    {
      title: "Landing page revamp",
      client: "Helix Health",
      due: "Mon",
      tone: "purple" as const,
      tag: "Web",
    },
  ],
  "In Progress": [
    {
      title: "Social pack — 12 posts",
      client: "Aurora Coffee",
      due: "Today",
      tone: "orange" as const,
      tag: "Social",
    },
    {
      title: "Product film cut v3",
      client: "Kite Motors",
      due: "Wed",
      tone: "blue" as const,
      tag: "Video",
    },
    {
      title: "Design system tokens",
      client: "Internal",
      due: "Thu",
      tone: "green" as const,
      tag: "Design",
    },
  ],
  Approval: [
    {
      title: "Print campaign layout",
      client: "Meridian",
      due: "Overdue",
      tone: "red" as const,
      tag: "Print",
    },
    {
      title: "Podcast cover art",
      client: "Loop FM",
      due: "Tomorrow",
      tone: "yellow" as const,
      tag: "Brand",
    },
  ],
  "Client Review": [
    {
      title: "Website hero direction",
      client: "Northwind",
      due: "Sent",
      tone: "green" as const,
      tag: "Web",
    },
  ],
} as const;

const tasks = [
  {
    title: "Review copy — Aurora landing",
    project: "Aurora Coffee",
    due: "Today 4:00 pm",
    tone: "orange" as const,
  },
  {
    title: "Approve motion boards v2",
    project: "Kite Motors",
    due: "Today 6:00 pm",
    tone: "red" as const,
  },
  {
    title: "Prep pod capacity sync",
    project: "Internal",
    due: "Tomorrow 10:00 am",
    tone: "blue" as const,
  },
  {
    title: "Client call — brief walkthrough",
    project: "Helix Health",
    due: "Wed 11:00 am",
    tone: "purple" as const,
  },
  {
    title: "QA regularization tickets",
    project: "Ops",
    due: "Thu 2:00 pm",
    tone: "green" as const,
  },
];

const activity = [
  {
    who: "Marta L.",
    what: "approved",
    target: "Podcast cover art v2",
    when: "12m",
    tone: "green" as const,
  },
  {
    who: "Client — Northwind",
    what: "requested changes on",
    target: "Website hero direction",
    when: "38m",
    tone: "orange" as const,
  },
  {
    who: "Ivan P.",
    what: "moved",
    target: "Product film cut v3 → In Progress",
    when: "1h",
    tone: "blue" as const,
  },
  {
    who: "System",
    what: "flagged capacity for",
    target: "Design pod (92%)",
    when: "2h",
    tone: "red" as const,
  },
  {
    who: "Sara D.",
    what: "logged 3.5h on",
    target: "Q4 Rebrand kickoff",
    when: "3h",
    tone: "purple" as const,
  },
];

function Dashboard() {
  return (
    <AppShell breadcrumb={["Workspace", "Dashboard"]}>
      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {kpis.map((k) => (
          <Card key={k.label} className="p-5 sm:p-6">
            <div className="flex items-start justify-between mb-6">
              <div className="text-[13px] text-muted-foreground">{k.label}</div>
              <StatusPill tone={k.tone}>{k.delta}</StatusPill>
            </div>
            <div className="flex items-end justify-between">
              <div className="text-3xl sm:text-[36px] font-semibold tracking-tight leading-none">
                {k.value}
              </div>
              <ArrowUpRight className="w-5 h-5 text-subtle" strokeWidth={1.5} />
            </div>
          </Card>
        ))}
      </div>

      {/* Kanban */}
      <SectionTitle
        title="Workflow"
        action={
          <div className="flex items-center gap-2 text-[12px] text-muted-foreground">
            <div className="flex -space-x-2">
              {["#88A9F8", "#74C98F", "#F3D36B", "#A48AF8"].map((c) => (
                <span
                  key={c}
                  className="w-6 h-6 rounded-full border-2 border-card"
                  style={{ background: c }}
                />
              ))}
            </div>
            <span className="hidden sm:inline">4 pods · 12 in flight</span>
          </div>
        }
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {Object.entries(kanban).map(([stage, cards]) => (
          <div key={stage} className="bg-surface rounded-[28px] p-3">
            <div className="flex items-center justify-between px-3 py-2 mb-2">
              <div className="flex items-center gap-2">
                <span className="text-[13px] font-medium">{stage}</span>
                <span className="text-[11px] text-muted-foreground bg-card border border-border rounded-full px-1.5">
                  {cards.length}
                </span>
              </div>
              <MoreHorizontal className="w-4 h-4 text-subtle" />
            </div>
            <div className="flex flex-col gap-2">
              {cards.map((c) => (
                <div
                  key={c.title}
                  className="bg-card border border-border rounded-[20px] p-4 hover:shadow-[var(--shadow-soft)] transition-shadow"
                >
                  <div className="flex items-center justify-between mb-3">
                    <StatusPill tone={c.tone}>{c.tag}</StatusPill>
                    <span className="text-[11px] text-muted-foreground">{c.due}</span>
                  </div>
                  <div className="text-[14px] font-medium leading-snug mb-1">{c.title}</div>
                  <div className="text-[12px] text-muted-foreground">{c.client}</div>
                  <div className="flex items-center justify-between mt-4">
                    <div className="flex -space-x-1.5">
                      {["#88A9F8", "#F3D36B"].map((col) => (
                        <span
                          key={col}
                          className="w-5 h-5 rounded-full border-2 border-card"
                          style={{ background: col }}
                        />
                      ))}
                    </div>
                    <span className="text-[11px] text-muted-foreground">3 subtasks</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Two column */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-8">
        {/* My tasks */}
        <Card className="lg:col-span-2 p-5 sm:p-6">
          <SectionTitle
            title="My tasks — today"
            action={
              <button className="text-[12px] text-muted-foreground hover:text-foreground">
                View all
              </button>
            }
          />
          <div className="divide-y divide-border">
            {tasks.map((t) => (
              <div key={t.title} className="flex items-center gap-4 py-3 first:pt-0 last:pb-0">
                <button className="w-5 h-5 rounded-md border border-border grid place-items-center hover:border-foreground transition-colors">
                  <CheckCircle2 className="w-3.5 h-3.5 text-transparent" />
                </button>
                <div className="flex-1 min-w-0">
                  <div className="text-[14px] font-medium truncate">{t.title}</div>
                  <div className="text-[12px] text-muted-foreground">{t.project}</div>
                </div>
                <StatusPill tone={t.tone}>
                  <Clock className="w-3 h-3" /> {t.due}
                </StatusPill>
              </div>
            ))}
          </div>
        </Card>

        {/* Capacity */}
        <Card className="p-5 sm:p-6">
          <SectionTitle title="Pod capacity" />
          <div className="flex flex-col gap-4">
            {[
              { name: "Design", value: 92, tone: "red" as const },
              { name: "Motion", value: 74, tone: "orange" as const },
              { name: "Copy", value: 58, tone: "green" as const },
              { name: "Web", value: 66, tone: "blue" as const },
              { name: "Strategy", value: 41, tone: "purple" as const },
            ].map((p) => (
              <div key={p.name}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[13px] font-medium">{p.name}</span>
                  <span className="text-[12px] text-muted-foreground">{p.value}%</span>
                </div>
                <div className="h-1.5 rounded-full bg-surface overflow-hidden">
                  <div
                    className={`h-full rounded-full bg-status-${p.tone}`}
                    style={{ width: `${p.value}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Urgent + Activity */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card className="p-5 sm:p-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-full bg-status-red-bg text-status-red grid place-items-center">
              <AlertTriangle className="w-4 h-4" strokeWidth={2} />
            </div>
            <h3 className="text-[15px] font-medium">Urgent action</h3>
          </div>
          <div className="text-[14px] leading-relaxed mb-4">
            Print campaign layout for <span className="font-medium">Meridian</span> is 2 days
            overdue in Approval.
          </div>
          <div className="flex gap-2">
            <button className="h-9 px-3.5 rounded-[14px] bg-foreground text-background text-[12px] font-medium">
              Approve now
            </button>
            <button className="h-9 px-3.5 rounded-[14px] bg-surface text-foreground text-[12px] font-medium">
              Reassign
            </button>
          </div>
        </Card>

        <Card className="p-5 sm:p-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-full bg-status-green-bg text-status-green grid place-items-center">
              <TrendingUp className="w-4 h-4" strokeWidth={2} />
            </div>
            <h3 className="text-[15px] font-medium">Budget health</h3>
          </div>
          <div className="text-3xl sm:text-[36px] font-semibold tracking-tight leading-none mb-1">
            72%
          </div>
          <div className="text-[12px] text-muted-foreground mb-4">
            of Q3 tracked hours delivered on-budget
          </div>
          <div className="flex items-center gap-2 text-[12px]">
            <StatusPill tone="green">3 healthy</StatusPill>
            <StatusPill tone="yellow">4 tight</StatusPill>
            <StatusPill tone="red">1 over</StatusPill>
          </div>
        </Card>

        <Card className="p-5 sm:p-6 md:col-span-2 lg:col-span-1">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-full bg-status-blue-bg text-status-blue grid place-items-center">
              <Users className="w-4 h-4" strokeWidth={2} />
            </div>
            <h3 className="text-[15px] font-medium">Recent activity</h3>
          </div>
          <div className="flex flex-col gap-3">
            {activity.slice(0, 4).map((a, i) => (
              <div key={i} className="flex items-start gap-2.5 text-[12px]">
                <span className={`mt-1 w-1.5 h-1.5 rounded-full bg-status-${a.tone} shrink-0`} />
                <div className="flex-1 leading-relaxed">
                  <span className="font-medium">{a.who}</span>{" "}
                  <span className="text-muted-foreground">{a.what}</span> <span>{a.target}</span>
                </div>
                <span className="text-muted-foreground text-[11px]">{a.when}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </AppShell>
  );
}
