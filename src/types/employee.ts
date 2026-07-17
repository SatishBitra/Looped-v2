export type PresenceStatus =
  "Online" | "Busy" | "In Meeting" | "Focus Time" | "Away" | "Offline" | "Do Not Disturb";

export type EmploymentType = "Full Time" | "Intern" | "Contract" | "Freelancer" | "Consultant";

export type DepartmentType = "Product" | "Engineering" | "Design" | "Marketing" | "Sales" | "HR";

export type PodType = "Pod Alpha" | "Pod Beta" | "Ops" | "General";

export interface Employee {
  id: string;
  name: string;
  avatar: string; // emoji or Unsplash URL
  role: string;
  employmentType: EmploymentType;
  department: DepartmentType;
  pod: PodType;
  status: PresenceStatus;
  bio: string;
  bannerType: "gradient" | "illustration" | "solid" | "ai" | "company";
  bannerValue: string; // hex color or gradient description or URL
  location: string;
  workingHours: string;
  email: string;
  phone: string;

  // Productivity Overview (Active Tasks, Projects, Logged Hours, Completion Rate)
  productivity: {
    activeTasks: number;
    projects: number;
    loggedHours: number; // Current Month
    completionRate: number; // percentage
  };

  // Current Activity
  currentActivity?: {
    type: "working" | "meeting" | "focus" | "break";
    title: string;
    startTime: string;
    endTime?: string;
    eta?: string;
  };

  // Current Assignment
  currentAssignment?: {
    client: string;
    project: string;
    task: string;
  };

  // Quick Statistics
  stats: {
    projects: number;
    tasks: number;
    completed: number;
    approvals: number;
    timeLogged: number; // total hours
    experience: number; // years
  };

  // Activity Timeline
  timeline: {
    id: string;
    type: "completed" | "commented" | "approved" | "meeting" | "status";
    text: string;
    timestamp: string; // e.g., "1 hr ago", "Yesterday"
  }[];

  // Calendar Preview (mini events)
  calendarEvents: {
    id: string;
    time: string;
    title: string;
    type: "meeting" | "focus" | "leave" | "deadline";
  }[];
}
