import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { useState, useMemo } from "react";
import {
  Search,
  Filter,
  Plus,
  Grid,
  List,
  Eye,
  Trash2,
  Undo2,
  Sparkles,
  ArrowRight,
  RefreshCw,
  UserCheck,
  Building,
  CheckCircle,
  Briefcase,
  Layers,
  MapPin,
  Clock,
  Phone,
  Mail,
  MoreVertical,
  X,
  AlertCircle,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";
import {
  Employee,
  PresenceStatus,
  EmploymentType,
  DepartmentType,
  PodType,
} from "../types/employee";
import {
  EmployeeProfileCard,
  ExpandedProfileDrawer,
  TaskAssignmentModal,
  EmployeeSkeleton,
  EmployeeEmptyState,
  STATUS_COLORS,
} from "../components/employee-card";

export const Route = createFileRoute("/team")({
  component: TeamPage,
});

// Initial mock data following the Loooped PRD specifications (6 professional employees)
const INITIAL_EMPLOYEES: Employee[] = [
  {
    id: "emp-1",
    name: "Sandy M",
    avatar:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200",
    role: "Frontend Developer",
    employmentType: "Full Time",
    department: "Engineering",
    pod: "Pod Alpha",
    status: "Online",
    bio: "Frontend engineer focused on building pixel-perfect, highly fluid user experiences. Specialized in React, Tailwind, and high-performance layout engines.",
    bannerType: "gradient",
    bannerValue: "from-[#88A9F8] via-[#A48AF8] to-[#FF9B72]",
    location: "San Francisco, CA",
    workingHours: "9:00 AM - 5:00 PM PST",
    email: "sandy@loooped.co",
    phone: "+1 (415) 555-0182",
    productivity: {
      activeTasks: 3,
      projects: 2,
      loggedHours: 138,
      completionRate: 96,
    },
    currentActivity: {
      type: "working",
      title: "Optimizing glassmorphism CSS render loops",
      startTime: "9:15 AM",
    },
    currentAssignment: {
      client: "Northwind",
      project: "Agency OS",
      task: "Develop the Employee Identity System",
    },
    stats: {
      projects: 8,
      tasks: 124,
      completed: 112,
      approvals: 15,
      timeLogged: 840,
      experience: 2,
    },
    timeline: [
      {
        id: "t1",
        type: "completed",
        text: "Merged hotfix for dashboard panel scroll lags",
        timestamp: "1 hr ago",
      },
      {
        id: "t2",
        type: "status",
        text: "Changed presence status to Online",
        timestamp: "2 hrs ago",
      },
      {
        id: "t3",
        type: "commented",
        text: "Reviewed code for Northwind billing components",
        timestamp: "Yesterday",
      },
    ],
    calendarEvents: [
      { id: "c1", time: "10:30 AM", title: "Daily standup meeting", type: "meeting" },
      { id: "c2", time: "1:00 PM", title: "Refactoring focus block", type: "focus" },
      { id: "c3", time: "4:00 PM", title: "Review with Product Design", type: "meeting" },
    ],
  },
  {
    id: "emp-2",
    name: "Chloe Harrison",
    avatar:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200",
    role: "Lead Product Designer",
    employmentType: "Full Time",
    department: "Design",
    pod: "Pod Alpha",
    status: "Focus Time",
    bio: "UX Designer crafting systems instead of screens. Believer in simplicity, spacious visual rhythm, and elegant typographic pairing.",
    bannerType: "gradient",
    bannerValue: "from-[#A48AF8] via-[#F47D7D] to-[#F3D36B]",
    location: "London, UK",
    workingHours: "9:00 AM - 5:30 PM GMT",
    email: "chloe@loooped.co",
    phone: "+44 20 7946 0194",
    productivity: {
      activeTasks: 2,
      projects: 3,
      loggedHours: 145,
      completionRate: 98,
    },
    currentActivity: {
      type: "focus",
      title: "Refining high-fidelity agency portal concepts",
      startTime: "10:00 AM",
    },
    currentAssignment: {
      client: "Kite Motors",
      project: "Investor Portal",
      task: "Draft final typography & color system token tables",
    },
    stats: {
      projects: 14,
      tasks: 204,
      completed: 198,
      approvals: 34,
      timeLogged: 1450,
      experience: 4,
    },
    timeline: [
      {
        id: "t1",
        type: "approved",
        text: "Approved the micro-interaction animation specs",
        timestamp: "3 hrs ago",
      },
      {
        id: "t2",
        type: "completed",
        text: "Published the Loooped design token v1.2",
        timestamp: "Yesterday",
      },
      {
        id: "t3",
        type: "meeting",
        text: "Facilitated client alignment workshop",
        timestamp: "2 days ago",
      },
    ],
    calendarEvents: [
      { id: "c1", time: "11:00 AM", title: "Design sync - Pod Alpha", type: "meeting" },
      { id: "c2", time: "2:00 PM", title: "Design Sprint Focus Block", type: "focus" },
    ],
  },
  {
    id: "emp-3",
    name: "Kasun Dilanka",
    avatar:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200",
    role: "UX Researcher",
    employmentType: "Contract",
    department: "Design",
    pod: "Pod Beta",
    status: "Busy",
    bio: "Uncovering user pain points through structured qualitative insights. Dedicated to backing design decisions with rigorous user behavior telemetry.",
    bannerType: "illustration",
    bannerValue: "geometric",
    location: "Colombo, Sri Lanka",
    workingHours: "8:30 AM - 4:30 PM IST",
    email: "kasun@loooped.co",
    phone: "+94 11 234 5678",
    productivity: {
      activeTasks: 4,
      projects: 1,
      loggedHours: 92,
      completionRate: 90,
    },
    currentActivity: {
      type: "meeting",
      title: "Coordinating usability interviews",
      startTime: "11:30 AM",
    },
    currentAssignment: {
      client: "Aurora Coffee",
      project: "F&B Loyalty App",
      task: "Conducting user focus group testing rounds",
    },
    stats: {
      projects: 5,
      tasks: 82,
      completed: 72,
      approvals: 8,
      timeLogged: 420,
      experience: 1.5,
    },
    timeline: [
      {
        id: "t1",
        type: "completed",
        text: "Synthesized usability report for F&B app v2",
        timestamp: "4 hrs ago",
      },
      {
        id: "t2",
        type: "commented",
        text: "Shared notes on the customer feedback matrix",
        timestamp: "2 days ago",
      },
    ],
    calendarEvents: [
      { id: "c1", time: "9:00 AM", title: "Research alignment meeting", type: "meeting" },
      { id: "c2", time: "11:30 AM", title: "Usability testing interviews", type: "meeting" },
      { id: "c3", time: "3:30 PM", title: "Data synthesis focus block", type: "focus" },
    ],
  },
  {
    id: "emp-4",
    name: "Noah Thompson",
    avatar:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200",
    role: "Full-Stack Engineer",
    employmentType: "Full Time",
    department: "Engineering",
    pod: "Pod Beta",
    status: "In Meeting",
    bio: "Engineering clean, scalable microservices and database structures. Focused on backend durability, API design, and system architecture.",
    bannerType: "solid",
    bannerValue: "bg-teal-500",
    location: "Austin, TX",
    workingHours: "9:00 AM - 5:00 PM CST",
    email: "noah@loooped.co",
    phone: "+1 (512) 555-0199",
    productivity: {
      activeTasks: 5,
      projects: 2,
      loggedHours: 156,
      completionRate: 91,
    },
    currentActivity: {
      type: "meeting",
      title: "Backend architectural review board",
      startTime: "11:00 AM",
    },
    currentAssignment: {
      client: "Helix Health",
      project: "Core API",
      task: "Implement OAuth scopes & role permissions rules",
    },
    stats: {
      projects: 11,
      tasks: 194,
      completed: 178,
      approvals: 22,
      timeLogged: 1180,
      experience: 3.5,
    },
    timeline: [
      {
        id: "t1",
        type: "completed",
        text: "Configured PostgreSQL index tables for health routes",
        timestamp: "Yesterday",
      },
      {
        id: "t2",
        type: "commented",
        text: "Reviewed database schema file and migrations",
        timestamp: "2 days ago",
      },
    ],
    calendarEvents: [
      { id: "c1", time: "11:00 AM", title: "Architectural review panel", type: "meeting" },
      { id: "c2", time: "1:30 PM", title: "Security review sync", type: "meeting" },
      { id: "c3", time: "3:00 PM", title: "API integration focus", type: "focus" },
    ],
  },
  {
    id: "emp-5",
    name: "Alex Turner",
    avatar:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=200",
    role: "Creative Director",
    employmentType: "Consultant",
    department: "Design",
    pod: "General",
    status: "Away",
    bio: "Steering visual strategies and creative directions for global accounts. Dedicated to keeping brand aesthetics memorable and emotionally engaging.",
    bannerType: "ai",
    bannerValue:
      "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=250",
    location: "New York, NY",
    workingHours: "10:00 AM - 4:00 PM EST",
    email: "alex@loooped.co",
    phone: "+1 (212) 555-0158",
    productivity: {
      activeTasks: 1,
      projects: 4,
      loggedHours: 74,
      completionRate: 97,
    },
    currentActivity: {
      type: "break",
      title: "Out of office (Lunch sync)",
      startTime: "12:00 PM",
    },
    currentAssignment: {
      client: "Meridian",
      project: "Identity Rebrand",
      task: "Sign off on finalized design layouts",
    },
    stats: {
      projects: 22,
      tasks: 310,
      completed: 295,
      approvals: 72,
      timeLogged: 2450,
      experience: 7,
    },
    timeline: [
      {
        id: "t1",
        type: "approved",
        text: "Approved the global icon package for Meridian",
        timestamp: "Yesterday",
      },
      {
        id: "t2",
        type: "completed",
        text: "Facilitated weekly creative sync roundtable",
        timestamp: "3 days ago",
      },
    ],
    calendarEvents: [
      { id: "c1", time: "10:00 AM", title: "Creative direction sync", type: "meeting" },
      { id: "c2", time: "12:00 PM", title: "Lunch sync break", type: "leave" },
    ],
  },
  {
    id: "emp-6",
    name: "Maya Johnson",
    avatar:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=200",
    role: "Marketing Strategist",
    employmentType: "Freelancer",
    department: "Marketing",
    pod: "General",
    status: "Offline",
    bio: "Structuring targeted performance campaigns and data-driven client funnels. Specialist in search positioning, conversion rates, and ROI modeling.",
    bannerType: "company",
    bannerValue: "loooped-default",
    location: "Toronto, Canada",
    workingHours: "9:00 AM - 5:00 PM EST",
    email: "maya@loooped.co",
    phone: "+1 (416) 555-0131",
    productivity: {
      activeTasks: 0,
      projects: 1,
      loggedHours: 65,
      completionRate: 92,
    },
    currentAssignment: {
      client: "Loop FM",
      project: "Campaign Launch",
      task: "Auditing post-campaign performance tables",
    },
    stats: {
      projects: 4,
      tasks: 45,
      completed: 40,
      approvals: 5,
      timeLogged: 340,
      experience: 1.2,
    },
    timeline: [
      {
        id: "t1",
        type: "completed",
        text: "Delivered conversion analysis matrix tables",
        timestamp: "Yesterday",
      },
      {
        id: "t2",
        type: "commented",
        text: "Shared notes on PPC channel optimizations",
        timestamp: "4 days ago",
      },
    ],
    calendarEvents: [],
  },
];

export function TeamPage() {
  // --- Core States ---
  const [employees, setEmployees] = useState<Employee[]>(INITIAL_EMPLOYEES);
  const [archivedEmployees, setArchivedEmployees] = useState<Employee[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [sizeFilter, setSizeFilter] = useState<"XS" | "Small" | "Medium" | "Large">("Large");

  // Filtering States
  const [deptFilter, setDeptFilter] = useState<string>("All");
  const [podFilter, setPodFilter] = useState<string>("All");
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [empTypeFilter, setEmpTypeFilter] = useState<string>("All");

  // Interaction / Drawer states
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [assignTargetEmployee, setAssignTargetEmployee] = useState<Employee | null>(null);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);

  // CRUD Forms States
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [employeeToEdit, setEmployeeToEdit] = useState<Employee | null>(null);
  const [deleteConfirmationEmployee, setDeleteConfirmationEmployee] = useState<Employee | null>(
    null,
  );

  // New Employee Form State (Create)
  const [newEmpName, setNewEmpName] = useState("");
  const [newEmpRole, setNewEmpRole] = useState("");
  const [newEmpDept, setNewEmpDept] = useState<DepartmentType>("Engineering");
  const [newEmpPod, setNewEmpPod] = useState<PodType>("Pod Alpha");
  const [newEmpType, setNewEmpType] = useState<EmploymentType>("Full Time");
  const [newEmpStatus, setNewEmpStatus] = useState<PresenceStatus>("Online");
  const [newEmpBio, setNewEmpBio] = useState("");
  const [newEmpLocation, setNewEmpLocation] = useState("San Francisco, CA");
  const [newEmpEmail, setNewEmpEmail] = useState("");
  const [newEmpPhone, setNewEmpPhone] = useState("");
  const [newEmpBanner, setNewEmpBanner] = useState<
    "gradient" | "illustration" | "solid" | "ai" | "company"
  >("gradient");
  const [newEmpBannerValue, setNewEmpBannerValue] = useState(
    "from-[#88A9F8] via-[#A48AF8] to-[#FF9B72]",
  );

  // Drawer / Side view of Archived teammates
  const [isArchivedDrawerOpen, setIsArchivedDrawerOpen] = useState(false);

  // --- Interactive Employee User Journey Simulator States ---
  // Guides the user through a realistic Microsoft Teams-inspired lifecycle sequence.
  const [simulatorStep, setSimulatorStep] = useState(0);
  const [simulatorLogs, setSimulatorLogs] = useState<string[]>([
    "Simulator initialized. Ready for journey. ",
  ]);

  const journeySteps = [
    {
      title: "1. Shift Start Check-in",
      desc: "Sandy M reports for her shift. Her presence status transitions from 'Offline' to 'Online' available, and a log entry is written.",
      action: () => {
        setEmployees((prev) =>
          prev.map((emp) =>
            emp.id === "emp-1"
              ? {
                  ...emp,
                  status: "Online",
                  currentActivity: {
                    type: "working",
                    title: "Logging into Loooped workspace & checking logs",
                    startTime: "9:00 AM",
                  },
                  timeline: [
                    {
                      id: "tsim-" + Date.now(),
                      type: "status",
                      text: "Clocked in & changed status to Online",
                      timestamp: "Just now",
                    },
                    ...emp.timeline,
                  ],
                }
              : emp,
          ),
        );
        addSimLog("Sandy M changed status to 'Online'. Activity: 'Logging into workspace'.");
        toast.success("Sandy M is now Online!");
      },
    },
    {
      title: "2. Launch Focus Sprint block",
      desc: "Sandy starts a highly dedicated sprint block to code layouts. Her status changes to 'Focus Time' (minimizing disruptions).",
      action: () => {
        setEmployees((prev) =>
          prev.map((emp) =>
            emp.id === "emp-1"
              ? {
                  ...emp,
                  status: "Focus Time",
                  currentActivity: {
                    type: "focus",
                    title: "Coding fluid glassmorphic cards in React",
                    startTime: "10:15 AM",
                  },
                  timeline: [
                    {
                      id: "tsim-" + Date.now(),
                      type: "status",
                      text: "Started Focus Sprint block",
                      timestamp: "Just now",
                    },
                    ...emp.timeline,
                  ],
                }
              : emp,
          ),
        );
        addSimLog("Sandy M changed status to 'Focus Time'. Activity: 'Coding glassmorphic cards'.");
        toast.info("Sandy M entered Focus Time.");
      },
    },
    {
      title: "3. Calendar Sync Trigger",
      desc: "An automated calendar sync begins. Sandy starts co-presenting. Her presence turns into 'In Meeting' (Microsoft Teams style).",
      action: () => {
        setEmployees((prev) =>
          prev.map((emp) =>
            emp.id === "emp-1"
              ? {
                  ...emp,
                  status: "In Meeting",
                  currentActivity: {
                    type: "meeting",
                    title: "Client Alignment Sync: Helix Health v2 Layouts",
                    startTime: "1:30 PM",
                  },
                  timeline: [
                    {
                      id: "tsim-" + Date.now(),
                      type: "meeting",
                      text: "Joined meeting: Helix Health Align Sync",
                      timestamp: "Just now",
                    },
                    ...emp.timeline,
                  ],
                }
              : emp,
          ),
        );
        addSimLog(
          "Sandy M status synchronized to 'In Meeting'. Activity: 'Client Alignment Sync'.",
        );
        toast.success("Sandy M calendar synced to 'In Meeting'.");
      },
    },
    {
      title: "4. Trigger Delegation Warning",
      desc: "A manager attempts to assign a task while Sandy is busy. The assignment modal highlights Sandy's engaged status, warning the manager.",
      action: () => {
        const sandy = employees.find((e) => e.id === "emp-1");
        if (sandy) {
          setAssignTargetEmployee(sandy);
          setIsAssignModalOpen(true);
          addSimLog("Manager opened Task Assignment. Status Warning triggered on busy teammate.");
          toast.warning("Status Warning: Sandy is currently busy.");
        }
      },
    },
    {
      title: "5. Clock Out",
      desc: "Sandy's workday ends. She logs off the workspace, and her profile transitions to 'Offline' gracefully.",
      action: () => {
        setEmployees((prev) =>
          prev.map((emp) =>
            emp.id === "emp-1"
              ? {
                  ...emp,
                  status: "Offline",
                  currentActivity: undefined,
                  timeline: [
                    {
                      id: "tsim-" + Date.now(),
                      type: "status",
                      text: "Clocked out for the day",
                      timestamp: "Just now",
                    },
                    ...emp.timeline,
                  ],
                }
              : emp,
          ),
        );
        addSimLog("Sandy M clocked out. Status set to 'Offline'.");
        toast.success("Sandy M clocked out.");
      },
    },
  ];

  const addSimLog = (log: string) => {
    const time = new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
    setSimulatorLogs((prev) => [`[${time}] ${log}`, ...prev.slice(0, 7)]);
  };

  const handleSimulatorStep = (stepIdx: number) => {
    setSimulatorStep(stepIdx);
    journeySteps[stepIdx].action();
  };

  const resetSimulator = () => {
    setSimulatorStep(0);
    setEmployees((prev) =>
      prev.map((emp) => (emp.id === "emp-1" ? { ...INITIAL_EMPLOYEES[0] } : emp)),
    );
    setSimulatorLogs(["Simulator reset. Sandy M profile restored to baseline."]);
    toast.info("Simulator reset!");
  };

  // --- Search and Filtering Logic ---
  const filteredEmployees = useMemo(() => {
    return employees.filter((emp) => {
      // 1. Search Query
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        emp.name.toLowerCase().includes(q) ||
        emp.role.toLowerCase().includes(q) ||
        emp.department.toLowerCase().includes(q) ||
        emp.pod.toLowerCase().includes(q) ||
        emp.location.toLowerCase().includes(q);

      if (!matchesSearch) return false;

      // 2. Department
      if (deptFilter !== "All" && emp.department !== deptFilter) return false;

      // 3. Pod
      if (podFilter !== "All" && emp.pod !== podFilter) return false;

      // 4. Status
      if (statusFilter !== "All" && emp.status !== statusFilter) return false;

      // 5. Employment Type
      if (empTypeFilter !== "All" && emp.employmentType !== empTypeFilter) return false;

      return true;
    });
  }, [employees, searchQuery, deptFilter, podFilter, statusFilter, empTypeFilter]);

  const handleResetFilters = () => {
    setSearchQuery("");
    setDeptFilter("All");
    setPodFilter("All");
    setStatusFilter("All");
    setEmpTypeFilter("All");
    toast.info("Filters cleared");
  };

  // --- CRUD Action Handlers ---
  const handleCreateEmployee = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmpName.trim() || !newEmpRole.trim() || !newEmpEmail.trim()) {
      toast.error("Please fill in Name, Role, and Email credentials");
      return;
    }

    const newEmp: Employee = {
      id: "emp-" + Date.now(),
      name: newEmpName,
      avatar:
        "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=200", // Standard avatar
      role: newEmpRole,
      employmentType: newEmpType,
      department: newEmpDept,
      pod: newEmpPod,
      status: newEmpStatus,
      bio: newEmpBio || "Digital identity card for Loooped teammate.",
      bannerType: newEmpBanner,
      bannerValue: newEmpBannerValue,
      location: newEmpLocation,
      workingHours: "9:00 AM - 5:00 PM EST",
      email: newEmpEmail,
      phone: newEmpPhone || "+1 (555) 012-3456",
      productivity: {
        activeTasks: 0,
        projects: 1,
        loggedHours: 0,
        completionRate: 100,
      },
      stats: {
        projects: 1,
        tasks: 0,
        completed: 0,
        approvals: 0,
        timeLogged: 0,
        experience: 0.5,
      },
      timeline: [
        {
          id: "t-" + Date.now(),
          type: "status",
          text: "Joined Loooped Workspace",
          timestamp: "Just now",
        },
      ],
      calendarEvents: [],
    };

    setEmployees((prev) => [newEmp, ...prev]);
    setIsCreateModalOpen(false);

    // Reset Form
    setNewEmpName("");
    setNewEmpRole("");
    setNewEmpBio("");
    setNewEmpEmail("");
    setNewEmpPhone("");

    toast.success(`Welcome, ${newEmpName}! Profile created successfully.`);
  };

  const handleUpdateEmployee = (e: React.FormEvent) => {
    e.preventDefault();
    if (!employeeToEdit) return;

    setEmployees((prev) =>
      prev.map((emp) => (emp.id === employeeToEdit.id ? { ...employeeToEdit } : emp)),
    );
    setIsEditModalOpen(false);
    setEmployeeToEdit(null);
    toast.success("Teammate profile updated successfully!");
  };

  const handleSoftDeleteRequest = (emp: Employee) => {
    setDeleteConfirmationEmployee(emp);
  };

  const handleConfirmSoftDelete = () => {
    if (!deleteConfirmationEmployee) return;

    // Remove from active list, add to archived list
    setEmployees((prev) => prev.filter((emp) => emp.id !== deleteConfirmationEmployee.id));
    setArchivedEmployees((prev) => [deleteConfirmationEmployee, ...prev]);

    toast.success(`Profile for ${deleteConfirmationEmployee.name} soft-deleted (archived)`);
    setDeleteConfirmationEmployee(null);
  };

  const handleRestoreEmployee = (emp: Employee) => {
    setArchivedEmployees((prev) => prev.filter((e) => e.id !== emp.id));
    setEmployees((prev) => [emp, ...prev]);
    toast.success(`Profile for ${emp.name} restored to Directory!`);
  };

  const handleAssignTaskConfirm = (
    emp: Employee,
    task: string,
    client: string,
    project: string,
  ) => {
    setEmployees((prev) =>
      prev.map((e) =>
        e.id === emp.id
          ? {
              ...e,
              productivity: {
                ...e.productivity,
                activeTasks: e.productivity.activeTasks + 1,
              },
              currentAssignment: { client, project, task },
              timeline: [
                {
                  id: "tas-" + Date.now(),
                  type: "commented",
                  text: `Assigned new task: ${task} (${client})`,
                  timestamp: "Just now",
                },
                ...e.timeline,
              ],
            }
          : e,
      ),
    );
    toast.success(`Assigned deliverable: "${task}" to ${emp.name}`);
  };

  return (
    <AppShell breadcrumb={["Workspace", "Team"]}>
      <div className="flex flex-col gap-6">
        {/* SECTION A: Header Stats & Actions */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div>
            <h1 className="text-2xl sm:text-[30px] font-semibold tracking-tight text-slate-800 dark:text-slate-100">
              Team Directory
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-normal">
              {employees.length} Active Profiles · {archivedEmployees.length} Archived (Soft
              Deleted) Teammates
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
            {/* Soft Delete Archive Drawer trigger */}
            {archivedEmployees.length > 0 && (
              <button
                onClick={() => setIsArchivedDrawerOpen(true)}
                className="h-10 px-4 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Trash2 className="w-4 h-4 text-slate-400" />
                <span>Archived Tray ({archivedEmployees.length})</span>
              </button>
            )}

            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="h-10 px-4 rounded-xl bg-[#5A82E8] hover:bg-[#5A82E8]/95 text-white text-xs font-medium flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer w-full sm:w-auto"
            >
              <Plus className="w-4 h-4" /> Add Teammate
            </button>
          </div>
        </div>

        {/* SECTION B: User Journey Simulator */}
        <div className="bg-white/45 dark:bg-[#121926]/45 backdrop-blur-md rounded-[28px] border border-white/20 dark:border-white/10 p-5 shadow-sm">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Steps panel */}
            <div className="flex-1 space-y-3">
              <div className="flex items-center gap-2 text-[#5A82E8] font-medium text-sm">
                <Sparkles className="w-4.5 h-4.5" />
                <span>Interactive Teammate User Journey (PRD)</span>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed font-normal">
                Trigger real-time state changes on Sandy M's Profile Card below using standard
                Teams-inspired shift phases.
              </p>

              <div className="flex flex-wrap gap-2 pt-1">
                {journeySteps.map((step, idx) => {
                  const isActive = simulatorStep === idx;
                  return (
                    <button
                      key={step.title}
                      onClick={() => handleSimulatorStep(idx)}
                      className={`h-8.5 px-3.5 rounded-xl text-xs font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
                        isActive
                          ? "bg-[#5A82E8] text-white"
                          : "bg-slate-50 hover:bg-slate-100 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200/40 dark:border-slate-800/40"
                      }`}
                    >
                      {step.title}
                    </button>
                  );
                })}
                <button
                  onClick={resetSimulator}
                  title="Reset Journey State"
                  className="h-8.5 w-8.5 rounded-xl bg-slate-50 hover:bg-slate-100 dark:bg-slate-900 dark:hover:bg-slate-800 border border-slate-200/40 dark:border-slate-800/40 flex items-center justify-center cursor-pointer text-slate-400 hover:text-slate-700"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="p-3 bg-slate-50/50 dark:bg-slate-900/30 border border-slate-100/50 dark:border-slate-800/40 rounded-2xl text-xs">
                <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider block mb-1">
                  Step details
                </span>
                <p className="text-slate-600 dark:text-slate-300 leading-normal font-normal">
                  {journeySteps[simulatorStep]?.desc}
                </p>
              </div>
            </div>

            {/* Logs timeline */}
            <div className="w-full md:w-[220px] shrink-0 border-t md:border-t-0 md:border-l border-slate-100 dark:border-slate-800/60 pt-4 md:pt-0 md:pl-5 flex flex-col justify-between">
              <div>
                <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider block mb-2">
                  Simulation Logs
                </span>
                <div className="space-y-1.5 overflow-hidden">
                  {simulatorLogs.map((log, index) => (
                    <div
                      key={index}
                      className="text-[10px] text-slate-400 dark:text-slate-500 font-mono truncate leading-tight"
                    >
                      {log}
                    </div>
                  ))}
                </div>
              </div>
              <div className="text-[10px] text-slate-400 font-normal flex items-center gap-1 mt-3">
                <CheckCircle className="w-3 h-3 text-emerald-500 shrink-0" /> No skills or capacity
                trackers shown.
              </div>
            </div>
          </div>
        </div>

        {/* SECTION C: Search, Filters, and Layout Toggle */}
        <div className="bg-card border border-border rounded-[28px] p-5 shadow-[var(--shadow-soft)] flex flex-col gap-4">
          <div className="flex flex-col lg:flex-row gap-3">
            {/* Live Search */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search teammates by Name, Role, Location or Department..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-10 pl-10 pr-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200/40 dark:border-slate-800/40 text-xs focus:outline-none transition-all"
              />
            </div>

            {/* Size selection */}
            <div className="flex items-center gap-1 bg-slate-50 dark:bg-slate-900 border border-slate-200/40 dark:border-slate-800/40 rounded-xl p-1 shrink-0 self-start lg:self-auto">
              {(["XS", "Small", "Medium", "Large"] as const).map((sz) => (
                <button
                  key={sz}
                  onClick={() => setSizeFilter(sz)}
                  className={`h-8.5 px-3.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                    sizeFilter === sz
                      ? "bg-white dark:bg-[#121927] text-slate-800 dark:text-white shadow-xs"
                      : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                  }`}
                >
                  {sz}
                </button>
              ))}
            </div>
          </div>

          {/* Collapsible Filter Panel */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
            {/* Department */}
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-medium text-slate-400">Department</label>
              <select
                value={deptFilter}
                onChange={(e) => setDeptFilter(e.target.value)}
                className="w-full h-8.5 px-2 bg-slate-50 dark:bg-slate-900 border border-slate-200/30 dark:border-slate-800/30 rounded-xl text-xs focus:outline-none text-slate-600 dark:text-slate-300"
              >
                <option value="All">All Departments</option>
                <option value="Engineering">Engineering</option>
                <option value="Design">Design</option>
                <option value="Marketing">Marketing</option>
                <option value="Sales">Sales</option>
                <option value="HR">HR</option>
              </select>
            </div>

            {/* Pod */}
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-medium text-slate-400">Pod Code</label>
              <select
                value={podFilter}
                onChange={(e) => setPodFilter(e.target.value)}
                className="w-full h-8.5 px-2 bg-slate-50 dark:bg-slate-900 border border-slate-200/30 dark:border-slate-800/30 rounded-xl text-xs focus:outline-none text-slate-600 dark:text-slate-300"
              >
                <option value="All">All Pods</option>
                <option value="Pod Alpha">Pod Alpha</option>
                <option value="Pod Beta">Pod Beta</option>
                <option value="Ops">Ops</option>
                <option value="General">General</option>
              </select>
            </div>

            {/* Presence Status */}
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-medium text-slate-400">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full h-8.5 px-2 bg-slate-50 dark:bg-slate-900 border border-slate-200/30 dark:border-slate-800/30 rounded-xl text-xs focus:outline-none text-slate-600 dark:text-slate-300"
              >
                <option value="All">All Statuses</option>
                <option value="Online">Online</option>
                <option value="Busy">Busy</option>
                <option value="In Meeting">In Meeting</option>
                <option value="Focus Time">Focus Time</option>
                <option value="Away">Away</option>
                <option value="Offline">Offline</option>
                <option value="Do Not Disturb">Do Not Disturb</option>
              </select>
            </div>

            {/* Employment Type */}
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-medium text-slate-400">Employment</label>
              <select
                value={empTypeFilter}
                onChange={(e) => setEmpTypeFilter(e.target.value)}
                className="w-full h-8.5 px-2 bg-slate-50 dark:bg-slate-900 border border-slate-200/30 dark:border-slate-800/30 rounded-xl text-xs focus:outline-none text-slate-600 dark:text-slate-300"
              >
                <option value="All">All Types</option>
                <option value="Full Time">Full Time</option>
                <option value="Intern">Intern</option>
                <option value="Contract">Contract</option>
                <option value="Freelancer">Freelancer</option>
                <option value="Consultant">Consultant</option>
              </select>
            </div>
          </div>
        </div>

        {/* SECTION D: Directory Card Grid */}
        <AnimatePresence mode="popLayout">
          {filteredEmployees.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
            >
              <EmployeeEmptyState onReset={handleResetFilters} />
            </motion.div>
          ) : (
            <motion.div
              layout
              className={`grid gap-4 ${
                sizeFilter === "XS"
                  ? "flex flex-wrap gap-2.5 bg-card border border-border p-5 rounded-[28px]"
                  : sizeFilter === "Small"
                    ? "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6"
                    : sizeFilter === "Medium"
                      ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                      : "grid-cols-1 sm:grid-cols-2 xl:grid-cols-3"
              }`}
            >
              {filteredEmployees.map((emp) => (
                <motion.div
                  key={emp.id}
                  layout
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.2 }}
                >
                  <EmployeeProfileCard
                    employee={emp}
                    size={sizeFilter}
                    onClick={() => {
                      setSelectedEmployee(emp);
                      setIsDrawerOpen(true);
                    }}
                    onAssignWork={(assignedEmp) => {
                      setAssignTargetEmployee(assignedEmp);
                      setIsAssignModalOpen(true);
                    }}
                    onMessage={(msgEmp) => {
                      toast.success(`Opening direct messages with ${msgEmp.name}`);
                    }}
                    onViewProfile={(viewEmp) => {
                      setSelectedEmployee(viewEmp);
                      setIsDrawerOpen(true);
                    }}
                    onDeleteRequest={handleSoftDeleteRequest}
                    onEditRequest={(editEmp) => {
                      setEmployeeToEdit({ ...editEmp });
                      setIsEditModalOpen(true);
                    }}
                  />
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* --- REUSABLE POPUPS & DRAWERS --- */}

      {/* 1. Large Detailed Drawer View */}
      <ExpandedProfileDrawer
        employee={selectedEmployee}
        isOpen={isDrawerOpen}
        onClose={() => {
          setIsDrawerOpen(false);
          setSelectedEmployee(null);
        }}
        onAssignWork={(emp) => {
          setAssignTargetEmployee(emp);
          setIsAssignModalOpen(true);
        }}
        onMessage={(emp) => {
          toast.success(`Opening chat with ${emp.name}`);
        }}
      />

      {/* 2. Assign Deliverable Modal */}
      <TaskAssignmentModal
        employee={assignTargetEmployee}
        isOpen={isAssignModalOpen}
        onClose={() => {
          setIsAssignModalOpen(false);
          setAssignTargetEmployee(null);
        }}
        onConfirm={handleAssignTaskConfirm}
      />

      {/* 3. Create Teammate Modal */}
      <AnimatePresence>
        {isCreateModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCreateModalOpen(false)}
              className="absolute inset-0 bg-black/50 backdrop-blur-xs"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-white dark:bg-[#121927] border border-slate-200 dark:border-slate-800 p-6 rounded-[28px] shadow-2xl relative w-full max-w-[480px] max-h-[85vh] overflow-y-auto z-50 text-left font-normal"
            >
              <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100 dark:border-slate-800/40">
                <h3 className="text-base font-medium text-slate-800 dark:text-slate-100">
                  Add Teammate
                </h3>
                <button
                  onClick={() => setIsCreateModalOpen(false)}
                  className="p-1.5 rounded-full hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-400"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleCreateEmployee} className="space-y-4">
                <div className="grid grid-cols-2 gap-3.5">
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-medium text-slate-400">
                      Full Name
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Rachel Adams"
                      value={newEmpName}
                      onChange={(e) => setNewEmpName(e.target.value)}
                      className="w-full h-9 px-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-medium text-slate-400">
                      Role / Designation
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Backend Lead"
                      value={newEmpRole}
                      onChange={(e) => setNewEmpRole(e.target.value)}
                      className="w-full h-9 px-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-medium text-slate-400">
                      Department
                    </label>
                    <select
                      value={newEmpDept}
                      onChange={(e) => setNewEmpDept(e.target.value as DepartmentType)}
                      className="w-full h-9 px-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none text-slate-600 dark:text-slate-300"
                    >
                      <option value="Engineering">Engineering</option>
                      <option value="Design">Design</option>
                      <option value="Marketing">Marketing</option>
                      <option value="Sales">Sales</option>
                      <option value="HR">HR</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-medium text-slate-400">
                      Pod Code
                    </label>
                    <select
                      value={newEmpPod}
                      onChange={(e) => setNewEmpPod(e.target.value as PodType)}
                      className="w-full h-9 px-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none text-slate-600 dark:text-slate-300"
                    >
                      <option value="Pod Alpha">Pod Alpha</option>
                      <option value="Pod Beta">Pod Beta</option>
                      <option value="Ops">Ops</option>
                      <option value="General">General</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-medium text-slate-400">
                      Employment
                    </label>
                    <select
                      value={newEmpType}
                      onChange={(e) => setNewEmpType(e.target.value as EmploymentType)}
                      className="w-full h-9 px-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none text-slate-600 dark:text-slate-300"
                    >
                      <option value="Full Time">Full Time</option>
                      <option value="Intern">Intern</option>
                      <option value="Contract">Contract</option>
                      <option value="Freelancer">Freelancer</option>
                      <option value="Consultant">Consultant</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3.5">
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-medium text-slate-400">
                      Presence Status
                    </label>
                    <select
                      value={newEmpStatus}
                      onChange={(e) => setNewEmpStatus(e.target.value as PresenceStatus)}
                      className="w-full h-9 px-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none text-slate-600 dark:text-slate-300"
                    >
                      <option value="Online">Online</option>
                      <option value="Busy">Busy</option>
                      <option value="In Meeting">In Meeting</option>
                      <option value="Focus Time">Focus Time</option>
                      <option value="Away">Away</option>
                      <option value="Offline">Offline</option>
                      <option value="Do Not Disturb">Do Not Disturb</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-medium text-slate-400">
                      Coordinates / Location
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. San Jose, CA"
                      value={newEmpLocation}
                      onChange={(e) => setNewEmpLocation(e.target.value)}
                      className="w-full h-9 px-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3.5">
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-medium text-slate-400">
                      Email Address
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="e.g. rachel@loooped.co"
                      value={newEmpEmail}
                      onChange={(e) => setNewEmpEmail(e.target.value)}
                      className="w-full h-9 px-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-medium text-slate-400">
                      Phone
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. +1 (408) 555-0100"
                      value={newEmpPhone}
                      onChange={(e) => setNewEmpPhone(e.target.value)}
                      className="w-full h-9 px-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-medium text-slate-400">
                    Professional Bio
                  </label>
                  <textarea
                    placeholder="Short summary of background & focus..."
                    value={newEmpBio}
                    onChange={(e) => setNewEmpBio(e.target.value)}
                    rows={2}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3.5">
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-medium text-slate-400">
                      Banner theme
                    </label>
                    <select
                      value={newEmpBanner}
                      onChange={(e) => {
                        const val = e.target.value as
                          "gradient" | "illustration" | "solid" | "ai" | "company";
                        setNewEmpBanner(val);
                        if (val === "solid") setNewEmpBannerValue("bg-slate-500");
                        if (val === "gradient") setNewEmpBannerValue("from-sky-400 to-indigo-500");
                        if (val === "illustration") setNewEmpBannerValue("geometric");
                        if (val === "ai")
                          setNewEmpBannerValue(
                            "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=250",
                          );
                        if (val === "company") setNewEmpBannerValue("loooped-default");
                      }}
                      className="w-full h-9 px-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none text-slate-600 dark:text-slate-300"
                    >
                      <option value="gradient">Gradient theme</option>
                      <option value="solid">Solid color</option>
                      <option value="illustration">Geometric backdrop</option>
                      <option value="company">Loooped Branding</option>
                    </select>
                  </div>
                  {newEmpBanner === "solid" && (
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-medium text-slate-400">
                        Banner color
                      </label>
                      <select
                        value={newEmpBannerValue}
                        onChange={(e) => setNewEmpBannerValue(e.target.value)}
                        className="w-full h-9 px-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none text-slate-600 dark:text-slate-300"
                      >
                        <option value="bg-indigo-500">Indigo slate</option>
                        <option value="bg-teal-500">Teal pine</option>
                        <option value="bg-amber-500">Amber solar</option>
                        <option value="bg-rose-500">Rose bloom</option>
                        <option value="bg-slate-700">Slate dark</option>
                      </select>
                    </div>
                  )}
                  {newEmpBanner === "gradient" && (
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-medium text-slate-400">
                        Banner gradient
                      </label>
                      <select
                        value={newEmpBannerValue}
                        onChange={(e) => setNewEmpBannerValue(e.target.value)}
                        className="w-full h-9 px-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none text-slate-600 dark:text-slate-300"
                      >
                        <option value="from-sky-400 to-indigo-500">Sky and Indigo</option>
                        <option value="from-emerald-400 to-teal-600">Emerald Pine</option>
                        <option value="from-amber-300 to-rose-500">Sunset Solar</option>
                        <option value="from-[#88A9F8] via-[#A48AF8] to-[#FF9B72]">
                          Cosmic Slate (Loooped)
                        </option>
                      </select>
                    </div>
                  )}
                </div>

                <div className="flex gap-2.5 mt-6 pt-4 border-t border-slate-100 dark:border-slate-800/40">
                  <button
                    type="button"
                    onClick={() => setIsCreateModalOpen(false)}
                    className="flex-1 h-9.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900 transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 h-9.5 rounded-xl bg-[#5A82E8] hover:opacity-95 text-white text-xs font-medium transition-all cursor-pointer"
                  >
                    Confirm Credentials
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 4. Edit Teammate (Update Form) in Drawer Container */}
      <AnimatePresence>
        {isEditModalOpen && employeeToEdit && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setIsEditModalOpen(false);
                setEmployeeToEdit(null);
              }}
              className="absolute inset-0 bg-black/50 backdrop-blur-xs"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-white dark:bg-[#121927] border border-slate-200 dark:border-slate-800 p-6 rounded-[28px] shadow-2xl relative w-full max-w-[480px] max-h-[85vh] overflow-y-auto z-50 text-left font-normal"
            >
              <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100 dark:border-slate-800/40">
                <div>
                  <h3 className="text-base font-medium text-slate-800 dark:text-slate-100">
                    Edit Teammate Settings
                  </h3>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    Edit credentials, role allocations, or custom details
                  </p>
                </div>
                <button
                  onClick={() => {
                    setIsEditModalOpen(false);
                    setEmployeeToEdit(null);
                  }}
                  className="p-1.5 rounded-full hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-400"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleUpdateEmployee} className="space-y-4">
                {/* 4a. Employee Level Editable Sections */}
                <div className="p-3 bg-slate-50/50 dark:bg-slate-900/30 border border-slate-100/40 dark:border-slate-800/40 rounded-2xl space-y-3">
                  <span className="text-[10px] text-[#5A82E8] font-medium uppercase tracking-wider block">
                    Employee Credentials (Self Editable)
                  </span>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-medium text-slate-400">
                        Presence Status
                      </label>
                      <select
                        value={employeeToEdit.status}
                        onChange={(e) =>
                          setEmployeeToEdit({
                            ...employeeToEdit,
                            status: e.target.value as PresenceStatus,
                          })
                        }
                        className="w-full h-8.5 px-2 bg-white dark:bg-[#121927] border border-slate-200 dark:border-slate-800 rounded-lg text-xs text-slate-600 dark:text-slate-300"
                      >
                        <option value="Online">Online</option>
                        <option value="Busy">Busy</option>
                        <option value="In Meeting">In Meeting</option>
                        <option value="Focus Time">Focus Time</option>
                        <option value="Away">Away</option>
                        <option value="Offline">Offline</option>
                        <option value="Do Not Disturb">Do Not Disturb</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-medium text-slate-400">
                        Working hours
                      </label>
                      <input
                        type="text"
                        value={employeeToEdit.workingHours}
                        onChange={(e) =>
                          setEmployeeToEdit({ ...employeeToEdit, workingHours: e.target.value })
                        }
                        className="w-full h-8.5 px-3 bg-white dark:bg-[#121927] border border-slate-200 dark:border-slate-800 rounded-lg text-xs"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-medium text-slate-400">
                      Professional Bio
                    </label>
                    <textarea
                      value={employeeToEdit.bio}
                      onChange={(e) =>
                        setEmployeeToEdit({ ...employeeToEdit, bio: e.target.value })
                      }
                      rows={2}
                      className="w-full p-2.5 bg-white dark:bg-[#121927] border border-slate-200 dark:border-slate-800 rounded-lg text-xs resize-none focus:outline-none"
                    />
                  </div>
                </div>

                {/* 4b. Manager Level Editable Sections */}
                <div className="p-3 bg-slate-50/50 dark:bg-slate-900/30 border border-slate-100/40 dark:border-slate-800/40 rounded-2xl space-y-3">
                  <span className="text-[10px] text-amber-500 font-medium uppercase tracking-wider block flex items-center gap-1">
                    <Lock className="w-3 h-3 shrink-0" /> Manager Settings (Admin Restricted)
                  </span>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-medium text-slate-400">
                        Role / Title
                      </label>
                      <input
                        type="text"
                        value={employeeToEdit.role}
                        onChange={(e) =>
                          setEmployeeToEdit({ ...employeeToEdit, role: e.target.value })
                        }
                        className="w-full h-8.5 px-3 bg-white dark:bg-[#121927] border border-slate-200 dark:border-slate-800 rounded-lg text-xs"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-medium text-slate-400">
                        Coordinates / Location
                      </label>
                      <input
                        type="text"
                        value={employeeToEdit.location}
                        onChange={(e) =>
                          setEmployeeToEdit({ ...employeeToEdit, location: e.target.value })
                        }
                        className="w-full h-8.5 px-3 bg-white dark:bg-[#121927] border border-slate-200 dark:border-slate-800 rounded-lg text-xs"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2.5">
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-medium text-slate-400">
                        Department
                      </label>
                      <select
                        value={employeeToEdit.department}
                        onChange={(e) =>
                          setEmployeeToEdit({
                            ...employeeToEdit,
                            department: e.target.value as DepartmentType,
                          })
                        }
                        className="w-full h-8.5 px-2 bg-white dark:bg-[#121927] border border-slate-200 dark:border-slate-800 rounded-lg text-xs text-slate-600 dark:text-slate-300"
                      >
                        <option value="Engineering">Engineering</option>
                        <option value="Design">Design</option>
                        <option value="Marketing">Marketing</option>
                        <option value="Sales">Sales</option>
                        <option value="HR">HR</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-medium text-slate-400">
                        Pod Code
                      </label>
                      <select
                        value={employeeToEdit.pod}
                        onChange={(e) =>
                          setEmployeeToEdit({ ...employeeToEdit, pod: e.target.value as PodType })
                        }
                        className="w-full h-8.5 px-2 bg-white dark:bg-[#121927] border border-slate-200 dark:border-slate-800 rounded-lg text-xs text-slate-600 dark:text-slate-300"
                      >
                        <option value="Pod Alpha">Pod Alpha</option>
                        <option value="Pod Beta">Pod Beta</option>
                        <option value="Ops">Ops</option>
                        <option value="General">General</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-medium text-slate-400">
                        Employment
                      </label>
                      <select
                        value={employeeToEdit.employmentType}
                        onChange={(e) =>
                          setEmployeeToEdit({
                            ...employeeToEdit,
                            employmentType: e.target.value as EmploymentType,
                          })
                        }
                        className="w-full h-8.5 px-2 bg-white dark:bg-[#121927] border border-slate-200 dark:border-slate-800 rounded-lg text-xs text-slate-600 dark:text-slate-300"
                      >
                        <option value="Full Time">Full Time</option>
                        <option value="Intern">Intern</option>
                        <option value="Contract">Contract</option>
                        <option value="Freelancer">Freelancer</option>
                        <option value="Consultant">Consultant</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2.5 mt-6 pt-4 border-t border-slate-100 dark:border-slate-800/40">
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditModalOpen(false);
                      setEmployeeToEdit(null);
                    }}
                    className="flex-1 h-9.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900 transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 h-9.5 rounded-xl bg-[#5A82E8] hover:opacity-95 text-white text-xs font-medium transition-all cursor-pointer"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 5. Soft Delete Validation Prompt (Archive Confirmation Modal) */}
      <AnimatePresence>
        {deleteConfirmationEmployee && (
          <div className="fixed inset-0 z-55 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setDeleteConfirmationEmployee(null)}
              className="absolute inset-0 bg-black/55 backdrop-blur-xs"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-white dark:bg-[#121927] border border-slate-200 dark:border-slate-800 p-6 rounded-[28px] shadow-2xl relative w-full max-w-[380px] z-55 text-center font-normal"
            >
              <div className="w-12 h-12 rounded-full bg-red-50 dark:bg-red-950/20 text-red-500 flex items-center justify-center mx-auto mb-3">
                <Trash2 className="w-5 h-5" />
              </div>
              <h3 className="text-base font-medium text-slate-800 dark:text-slate-100">
                Archive Employee?
              </h3>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-2 leading-relaxed font-normal">
                Are you sure you want to archive{" "}
                <span className="font-medium text-slate-600 dark:text-slate-300">
                  {deleteConfirmationEmployee.name}
                </span>
                ? This will perform a soft-delete, moving them to the temporary Archive tray.
              </p>

              <div className="flex gap-2.5 mt-6 pt-2">
                <button
                  onClick={() => setDeleteConfirmationEmployee(null)}
                  className="flex-1 h-9.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900 transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmSoftDelete}
                  className="flex-1 h-9.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-xs font-medium transition-all cursor-pointer"
                >
                  Archive
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 6. Archive Tray Sliding Sheet (View Archived Teammates) */}
      <AnimatePresence>
        {isArchivedDrawerOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsArchivedDrawerOpen(false)}
              className="fixed inset-0 bg-black/50 z-50 backdrop-blur-xs"
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 bottom-0 w-full max-w-[420px] bg-white dark:bg-[#0d121f] border-l border-slate-200 dark:border-slate-800/80 z-50 shadow-2xl p-6 flex flex-col font-normal"
            >
              <div className="flex items-center justify-between mb-6 pb-2 border-b border-slate-100 dark:border-slate-800/40">
                <div>
                  <h3 className="text-base font-medium text-slate-800 dark:text-slate-100">
                    Archived Employees
                  </h3>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    Teammates soft-deleted from active list
                  </p>
                </div>
                <button
                  onClick={() => setIsArchivedDrawerOpen(false)}
                  className="p-1.5 rounded-full hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-400"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto space-y-3 pr-1">
                {archivedEmployees.length === 0 ? (
                  <div className="text-center py-12 text-xs text-slate-400 font-normal">
                    No archived teammates currently
                  </div>
                ) : (
                  archivedEmployees.map((emp) => (
                    <div
                      key={emp.id}
                      className="p-3.5 rounded-2xl bg-slate-50/50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800/40 flex items-center justify-between gap-4"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <img
                          src={emp.avatar}
                          alt={emp.name}
                          className="w-10 h-10 rounded-full object-cover shrink-0"
                        />
                        <div className="min-w-0">
                          <h4 className="text-xs font-medium text-slate-700 dark:text-slate-200 truncate">
                            {emp.name}
                          </h4>
                          <p className="text-[10px] text-slate-400 dark:text-slate-500 truncate mt-0.5">
                            {emp.role}
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={() => handleRestoreEmployee(emp)}
                        className="h-8 px-2.5 rounded-lg border border-slate-200 dark:border-slate-800 text-[11px] font-medium text-[#5A82E8] hover:bg-white dark:hover:bg-slate-950 flex items-center gap-1 transition-all cursor-pointer shrink-0"
                      >
                        <Undo2 className="w-3.5 h-3.5" /> Restore
                      </button>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </AppShell>
  );
}
