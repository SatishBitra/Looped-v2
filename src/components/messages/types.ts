export type ThreadType = "direct" | "group";

export interface MessageReaction {
  emoji: string;
  count: number;
  users: string[];
}

export interface MessageAttachment {
  id: string;
  name: string;
  size: string;
  type: "file" | "image" | "audio" | "video";
  url?: string;
  extension?: string;
  duration?: string; // for audio
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  senderRole?: string;
  text?: string;
  time: string;
  timestamp: number;
  isCurrentUser: boolean;
  attachments?: MessageAttachment[];
  reactions?: MessageReaction[];
  status?: "sending" | "sent" | "delivered" | "read";
  isAudioNote?: boolean;
  audioDuration?: string;
  isDateDivider?: boolean;
  dividerText?: string;
}

export interface GroupMember {
  id: string;
  name: string;
  avatar: string;
  role: "admin" | "member";
  isOnline: boolean;
  title?: string;
}

export interface SharedFileItem {
  id: string;
  name: string;
  size: string;
  date: string;
  extension: string;
  type: "pdf" | "video" | "doc" | "figma" | "archive";
  downloadUrl?: string;
}

export interface SharedLinkItem {
  id: string;
  title: string;
  source: string;
  date: string;
  url: string;
  thumbnail?: string;
}

export interface ChatThread {
  id: string;
  name: string;
  type: ThreadType;
  avatar: string;
  avatarBg?: string;
  isOnline?: boolean;
  membersCount?: number;
  onlineCount?: number;
  members?: GroupMember[];
  description?: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  isStarred?: boolean;
  isPinned?: boolean;
  isMuted?: boolean;
  hasAttachment?: boolean;
  callStatus?: "missed" | "ended" | null;
  serviceBadge?: "messenger" | "whatsapp" | "gmail" | null;
  sharedImages?: string[];
  sharedFiles?: SharedFileItem[];
  sharedLinks?: SharedLinkItem[];
  messages: ChatMessage[];
}

export type MessageFilterCategory = "inbox" | "explore" | "groups" | "all";
export type MessageSortOption = "newest" | "unread" | "starred";
