import { useState } from "react";
import {
  X,
  Bell,
  BellOff,
  Pin,
  UserPlus,
  Settings,
  FileText,
  Video,
  ExternalLink,
  Download,
  Users,
  Image as ImageIcon,
  Check,
} from "lucide-react";
import { ChatThread, SharedFileItem, SharedLinkItem } from "./types";
import { toast } from "sonner";

interface GroupInfoPanelProps {
  thread: ChatThread;
  onClose: () => void;
  onOpenSettings: () => void;
  onOpenAddMember: () => void;
  onTogglePin: () => void;
  onToggleMute: () => void;
}

export function GroupInfoPanel({
  thread,
  onClose,
  onOpenSettings,
  onOpenAddMember,
  onTogglePin,
  onToggleMute,
}: GroupInfoPanelProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const isGroup = thread.type === "group";
  const members = thread.members || [];
  const images = thread.sharedImages || [];
  const files = thread.sharedFiles || [];
  const links = thread.sharedLinks || [];

  return (
    <div className="w-full lg:w-[320px] xl:w-[360px] h-full bg-white dark:bg-[#242428] border-l border-[#E7E7EC] dark:border-[#323238] flex flex-col shrink-0 overflow-y-auto overflow-x-hidden">
      {/* Panel Top Header */}
      <div className="p-4 sm:p-5 flex items-center justify-between border-b border-[#E7E7EC] dark:border-[#323238]">
        <h3 className="text-sm sm:text-base font-bold text-foreground">
          {isGroup ? "Group Information" : "Contact Information"}
        </h3>
        <button
          type="button"
          onClick={onClose}
          className="w-8 h-8 rounded-xl border border-[#E7E7EC] dark:border-[#323238] bg-[#F4F4F7] dark:bg-[#1a1a1c] hover:bg-white dark:hover:bg-[#2e2e34] grid place-items-center text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="p-5 flex flex-col items-center text-center border-b border-[#E7E7EC] dark:border-[#323238]">
        {/* Large Centered Avatar */}
        {thread.avatar ? (
          <img
            src={thread.avatar}
            alt={thread.name}
            className="w-20 h-20 rounded-full object-cover shadow-xs ring-4 ring-[#E7E7EC]/50 dark:ring-[#323238]/50"
          />
        ) : (
          <div
            className={`w-20 h-20 rounded-full ${
              thread.avatarBg || "bg-blue-600"
            } text-white grid place-items-center text-2xl font-bold shadow-xs ring-4 ring-[#E7E7EC]/50 dark:ring-[#323238]/50`}
          >
            {thread.name.charAt(0)}
          </div>
        )}

        <h4 className="text-base font-bold text-foreground mt-3">{thread.name}</h4>
        <p className="text-xs text-muted-foreground mt-0.5">
          {isGroup
            ? `${thread.membersCount || members.length + 1} members • ${
                thread.onlineCount || Math.floor((members.length + 1) * 0.7)
              } Online`
            : thread.isOnline
              ? "Active now"
              : "Offline"}
        </p>

        {thread.description && (
          <p className="text-xs text-muted-foreground/80 mt-2 max-w-xs line-clamp-2">
            {thread.description}
          </p>
        )}

        {/* 4 Action Pills matching Screenshot 2: Notification, Pin Group, Member, Setting */}
        <div className="grid grid-cols-4 gap-2.5 w-full mt-5">
          {/* Notification */}
          <button
            type="button"
            onClick={onToggleMute}
            className="flex flex-col items-center gap-1.5 p-2 rounded-2xl bg-[#F8F8FA] dark:bg-[#1c1c20] hover:bg-[#F4F4F7] dark:hover:bg-[#25252a] border border-[#E7E7EC] dark:border-[#323238] transition-all cursor-pointer group"
          >
            <div className="w-9 h-9 rounded-xl bg-white dark:bg-[#242428] border border-[#E7E7EC] dark:border-[#323238] grid place-items-center text-muted-foreground group-hover:text-foreground shadow-xs">
              {thread.isMuted ? (
                <BellOff className="w-4 h-4 text-amber-500" />
              ) : (
                <Bell className="w-4 h-4" />
              )}
            </div>
            <span className="text-[10px] font-semibold text-muted-foreground group-hover:text-foreground">
              {thread.isMuted ? "Unmute" : "Notification"}
            </span>
          </button>

          {/* Pin Group */}
          <button
            type="button"
            onClick={onTogglePin}
            className="flex flex-col items-center gap-1.5 p-2 rounded-2xl bg-[#F8F8FA] dark:bg-[#1c1c20] hover:bg-[#F4F4F7] dark:hover:bg-[#25252a] border border-[#E7E7EC] dark:border-[#323238] transition-all cursor-pointer group"
          >
            <div
              className={`w-9 h-9 rounded-xl border grid place-items-center shadow-xs ${
                thread.isPinned
                  ? "bg-foreground text-background border-foreground"
                  : "bg-white dark:bg-[#242428] border-[#E7E7EC] dark:border-[#323238] text-muted-foreground group-hover:text-foreground"
              }`}
            >
              <Pin className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-semibold text-muted-foreground group-hover:text-foreground">
              {thread.isPinned ? "Pinned" : "Pin Group"}
            </span>
          </button>

          {/* Member (+) */}
          <button
            type="button"
            onClick={onOpenAddMember}
            className="flex flex-col items-center gap-1.5 p-2 rounded-2xl bg-[#F8F8FA] dark:bg-[#1c1c20] hover:bg-[#F4F4F7] dark:hover:bg-[#25252a] border border-[#E7E7EC] dark:border-[#323238] transition-all cursor-pointer group"
          >
            <div className="w-9 h-9 rounded-xl bg-white dark:bg-[#242428] border border-[#E7E7EC] dark:border-[#323238] grid place-items-center text-muted-foreground group-hover:text-foreground shadow-xs">
              <UserPlus className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-semibold text-muted-foreground group-hover:text-foreground">
              Member
            </span>
          </button>

          {/* Setting */}
          <button
            type="button"
            onClick={onOpenSettings}
            className="flex flex-col items-center gap-1.5 p-2 rounded-2xl bg-[#F8F8FA] dark:bg-[#1c1c20] hover:bg-[#F4F4F7] dark:hover:bg-[#25252a] border border-[#E7E7EC] dark:border-[#323238] transition-all cursor-pointer group"
          >
            <div className="w-9 h-9 rounded-xl bg-white dark:bg-[#242428] border border-[#E7E7EC] dark:border-[#323238] grid place-items-center text-muted-foreground group-hover:text-foreground shadow-xs">
              <Settings className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-semibold text-muted-foreground group-hover:text-foreground">
              Setting
            </span>
          </button>
        </div>
      </div>

      <div className="p-5 space-y-6">
        {/* Members Section */}
        {isGroup && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-foreground">Members</span>
              <button
                type="button"
                onClick={onOpenAddMember}
                className="text-[11px] font-semibold text-blue-600 hover:text-blue-700 cursor-pointer"
              >
                View All
              </button>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
              <Users className="w-3.5 h-3.5" />
              <span>{thread.membersCount || members.length + 1} members</span>
            </div>
            <div className="space-y-2">
              {members.slice(0, 4).map((m) => (
                <div
                  key={m.id}
                  className="flex items-center justify-between p-1 rounded-xl hover:bg-[#F8F8FA] dark:hover:bg-[#1c1c20] transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="relative">
                      <img
                        src={m.avatar}
                        alt={m.name}
                        className="w-7 h-7 rounded-full object-cover"
                      />
                      {m.isOnline && (
                        <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-emerald-500 ring-1 ring-white dark:ring-[#242428]" />
                      )}
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-foreground leading-tight">
                        {m.name}
                      </p>
                      <p className="text-[10px] text-muted-foreground">{m.title || m.role}</p>
                    </div>
                  </div>
                  {m.role === "admin" && (
                    <span className="px-1.5 py-0.5 rounded-md bg-[#F4F4F7] dark:bg-[#1a1a1c] border border-[#E7E7EC] dark:border-[#323238] text-[10px] font-semibold text-muted-foreground">
                      Admin
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Images 8-Grid Section */}
        {images.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-foreground">Images</span>
              <button
                type="button"
                onClick={() => toast.info(`Viewing all ${images.length} shared assets`)}
                className="text-[11px] font-semibold text-blue-600 hover:text-blue-700 cursor-pointer"
              >
                View All
              </button>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {images.map((img, i) => (
                <div
                  key={i}
                  onClick={() => setSelectedImage(img)}
                  className="aspect-square rounded-xl overflow-hidden cursor-pointer hover:opacity-90 hover:scale-105 transition-all shadow-xs border border-[#E7E7EC] dark:border-[#323238]"
                >
                  <img src={img} alt="Shared Asset" className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Files Section */}
        {files.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-foreground">Files</span>
              <button
                type="button"
                onClick={() => toast.info(`Viewing all ${files.length} documents`)}
                className="text-[11px] font-semibold text-blue-600 hover:text-blue-700 cursor-pointer"
              >
                View All
              </button>
            </div>
            <div className="space-y-2.5">
              {files.map((f) => (
                <div
                  key={f.id}
                  onClick={() => toast.success(`Downloading ${f.name}`)}
                  className="flex items-center justify-between p-2 rounded-xl border border-[#E7E7EC] dark:border-[#323238] bg-[#F8F8FA] dark:bg-[#1c1c20] hover:bg-white dark:hover:bg-[#242428] transition-all cursor-pointer group shadow-xs"
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <div className="w-8 h-8 rounded-lg bg-[#EAEAEF] dark:bg-[#25252a] flex items-center justify-center font-bold text-[10px] text-foreground shrink-0 uppercase">
                      {f.extension}
                    </div>
                    <div className="truncate">
                      <p className="text-xs font-medium text-foreground truncate">{f.name}</p>
                      <p className="text-[10px] text-muted-foreground">
                        {f.size} • {f.date}
                      </p>
                    </div>
                  </div>
                  <Download className="w-3.5 h-3.5 text-muted-foreground group-hover:text-foreground shrink-0 ml-2" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Links Section */}
        {links.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-foreground">Links</span>
              <button
                type="button"
                onClick={() => toast.info(`Opening links repository`)}
                className="text-[11px] font-semibold text-blue-600 hover:text-blue-700 cursor-pointer"
              >
                View All
              </button>
            </div>
            <div className="space-y-2.5">
              {links.map((link) => (
                <a
                  key={link.id}
                  href={link.url}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2.5 p-2 rounded-xl border border-[#E7E7EC] dark:border-[#323238] bg-[#F8F8FA] dark:bg-[#1c1c20] hover:bg-white dark:hover:bg-[#242428] transition-all cursor-pointer group shadow-xs"
                >
                  {link.thumbnail ? (
                    <img
                      src={link.thumbnail}
                      alt={link.title}
                      className="w-10 h-10 rounded-lg object-cover shrink-0"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-lg bg-[#EAEAEF] dark:bg-[#25252a] flex items-center justify-center shrink-0">
                      <ExternalLink className="w-4 h-4 text-muted-foreground" />
                    </div>
                  )}
                  <div className="truncate flex-1">
                    <p className="text-xs font-medium text-foreground truncate group-hover:text-blue-600 transition-colors">
                      {link.title}
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      {link.source} • {link.date}
                    </p>
                  </div>
                </a>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Lightbox for Image Preview */}
      {selectedImage && (
        <div
          onClick={() => setSelectedImage(null)}
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-xs cursor-pointer"
        >
          <img
            src={selectedImage}
            alt="Asset Preview"
            className="max-w-full max-h-[85vh] rounded-2xl shadow-2xl object-contain"
          />
        </div>
      )}
    </div>
  );
}
