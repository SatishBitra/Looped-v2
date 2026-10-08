export interface ActiveTimerSession {
  taskId: string;
  taskTitle: string;
  client: string;
  department: string;
  priority?: "HIGH" | "MEDIUM" | "LOW" | string;
  initialHours: number; // e.g. 2.0
  totalSecondsAllocated: number; // e.g. 7200
  secondsRemaining: number; // e.g. 7199 -> counts backwards to 0
  secondsElapsed: number; // e.g. 1, 2, 3...
  isRunning: boolean;
  isPaused: boolean;
  isCompleted: boolean;
  extendedMinutes: number;
  notes?: string;
  startedAt: number;
}

export function formatTimeParts(seconds: number): {
  hoursStr: string;
  minutesStr: string;
  secondsStr: string;
  fullFormatted: string;
} {
  const safeSec = Math.max(0, Math.floor(seconds));
  const h = Math.floor(safeSec / 3600);
  const m = Math.floor((safeSec % 3600) / 60);
  const s = safeSec % 60;

  const hoursStr = String(h).padStart(2, "0");
  const minutesStr = String(m).padStart(2, "0");
  const secondsStr = String(s).padStart(2, "0");

  return {
    hoursStr,
    minutesStr,
    secondsStr,
    fullFormatted: `${hoursStr}:${minutesStr}:${secondsStr}`,
  };
}
