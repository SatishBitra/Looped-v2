import { createFileRoute } from "@tanstack/react-router";
import { AppShell, Card, StatusPill } from "@/components/app-shell";
import { Check, X, MessageSquare } from "lucide-react";

export const Route = createFileRoute("/approvals")({
  component: ApprovalsPage,
});

const queue = [
  {
    title: "Print campaign layout",
    project: "Meridian · Print",
    requested: "Marta L.",
    when: "2d ago",
    tone: "red" as const,
    status: "Overdue",
  },
  {
    title: "Podcast cover art v2",
    project: "Loop FM · Brand",
    requested: "Ivan P.",
    when: "5h ago",
    tone: "yellow" as const,
    status: "Waiting",
  },
  {
    title: "Website hero direction",
    project: "Northwind · Web",
    requested: "Sara D.",
    when: "1d ago",
    tone: "blue" as const,
    status: "Client",
  },
  {
    title: "Motion boards v2",
    project: "Kite Motors · Motion",
    requested: "Luca F.",
    when: "3h ago",
    tone: "purple" as const,
    status: "Waiting",
  },
  {
    title: "Copy — landing page",
    project: "Helix Health · Copy",
    requested: "Nora K.",
    when: "6h ago",
    tone: "green" as const,
    status: "Waiting",
  },
];

function ApprovalsPage() {
  return (
    <AppShell breadcrumb={["Workspace", "Approvals"]}>
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-[30px] font-semibold tracking-tight">Approvals</h1>
          <p className="text-[14px] text-muted-foreground mt-1">
            9 items · 1 overdue · 3 with client
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {["All", "Mine", "Overdue", "Client review"].map((t, i) => (
            <button
              key={t}
              className={`h-9 px-3.5 rounded-full text-[12px] font-medium ${
                i === 0
                  ? "bg-foreground text-background"
                  : "bg-card border border-border text-muted-foreground"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {queue.map((q) => (
          <Card key={q.title} className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <StatusPill tone={q.tone}>{q.status}</StatusPill>
                <h3 className="text-[17px] font-medium mt-3">{q.title}</h3>
                <div className="text-[13px] text-muted-foreground mt-1">{q.project}</div>
              </div>
              <div className="w-10 h-10 rounded-full bg-status-purple-bg text-status-purple grid place-items-center text-[12px] font-semibold">
                {q.requested
                  .split(" ")
                  .map((s) => s[0])
                  .join("")}
              </div>
            </div>

            <div className="h-32 rounded-[18px] bg-surface mb-4 grid place-items-center text-[12px] text-subtle">
              Preview
            </div>

            <div className="flex items-center justify-between">
              <div className="text-[12px] text-muted-foreground">
                Requested by {q.requested} · {q.when}
              </div>
              <div className="flex gap-2">
                <button className="h-9 w-9 rounded-[14px] bg-surface grid place-items-center text-muted-foreground hover:text-foreground">
                  <MessageSquare className="w-4 h-4" strokeWidth={1.75} />
                </button>
                <button className="h-9 px-3.5 rounded-[14px] border border-rose-200 bg-rose-50/70 text-rose-700 hover:bg-rose-100 dark:border-rose-900/30 dark:bg-rose-950/30 dark:text-rose-400 dark:hover:bg-rose-900/40 text-[12px] font-semibold flex items-center gap-1.5 transition-colors cursor-pointer">
                  <X className="w-3.5 h-3.5" strokeWidth={2.5} /> Reject
                </button>
                <button className="h-9 px-3.5 rounded-[14px] bg-foreground text-background text-[12px] font-semibold flex items-center gap-1.5 hover:opacity-90 transition-all cursor-pointer">
                  <Check className="w-3.5 h-3.5" strokeWidth={2.5} /> Approve
                </button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </AppShell>
  );
}
