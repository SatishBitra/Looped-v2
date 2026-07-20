import { createFileRoute } from "@tanstack/react-router";
import { AppShell, Card, SectionTitle, StatusPill } from "@/components/app-shell";
import { Download } from "lucide-react";

export const Route = createFileRoute("/reports")({
  component: ReportsPage,
});

function ReportsPage() {
  const weekly = [8.5, 9.0, 8.0, 10.5, 8.2, 0.0, 0.0];
  const max = 12;

  return (
    <AppShell breadcrumb={["Workspace", "Reports"]}>
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-[30px] font-semibold tracking-tight">Reports</h1>
          <p className="text-[14px] text-muted-foreground mt-1">
            Delivery, capacity, and budget health
          </p>
        </div>
        <button className="h-10 px-4 rounded-[18px] bg-card border border-border text-[13px] font-medium flex items-center justify-center gap-2 w-full sm:w-auto">
          <Download className="w-4 h-4" strokeWidth={1.75} /> Export
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        {[
          { l: "On-time delivery", v: "92%", t: "green" as const },
          { l: "Avg. cycle time", v: "6.4d", t: "blue" as const },
          { l: "Utilization", v: "78%", t: "orange" as const },
          { l: "Client CSAT", v: "4.7", t: "purple" as const },
        ].map((k) => (
          <Card key={k.l} className="p-5 sm:p-6">
            <div className="text-[13px] text-muted-foreground mb-4">{k.l}</div>
            <div className="flex items-end justify-between">
              <div className="text-3xl sm:text-[36px] font-semibold tracking-tight leading-none">
                {k.v}
              </div>
              <StatusPill tone={k.t}>+2.1%</StatusPill>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
        <Card className="lg:col-span-2 p-5 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <SectionTitle title="Weekly Hours Logged" />
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <span className="inline-block w-3 h-3 bg-foreground/80 rounded-xs" />
                <span className="text-[11px] font-medium text-muted-foreground">Logged Hours</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="inline-block w-3 h-0.5 bg-rose-500 border-t border-dashed" />
                <span className="text-[11px] font-medium text-muted-foreground">
                  Min 8h Requirement
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-center">
            {/* Analytics Summary */}
            <div className="md:col-span-1 space-y-4 pr-0 md:pr-4 md:border-r border-border">
              <div>
                <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">
                  Total Hours
                </p>
                <h3 className="text-2xl font-bold text-foreground mt-0.5">44.2 hrs</h3>
                <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold mt-1">
                  ✓ 100% Compliant
                </p>
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">
                  Daily Avg (Workdays)
                </p>
                <h3 className="text-lg font-bold text-foreground mt-0.5">8.84 hrs</h3>
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">
                  Policy Status
                </p>
                <div className="mt-1">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 uppercase tracking-wider">
                    Min 8h Met
                  </span>
                </div>
              </div>
            </div>

            {/* Interactive Chart */}
            <div className="md:col-span-3">
              <div className="relative h-52 flex items-end gap-3 sm:gap-4 pt-8">
                {/* 8 Hours Policy Line */}
                <div
                  className="absolute left-0 right-0 border-t border-dashed border-rose-500/60 z-10 flex items-center justify-end"
                  style={{ bottom: `${(8 / 12) * 100}%` }}
                >
                  <span className="text-[9px] font-bold text-rose-500 bg-card px-1.5 py-0.5 rounded-md border border-rose-500/20 mr-1 translate-y-[-50%]">
                    8.0h Min
                  </span>
                </div>

                {weekly.map((h, i) => {
                  const isWeekend = i >= 5;
                  const meetsRequirement = isWeekend || h >= 8.0;
                  return (
                    <div
                      key={i}
                      className="flex-1 flex flex-col items-center gap-2 relative group z-20"
                    >
                      {/* Hours Label */}
                      <span className="absolute -top-6 text-[10px] font-bold bg-[#111111] text-white dark:bg-white dark:text-[#111111] px-1.5 py-0.5 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap">
                        {h} hrs
                      </span>
                      <span className="text-[10px] font-semibold text-muted-foreground mb-1 group-hover:hidden">
                        {h > 0 ? `${h}h` : "-"}
                      </span>

                      {/* Bar */}
                      <div
                        className={`w-full rounded-t-[8px] transition-all duration-300 ${
                          h === 0
                            ? "bg-muted/30 h-1"
                            : !meetsRequirement
                              ? "bg-rose-500/80 hover:bg-rose-500"
                              : "bg-foreground/80 hover:bg-foreground"
                        }`}
                        style={{ height: h > 0 ? `${(h / 12) * 100}%` : "4px" }}
                      />

                      <div className="text-[11px] font-medium text-muted-foreground">
                        {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][i]}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-5 sm:p-6">
          <SectionTitle title="Project mix" />
          <div className="relative w-40 h-40 sm:w-44 sm:h-44 mx-auto my-2">
            <svg viewBox="0 0 42 42" className="w-full h-full -rotate-90">
              {
                [
                  { c: "#88A9F8", v: 34 },
                  { c: "#74C98F", v: 26 },
                  { c: "#F3D36B", v: 22 },
                  { c: "#A48AF8", v: 18 },
                ].reduce<{ segs: any[]; off: number }>(
                  (acc, s) => {
                    acc.segs.push(
                      <circle
                        key={s.c}
                        cx="21"
                        cy="21"
                        r="15.9"
                        fill="none"
                        stroke={s.c}
                        strokeWidth="6"
                        strokeDasharray={`${s.v} ${100 - s.v}`}
                        strokeDashoffset={-acc.off}
                      />,
                    );
                    acc.off += s.v;
                    return acc;
                  },
                  { segs: [], off: 0 },
                ).segs
              }
            </svg>
            <div className="absolute inset-0 grid place-items-center">
              <div className="text-center">
                <div className="text-xl sm:text-[24px] font-semibold">24</div>
                <div className="text-[11px] text-muted-foreground">projects</div>
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-2 mt-2">
            {[
              { c: "#88A9F8", l: "Brand", v: "34%" },
              { c: "#74C98F", l: "Web", v: "26%" },
              { c: "#F3D36B", l: "Video", v: "22%" },
              { c: "#A48AF8", l: "Social", v: "18%" },
            ].map((r) => (
              <div key={r.l} className="flex items-center justify-between text-[12px]">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ background: r.c }} />
                  {r.l}
                </div>
                <span className="text-muted-foreground">{r.v}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card className="p-5 sm:p-6">
        <SectionTitle title="Budget burn by project" />
        <div className="flex flex-col gap-4">
          {[
            { p: "Q4 Rebrand", v: 68, t: "green" as const },
            { p: "Product film", v: 91, t: "yellow" as const },
            { p: "Social pack Q3", v: 112, t: "red" as const },
            { p: "Design system", v: 44, t: "green" as const },
            { p: "Podcast branding", v: 87, t: "yellow" as const },
          ].map((r) => (
            <div
              key={r.p}
              className="grid grid-cols-1 sm:grid-cols-[180px_1fr_60px] items-start sm:items-center gap-2 sm:gap-4"
            >
              <div className="text-[13px] font-medium">{r.p}</div>
              <div className="h-2 rounded-full bg-surface overflow-hidden w-full">
                <div
                  className={`h-full rounded-full bg-status-${r.t}`}
                  style={{ width: `${Math.min(r.v, 100)}%` }}
                />
              </div>
              <div className="text-[12px] text-muted-foreground text-left sm:text-right">
                {r.v}%
              </div>
            </div>
          ))}
        </div>
      </Card>
    </AppShell>
  );
}
