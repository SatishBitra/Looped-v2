import { createFileRoute } from "@tanstack/react-router";
import { AppShell, Card, SectionTitle, StatusPill } from "@/components/app-shell";
import { Plus, MoreHorizontal } from "lucide-react";

export const Route = createFileRoute("/tasks")({
  component: TasksPage,
});

const stages = {
  "Pod Allocation": [
    {
      title: "Kickoff — Q4 Rebrand",
      client: "Northwind",
      tone: "blue" as const,
      tag: "Brand",
      pts: 5,
    },
    {
      title: "Landing wireframes",
      client: "Helix Health",
      tone: "purple" as const,
      tag: "Web",
      pts: 3,
    },
    {
      title: "Discovery interviews",
      client: "Meridian",
      tone: "green" as const,
      tag: "Research",
      pts: 8,
    },
  ],
  "In Progress": [
    {
      title: "Product film cut v3",
      client: "Kite Motors",
      tone: "blue" as const,
      tag: "Video",
      pts: 8,
    },
    {
      title: "Design system tokens",
      client: "Internal",
      tone: "green" as const,
      tag: "Design",
      pts: 5,
    },
    {
      title: "Aurora social — week 3",
      client: "Aurora Coffee",
      tone: "orange" as const,
      tag: "Social",
      pts: 3,
    },
    {
      title: "Motion boards v2",
      client: "Kite Motors",
      tone: "purple" as const,
      tag: "Motion",
      pts: 5,
    },
  ],
  Approval: [
    {
      title: "Print campaign layout",
      client: "Meridian",
      tone: "red" as const,
      tag: "Print",
      pts: 8,
      urgent: true,
    },
    { title: "Podcast cover v2", client: "Loop FM", tone: "yellow" as const, tag: "Brand", pts: 2 },
  ],
  "Client Review": [
    {
      title: "Website hero direction",
      client: "Northwind",
      tone: "green" as const,
      tag: "Web",
      pts: 5,
    },
    {
      title: "Campaign concepts",
      client: "Helix Health",
      tone: "purple" as const,
      tag: "Brand",
      pts: 3,
      revision: true,
    },
  ],
} as const;

function TasksPage() {
  return (
    <AppShell breadcrumb={["Workspace", "Tasks"]}>
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-[30px] font-semibold tracking-tight">Tasks</h1>
          <p className="text-[14px] text-muted-foreground mt-1">
            Workflow across pods · drag to reassign
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex bg-card border border-border rounded-[14px] p-1 w-full sm:w-auto">
            {["Board", "List", "Calendar"].map((v, i) => (
              <button
                key={v}
                className={`h-8 flex-1 sm:flex-initial px-3 rounded-[10px] text-[12px] font-medium ${
                  i === 0 ? "bg-foreground text-background" : "text-muted-foreground"
                }`}
              >
                {v}
              </button>
            ))}
          </div>
          <button className="h-10 px-4 rounded-[18px] bg-foreground text-background text-[13px] font-medium flex items-center justify-center gap-2 w-full sm:w-auto">
            <Plus className="w-4 h-4" /> New task
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Object.entries(stages).map(([stage, cards]) => (
          <div key={stage} className="bg-surface rounded-[28px] p-3">
            <div className="flex items-center justify-between px-3 py-2 mb-2">
              <div className="flex items-center gap-2">
                <span className="text-[13px] font-medium">{stage}</span>
                <span className="text-[11px] text-muted-foreground bg-card border border-border rounded-full px-1.5">
                  {cards.length}
                </span>
              </div>
              <button className="w-7 h-7 grid place-items-center rounded-lg hover:bg-card">
                <Plus className="w-3.5 h-3.5 text-subtle" />
              </button>
            </div>
            <div className="flex flex-col gap-2">
              {cards.map((c: any) => (
                <div key={c.title} className="bg-card border border-border rounded-[20px] p-4">
                  <div className="flex items-center justify-between mb-3">
                    <StatusPill tone={c.tone}>{c.tag}</StatusPill>
                    <MoreHorizontal className="w-4 h-4 text-subtle" />
                  </div>
                  <div className="text-[14px] font-medium leading-snug mb-1">{c.title}</div>
                  <div className="text-[12px] text-muted-foreground mb-3">{c.client}</div>
                  <div className="flex items-center justify-between">
                    <div className="flex -space-x-1.5">
                      {["#88A9F8", "#F3D36B"].map((col) => (
                        <span
                          key={col}
                          className="w-5 h-5 rounded-full border-2 border-card"
                          style={{ background: col }}
                        />
                      ))}
                    </div>
                    <div className="flex items-center gap-1.5">
                      {c.urgent && <StatusPill tone="red">Urgent</StatusPill>}
                      {c.revision && <StatusPill tone="orange">Rev</StatusPill>}
                      <span className="text-[11px] text-muted-foreground">{c.pts} pts</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </AppShell>
  );
}
