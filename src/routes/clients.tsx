import { createFileRoute } from "@tanstack/react-router";
import { AppShell, Card, StatusPill } from "@/components/app-shell";
import { Plus, Mail, ExternalLink, X, Briefcase, Tag, Sparkles } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";

export const Route = createFileRoute("/clients")({
  component: ClientsPage,
});

const initialClients = [
  {
    name: "Northwind",
    industry: "Consumer goods",
    projects: 4,
    color: "#10B981", // Emerald
    tone: "green" as const,
    status: "Active",
    contact: "sara@northwind.com",
  },
  {
    name: "Kite Motors",
    industry: "Automotive",
    projects: 3,
    color: "#F59E0B", // Amber
    tone: "yellow" as const,
    status: "Tight",
    contact: "jane@kitemotors.com",
  },
  {
    name: "Aurora Coffee",
    industry: "F&B",
    projects: 2,
    color: "#10B981", // Emerald
    tone: "green" as const,
    status: "Active",
    contact: "hello@auroracoffee.com",
  },
  {
    name: "Helix Health",
    industry: "Healthcare",
    projects: 5,
    color: "#10B981", // Emerald
    tone: "green" as const,
    status: "Active",
    contact: "team@helix.health",
  },
  {
    name: "Meridian",
    industry: "Finance",
    projects: 2,
    color: "#EF4444", // Rose
    tone: "red" as const,
    status: "At risk",
    contact: "ops@meridian.co",
  },
  {
    name: "Loop FM",
    industry: "Media",
    projects: 1,
    color: "#10B981", // Emerald
    tone: "green" as const,
    status: "Active",
    contact: "studio@loop.fm",
  },
];

const PRESET_COLORS = [
  { name: "Emerald", value: "#10B981" },
  { name: "Amber", value: "#F59E0B" },
  { name: "Blue", value: "#3B82F6" },
  { name: "Indigo", value: "#6366F1" },
  { name: "Rose", value: "#EF4444" },
  { name: "Purple", value: "#8B5CF6" },
];

function ClientsPage() {
  const [clients, setClients] = useState(initialClients);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newClientName, setNewClientName] = useState("");
  const [newClientIndustry, setNewClientIndustry] = useState("");
  const [newClientContact, setNewClientContact] = useState("");
  const [newClientStatus, setNewClientStatus] = useState<"Active" | "Tight" | "At risk">("Active");
  const [newClientColor, setNewClientColor] = useState("#3B82F6");

  const handleAddClient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClientName.trim() || !newClientIndustry.trim() || !newClientContact.trim()) {
      toast.error("Please fill in all client details.");
      return;
    }

    const toneMap = {
      Active: "green" as const,
      Tight: "yellow" as const,
      "At risk": "red" as const,
    };

    const newClientObj = {
      name: newClientName,
      industry: newClientIndustry,
      projects: 0,
      color: newClientColor,
      tone: toneMap[newClientStatus],
      status: newClientStatus,
      contact: newClientContact,
    };

    setClients([newClientObj, ...clients]);
    setIsAddOpen(false);

    // Reset Form
    setNewClientName("");
    setNewClientIndustry("");
    setNewClientContact("");
    setNewClientStatus("Active");
    setNewClientColor("#3B82F6");

    toast.success(`Client "${newClientObj.name}" added successfully.`);
  };

  return (
    <AppShell breadcrumb={["Workspace", "Clients"]}>
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-[30px] font-semibold tracking-tight">Clients</h1>
          <p className="text-[14px] text-muted-foreground mt-1">
            {clients.filter((c) => c.status === "Active").length} active accounts · {clients.length}{" "}
            total client folders
          </p>
        </div>
        <button
          onClick={() => setIsAddOpen(true)}
          className="h-10 px-4 rounded-[18px] bg-foreground text-background text-[13px] font-semibold flex items-center justify-center gap-2 w-full sm:w-auto transition-all cursor-pointer hover:opacity-90"
        >
          <Plus className="w-4 h-4" strokeWidth={2.5} /> New client
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {clients.map((c) => (
          <Card
            key={c.name}
            className="p-6 relative overflow-hidden group hover:border-foreground/25 transition-all"
          >
            <div className="flex items-start justify-between mb-5">
              <div
                className="w-12 h-12 rounded-2xl grid place-items-center text-[15px] font-bold text-white transition-transform group-hover:scale-105"
                style={{ background: c.color }}
              >
                {c.name
                  .split(" ")
                  .map((s) => s[0])
                  .slice(0, 2)
                  .join("")}
              </div>
              <StatusPill tone={c.tone}>{c.status}</StatusPill>
            </div>
            <div className="text-[17px] font-bold text-foreground">{c.name}</div>
            <div className="text-[12px] font-medium text-muted-foreground mb-4">{c.industry}</div>

            <div className="flex items-center gap-4 py-3 border-t border-border text-[12px] text-muted-foreground font-medium">
              <div className="flex items-center gap-1.5 truncate">
                <Mail className="w-3.5 h-3.5" /> {c.contact}
              </div>
            </div>
            <div className="flex items-center justify-between pt-2">
              <span className="text-[12px] font-semibold text-muted-foreground">
                {c.projects} projects
              </span>
              <button className="text-[12px] font-semibold flex items-center gap-1 text-foreground hover:underline cursor-pointer">
                Open Folder <ExternalLink className="w-3 h-3" />
              </button>
            </div>
          </Card>
        ))}
      </div>

      {/* NEW CLIENT POPUP DRAWER/MODAL */}
      <AnimatePresence>
        {isAddOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAddOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-xs"
            />

            {/* Modal Body */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-white dark:bg-[#1c1c20] border border-border rounded-[28px] max-w-md w-full p-6 shadow-2xl z-10 relative space-y-5 text-left"
            >
              <button
                onClick={() => setIsAddOpen(false)}
                className="absolute right-5 top-5 w-8 h-8 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800/80 grid place-items-center text-muted-foreground hover:text-foreground transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-foreground/5 grid place-items-center">
                  <Briefcase className="w-5 h-5 text-foreground" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-foreground">Add New Client</h3>
                  <p className="text-xs text-muted-foreground">
                    Register an active brand or partner folder
                  </p>
                </div>
              </div>

              <form onSubmit={handleAddClient} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    Client Brand Name
                  </label>
                  <input
                    type="text"
                    required
                    value={newClientName}
                    onChange={(e) => setNewClientName(e.target.value)}
                    placeholder="e.g. Acme Corporation, Northwind..."
                    className="w-full h-10 px-3.5 bg-slate-50 dark:bg-[#151518] border border-border/60 rounded-xl text-xs font-semibold focus:outline-none focus:border-foreground/30 text-foreground"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    Industry Sector
                  </label>
                  <input
                    type="text"
                    required
                    value={newClientIndustry}
                    onChange={(e) => setNewClientIndustry(e.target.value)}
                    placeholder="e.g. Consumer Goods, Technology, Automotive..."
                    className="w-full h-10 px-3.5 bg-slate-50 dark:bg-[#151518] border border-border/60 rounded-xl text-xs font-semibold focus:outline-none focus:border-foreground/30 text-foreground"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    Primary Contact Email
                  </label>
                  <input
                    type="email"
                    required
                    value={newClientContact}
                    onChange={(e) => setNewClientContact(e.target.value)}
                    placeholder="e.g. hello@acmebrand.com"
                    className="w-full h-10 px-3.5 bg-slate-50 dark:bg-[#151518] border border-border/60 rounded-xl text-xs font-semibold focus:outline-none focus:border-foreground/30 text-foreground"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                      <Tag className="w-3 h-3" /> Initial Status
                    </label>
                    <select
                      value={newClientStatus}
                      onChange={(e) => setNewClientStatus(e.target.value as any)}
                      className="w-full h-10 px-2.5 bg-slate-50 dark:bg-[#151518] border border-border/60 rounded-xl text-xs font-semibold focus:outline-none focus:border-foreground/30 text-foreground"
                    >
                      <option value="Active">Active</option>
                      <option value="Tight">Tight</option>
                      <option value="At risk">At risk</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                      <Sparkles className="w-3 h-3" /> Theme Accent
                    </label>
                    <div className="flex flex-wrap gap-1.5 pt-1.5">
                      {PRESET_COLORS.map((col) => (
                        <button
                          key={col.value}
                          type="button"
                          onClick={() => setNewClientColor(col.value)}
                          className={`w-6 h-6 rounded-lg transition-transform hover:scale-115 relative cursor-pointer`}
                          style={{ backgroundColor: col.value }}
                          title={col.name}
                        >
                          {newClientColor === col.value && (
                            <span className="absolute inset-0 m-auto w-1.5 h-1.5 rounded-full bg-white" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 pt-3">
                  <button
                    type="button"
                    onClick={() => setIsAddOpen(false)}
                    className="flex-1 h-10 bg-slate-100 hover:bg-slate-200 dark:bg-[#242428] dark:hover:bg-[#2e2e34] text-foreground font-semibold rounded-xl text-xs transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 h-10 bg-foreground text-background font-semibold rounded-xl text-xs shadow-md hover:opacity-90 transition-opacity cursor-pointer"
                  >
                    Add Client
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </AppShell>
  );
}
