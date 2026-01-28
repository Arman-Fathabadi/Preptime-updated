/**
 * Data Collection Utility for ML Training
 * Captures user scheduling behavior to improve AI recommendations
 */

export interface SchedulingEvent {
  timestamp: string;
  eventType: 'task_created' | 'task_edited' | 'task_deleted' | 'task_completed' | 'task_moved';
  taskData: {
    id: string;
    title: string;
    label?: string;
    description?: string;
    startHour: number;
    endHour: number;
    duration: number;
    dayOfWeek: number; // 0-6
    date: string;
    color?: string;
  };
  context: {
    totalTasksToday: number;
    totalTasksThisWeek: number;
    timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night';
    isWeekend: boolean;
    previousTask?: {
      title: string;
      endHour: number;
    };
    nextTask?: {
      title: string;
      startHour: number;
    };
  };
}

export interface SchedulingSession {
  sessionId: string;
  startTime: string;
  endTime?: string;
  events: SchedulingEvent[];
  userPreferences: {
    preferredWorkHours?: { start: number; end: number };
    preferredBreakDuration?: number;
    taskCategories: string[];
  };
}

class DataCollector {
  private currentSession: SchedulingSession | null = null;
  private readonly STORAGE_KEY = 'preptime_ml_data';
  private readonly SESSION_KEY = 'preptime_current_session';

  startSession() {
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    this.currentSession = {
      sessionId,
      startTime: new Date().toISOString(),
      events: [],
      userPreferences: {
        taskCategories: [],
      },
    };
    localStorage.setItem(this.SESSION_KEY, JSON.stringify(this.currentSession));
  }

  endSession() {
    if (this.currentSession) {
      this.currentSession.endTime = new Date().toISOString();
      this.saveSession();
      this.currentSession = null;
      localStorage.removeItem(this.SESSION_KEY);
    }
  }

  private loadSession() {
    if (!this.currentSession) {
      const saved = localStorage.getItem(this.SESSION_KEY);
      if (saved) {
        this.currentSession = JSON.parse(saved);
      }
    }
  }

  private saveSession() {
    if (!this.currentSession) return;

    // Get existing data
    const existingData = this.getAllSessions();
    existingData.push(this.currentSession);

    // Keep only last 100 sessions to avoid storage limits
    const recentData = existingData.slice(-100);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(recentData));
  }

  logEvent(event: Omit<SchedulingEvent, 'timestamp'>) {
    this.loadSession();
    if (!this.currentSession) {
      this.startSession();
    }

    const fullEvent: SchedulingEvent = {
      ...event,
      timestamp: new Date().toISOString(),
    };

    this.currentSession!.events.push(fullEvent);
    localStorage.setItem(this.SESSION_KEY, JSON.stringify(this.currentSession));
  }

  updateUserPreferences(preferences: Partial<SchedulingSession['userPreferences']>) {
    this.loadSession();
    if (this.currentSession) {
      this.currentSession.userPreferences = {
        ...this.currentSession.userPreferences,
        ...preferences,
      };
      localStorage.setItem(this.SESSION_KEY, JSON.stringify(this.currentSession));
    }
  }

  getAllSessions(): SchedulingSession[] {
    const data = localStorage.getItem(this.STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  }

  exportData(): string {
    const sessions = this.getAllSessions();
    return JSON.stringify(sessions, null, 2);
  }

  exportAsCSV(): string {
    const sessions = this.getAllSessions();
    const rows: string[] = [
      'session_id,timestamp,event_type,task_title,task_label,start_hour,end_hour,duration,day_of_week,is_weekend,time_of_day,total_tasks_today,total_tasks_week',
    ];

    sessions.forEach((session) => {
      session.events.forEach((event) => {
        const row = [
          session.sessionId,
          event.timestamp,
          event.eventType,
          `"${event.taskData.title.replace(/"/g, '""')}"`,
          event.taskData.label || '',
          event.taskData.startHour,
          event.taskData.endHour,
          event.taskData.duration,
          event.taskData.dayOfWeek,
          event.context.isWeekend ? 1 : 0,
          event.context.timeOfDay,
          event.context.totalTasksToday,
          event.context.totalTasksThisWeek,
        ].join(',');
        rows.push(row);
      });
    });

    return rows.join('\n');
  }

  clearData() {
    localStorage.removeItem(this.STORAGE_KEY);
    localStorage.removeItem(this.SESSION_KEY);
    this.currentSession = null;
  }

  getStats() {
    const sessions = this.getAllSessions();
    const totalEvents = sessions.reduce((sum, s) => sum + s.events.length, 0);
    const eventTypes = sessions.flatMap((s) => s.events.map((e) => e.eventType));
    const taskLabels = sessions.flatMap((s) =>
      s.events.map((e) => e.taskData.label).filter(Boolean)
    );

    return {
      totalSessions: sessions.length,
      totalEvents,
      eventTypeBreakdown: eventTypes.reduce((acc, type) => {
        acc[type] = (acc[type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      uniqueLabels: [...new Set(taskLabels)],
      dataSize: new Blob([this.exportData()]).size,
    };
  }
}

export const dataCollector = new DataCollector();

// Helper function to get time of day
export function getTimeOfDay(hour: number): 'morning' | 'afternoon' | 'evening' | 'night' {
  if (hour >= 6 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 18) return 'afternoon';
  if (hour >= 18 && hour < 22) return 'evening';
  return 'night';
}

// Helper function to check if date is weekend
export function isWeekend(date: Date): boolean {
  const day = date.getDay();
  return day === 0 || day === 6;
}
