export interface Task {
  id: string;
  title: string;
  durationMin: number;
  dueAt?: string; // ISO 8601
  type: "study" | "deep" | "admin" | "relax";
  energy: "low" | "med" | "high";
  window?: { startHour: number; endHour: number };
  splittable: boolean;
  priority: 1 | 2 | 3 | 4 | 5;
  mode: "study" | "lockin" | "relax" | "balanced";
  label?: string; // Task category/label (e.g., "Math", "Work")
  color?: string; // Color for the task (e.g., "#FF5733")
}

export interface Event {
  id: string;
  title: string;
  start: string; // ISO 8601
  end: string; // ISO 8601
  kind: "fixed" | "blocked";
}

export interface Preferences {
  dayStartHour: number;
  dayEndHour: number;
  slotStepMin: number;
  bufferMin: number;
  maxHeavyPerDay: number;
}

export interface ScheduledBlock {
  id: string;
  taskId: string;
  start: string; // ISO 8601
  end: string; // ISO 8601
}

export interface ScheduleMetrics {
  freeHours: number;
  scheduledHours: number;
  tasksOnTime: number;
  deepWorkHours: number;
  contextSwitchPenalty: number;
}

export interface ScheduleResponse {
  scheduledBlocks: ScheduledBlock[];
  explanations: Record<string, string[]>;
  metrics: ScheduleMetrics;
}

export interface ScheduleRequest {
  tasks: Task[];
  events: Event[];
  preferences: Preferences;
}

export interface GenerateMonthRequest {
  week1Blocks: ScheduledBlock[];
  week1Tasks: Task[];
  existingEvents: Event[];
  preferences: Preferences;
  startDate: string; // ISO 8601
}

export interface SchedulePattern {
  workHoursStart: number;
  workHoursEnd: number;
  avgTasksPerDay: number;
  taskTypeDistribution: Record<string, number>;
  peakProductivityHours: number[];
  breakFrequencyMinutes: number;
  preferredTaskClustering: boolean;
}

export interface GenerateMonthResponse {
  generatedTasks: Task[];
  scheduledBlocks: ScheduledBlock[];
  appliedTechniques: string[];
  patterns: SchedulePattern;
}
