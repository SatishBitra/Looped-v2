import { createFileRoute } from "@tanstack/react-router";
import { AppShell, Card, SectionTitle, StatusPill } from "@/components/app-shell";
import { Filter, ArrowUpDown, Plus } from "lucide-react";

export const Route = createFileRoute("/projects")({
  component: ProjectsPage,
});

const projects = [
  {
    name: "Q4 Rebrand",
    client: "Northwind",
    stage: "In Progress",
    tone: "blue" as const,
    health: "Healthy",
    healthTone: "green" as const,
    budget: 68,
    due: "Sep 30",
  },
  {
    name: "Product film",
    client: "Kite Motors",
    stage: "Client Review",
    tone: "purple" as const,
    health: "Tight",
    healthTone: "yellow" as const,
    budget: 91,
    due: "Aug 12",
  },
  {
    name: "Landing revamp",
    client: "Helix Health",
    stage: "Pod Allocation",
    tone: "orange" as const,
    health: "Healthy",
    healthTone: "green" as const,
    budget: 22,
    due: "Oct 04",
  },
  {
    name: "Social pack Q3",
    client: "Aurora Coffee",
    stage: "Approval",
    tone: "yellow" as const,
    health: "Over",
    healthTone: "red" as const,
    budget: 112,
    due: "Jul 28",
  },
  {
    name: "Design system",
    client: "Internal",
    stage: "In Progress",
    tone: "green" as const,
    health: "Healthy",
    healthTone: "green" as const,
    budget: 44,
    due: "Nov 15",
  },
  {
    name: "Podcast branding",
    client: "Loop FM",
    stage: "Client Review",
    tone: "purple" as const,
    health: "Tight",
    healthTone: "yellow" as const,
    budget: 87,
    due: "Aug 02",
  },
];

function ProjectsPage() {
  return (
    <AppShell breadcrumb={["Workspace", "Projects"]}>
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-[30px] font-semibold tracking-tight">Projects</h1>
          <p className="text-[14px] text-muted-foreground mt-1">
            24 active · 6 pending kickoff · 3 archived this month
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button className="h-10 flex-1 sm:flex-initial justify-center px-3.5 rounded-[18px] bg-card border border-border text-[13px] font-medium flex items-center gap-2">
            <Filter className="w-4 h-4" strokeWidth={1.75} /> Filter
          </button>
          <button className="h-10 flex-1 sm:flex-initial justify-center px-3.5 rounded-[18px] bg-card border border-border text-[13px] font-medium flex items-center gap-2">
            <ArrowUpDown className="w-4 h-4" strokeWidth={1.75} /> Sort
          </button>
          <button className="h-10 w-full sm:w-auto justify-center px-4 rounded-[18px] bg-foreground text-background text-[13px] font-medium flex items-center gap-2">
            <Plus className="w-4 h-4" /> New project
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        {["All", "Active", "In review", "At risk", "Archived"].map((t, i) => (
          <button
            key={t}
            className={`h-8 px-3.5 rounded-full text-[12px] font-medium ${
              i === 0
                ? "bg-foreground text-background"
                : "bg-card border border-border text-muted-foreground"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left min-w-[700px] sm:min-w-0">
            <thead className="text-[12px] text-muted-foreground">
              <tr className="border-b border-border">
                <th className="py-4 pl-6 pr-3 font-medium">Project</th>
                <th className="py-4 px-3 font-medium">Client</th>
                <th className="py-4 px-3 font-medium">Stage</th>
                <th className="py-4 px-3 font-medium">Health</th>
                <th className="py-4 px-3 font-medium">Budget used</th>
                <th className="py-4 px-3 font-medium">Team</th>
                <th className="py-4 px-3 pr-6 font-medium text-right">Due</th>
              </tr>
            </thead>
            <tbody>
              {projects.map((p) => (
                <tr
                  key={p.name}
                  className="border-b border-border last:border-0 hover:bg-surface transition-colors"
                >
                  <td className="py-4 pl-6 pr-3">
                    <div className="text-[14px] font-medium">{p.name}</div>
                  </td>
                  <td className="py-4 px-3 text-[13px] text-muted-foreground">{p.client}</td>
                  <td className="py-4 px-3">
                    <StatusPill tone={p.tone}>{p.stage}</StatusPill>
                  </td>
                  <td className="py-4 px-3">
                    <StatusPill tone={p.healthTone}>{p.health}</StatusPill>
                  </td>
                  <td className="py-4 px-3">
                    <div className="flex items-center gap-2 w-40">
                      <div className="flex-1 h-1.5 rounded-full bg-surface overflow-hidden">
                        <div
                          className={`h-full rounded-full bg-status-${p.healthTone}`}
                          style={{ width: `${Math.min(p.budget, 100)}%` }}
                        />
                      </div>
                      <span className="text-[12px] text-muted-foreground w-8 text-right">
                        {p.budget}%
                      </span>
                    </div>
                  </td>
                  <td className="py-4 px-3">
                    <div className="flex -space-x-1.5">
                      {["#88A9F8", "#F3D36B", "#A48AF8"].map((c) => (
                        <span
                          key={c}
                          className="w-6 h-6 rounded-full border-2 border-card"
                          style={{ background: c }}
                        />
                      ))}
                    </div>
                  </td>
                  <td className="py-4 px-3 pr-6 text-[13px] text-muted-foreground text-right">
                    {p.due}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </AppShell>
  );
}
