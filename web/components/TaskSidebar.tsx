import { useState } from 'react';
import { Task, Event, Preferences } from '../../shared/types';
import TaskForm from './TaskForm';
import EventForm from './EventForm';
import PreferencesPanel from './PreferencesPanel';

interface TaskSidebarProps {
  tasks: Task[];
  events: Event[];
  preferences: Preferences;
  onAddTask: (task: Task) => void;
  onUpdateTask: (taskId: string, updates: Partial<Task>) => void;
  onDeleteTask: (taskId: string) => void;
  onAddEvent: (event: Event) => void;
  onDeleteEvent: (eventId: string) => void;
  onUpdatePreferences: (preferences: Preferences) => void;
  autoSchedule: boolean;
  onToggleAutoSchedule: (enabled: boolean) => void;
  onManualSchedule: () => void;
}

type Tab = 'tasks' | 'events' | 'preferences';

export default function TaskSidebar({
  tasks,
  events,
  preferences,
  onAddTask,
  onUpdateTask,
  onDeleteTask,
  onAddEvent,
  onDeleteEvent,
  onUpdatePreferences,
  autoSchedule,
  onToggleAutoSchedule,
  onManualSchedule,
}: TaskSidebarProps) {
  const [activeTab, setActiveTab] = useState<Tab>('tasks');
  const [editingTask, setEditingTask] = useState<string | null>(null);

  const getTaskTypeColor = (type: string) => {
    switch (type) {
      case 'study': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'deep': return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'admin': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'relax': return 'bg-green-100 text-green-700 border-green-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <aside className="w-96 bg-white border-r border-gray-200 flex flex-col h-screen">
      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex -mb-px">
          <button
            onClick={() => setActiveTab('tasks')}
            className={`flex-1 py-3 px-4 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'tasks'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Tasks ({tasks.length})
          </button>
          <button
            onClick={() => setActiveTab('events')}
            className={`flex-1 py-3 px-4 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'events'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Events ({events.length})
          </button>
          <button
            onClick={() => setActiveTab('preferences')}
            className={`flex-1 py-3 px-4 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'preferences'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Settings
          </button>
        </nav>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === 'tasks' && (
          <div className="p-4 space-y-4">
            <TaskForm onAddTask={onAddTask} />
            
            {/* Task List */}
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-gray-700 mb-2">Your Tasks</h3>
              {tasks.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-8">No tasks yet. Add one above!</p>
              ) : (
                tasks.map(task => (
                  <div
                    key={task.id}
                    className="bg-gray-50 rounded-lg p-3 border border-gray-200 hover:border-gray-300 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm text-gray-900 truncate">{task.title}</h4>
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          <span className={`text-xs px-2 py-0.5 rounded border ${getTaskTypeColor(task.type)}`}>
                            {task.type}
                          </span>
                          <span className="text-xs text-gray-600">{task.durationMin}min</span>
                          <span className="text-xs text-gray-600">P{task.priority}</span>
                        </div>
                        {task.dueAt && (
                          <p className="text-xs text-gray-500 mt-1">
                            Due: {new Date(task.dueAt).toLocaleDateString('en-US')}
                          </p>
                        )}
                      </div>
                      <button
                        onClick={() => onDeleteTask(task.id)}
                        className="text-gray-400 hover:text-red-600 transition-colors"
                        title="Delete task"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {activeTab === 'events' && (
          <div className="p-4 space-y-4">
            <EventForm onAddEvent={onAddEvent} />
            
            {/* Event List */}
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-gray-700 mb-2">Your Events</h3>
              {events.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-8">No events yet. Add one above!</p>
              ) : (
                events.map(event => (
                  <div
                    key={event.id}
                    className="bg-gray-50 rounded-lg p-3 border border-gray-200 hover:border-gray-300 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm text-gray-900 truncate">{event.title}</h4>
                        <p className="text-xs text-gray-600 mt-1">
                          {new Date(event.start).toLocaleString('en-US')} - {new Date(event.end).toLocaleTimeString('en-US')}
                        </p>
                        <span className="text-xs text-gray-500 capitalize">{event.kind}</span>
                      </div>
                      <button
                        onClick={() => onDeleteEvent(event.id)}
                        className="text-gray-400 hover:text-red-600 transition-colors"
                        title="Delete event"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {activeTab === 'preferences' && (
          <div className="p-4">
            <PreferencesPanel preferences={preferences} onChange={onUpdatePreferences} />
          </div>
        )}
      </div>

      {/* Footer - Auto-schedule toggle */}
      <div className="border-t border-gray-200 p-4 bg-gray-50">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-gray-700">Auto-schedule</span>
          <button
            onClick={() => onToggleAutoSchedule(!autoSchedule)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              autoSchedule ? 'bg-blue-600' : 'bg-gray-300'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                autoSchedule ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
        {!autoSchedule && (
          <button
            onClick={onManualSchedule}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            Generate Schedule
          </button>
        )}
      </div>
    </aside>
  );
}
