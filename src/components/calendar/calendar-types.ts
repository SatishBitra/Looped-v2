export type CalendarScope = "All events" | "Shared" | "Public" | "Archived";

export type CalendarViewMode = "Month view" | "Week view" | "Day view" | "Agenda view";

export type EventColorTheme =
  "neutral" | "purple" | "blue" | "pink" | "green" | "orange" | "yellow" | "indigo";

export interface CalendarEventItem {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD e.g. "2025-01-10"
  timeStart: string; // e.g. "9:00 AM"
  timeEnd?: string; // e.g. "10:00 AM"
  theme: EventColorTheme;
  scope: "all" | "shared" | "public" | "archived";
  hasBullet?: boolean;
  project?: string;
  location?: string;
  meetingLink?: string;
  description?: string;
  participants?: string[];
  completed?: boolean;
}

export const COLOR_THEME_STYLES: Record<
  EventColorTheme,
  {
    bg: string;
    text: string;
    border: string;
    dotColor?: string;
  }
> = {
  neutral: {
    bg: "bg-[#F1F2F5] dark:bg-[#27282F]",
    text: "text-[#23242A] dark:text-[#E6E7EE]",
    border: "border-[#E4E5EB] dark:border-[#383944]",
  },
  purple: {
    bg: "bg-[#F5F0FF] dark:bg-[#2C223E]",
    text: "text-[#7544DC] dark:text-[#CBB5FD]",
    border: "border-[#E8DCFE] dark:border-[#4B3770]",
  },
  blue: {
    bg: "bg-[#EBF4FF] dark:bg-[#1C2C45]",
    text: "text-[#1E72DE] dark:text-[#88C0FF]",
    border: "border-[#D3E6FF] dark:border-[#2C4872]",
  },
  pink: {
    bg: "bg-[#FEECF3] dark:bg-[#3D1E2D]",
    text: "text-[#D0266F] dark:text-[#FCA7CE]",
    border: "border-[#FCD3E5] dark:border-[#672F49]",
  },
  green: {
    bg: "bg-[#EAFBF3] dark:bg-[#163625]",
    text: "text-[#0F874C] dark:text-[#6EE7A8]",
    border: "border-[#C8F5DE] dark:border-[#23583C]",
    dotColor: "bg-[#10B981]",
  },
  orange: {
    bg: "bg-[#FEF3E7] dark:bg-[#3B291A]",
    text: "text-[#BE5B08] dark:text-[#FDBA74]",
    border: "border-[#FCE0C1] dark:border-[#634125]",
    dotColor: "bg-[#F97316]",
  },
  yellow: {
    bg: "bg-[#FEFCE8] dark:bg-[#373315]",
    text: "text-[#8C6D05] dark:text-[#FDE047]",
    border: "border-[#F9EEA6] dark:border-[#5E5720]",
  },
  indigo: {
    bg: "bg-[#EFF2FE] dark:bg-[#212644]",
    text: "text-[#4F5BD5] dark:text-[#A5B4FC]",
    border: "border-[#DCE2FD] dark:border-[#394278]",
    dotColor: "bg-[#6366F1]",
  },
};
