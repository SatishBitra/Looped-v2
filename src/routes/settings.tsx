import { createFileRoute } from "@tanstack/react-router";
import { AppShell, Card, SectionTitle } from "@/components/app-shell";
import { User, Bell, Shield, Users, Palette, KeyRound, ChevronRight } from "lucide-react";

export const Route = createFileRoute("/settings")({
  component: SettingsPage,
});

const groups = [
  { icon: User, title: "Profile", desc: "Name, role, avatar and personal preferences" },
  { icon: Bell, title: "Notifications", desc: "Email, in-app and digest cadence" },
  { icon: Users, title: "Team & pods", desc: "Members, roles, allocations" },
  { icon: Shield, title: "Permissions", desc: "Role-based visibility and approvals" },
  { icon: Palette, title: "Appearance", desc: "Theme, density, sidebar" },
  { icon: KeyRound, title: "Security", desc: "SSO, sessions, API keys" },
];

function SettingsPage() {
  return (
    <AppShell breadcrumb={["Workspace", "Settings"]}>
      <div className="mb-8">
        <h1 className="text-[30px] font-semibold tracking-tight">Settings</h1>
        <p className="text-[14px] text-muted-foreground mt-1">
          Personal and workspace-level preferences
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6">
        <Card className="p-3 h-fit">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-1 gap-1">
            {groups.map((g, i) => {
              const Icon = g.icon;
              return (
                <button
                  key={g.title}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-[16px] text-left ${
                    i === 0 ? "bg-surface" : "hover:bg-surface"
                  }`}
                >
                  <Icon className="w-4 h-4 text-muted-foreground" strokeWidth={1.75} />
                  <span className="text-[13px] font-medium flex-1">{g.title}</span>
                  <ChevronRight className="w-3.5 h-3.5 text-subtle hidden lg:inline-block" />
                </button>
              );
            })}
          </div>
        </Card>

        <div className="flex flex-col gap-4">
          <Card className="p-5 sm:p-6">
            <SectionTitle title="Profile" />
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-status-purple-bg text-status-purple grid place-items-center text-[20px] font-semibold flex-shrink-0">
                  AR
                </div>
                <div>
                  <div className="text-[15px] font-medium">Anna Rossi</div>
                  <div className="text-[13px] text-muted-foreground">Producer · Design pod</div>
                </div>
              </div>
              <button className="sm:ml-auto h-9 px-3.5 rounded-[14px] bg-surface text-[12px] font-medium w-full sm:w-auto">
                Change photo
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { l: "Display name", v: "Anna Rossi" },
                { l: "Email", v: "anna@loooped.studio" },
                { l: "Role", v: "Producer" },
                { l: "Pod", v: "Design" },
              ].map((f) => (
                <div key={f.l}>
                  <label className="text-[12px] text-muted-foreground block mb-1.5">{f.l}</label>
                  <input
                    defaultValue={f.v}
                    className="w-full h-10 px-3.5 rounded-[14px] bg-surface text-[14px] focus:outline-none focus:ring-2 focus:ring-foreground/10"
                  />
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-6">
            <SectionTitle title="Notifications" />
            <div className="flex flex-col divide-y divide-border">
              {[
                {
                  l: "Approvals waiting",
                  d: "Ping me when work is submitted for my review",
                  on: true,
                },
                { l: "Client responses", d: "Emails and in-app when clients comment", on: true },
                { l: "Capacity warnings", d: "Alerts when any pod exceeds 85%", on: true },
                { l: "Weekly digest", d: "Every Monday, 9:00 am", on: false },
              ].map((n) => (
                <div
                  key={n.l}
                  className="flex items-center justify-between py-3 first:pt-0 last:pb-0"
                >
                  <div>
                    <div className="text-[14px] font-medium">{n.l}</div>
                    <div className="text-[12px] text-muted-foreground">{n.d}</div>
                  </div>
                  <button
                    className={`w-11 h-6 rounded-full p-0.5 transition-colors ${n.on ? "bg-foreground" : "bg-border"}`}
                  >
                    <span
                      className={`block w-5 h-5 rounded-full bg-background transition-transform ${n.on ? "translate-x-5" : ""}`}
                    />
                  </button>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
