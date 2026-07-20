import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { AppShell, Card } from "@/components/app-shell";
import { Search, Paperclip, Smile, Send, Mic, ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/messages")({
  component: MessagesPage,
});

const threads = [
  {
    name: "Northwind — Q4 Rebrand",
    last: "Client approved the hero direction.",
    time: "12m",
    unread: 2,
    color: "#88A9F8",
  },
  {
    name: "Design pod",
    last: "Sara: pushed the token updates.",
    time: "1h",
    unread: 0,
    color: "#74C98F",
  },
  {
    name: "Kite Motors — Film",
    last: "Luca: sending cut v3 tonight.",
    time: "2h",
    unread: 1,
    color: "#A48AF8",
  },
  {
    name: "Loop FM — Podcast",
    last: "Ivan: cover art is ready for review.",
    time: "5h",
    unread: 0,
    color: "#F3D36B",
  },
  {
    name: "Ops — Capacity",
    last: "System: design pod at 92%.",
    time: "1d",
    unread: 0,
    color: "#F47D7D",
  },
];

const msgs = [
  {
    from: "Sara D.",
    side: "them",
    text: "Hero direction is locked. I'll ship the layered version tomorrow.",
    time: "10:14",
  },
  {
    from: "Anna R.",
    side: "me",
    text: "Perfect. Please loop in Marta for the print variant.",
    time: "10:16",
  },
  {
    from: "Marta L.",
    side: "them",
    text: "On it — I'll bring options to the pod sync.",
    time: "10:18",
  },
  {
    from: "Client — Northwind",
    side: "them",
    text: "Approving the direction. Excited to see it come together.",
    time: "10:32",
    client: true,
  },
];

export function MessagesContent({ isModal = false, showChatOnMobile, setShowChatOnMobile }: { isModal?: boolean; showChatOnMobile: boolean; setShowChatOnMobile: (show: boolean) => void }) {
  return (
    <div className={`flex md:grid md:grid-cols-[280px_1fr] lg:grid-cols-[320px_1fr] gap-4 w-full ${isModal ? "h-[600px]" : "h-[calc(100vh-140px)]"}`}>
      {/* Thread list */}
      <Card
        className={`p-4 flex flex-col overflow-hidden w-full md:w-auto h-full ${showChatOnMobile ? "hidden md:flex" : "flex"}`}
      >
        <div className="relative mb-4">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-subtle" />
          <input
            placeholder="Search conversations"
            className="w-full h-9 pl-9 pr-3 rounded-[14px] bg-surface text-[13px] placeholder:text-subtle focus:outline-none"
          />
        </div>
        <div className="flex-1 overflow-y-auto -mx-2">
          {threads.map((t, i) => (
            <button
              key={t.name}
              onClick={() => setShowChatOnMobile(true)}
              className={`w-full text-left px-3 py-3 rounded-[16px] mb-1 flex items-start gap-3 ${
                i === 0 ? "bg-surface" : "hover:bg-surface"
              }`}
            >
              <span className="w-9 h-9 rounded-full shrink-0" style={{ background: t.color }} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="text-[13px] font-medium truncate">{t.name}</span>
                  <span className="text-[11px] text-muted-foreground shrink-0 ml-2">
                    {t.time}
                  </span>
                </div>
                <div className="text-[12px] text-muted-foreground truncate">{t.last}</div>
              </div>
              {t.unread > 0 && (
                <span className="w-5 h-5 rounded-full bg-foreground text-background text-[10px] font-medium grid place-items-center shrink-0">
                  {t.unread}
                </span>
              )}
            </button>
          ))}
        </div>
      </Card>

      {/* Conversation */}
      <Card
        className={`flex flex-col overflow-hidden w-full h-full ${showChatOnMobile ? "flex" : "hidden md:flex"}`}
      >
        <div className="px-4 sm:px-6 py-4 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={() => setShowChatOnMobile(false)}
              className="md:hidden h-9 w-9 rounded-[14px] bg-surface grid place-items-center text-muted-foreground hover:text-foreground shrink-0"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <span className="w-10 h-10 rounded-full shrink-0" style={{ background: "#88A9F8" }} />
            <div className="min-w-0">
              <div className="text-[15px] font-medium truncate">Northwind — Q4 Rebrand</div>
              <div className="text-[12px] text-muted-foreground truncate">
                Sara D. · Marta L. · Anna R. · Client
              </div>
            </div>
          </div>
          <div className="hidden sm:flex -space-x-2">
            {["#88A9F8", "#F3D36B", "#A48AF8", "#74C98F"].map((c) => (
              <span
                key={c}
                className="w-8 h-8 rounded-full border-2 border-card"
                style={{ background: c }}
              />
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-6 flex flex-col gap-4">
          {msgs.map((m, i) => (
            <div key={i} className={`flex ${m.side === "me" ? "justify-end" : ""}`}>
              <div className={`max-w-[70%] ${m.side === "me" ? "items-end" : ""}`}>
                <div className="text-[11px] text-muted-foreground mb-1 px-1">
                  {m.from} · {m.time}
                </div>
                <div
                  className={`px-4 py-2.5 text-[14px] leading-relaxed rounded-[20px] ${
                    m.side === "me"
                      ? "bg-foreground text-background rounded-tr-[6px]"
                      : m.client
                        ? "bg-status-blue-bg text-foreground rounded-tl-[6px]"
                        : "bg-surface text-foreground rounded-tl-[6px]"
                  }`}
                >
                  {m.text}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="px-4 py-3 border-t border-border">
          <div className="flex items-center gap-2 bg-surface rounded-[18px] px-3 py-2">
            <button className="w-8 h-8 rounded-full grid place-items-center text-muted-foreground">
              <Paperclip className="w-4 h-4" strokeWidth={1.75} />
            </button>
            <input
              placeholder="Write a message…"
              className="flex-1 bg-transparent text-[14px] placeholder:text-subtle focus:outline-none"
            />
            <button className="w-8 h-8 rounded-full grid place-items-center text-muted-foreground">
              <Smile className="w-4 h-4" strokeWidth={1.75} />
            </button>
            <button className="w-8 h-8 rounded-full grid place-items-center text-muted-foreground">
              <Mic className="w-4 h-4" strokeWidth={1.75} />
            </button>
            <button className="h-9 px-3.5 rounded-[12px] bg-foreground text-background text-[12px] font-medium flex items-center gap-1.5">
              <Send className="w-3.5 h-3.5" /> Send
            </button>
          </div>
        </div>
      </Card>
    </div>
  );
}

export function MessagesPage() {
  const [showChatOnMobile, setShowChatOnMobile] = useState(false);

  return (
    <AppShell breadcrumb={["Workspace", "Messages"]}>
      <MessagesContent showChatOnMobile={showChatOnMobile} setShowChatOnMobile={setShowChatOnMobile} />
    </AppShell>
  );
}
