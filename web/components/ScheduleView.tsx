import { ScheduleResponse, Task, Event } from '../../shared/types';
import { useState, useEffect } from 'react';

interface ScheduleViewProps {
  schedule: ScheduleResponse;
  tasks: Task[];
  events: Event[];
}

export default function ScheduleView({ schedule, tasks, events }: ScheduleViewProps) {
  const { scheduledBlocks, explanations, metrics } = schedule;
  const [selectedBlock, setSelectedBlock] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Get unique days from blocks and events
  const getDays = () => {
    const dates = new Set<string>();
    scheduledBlocks.forEach(block => {
      const date = new Date(block.start).toISOString().split('T')[0];
      dates.add(date);
    });
    events.forEach(event => {
      const date = new Date(event.start).toISOString().split('T')[0];
      dates.add(date);
    });
    
    const sortedDates = Array.from(dates).sort();
    return sortedDates.length > 0 ? sortedDates : [new Date().toISOString().split('T')[0]];
  };

  const days = getDays();
  const hours = Array.from({ length: 24 }, (_, i) => i);

  // Task type colors
  const getTaskColor = (type: string) => {
    switch (type) {
      case 'study': return 'bg-blue-500 border-blue-600';
      case 'deep': return 'bg-purple-500 border-purple-600';
      case 'admin': return 'bg-yellow-500 border-yellow-600';
      case 'relax': return 'bg-green-500 border-green-600';
      default: return 'bg-gray-500 border-gray-600';
    }
  };

  // Calculate position and height for blocks
  const getBlockStyle = (start: string, end: string, column: number = 0, totalColumns: number = 1) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const startHour = startDate.getHours() + startDate.getMinutes() / 60;
    const duration = (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60);
    
    const columnWidth = 100 / totalColumns;
    const leftOffset = column * columnWidth;
    
    return {
      top: `${startHour * 60}px`,
      height: `${Math.max(duration * 60, 20)}px`,
      left: `${leftOffset}%`,
      width: `${columnWidth}%`,
    };
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  };

  const formatDate = (dateStr: string) => {
    if (!mounted) return dateStr; // Return ISO string on server
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };

  // Detect overlapping blocks and assign columns
  const getBlocksWithColumns = (blocks: Array<{ id: string; start: string; end: string }>) => {
    const sorted = [...blocks].sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());
    const columns: Array<Array<typeof sorted[0]>> = [];
    
    sorted.forEach(block => {
      const blockStart = new Date(block.start).getTime();
      const blockEnd = new Date(block.end).getTime();
      
      // Find first column where this block doesn't overlap
      let placed = false;
      for (let i = 0; i < columns.length; i++) {
        const column = columns[i];
        const lastInColumn = column[column.length - 1];
        const lastEnd = new Date(lastInColumn.end).getTime();
        
        if (blockStart >= lastEnd) {
          column.push(block);
          placed = true;
          break;
        }
      }
      
      if (!placed) {
        columns.push([block]);
      }
    });
    
    // Map blocks to their column index
    const blockColumns = new Map<string, { column: number; totalColumns: number }>();
    columns.forEach((column, colIndex) => {
      column.forEach(block => {
        blockColumns.set(block.id, { column: colIndex, totalColumns: columns.length });
      });
    });
    
    return blockColumns;
  };

  return (
    <div className="space-y-6">
      {/* Metrics Summary */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
          <p className="text-xs text-blue-600 font-medium uppercase tracking-wide">Free Hours</p>
          <p className="text-2xl font-bold text-blue-700 mt-1">{metrics.freeHours.toFixed(1)}</p>
        </div>
        <div className="bg-green-50 p-4 rounded-xl border border-green-100">
          <p className="text-xs text-green-600 font-medium uppercase tracking-wide">Scheduled</p>
          <p className="text-2xl font-bold text-green-700 mt-1">{metrics.scheduledHours.toFixed(1)}h</p>
        </div>
        <div className="bg-purple-50 p-4 rounded-xl border border-purple-100">
          <p className="text-xs text-purple-600 font-medium uppercase tracking-wide">On Time</p>
          <p className="text-2xl font-bold text-purple-700 mt-1">{metrics.tasksOnTime}</p>
        </div>
        <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100">
          <p className="text-xs text-indigo-600 font-medium uppercase tracking-wide">Deep Work</p>
          <p className="text-2xl font-bold text-indigo-700 mt-1">{metrics.deepWorkHours.toFixed(1)}h</p>
        </div>
        <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
          <p className="text-xs text-gray-600 font-medium uppercase tracking-wide">Switches</p>
          <p className="text-2xl font-bold text-gray-700 mt-1">{metrics.contextSwitchPenalty.toFixed(2)}</p>
        </div>
      </div>

      {/* Calendar Week View */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <div className="inline-block min-w-full">
            {/* Header with days */}
            <div className="flex border-b border-gray-200 bg-gray-50">
              <div className="w-20 flex-shrink-0 border-r border-gray-200"></div>
              {days.map(day => (
                <div key={day} className="flex-1 min-w-[180px] p-4 text-center border-r border-gray-200 last:border-r-0">
                  <div className="font-semibold text-gray-900">{formatDate(day)}</div>
                </div>
              ))}
            </div>

            {/* Time grid */}
            <div className="flex relative">
              {/* Time labels */}
              <div className="w-20 flex-shrink-0 border-r border-gray-200 bg-gray-50">
                {hours.map(hour => (
                  <div key={hour} className="h-[60px] border-b border-gray-100 px-2 py-1 text-xs text-gray-500 text-right">
                    {hour === 0 ? '12 AM' : hour < 12 ? `${hour} AM` : hour === 12 ? '12 PM' : `${hour - 12} PM`}
                  </div>
                ))}
              </div>

              {/* Day columns */}
              {days.map(day => {
                const dayEvents = events.filter(event => new Date(event.start).toISOString().split('T')[0] === day);
                const dayBlocks = scheduledBlocks.filter(block => new Date(block.start).toISOString().split('T')[0] === day);
                
                // Calculate columns for overlapping blocks
                const allItems = [...dayEvents.map(e => ({ id: e.id, start: e.start, end: e.end })), ...dayBlocks];
                const blockColumns = getBlocksWithColumns(allItems);
                
                return (
                  <div key={day} className="flex-1 min-w-[180px] relative border-r border-gray-200 last:border-r-0">
                    {/* Hour lines */}
                    {hours.map(hour => (
                      <div key={hour} className="h-[60px] border-b border-gray-100"></div>
                    ))}

                    {/* Events (fixed/blocked) */}
                    {dayEvents.map(event => {
                      const colInfo = blockColumns.get(event.id) || { column: 0, totalColumns: 1 };
                      const style = getBlockStyle(event.start, event.end, colInfo.column, colInfo.totalColumns);
                      return (
                        <div
                          key={event.id}
                          className="absolute px-2 py-1 rounded-lg border-l-4 bg-gray-100 border-gray-400 text-xs overflow-hidden cursor-default shadow-sm"
                          style={style}
                        >
                          <div className="font-medium text-gray-700 truncate">{event.title}</div>
                          {mounted && (
                            <div className="text-gray-500 text-[10px]">
                              {formatTime(new Date(event.start))} - {formatTime(new Date(event.end))}
                            </div>
                          )}
                        </div>
                      );
                    })}

                    {/* Scheduled blocks */}
                    {dayBlocks.map(block => {
                      const task = tasks.find(t => t.id === block.taskId);
                      const colInfo = blockColumns.get(block.id) || { column: 0, totalColumns: 1 };
                      const style = getBlockStyle(block.start, block.end, colInfo.column, colInfo.totalColumns);
                      const isSelected = selectedBlock === block.id;
                      
                      return (
                        <div
                          key={block.id}
                          className={`absolute px-2 py-1 rounded-lg border-l-4 text-white text-xs overflow-hidden cursor-pointer transition-all hover:shadow-lg hover:scale-[1.02] ${
                            getTaskColor(task?.type || 'admin')
                          } ${isSelected ? 'ring-2 ring-offset-1 ring-blue-400 z-10 shadow-lg' : 'shadow-sm'}`}
                          style={style}
                          onClick={() => setSelectedBlock(isSelected ? null : block.id)}
                        >
                          <div className="font-semibold truncate">{task?.title || 'Unknown Task'}</div>
                          {mounted && (
                            <div className="text-white/90 text-[10px]">
                              {formatTime(new Date(block.start))} - {formatTime(new Date(block.end))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Selected block details */}
      {selectedBlock && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
          {(() => {
            const block = scheduledBlocks.find(b => b.id === selectedBlock);
            const task = tasks.find(t => t.id === block?.taskId);
            const blockExplanations = block ? explanations[block.id] || [] : [];
            
            return (
              <div>
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{task?.title}</h3>
                    {mounted && block && (
                      <p className="text-sm text-gray-600 mt-1">
                        {formatTime(new Date(block.start))} - {formatTime(new Date(block.end))}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <span className={`text-xs px-2.5 py-1 rounded-lg text-white font-medium ${getTaskColor(task?.type || 'admin')}`}>
                      {task?.type}
                    </span>
                    <span className="text-xs px-2.5 py-1 rounded-lg bg-gray-100 text-gray-700 font-medium">
                      Priority {task?.priority}
                    </span>
                  </div>
                </div>
                
                {blockExplanations.length > 0 && (
                  <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
                    <p className="text-xs font-semibold text-blue-900 mb-2 uppercase tracking-wide">Why this slot?</p>
                    <ul className="text-sm text-blue-800 space-y-1.5">
                      {blockExplanations.map((exp, i) => (
                        <li key={i} className="flex items-start">
                          <span className="mr-2 text-blue-400">•</span>
                          <span>{exp}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            );
          })()}
        </div>
      )}

      {/* Legend */}
      <div className="flex flex-wrap gap-4 text-xs text-gray-600">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-blue-500 border-2 border-blue-600"></div>
          <span>Study</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-purple-500 border-2 border-purple-600"></div>
          <span>Deep Work</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-yellow-500 border-2 border-yellow-600"></div>
          <span>Admin</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-green-500 border-2 border-green-600"></div>
          <span>Relax</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-gray-100 border-2 border-gray-400"></div>
          <span>Events</span>
        </div>
      </div>
    </div>
  );
}
