import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Task {
    id: string;
    title: string;
    description: string;
    label: string;
    day: number;
    date: string;
    startHour: number;
    endHour: number;
    color: string;
    completed: boolean;
}

interface ModernScheduleProps {
    selectedDate: Date;
    isDark: boolean;
    onAddTask: (hour: number) => void;
    tasks?: Task[];
    onToggleTask?: (taskId: string) => void;
    onDeleteTask?: (taskId: string, e: React.MouseEvent) => void;
    formatDateKey?: (date: Date) => string;
}

const ModernSchedule: React.FC<ModernScheduleProps> = ({
    selectedDate,
    isDark,
    onAddTask,
    tasks = [],
    onToggleTask,
    onDeleteTask,
    formatDateKey
}) => {
    const [currentTime, setCurrentTime] = React.useState(new Date());
    const [hoveredHour, setHoveredHour] = React.useState<number | null>(null);

    React.useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 60000);
        return () => clearInterval(timer);
    }, []);

    const hours = Array.from({ length: 24 }, (_, i) => i);
    const currentHour = currentTime.getHours();

    const formatHour = (hour: number) => {
        const period = hour >= 12 ? 'PM' : 'AM';
        const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
        return { time: `${displayHour}:00`, period };
    };

    const formatHourDisplay = (hour: number) => {
        if (hour === 0 || hour === 24) return "12 AM";
        if (hour === 12) return "12 PM";
        if (hour > 12) return `${hour - 12} PM`;
        return `${hour} AM`;
    };

    // Filter tasks for the selected date
    const dayTasks = React.useMemo(() => {
        if (!formatDateKey) return [];
        const dateKey = formatDateKey(selectedDate);
        return tasks.filter(task => task.date === dateKey);
    }, [tasks, selectedDate, formatDateKey]);

    // Get tasks for a specific hour
    const getTasksForHour = (hour: number) => {
        return dayTasks.filter(task => {
            const taskStart = Math.floor(task.startHour);
            const taskEnd = Math.ceil(task.endHour);
            return hour >= taskStart && hour < taskEnd;
        });
    };

    const getHourCategory = (hour: number) => {
        if (hour >= 6 && hour < 9) return 'morning';
        if (hour >= 9 && hour < 12) return 'work-morning';
        if (hour >= 12 && hour < 14) return 'lunch';
        if (hour >= 14 && hour < 18) return 'work-afternoon';
        if (hour >= 18 && hour < 22) return 'evening';
        return 'night';
    };

    const getCategoryStyle = (category: string, isHovered: boolean, isCurrent: boolean) => {
        const baseClasses = "relative overflow-hidden transition-all duration-300";

        if (isCurrent) {
            return `${baseClasses} ${isDark
                ? 'bg-gradient-to-r from-indigo-600/30 to-purple-600/30 border-indigo-500/50 shadow-lg shadow-indigo-500/20'
                : 'bg-gradient-to-r from-indigo-100 to-purple-100 border-indigo-400 shadow-lg shadow-indigo-200/50'
                }`;
        }

        if (isHovered) {
            return `${baseClasses} ${isDark
                ? 'bg-slate-700/50 border-indigo-500/40 shadow-md'
                : 'bg-white border-indigo-300 shadow-md'
                }`;
        }

        switch (category) {
            case 'morning':
                return `${baseClasses} ${isDark
                    ? 'bg-amber-950/20 border-amber-800/20 hover:border-amber-600/40'
                    : 'bg-amber-50/30 border-amber-200/30 hover:border-amber-300'
                    }`;
            case 'work-morning':
            case 'work-afternoon':
                return `${baseClasses} ${isDark
                    ? 'bg-indigo-950/30 border-indigo-800/30 hover:border-indigo-600/50'
                    : 'bg-indigo-50/40 border-indigo-200/40 hover:border-indigo-400'
                    }`;
            case 'lunch':
                return `${baseClasses} ${isDark
                    ? 'bg-emerald-950/20 border-emerald-800/20 hover:border-emerald-600/40'
                    : 'bg-emerald-50/30 border-emerald-200/30 hover:border-emerald-300'
                    }`;
            case 'evening':
                return `${baseClasses} ${isDark
                    ? 'bg-purple-950/20 border-purple-800/20 hover:border-purple-600/40'
                    : 'bg-purple-50/30 border-purple-200/30 hover:border-purple-300'
                    }`;
            case 'night':
                return `${baseClasses} ${isDark
                    ? 'bg-slate-900/40 border-slate-800/30 hover:border-slate-700/50 opacity-70'
                    : 'bg-slate-100/40 border-slate-200/30 hover:border-slate-300 opacity-80'
                    }`;
            default:
                return `${baseClasses} ${isDark
                    ? 'bg-slate-800/30 border-slate-700/30 hover:border-slate-600/50'
                    : 'bg-white/50 border-slate-200/30 hover:border-slate-300'
                    }`;
        }
    };

    const getCategoryIcon = (category: string) => {
        switch (category) {
            case 'morning':
                return (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                );
            case 'work-morning':
            case 'work-afternoon':
                return (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                );
            case 'lunch':
                return (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                );
            case 'evening':
                return (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                    </svg>
                );
            case 'night':
                return (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                    </svg>
                );
            default:
                return null;
        }
    };

    return (
        <div className="h-full flex flex-col overflow-hidden">
            {/* Timeline Container */}
            <div className="flex-1 relative">
                {/* Scrollable Timeline */}
                <div className="h-full overflow-y-auto px-4 py-3 space-y-2 scroll-smooth">
                    {hours.map((hour) => {
                        const { time, period } = formatHour(hour);
                        const category = getHourCategory(hour);
                        const isCurrent = hour === currentHour;
                        const isHovered = hoveredHour === hour;

                        return (
                            <motion.div
                                key={hour}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: hour * 0.008, duration: 0.3 }}
                                onMouseEnter={() => setHoveredHour(hour)}
                                onMouseLeave={() => setHoveredHour(null)}
                                className="group"
                            >
                                <div
                                    className={`rounded-2xl border-2 backdrop-blur-sm ${getCategoryStyle(
                                        category,
                                        isHovered,
                                        isCurrent
                                    )}`}
                                >
                                    {/* Current Time Indicator */}
                                    {isCurrent && (
                                        <motion.div
                                            initial={{ scaleX: 0 }}
                                            animate={{ scaleX: 1 }}
                                            className={`absolute top-0 left-0 right-0 h-1 rounded-t-2xl ${isDark
                                                ? 'bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500'
                                                : 'bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400'
                                                }`}
                                        />
                                    )}

                                    <div className="flex items-center gap-4 p-4">
                                        {/* Time Display */}
                                        <div className="flex-shrink-0 flex items-center gap-3">
                                            <div
                                                className={`flex flex-col items-end ${isCurrent
                                                    ? isDark
                                                        ? 'text-indigo-300'
                                                        : 'text-indigo-700'
                                                    : isDark
                                                        ? 'text-slate-300'
                                                        : 'text-slate-700'
                                                    }`}
                                            >
                                                <div className="text-2xl font-bold leading-none">{time.split(':')[0]}</div>
                                                <div className="text-xs font-semibold opacity-70">{period}</div>
                                            </div>

                                            {/* Category Icon */}
                                            <div
                                                className={`w-10 h-10 rounded-xl flex items-center justify-center ${isCurrent
                                                    ? isDark
                                                        ? 'bg-indigo-600/30 text-indigo-300'
                                                        : 'bg-indigo-200 text-indigo-700'
                                                    : isDark
                                                        ? 'bg-slate-700/50 text-slate-400'
                                                        : 'bg-slate-100 text-slate-600'
                                                    }`}
                                            >
                                                {getCategoryIcon(category)}
                                            </div>
                                        </div>

                                        {/* Task Area */}
                                        <div className="flex-1 min-h-[48px] flex items-center">
                                            <AnimatePresence mode="wait">
                                                {(() => {
                                                    const hourTasks = getTasksForHour(hour);

                                                    if (hourTasks.length > 0) {
                                                        return (
                                                            <motion.div
                                                                key="tasks"
                                                                initial={{ opacity: 0, scale: 0.95 }}
                                                                animate={{ opacity: 1, scale: 1 }}
                                                                exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
                                                                className="w-full space-y-2"
                                                            >
                                                                {hourTasks.map(task => {
                                                                    const isFirstHour = Math.floor(task.startHour) === hour;
                                                                    if (!isFirstHour) return null; // Only render on first hour

                                                                    const duration = task.endHour - task.startHour;

                                                                    return (
                                                                        <motion.div
                                                                            key={task.id}
                                                                            initial={{ opacity: 0, x: -10 }}
                                                                            animate={{ opacity: 1, x: 0 }}
                                                                            className={`${task.color} rounded-xl p-3 border-l-4 border-opacity-80 shadow-md group cursor-pointer hover:shadow-lg transition-all ${task.completed ? 'opacity-60' : ''
                                                                                }`}
                                                                            onClick={(e) => {
                                                                                e.stopPropagation();
                                                                                onToggleTask?.(task.id);
                                                                            }}
                                                                            style={{
                                                                                borderLeftColor: 'rgba(0,0,0,0.3)'
                                                                            }}
                                                                        >
                                                                            <div className="flex items-start justify-between gap-2">
                                                                                <div className="flex-1 min-w-0">
                                                                                    <div className={`font-bold text-white flex items-center gap-2 transition-opacity duration-300 ${task.completed ? 'opacity-75' : ''}`}>
                                                                                        <AnimatePresence>
                                                                                            {task.completed && (
                                                                                                <motion.span
                                                                                                    initial={{ scale: 0, opacity: 0 }}
                                                                                                    animate={{ scale: 1, opacity: 1, rotate: [0, -20, 0] }}
                                                                                                    exit={{ scale: 0, opacity: 0 }}
                                                                                                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                                                                                    className="text-sm bg-white/20 rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0"
                                                                                                >
                                                                                                    ✓
                                                                                                </motion.span>
                                                                                            )}
                                                                                        </AnimatePresence>
                                                                                        <span className={`truncate transition-all duration-300 relative ${task.completed ? 'line-through decoration-white/50 decoration-2' : ''}`}>
                                                                                            {task.title}
                                                                                        </span>
                                                                                    </div>
                                                                                    {task.label && (
                                                                                        <div className="text-xs text-white/90 mt-1 truncate">
                                                                                            {task.label}
                                                                                        </div>
                                                                                    )}
                                                                                    <div className="text-xs text-white/80 mt-1">
                                                                                        {formatHourDisplay(task.startHour)} - {formatHourDisplay(task.endHour)}
                                                                                        {duration >= 1 && <span className="ml-2">({duration}h)</span>}
                                                                                    </div>
                                                                                </div>
                                                                                <button
                                                                                    onClick={(e) => {
                                                                                        e.stopPropagation();
                                                                                        onDeleteTask?.(task.id, e);
                                                                                    }}
                                                                                    className="opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity p-2 hover:bg-white/20 rounded-lg z-10"
                                                                                    title="Delete task"
                                                                                >
                                                                                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                                                        <path
                                                                                            fillRule="evenodd"
                                                                                            d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414 1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                                                                                            clipRule="evenodd"
                                                                                        />
                                                                                    </svg>
                                                                                </button>
                                                                            </div>
                                                                        </motion.div>
                                                                    );
                                                                })}
                                                            </motion.div>
                                                        );
                                                    }

                                                    if (hourTasks.length > 0) return null;

                                                    return (
                                                        <motion.div
                                                            key="add-button"
                                                            initial={{ opacity: 0 }}
                                                            animate={{ opacity: 1 }}
                                                            exit={{ opacity: 0 }}
                                                            className="w-full flex justify-center"
                                                        >
                                                            <AnimatePresence>
                                                                {(isHovered || isCurrent) && (
                                                                    <motion.button
                                                                        initial={{ opacity: 0, scale: 0.8, pointerEvents: "none" }}
                                                                        animate={{ opacity: 1, scale: 1, pointerEvents: "auto", transition: { delay: 0.3 } }}
                                                                        exit={{ opacity: 0, scale: 0.8 }}
                                                                        whileHover={{ scale: 1.05 }}
                                                                        whileTap={{ scale: 0.95 }}
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            if (getTasksForHour(hour).length === 0) {
                                                                                onAddTask(hour);
                                                                            }
                                                                        }}
                                                                        className={`px-6 py-2.5 rounded-xl font-semibold text-sm flex items-center gap-2 shadow-lg transition-all ${isDark
                                                                            ? 'bg-indigo-600 text-white hover:bg-indigo-500 border border-indigo-500/50'
                                                                            : 'bg-indigo-600 text-white hover:bg-indigo-700 border border-indigo-700/20'
                                                                            }`}
                                                                    >
                                                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                                                                        </svg>
                                                                        <span>Add Task</span>
                                                                    </motion.button>
                                                                )}
                                                            </AnimatePresence>
                                                        </motion.div>
                                                    );
                                                })()}</AnimatePresence>
                                        </div>

                                        {/* Time Period Label */}
                                        <div className="flex-shrink-0 w-24 text-right">
                                            <div
                                                className={`text-xs font-medium px-3 py-1.5 rounded-lg inline-block ${isCurrent
                                                    ? isDark
                                                        ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30'
                                                        : 'bg-indigo-100 text-indigo-700 border border-indigo-300'
                                                    : isDark
                                                        ? 'bg-slate-700/50 text-slate-400'
                                                        : 'bg-slate-100 text-slate-600'
                                                    }`}
                                            >
                                                {category.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>

                {/* Current Time Floating Indicator */}
                <AnimatePresence>
                    {currentHour >= 0 && currentHour < 24 && (
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className={`fixed bottom-6 right-6 px-4 py-3 rounded-2xl shadow-2xl backdrop-blur-md border-2 ${isDark
                                ? 'bg-slate-800/90 border-indigo-500/50 text-white'
                                : 'bg-white/90 border-indigo-400 text-slate-900'
                                }`}
                        >
                            <div className="flex items-center gap-3">
                                <div className={`w-2 h-2 rounded-full animate-pulse ${isDark ? 'bg-indigo-400' : 'bg-indigo-600'
                                    }`} />
                                <div>
                                    <div className="text-xs font-medium opacity-70">Current Time</div>
                                    <div className="text-sm font-bold" suppressHydrationWarning>
                                        {currentTime.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default ModernSchedule;
