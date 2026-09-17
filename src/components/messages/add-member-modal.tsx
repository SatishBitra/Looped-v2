import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, UserPlus, Check } from "lucide-react";
import { GroupMember } from "./types";
import { INITIAL_MEMBERS } from "./data";
import { toast } from "sonner";

interface AddMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  existingMemberIds: string[];
  onAddMembers: (newMembers: GroupMember[]) => void;
}

export function AddMemberModal({
  isOpen,
  onClose,
  existingMemberIds,
  onAddMembers,
}: AddMemberModalProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  if (!isOpen) return null;

  const availableMembers = INITIAL_MEMBERS.filter((m) => !existingMemberIds.includes(m.id));

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]));
  };

  const handleAdd = () => {
    if (selectedIds.length === 0) {
      toast.error("Select at least one member to add");
      return;
    }
    const toAdd = INITIAL_MEMBERS.filter((m) => selectedIds.includes(m.id));
    onAddMembers(toAdd);
    toast.success(`Added ${toAdd.length} member(s)`);
    setSelectedIds([]);
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.45 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black backdrop-blur-xs"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 8 }}
          className="relative w-full max-w-md bg-white dark:bg-[#242428] border border-[#E7E7EC] dark:border-[#323238] rounded-[28px] p-6 shadow-2xl z-10"
        >
          <div className="flex items-center justify-between pb-4 border-b border-[#E7E7EC] dark:border-[#323238]">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-blue-600/10 text-blue-600 grid place-items-center">
                <UserPlus className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-bold text-foreground">Add Members</h3>
                <p className="text-xs text-muted-foreground">Select colleagues to join</p>
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

          <div className="mt-4 space-y-2 max-h-64 overflow-y-auto pr-1">
            {availableMembers.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-6">
                All team members are already in this group.
              </p>
            ) : (
              availableMembers.map((mem) => {
                const isSelected = selectedIds.includes(mem.id);
                return (
                  <button
                    key={mem.id}
                    type="button"
                    onClick={() => toggleSelect(mem.id)}
                    className={`w-full flex items-center justify-between p-2.5 rounded-xl transition-all text-left cursor-pointer ${
                      isSelected
                        ? "bg-[#F8F8FA] dark:bg-[#1c1c20] border border-[#E7E7EC] dark:border-[#323238] shadow-xs"
                        : "hover:bg-[#F4F4F7] dark:hover:bg-[#1a1a1c]"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={mem.avatar}
                        alt={mem.name}
                        className="w-8 h-8 rounded-full object-cover"
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
              })
            )}
          </div>

          <div className="mt-5 pt-3 border-t border-[#E7E7EC] dark:border-[#323238] flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-[#F4F4F7] dark:hover:bg-[#1a1a1c] transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={selectedIds.length === 0}
              onClick={handleAdd}
              className="px-5 py-2 rounded-xl bg-blue-600 disabled:opacity-50 text-white text-xs font-semibold hover:bg-blue-700 transition-all cursor-pointer shadow-xs active:scale-95"
            >
              Add Selected ({selectedIds.length})
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
