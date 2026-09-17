import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Settings, Trash2, Check, UserMinus } from "lucide-react";
import { ChatThread } from "./types";
import { toast } from "sonner";

interface GroupSettingsModalProps {
  isOpen: boolean;
  group: ChatThread | null;
  onClose: () => void;
  onUpdateGroup: (updatedGroup: ChatThread) => void;
  onDeleteGroup: (groupId: string) => void;
}

const BG_COLORS = [
  { label: "Blue", value: "bg-blue-600" },
  { label: "Purple", value: "bg-purple-600" },
  { label: "Emerald", value: "bg-emerald-600" },
  { label: "Amber", value: "bg-amber-600" },
  { label: "Rose", value: "bg-rose-600" },
  { label: "Indigo", value: "bg-indigo-600" },
];

export function GroupSettingsModal({
  isOpen,
  group,
  onClose,
  onUpdateGroup,
  onDeleteGroup,
}: GroupSettingsModalProps) {
  const [name, setName] = useState(group?.name || "");
  const [description, setDescription] = useState(group?.description || "");
  const [selectedBg, setSelectedBg] = useState(group?.avatarBg || "bg-blue-600");
  const [members, setMembers] = useState(group?.members || []);

  useEffect(() => {
    if (group) {
      setName(group.name);
      setDescription(group.description || "");
      setSelectedBg(group.avatarBg || "bg-blue-600");
      setMembers(group.members || []);
    }
  }, [group]);

  if (!isOpen || !group) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Group name cannot be empty");
      return;
    }

    const updated: ChatThread = {
      ...group,
      name: name.trim(),
      description: description.trim(),
      avatarBg: selectedBg,
      members,
      membersCount: members.length + 1,
    };

    onUpdateGroup(updated);
    toast.success("Group settings updated");
    onClose();
  };

  const handleRemoveMember = (memberId: string, memberName: string) => {
    setMembers((prev) => prev.filter((m) => m.id !== memberId));
    toast.info(`Removed ${memberName} from group`);
  };

  const handleDelete = () => {
    if (confirm(`Are you sure you want to delete or leave "${group.name}"?`)) {
      onDeleteGroup(group.id);
      toast.success(`Group "${group.name}" removed`);
      onClose();
    }
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
          className="relative w-full max-w-lg bg-card border border-border/90 rounded-[28px] p-6 shadow-2xl z-10 overflow-hidden"
        >
          <div className="flex items-center justify-between pb-4 border-b border-border/70">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-purple-600/10 text-purple-600 grid place-items-center">
                <Settings className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-bold text-foreground">Group Settings</h3>
                <p className="text-xs text-muted-foreground">Manage details and members</p>
              </div>
            </div>
            <button
              onClick={onClose}
              type="button"
              className="w-8 h-8 rounded-full hover:bg-accent grid place-items-center text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <form onSubmit={handleSave} className="mt-4 space-y-4 max-h-[70vh] overflow-y-auto pr-1">
            <div>
              <label className="text-xs font-semibold text-foreground mb-1 block">Group Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full h-10 px-3.5 rounded-xl border border-border/80 bg-background text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-foreground"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-foreground mb-1 block">
                Channel Theme Color
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
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
                className="w-full p-3 rounded-xl border border-border/80 bg-background text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-foreground resize-none"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-semibold text-foreground">
                  Group Members ({members.length})
                </label>
              </div>
              <div className="space-y-1.5 max-h-40 overflow-y-auto border border-border/80 rounded-2xl p-2 bg-muted/20">
                {members.map((mem) => (
                  <div
                    key={mem.id}
                    className="flex items-center justify-between p-2 rounded-xl bg-card border border-border/60"
                  >
                    <div className="flex items-center gap-2.5">
                      <img
                        src={mem.avatar}
                        alt={mem.name}
                        className="w-7 h-7 rounded-full object-cover"
                      />
                      <div>
                        <p className="text-xs font-semibold text-foreground">{mem.name}</p>
                        <p className="text-[10px] text-muted-foreground">{mem.role}</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveMember(mem.id, mem.name)}
                      className="w-7 h-7 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive grid place-items-center transition-colors cursor-pointer"
                      title="Remove member"
                    >
                      <UserMinus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-3 border-t border-border/70 flex items-center justify-between gap-2.5">
              <button
                type="button"
                onClick={handleDelete}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold text-destructive hover:bg-destructive/10 flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Group</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-accent transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-foreground text-background text-xs font-semibold hover:opacity-90 transition-all cursor-pointer shadow-sm active:scale-95"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
