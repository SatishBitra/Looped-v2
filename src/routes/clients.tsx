import { createFileRoute } from "@tanstack/react-router";
import { AppShell, Card, StatusPill } from "@/components/app-shell";
import { Plus, Mail, Phone, ExternalLink } from "lucide-react";

export const Route = createFileRoute("/clients")({
  component: ClientsPage,
});

const clients = [
  {
    name: "Northwind",
    industry: "Consumer goods",
    projects: 4,
    color: "#88A9F8",
    tone: "green" as const,
    status: "Active",
    contact: "sara@northwind.com",
  },
  {
    name: "Kite Motors",
    industry: "Automotive",
    projects: 3,
    color: "#A48AF8",
    tone: "yellow" as const,
    status: "Tight",
    contact: "jane@kitemotors.com",
  },
  {
    name: "Aurora Coffee",
    industry: "F&B",
    projects: 2,
    color: "#F3D36B",
    tone: "green" as const,
    status: "Active",
    contact: "hello@auroracoffee.com",
  },
  {
    name: "Helix Health",
    industry: "Healthcare",
    projects: 5,
    color: "#74C98F",
    tone: "green" as const,
    status: "Active",
    contact: "team@helix.health",
  },
  {
    name: "Meridian",
    industry: "Finance",
    projects: 2,
    color: "#FF9B72",
    tone: "red" as const,
    status: "At risk",
    contact: "ops@meridian.co",
  },
  {
    name: "Loop FM",
    industry: "Media",
    projects: 1,
    color: "#F47D7D",
    tone: "green" as const,
    status: "Active",
    contact: "studio@loop.fm",
  },
];

function ClientsPage() {
  return (
    <AppShell breadcrumb={["Workspace", "Clients"]}>
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-[30px] font-semibold tracking-tight">Clients</h1>
          <p className="text-[14px] text-muted-foreground mt-1">
            6 active accounts · 17 stakeholders
          </p>
        </div>
        <button className="h-10 px-4 rounded-[18px] bg-foreground text-background text-[13px] font-medium flex items-center justify-center gap-2 w-full sm:w-auto">
          <Plus className="w-4 h-4" /> New client
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {clients.map((c) => (
          <Card key={c.name} className="p-6">
            <div className="flex items-start justify-between mb-5">
              <div
                className="w-12 h-12 rounded-2xl grid place-items-center text-[15px] font-semibold text-foreground"
                style={{ background: c.color + "40" }}
              >
                {c.name
                  .split(" ")
                  .map((s) => s[0])
                  .slice(0, 2)
                  .join("")}
              </div>
              <StatusPill tone={c.tone}>{c.status}</StatusPill>
            </div>
            <div className="text-[17px] font-medium">{c.name}</div>
            <div className="text-[12px] text-muted-foreground mb-4">{c.industry}</div>

            <div className="flex items-center gap-4 py-3 border-t border-border text-[12px] text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5" /> {c.contact}
              </div>
            </div>
            <div className="flex items-center justify-between pt-2">
              <span className="text-[12px] text-muted-foreground">{c.projects} projects</span>
              <button className="text-[12px] font-medium flex items-center gap-1 text-foreground">
                Open <ExternalLink className="w-3 h-3" />
              </button>
            </div>
          </Card>
        ))}
      </div>
    </AppShell>
  );
}
