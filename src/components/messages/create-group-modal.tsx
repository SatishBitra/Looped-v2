import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Users, Check } from "lucide-react";
import { ChatThread, GroupMember } from "./types";
import { INITIAL_MEMBERS, INITIAL_FILES, INITIAL_IMAGES, INITIAL_LINKS } from "./data";
import { toast } from "sonner";

interface CreateGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateGroup: (newThread: ChatThread) => void;
}

const BG_COLORS = [
  { label: "Blue", value: "bg-blue-600" },
  { label: "Purple", value: "bg-purple-600" },
  { label: "Emerald", value: "bg-emerald-600" },
  { label: "Amber", value: "bg-amber-600" },
  { label: "Rose", value: "bg-rose-600" },
  { label: "Indigo", value: "bg-indigo-600" },
];

export function CreateGroupModal({ isOpen, onClose, onCreateGroup }: CreateGroupModalProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedBg, setSelectedBg] = useState(BG_COLORS[0].value);
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>(["mem-1", "mem-2", "mem-3"]);

  if (!isOpen) return null;

  const toggleMember = (id: string) => {
    setSelectedMemberIds((prev) =>
      prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id],
    );
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Please enter a group name");
      return;
    }

    const members: GroupMember[] = INITIAL_MEMBERS.filter((m) => selectedMemberIds.includes(m.id));

    const newGroup: ChatThread = {
      id: `group-${Date.now()}`,
      name: name.trim(),
      type: "group",
      avatar: "",
      avatarBg: selectedBg,
      membersCount: members.length + 1, // including current user
      onlineCount: Math.max(1, Math.floor((members.length + 1) * 0.7)),
      description: description.trim() || "Collaborative team channel for projects and discussions.",
      lastMessage: "Group created. Welcome everyone!",
      lastMessageTime: "Just now",
      unreadCount: 0,
      isStarred: false,
      isPinned: false,
      isMuted: false,
      members,
      sharedImages: INITIAL_IMAGES.slice(0, 4),
      sharedFiles: INITIAL_FILES.slice(0, 2),
      sharedLinks: INITIAL_LINKS.slice(0, 2),
      messages: [
        {
          id: `msg-create-${Date.now()}`,
          senderId: "system",
          senderName: "System",
          text: `You created the group "${name.trim()}".`,
          time: new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }),
          timestamp: Date.now(),
          isCurrentUser: false,
          isDateDivider: true,
          dividerText: "Today",
        },
      ],
    };

    onCreateGroup(newGroup);
    toast.success(`Created group "${name.trim()}"`);
    setName("");
    setDescription("");
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.45 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black backdrop-blur-xs"
        />

        {/* Modal Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 8 }}
          className="relative w-full max-w-lg bg-white dark:bg-[#242428] border border-[#E7E7EC] dark:border-[#323238] rounded-[28px] p-6 shadow-2xl z-10 overflow-hidden"
        >
          <div className="flex items-center justify-between pb-4 border-b border-[#E7E7EC] dark:border-[#323238]">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-blue-600/10 text-blue-600 grid place-items-center">
                <Users className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-bold text-foreground">Create New Group</h3>
                <p className="text-xs text-muted-foreground">
                  Start a team channel with your colleagues
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              type="button"
              className="w-8 h-8 rounded-xl border border-[#E7E7EC] dark:border-[#323238] bg-[#F4F4F7] dark:bg-[#1a1a1c] hover:bg-white dark:hover:bg-[#2e2e34] grid place-items-center text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <form
            onSubmit={handleCreate}
            className="mt-4 space-y-4 max-h-[70vh] overflow-y-auto pr-1"
          >
            <div>
              <label className="text-xs font-semibold text-foreground mb-1 block">
                Group Name *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Design Department Team, Product Sprint..."
                className="w-full h-10 px-3.5 rounded-xl border border-[#E7E7EC] dark:border-[#323238] bg-[#F4F4F7] dark:bg-[#1a1a1c] text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-foreground"
                autoFocus
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-foreground mb-1 block">
                Channel Color Theme
              </label>
              <div className="flex items-center gap-2.5">
                {BG_COLORS.map((c) => (
                  <button
                    key={c.value}
                    type="button"
                    onClick={() => setSelectedBg(c.value)}
                    className={`w-7 h-7 rounded-full ${c.value} transition-all grid place-items-center cursor-pointer ${
                      selectedBg === c.value ? "ring-2 ring-foreground ring-offset-2 scale-110" : ""
                    }`}
                  >
                    {selectedBg === c.value && <Check className="w-3.5 h-3.5 text-white" />}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-foreground mb-1 block">
                Description (Optional)
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Briefly state the goal of this channel..."
                rows={2}
                className="w-full p-3 rounded-xl border border-[#E7E7EC] dark:border-[#323238] bg-[#F4F4F7] dark:bg-[#1a1a1c] text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-foreground resize-none"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-semibold text-foreground">
                  Select Members ({selectedMemberIds.length})
                </label>
                <span className="text-[11px] text-muted-foreground">Click to toggle</span>
              </div>
              <div className="space-y-1.5 max-h-44 overflow-y-auto border border-[#E7E7EC] dark:border-[#323238] rounded-2xl p-2 bg-[#F8F8FA] dark:bg-[#1c1c20]">
                {INITIAL_MEMBERS.map((mem) => {
                  const isSelected = selectedMemberIds.includes(mem.id);
                  return (
                    <button
                      key={mem.id}
                      type="button"
                      onClick={() => toggleMember(mem.id)}
                      className={`w-full flex items-center justify-between p-2 rounded-xl transition-all text-left cursor-pointer ${
                        isSelected
                          ? "bg-white dark:bg-[#242428] border border-[#E7E7EC] dark:border-[#323238] shadow-xs"
                          : "hover:bg-white/60 dark:hover:bg-[#242428]/60"
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <img
                          src={mem.avatar}
                          alt={mem.name}
                          className="w-7 h-7 rounded-full object-cover"
                        />
                        <div>
                          <p className="text-xs font-semibold text-foreground">{mem.name}</p>
                          <p className="text-[10px] text-muted-foreground">{mem.title}</p>
                        </div>
                      </div>
                      <div
                        className={`w-5 h-5 rounded-full border grid place-items-center ${
                          isSelected
                            ? "bg-foreground text-background border-foreground"
                            : "border-border"
                        }`}
                      >
                        {isSelected && <Check className="w-3 h-3" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="pt-3 border-t border-[#E7E7EC] dark:border-[#323238] flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-[#F4F4F7] dark:hover:bg-[#1a1a1c] transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 transition-all cursor-pointer shadow-xs active:scale-95"
              >
                Create Group
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
