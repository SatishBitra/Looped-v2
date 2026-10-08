import { useState, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  PhoneOff,
  Mic,
  MicOff,
  Video,
  VideoOff,
  Share2,
  Users,
  Maximize2,
  Minimize2,
  Settings,
  FileText,
  MessageSquare,
  Hand,
  Sparkles,
  Plus,
  Copy,
  Check,
  Search,
  MoreVertical,
  Volume2,
  CheckSquare,
  Smile,
  X,
  LayoutGrid,
  Disc,
  UserPlus,
  SlidersHorizontal,
  Monitor,
  ChevronRight,
  Pin,
  Send,
  Trash2,
} from "lucide-react";
import { ChatThread } from "./types";
import { INITIAL_MEMBERS } from "./data";
import { toast } from "sonner";

export interface CallParticipant {
  id: string;
  name: string;
  avatar?: string;
  role: string;
  isMe?: boolean;
  isHost?: boolean;
  isMuted: boolean;
  isVideoOff: boolean;
  isScreenSharing?: boolean;
  isSpeaking?: boolean;
  hasRaisedHand?: boolean;
  isPinned?: boolean;
  status: "connected" | "connecting" | "ringing";
  connectionQuality?: "excellent" | "good" | "poor";
}

export interface InCallChatMessage {
  id: string;
  senderName: string;
  senderAvatar?: string;
  text: string;
  time: string;
  isMe?: boolean;
}

export interface ActionItem {
  id: string;
  text: string;
  done: boolean;
  assignee?: string;
}

interface VideoCallModalProps {
  isOpen: boolean;
  thread: ChatThread | null;
  onClose: () => void;
}

type SidePanelTab = "none" | "people" | "notes" | "chat" | "settings";
type CallLayoutMode = "auto" | "grid" | "spotlight";

// Pre-defined available contacts and teams for inviting
const AVAILABLE_TEAMS = [
  {
    id: "team-design",
    name: "Design Department Team",
    memberCount: 12,
    avatarBg: "bg-blue-600",
    badge: "Core Team",
    members: INITIAL_MEMBERS.slice(0, 4),
  },
  {
    id: "team-marketing",
    name: "Marketing & Growth Team",
    memberCount: 24,
    avatarBg: "bg-purple-600",
    badge: "Marketing",
    members: INITIAL_MEMBERS.slice(1, 5),
  },
  {
    id: "team-client",
    name: "Meridian Client Stakeholders",
    memberCount: 5,
    avatarBg: "bg-emerald-600",
    badge: "Client Group",
    members: [
      {
        id: "cl-1",
        name: "Laila Smith",
        avatar:
          "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
        role: "member" as const,
        isOnline: true,
        title: "Client Director",
      },
      {
        id: "cl-2",
        name: "Marlon Wright",
        avatar:
          "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80",
        role: "member" as const,
        isOnline: true,
        title: "Product VP",
      },
    ],
  },
];

const DIRECT_COLLEAGUES = [
  {
    id: "user-chloe",
    name: "Chloe Winslow",
    avatar:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    role: "Lead Product Designer",
    department: "Design",
    isClient: false,
  },
  {
    id: "user-henry",
    name: "Henry Stewart",
    avatar:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    role: "Senior UI/UX Designer",
    department: "Design",
    isClient: false,
  },
  {
    id: "user-marcus",
    name: "Marcus Vance",
    avatar:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
    role: "Design System Lead",
    department: "Design",
    isClient: false,
  },
  {
    id: "user-laila",
    name: "Laila Smith",
    avatar:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
    role: "Client Director - Meridian",
    department: "Client",
    isClient: true,
  },
  {
    id: "user-samuel",
    name: "Samuel Kingsley",
    avatar:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
    role: "Creative Partner",
    department: "Client",
    isClient: true,
  },
  {
    id: "user-ava",
    name: "Ava Foster",
    avatar:
      "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80",
    role: "Strategic Accounts",
    department: "Client",
    isClient: true,
  },
];

function createInitialParticipants(
  thread: ChatThread | null,
  isMicMuted: boolean,
  isVideoOff: boolean,
): CallParticipant[] {
  if (!thread) return [];
  const meParticipant: CallParticipant = {
    id: "me",
    name: "You (Host)",
    avatar:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&auto=format&fit=crop&q=80",
    role: "Presenter",
    isMe: true,
    isHost: true,
    isMuted: isMicMuted,
    isVideoOff: isVideoOff,
    status: "connected",
    connectionQuality: "excellent",
  };

  if (thread.type === "group") {
    const groupOthers: CallParticipant[] = (thread.members || INITIAL_MEMBERS.slice(0, 4)).map(
      (m, idx) => ({
        id: m.id,
        name: m.name,
        avatar: m.avatar,
        role: m.title || "Team Member",
        isMe: false,
        isMuted: idx === 1,
        isVideoOff: false,
        isSpeaking: idx === 0,
        status: "connected" as const,
        connectionQuality: "excellent" as const,
      }),
    );
    return [meParticipant, ...groupOthers];
  } else {
    const directOther: CallParticipant = {
      id: thread.id,
      name: thread.name,
      avatar: thread.avatar,
      role: thread.isClient ? "Client Stakeholder" : "Colleague",
      isMe: false,
      isMuted: false,
      isVideoOff: false,
      isSpeaking: true,
      status: "connected",
      connectionQuality: "excellent",
    };
    return [meParticipant, directOther];
  }
}

export function VideoCallModal({ isOpen, thread, onClose }: VideoCallModalProps) {
  // Timer state
  const [seconds, setSeconds] = useState(0);

  // Core device controls
  const [isMicMuted, setIsMicMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [hasRaisedHand, setHasRaisedHand] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Layout mode: auto (adapts to participant count), grid, or spotlight
  const [layoutMode, setLayoutMode] = useState<CallLayoutMode>("auto");
  const [pinnedParticipantId, setPinnedParticipantId] = useState<string | null>(null);

  // Active side panel tab
  const [activeSidePanel, setActiveSidePanel] = useState<SidePanelTab>("none");

  // Add People / Connect modal state
  const [isAddPeopleOpen, setIsAddPeopleOpen] = useState(false);
  const [addSearchQuery, setAddSearchQuery] = useState("");
  const [addCategoryFilter, setAddCategoryFilter] = useState<
    "all" | "teams" | "direct" | "clients"
  >("all");
  const [selectedBatchUsers, setSelectedBatchUsers] = useState<string[]>([]);

  // Floating reaction emojis state
  const [floatingReactions, setFloatingReactions] = useState<
    { id: string; emoji: string; left: number }[]
  >([]);

  // In-call chat messages
  const [inCallChat, setInCallChat] = useState<InCallChatMessage[]>([
    {
      id: "chat-1",
      senderName: "Chloe Winslow",
      senderAvatar:
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
      text: "I uploaded the revised Figma assets to the channel for reference.",
      time: "Just now",
      isMe: false,
    },
  ]);
  const [chatInput, setChatInput] = useState("");

  // In-call Shared Notes
  const [meetingNotes, setMeetingNotes] = useState<string>(
    `# Design Review & Sprint Huddle\n- Alignment on Q3 design tokens and component hierarchy.\n- Verified mobile responsiveness for team collaboration tabs.\n- Approved approval workflow badge alignment.`,
  );
  const [actionItems, setActionItems] = useState<ActionItem[]>([
    { id: "act-1", text: "Export final vector assets for client preview", done: true },
    { id: "act-2", text: "Sync token updates to global theme provider", done: false },
    { id: "act-3", text: "Schedule review follow-up with Meridian stakeholders", done: false },
  ]);
  const [newActionText, setNewActionText] = useState("");

  // In-call Settings state
  const [audioInputDevice, setAudioInputDevice] = useState("MacBook Pro Microphone (Built-in)");
  const [audioOutputDevice, setAudioOutputDevice] = useState("MacBook Pro Speakers");
  const [videoDevice, setVideoDevice] = useState("FaceTime HD Camera (1080p)");
  const [videoQuality, setVideoQuality] = useState<"1080p" | "720p" | "360p">("1080p");
  const [isNoiseCancellationOn, setIsNoiseCancellationOn] = useState(true);
  const [isBackgroundBlurOn, setIsBackgroundBlurOn] = useState(false);
  const [isMirrorVideoOn, setIsMirrorVideoOn] = useState(true);

  // Participants list in call initialized directly from thread
  const [participants, setParticipants] = useState<CallParticipant[]>(() =>
    createInitialParticipants(thread, false, false),
  );

  // Audio wave visualizer simulation for speaking indicator
  const [audioLevel, setAudioLevel] = useState(40);
  useEffect(() => {
    if (!isOpen || isMicMuted) return;
    const interval = setInterval(() => {
      setAudioLevel(Math.floor(Math.random() * 60) + 25);
    }, 400);
    return () => clearInterval(interval);
  }, [isOpen, isMicMuted]);

  // Keep participants in sync whenever thread changes or modal opens
  useEffect(() => {
    if (!isOpen || !thread) return;
    setParticipants(createInitialParticipants(thread, isMicMuted, isVideoOff));
  }, [isOpen, thread, isMicMuted, isVideoOff]);

  // Keep 'me' participant in sync with local mic and video state
  useEffect(() => {
    setParticipants((prev) =>
      prev.map((p) =>
        p.isMe
          ? {
              ...p,
              isMuted: isMicMuted,
              isVideoOff: isVideoOff,
              hasRaisedHand,
              isScreenSharing,
            }
          : p,
      ),
    );
  }, [isMicMuted, isVideoOff, hasRaisedHand, isScreenSharing]);

  // Call timer interval
  useEffect(() => {
    if (!isOpen) {
      setSeconds(0);
      return;
    }
    const interval = setInterval(() => {
      setSeconds((s) => s + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [isOpen]);

  // Keyboard shortcut: Spacebar to toggle mute, Esc to exit
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.code === "Space") {
        e.preventDefault();
        setIsMicMuted((prev) => {
          const next = !prev;
          toast.info(next ? "Microphone muted" : "Microphone active");
          return next;
        });
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  if (!isOpen || !thread) return null;

  const formatTimer = (sec: number) => {
    const hrs = Math.floor(sec / 3600);
    const mins = Math.floor((sec % 3600) / 60);
    const remaining = sec % 60;
    if (hrs > 0) {
      return `${String(hrs).padStart(2, "0")}:${String(mins).padStart(2, "0")}:${String(remaining).padStart(2, "0")}`;
    }
    return `${String(mins).padStart(2, "0")}:${String(remaining).padStart(2, "0")}`;
  };

  // Connected participants count
  const connectedCount = participants.filter((p) => p.status === "connected").length;

  // Determine active visual layout:
  // 1-on-1 (2 people): Cinema View with Floating Self-View
  // Multiple (3-4): 2x2 Grid View
  // Group (5+): Dynamic Gallery Grid or Spotlight based on layoutMode
  const effectiveLayout =
    layoutMode === "auto"
      ? connectedCount <= 2
        ? "1-on-1"
        : connectedCount <= 4
          ? "multi-grid"
          : "group-gallery"
      : layoutMode === "spotlight"
        ? "spotlight"
        : "group-gallery";

  // Trigger floating reaction
  const handleSendReaction = (emoji: string) => {
    const id = `react-${Date.now()}-${Math.random()}`;
    const left = Math.floor(Math.random() * 60) + 20; // 20% to 80% horizontal range
    setFloatingReactions((prev) => [...prev, { id, emoji, left }]);
    setTimeout(() => {
      setFloatingReactions((prev) => prev.filter((r) => r.id !== id));
    }, 2800);
  };

  // Add individual or client to call
  const handleInviteSingle = (contact: (typeof DIRECT_COLLEAGUES)[0]) => {
    // Check if already in call
    if (participants.some((p) => p.name === contact.name)) {
      toast.info(`${contact.name} is already in this call.`);
      return;
    }

    const newParticipantId = `user-${Date.now()}`;
    const newParticipant: CallParticipant = {
      id: newParticipantId,
      name: contact.name,
      avatar: contact.avatar,
      role: contact.role,
      isMe: false,
      isMuted: false,
      isVideoOff: false,
      status: "ringing",
      connectionQuality: "excellent",
    };

    setParticipants((prev) => [...prev, newParticipant]);
    toast.success(`Ringing ${contact.name}...`);
    setIsAddPeopleOpen(false);

    // Simulate answer after 2 seconds
    setTimeout(() => {
      setParticipants((prev) =>
        prev.map((p) => (p.id === newParticipantId ? { ...p, status: "connected" } : p)),
      );
      toast.success(`${contact.name} joined the call!`);
    }, 2200);
  };

  // Add entire Group / Team to call
  const handleInviteGroup = (team: (typeof AVAILABLE_TEAMS)[0]) => {
    const newMembersToAdd = team.members.filter(
      (m) => !participants.some((p) => p.name === m.name),
    );

    if (newMembersToAdd.length === 0) {
      toast.info(`All members of ${team.name} are already in this call.`);
      return;
    }

    const createdParticipants: CallParticipant[] = newMembersToAdd.map((m) => ({
      id: `p-${m.id}-${Date.now()}`,
      name: m.name,
      avatar: m.avatar,
      role: m.title || "Team Member",
      isMe: false,
      isMuted: false,
      isVideoOff: false,
      status: "ringing",
      connectionQuality: "excellent",
    }));

    setParticipants((prev) => [...prev, ...createdParticipants]);
    toast.success(`Connecting ${team.name} (${newMembersToAdd.length} members)...`);
    setIsAddPeopleOpen(false);

    // Simulate connection
    setTimeout(() => {
      setParticipants((prev) =>
        prev.map((p) => (p.status === "ringing" ? { ...p, status: "connected" } : p)),
      );
      toast.success(`${team.name} connected to the video call!`);
    }, 2400);
  };

  // Batch invite multiple selected contacts
  const handleInviteBatch = () => {
    if (selectedBatchUsers.length === 0) return;

    const toAdd = DIRECT_COLLEAGUES.filter((c) => selectedBatchUsers.includes(c.id)).filter(
      (c) => !participants.some((p) => p.name === c.name),
    );

    if (toAdd.length === 0) {
      toast.info("Selected contacts are already in this call.");
      setSelectedBatchUsers([]);
      return;
    }

    const created: CallParticipant[] = toAdd.map((c) => ({
      id: `p-${c.id}-${Date.now()}`,
      name: c.name,
      avatar: c.avatar,
      role: c.role,
      isMe: false,
      isMuted: false,
      isVideoOff: false,
      status: "ringing",
      connectionQuality: "excellent",
    }));

    setParticipants((prev) => [...prev, ...created]);
    toast.success(`Calling ${toAdd.length} participants...`);
    setSelectedBatchUsers([]);
    setIsAddPeopleOpen(false);

    setTimeout(() => {
      setParticipants((prev) =>
        prev.map((p) => (p.status === "ringing" ? { ...p, status: "connected" } : p)),
      );
      toast.success(`${toAdd.length} participants joined the call!`);
    }, 2200);
  };

  // Toggle raise hand
  const handleToggleRaiseHand = () => {
    setHasRaisedHand((prev) => {
      const next = !prev;
      if (next) {
        toast.info("✋ You raised your hand");
        handleSendReaction("✋");
      } else {
        toast.info("Hand lowered");
      }
      return next;
    });
  };

  // Toggle recording
  const handleToggleRecording = () => {
    setIsRecording((prev) => {
      const next = !prev;
      if (next) {
        toast.success("● Cloud recording started in 1080p");
      } else {
        toast.info("Recording saved to project deliverables");
      }
      return next;
    });
  };

  // In-call chat send
  const handleSendChat = () => {
    if (!chatInput.trim()) return;
    const newMsg: InCallChatMessage = {
      id: `chat-${Date.now()}`,
      senderName: "You",
      senderAvatar:
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&auto=format&fit=crop&q=80",
      text: chatInput.trim(),
      time: "Just now",
      isMe: true,
    };
    setInCallChat((prev) => [...prev, newMsg]);
    setChatInput("");
  };

  // Add action item
  const handleAddActionItem = () => {
    if (!newActionText.trim()) return;
    setActionItems((prev) => [
      ...prev,
      { id: `act-${Date.now()}`, text: newActionText.trim(), done: false },
    ]);
    setNewActionText("");
    toast.success("Action item added to meeting notes");
  };

  // Copy meeting link
  const handleCopyMeetingLink = () => {
    navigator.clipboard?.writeText("https://looped.app/meet/sync-design-482");
    toast.success("Meeting link copied to clipboard!");
  };

  // Filtered contacts in Add People dialog
  const filteredContacts = DIRECT_COLLEAGUES.filter((c) => {
    if (addCategoryFilter === "clients" && !c.isClient) return false;
    if (addCategoryFilter === "direct" && c.isClient) return false;
    if (addSearchQuery.trim()) {
      const q = addSearchQuery.toLowerCase();
      return (
        c.name.toLowerCase().includes(q) ||
        c.role.toLowerCase().includes(q) ||
        c.department.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const filteredTeams = AVAILABLE_TEAMS.filter((t) => {
    if (addCategoryFilter === "direct" || addCategoryFilter === "clients") return false;
    if (addSearchQuery.trim()) {
      const q = addSearchQuery.toLowerCase();
      return t.name.toLowerCase().includes(q) || t.badge.toLowerCase().includes(q);
    }
    return true;
  });

  // Spotlight participant (default to first non-me or pinned)
  const spotlightParticipant =
    participants.find((p) => p.id === pinnedParticipantId) ||
    participants.find((p) => !p.isMe) ||
    participants[0] ||
    ({
      id: thread.id,
      name: thread.name,
      avatar: thread.avatar,
      role: "Participant",
      isMe: false,
      isMuted: false,
      isVideoOff: false,
      status: "connected" as const,
    } as CallParticipant);

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 overflow-hidden">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/90 backdrop-blur-md"
        />

        {/* Main Video Call Window Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 12 }}
          transition={{ duration: 0.2 }}
          className={`relative w-full ${
            isFullscreen ? "h-screen rounded-none max-w-full" : "max-w-7xl h-[92vh] rounded-[32px]"
          } bg-[#0D0E12] text-white shadow-2xl z-10 flex flex-col overflow-hidden border border-white/10`}
        >
          {/* ================= TOP CONTROLS BAR ================= */}
          <div className="px-4 py-3 sm:px-6 sm:py-3.5 flex items-center justify-between border-b border-white/10 bg-black/50 backdrop-blur-md shrink-0 z-20">
            {/* Left: Meeting Identity & Participant count */}
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center font-bold text-sm shadow-xs shrink-0">
                {thread.name.charAt(0)}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm sm:text-base font-bold text-white truncate">
                    {thread.name}
                  </h3>
                  {thread.isClient && (
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30 shrink-0">
                      Client Huddle
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 text-xs text-neutral-400 mt-0.5">
                  <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span>{formatTimer(seconds)}</span>
                  </span>
                  <span>•</span>
                  <span>
                    {connectedCount} {connectedCount === 1 ? "Participant" : "Participants"}
                  </span>
                  {isRecording && (
                    <>
                      <span>•</span>
                      <span className="flex items-center gap-1 text-rose-400 font-bold bg-rose-500/20 px-2 py-0.5 rounded-full text-[10px] animate-pulse">
                        <Disc className="w-3 h-3 text-rose-400" />
                        <span>REC</span>
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Center: Layout View Mode Switcher */}
            <div className="hidden md:flex items-center gap-1 p-1 rounded-xl bg-white/5 border border-white/10">
              <button
                type="button"
                onClick={() => {
                  setLayoutMode("auto");
                  setPinnedParticipantId(null);
                }}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                  layoutMode === "auto"
                    ? "bg-white/20 text-white shadow-xs"
                    : "text-neutral-400 hover:text-white"
                }`}
                title="Adaptive layout based on callers"
              >
                <span>Adaptive</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setLayoutMode("grid");
                  setPinnedParticipantId(null);
                }}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                  layoutMode === "grid"
                    ? "bg-white/20 text-white shadow-xs"
                    : "text-neutral-400 hover:text-white"
                }`}
                title="Multi-person gallery grid"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>Gallery</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setLayoutMode("spotlight");
                  if (!pinnedParticipantId && participants.length > 1) {
                    const nonMe = participants.find((p) => !p.isMe);
                    if (nonMe) setPinnedParticipantId(nonMe.id);
                  }
                }}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                  layoutMode === "spotlight"
                    ? "bg-white/20 text-white shadow-xs"
                    : "text-neutral-400 hover:text-white"
                }`}
                title="Spotlight active speaker"
              >
                <Monitor className="w-3.5 h-3.5" />
                <span>Spotlight</span>
              </button>
            </div>

            {/* Right: + Add People (Hierarchy CTA), Quality Badge, Fullscreen */}
            <div className="flex items-center gap-2 shrink-0">
              {/* PRIMARY HIERARCHY CTA: + Add to Video Call */}
              <button
                type="button"
                onClick={() => setIsAddPeopleOpen(true)}
                className="px-3 sm:px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-md active:scale-95"
                title="Add single, multiple people, or entire team"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Add People</span>
              </button>

              <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-white/5 border border-white/10 text-[11px] text-neutral-300">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span>1080p HD</span>
              </div>

              <button
                type="button"
                onClick={() => setIsFullscreen(!isFullscreen)}
                className="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 grid place-items-center text-neutral-300 hover:text-white transition-colors cursor-pointer"
                title={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
              >
                {isFullscreen ? (
                  <Minimize2 className="w-3.5 h-3.5" />
                ) : (
                  <Maximize2 className="w-3.5 h-3.5" />
                )}
              </button>
            </div>
          </div>

          {/* ================= MAIN VIDEO CANVAS & PANELS AREA ================= */}
          <div className="flex-1 flex overflow-hidden relative">
            {/* Left/Center: Video Feeds Container */}
            <div className="flex-1 p-3 sm:p-5 flex flex-col justify-center relative overflow-hidden bg-[#0A0B0E]">
              {/* Floating Live Reactions Container */}
              <div className="absolute inset-x-0 bottom-24 pointer-events-none z-30 overflow-hidden h-72">
                {floatingReactions.map((r) => (
                  <motion.div
                    key={r.id}
                    initial={{ opacity: 0, y: 180, scale: 0.6 }}
                    animate={{ opacity: [0, 1, 1, 0], y: -40, scale: 1.2 }}
                    transition={{ duration: 2.6, ease: "easeOut" }}
                    style={{ left: `${r.left}%` }}
                    className="absolute text-4xl select-none drop-shadow-lg"
                  >
                    {r.emoji}
                  </motion.div>
                ))}
              </div>

              {/* SCREEN SHARING VIEW (If Screen Sharing is active) */}
              {isScreenSharing ? (
                <div className="w-full h-full flex flex-col gap-3">
                  <div className="flex-1 rounded-2xl bg-neutral-900 border border-blue-500/40 relative overflow-hidden flex flex-col shadow-xl">
                    <div className="p-2.5 px-4 bg-blue-950/80 border-b border-blue-500/30 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2 text-blue-200 font-semibold">
                        <Share2 className="w-4 h-4 text-blue-400" />
                        <span>You are sharing your screen: "Looped UI Master Systems.fig"</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setIsScreenSharing(false)}
                        className="px-2.5 py-1 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-all cursor-pointer"
                      >
                        Stop Sharing
                      </button>
                    </div>
                    {/* Simulated Screen Content */}
                    <div className="flex-1 bg-[#18191E] p-6 flex flex-col items-center justify-center text-center">
                      <div className="w-20 h-20 rounded-2xl bg-blue-600/20 border border-blue-500/40 grid place-items-center text-blue-400 mb-3 shadow-inner">
                        <Monitor className="w-10 h-10" />
                      </div>
                      <h4 className="text-base font-bold text-white">
                        Live Presentation Broadcast
                      </h4>
                      <p className="text-xs text-neutral-400 max-w-md mt-1">
                        All {connectedCount} participants are viewing your shared workspace in real
                        time at 60fps.
                      </p>
                    </div>
                  </div>

                  {/* Docked Participants Filmstrip */}
                  <div className="h-28 flex items-center gap-3 overflow-x-auto pb-1 shrink-0">
                    {participants.map((p) => (
                      <div
                        key={p.id}
                        className="h-full w-40 rounded-xl bg-neutral-900 border border-white/10 relative overflow-hidden shrink-0 flex items-center justify-center"
                      >
                        {p.isVideoOff ? (
                          <div className="w-10 h-10 rounded-full bg-blue-600/30 text-blue-300 font-bold grid place-items-center text-xs">
                            {p.name.charAt(0)}
                          </div>
                        ) : (
                          <img
                            src={p.avatar}
                            alt={p.name}
                            className="w-full h-full object-cover filter brightness-90"
                          />
                        )}
                        <span className="absolute bottom-1 left-2 text-[10px] font-semibold text-white truncate max-w-[120px] bg-black/60 px-1.5 py-0.5 rounded">
                          {p.name}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : effectiveLayout === "1-on-1" ? (
                /* ================= 1-ON-1 MODE (Two People Call) ================= */
                <div className="w-full h-full relative rounded-2xl bg-neutral-950 border border-white/10 overflow-hidden shadow-2xl flex items-center justify-center">
                  {/* Remote Person Primary Tile (Dominant Video Feed) */}
                  {(() => {
                    const remoteParticipant =
                      participants.find((p) => !p.isMe) ||
                      participants[0] ||
                      ({
                        id: thread.id,
                        name: thread.name,
                        avatar: thread.avatar,
                        role: thread.isClient ? "Client Stakeholder" : "Colleague",
                        isMe: false,
                        isMuted: false,
                        isVideoOff: false,
                        isSpeaking: false,
                        status: "connected" as const,
                      } as CallParticipant);

                    return (
                      <div className="relative w-full h-full flex items-center justify-center bg-radial from-neutral-900 to-black">
                        {remoteParticipant?.isVideoOff ? (
                          <div className="flex flex-col items-center gap-4">
                            <div className="w-28 h-28 rounded-full bg-blue-600/30 text-blue-300 grid place-items-center text-4xl font-bold border-2 border-blue-500/40 shadow-xl">
                              {remoteParticipant?.name?.charAt(0) || "U"}
                            </div>
                            <span className="text-base font-bold text-white">
                              {remoteParticipant?.name}
                            </span>
                            <span className="text-xs text-neutral-400">Camera is turned off</span>
                          </div>
                        ) : remoteParticipant?.avatar ? (
                          <img
                            src={remoteParticipant.avatar}
                            alt={remoteParticipant.name}
                            className="w-full h-full object-cover filter brightness-95"
                          />
                        ) : (
                          <div className="w-24 h-24 rounded-full bg-blue-600/30 text-blue-300 grid place-items-center text-3xl font-bold">
                            {remoteParticipant?.name?.charAt(0) || "U"}
                          </div>
                        )}

                        {/* Remote Participant Bottom Banner Info */}
                        <div className="absolute bottom-4 left-4 p-2 px-3 rounded-xl bg-black/70 backdrop-blur-md border border-white/10 flex items-center gap-2.5 shadow-lg">
                          <span
                            className={`w-2.5 h-2.5 rounded-full ${
                              remoteParticipant?.isSpeaking
                                ? "bg-emerald-400 animate-ping"
                                : "bg-emerald-500"
                            }`}
                          />
                          <span className="text-xs font-bold text-white">
                            {remoteParticipant?.name}
                          </span>
                          <span className="text-[10px] text-neutral-400 border-l border-white/20 pl-2">
                            {remoteParticipant?.role}
                          </span>
                        </div>

                        {/* Self-View Floating Picture-in-Picture (PiP) Tile */}
                        <motion.div
                          drag
                          dragConstraints={{ left: -100, right: 100, top: -100, bottom: 100 }}
                          className="absolute top-4 right-4 w-44 sm:w-56 h-32 sm:h-40 rounded-2xl bg-neutral-900 border-2 border-white/20 shadow-2xl overflow-hidden cursor-move z-20 group"
                        >
                          {isVideoOff ? (
                            <div className="w-full h-full flex flex-col items-center justify-center gap-2 bg-neutral-900 text-neutral-400">
                              <VideoOff className="w-6 h-6" />
                              <span className="text-[11px] font-medium">Your camera off</span>
                            </div>
                          ) : (
                            <img
                              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&auto=format&fit=crop&q=80"
                              alt="You"
                              className={`w-full h-full object-cover filter brightness-95 ${
                                isMirrorVideoOn ? "-scale-x-100" : ""
                              }`}
                            />
                          )}

                          <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded-md bg-black/70 text-[10px] font-bold text-white flex items-center gap-1">
                            {isMicMuted && <MicOff className="w-3 h-3 text-rose-400" />}
                            <span>You</span>
                          </div>
                        </motion.div>
                      </div>
                    );
                  })()}
                </div>
              ) : effectiveLayout === "multi-grid" ? (
                /* ================= MULTIPLE PEOPLE MODE (3-4 Participants) ================= */
                <div className="w-full h-full grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 overflow-hidden">
                  {participants.slice(0, 4).map((p) => {
                    const isSpeaking = p.isMe ? !isMicMuted && audioLevel > 40 : p.isSpeaking;
                    return (
                      <div
                        key={p.id}
                        className={`relative rounded-2xl bg-neutral-900 overflow-hidden flex items-center justify-center transition-all ${
                          isSpeaking
                            ? "ring-2 ring-emerald-500 shadow-emerald-950/40 shadow-xl"
                            : "border border-white/10"
                        }`}
                      >
                        {p.isVideoOff ? (
                          <div className="flex flex-col items-center gap-2">
                            <div className="w-16 h-16 rounded-full bg-blue-600/30 text-blue-300 font-bold grid place-items-center text-xl">
                              {p.name.charAt(0)}
                            </div>
                            <span className="text-xs font-semibold text-neutral-300">{p.name}</span>
                          </div>
                        ) : p.avatar ? (
                          <img
                            src={p.avatar}
                            alt={p.name}
                            className={`w-full h-full object-cover filter brightness-95 ${
                              p.isMe && isMirrorVideoOn ? "-scale-x-100" : ""
                            }`}
                          />
                        ) : (
                          <div className="w-14 h-14 rounded-full bg-blue-600 text-white font-bold grid place-items-center text-lg">
                            {p.name.charAt(0)}
                          </div>
                        )}

                        {/* Hand raised indicator */}
                        {p.hasRaisedHand && (
                          <div className="absolute top-3 left-3 px-2 py-1 rounded-lg bg-amber-500 text-black text-xs font-bold flex items-center gap-1 shadow-md">
                            <Hand className="w-3.5 h-3.5" />
                            <span>Raised Hand</span>
                          </div>
                        )}

                        {/* Participant info bottom bar */}
                        <div className="absolute bottom-3 left-3 px-2.5 py-1 rounded-lg bg-black/70 backdrop-blur-xs text-xs font-medium text-white flex items-center gap-1.5 shadow-md">
                          {p.isMuted ? (
                            <MicOff className="w-3 h-3 text-rose-400" />
                          ) : (
                            <span
                              className={`w-2 h-2 rounded-full ${
                                isSpeaking ? "bg-emerald-400 animate-ping" : "bg-emerald-500"
                              }`}
                            />
                          )}
                          <span className="truncate max-w-[140px] font-semibold">{p.name}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : effectiveLayout === "spotlight" ? (
                /* ================= SPOTLIGHT ACTIVE SPEAKER MODE ================= */
                <div className="w-full h-full flex flex-col gap-3">
                  {/* Big Main Stage Spotlight */}
                  <div className="flex-1 rounded-2xl bg-neutral-950 border border-white/10 relative overflow-hidden flex items-center justify-center">
                    {spotlightParticipant?.isVideoOff ? (
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-24 h-24 rounded-full bg-blue-600/30 text-blue-300 font-bold grid place-items-center text-3xl">
                          {spotlightParticipant.name.charAt(0)}
                        </div>
                        <span className="text-base font-bold text-white">
                          {spotlightParticipant.name}
                        </span>
                      </div>
                    ) : spotlightParticipant?.avatar ? (
                      <img
                        src={spotlightParticipant.avatar}
                        alt={spotlightParticipant.name}
                        className="w-full h-full object-cover filter brightness-95"
                      />
                    ) : (
                      <div className="w-20 h-20 rounded-full bg-blue-600 text-white font-bold grid place-items-center text-2xl">
                        {spotlightParticipant?.name.charAt(0)}
                      </div>
                    )}

                    <div className="absolute bottom-4 left-4 p-2 px-3 rounded-xl bg-black/70 backdrop-blur-md border border-white/10 flex items-center gap-2 text-xs font-bold text-white">
                      <span className="w-2 h-2 rounded-full bg-emerald-400" />
                      <span>{spotlightParticipant?.name} (Spotlight)</span>
                    </div>
                  </div>

                  {/* Carousel filmstrip */}
                  <div className="h-28 flex items-center gap-3 overflow-x-auto pb-1 shrink-0">
                    {participants.map((p) => (
                      <div
                        key={p.id}
                        onClick={() => setPinnedParticipantId(p.id)}
                        className={`h-full w-36 rounded-xl bg-neutral-900 relative overflow-hidden shrink-0 flex items-center justify-center cursor-pointer transition-all ${
                          spotlightParticipant?.id === p.id
                            ? "ring-2 ring-blue-500"
                            : "border border-white/10 hover:border-white/30"
                        }`}
                      >
                        {p.isVideoOff ? (
                          <div className="w-9 h-9 rounded-full bg-blue-600/30 text-blue-300 font-bold grid place-items-center text-xs">
                            {p.name.charAt(0)}
                          </div>
                        ) : (
                          <img
                            src={p.avatar}
                            alt={p.name}
                            className="w-full h-full object-cover filter brightness-90"
                          />
                        )}
                        <span className="absolute bottom-1 left-2 text-[10px] font-semibold text-white truncate max-w-[110px] bg-black/60 px-1.5 py-0.5 rounded">
                          {p.name}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                /* ================= GROUP GALLERY MODE (5+ Participants) ================= */
                <div className="w-full h-full grid grid-cols-2 md:grid-cols-3 gap-3 overflow-y-auto p-1">
                  {participants.map((p) => {
                    const isSpeaking = p.isMe ? !isMicMuted && audioLevel > 40 : p.isSpeaking;
                    return (
                      <div
                        key={p.id}
                        className={`relative rounded-2xl bg-neutral-900 min-h-[160px] overflow-hidden flex items-center justify-center transition-all ${
                          isSpeaking
                            ? "ring-2 ring-emerald-500 shadow-md"
                            : "border border-white/10"
                        }`}
                      >
                        {p.status === "ringing" ? (
                          <div className="flex flex-col items-center gap-2 p-4 text-center">
                            <div className="w-12 h-12 rounded-full bg-amber-500/20 text-amber-300 grid place-items-center font-bold text-sm animate-pulse border border-amber-500/40">
                              {p.name.charAt(0)}
                            </div>
                            <span className="text-xs font-bold text-white">{p.name}</span>
                            <span className="text-[10px] text-amber-400 font-semibold bg-amber-500/10 px-2 py-0.5 rounded-full">
                              Ringing...
                            </span>
                          </div>
                        ) : p.isVideoOff ? (
                          <div className="flex flex-col items-center gap-2">
                            <div className="w-14 h-14 rounded-full bg-blue-600/30 text-blue-300 font-bold grid place-items-center text-lg">
                              {p.name.charAt(0)}
                            </div>
                            <span className="text-xs font-semibold text-neutral-300">{p.name}</span>
                          </div>
                        ) : p.avatar ? (
                          <img
                            src={p.avatar}
                            alt={p.name}
                            className={`w-full h-full object-cover filter brightness-95 ${
                              p.isMe && isMirrorVideoOn ? "-scale-x-100" : ""
                            }`}
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-full bg-blue-600 text-white font-bold grid place-items-center text-sm">
                            {p.name.charAt(0)}
                          </div>
                        )}

                        <div className="absolute bottom-2.5 left-2.5 px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-xs text-[11px] font-medium text-white flex items-center gap-1.5">
                          {p.isMuted ? (
                            <MicOff className="w-3 h-3 text-rose-400" />
                          ) : (
                            <span
                              className={`w-2 h-2 rounded-full ${
                                isSpeaking ? "bg-emerald-400 animate-ping" : "bg-emerald-500"
                              }`}
                            />
                          )}
                          <span className="truncate max-w-[120px] font-semibold">{p.name}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Right Collapsible Panel (People, Notes, Chat, Settings) */}
            <AnimatePresence>
              {activeSidePanel !== "none" && (
                <motion.div
                  initial={{ width: 0, opacity: 0 }}
                  animate={{ width: 340, opacity: 1 }}
                  exit={{ width: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="h-full bg-[#131418] border-l border-white/10 flex flex-col shrink-0 overflow-hidden z-20"
                >
                  {/* Panel Top Header */}
                  <div className="p-4 border-b border-white/10 flex items-center justify-between bg-black/30">
                    <div className="flex items-center gap-2">
                      {activeSidePanel === "people" && (
                        <>
                          <Users className="w-4 h-4 text-blue-400" />
                          <h4 className="text-sm font-bold text-white">
                            Participants ({participants.length})
                          </h4>
                        </>
                      )}
                      {activeSidePanel === "notes" && (
                        <>
                          <FileText className="w-4 h-4 text-emerald-400" />
                          <h4 className="text-sm font-bold text-white">Meeting Notes</h4>
                        </>
                      )}
                      {activeSidePanel === "chat" && (
                        <>
                          <MessageSquare className="w-4 h-4 text-purple-400" />
                          <h4 className="text-sm font-bold text-white">In-Call Messages</h4>
                        </>
                      )}
                      {activeSidePanel === "settings" && (
                        <>
                          <Settings className="w-4 h-4 text-neutral-400" />
                          <h4 className="text-sm font-bold text-white">Call Settings</h4>
                        </>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => setActiveSidePanel("none")}
                      className="w-7 h-7 rounded-lg hover:bg-white/10 grid place-items-center text-neutral-400 hover:text-white transition-colors cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Panel Content Body */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {/* --- TAB 1: PARTICIPANTS --- */}
                    {activeSidePanel === "people" && (
                      <div className="space-y-3">
                        <button
                          type="button"
                          onClick={() => setIsAddPeopleOpen(true)}
                          className="w-full py-2.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs"
                        >
                          <Plus className="w-4 h-4" />
                          <span>Add More People / Teams</span>
                        </button>

                        <div className="space-y-2 pt-2">
                          {participants.map((p) => (
                            <div
                              key={p.id}
                              className="p-2.5 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between gap-3"
                            >
                              <div className="flex items-center gap-2.5 min-w-0">
                                <div className="w-8 h-8 rounded-full bg-blue-600/30 overflow-hidden shrink-0 grid place-items-center text-xs font-bold">
                                  {p.avatar ? (
                                    <img
                                      src={p.avatar}
                                      alt={p.name}
                                      className="w-full h-full object-cover"
                                    />
                                  ) : (
                                    p.name.charAt(0)
                                  )}
                                </div>
                                <div className="min-w-0">
                                  <p className="text-xs font-bold text-white truncate flex items-center gap-1.5">
                                    <span>{p.name}</span>
                                    {p.isMe && (
                                      <span className="text-[10px] text-blue-400 font-semibold">
                                        (You)
                                      </span>
                                    )}
                                  </p>
                                  <p className="text-[10px] text-neutral-400 truncate">{p.role}</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-1 shrink-0">
                                {p.isMuted ? (
                                  <MicOff className="w-3.5 h-3.5 text-rose-400" />
                                ) : (
                                  <Mic className="w-3.5 h-3.5 text-emerald-400" />
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* --- TAB 2: MEETING NOTES & SCRATCHPAD --- */}
                    {activeSidePanel === "notes" && (
                      <div className="space-y-4">
                        <div>
                          <div className="flex items-center justify-between mb-1.5">
                            <label className="text-xs font-bold text-neutral-300">
                              Live Agenda
                            </label>
                            <button
                              type="button"
                              onClick={() => {
                                toast.success("AI Summary generated and added to notes");
                                setMeetingNotes((prev) => prev + "\n- ✨ AI: Action items synced.");
                              }}
                              className="text-[11px] text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer"
                            >
                              <Sparkles className="w-3 h-3" />
                              <span>AI Catch-up</span>
                            </button>
                          </div>
                          <textarea
                            value={meetingNotes}
                            onChange={(e) => setMeetingNotes(e.target.value)}
                            rows={7}
                            className="w-full p-2.5 rounded-xl bg-black/40 border border-white/10 text-xs text-neutral-200 placeholder:text-neutral-500 focus:outline-none focus:border-white/30 resize-none font-mono"
                          />
                        </div>

                        {/* Action items checklist */}
                        <div>
                          <label className="text-xs font-bold text-neutral-300 block mb-2">
                            Action Items ({actionItems.filter((a) => a.done).length}/
                            {actionItems.length})
                          </label>
                          <div className="space-y-1.5">
                            {actionItems.map((item) => (
                              <div
                                key={item.id}
                                onClick={() =>
                                  setActionItems((prev) =>
                                    prev.map((a) =>
                                      a.id === item.id ? { ...a, done: !a.done } : a,
                                    ),
                                  )
                                }
                                className="flex items-start gap-2 p-2 rounded-lg bg-white/5 border border-white/5 cursor-pointer text-xs"
                              >
                                <input
                                  type="checkbox"
                                  checked={item.done}
                                  onChange={() => {}}
                                  className="mt-0.5 rounded accent-emerald-500"
                                />
                                <span
                                  className={`flex-1 ${
                                    item.done ? "line-through text-neutral-500" : "text-neutral-200"
                                  }`}
                                >
                                  {item.text}
                                </span>
                              </div>
                            ))}
                          </div>

                          {/* Add item input */}
                          <div className="flex gap-2 mt-2">
                            <input
                              type="text"
                              value={newActionText}
                              onChange={(e) => setNewActionText(e.target.value)}
                              onKeyDown={(e) => e.key === "Enter" && handleAddActionItem()}
                              placeholder="New action item..."
                              className="flex-1 px-3 py-1.5 rounded-xl bg-black/40 border border-white/10 text-xs text-white placeholder:text-neutral-500 focus:outline-none"
                            />
                            <button
                              type="button"
                              onClick={handleAddActionItem}
                              className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold transition-all cursor-pointer"
                            >
                              Add
                            </button>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard?.writeText(meetingNotes);
                            toast.success("Meeting notes copied to clipboard!");
                          }}
                          className="w-full py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 text-neutral-200"
                        >
                          <Copy className="w-3.5 h-3.5" />
                          <span>Export Notes to Clipboard</span>
                        </button>
                      </div>
                    )}

                    {/* --- TAB 3: IN-CALL CHAT --- */}
                    {activeSidePanel === "chat" && (
                      <div className="h-full flex flex-col justify-between -m-4 p-4">
                        <div className="flex-1 space-y-3 overflow-y-auto mb-3">
                          {inCallChat.map((msg) => (
                            <div
                              key={msg.id}
                              className={`p-2.5 rounded-xl text-xs space-y-1 ${
                                msg.isMe
                                  ? "bg-blue-600/30 border border-blue-500/30 ml-4"
                                  : "bg-white/5 border border-white/5 mr-4"
                              }`}
                            >
                              <div className="flex items-center justify-between text-[10px] text-neutral-400">
                                <span className="font-bold text-neutral-200">{msg.senderName}</span>
                                <span>{msg.time}</span>
                              </div>
                              <p className="text-neutral-100 whitespace-pre-wrap">{msg.text}</p>
                            </div>
                          ))}
                        </div>

                        <div className="flex gap-2 pt-2 border-t border-white/10">
                          <input
                            type="text"
                            value={chatInput}
                            onChange={(e) => setChatInput(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleSendChat()}
                            placeholder="Message everyone in call..."
                            className="flex-1 px-3 py-2 rounded-xl bg-black/50 border border-white/10 text-xs text-white placeholder:text-neutral-500 focus:outline-none focus:border-white/30"
                          />
                          <button
                            type="button"
                            onClick={handleSendChat}
                            className="p-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white grid place-items-center transition-all cursor-pointer"
                          >
                            <Send className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    )}

                    {/* --- TAB 4: SETTINGS --- */}
                    {activeSidePanel === "settings" && (
                      <div className="space-y-4 text-xs">
                        {/* Audio Devices */}
                        <div className="space-y-2">
                          <label className="font-bold text-neutral-200 flex items-center gap-1.5">
                            <Mic className="w-3.5 h-3.5 text-blue-400" />
                            <span>Microphone</span>
                          </label>
                          <select
                            value={audioInputDevice}
                            onChange={(e) => setAudioInputDevice(e.target.value)}
                            className="w-full p-2 rounded-xl bg-black/40 border border-white/10 text-neutral-200 text-xs focus:outline-none"
                          >
                            <option>MacBook Pro Microphone (Built-in)</option>
                            <option>AirPods Pro (Bluetooth)</option>
                            <option>External USB Condenser Mic</option>
                          </select>

                          {/* Mic test audio level */}
                          <div className="flex items-center gap-2 pt-1">
                            <span className="text-[10px] text-neutral-400">Input:</span>
                            <div className="flex-1 h-1.5 rounded-full bg-white/10 overflow-hidden">
                              <div
                                style={{ width: `${isMicMuted ? 0 : audioLevel}%` }}
                                className="h-full bg-emerald-400 transition-all duration-300"
                              />
                            </div>
                          </div>
                        </div>

                        {/* Video Camera Device */}
                        <div className="space-y-2 pt-2 border-t border-white/10">
                          <label className="font-bold text-neutral-200 flex items-center gap-1.5">
                            <Video className="w-3.5 h-3.5 text-blue-400" />
                            <span>Camera Source</span>
                          </label>
                          <select
                            value={videoDevice}
                            onChange={(e) => setVideoDevice(e.target.value)}
                            className="w-full p-2 rounded-xl bg-black/40 border border-white/10 text-neutral-200 text-xs focus:outline-none"
                          >
                            <option>FaceTime HD Camera (1080p)</option>
                            <option>External 4K Studio Cam</option>
                            <option>Continuity Camera (iPhone 15 Pro)</option>
                          </select>
                        </div>

                        {/* Feature Toggles */}
                        <div className="space-y-2.5 pt-2 border-t border-white/10">
                          <div className="flex items-center justify-between">
                            <span>AI Noise Suppression</span>
                            <input
                              type="checkbox"
                              checked={isNoiseCancellationOn}
                              onChange={(e) => setIsNoiseCancellationOn(e.target.checked)}
                              className="rounded accent-blue-600"
                            />
                          </div>
                          <div className="flex items-center justify-between">
                            <span>Virtual Background Blur</span>
                            <input
                              type="checkbox"
                              checked={isBackgroundBlurOn}
                              onChange={(e) => setIsBackgroundBlurOn(e.target.checked)}
                              className="rounded accent-blue-600"
                            />
                          </div>
                          <div className="flex items-center justify-between">
                            <span>Mirror Local Video</span>
                            <input
                              type="checkbox"
                              checked={isMirrorVideoOn}
                              onChange={(e) => setIsMirrorVideoOn(e.target.checked)}
                              className="rounded accent-blue-600"
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* ================= FLOATING CALL CONTROLS TOOLBAR ================= */}
          <div className="p-3 sm:p-4 bg-black/70 border-t border-white/10 flex items-center justify-between gap-2 shrink-0 z-20 backdrop-blur-md">
            {/* Left Quick Features: Add People, Meeting Link */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsAddPeopleOpen(true)}
                className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-semibold text-white transition-all cursor-pointer"
                title="Invite contacts, clients or entire group"
              >
                <UserPlus className="w-4 h-4 text-blue-400" />
                <span>+ Add</span>
              </button>

              <button
                type="button"
                onClick={handleCopyMeetingLink}
                className="p-2 sm:px-3 sm:py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-semibold text-neutral-300 hover:text-white transition-all cursor-pointer flex items-center gap-1.5"
                title="Copy meeting link"
              >
                <Copy className="w-4 h-4" />
                <span className="hidden md:inline">Share Link</span>
              </button>
            </div>

            {/* Center: Main Primary Video & Call Controls */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Mic Toggle */}
              <button
                type="button"
                onClick={() => setIsMicMuted(!isMicMuted)}
                className={`w-11 h-11 sm:w-12 sm:h-12 rounded-2xl grid place-items-center transition-all cursor-pointer shadow-md active:scale-95 ${
                  isMicMuted ? "bg-rose-600 text-white" : "bg-white/15 hover:bg-white/25 text-white"
                }`}
                title={isMicMuted ? "Unmute Microphone (Spacebar)" : "Mute Microphone (Spacebar)"}
              >
                {isMicMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </button>

              {/* Video Camera Toggle */}
              <button
                type="button"
                onClick={() => setIsVideoOff(!isVideoOff)}
                className={`w-11 h-11 sm:w-12 sm:h-12 rounded-2xl grid place-items-center transition-all cursor-pointer shadow-md active:scale-95 ${
                  isVideoOff ? "bg-rose-600 text-white" : "bg-white/15 hover:bg-white/25 text-white"
                }`}
                title={isVideoOff ? "Turn Video On" : "Turn Video Off"}
              >
                {isVideoOff ? <VideoOff className="w-5 h-5" /> : <Video className="w-5 h-5" />}
              </button>

              {/* Screen Share Toggle */}
              <button
                type="button"
                onClick={() => setIsScreenSharing(!isScreenSharing)}
                className={`w-11 h-11 sm:w-12 sm:h-12 rounded-2xl grid place-items-center transition-all cursor-pointer shadow-md active:scale-95 ${
                  isScreenSharing
                    ? "bg-blue-600 text-white"
                    : "bg-white/15 hover:bg-white/25 text-white"
                }`}
                title={isScreenSharing ? "Stop Screen Sharing" : "Share Your Screen"}
              >
                <Share2 className="w-5 h-5" />
              </button>

              {/* Raise Hand Toggle */}
              <button
                type="button"
                onClick={handleToggleRaiseHand}
                className={`w-11 h-11 sm:w-12 sm:h-12 rounded-2xl grid place-items-center transition-all cursor-pointer shadow-md active:scale-95 ${
                  hasRaisedHand
                    ? "bg-amber-500 text-black"
                    : "bg-white/15 hover:bg-white/25 text-white"
                }`}
                title={hasRaisedHand ? "Lower Hand" : "Raise Hand"}
              >
                <Hand className="w-5 h-5" />
              </button>

              {/* Reaction Emojis Picker Popover */}
              <div className="relative group">
                <button
                  type="button"
                  className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-white/15 hover:bg-white/25 text-white grid place-items-center transition-all cursor-pointer shadow-md"
                  title="Send reaction"
                >
                  <Smile className="w-5 h-5" />
                </button>
                <div className="absolute bottom-14 left-1/2 -translate-x-1/2 p-2 rounded-2xl bg-black/90 border border-white/20 shadow-2xl flex items-center gap-1.5 opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-all z-30">
                  {["👍", "❤️", "👏", "🎉", "🔥", "💡", "😂"].map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => handleSendReaction(emoji)}
                      className="w-8 h-8 rounded-xl hover:bg-white/20 text-lg grid place-items-center transition-transform hover:scale-125 cursor-pointer"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>

              {/* End Video Call Button */}
              <button
                type="button"
                onClick={onClose}
                className="h-11 sm:h-12 px-5 sm:px-6 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center gap-2 transition-all cursor-pointer shadow-lg active:scale-95 ml-1 sm:ml-2"
                title="Leave & End Video Call"
              >
                <PhoneOff className="w-5 h-5" />
                <span className="hidden sm:inline">End Call</span>
              </button>
            </div>

            {/* Right: Toggle Panels (Participants, Notes, Chat, Settings) */}
            <div className="flex items-center gap-1.5 sm:gap-2">
              <button
                type="button"
                onClick={() => setActiveSidePanel(activeSidePanel === "people" ? "none" : "people")}
                className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl grid place-items-center transition-all cursor-pointer ${
                  activeSidePanel === "people"
                    ? "bg-blue-600 text-white"
                    : "bg-white/10 hover:bg-white/20 text-neutral-300"
                }`}
                title="View Participants"
              >
                <Users className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => setActiveSidePanel(activeSidePanel === "notes" ? "none" : "notes")}
                className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl grid place-items-center transition-all cursor-pointer ${
                  activeSidePanel === "notes"
                    ? "bg-emerald-600 text-white"
                    : "bg-white/10 hover:bg-white/20 text-neutral-300"
                }`}
                title="Meeting Notes & Action Items"
              >
                <FileText className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => setActiveSidePanel(activeSidePanel === "chat" ? "none" : "chat")}
                className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl grid place-items-center transition-all cursor-pointer ${
                  activeSidePanel === "chat"
                    ? "bg-purple-600 text-white"
                    : "bg-white/10 hover:bg-white/20 text-neutral-300"
                }`}
                title="In-call Discussion"
              >
                <MessageSquare className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() =>
                  setActiveSidePanel(activeSidePanel === "settings" ? "none" : "settings")
                }
                className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl grid place-items-center transition-all cursor-pointer ${
                  activeSidePanel === "settings"
                    ? "bg-white/30 text-white"
                    : "bg-white/10 hover:bg-white/20 text-neutral-300"
                }`}
                title="Device & Video Settings"
              >
                <Settings className="w-4 h-4" />
              </button>
            </div>
          </div>
        </motion.div>

        {/* ========================================================================= */}
        {/* HIERARCHICAL "ADD PEOPLE / CONNECT FLOW" DIALOG MODAL                     */}
        {/* Connect Single Contact, Multiple Selection, or Entire Group               */}
        {/* ========================================================================= */}
        <AnimatePresence>
          {isAddPeopleOpen && (
            <div className="fixed inset-0 z-60 flex items-center justify-center p-3 sm:p-6">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.75 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsAddPeopleOpen(false)}
                className="fixed inset-0 bg-black/80 backdrop-blur-xs"
              />

              <motion.div
                initial={{ opacity: 0, scale: 0.94, y: 14 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.94, y: 14 }}
                className="relative w-full max-w-xl max-h-[85vh] bg-[#14151B] text-white rounded-3xl border border-white/15 shadow-2xl z-20 flex flex-col overflow-hidden"
              >
                {/* Modal Header */}
                <div className="p-4 sm:p-5 border-b border-white/10 flex items-center justify-between bg-black/40">
                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                      <UserPlus className="w-5 h-5 text-blue-400" />
                      <span>Add to Video Call</span>
                    </h3>
                    <p className="text-xs text-neutral-400 mt-0.5">
                      Connect with single colleagues, select multiple, or ring entire team channels.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsAddPeopleOpen(false)}
                    className="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/10 grid place-items-center text-neutral-400 hover:text-white transition-colors cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Search Bar & Hierarchical Filter Pills */}
                <div className="p-4 border-b border-white/10 space-y-3 bg-[#111216]">
                  <div className="relative">
                    <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={addSearchQuery}
                      onChange={(e) => setAddSearchQuery(e.target.value)}
                      placeholder="Search colleagues, clients, or team departments..."
                      className="w-full h-10 pl-9 pr-4 rounded-xl bg-black/50 border border-white/10 text-xs text-white placeholder:text-neutral-500 focus:outline-none focus:border-blue-500 transition-all"
                    />
                  </div>

                  <div className="flex items-center gap-1.5 flex-wrap">
                    {[
                      { key: "all", label: "All Options" },
                      { key: "teams", label: "Groups & Teams" },
                      { key: "direct", label: "Colleagues" },
                      { key: "clients", label: "Clients" },
                    ].map((tab) => (
                      <button
                        key={tab.key}
                        type="button"
                        onClick={() => setAddCategoryFilter(tab.key as any)}
                        className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                          addCategoryFilter === tab.key
                            ? "bg-blue-600 text-white shadow-xs"
                            : "bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white"
                        }`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Modal Scrollable Content: Hierarchy Levels */}
                <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-6">
                  {/* HIERARCHY LEVEL 1: GROUP & TEAM CHANNELS */}
                  {(addCategoryFilter === "all" || addCategoryFilter === "teams") &&
                    filteredTeams.length > 0 && (
                      <div>
                        <div className="flex items-center justify-between mb-2.5">
                          <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-400 flex items-center gap-1.5">
                            <Users className="w-3.5 h-3.5 text-blue-400" />
                            <span>1-Click Group Channels</span>
                          </h4>
                          <span className="text-[10px] text-neutral-500">Rings entire team</span>
                        </div>

                        <div className="space-y-2">
                          {filteredTeams.map((team) => (
                            <div
                              key={team.id}
                              className="p-3 rounded-2xl bg-white/5 border border-white/10 hover:border-blue-500/30 transition-all flex items-center justify-between gap-3"
                            >
                              <div className="flex items-center gap-3 min-w-0">
                                <div
                                  className={`w-10 h-10 rounded-xl ${team.avatarBg} text-white font-bold grid place-items-center text-sm shadow-xs shrink-0`}
                                >
                                  {team.name.charAt(0)}
                                </div>
                                <div className="min-w-0">
                                  <p className="text-xs font-bold text-white truncate flex items-center gap-2">
                                    <span>{team.name}</span>
                                    <span className="px-1.5 py-0.2 rounded-md bg-white/10 text-[9px] font-semibold text-neutral-300">
                                      {team.badge}
                                    </span>
                                  </p>
                                  <p className="text-[11px] text-neutral-400 mt-0.5">
                                    {team.memberCount} members in channel
                                  </p>
                                </div>
                              </div>

                              <button
                                type="button"
                                onClick={() => handleInviteGroup(team)}
                                className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all cursor-pointer shrink-0 shadow-xs active:scale-95 flex items-center gap-1.5"
                              >
                                <span>Call Group</span>
                                <ChevronRight className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                  {/* HIERARCHY LEVEL 2: INDIVIDUAL CONTACTS & CLIENTS (Single or Multiple Batch) */}
                  {(addCategoryFilter === "all" ||
                    addCategoryFilter === "direct" ||
                    addCategoryFilter === "clients") && (
                    <div>
                      <div className="flex items-center justify-between mb-2.5">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                          Individual Contacts & Clients
                        </h4>
                        <span className="text-[10px] text-neutral-500">
                          {selectedBatchUsers.length > 0
                            ? `${selectedBatchUsers.length} selected for batch invite`
                            : "Click Ring or check to multi-select"}
                        </span>
                      </div>

                      <div className="space-y-2">
                        {filteredContacts.map((contact) => {
                          const isAlreadyInCall = participants.some((p) => p.name === contact.name);
                          const isSelected = selectedBatchUsers.includes(contact.id);

                          return (
                            <div
                              key={contact.id}
                              className={`p-3 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                                isSelected
                                  ? "bg-blue-950/40 border-blue-500/50"
                                  : isAlreadyInCall
                                    ? "bg-white/2 border-white/5 opacity-60"
                                    : "bg-white/5 border-white/10 hover:border-white/20"
                              }`}
                            >
                              <div className="flex items-center gap-3 min-w-0">
                                {/* Batch Checkbox */}
                                <input
                                  type="checkbox"
                                  disabled={isAlreadyInCall}
                                  checked={isSelected}
                                  onChange={() => {
                                    if (isSelected) {
                                      setSelectedBatchUsers((prev) =>
                                        prev.filter((id) => id !== contact.id),
                                      );
                                    } else {
                                      setSelectedBatchUsers((prev) => [...prev, contact.id]);
                                    }
                                  }}
                                  className="rounded accent-blue-600 cursor-pointer w-4 h-4"
                                />

                                <div className="relative shrink-0">
                                  <img
                                    src={contact.avatar}
                                    alt={contact.name}
                                    className="w-9 h-9 rounded-full object-cover"
                                  />
                                  <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-emerald-500 ring-1 ring-black" />
                                </div>

                                <div className="min-w-0">
                                  <p className="text-xs font-bold text-white truncate flex items-center gap-1.5">
                                    <span>{contact.name}</span>
                                    {contact.isClient && (
                                      <span className="px-1.5 py-0.2 rounded-md bg-purple-500/20 text-purple-300 text-[9px] font-bold border border-purple-500/30">
                                        Client
                                      </span>
                                    )}
                                  </p>
                                  <p className="text-[11px] text-neutral-400 mt-0.5 truncate">
                                    {contact.role}
                                  </p>
                                </div>
                              </div>

                              {/* Single Call Button */}
                              {isAlreadyInCall ? (
                                <span className="text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-xl">
                                  In Call
                                </span>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => handleInviteSingle(contact)}
                                  className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition-all cursor-pointer shrink-0"
                                >
                                  Ring
                                </button>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* HIERARCHY LEVEL 3: SHARE CALL LINK */}
                  <div className="p-3.5 rounded-2xl bg-black/40 border border-white/10 flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-white">Direct Meeting Link</p>
                      <p className="text-[11px] text-neutral-400 truncate mt-0.5 font-mono">
                        https://looped.app/meet/sync-design-482
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleCopyMeetingLink}
                      className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all cursor-pointer shrink-0 flex items-center gap-1.5"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy</span>
                    </button>
                  </div>
                </div>

                {/* Sticky Batch Invite Footer (When 1 or more contacts are checked) */}
                {selectedBatchUsers.length > 0 && (
                  <div className="p-3 px-5 bg-blue-950/80 border-t border-blue-500/30 flex items-center justify-between">
                    <span className="text-xs font-bold text-blue-200">
                      {selectedBatchUsers.length} people selected
                    </span>
                    <button
                      type="button"
                      onClick={handleInviteBatch}
                      className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all cursor-pointer shadow-md active:scale-95 flex items-center gap-1.5"
                    >
                      <UserPlus className="w-3.5 h-3.5" />
                      <span>Invite Selected ({selectedBatchUsers.length})</span>
                    </button>
                  </div>
                )}
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </AnimatePresence>
  );
}
