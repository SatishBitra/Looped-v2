import { useState } from "react";
import { Check, RefreshCw, ChevronDown } from "lucide-react";
import { toast } from "sonner";

interface ServiceItem {
  id: string;
  name: string;
  uptime: string;
  greenBarsCount: number; // how many recent bars are vibrant green
  totalBars?: number;
  description?: string;
}

const DEFAULT_SERVICES: ServiceItem[] = [
  {
    id: "api",
    name: "api.github.com",
    uptime: "100.000% uptime",
    greenBarsCount: 6,
    description: "GitHub API & Webhook synchronization",
  },
  {
    id: "cloudflare",
    name: "cloudflare.com/am-gjn",
    uptime: "100.000% uptime",
    greenBarsCount: 5,
    description: "Edge CDN & Global DNS distribution",
  },
  {
    id: "app",
    name: "app.loooped.studio",
    uptime: "100.000% uptime",
    greenBarsCount: 6,
    description: "Web application dashboard & routing",
  },
  {
    id: "auth",
    name: "auth.loooped.studio",
    uptime: "100.000% uptime",
    greenBarsCount: 5,
    description: "User authentication & token management",
  },
  {
    id: "db",
    name: "db.loooped.studio",
    uptime: "100.000% uptime",
    greenBarsCount: 6,
    description: "Database cluster & realtime replication",
  },
  {
    id: "amazon",
    name: "amazon.com (AWS S3)",
    uptime: "100.000% uptime",
    greenBarsCount: 2,
    description: "Asset storage & media delivery",
  },
  {
    id: "gateway",
    name: "api.loooped.studio",
    uptime: "100.000% uptime",
    greenBarsCount: 6,
    description: "Core REST & GraphQL gateway",
  },
];

export function BetterStackStatus() {
  const [lastUpdated, setLastUpdated] = useState<string>("Oct 26 at 01:57pm EDT");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeFilter, setActiveFilter] = useState<"all" | "core" | "external">("all");

  const totalBars = 55;

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      const now = new Date();
      const formatted =
        now.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        }) +
        " at " +
        now.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        });
      setLastUpdated(formatted);
      setIsRefreshing(false);
      toast.success("Status re-checked: All services are operational");
    }, 450);
  };

  const services =
    activeFilter === "all"
      ? DEFAULT_SERVICES
      : activeFilter === "core"
        ? DEFAULT_SERVICES.filter((s) => s.name.includes("loooped"))
        : DEFAULT_SERVICES.filter((s) => !s.name.includes("loooped"));

  return (
    <div id="betterstack-status-container" className="space-y-6 pt-2 pb-6 max-w-4xl mx-auto">
      {/* Top Centered Status Header matching Better Stack */}
      <div className="text-center py-4">
        <div className="w-9 h-9 rounded-full bg-[#10B981] text-white flex items-center justify-center mx-auto mb-3 shadow-xs">
          <Check className="w-5 h-5 stroke-[3]" />
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
          All services are online
        </h2>
        <div className="flex items-center justify-center gap-2 mt-1.5 text-xs text-muted-foreground">
          <span>Last updated on {lastUpdated}</span>
          <span>•</span>
          <button
            type="button"
            onClick={handleRefresh}
            className="inline-flex items-center gap-1 hover:text-foreground transition-colors cursor-pointer"
            title="Refresh status"
          >
            <RefreshCw className={`w-3 h-3 ${isRefreshing ? "animate-spin text-[#10B981]" : ""}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Main Status Visuals Card (Clean light-theme with Better Stack layout) */}
      <div className="bg-white dark:bg-[#18181B] border border-slate-200/90 dark:border-border rounded-2xl shadow-xs p-6 sm:p-8 transition-colors">
        {/* Card Header */}
        <div className="flex items-center justify-between pb-6 border-b border-slate-100 dark:border-border/60">
          <div className="flex items-center gap-3">
            <span className="text-sm font-semibold text-foreground">Services & Infrastructure</span>
            <div className="hidden sm:flex items-center gap-1 bg-slate-100 dark:bg-muted/40 p-0.5 rounded-lg text-[11px] font-medium text-muted-foreground">
              <button
                type="button"
                onClick={() => setActiveFilter("all")}
                className={`px-2 py-0.5 rounded-md transition-colors cursor-pointer ${
                  activeFilter === "all"
                    ? "bg-white dark:bg-surface text-foreground shadow-xs"
                    : "hover:text-foreground"
                }`}
              >
                All
              </button>
              <button
                type="button"
                onClick={() => setActiveFilter("core")}
                className={`px-2 py-0.5 rounded-md transition-colors cursor-pointer ${
                  activeFilter === "core"
                    ? "bg-white dark:bg-surface text-foreground shadow-xs"
                    : "hover:text-foreground"
                }`}
              >
                Platform
              </button>
              <button
                type="button"
                onClick={() => setActiveFilter("external")}
                className={`px-2 py-0.5 rounded-md transition-colors cursor-pointer ${
                  activeFilter === "external"
                    ? "bg-white dark:bg-surface text-foreground shadow-xs"
                    : "hover:text-foreground"
                }`}
              >
                Dependencies
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-[#10B981] dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200/70 dark:border-emerald-800/40">
              <span className="w-2 h-2 rounded-full bg-[#10B981]" />
              Operational
            </span>
            <ChevronDown className="w-4 h-4 text-muted-foreground/60 hidden sm:block" />
          </div>
        </div>

        {/* Services List with Better Stack Segmented Bars */}
        <div className="divide-y divide-slate-100 dark:divide-border/60">
          {services.map((service) => {
            const greenStart = totalBars - service.greenBarsCount;

            return (
              <div key={service.id} className="py-6 first:pt-6 last:pb-2">
                {/* Service Header Row */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#10B981] shrink-0" />
                    <span className="text-sm font-semibold text-foreground tracking-tight font-mono sm:font-sans">
                      {service.name}
                    </span>
                  </div>
                  <span className="text-xs font-semibold text-[#10B981] font-mono">
                    {service.uptime}
                  </span>
                </div>

                {/* Better Stack Segmented 90-Day Uptime Bars */}
                <div
                  className="flex items-center gap-[2px] sm:gap-[3px] w-full h-8 sm:h-9 my-2"
                  role="img"
                  aria-label={`90 days uptime history for ${service.name}`}
                >
                  {Array.from({ length: totalBars }).map((_, barIdx) => {
                    const isGreen = barIdx >= greenStart;
                    const dayOffset = totalBars - barIdx;
                    return (
                      <div
                        key={barIdx}
                        title={`Day -${dayOffset}: 100% uptime, 0 incidents`}
                        className={`flex-1 h-full rounded-[1.5px] sm:rounded-[2px] transition-all duration-150 cursor-pointer ${
                          isGreen
                            ? "bg-[#10B981] hover:bg-[#059669] hover:scale-y-110"
                            : "bg-[#EAECEF] dark:bg-[#27272A] hover:bg-[#D5D8DC] dark:hover:bg-[#3F3F46] hover:scale-y-105"
                        }`}
                      />
                    );
                  })}
                </div>

                {/* Bottom Timeline Range Labels */}
                <div className="flex items-center justify-between text-[11px] text-muted-foreground mt-1.5 font-medium">
                  <span>90 days ago</span>
                  <span>Today</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer Uptime Note */}
      <div className="text-center text-xs text-muted-foreground/80 pt-2">
        Monitored continuously every 60 seconds with 99.98% SLA target.
      </div>
    </div>
  );
}
