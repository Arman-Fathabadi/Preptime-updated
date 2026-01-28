import React from 'react';

interface Task {
  id: string;
  title: string;
  date: string;
  startHour: number;
  endHour: number;
  day: number;
}

interface DebugPanelProps {
  tasks: Task[];
  currentDate: Date;
  formatDateKey: (date: Date) => string;
}

export default function DebugPanel({ tasks, currentDate, formatDateKey }: DebugPanelProps) {
  const currentDateKey = formatDateKey(currentDate);
  const filteredTasks = tasks.filter(t => t.date === currentDateKey);

  return (
    <div className="fixed bottom-4 right-4 bg-white border-2 border-red-500 rounded-lg p-4 shadow-xl max-w-md z-50">
      <h3 className="font-bold text-red-600 mb-2">Debug Panel</h3>
      
      <div className="text-xs space-y-2">
        <div>
          <strong>Current Date:</strong> {currentDate.toDateString()}
        </div>
        <div>
          <strong>Date Key:</strong> {currentDateKey}
        </div>
        <div>
          <strong>Total Tasks:</strong> {tasks.length}
        </div>
        <div>
          <strong>Filtered Tasks for Today:</strong> {filteredTasks.length}
        </div>
        
        {tasks.length > 0 && (
          <div className="mt-3">
            <strong>All Tasks:</strong>
            <div className="max-h-40 overflow-y-auto mt-1 space-y-1">
              {tasks.map(task => (
                <div key={task.id} className="text-[10px] bg-gray-100 p-1 rounded">
                  <div><strong>{task.title}</strong></div>
                  <div>Date: {task.date}</div>
                  <div>Time: {task.startHour}:00 - {task.endHour}:00</div>
                  <div>Match: {task.date === currentDateKey ? '✅' : '❌'}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
