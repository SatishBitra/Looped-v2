import { useState, useMemo, useRef, useEffect } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import {
  Search,
  Plus,
  ArrowLeft,
  Phone,
  Video,
  MoreVertical,
  Paperclip,
  Smile,
  Send,
  Mic,
  Image as ImageIcon,
  Link as LinkIcon,
  ChevronDown,
  Star,
  Check,
  CheckCheck,
  Play,
  Pause,
  Download,
  FileText,
  Sidebar as SidebarIcon,
  Users,
  Settings,
  X,
  PhoneCall,
  PhoneOff,
} from "lucide-react";
import { ChatThread, ChatMessage, MessageReaction } from "@/components/messages/types";
import { INITIAL_THREADS, INITIAL_MEMBERS } from "@/components/messages/data";
import { CreateGroupModal } from "@/components/messages/create-group-modal";
import { GroupSettingsModal } from "@/components/messages/group-settings-modal";
import { AddMemberModal } from "@/components/messages/add-member-modal";
import { VoiceCallModal } from "@/components/messages/voice-call-modal";
import { VideoCallModal } from "@/components/messages/video-call-modal";
import { GroupInfoPanel } from "@/components/messages/group-info-panel";
import { toast } from "sonner";

export const Route = createFileRoute("/messages")({
  component: MessagesPage,
});

export function MessagesPage() {
  const [threads, setThreads] = useState<ChatThread[]>(() => {
    try {
      const saved = localStorage.getItem("looped_chat_threads_v2");
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return INITIAL_THREADS;
  });

  useEffect(() => {
    try {
      localStorage.setItem("looped_chat_threads_v2", JSON.stringify(threads));
    } catch {
      // ignore
    }
  }, [threads]);

  // Selected thread
  const [selectedThreadId, setSelectedThreadId] = useState<string>("thread-group-design");
  const [activeCategory, setActiveCategory] = useState<"all" | "inbox" | "explore" | "groups">(
    "all",
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"newest" | "unread" | "starred">("newest");
  const [isSortDropdownOpen, setIsSortDropdownOpen] = useState(false);

  // Layout states
  const [showChatOnMobile, setShowChatOnMobile] = useState(false);
  const [isRightPanelOpen, setIsRightPanelOpen] = useState(true);

  // Message input state
  const [inputText, setInputText] = useState("");
  const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState(false);

  // Audio simulation state for voice notes in chat
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);

  // Modals
  const [isCreateGroupOpen, setIsCreateGroupOpen] = useState(false);
  const [isGroupSettingsOpen, setIsGroupSettingsOpen] = useState(false);
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
  const [isVoiceCallOpen, setIsVoiceCallOpen] = useState(false);
  const [isVideoCallOpen, setIsVideoCallOpen] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const activeThread = useMemo(() => {
    return threads.find((t) => t.id === selectedThreadId) || threads[0];
  }, [threads, selectedThreadId]);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeThread?.messages?.length]);

  // Keyboard shortcut for search
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Filter threads
  const filteredThreads = useMemo(() => {
    return threads
      .filter((t) => {
        if (activeCategory === "groups" && t.type !== "group") return false;
        if (activeCategory === "inbox" && t.type === "group") return false;
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchName = t.name.toLowerCase().includes(q);
          const matchLast = t.lastMessage.toLowerCase().includes(q);
          if (!matchName && !matchLast) return false;
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === "unread") return b.unreadCount - a.unreadCount;
        if (sortBy === "starred") return (b.isStarred ? 1 : 0) - (a.isStarred ? 1 : 0);
        return 0; // default order
      });
  }, [threads, activeCategory, searchQuery, sortBy]);

  // Send message
  const handleSendMessage = () => {
    if (!inputText.trim()) return;

    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      senderId: "me",
      senderName: "You",
      text: inputText.trim(),
      time: new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }),
      timestamp: Date.now(),
      isCurrentUser: true,
      status: "sent",
    };

    setThreads((prev) =>
      prev.map((t) => {
        if (t.id === activeThread.id) {
          return {
            ...t,
            lastMessage: `You: ${inputText.trim()}`,
            lastMessageTime: "Just now",
            messages: [...t.messages, newMsg],
          };
        }
        return t;
      }),
    );

    setInputText("");
    setIsEmojiPickerOpen(false);
  };

  // Send simulated voice note
  const handleSendVoiceNote = () => {
    const voiceMsg: ChatMessage = {
      id: `msg-voice-${Date.now()}`,
      senderId: "me",
      senderName: "You",
      time: new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }),
      timestamp: Date.now(),
      isCurrentUser: true,
      status: "read",
      isAudioNote: true,
      audioDuration: "0:45",
    };

    setThreads((prev) =>
      prev.map((t) => {
        if (t.id === activeThread.id) {
          return {
            ...t,
            lastMessage: "You sent a voice message",
            lastMessageTime: "Just now",
            messages: [...t.messages, voiceMsg],
          };
        }
        return t;
      }),
    );

    toast.success("Voice note sent");
  };

  // Handle file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const sizeStr = `${(file.size / (1024 * 1024)).toFixed(1)} MB`;
    const ext = file.name.split(".").pop()?.toUpperCase() || "FILE";

    const fileMsg: ChatMessage = {
      id: `msg-file-${Date.now()}`,
      senderId: "me",
      senderName: "You",
      time: new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }),
      timestamp: Date.now(),
      isCurrentUser: true,
      status: "read",
      text: `Uploaded attachment: ${file.name}`,
      attachments: [
        {
          id: `att-${Date.now()}`,
          name: file.name,
          size: sizeStr,
          type: "file",
          extension: ext,
        },
      ],
    };

    setThreads((prev) =>
      prev.map((t) => {
        if (t.id === activeThread.id) {
          return {
            ...t,
            lastMessage: `You sent an attachment: ${file.name}`,
            lastMessageTime: "Just now",
            hasAttachment: true,
            messages: [...t.messages, fileMsg],
          };
        }
        return t;
      }),
    );

    toast.success(`Attached ${file.name}`);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // Toggle Star
  const handleToggleStar = (threadId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setThreads((prev) =>
      prev.map((t) => (t.id === threadId ? { ...t, isStarred: !t.isStarred } : t)),
    );
  };

  // Toggle Pin
  const handleTogglePin = (threadId: string) => {
    setThreads((prev) =>
      prev.map((t) => (t.id === threadId ? { ...t, isPinned: !t.isPinned } : t)),
    );
    toast.success("Pin status updated");
  };

  // Toggle Mute
  const handleToggleMute = (threadId: string) => {
    setThreads((prev) => prev.map((t) => (t.id === threadId ? { ...t, isMuted: !t.isMuted } : t)));
    toast.info("Notification setting updated");
  };

  // Reaction to message
  const handleAddReaction = (msgId: string, emoji: string) => {
    setThreads((prev) =>
      prev.map((t) => {
        if (t.id === activeThread.id) {
          return {
            ...t,
            messages: t.messages.map((m) => {
              if (m.id === msgId) {
                const existing = m.reactions || [];
                const found = existing.find((r) => r.emoji === emoji);
                let updatedReactions: MessageReaction[];
                if (found) {
                  updatedReactions = existing.map((r) =>
                    r.emoji === emoji ? { ...r, count: r.count + 1 } : r,
                  );
                } else {
                  updatedReactions = [...existing, { emoji, count: 1, users: ["You"] }];
                }
                return { ...m, reactions: updatedReactions };
              }
              return m;
            }),
          };
        }
        return t;
      }),
    );
  };

  // Create Group callback
  const handleCreateGroup = (newGroup: ChatThread) => {
    setThreads((prev) => [newGroup, ...prev]);
    setSelectedThreadId(newGroup.id);
  };

  // Update Group callback (CRUD)
  const handleUpdateGroup = (updatedGroup: ChatThread) => {
    setThreads((prev) => prev.map((t) => (t.id === updatedGroup.id ? updatedGroup : t)));
  };

  // Delete Group callback (CRUD)
  const handleDeleteGroup = (groupId: string) => {
    setThreads((prev) => prev.filter((t) => t.id !== groupId));
    setSelectedThreadId("thread-group-design");
  };

  // Add members callback
  const handleAddMembers = (newMembers: typeof INITIAL_MEMBERS) => {
    setThreads((prev) =>
      prev.map((t) => {
        if (t.id === activeThread.id) {
          const currentMems = t.members || [];
          const combined = [...currentMems, ...newMembers];
          return {
            ...t,
            members: combined,
            membersCount: combined.length + 1,
          };
        }
        return t;
      }),
    );
  };

  const isCurrentGroup = activeThread?.type === "group";

  return (
    <AppShell>
      <div className="w-full max-w-[1440px] mx-auto pb-4">
        {/* Main Messenger Container */}
        <div className="bg-card border border-border/80 rounded-[28px] sm:rounded-[32px] h-[calc(100vh-140px)] min-h-[640px] max-h-[920px] shadow-sm flex overflow-hidden">
          {/* ================= COLUMN 1: THREADS LIST ================= */}
          <div
            className={`w-full md:w-[340px] lg:w-[380px] border-r border-border/70 flex flex-col shrink-0 bg-card ${
              showChatOnMobile ? "hidden md:flex" : "flex"
            }`}
          >
            {/* Thread Header: Title + Create Button */}
            <div className="p-4 sm:p-5 pb-3 flex items-center justify-between border-b border-border/60">
              <div className="flex items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                  Messages
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setIsCreateGroupOpen(true)}
                className="w-9 h-9 rounded-xl border border-border/80 hover:bg-accent grid place-items-center text-foreground transition-colors cursor-pointer shadow-xs"
                title="Create new group"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {/* Search Input with ⌘K Badge */}
            <div className="px-4 py-3">
              <div className="relative">
                <Search className="w-4 h-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search messages"
                  className="w-full h-10 pl-9 pr-12 rounded-xl bg-muted/40 border border-border/70 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-foreground transition-all"
                />
                <div className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 px-1.5 py-0.5 rounded-md bg-muted text-[10px] font-semibold text-muted-foreground border border-border/60">
                  ⌘K
                </div>
              </div>
            </div>

            {/* Filter Tabs matching Screenshot: [ All 234 ⌵ ] [ Newest ⌵ ] */}
            <div className="px-4 pb-2 flex items-center justify-between gap-2 border-b border-border/60">
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setActiveCategory("all")}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                    activeCategory === "all"
                      ? "bg-foreground text-background shadow-xs"
                      : "text-muted-foreground hover:bg-muted/40"
                  }`}
                >
                  <span>All</span>
                  <span
                    className={`px-1.5 py-0.2 rounded-md text-[10px] ${
                      activeCategory === "all"
                        ? "bg-background/20 text-background"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    234
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveCategory("groups")}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    activeCategory === "groups"
                      ? "bg-foreground text-background shadow-xs"
                      : "text-muted-foreground hover:bg-muted/40"
                  }`}
                >
                  Groups
                </button>
              </div>

              {/* Sort dropdown */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsSortDropdownOpen(!isSortDropdownOpen)}
                  className="px-2.5 py-1.5 rounded-xl border border-border/70 hover:bg-accent text-xs font-semibold text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <span className="capitalize">{sortBy}</span>
                  <ChevronDown className="w-3.5 h-3.5" />
                </button>
                {isSortDropdownOpen && (
                  <div className="absolute right-0 top-9 w-32 bg-card border border-border/90 rounded-xl p-1 shadow-xl z-20">
                    {(["newest", "unread", "starred"] as const).map((opt) => (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => {
                          setSortBy(opt);
                          setIsSortDropdownOpen(false);
                        }}
                        className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium capitalize hover:bg-accent"
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Create New Group CTA Button (matching Screenshot 2) */}
            <div className="p-3 pb-2">
              <button
                type="button"
                onClick={() => setIsCreateGroupOpen(true)}
                className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-xs active:scale-[0.99] cursor-pointer"
              >
                <Users className="w-3.5 h-3.5" />
                <span>Create New Group</span>
              </button>
            </div>

            {/* Threads List */}
            <div className="flex-1 overflow-y-auto px-2 space-y-1">
              {filteredThreads.map((t) => {
                const isActive = t.id === activeThread.id;
                return (
                  <div
                    key={t.id}
                    onClick={() => {
                      setSelectedThreadId(t.id);
                      setShowChatOnMobile(true);
                    }}
                    className={`w-full p-2.5 sm:p-3 rounded-2xl flex items-center gap-3 transition-all cursor-pointer text-left relative group ${
                      isActive
                        ? "bg-accent/80 border border-border/80 shadow-xs"
                        : "hover:bg-muted/30 border border-transparent"
                    }`}
                  >
                    {/* Avatar with Online indicator or App badge */}
                    <div className="relative shrink-0">
                      {t.avatar ? (
                        <img
                          src={t.avatar}
                          alt={t.name}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      ) : (
                        <div
                          className={`w-10 h-10 rounded-full ${
                            t.avatarBg || "bg-blue-600"
                          } text-white grid place-items-center font-bold text-sm shadow-xs`}
                        >
                          {t.name.charAt(0)}
                        </div>
                      )}

                      {/* Online Status Dot */}
                      {t.isOnline && (
                        <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-card" />
                      )}

                      {/* Service Badge (e.g. Messenger, Gmail, WhatsApp) */}
                      {t.serviceBadge && (
                        <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-blue-500 text-white text-[8px] font-bold grid place-items-center ring-1 ring-card">
                          {t.serviceBadge.charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>

                    {/* Middle: Title & Last Message Preview */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <p
                          className={`text-xs font-bold truncate ${
                            isActive ? "text-foreground" : "text-foreground/90"
                          }`}
                        >
                          {t.name}
                        </p>
                        <span className="text-[10px] text-muted-foreground shrink-0">
                          {t.lastMessageTime}
                        </span>
                      </div>
                      <p className="text-[11px] text-muted-foreground truncate mt-0.5">
                        {t.lastMessage}
                      </p>
                    </div>

                    {/* Right-side Indicators: Unread Dot, Attachment, Star */}
                    <div className="flex items-center gap-1.5 shrink-0 pl-1">
                      {t.unreadCount > 0 && (
                        <span className="w-2 h-2 rounded-full bg-red-500 shrink-0" />
                      )}

                      {t.hasAttachment && (
                        <Paperclip className="w-3 h-3 text-muted-foreground shrink-0" />
                      )}

                      <button
                        type="button"
                        onClick={(e) => handleToggleStar(t.id, e)}
                        className="text-muted-foreground hover:text-amber-500 transition-colors cursor-pointer"
                        title={t.isStarred ? "Unstar" : "Star"}
                      >
                        <Star
                          className={`w-3.5 h-3.5 ${
                            t.isStarred ? "fill-amber-500 text-amber-500" : ""
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ================= COLUMN 2: ACTIVE CHAT CONVERSATION ================= */}
          <div
            className={`flex-1 flex flex-col h-full bg-card min-w-0 ${
              showChatOnMobile ? "flex" : "hidden md:flex"
            }`}
          >
            {/* Chat Window Top Bar Header */}
            <div className="p-3.5 sm:p-4 border-b border-border/70 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                {/* Back button on mobile */}
                <button
                  type="button"
                  onClick={() => setShowChatOnMobile(false)}
                  className="md:hidden w-8 h-8 rounded-xl border border-border grid place-items-center text-muted-foreground shrink-0"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>

                {/* Avatar */}
                <div className="relative shrink-0">
                  {activeThread.avatar ? (
                    <img
                      src={activeThread.avatar}
                      alt={activeThread.name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <div
                      className={`w-10 h-10 rounded-full ${
                        activeThread.avatarBg || "bg-blue-600"
                      } text-white grid place-items-center font-bold text-sm`}
                    >
                      {activeThread.name.charAt(0)}
                    </div>
                  )}
                  {activeThread.isOnline && (
                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-card" />
                  )}
                </div>

                {/* Title & Subtitle */}
                <div className="min-w-0">
                  <h3 className="text-sm font-bold text-foreground truncate">
                    {activeThread.name}
                  </h3>
                  <p className="text-[11px] text-muted-foreground truncate">
                    {isCurrentGroup ? (
                      <>
                        <span>{activeThread.membersCount || 12} Members</span>{" "}
                        <span className="text-emerald-500 font-semibold">
                          • {activeThread.onlineCount || 8} Online
                        </span>
                      </>
                    ) : activeThread.isOnline ? (
                      <span className="text-emerald-500 font-semibold">Online</span>
                    ) : (
                      "Offline"
                    )}
                  </p>
                </div>
              </div>

              {/* Header Right Actions: Avatars stack, Voice Call, Video Call, Settings, Toggle Sidebar */}
              <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                {/* Member Avatar Stack for Groups */}
                {isCurrentGroup && (
                  <div className="hidden lg:flex items-center -space-x-2 mr-2">
                    {activeThread.members?.slice(0, 3).map((m) => (
                      <img
                        key={m.id}
                        src={m.avatar}
                        alt={m.name}
                        className="w-7 h-7 rounded-full object-cover ring-2 ring-card"
                        title={m.name}
                      />
                    ))}
                    <button
                      type="button"
                      onClick={() => setIsAddMemberOpen(true)}
                      className="w-7 h-7 rounded-full bg-muted border border-border text-[10px] font-bold text-muted-foreground hover:text-foreground grid place-items-center ring-2 ring-card transition-colors cursor-pointer"
                      title="Add member"
                    >
                      +
                    </button>
                  </div>
                )}

                {/* Voice Call Button */}
                <button
                  type="button"
                  onClick={() => setIsVoiceCallOpen(true)}
                  className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl border border-border/80 hover:bg-accent grid place-items-center text-muted-foreground hover:text-foreground transition-colors cursor-pointer shadow-xs"
                  title="Start voice call"
                >
                  <Phone className="w-4 h-4" />
                </button>

                {/* Video Call Button */}
                <button
                  type="button"
                  onClick={() => setIsVideoCallOpen(true)}
                  className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl border border-border/80 hover:bg-accent grid place-items-center text-muted-foreground hover:text-foreground transition-colors cursor-pointer shadow-xs"
                  title="Start video call"
                >
                  <Video className="w-4 h-4" />
                </button>

                {/* Group Settings Button */}
                {isCurrentGroup && (
                  <button
                    type="button"
                    onClick={() => setIsGroupSettingsOpen(true)}
                    className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl border border-border/80 hover:bg-accent grid place-items-center text-muted-foreground hover:text-foreground transition-colors cursor-pointer shadow-xs"
                    title="Group settings (CRUD)"
                  >
                    <Settings className="w-4 h-4" />
                  </button>
                )}

                {/* Toggle Group Info Panel Button */}
                <button
                  type="button"
                  onClick={() => setIsRightPanelOpen(!isRightPanelOpen)}
                  className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl border transition-colors grid place-items-center cursor-pointer shadow-xs ${
                    isRightPanelOpen
                      ? "bg-foreground text-background border-foreground"
                      : "border-border/80 text-muted-foreground hover:text-foreground hover:bg-accent"
                  }`}
                  title={isRightPanelOpen ? "Close information panel" : "View group info"}
                >
                  <SidebarIcon className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Messages Content Stream */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
              {activeThread.messages.map((m) => {
                // Divider (e.g. "Today" or "Unread")
                if (m.isDateDivider) {
                  return (
                    <div key={m.id} className="relative flex items-center justify-center my-4">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-border/60" />
                      </div>
                      <span className="relative px-3 bg-card text-[11px] font-semibold text-muted-foreground">
                        {m.dividerText || "Today"}
                      </span>
                    </div>
                  );
                }

                const isMe = m.isCurrentUser;

                return (
                  <div
                    key={m.id}
                    className={`flex items-start gap-2.5 ${isMe ? "justify-end" : "justify-start"}`}
                  >
                    {/* Inbound Sender Avatar */}
                    {!isMe && (
                      <div className="shrink-0 mt-0.5">
                        {m.senderAvatar ? (
                          <img
                            src={m.senderAvatar}
                            alt={m.senderName}
                            className="w-7 h-7 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-7 h-7 rounded-full bg-blue-600 text-white grid place-items-center text-[10px] font-bold">
                            {m.senderName.charAt(0)}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Message Bubble + Meta */}
                    <div
                      className={`max-w-[85%] sm:max-w-[70%] space-y-1.5 ${isMe ? "items-end" : "items-start"}`}
                    >
                      {/* Sender Name above message */}
                      {!isMe && (
                        <p className="text-[11px] font-semibold text-foreground px-1">
                          {m.senderName}
                        </p>
                      )}

                      {/* Regular Text Bubble */}
                      {m.text && (
                        <div
                          className={`p-3 sm:px-4 sm:py-2.5 rounded-2xl text-xs leading-relaxed ${
                            isMe
                              ? "bg-blue-600 text-white rounded-tr-xs shadow-xs"
                              : "bg-muted/40 text-foreground border border-border/70 rounded-tl-xs"
                          }`}
                        >
                          <p className="whitespace-pre-wrap">{m.text}</p>
                        </div>
                      )}

                      {/* File Attachment Card (e.g. dashboard_mockups.fig) */}
                      {m.attachments?.map((att) => (
                        <div
                          key={att.id}
                          className="flex items-center gap-3 p-3 rounded-2xl bg-card border border-border/80 shadow-xs max-w-sm"
                        >
                          <div className="w-10 h-10 rounded-xl bg-purple-600/10 text-purple-600 grid place-items-center font-bold text-xs uppercase shrink-0">
                            {att.extension || "FIG"}
                          </div>
                          <div className="truncate flex-1">
                            <p className="text-xs font-semibold text-foreground truncate">
                              {att.name}
                            </p>
                            <p className="text-[10px] text-muted-foreground">{att.size}</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => toast.success(`Downloaded ${att.name}`)}
                            className="p-2 rounded-xl hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                            title="Download file"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                        </div>
                      ))}

                      {/* Audio / Voice Note Waveform Card */}
                      {m.isAudioNote && (
                        <div
                          className={`flex items-center gap-3 p-2.5 sm:px-3 sm:py-2 rounded-2xl border ${
                            isMe
                              ? "bg-blue-600/15 border-blue-500/30 text-foreground"
                              : "bg-muted/50 border-border/70 text-foreground"
                          }`}
                        >
                          <button
                            type="button"
                            onClick={() => setPlayingAudioId(playingAudioId === m.id ? null : m.id)}
                            className="w-8 h-8 rounded-full bg-blue-600 text-white grid place-items-center hover:bg-blue-700 transition-all cursor-pointer shadow-xs shrink-0"
                          >
                            {playingAudioId === m.id ? (
                              <Pause className="w-3.5 h-3.5" />
                            ) : (
                              <Play className="w-3.5 h-3.5 ml-0.5" />
                            )}
                          </button>

                          {/* Animated Waveform Bars */}
                          <div className="flex items-center gap-0.5 sm:gap-1 h-5 flex-1 min-w-[120px]">
                            {[8, 14, 20, 10, 16, 22, 12, 18, 24, 14, 10, 16, 20, 12].map(
                              (barHeight, idx) => (
                                <span
                                  key={idx}
                                  style={{ height: `${barHeight}px` }}
                                  className={`w-1 rounded-full ${
                                    playingAudioId === m.id
                                      ? "bg-blue-600 animate-pulse"
                                      : "bg-muted-foreground/50"
                                  }`}
                                />
                              ),
                            )}
                          </div>

                          <span className="text-[11px] font-semibold text-muted-foreground shrink-0">
                            {m.audioDuration || "1:20"}
                          </span>
                        </div>
                      )}

                      {/* Time & Delivery Checkmarks & Reactions */}
                      <div
                        className={`flex items-center gap-1.5 text-[10px] text-muted-foreground px-1 ${
                          isMe ? "justify-end" : "justify-start"
                        }`}
                      >
                        <span>{m.time}</span>
                        {isMe && <CheckCheck className="w-3.5 h-3.5 text-blue-500" />}
                      </div>

                      {/* Reaction Badges below message */}
                      {m.reactions && m.reactions.length > 0 && (
                        <div
                          className={`flex items-center gap-1 mt-1 flex-wrap ${
                            isMe ? "justify-end" : "justify-start"
                          }`}
                        >
                          {m.reactions.map((r, i) => (
                            <button
                              key={i}
                              type="button"
                              onClick={() => handleAddReaction(m.id, r.emoji)}
                              className="px-2 py-0.5 rounded-full bg-muted/60 hover:bg-muted border border-border/60 text-xs flex items-center gap-1 transition-all cursor-pointer"
                            >
                              <span>{r.emoji}</span>
                              <span className="text-[10px] font-semibold text-muted-foreground">
                                {r.count}
                              </span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}

              <div ref={messagesEndRef} />
            </div>

            {/* Chat Input Bar Footer */}
            <div className="p-3 sm:p-4 border-t border-border/70 bg-card">
              <div className="rounded-2xl border border-border/80 bg-background/80 p-2 focus-within:ring-1 focus-within:ring-foreground transition-all">
                {/* Textarea / Input */}
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  placeholder="Type @ to mention someone..."
                  className="w-full bg-transparent px-2 py-1.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none"
                />

                {/* Input Action Controls Footer Bar */}
                <div className="flex items-center justify-between pt-2 border-t border-border/50 mt-1">
                  {/* Left Action Buttons: +, Emoji, File, Image, Link, Voice */}
                  <div className="flex items-center gap-1 sm:gap-1.5">
                    {/* Hidden file input */}
                    <input
                      ref={fileInputRef}
                      type="file"
                      className="hidden"
                      onChange={handleFileUpload}
                    />

                    {/* Quick Add Asset (+) */}
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="w-7 h-7 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground grid place-items-center transition-colors cursor-pointer"
                      title="Attach file"
                    >
                      <Plus className="w-4 h-4" />
                    </button>

                    {/* Emoji Picker */}
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setIsEmojiPickerOpen(!isEmojiPickerOpen)}
                        className="w-7 h-7 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground grid place-items-center transition-colors cursor-pointer"
                        title="Add emoji"
                      >
                        <Smile className="w-4 h-4" />
                      </button>

                      {/* Emoji Palette Popover */}
                      {isEmojiPickerOpen && (
                        <div className="absolute left-0 bottom-9 p-2 bg-card border border-border/90 rounded-2xl shadow-xl z-20 grid grid-cols-6 gap-1 w-52">
                          {[
                            "👍",
                            "❤️",
                            "🙏",
                            "😂",
                            "😮",
                            "🔥",
                            "🎉",
                            "👏",
                            "🚀",
                            "✨",
                            "💯",
                            "😍",
                          ].map((emoji) => (
                            <button
                              key={emoji}
                              type="button"
                              onClick={() => {
                                setInputText((prev) => prev + emoji);
                                setIsEmojiPickerOpen(false);
                              }}
                              className="w-7 h-7 hover:bg-muted rounded-lg text-sm grid place-items-center cursor-pointer transition-colors"
                            >
                              {emoji}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* File Attachment */}
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="w-7 h-7 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground grid place-items-center transition-colors cursor-pointer"
                      title="Attach document"
                    >
                      <Paperclip className="w-4 h-4" />
                    </button>

                    {/* Image Attachment */}
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="w-7 h-7 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground grid place-items-center transition-colors cursor-pointer"
                      title="Attach photo/image"
                    >
                      <ImageIcon className="w-4 h-4" />
                    </button>

                    {/* Link Insertion */}
                    <button
                      type="button"
                      onClick={() => {
                        const url = prompt("Enter link URL:");
                        if (url) {
                          setInputText((prev) => prev + (prev ? " " : "") + url);
                        }
                      }}
                      className="w-7 h-7 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground grid place-items-center transition-colors cursor-pointer"
                      title="Add link"
                    >
                      <LinkIcon className="w-3.5 h-3.5" />
                    </button>

                    {/* Voice Note Recording Button */}
                    <button
                      type="button"
                      onClick={handleSendVoiceNote}
                      className="w-7 h-7 rounded-lg hover:bg-blue-600/10 text-muted-foreground hover:text-blue-600 grid place-items-center transition-colors cursor-pointer"
                      title="Record voice note"
                    >
                      <Mic className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Right Send Button */}
                  <button
                    type="button"
                    onClick={handleSendMessage}
                    disabled={!inputText.trim()}
                    className="h-8 px-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs active:scale-95"
                  >
                    <span>Send</span>
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* ================= COLUMN 3: GROUP INFORMATION (Collapsible) ================= */}
          {isRightPanelOpen && (
            <GroupInfoPanel
              thread={activeThread}
              onClose={() => setIsRightPanelOpen(false)}
              onOpenSettings={() => setIsGroupSettingsOpen(true)}
              onOpenAddMember={() => setIsAddMemberOpen(true)}
              onTogglePin={() => handleTogglePin(activeThread.id)}
              onToggleMute={() => handleToggleMute(activeThread.id)}
            />
          )}
        </div>
      </div>

      {/* Modals */}
      <CreateGroupModal
        isOpen={isCreateGroupOpen}
        onClose={() => setIsCreateGroupOpen(false)}
        onCreateGroup={handleCreateGroup}
      />

      <GroupSettingsModal
        isOpen={isGroupSettingsOpen}
        group={activeThread}
        onClose={() => setIsGroupSettingsOpen(false)}
        onUpdateGroup={handleUpdateGroup}
        onDeleteGroup={handleDeleteGroup}
      />

      <AddMemberModal
        isOpen={isAddMemberOpen}
        onClose={() => setIsAddMemberOpen(false)}
        existingMemberIds={(activeThread.members || []).map((m) => m.id)}
        onAddMembers={handleAddMembers}
      />

      <VoiceCallModal
        isOpen={isVoiceCallOpen}
        thread={activeThread}
        onClose={() => setIsVoiceCallOpen(false)}
      />

      <VideoCallModal
        isOpen={isVideoCallOpen}
        thread={activeThread}
        onClose={() => setIsVideoCallOpen(false)}
      />
    </AppShell>
  );
}
