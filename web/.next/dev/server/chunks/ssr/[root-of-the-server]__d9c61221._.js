module.exports = [
"[project]/Downloads/private-project/Preptime-private/web/components/ModernSchedule.tsx [ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/react/jsx-dev-runtime [external] (react/jsx-dev-runtime, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/react [external] (react, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$framer$2d$motion__$5b$external$5d$__$28$framer$2d$motion$2c$__esm_import$2c$__$5b$project$5d2f$Downloads$2f$private$2d$project$2f$Preptime$2d$private$2f$web$2f$node_modules$2f$framer$2d$motion$29$__ = __turbopack_context__.i("[externals]/framer-motion [external] (framer-motion, esm_import, [project]/Downloads/private-project/Preptime-private/web/node_modules/framer-motion)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$externals$5d2f$framer$2d$motion__$5b$external$5d$__$28$framer$2d$motion$2c$__esm_import$2c$__$5b$project$5d2f$Downloads$2f$private$2d$project$2f$Preptime$2d$private$2f$web$2f$node_modules$2f$framer$2d$motion$29$__
]);
[__TURBOPACK__imported__module__$5b$externals$5d2f$framer$2d$motion__$5b$external$5d$__$28$framer$2d$motion$2c$__esm_import$2c$__$5b$project$5d2f$Downloads$2f$private$2d$project$2f$Preptime$2d$private$2f$web$2f$node_modules$2f$framer$2d$motion$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
;
const ModernSchedule = ({ selectedDate, isDark, onAddTask, tasks = [], onToggleTask, onDeleteTask, formatDateKey })=>{
    const [currentTime, setCurrentTime] = __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["default"].useState(new Date());
    const [hoveredHour, setHoveredHour] = __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["default"].useState(null);
    __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["default"].useEffect(()=>{
        const timer = setInterval(()=>setCurrentTime(new Date()), 60000);
        return ()=>clearInterval(timer);
    }, []);
    const hours = Array.from({
        length: 24
    }, (_, i)=>i);
    const currentHour = currentTime.getHours();
    const formatHour = (hour)=>{
        const period = hour >= 12 ? 'PM' : 'AM';
        const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
        return {
            time: `${displayHour}:00`,
            period
        };
    };
    const formatHourDisplay = (hour)=>{
        if (hour === 0 || hour === 24) return "12 AM";
        if (hour === 12) return "12 PM";
        if (hour > 12) return `${hour - 12} PM`;
        return `${hour} AM`;
    };
    // Filter tasks for the selected date
    const dayTasks = __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["default"].useMemo(()=>{
        if (!formatDateKey) return [];
        const dateKey = formatDateKey(selectedDate);
        return tasks.filter((task)=>task.date === dateKey);
    }, [
        tasks,
        selectedDate,
        formatDateKey
    ]);
    // Get tasks for a specific hour
    const getTasksForHour = (hour)=>{
        return dayTasks.filter((task)=>{
            const taskStart = Math.floor(task.startHour);
            const taskEnd = Math.ceil(task.endHour);
            return hour >= taskStart && hour < taskEnd;
        });
    };
    const getHourCategory = (hour)=>{
        if (hour >= 6 && hour < 9) return 'morning';
        if (hour >= 9 && hour < 12) return 'work-morning';
        if (hour >= 12 && hour < 14) return 'lunch';
        if (hour >= 14 && hour < 18) return 'work-afternoon';
        if (hour >= 18 && hour < 22) return 'evening';
        return 'night';
    };
    const getCategoryStyle = (category, isHovered, isCurrent)=>{
        const baseClasses = "relative overflow-hidden transition-all duration-300";
        if (isCurrent) {
            return `${baseClasses} ${isDark ? 'bg-gradient-to-r from-indigo-600/30 to-purple-600/30 border-indigo-500/50 shadow-lg shadow-indigo-500/20' : 'bg-gradient-to-r from-indigo-100 to-purple-100 border-indigo-400 shadow-lg shadow-indigo-200/50'}`;
        }
        if (isHovered) {
            return `${baseClasses} ${isDark ? 'bg-slate-700/50 border-indigo-500/40 shadow-md' : 'bg-white border-indigo-300 shadow-md'}`;
        }
        switch(category){
            case 'morning':
                return `${baseClasses} ${isDark ? 'bg-amber-950/20 border-amber-800/20 hover:border-amber-600/40' : 'bg-amber-50/30 border-amber-200/30 hover:border-amber-300'}`;
            case 'work-morning':
            case 'work-afternoon':
                return `${baseClasses} ${isDark ? 'bg-indigo-950/30 border-indigo-800/30 hover:border-indigo-600/50' : 'bg-indigo-50/40 border-indigo-200/40 hover:border-indigo-400'}`;
            case 'lunch':
                return `${baseClasses} ${isDark ? 'bg-emerald-950/20 border-emerald-800/20 hover:border-emerald-600/40' : 'bg-emerald-50/30 border-emerald-200/30 hover:border-emerald-300'}`;
            case 'evening':
                return `${baseClasses} ${isDark ? 'bg-purple-950/20 border-purple-800/20 hover:border-purple-600/40' : 'bg-purple-50/30 border-purple-200/30 hover:border-purple-300'}`;
            case 'night':
                return `${baseClasses} ${isDark ? 'bg-slate-900/40 border-slate-800/30 hover:border-slate-700/50 opacity-70' : 'bg-slate-100/40 border-slate-200/30 hover:border-slate-300 opacity-80'}`;
            default:
                return `${baseClasses} ${isDark ? 'bg-slate-800/30 border-slate-700/30 hover:border-slate-600/50' : 'bg-white/50 border-slate-200/30 hover:border-slate-300'}`;
        }
    };
    const getCategoryIcon = (category)=>{
        switch(category){
            case 'morning':
                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("svg", {
                    className: "w-4 h-4",
                    fill: "none",
                    viewBox: "0 0 24 24",
                    stroke: "currentColor",
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("path", {
                        strokeLinecap: "round",
                        strokeLinejoin: "round",
                        strokeWidth: 2,
                        d: "M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                    }, void 0, false, {
                        fileName: "[project]/Downloads/private-project/Preptime-private/web/components/ModernSchedule.tsx",
                        lineNumber: 142,
                        columnNumber: 25
                    }, ("TURBOPACK compile-time value", void 0))
                }, void 0, false, {
                    fileName: "[project]/Downloads/private-project/Preptime-private/web/components/ModernSchedule.tsx",
                    lineNumber: 141,
                    columnNumber: 21
                }, ("TURBOPACK compile-time value", void 0));
            case 'work-morning':
            case 'work-afternoon':
                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("svg", {
                    className: "w-4 h-4",
                    fill: "none",
                    viewBox: "0 0 24 24",
                    stroke: "currentColor",
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("path", {
                        strokeLinecap: "round",
                        strokeLinejoin: "round",
                        strokeWidth: 2,
                        d: "M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    }, void 0, false, {
                        fileName: "[project]/Downloads/private-project/Preptime-private/web/components/ModernSchedule.tsx",
                        lineNumber: 149,
                        columnNumber: 25
                    }, ("TURBOPACK compile-time value", void 0))
                }, void 0, false, {
                    fileName: "[project]/Downloads/private-project/Preptime-private/web/components/ModernSchedule.tsx",
                    lineNumber: 148,
                    columnNumber: 21
                }, ("TURBOPACK compile-time value", void 0));
            case 'lunch':
                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("svg", {
                    className: "w-4 h-4",
                    fill: "none",
                    viewBox: "0 0 24 24",
                    stroke: "currentColor",
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("path", {
                        strokeLinecap: "round",
                        strokeLinejoin: "round",
                        strokeWidth: 2,
                        d: "M12 6v6m0 0v6m0-6h6m-6 0H6"
                    }, void 0, false, {
                        fileName: "[project]/Downloads/private-project/Preptime-private/web/components/ModernSchedule.tsx",
                        lineNumber: 155,
                        columnNumber: 25
                    }, ("TURBOPACK compile-time value", void 0))
                }, void 0, false, {
                    fileName: "[project]/Downloads/private-project/Preptime-private/web/components/ModernSchedule.tsx",
                    lineNumber: 154,
                    columnNumber: 21
                }, ("TURBOPACK compile-time value", void 0));
            case 'evening':
                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("svg", {
                    className: "w-4 h-4",
                    fill: "none",
                    viewBox: "0 0 24 24",
                    stroke: "currentColor",
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("path", {
                        strokeLinecap: "round",
                        strokeLinejoin: "round",
                        strokeWidth: 2,
                        d: "M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                    }, void 0, false, {
                        fileName: "[project]/Downloads/private-project/Preptime-private/web/components/ModernSchedule.tsx",
                        lineNumber: 161,
                        columnNumber: 25
                    }, ("TURBOPACK compile-time value", void 0))
                }, void 0, false, {
                    fileName: "[project]/Downloads/private-project/Preptime-private/web/components/ModernSchedule.tsx",
                    lineNumber: 160,
                    columnNumber: 21
                }, ("TURBOPACK compile-time value", void 0));
            case 'night':
                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("svg", {
                    className: "w-4 h-4",
                    fill: "none",
                    viewBox: "0 0 24 24",
                    stroke: "currentColor",
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("path", {
                        strokeLinecap: "round",
                        strokeLinejoin: "round",
                        strokeWidth: 2,
                        d: "M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                    }, void 0, false, {
                        fileName: "[project]/Downloads/private-project/Preptime-private/web/components/ModernSchedule.tsx",
                        lineNumber: 167,
                        columnNumber: 25
                    }, ("TURBOPACK compile-time value", void 0))
                }, void 0, false, {
                    fileName: "[project]/Downloads/private-project/Preptime-private/web/components/ModernSchedule.tsx",
                    lineNumber: 166,
                    columnNumber: 21
                }, ("TURBOPACK compile-time value", void 0));
            default:
                return null;
        }
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
        className: "h-full flex flex-col overflow-hidden",
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
            className: "flex-1 relative",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                    className: "h-full overflow-y-auto px-4 py-3 space-y-2 scroll-smooth",
                    children: hours.map((hour)=>{
                        const { time, period } = formatHour(hour);
                        const category = getHourCategory(hour);
                        const isCurrent = hour === currentHour;
                        const isHovered = hoveredHour === hour;
                        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$externals$5d2f$framer$2d$motion__$5b$external$5d$__$28$framer$2d$motion$2c$__esm_import$2c$__$5b$project$5d2f$Downloads$2f$private$2d$project$2f$Preptime$2d$private$2f$web$2f$node_modules$2f$framer$2d$motion$29$__["motion"].div, {
                            initial: {
                                opacity: 0,
                                y: 20
                            },
                            animate: {
                                opacity: 1,
                                y: 0
                            },
                            transition: {
                                delay: hour * 0.008,
                                duration: 0.3
                            },
                            onMouseEnter: ()=>setHoveredHour(hour),
                            onMouseLeave: ()=>setHoveredHour(null),
                            className: "group",
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                className: `rounded-2xl border-2 backdrop-blur-sm ${getCategoryStyle(category, isHovered, isCurrent)}`,
                                children: [
                                    isCurrent && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$externals$5d2f$framer$2d$motion__$5b$external$5d$__$28$framer$2d$motion$2c$__esm_import$2c$__$5b$project$5d2f$Downloads$2f$private$2d$project$2f$Preptime$2d$private$2f$web$2f$node_modules$2f$framer$2d$motion$29$__["motion"].div, {
                                        initial: {
                                            scaleX: 0
                                        },
                                        animate: {
                                            scaleX: 1
                                        },
                                        className: `absolute top-0 left-0 right-0 h-1 rounded-t-2xl ${isDark ? 'bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500' : 'bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400'}`
                                    }, void 0, false, {
                                        fileName: "[project]/Downloads/private-project/Preptime-private/web/components/ModernSchedule.tsx",
                                        lineNumber: 206,
                                        columnNumber: 41
                                    }, ("TURBOPACK compile-time value", void 0)),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                        className: "flex items-center gap-4 p-4",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                                className: "flex-shrink-0 flex items-center gap-3",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                                        className: `flex flex-col items-end ${isCurrent ? isDark ? 'text-indigo-300' : 'text-indigo-700' : isDark ? 'text-slate-300' : 'text-slate-700'}`,
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                                                className: "text-2xl font-bold leading-none",
                                                                children: time.split(':')[0]
                                                            }, void 0, false, {
                                                                fileName: "[project]/Downloads/private-project/Preptime-private/web/components/ModernSchedule.tsx",
                                                                lineNumber: 229,
                                                                columnNumber: 49
                                                            }, ("TURBOPACK compile-time value", void 0)),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                                                className: "text-xs font-semibold opacity-70",
                                                                children: period
                                                            }, void 0, false, {
                                                                fileName: "[project]/Downloads/private-project/Preptime-private/web/components/ModernSchedule.tsx",
                                                                lineNumber: 230,
                                                                columnNumber: 49
                                                            }, ("TURBOPACK compile-time value", void 0))
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/Downloads/private-project/Preptime-private/web/components/ModernSchedule.tsx",
                                                        lineNumber: 219,
                                                        columnNumber: 45
                                                    }, ("TURBOPACK compile-time value", void 0)),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                                        className: `w-10 h-10 rounded-xl flex items-center justify-center ${isCurrent ? isDark ? 'bg-indigo-600/30 text-indigo-300' : 'bg-indigo-200 text-indigo-700' : isDark ? 'bg-slate-700/50 text-slate-400' : 'bg-slate-100 text-slate-600'}`,
                                                        children: getCategoryIcon(category)
                                                    }, void 0, false, {
                                                        fileName: "[project]/Downloads/private-project/Preptime-private/web/components/ModernSchedule.tsx",
                                                        lineNumber: 234,
                                                        columnNumber: 45
                                                    }, ("TURBOPACK compile-time value", void 0))
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/Downloads/private-project/Preptime-private/web/components/ModernSchedule.tsx",
                                                lineNumber: 218,
                                                columnNumber: 41
                                            }, ("TURBOPACK compile-time value", void 0)),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                                className: "flex-1 min-h-[48px] flex items-center",
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$externals$5d2f$framer$2d$motion__$5b$external$5d$__$28$framer$2d$motion$2c$__esm_import$2c$__$5b$project$5d2f$Downloads$2f$private$2d$project$2f$Preptime$2d$private$2f$web$2f$node_modules$2f$framer$2d$motion$29$__["AnimatePresence"], {
                                                    mode: "wait",
                                                    children: (()=>{
                                                        const hourTasks = getTasksForHour(hour);
                                                        if (hourTasks.length > 0) {
                                                            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$externals$5d2f$framer$2d$motion__$5b$external$5d$__$28$framer$2d$motion$2c$__esm_import$2c$__$5b$project$5d2f$Downloads$2f$private$2d$project$2f$Preptime$2d$private$2f$web$2f$node_modules$2f$framer$2d$motion$29$__["motion"].div, {
                                                                initial: {
                                                                    opacity: 0,
                                                                    scale: 0.95
                                                                },
                                                                animate: {
                                                                    opacity: 1,
                                                                    scale: 1
                                                                },
                                                                exit: {
                                                                    opacity: 0,
                                                                    scale: 0.95,
                                                                    transition: {
                                                                        duration: 0.2
                                                                    }
                                                                },
                                                                className: "w-full space-y-2",
                                                                children: hourTasks.map((task)=>{
                                                                    const isFirstHour = Math.floor(task.startHour) === hour;
                                                                    if (!isFirstHour) return null; // Only render on first hour
                                                                    const duration = task.endHour - task.startHour;
                                                                    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$externals$5d2f$framer$2d$motion__$5b$external$5d$__$28$framer$2d$motion$2c$__esm_import$2c$__$5b$project$5d2f$Downloads$2f$private$2d$project$2f$Preptime$2d$private$2f$web$2f$node_modules$2f$framer$2d$motion$29$__["motion"].div, {
                                                                        initial: {
                                                                            opacity: 0,
                                                                            x: -10
                                                                        },
                                                                        animate: {
                                                                            opacity: 1,
                                                                            x: 0
                                                                        },
                                                                        className: `${task.color} rounded-xl p-3 border-l-4 border-opacity-80 shadow-md group cursor-pointer hover:shadow-lg transition-all ${task.completed ? 'opacity-60' : ''}`,
                                                                        onClick: (e)=>{
                                                                            e.stopPropagation();
                                                                            onToggleTask?.(task.id);
                                                                        },
                                                                        style: {
                                                                            borderLeftColor: 'rgba(0,0,0,0.3)'
                                                                        },
                                                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                                                            className: "flex items-start justify-between gap-2",
                                                                            children: [
                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                                                                    className: "flex-1 min-w-0",
                                                                                    children: [
                                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                                                                            className: `font-bold text-white flex items-center gap-2 transition-opacity duration-300 ${task.completed ? 'opacity-75' : ''}`,
                                                                                            children: [
                                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$externals$5d2f$framer$2d$motion__$5b$external$5d$__$28$framer$2d$motion$2c$__esm_import$2c$__$5b$project$5d2f$Downloads$2f$private$2d$project$2f$Preptime$2d$private$2f$web$2f$node_modules$2f$framer$2d$motion$29$__["AnimatePresence"], {
                                                                                                    children: task.completed && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$externals$5d2f$framer$2d$motion__$5b$external$5d$__$28$framer$2d$motion$2c$__esm_import$2c$__$5b$project$5d2f$Downloads$2f$private$2d$project$2f$Preptime$2d$private$2f$web$2f$node_modules$2f$framer$2d$motion$29$__["motion"].span, {
                                                                                                        initial: {
                                                                                                            scale: 0,
                                                                                                            opacity: 0
                                                                                                        },
                                                                                                        animate: {
                                                                                                            scale: 1,
                                                                                                            opacity: 1,
                                                                                                            rotate: [
                                                                                                                0,
                                                                                                                -20,
                                                                                                                0
                                                                                                            ]
                                                                                                        },
                                                                                                        exit: {
                                                                                                            scale: 0,
                                                                                                            opacity: 0
                                                                                                        },
                                                                                                        transition: {
                                                                                                            type: "spring",
                                                                                                            stiffness: 500,
                                                                                                            damping: 30
                                                                                                        },
                                                                                                        className: "text-sm bg-white/20 rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0",
                                                                                                        children: "✓"
                                                                                                    }, void 0, false, {
                                                                                                        fileName: "[project]/Downloads/private-project/Preptime-private/web/components/ModernSchedule.tsx",
                                                                                                        lineNumber: 289,
                                                                                                        columnNumber: 97
                                                                                                    }, ("TURBOPACK compile-time value", void 0))
                                                                                                }, void 0, false, {
                                                                                                    fileName: "[project]/Downloads/private-project/Preptime-private/web/components/ModernSchedule.tsx",
                                                                                                    lineNumber: 287,
                                                                                                    columnNumber: 89
                                                                                                }, ("TURBOPACK compile-time value", void 0)),
                                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("span", {
                                                                                                    className: `truncate transition-all duration-300 relative ${task.completed ? 'line-through decoration-white/50 decoration-2' : ''}`,
                                                                                                    children: task.title
                                                                                                }, void 0, false, {
                                                                                                    fileName: "[project]/Downloads/private-project/Preptime-private/web/components/ModernSchedule.tsx",
                                                                                                    lineNumber: 300,
                                                                                                    columnNumber: 89
                                                                                                }, ("TURBOPACK compile-time value", void 0))
                                                                                            ]
                                                                                        }, void 0, true, {
                                                                                            fileName: "[project]/Downloads/private-project/Preptime-private/web/components/ModernSchedule.tsx",
                                                                                            lineNumber: 286,
                                                                                            columnNumber: 85
                                                                                        }, ("TURBOPACK compile-time value", void 0)),
                                                                                        task.label && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                                                                            className: "text-xs text-white/90 mt-1 truncate",
                                                                                            children: task.label
                                                                                        }, void 0, false, {
                                                                                            fileName: "[project]/Downloads/private-project/Preptime-private/web/components/ModernSchedule.tsx",
                                                                                            lineNumber: 305,
                                                                                            columnNumber: 89
                                                                                        }, ("TURBOPACK compile-time value", void 0)),
                                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                                                                            className: "text-xs text-white/80 mt-1",
                                                                                            children: [
                                                                                                formatHourDisplay(task.startHour),
                                                                                                " - ",
                                                                                                formatHourDisplay(task.endHour),
                                                                                                duration >= 1 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("span", {
                                                                                                    className: "ml-2",
                                                                                                    children: [
                                                                                                        "(",
                                                                                                        duration,
                                                                                                        "h)"
                                                                                                    ]
                                                                                                }, void 0, true, {
                                                                                                    fileName: "[project]/Downloads/private-project/Preptime-private/web/components/ModernSchedule.tsx",
                                                                                                    lineNumber: 311,
                                                                                                    columnNumber: 107
                                                                                                }, ("TURBOPACK compile-time value", void 0))
                                                                                            ]
                                                                                        }, void 0, true, {
                                                                                            fileName: "[project]/Downloads/private-project/Preptime-private/web/components/ModernSchedule.tsx",
                                                                                            lineNumber: 309,
                                                                                            columnNumber: 85
                                                                                        }, ("TURBOPACK compile-time value", void 0))
                                                                                    ]
                                                                                }, void 0, true, {
                                                                                    fileName: "[project]/Downloads/private-project/Preptime-private/web/components/ModernSchedule.tsx",
                                                                                    lineNumber: 285,
                                                                                    columnNumber: 81
                                                                                }, ("TURBOPACK compile-time value", void 0)),
                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("button", {
                                                                                    onClick: (e)=>{
                                                                                        e.stopPropagation();
                                                                                        onDeleteTask?.(task.id, e);
                                                                                    },
                                                                                    className: "opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity p-2 hover:bg-white/20 rounded-lg z-10",
                                                                                    title: "Delete task",
                                                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("svg", {
                                                                                        className: "w-4 h-4 text-white",
                                                                                        fill: "currentColor",
                                                                                        viewBox: "0 0 20 20",
                                                                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("path", {
                                                                                            fillRule: "evenodd",
                                                                                            d: "M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414 1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z",
                                                                                            clipRule: "evenodd"
                                                                                        }, void 0, false, {
                                                                                            fileName: "[project]/Downloads/private-project/Preptime-private/web/components/ModernSchedule.tsx",
                                                                                            lineNumber: 323,
                                                                                            columnNumber: 89
                                                                                        }, ("TURBOPACK compile-time value", void 0))
                                                                                    }, void 0, false, {
                                                                                        fileName: "[project]/Downloads/private-project/Preptime-private/web/components/ModernSchedule.tsx",
                                                                                        lineNumber: 322,
                                                                                        columnNumber: 85
                                                                                    }, ("TURBOPACK compile-time value", void 0))
                                                                                }, void 0, false, {
                                                                                    fileName: "[project]/Downloads/private-project/Preptime-private/web/components/ModernSchedule.tsx",
                                                                                    lineNumber: 314,
                                                                                    columnNumber: 81
                                                                                }, ("TURBOPACK compile-time value", void 0))
                                                                            ]
                                                                        }, void 0, true, {
                                                                            fileName: "[project]/Downloads/private-project/Preptime-private/web/components/ModernSchedule.tsx",
                                                                            lineNumber: 284,
                                                                            columnNumber: 77
                                                                        }, ("TURBOPACK compile-time value", void 0))
                                                                    }, task.id, false, {
                                                                        fileName: "[project]/Downloads/private-project/Preptime-private/web/components/ModernSchedule.tsx",
                                                                        lineNumber: 270,
                                                                        columnNumber: 73
                                                                    }, ("TURBOPACK compile-time value", void 0));
                                                                })
                                                            }, "tasks", false, {
                                                                fileName: "[project]/Downloads/private-project/Preptime-private/web/components/ModernSchedule.tsx",
                                                                lineNumber: 256,
                                                                columnNumber: 61
                                                            }, ("TURBOPACK compile-time value", void 0));
                                                        }
                                                        if (hourTasks.length > 0) return null;
                                                        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$externals$5d2f$framer$2d$motion__$5b$external$5d$__$28$framer$2d$motion$2c$__esm_import$2c$__$5b$project$5d2f$Downloads$2f$private$2d$project$2f$Preptime$2d$private$2f$web$2f$node_modules$2f$framer$2d$motion$29$__["motion"].div, {
                                                            initial: {
                                                                opacity: 0
                                                            },
                                                            animate: {
                                                                opacity: 1
                                                            },
                                                            exit: {
                                                                opacity: 0
                                                            },
                                                            className: "w-full flex justify-center",
                                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$externals$5d2f$framer$2d$motion__$5b$external$5d$__$28$framer$2d$motion$2c$__esm_import$2c$__$5b$project$5d2f$Downloads$2f$private$2d$project$2f$Preptime$2d$private$2f$web$2f$node_modules$2f$framer$2d$motion$29$__["AnimatePresence"], {
                                                                children: (isHovered || isCurrent) && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$externals$5d2f$framer$2d$motion__$5b$external$5d$__$28$framer$2d$motion$2c$__esm_import$2c$__$5b$project$5d2f$Downloads$2f$private$2d$project$2f$Preptime$2d$private$2f$web$2f$node_modules$2f$framer$2d$motion$29$__["motion"].button, {
                                                                    initial: {
                                                                        opacity: 0,
                                                                        scale: 0.8,
                                                                        pointerEvents: "none"
                                                                    },
                                                                    animate: {
                                                                        opacity: 1,
                                                                        scale: 1,
                                                                        pointerEvents: "auto",
                                                                        transition: {
                                                                            delay: 0.3
                                                                        }
                                                                    },
                                                                    exit: {
                                                                        opacity: 0,
                                                                        scale: 0.8
                                                                    },
                                                                    whileHover: {
                                                                        scale: 1.05
                                                                    },
                                                                    whileTap: {
                                                                        scale: 0.95
                                                                    },
                                                                    onClick: (e)=>{
                                                                        e.stopPropagation();
                                                                        if (getTasksForHour(hour).length === 0) {
                                                                            onAddTask(hour);
                                                                        }
                                                                    },
                                                                    className: `px-6 py-2.5 rounded-xl font-semibold text-sm flex items-center gap-2 shadow-lg transition-all ${isDark ? 'bg-indigo-600 text-white hover:bg-indigo-500 border border-indigo-500/50' : 'bg-indigo-600 text-white hover:bg-indigo-700 border border-indigo-700/20'}`,
                                                                    children: [
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("svg", {
                                                                            className: "w-4 h-4",
                                                                            fill: "none",
                                                                            viewBox: "0 0 24 24",
                                                                            stroke: "currentColor",
                                                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("path", {
                                                                                strokeLinecap: "round",
                                                                                strokeLinejoin: "round",
                                                                                strokeWidth: 2.5,
                                                                                d: "M12 4v16m8-8H4"
                                                                            }, void 0, false, {
                                                                                fileName: "[project]/Downloads/private-project/Preptime-private/web/components/ModernSchedule.tsx",
                                                                                lineNumber: 368,
                                                                                columnNumber: 77
                                                                            }, ("TURBOPACK compile-time value", void 0))
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/Downloads/private-project/Preptime-private/web/components/ModernSchedule.tsx",
                                                                            lineNumber: 367,
                                                                            columnNumber: 73
                                                                        }, ("TURBOPACK compile-time value", void 0)),
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("span", {
                                                                            children: "Add Task"
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/Downloads/private-project/Preptime-private/web/components/ModernSchedule.tsx",
                                                                            lineNumber: 370,
                                                                            columnNumber: 73
                                                                        }, ("TURBOPACK compile-time value", void 0))
                                                                    ]
                                                                }, void 0, true, {
                                                                    fileName: "[project]/Downloads/private-project/Preptime-private/web/components/ModernSchedule.tsx",
                                                                    lineNumber: 350,
                                                                    columnNumber: 69
                                                                }, ("TURBOPACK compile-time value", void 0))
                                                            }, void 0, false, {
                                                                fileName: "[project]/Downloads/private-project/Preptime-private/web/components/ModernSchedule.tsx",
                                                                lineNumber: 348,
                                                                columnNumber: 61
                                                            }, ("TURBOPACK compile-time value", void 0))
                                                        }, "add-button", false, {
                                                            fileName: "[project]/Downloads/private-project/Preptime-private/web/components/ModernSchedule.tsx",
                                                            lineNumber: 341,
                                                            columnNumber: 57
                                                        }, ("TURBOPACK compile-time value", void 0));
                                                    })()
                                                }, void 0, false, {
                                                    fileName: "[project]/Downloads/private-project/Preptime-private/web/components/ModernSchedule.tsx",
                                                    lineNumber: 250,
                                                    columnNumber: 45
                                                }, ("TURBOPACK compile-time value", void 0))
                                            }, void 0, false, {
                                                fileName: "[project]/Downloads/private-project/Preptime-private/web/components/ModernSchedule.tsx",
                                                lineNumber: 249,
                                                columnNumber: 41
                                            }, ("TURBOPACK compile-time value", void 0)),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                                className: "flex-shrink-0 w-24 text-right",
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                                    className: `text-xs font-medium px-3 py-1.5 rounded-lg inline-block ${isCurrent ? isDark ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30' : 'bg-indigo-100 text-indigo-700 border border-indigo-300' : isDark ? 'bg-slate-700/50 text-slate-400' : 'bg-slate-100 text-slate-600'}`,
                                                    children: category.split('-').map((word)=>word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
                                                }, void 0, false, {
                                                    fileName: "[project]/Downloads/private-project/Preptime-private/web/components/ModernSchedule.tsx",
                                                    lineNumber: 381,
                                                    columnNumber: 45
                                                }, ("TURBOPACK compile-time value", void 0))
                                            }, void 0, false, {
                                                fileName: "[project]/Downloads/private-project/Preptime-private/web/components/ModernSchedule.tsx",
                                                lineNumber: 380,
                                                columnNumber: 41
                                            }, ("TURBOPACK compile-time value", void 0))
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/Downloads/private-project/Preptime-private/web/components/ModernSchedule.tsx",
                                        lineNumber: 216,
                                        columnNumber: 37
                                    }, ("TURBOPACK compile-time value", void 0))
                                ]
                            }, void 0, true, {
                                fileName: "[project]/Downloads/private-project/Preptime-private/web/components/ModernSchedule.tsx",
                                lineNumber: 197,
                                columnNumber: 33
                            }, ("TURBOPACK compile-time value", void 0))
                        }, hour, false, {
                            fileName: "[project]/Downloads/private-project/Preptime-private/web/components/ModernSchedule.tsx",
                            lineNumber: 188,
                            columnNumber: 29
                        }, ("TURBOPACK compile-time value", void 0));
                    })
                }, void 0, false, {
                    fileName: "[project]/Downloads/private-project/Preptime-private/web/components/ModernSchedule.tsx",
                    lineNumber: 180,
                    columnNumber: 17
                }, ("TURBOPACK compile-time value", void 0)),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$externals$5d2f$framer$2d$motion__$5b$external$5d$__$28$framer$2d$motion$2c$__esm_import$2c$__$5b$project$5d2f$Downloads$2f$private$2d$project$2f$Preptime$2d$private$2f$web$2f$node_modules$2f$framer$2d$motion$29$__["AnimatePresence"], {
                    children: currentHour >= 0 && currentHour < 24 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$externals$5d2f$framer$2d$motion__$5b$external$5d$__$28$framer$2d$motion$2c$__esm_import$2c$__$5b$project$5d2f$Downloads$2f$private$2d$project$2f$Preptime$2d$private$2f$web$2f$node_modules$2f$framer$2d$motion$29$__["motion"].div, {
                        initial: {
                            opacity: 0,
                            x: -20
                        },
                        animate: {
                            opacity: 1,
                            x: 0
                        },
                        exit: {
                            opacity: 0,
                            x: -20
                        },
                        className: `fixed bottom-6 right-6 px-4 py-3 rounded-2xl shadow-2xl backdrop-blur-md border-2 ${isDark ? 'bg-slate-800/90 border-indigo-500/50 text-white' : 'bg-white/90 border-indigo-400 text-slate-900'}`,
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                            className: "flex items-center gap-3",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                    className: `w-2 h-2 rounded-full animate-pulse ${isDark ? 'bg-indigo-400' : 'bg-indigo-600'}`
                                }, void 0, false, {
                                    fileName: "[project]/Downloads/private-project/Preptime-private/web/components/ModernSchedule.tsx",
                                    lineNumber: 414,
                                    columnNumber: 33
                                }, ("TURBOPACK compile-time value", void 0)),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                            className: "text-xs font-medium opacity-70",
                                            children: "Current Time"
                                        }, void 0, false, {
                                            fileName: "[project]/Downloads/private-project/Preptime-private/web/components/ModernSchedule.tsx",
                                            lineNumber: 417,
                                            columnNumber: 37
                                        }, ("TURBOPACK compile-time value", void 0)),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                            className: "text-sm font-bold",
                                            suppressHydrationWarning: true,
                                            children: currentTime.toLocaleTimeString('en-US', {
                                                hour: 'numeric',
                                                minute: '2-digit',
                                                hour12: true
                                            })
                                        }, void 0, false, {
                                            fileName: "[project]/Downloads/private-project/Preptime-private/web/components/ModernSchedule.tsx",
                                            lineNumber: 418,
                                            columnNumber: 37
                                        }, ("TURBOPACK compile-time value", void 0))
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/Downloads/private-project/Preptime-private/web/components/ModernSchedule.tsx",
                                    lineNumber: 416,
                                    columnNumber: 33
                                }, ("TURBOPACK compile-time value", void 0))
                            ]
                        }, void 0, true, {
                            fileName: "[project]/Downloads/private-project/Preptime-private/web/components/ModernSchedule.tsx",
                            lineNumber: 413,
                            columnNumber: 29
                        }, ("TURBOPACK compile-time value", void 0))
                    }, void 0, false, {
                        fileName: "[project]/Downloads/private-project/Preptime-private/web/components/ModernSchedule.tsx",
                        lineNumber: 404,
                        columnNumber: 25
                    }, ("TURBOPACK compile-time value", void 0))
                }, void 0, false, {
                    fileName: "[project]/Downloads/private-project/Preptime-private/web/components/ModernSchedule.tsx",
                    lineNumber: 402,
                    columnNumber: 17
                }, ("TURBOPACK compile-time value", void 0))
            ]
        }, void 0, true, {
            fileName: "[project]/Downloads/private-project/Preptime-private/web/components/ModernSchedule.tsx",
            lineNumber: 178,
            columnNumber: 13
        }, ("TURBOPACK compile-time value", void 0))
    }, void 0, false, {
        fileName: "[project]/Downloads/private-project/Preptime-private/web/components/ModernSchedule.tsx",
        lineNumber: 176,
        columnNumber: 9
    }, ("TURBOPACK compile-time value", void 0));
};
const __TURBOPACK__default__export__ = ModernSchedule;
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/Downloads/private-project/Preptime-private/web/components/MonthGeneratorButton.tsx [ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "default",
    ()=>MonthGeneratorButton
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/react/jsx-dev-runtime [external] (react/jsx-dev-runtime, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/react [external] (react, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$framer$2d$motion__$5b$external$5d$__$28$framer$2d$motion$2c$__esm_import$2c$__$5b$project$5d2f$Downloads$2f$private$2d$project$2f$Preptime$2d$private$2f$web$2f$node_modules$2f$framer$2d$motion$29$__ = __turbopack_context__.i("[externals]/framer-motion [external] (framer-motion, esm_import, [project]/Downloads/private-project/Preptime-private/web/node_modules/framer-motion)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$externals$5d2f$framer$2d$motion__$5b$external$5d$__$28$framer$2d$motion$2c$__esm_import$2c$__$5b$project$5d2f$Downloads$2f$private$2d$project$2f$Preptime$2d$private$2f$web$2f$node_modules$2f$framer$2d$motion$29$__
]);
[__TURBOPACK__imported__module__$5b$externals$5d2f$framer$2d$motion__$5b$external$5d$__$28$framer$2d$motion$2c$__esm_import$2c$__$5b$project$5d2f$Downloads$2f$private$2d$project$2f$Preptime$2d$private$2f$web$2f$node_modules$2f$framer$2d$motion$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
;
function MonthGeneratorButton({ week1Blocks, week1Tasks, existingEvents, preferences, onMonthGenerated, disabled = false }) {
    const [loading, setLoading] = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useState"])(false);
    const [error, setError] = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useState"])(null);
    const [loadingStep, setLoadingStep] = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useState"])(0);
    const canGenerate = week1Blocks.length >= 5; // Need at least 5 tasks in Week 1
    const loadingSteps = [
        {
            icon: '🧠',
            text: 'Analyzing your Week 1 patterns...'
        },
        {
            icon: '📊',
            text: 'Detecting productivity trends...'
        },
        {
            icon: '⚡',
            text: 'Optimizing task distribution...'
        },
        {
            icon: '🎯',
            text: 'Applying AI techniques...'
        },
        {
            icon: '✨',
            text: 'Generating your schedule...'
        }
    ];
    const handleGenerate = async ()=>{
        if (!canGenerate) {
            setError('Please schedule at least 5 tasks in Week 1 before generating the rest of the month.');
            return;
        }
        setLoading(true);
        setError(null);
        setLoadingStep(0);
        // Track start time for minimum display duration
        const startTime = Date.now();
        const minDisplayTime = 4000; // 4 seconds minimum (5 steps × 800ms)
        // Animate through loading steps
        const stepInterval = setInterval(()=>{
            setLoadingStep((prev)=>{
                if (prev < loadingSteps.length - 1) return prev + 1;
                return prev;
            });
        }, 800);
        try {
            console.log('Starting month generation...');
            console.log('Week 1 blocks:', week1Blocks);
            console.log('Week 1 tasks:', week1Tasks);
            console.log('Week 1 tasks sample:', week1Tasks[0]);
            console.log('Week 1 task colors:', week1Tasks.map((t)=>({
                    title: t.title,
                    color: t.color
                })));
            // Calculate Week 2 start date (7 days from now, or from Week 1 end)
            const week2Start = new Date();
            week2Start.setDate(week2Start.getDate() + 7);
            console.log('Calling API with start date:', week2Start.toISOString());
            const response = await fetch('/api/generate-month', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    week1Blocks,
                    week1Tasks,
                    existingEvents,
                    preferences,
                    startDate: week2Start.toISOString()
                })
            });
            console.log('API response status:', response.status);
            if (!response.ok) {
                const errorText = await response.text();
                console.error('API error response:', errorText);
                throw new Error(`Failed to generate month: ${response.statusText} - ${errorText}`);
            }
            const result = await response.json();
            console.log('Generation result:', result);
            console.log('Generated tasks count:', result.generatedTasks?.length);
            console.log('Scheduled blocks count:', result.scheduledBlocks?.length);
            console.log('Sample generated task:', result.generatedTasks?.[0]);
            console.log('Sample scheduled block:', result.scheduledBlocks?.[0]);
            // Calculate remaining time to show loading animation
            const elapsedTime = Date.now() - startTime;
            const remainingTime = Math.max(0, minDisplayTime - elapsedTime);
            console.log(`API took ${elapsedTime}ms, waiting ${remainingTime}ms more for animation`);
            // Wait for minimum display time before clearing
            setTimeout(()=>{
                clearInterval(stepInterval);
                // Auto-apply the generated schedule
                onMonthGenerated(result);
                console.log('Successfully applied generated schedule');
                // Brief delay before hiding loading screen
                setTimeout(()=>{
                    setLoading(false);
                }, 500);
            }, remainingTime);
        } catch (err) {
            console.error('Month generation error:', err);
            clearInterval(stepInterval);
            const errorMessage = err instanceof Error ? err.message : 'Failed to generate month schedule';
            setError(errorMessage);
            setLoading(false);
            // Show error in alert as fallback
            alert(`Error generating month: ${errorMessage}`);
        }
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
        className: "space-y-4",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                className: "flex items-center gap-4",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("button", {
                        onClick: handleGenerate,
                        disabled: disabled || !canGenerate || loading,
                        suppressHydrationWarning: true,
                        className: `
            px-6 py-3 rounded-lg font-medium text-white
            transition-all duration-200 transform
            ${canGenerate && !disabled && !loading ? 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 hover:scale-105 shadow-lg hover:shadow-xl' : 'bg-gray-400 cursor-not-allowed'}
          `,
                        children: loading ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("span", {
                            className: "flex items-center gap-2",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("svg", {
                                    className: "animate-spin h-5 w-5",
                                    viewBox: "0 0 24 24",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("circle", {
                                            className: "opacity-25",
                                            cx: "12",
                                            cy: "12",
                                            r: "10",
                                            stroke: "currentColor",
                                            strokeWidth: "4",
                                            fill: "none"
                                        }, void 0, false, {
                                            fileName: "[project]/Downloads/private-project/Preptime-private/web/components/MonthGeneratorButton.tsx",
                                            lineNumber: 169,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("path", {
                                            className: "opacity-75",
                                            fill: "currentColor",
                                            d: "M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                        }, void 0, false, {
                                            fileName: "[project]/Downloads/private-project/Preptime-private/web/components/MonthGeneratorButton.tsx",
                                            lineNumber: 178,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/Downloads/private-project/Preptime-private/web/components/MonthGeneratorButton.tsx",
                                    lineNumber: 168,
                                    columnNumber: 15
                                }, this),
                                "Generating..."
                            ]
                        }, void 0, true, {
                            fileName: "[project]/Downloads/private-project/Preptime-private/web/components/MonthGeneratorButton.tsx",
                            lineNumber: 167,
                            columnNumber: 13
                        }, this) : '✨ Generate Rest of Month'
                    }, void 0, false, {
                        fileName: "[project]/Downloads/private-project/Preptime-private/web/components/MonthGeneratorButton.tsx",
                        lineNumber: 152,
                        columnNumber: 9
                    }, this),
                    !canGenerate && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("p", {
                        className: "text-sm text-gray-600",
                        suppressHydrationWarning: true,
                        children: "Schedule at least 5 tasks in Week 1 to enable AI generation"
                    }, void 0, false, {
                        fileName: "[project]/Downloads/private-project/Preptime-private/web/components/MonthGeneratorButton.tsx",
                        lineNumber: 192,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/Downloads/private-project/Preptime-private/web/components/MonthGeneratorButton.tsx",
                lineNumber: 151,
                columnNumber: 7
            }, this),
            error && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                className: "p-4 bg-red-50 border border-red-200 rounded-lg text-red-700",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("p", {
                        className: "font-medium",
                        children: "Error"
                    }, void 0, false, {
                        fileName: "[project]/Downloads/private-project/Preptime-private/web/components/MonthGeneratorButton.tsx",
                        lineNumber: 201,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("p", {
                        className: "text-sm",
                        children: error
                    }, void 0, false, {
                        fileName: "[project]/Downloads/private-project/Preptime-private/web/components/MonthGeneratorButton.tsx",
                        lineNumber: 202,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/Downloads/private-project/Preptime-private/web/components/MonthGeneratorButton.tsx",
                lineNumber: 200,
                columnNumber: 9
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$externals$5d2f$framer$2d$motion__$5b$external$5d$__$28$framer$2d$motion$2c$__esm_import$2c$__$5b$project$5d2f$Downloads$2f$private$2d$project$2f$Preptime$2d$private$2f$web$2f$node_modules$2f$framer$2d$motion$29$__["AnimatePresence"], {
                children: loading && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$externals$5d2f$framer$2d$motion__$5b$external$5d$__$28$framer$2d$motion$2c$__esm_import$2c$__$5b$project$5d2f$Downloads$2f$private$2d$project$2f$Preptime$2d$private$2f$web$2f$node_modules$2f$framer$2d$motion$29$__["motion"].div, {
                    initial: {
                        opacity: 0
                    },
                    animate: {
                        opacity: 1
                    },
                    exit: {
                        opacity: 0
                    },
                    className: "fixed inset-0 bg-gradient-to-br from-purple-900/95 via-indigo-900/95 to-blue-900/95 backdrop-blur-sm flex items-center justify-center z-50",
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$externals$5d2f$framer$2d$motion__$5b$external$5d$__$28$framer$2d$motion$2c$__esm_import$2c$__$5b$project$5d2f$Downloads$2f$private$2d$project$2f$Preptime$2d$private$2f$web$2f$node_modules$2f$framer$2d$motion$29$__["motion"].div, {
                        initial: {
                            scale: 0.8,
                            opacity: 0
                        },
                        animate: {
                            scale: 1,
                            opacity: 1
                        },
                        exit: {
                            scale: 0.8,
                            opacity: 0
                        },
                        className: "bg-white/10 backdrop-blur-xl rounded-3xl p-12 max-w-md w-full mx-4 border border-white/20 shadow-2xl",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$externals$5d2f$framer$2d$motion__$5b$external$5d$__$28$framer$2d$motion$2c$__esm_import$2c$__$5b$project$5d2f$Downloads$2f$private$2d$project$2f$Preptime$2d$private$2f$web$2f$node_modules$2f$framer$2d$motion$29$__["motion"].div, {
                                animate: {
                                    scale: [
                                        1,
                                        1.2,
                                        1
                                    ],
                                    rotate: [
                                        0,
                                        360
                                    ]
                                },
                                transition: {
                                    duration: 2,
                                    repeat: Infinity,
                                    ease: "easeInOut"
                                },
                                className: "text-8xl text-center mb-8",
                                children: loadingSteps[loadingStep].icon
                            }, void 0, false, {
                                fileName: "[project]/Downloads/private-project/Preptime-private/web/components/MonthGeneratorButton.tsx",
                                lineNumber: 222,
                                columnNumber: 15
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$externals$5d2f$framer$2d$motion__$5b$external$5d$__$28$framer$2d$motion$2c$__esm_import$2c$__$5b$project$5d2f$Downloads$2f$private$2d$project$2f$Preptime$2d$private$2f$web$2f$node_modules$2f$framer$2d$motion$29$__["AnimatePresence"], {
                                mode: "wait",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$externals$5d2f$framer$2d$motion__$5b$external$5d$__$28$framer$2d$motion$2c$__esm_import$2c$__$5b$project$5d2f$Downloads$2f$private$2d$project$2f$Preptime$2d$private$2f$web$2f$node_modules$2f$framer$2d$motion$29$__["motion"].div, {
                                    initial: {
                                        opacity: 0,
                                        y: 20
                                    },
                                    animate: {
                                        opacity: 1,
                                        y: 0
                                    },
                                    exit: {
                                        opacity: 0,
                                        y: -20
                                    },
                                    transition: {
                                        duration: 0.3
                                    },
                                    className: "text-center",
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("h3", {
                                        className: "text-2xl font-bold text-white mb-2",
                                        children: loadingSteps[loadingStep].text
                                    }, void 0, false, {
                                        fileName: "[project]/Downloads/private-project/Preptime-private/web/components/MonthGeneratorButton.tsx",
                                        lineNumber: 247,
                                        columnNumber: 19
                                    }, this)
                                }, loadingStep, false, {
                                    fileName: "[project]/Downloads/private-project/Preptime-private/web/components/MonthGeneratorButton.tsx",
                                    lineNumber: 239,
                                    columnNumber: 17
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/Downloads/private-project/Preptime-private/web/components/MonthGeneratorButton.tsx",
                                lineNumber: 238,
                                columnNumber: 15
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                className: "mt-8 bg-white/20 rounded-full h-2 overflow-hidden",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$externals$5d2f$framer$2d$motion__$5b$external$5d$__$28$framer$2d$motion$2c$__esm_import$2c$__$5b$project$5d2f$Downloads$2f$private$2d$project$2f$Preptime$2d$private$2f$web$2f$node_modules$2f$framer$2d$motion$29$__["motion"].div, {
                                    initial: {
                                        width: '0%'
                                    },
                                    animate: {
                                        width: `${(loadingStep + 1) / loadingSteps.length * 100}%`
                                    },
                                    transition: {
                                        duration: 0.5
                                    },
                                    className: "h-full bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400"
                                }, void 0, false, {
                                    fileName: "[project]/Downloads/private-project/Preptime-private/web/components/MonthGeneratorButton.tsx",
                                    lineNumber: 255,
                                    columnNumber: 17
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/Downloads/private-project/Preptime-private/web/components/MonthGeneratorButton.tsx",
                                lineNumber: 254,
                                columnNumber: 15
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                className: "mt-4 text-center text-white/70 text-sm",
                                children: [
                                    "Step ",
                                    loadingStep + 1,
                                    " of ",
                                    loadingSteps.length
                                ]
                            }, void 0, true, {
                                fileName: "[project]/Downloads/private-project/Preptime-private/web/components/MonthGeneratorButton.tsx",
                                lineNumber: 264,
                                columnNumber: 15
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                className: "absolute inset-0 pointer-events-none overflow-hidden rounded-3xl",
                                children: [
                                    ...Array(20)
                                ].map((_, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$externals$5d2f$framer$2d$motion__$5b$external$5d$__$28$framer$2d$motion$2c$__esm_import$2c$__$5b$project$5d2f$Downloads$2f$private$2d$project$2f$Preptime$2d$private$2f$web$2f$node_modules$2f$framer$2d$motion$29$__["motion"].div, {
                                        initial: {
                                            x: Math.random() * 400,
                                            y: Math.random() * 400,
                                            opacity: 0
                                        },
                                        animate: {
                                            y: [
                                                null,
                                                Math.random() * -100
                                            ],
                                            opacity: [
                                                0,
                                                1,
                                                0
                                            ]
                                        },
                                        transition: {
                                            duration: 2 + Math.random() * 2,
                                            repeat: Infinity,
                                            delay: Math.random() * 2
                                        },
                                        className: "absolute w-2 h-2 bg-white rounded-full"
                                    }, i, false, {
                                        fileName: "[project]/Downloads/private-project/Preptime-private/web/components/MonthGeneratorButton.tsx",
                                        lineNumber: 271,
                                        columnNumber: 19
                                    }, this))
                            }, void 0, false, {
                                fileName: "[project]/Downloads/private-project/Preptime-private/web/components/MonthGeneratorButton.tsx",
                                lineNumber: 269,
                                columnNumber: 15
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/Downloads/private-project/Preptime-private/web/components/MonthGeneratorButton.tsx",
                        lineNumber: 215,
                        columnNumber: 13
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/Downloads/private-project/Preptime-private/web/components/MonthGeneratorButton.tsx",
                    lineNumber: 209,
                    columnNumber: 11
                }, this)
            }, void 0, false, {
                fileName: "[project]/Downloads/private-project/Preptime-private/web/components/MonthGeneratorButton.tsx",
                lineNumber: 207,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/Downloads/private-project/Preptime-private/web/components/MonthGeneratorButton.tsx",
        lineNumber: 149,
        columnNumber: 5
    }, this);
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/Downloads/private-project/Preptime-private/web/pages/index.tsx [ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "default",
    ()=>Home
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/react/jsx-dev-runtime [external] (react/jsx-dev-runtime, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/react [external] (react, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$framer$2d$motion__$5b$external$5d$__$28$framer$2d$motion$2c$__esm_import$2c$__$5b$project$5d2f$Downloads$2f$private$2d$project$2f$Preptime$2d$private$2f$web$2f$node_modules$2f$framer$2d$motion$29$__ = __turbopack_context__.i("[externals]/framer-motion [external] (framer-motion, esm_import, [project]/Downloads/private-project/Preptime-private/web/node_modules/framer-motion)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$private$2d$project$2f$Preptime$2d$private$2f$web$2f$components$2f$ModernSchedule$2e$tsx__$5b$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Downloads/private-project/Preptime-private/web/components/ModernSchedule.tsx [ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$private$2d$project$2f$Preptime$2d$private$2f$web$2f$components$2f$MonthGeneratorButton$2e$tsx__$5b$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Downloads/private-project/Preptime-private/web/components/MonthGeneratorButton.tsx [ssr] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$externals$5d2f$framer$2d$motion__$5b$external$5d$__$28$framer$2d$motion$2c$__esm_import$2c$__$5b$project$5d2f$Downloads$2f$private$2d$project$2f$Preptime$2d$private$2f$web$2f$node_modules$2f$framer$2d$motion$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$private$2d$project$2f$Preptime$2d$private$2f$web$2f$components$2f$ModernSchedule$2e$tsx__$5b$ssr$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$private$2d$project$2f$Preptime$2d$private$2f$web$2f$components$2f$MonthGeneratorButton$2e$tsx__$5b$ssr$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$externals$5d2f$framer$2d$motion__$5b$external$5d$__$28$framer$2d$motion$2c$__esm_import$2c$__$5b$project$5d2f$Downloads$2f$private$2d$project$2f$Preptime$2d$private$2f$web$2f$node_modules$2f$framer$2d$motion$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$private$2d$project$2f$Preptime$2d$private$2f$web$2f$components$2f$ModernSchedule$2e$tsx__$5b$ssr$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$private$2d$project$2f$Preptime$2d$private$2f$web$2f$components$2f$MonthGeneratorButton$2e$tsx__$5b$ssr$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
"use client";
;
;
;
;
;
const days = [
    "Mon",
    "Tue",
    "Wed",
    "Thu",
    "Fri",
    "Sat",
    "Sun"
];
const daysFull = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday"
];
const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December"
];
const startHour = 0;
const endHour = 24;
const modes = [
    {
        value: "balanced",
        label: "Balanced",
        icon: "⚖️",
        description: "Mixed strategy",
        gradient: "from-indigo-600 to-blue-600"
    },
    {
        value: "study",
        label: "Study",
        icon: "📚",
        description: "Spacing & retention",
        gradient: "from-purple-600 to-pink-600"
    },
    {
        value: "lockin",
        label: "Lock-In",
        icon: "🔒",
        description: "Deep work blocks",
        gradient: "from-orange-600 to-red-600"
    },
    {
        value: "relax",
        label: "Relax",
        icon: "🌿",
        description: "Recovery time",
        gradient: "from-green-600 to-teal-600"
    }
];
const views = [
    {
        value: "day",
        label: "Day"
    },
    {
        value: "week",
        label: "Week"
    },
    {
        value: "month",
        label: "Month"
    },
    {
        value: "season",
        label: "Season"
    },
    {
        value: "year",
        label: "Year"
    }
];
const taskColors = [
    {
        name: "Cyan",
        value: "bg-cyan-500"
    },
    {
        name: "Blue",
        value: "bg-blue-500"
    },
    {
        name: "Indigo",
        value: "bg-indigo-500"
    },
    {
        name: "Purple",
        value: "bg-purple-500"
    },
    {
        name: "Pink",
        value: "bg-pink-500"
    },
    {
        name: "Rose",
        value: "bg-rose-500"
    },
    {
        name: "Red",
        value: "bg-red-500"
    },
    {
        name: "Orange",
        value: "bg-orange-500"
    },
    {
        name: "Amber",
        value: "bg-amber-500"
    },
    {
        name: "Yellow",
        value: "bg-yellow-500"
    },
    {
        name: "Lime",
        value: "bg-lime-500"
    },
    {
        name: "Green",
        value: "bg-green-500"
    },
    {
        name: "Emerald",
        value: "bg-emerald-500"
    },
    {
        name: "Teal",
        value: "bg-teal-500"
    },
    {
        name: "Sky",
        value: "bg-sky-500"
    },
    {
        name: "Slate",
        value: "bg-slate-500"
    },
    {
        name: "Gray",
        value: "bg-gray-500"
    },
    {
        name: "Zinc",
        value: "bg-zinc-500"
    },
    {
        name: "Stone",
        value: "bg-stone-500"
    },
    {
        name: "Neutral",
        value: "bg-neutral-500"
    }
];
function pad2(n) {
    return (n < 10 ? "0" : "") + n;
}
function normalizeTimeString(input) {
    const raw = String(input ?? "").trim();
    if (!raw) return "00:00";
    const colon = raw.match(/^(\d{1,2}):(\d{2})$/);
    if (colon) {
        let hh = Number(colon[1]);
        let mm = Number(colon[2]);
        if (!Number.isFinite(hh)) hh = 0;
        if (!Number.isFinite(mm)) mm = 0;
        hh = Math.max(0, Math.min(24, hh));
        mm = Math.max(0, Math.min(59, mm));
        return `${pad2(hh)}:${pad2(mm)}`;
    }
    const digits = raw.replace(/\D/g, "");
    if (digits.length === 4) {
        const hh = Number(digits.slice(0, 2));
        const mm = Number(digits.slice(2, 4));
        return normalizeTimeString(`${hh}:${pad2(mm)}`);
    }
    if (digits.length === 3) {
        const hh = Number(digits.slice(0, 1));
        const mm = Number(digits.slice(1, 3));
        return normalizeTimeString(`${hh}:${pad2(mm)}`);
    }
    if (digits.length === 2) {
        const hh = Number(digits);
        return normalizeTimeString(`${hh}:00`);
    }
    return "00:00";
}
function parseTimeParts(input) {
    const norm = normalizeTimeString(input);
    const [hh, mm] = norm.split(":").map(Number);
    return [
        Number.isFinite(hh) ? hh : 0,
        Number.isFinite(mm) ? mm : 0
    ];
}
function toISODate(d) {
    return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}
function sameISO(a, b) {
    return a === b;
}
function formatTime(t) {
    const h = Number(t.slice(0, 2));
    const m = Number(t.slice(3, 5));
    const am = h < 12;
    const hh = (h + 11) % 12 + 1;
    return `${hh}:${pad2(m)} ${am ? "AM" : "PM"}`;
}
function fmtDateLong(d) {
    const days = [
        "Sun",
        "Mon",
        "Tue",
        "Wed",
        "Thu",
        "Fri",
        "Sat"
    ];
    const months = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec"
    ];
    return `${days[d.getDay()]}, ${months[d.getMonth()]} ${d.getDate()}`;
}
function fmtClock(d) {
    const hh = d.getHours();
    const mm = d.getMinutes();
    const am = hh < 12;
    const h12 = (hh + 11) % 12 + 1;
    return `${h12}:${pad2(mm)} ${am ? "AM" : "PM"}`;
}
function toDateForTime(selectedDate, hhmm) {
    const [hh, mm] = hhmm.split(":").map(Number);
    const d = new Date(selectedDate);
    d.setHours(hh, mm, 0, 0);
    return d;
}
function fmtCountdownSmart(totalSec) {
    const s = Math.max(0, Math.floor(totalSec));
    const h = Math.floor(s / 3600);
    const rem = s - h * 3600;
    const m = Math.floor(rem / 60);
    const ss = rem % 60;
    if (h === 0) return `${m}:${pad2(ss)}`;
    return `${h}:${pad2(m)}:${pad2(ss)}`;
}
function timeToMinutes(hhmm) {
    const [hh, mm] = parseTimeParts(hhmm);
    return hh * 60 + mm;
}
function uid() {
    return `b_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 9)}`;
}
// Force 0..24 range and fix common double-PM bugs (e.g. 17 PM becoming 29)
function normalizeHour24(hour) {
    let h = Number(hour);
    if (!Number.isFinite(h)) return 0;
    // keep 24 as 24 (valid as an end-time)
    if (h === 24) return 24;
    // fix double-PM bugs like 25..36 -> subtract 12
    while(h > 24)h -= 12;
    if (h < 0) h = 0;
    return h;
}
function formatHour(h) {
    const hour = Math.floor(h);
    if (hour === 0 || hour === 24) return "12 AM";
    if (hour === 12) return "12 PM";
    if (hour > 12) return `${hour - 12} PM`;
    return `${hour} AM`;
}
function getMonday(date) {
    const d = new Date(date);
    const day = d.getDay();
    const diff = (day === 0 ? -6 : 1) - day;
    d.setDate(d.getDate() + diff);
    d.setHours(0, 0, 0, 0);
    return d;
}
function addDays(date, days) {
    const d = new Date(date);
    d.setDate(d.getDate() + days);
    return d;
}
function formatDate(date) {
    return months[date.getMonth()] + " " + date.getDate();
}
function formatFullDate(date) {
    return daysFull[date.getDay()] + ", " + months[date.getMonth()] + " " + date.getDate() + ", " + date.getFullYear();
}
function formatFullWeek(monday) {
    const sunday = addDays(monday, 6);
    return formatDate(monday) + " - " + formatDate(sunday) + ", " + monday.getFullYear();
}
function formatDateKey(date) {
    return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, "0")}-${date.getDate().toString().padStart(2, "0")}`;
}
function hourToTimeString(hour) {
    const h = Math.floor(hour);
    const m = hour % 1 * 60;
    const hours = h.toString().padStart(2, "0");
    const minutes = m.toString().padStart(2, "0");
    return `${hours}:${minutes}`;
}
function hourToAmPm(hour) {
    return hour >= 12 ? "PM" : "AM";
}
// Fixed function: correctly handles 24h input vs 12h input
function timeStringToHour(time, ampm) {
    const [hoursRaw, minutesRaw] = time.split(":").map(Number);
    const minutes = Number.isFinite(minutesRaw) ? minutesRaw : 0;
    let h = hoursRaw;
    // If browser input is already giving us 13..23, we ignore AM/PM
    // (Browser time inputs are usually 24h value under the hood)
    if (h > 12) {
        return h + minutes / 60;
    }
    // Special case: 12 PM = 12, 12 AM = 0
    // Standard 12-hour logic
    if (ampm === "PM" && h !== 12) h += 12;
    if (ampm === "AM" && h === 12) h = 0;
    return h + minutes / 60;
}
function getDaysInMonth(year, month) {
    return new Date(year, month + 1, 0).getDate();
}
function getFirstDayOfMonth(year, month) {
    const day = new Date(year, month, 1).getDay();
    return day === 0 ? 6 : day - 1;
}
function getSeason(date) {
    const month = date.getMonth();
    if (month >= 2 && month <= 4) return "Spring";
    if (month >= 5 && month <= 7) return "Summer";
    if (month >= 8 && month <= 10) return "Fall";
    return "Winter";
}
function PlusIcon({ className = "" }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("svg", {
        className: className,
        viewBox: "0 0 24 24",
        fill: "none",
        "aria-hidden": "true",
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("path", {
            d: "M12 5v14M5 12h14",
            stroke: "currentColor",
            strokeWidth: "2",
            strokeLinecap: "round"
        }, void 0, false, {
            fileName: "[project]/Downloads/private-project/Preptime-private/web/pages/index.tsx",
            lineNumber: 375,
            columnNumber: 13
        }, this)
    }, void 0, false, {
        fileName: "[project]/Downloads/private-project/Preptime-private/web/pages/index.tsx",
        lineNumber: 369,
        columnNumber: 9
    }, this);
}
function TrashIcon({ className = "" }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("svg", {
        className: className,
        viewBox: "0 0 24 24",
        fill: "none",
        "aria-hidden": "true",
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("path", {
            d: "M9 3h6m-8 4h10m-9 0 1 14h6l1-14M10 11v6m4-6v6",
            stroke: "currentColor",
            strokeWidth: "2",
            strokeLinecap: "round",
            strokeLinejoin: "round"
        }, void 0, false, {
            fileName: "[project]/Downloads/private-project/Preptime-private/web/pages/index.tsx",
            lineNumber: 393,
            columnNumber: 13
        }, this)
    }, void 0, false, {
        fileName: "[project]/Downloads/private-project/Preptime-private/web/pages/index.tsx",
        lineNumber: 387,
        columnNumber: 9
    }, this);
}
function DotsIcon({ className = "" }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("svg", {
        className: className,
        viewBox: "0 0 24 24",
        fill: "none",
        "aria-hidden": "true",
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("path", {
            d: "M6 12h.01M12 12h.01M18 12h.01",
            stroke: "currentColor",
            strokeWidth: "3",
            strokeLinecap: "round"
        }, void 0, false, {
            fileName: "[project]/Downloads/private-project/Preptime-private/web/pages/index.tsx",
            lineNumber: 412,
            columnNumber: 13
        }, this)
    }, void 0, false, {
        fileName: "[project]/Downloads/private-project/Preptime-private/web/pages/index.tsx",
        lineNumber: 406,
        columnNumber: 9
    }, this);
}
function CalendarIcon({ className = "" }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("svg", {
        className: className,
        fill: "none",
        viewBox: "0 0 24 24",
        stroke: "currentColor",
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("path", {
            strokeLinecap: "round",
            strokeLinejoin: "round",
            strokeWidth: 2,
            d: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
        }, void 0, false, {
            fileName: "[project]/Downloads/private-project/Preptime-private/web/pages/index.tsx",
            lineNumber: 430,
            columnNumber: 13
        }, this)
    }, void 0, false, {
        fileName: "[project]/Downloads/private-project/Preptime-private/web/pages/index.tsx",
        lineNumber: 424,
        columnNumber: 9
    }, this);
}
function ClockIcon({ className = "" }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("svg", {
        className: className,
        fill: "none",
        viewBox: "0 0 24 24",
        stroke: "currentColor",
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("path", {
            strokeLinecap: "round",
            strokeLinejoin: "round",
            strokeWidth: 2,
            d: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
        }, void 0, false, {
            fileName: "[project]/Downloads/private-project/Preptime-private/web/pages/index.tsx",
            lineNumber: 448,
            columnNumber: 13
        }, this)
    }, void 0, false, {
        fileName: "[project]/Downloads/private-project/Preptime-private/web/pages/index.tsx",
        lineNumber: 442,
        columnNumber: 9
    }, this);
}
function BookIcon({ className = "" }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("svg", {
        className: className,
        fill: "none",
        viewBox: "0 0 24 24",
        stroke: "currentColor",
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("path", {
            strokeLinecap: "round",
            strokeLinejoin: "round",
            strokeWidth: 2,
            d: "M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
        }, void 0, false, {
            fileName: "[project]/Downloads/private-project/Preptime-private/web/pages/index.tsx",
            lineNumber: 466,
            columnNumber: 13
        }, this)
    }, void 0, false, {
        fileName: "[project]/Downloads/private-project/Preptime-private/web/pages/index.tsx",
        lineNumber: 460,
        columnNumber: 9
    }, this);
}
function TagIcon({ className = "" }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("svg", {
        className: className,
        fill: "none",
        viewBox: "0 0 24 24",
        stroke: "currentColor",
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("path", {
            strokeLinecap: "round",
            strokeLinejoin: "round",
            strokeWidth: 2,
            d: "M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
        }, void 0, false, {
            fileName: "[project]/Downloads/private-project/Preptime-private/web/pages/index.tsx",
            lineNumber: 484,
            columnNumber: 13
        }, this)
    }, void 0, false, {
        fileName: "[project]/Downloads/private-project/Preptime-private/web/pages/index.tsx",
        lineNumber: 478,
        columnNumber: 9
    }, this);
}
function SparklesIcon({ className = "" }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("svg", {
        className: className,
        fill: "none",
        viewBox: "0 0 24 24",
        stroke: "currentColor",
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("path", {
            strokeLinecap: "round",
            strokeLinejoin: "round",
            strokeWidth: 2,
            d: "M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
        }, void 0, false, {
            fileName: "[project]/Downloads/private-project/Preptime-private/web/pages/index.tsx",
            lineNumber: 502,
            columnNumber: 13
        }, this)
    }, void 0, false, {
        fileName: "[project]/Downloads/private-project/Preptime-private/web/pages/index.tsx",
        lineNumber: 496,
        columnNumber: 9
    }, this);
}
function ChevronLeftIcon({ className = "" }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("svg", {
        className: className,
        fill: "none",
        viewBox: "0 0 24 24",
        stroke: "currentColor",
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("path", {
            strokeLinecap: "round",
            strokeLinejoin: "round",
            strokeWidth: 2,
            d: "M15 19l-7-7 7-7"
        }, void 0, false, {
            fileName: "[project]/Downloads/private-project/Preptime-private/web/pages/index.tsx",
            lineNumber: 520,
            columnNumber: 13
        }, this)
    }, void 0, false, {
        fileName: "[project]/Downloads/private-project/Preptime-private/web/pages/index.tsx",
        lineNumber: 514,
        columnNumber: 9
    }, this);
}
function ChevronRightIcon({ className = "" }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("svg", {
        className: className,
        fill: "none",
        viewBox: "0 0 24 24",
        stroke: "currentColor",
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("path", {
            strokeLinecap: "round",
            strokeLinejoin: "round",
            strokeWidth: 2,
            d: "M9 5l7 7-7 7"
        }, void 0, false, {
            fileName: "[project]/Downloads/private-project/Preptime-private/web/pages/index.tsx",
            lineNumber: 538,
            columnNumber: 13
        }, this)
    }, void 0, false, {
        fileName: "[project]/Downloads/private-project/Preptime-private/web/pages/index.tsx",
        lineNumber: 532,
        columnNumber: 9
    }, this);
}
/* ------------------------------- small UI bits ------------------------------- */ function StylePill({ style }) {
    if (!style) return null;
    const base = "text-[11px] px-2.5 py-1 rounded-full border font-medium tracking-tight shadow-sm";
    if (style === "Pomodoro") return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("span", {
        className: `${base} border-rose-200 bg-rose-50 text-rose-700`,
        children: "Pomodoro"
    }, void 0, false, {
        fileName: "[project]/Downloads/private-project/Preptime-private/web/pages/index.tsx",
        lineNumber: 557,
        columnNumber: 13
    }, this);
    if (style === "Deep Focus") return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("span", {
        className: `${base} border-emerald-200 bg-emerald-50 text-emerald-700`,
        children: "Deep Focus"
    }, void 0, false, {
        fileName: "[project]/Downloads/private-project/Preptime-private/web/pages/index.tsx",
        lineNumber: 563,
        columnNumber: 13
    }, this);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("span", {
        className: `${base} border-zinc-200 bg-zinc-50 text-zinc-700`,
        children: "Custom"
    }, void 0, false, {
        fileName: "[project]/Downloads/private-project/Preptime-private/web/pages/index.tsx",
        lineNumber: 570,
        columnNumber: 9
    }, this);
}
function MenuItem({ label, sub, onClick, isDark }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("button", {
        onClick: onClick,
        className: `w-full text-left px-3 py-2 transition ${isDark ? "hover:bg-slate-800 active:bg-slate-700" : "hover:bg-zinc-50 active:bg-zinc-100/70"}`,
        type: "button",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                className: `text-sm font-medium ${isDark ? "text-slate-100" : "text-zinc-900"}`,
                children: label
            }, void 0, false, {
                fileName: "[project]/Downloads/private-project/Preptime-private/web/pages/index.tsx",
                lineNumber: 596,
                columnNumber: 13
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                className: `text-xs ${isDark ? "text-slate-400" : "text-zinc-500"}`,
                children: sub
            }, void 0, false, {
                fileName: "[project]/Downloads/private-project/Preptime-private/web/pages/index.tsx",
                lineNumber: 602,
                columnNumber: 13
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/Downloads/private-project/Preptime-private/web/pages/index.tsx",
        lineNumber: 588,
        columnNumber: 9
    }, this);
}
/* ------------------------------ Mini Calendar ------------------------------ */ function MiniCalendar({ selectedDate, onSelectDate, isDark }) {
    const [viewYear, setViewYear] = __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["default"].useState(selectedDate.getFullYear());
    const [viewMonth, setViewMonth] = __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["default"].useState(selectedDate.getMonth());
    __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["default"].useEffect(()=>{
        setViewYear(selectedDate.getFullYear());
        setViewMonth(selectedDate.getMonth());
    }, [
        selectedDate
    ]);
    const todayISO = toISODate(new Date());
    const selectedISO = toISODate(selectedDate);
    const first = new Date(viewYear, viewMonth, 1);
    const firstDow = first.getDay();
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const months = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December"
    ];
    const dow = [
        "S",
        "M",
        "T",
        "W",
        "T",
        "F",
        "S"
    ];
    function prevMonth() {
        const d = new Date(viewYear, viewMonth, 1);
        d.setMonth(d.getMonth() - 1);
        setViewYear(d.getFullYear());
        setViewMonth(d.getMonth());
    }
    function nextMonth() {
        const d = new Date(viewYear, viewMonth, 1);
        d.setMonth(d.getMonth() + 1);
        setViewYear(d.getFullYear());
        setViewMonth(d.getMonth());
    }
    const cells = [];
    for(let i = 0; i < 42; i++){
        const dayNum = i - firstDow + 1;
        if (dayNum >= 1 && dayNum <= daysInMonth) {
            const date = new Date(viewYear, viewMonth, dayNum);
            cells.push({
                key: `${viewYear}-${viewMonth}-${dayNum}`,
                dayNum,
                date
            });
        } else {
            cells.push({
                key: `empty-${i}`
            });
        }
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
        className: `rounded-2xl border shadow-sm p-3 ${isDark ? "border-slate-700/50 bg-slate-800/40" : "border-zinc-200 bg-white"}`,
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                className: "flex items-center justify-between",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("button", {
                        onClick: prevMonth,
                        className: `h-8 w-8 rounded-lg border transition ${isDark ? "border-slate-700/50 bg-slate-900/30 text-slate-200 hover:bg-slate-700/40 active:bg-slate-700/60" : "border-zinc-200 bg-white hover:bg-zinc-50 active:bg-zinc-100"}`,
                        type: "button",
                        children: "<"
                    }, void 0, false, {
                        fileName: "[project]/Downloads/private-project/Preptime-private/web/pages/index.tsx",
                        lineNumber: 684,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                        className: `text-sm font-semibold tracking-tight ${isDark ? "text-slate-100" : "text-blue-900"}`,
                        children: [
                            months[viewMonth],
                            " ",
                            viewYear
                        ]
                    }, void 0, true, {
                        fileName: "[project]/Downloads/private-project/Preptime-private/web/pages/index.tsx",
                        lineNumber: 694,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("button", {
                        onClick: nextMonth,
                        className: `h-8 w-8 rounded-lg border transition ${isDark ? "border-slate-700/50 bg-slate-900/30 text-slate-200 hover:bg-slate-700/40 active:bg-slate-700/60" : "border-zinc-200 bg-white hover:bg-zinc-50 active:bg-zinc-100"}`,
                        type: "button",
                        children: ">"
                    }, void 0, false, {
                        fileName: "[project]/Downloads/private-project/Preptime-private/web/pages/index.tsx",
                        lineNumber: 700,
                        columnNumber: 17
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/Downloads/private-project/Preptime-private/web/pages/index.tsx",
                lineNumber: 683,
                columnNumber: 13
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                className: `mt-2 grid grid-cols-7 gap-1 text-xs ${isDark ? "text-slate-300" : "text-zinc-900"}`,
                children: dow.map((d, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                        className: "text-center py-1",
                        children: d
                    }, `${d}-${i}`, false, {
                        fileName: "[project]/Downloads/private-project/Preptime-private/web/pages/index.tsx",
                        lineNumber: 717,
                        columnNumber: 21
                    }, this))
            }, void 0, false, {
                fileName: "[project]/Downloads/private-project/Preptime-private/web/pages/index.tsx",
                lineNumber: 712,
                columnNumber: 13
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                className: "grid grid-cols-7 gap-1",
                children: cells.map((c)=>{
                    if (!c.date) return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                        className: "h-8"
                    }, c.key, false, {
                        fileName: "[project]/Downloads/private-project/Preptime-private/web/pages/index.tsx",
                        lineNumber: 725,
                        columnNumber: 41
                    }, this);
                    const iso = toISODate(c.date);
                    const isToday = iso === todayISO;
                    const isSelected = iso === selectedISO;
                    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("button", {
                        onClick: ()=>onSelectDate(c.date),
                        type: "button",
                        className: [
                            "h-8 rounded-lg text-sm border transition shadow-sm",
                            isSelected ? isDark ? "bg-indigo-600 text-white border-indigo-400/40" : "bg-blue-900 text-white border-zinc-900" : isDark ? "bg-slate-900/30 text-slate-100 border-slate-700/50 hover:bg-slate-700/40 active:bg-slate-700/60" : "bg-white hover:bg-blue-50 active:bg-blue-100 border-blue-200",
                            isToday && !isSelected ? isDark ? "border-indigo-400/60" : "border-blue-900" : ""
                        ].join(" "),
                        children: c.dayNum
                    }, c.key, false, {
                        fileName: "[project]/Downloads/private-project/Preptime-private/web/pages/index.tsx",
                        lineNumber: 731,
                        columnNumber: 25
                    }, this);
                })
            }, void 0, false, {
                fileName: "[project]/Downloads/private-project/Preptime-private/web/pages/index.tsx",
                lineNumber: 723,
                columnNumber: 13
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/Downloads/private-project/Preptime-private/web/pages/index.tsx",
        lineNumber: 677,
        columnNumber: 9
    }, this);
}
function FocusTimerPanel({ block, selectedDate, isDark }) {
    // Internal timer state to avoid re-rendering the whole app
    const [now, setNow] = __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["default"].useState(()=>new Date());
    __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["default"].useEffect(()=>{
        // Update frequently only when this component is mounted (timer is active)
        const id = setInterval(()=>setNow(new Date()), 250);
        return ()=>clearInterval(id);
    }, []);
    const card = `rounded-2xl border shadow-sm p-4 ${isDark ? "border-slate-700/50 bg-slate-800/30" : "border-zinc-200 bg-white"}`;
    if (!block) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
            className: `${card} ${isDark ? "text-slate-300" : "text-zinc-600"}`,
            children: "Select a time slot to see the timer."
        }, void 0, false, {
            fileName: "[project]/Downloads/private-project/Preptime-private/web/pages/index.tsx",
            lineNumber: 783,
            columnNumber: 13
        }, this);
    }
    const startDt = toDateForTime(selectedDate, block.start);
    const endDt = toDateForTime(selectedDate, block.end);
    if (endDt <= startDt) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
            className: `${card} text-red-600`,
            children: "End time must be after start time."
        }, void 0, false, {
            fileName: "[project]/Downloads/private-project/Preptime-private/web/pages/index.tsx",
            lineNumber: 794,
            columnNumber: 13
        }, this);
    }
    const nowMs = now.getTime();
    const startMs = startDt.getTime();
    const endMs = endDt.getTime();
    if (!block.style) {
        const totalSec = (endMs - startMs) / 1000;
        if (nowMs < startMs) {
            const secToStart = (startMs - nowMs) / 1000;
            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                className: card,
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                        className: `text-sm ${isDark ? "text-slate-400" : "text-zinc-500"}`,
                        children: "Auto Focus Timer"
                    }, void 0, false, {
                        fileName: "[project]/Downloads/private-project/Preptime-private/web/pages/index.tsx",
                        lineNumber: 811,
                        columnNumber: 21
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                        className: `mt-1 text-base font-semibold tracking-tight ${isDark ? "text-slate-100" : "text-zinc-900"}`,
                        children: block.name
                    }, void 0, false, {
                        fileName: "[project]/Downloads/private-project/Preptime-private/web/pages/index.tsx",
                        lineNumber: 816,
                        columnNumber: 21
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                        className: `mt-1 text-sm ${isDark ? "text-slate-300" : "text-zinc-500"}`,
                        children: [
                            formatTime(block.start),
                            " – ",
                            formatTime(block.end),
                            " • Study"
                        ]
                    }, void 0, true, {
                        fileName: "[project]/Downloads/private-project/Preptime-private/web/pages/index.tsx",
                        lineNumber: 822,
                        columnNumber: 21
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                        className: `mt-3 ${isDark ? "text-slate-200" : "text-zinc-800"}`,
                        children: [
                            "Starts in:",
                            " ",
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("span", {
                                className: `font-mono font-semibold ${isDark ? "text-white" : ""}`,
                                children: fmtCountdownSmart(secToStart)
                            }, void 0, false, {
                                fileName: "[project]/Downloads/private-project/Preptime-private/web/pages/index.tsx",
                                lineNumber: 833,
                                columnNumber: 25
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/Downloads/private-project/Preptime-private/web/pages/index.tsx",
                        lineNumber: 829,
                        columnNumber: 21
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/Downloads/private-project/Preptime-private/web/pages/index.tsx",
                lineNumber: 810,
                columnNumber: 17
            }, this);
        }
        if (nowMs >= endMs) {
            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                className: card,
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                        className: `text-sm ${isDark ? "text-slate-400" : "text-zinc-500"}`,
                        children: "Auto Focus Timer"
                    }, void 0, false, {
                        fileName: "[project]/Downloads/private-project/Preptime-private/web/pages/index.tsx",
                        lineNumber: 847,
                        columnNumber: 21
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                        className: `mt-1 text-base font-semibold tracking-tight ${isDark ? "text-white" : "text-zinc-900"}`,
                        children: block.name
                    }, void 0, false, {
                        fileName: "[project]/Downloads/private-project/Preptime-private/web/pages/index.tsx",
                        lineNumber: 852,
                        columnNumber: 21
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                        className: "mt-3 text-emerald-700 font-semibold",
                        children: "Finished"
                    }, void 0, false, {
                        fileName: "[project]/Downloads/private-project/Preptime-private/web/pages/index.tsx",
                        lineNumber: 858,
                        columnNumber: 21
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/Downloads/private-project/Preptime-private/web/pages/index.tsx",
                lineNumber: 846,
                columnNumber: 17
            }, this);
        }
        const elapsedSec = (nowMs - startMs) / 1000;
        const remaining = Math.max(0, totalSec - elapsedSec);
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
            className: card,
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                    className: "flex items-start justify-between gap-3",
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                className: `text-sm ${isDark ? "text-slate-400" : "text-zinc-500"}`,
                                children: "Auto Focus Timer"
                            }, void 0, false, {
                                fileName: "[project]/Downloads/private-project/Preptime-private/web/pages/index.tsx",
                                lineNumber: 870,
                                columnNumber: 25
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                className: `mt-1 text-base font-semibold tracking-tight ${isDark ? "text-white" : "text-zinc-900"}`,
                                children: block.name
                            }, void 0, false, {
                                fileName: "[project]/Downloads/private-project/Preptime-private/web/pages/index.tsx",
                                lineNumber: 876,
                                columnNumber: 25
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                className: `mt-1 text-sm text-zinc-500`,
                                children: [
                                    formatTime(block.start),
                                    " – ",
                                    formatTime(block.end),
                                    " • Study"
                                ]
                            }, void 0, true, {
                                fileName: "[project]/Downloads/private-project/Preptime-private/web/pages/index.tsx",
                                lineNumber: 882,
                                columnNumber: 25
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/Downloads/private-project/Preptime-private/web/pages/index.tsx",
                        lineNumber: 869,
                        columnNumber: 21
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/Downloads/private-project/Preptime-private/web/pages/index.tsx",
                    lineNumber: 868,
                    columnNumber: 17
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                    className: `mt-3 flex items-center justify-between rounded-xl border p-3 shadow-sm ${isDark ? "border-slate-700/50 bg-slate-900/30" : "border-green-200 bg-zinc-50/60"}`,
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                            className: "text-sm",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                    className: "text-green-500",
                                    children: "Now"
                                }, void 0, false, {
                                    fileName: "[project]/Downloads/private-project/Preptime-private/web/pages/index.tsx",
                                    lineNumber: 895,
                                    columnNumber: 25
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                    className: "font-semibold text-green-700",
                                    children: "STUDY"
                                }, void 0, false, {
                                    fileName: "[project]/Downloads/private-project/Preptime-private/web/pages/index.tsx",
                                    lineNumber: 896,
                                    columnNumber: 25
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/Downloads/private-project/Preptime-private/web/pages/index.tsx",
                            lineNumber: 894,
                            columnNumber: 21
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                            className: "text-right",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                    className: `text-xs ${isDark ? "text-slate-300" : "text-zinc-500"}`,
                                    children: "Countdown"
                                }, void 0, false, {
                                    fileName: "[project]/Downloads/private-project/Preptime-private/web/pages/index.tsx",
                                    lineNumber: 899,
                                    columnNumber: 25
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                    className: `text-2xl font-mono font-semibold ${isDark ? "text-white" : "text-zinc-900"}`,
                                    children: fmtCountdownSmart(remaining)
                                }, void 0, false, {
                                    fileName: "[project]/Downloads/private-project/Preptime-private/web/pages/index.tsx",
                                    lineNumber: 905,
                                    columnNumber: 25
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/Downloads/private-project/Preptime-private/web/pages/index.tsx",
                            lineNumber: 898,
                            columnNumber: 21
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/Downloads/private-project/Preptime-private/web/pages/index.tsx",
                    lineNumber: 888,
                    columnNumber: 17
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                    className: "mt-2 text-xs text-zinc-500",
                    children: "Auto-updates using your device clock."
                }, void 0, false, {
                    fileName: "[project]/Downloads/private-project/Preptime-private/web/pages/index.tsx",
                    lineNumber: 914,
                    columnNumber: 17
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/Downloads/private-project/Preptime-private/web/pages/index.tsx",
            lineNumber: 867,
            columnNumber: 13
        }, this);
    }
    const fallbackFocus = block.style === "Deep Focus" ? 52 : 25;
    const fallbackBreak = block.style === "Deep Focus" ? 17 : 5;
    const focusMin = block.focusMin ?? fallbackFocus;
    const breakMin = block.breakMin ?? fallbackBreak;
    if (nowMs < startMs) {
        const secToStart = (startMs - nowMs) / 1000;
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
            className: card,
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                    className: `text-sm ${isDark ? "text-slate-400" : "text-zinc-500"}`,
                    children: "Auto Focus Timer"
                }, void 0, false, {
                    fileName: "[project]/Downloads/private-project/Preptime-private/web/pages/index.tsx",
                    lineNumber: 930,
                    columnNumber: 17
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                    className: `mt-1 text-base font-semibold tracking-tight ${isDark ? "text-white" : "text-zinc-900"}`,
                    children: block.name
                }, void 0, false, {
                    fileName: "[project]/Downloads/private-project/Preptime-private/web/pages/index.tsx",
                    lineNumber: 935,
                    columnNumber: 17
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                    className: `mt-1 text-sm text-zinc-500`,
                    children: [
                        formatTime(block.start),
                        " – ",
                        formatTime(block.end),
                        " • ",
                        focusMin,
                        "/",
                        breakMin
                    ]
                }, void 0, true, {
                    fileName: "[project]/Downloads/private-project/Preptime-private/web/pages/index.tsx",
                    lineNumber: 941,
                    columnNumber: 17
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                    className: `mt-3 ${isDark ? "text-slate-200" : "text-zinc-800"}`,
                    children: [
                        "Starts in:",
                        " ",
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("span", {
                            className: `font-mono font-semibold ${isDark ? "text-white" : ""}`,
                            children: fmtCountdownSmart(secToStart)
                        }, void 0, false, {
                            fileName: "[project]/Downloads/private-project/Preptime-private/web/pages/index.tsx",
                            lineNumber: 948,
                            columnNumber: 21
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/Downloads/private-project/Preptime-private/web/pages/index.tsx",
                    lineNumber: 946,
                    columnNumber: 17
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/Downloads/private-project/Preptime-private/web/pages/index.tsx",
            lineNumber: 929,
            columnNumber: 13
        }, this);
    }
    if (nowMs >= endMs) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
            className: card,
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                    className: `text-sm ${isDark ? "text-slate-400" : "text-zinc-500"}`,
                    children: "Auto Focus Timer"
                }, void 0, false, {
                    fileName: "[project]/Downloads/private-project/Preptime-private/web/pages/index.tsx",
                    lineNumber: 961,
                    columnNumber: 17
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                    className: `mt-1 text-base font-semibold tracking-tight ${isDark ? "text-white" : "text-zinc-900"}`,
                    children: block.name
                }, void 0, false, {
                    fileName: "[project]/Downloads/private-project/Preptime-private/web/pages/index.tsx",
                    lineNumber: 966,
                    columnNumber: 17
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                    className: "mt-3 text-emerald-700 font-semibold",
                    children: "Finished"
                }, void 0, false, {
                    fileName: "[project]/Downloads/private-project/Preptime-private/web/pages/index.tsx",
                    lineNumber: 972,
                    columnNumber: 17
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/Downloads/private-project/Preptime-private/web/pages/index.tsx",
            lineNumber: 960,
            columnNumber: 13
        }, this);
    }
    const elapsedSec = (nowMs - startMs) / 1000;
    const focusSec = focusMin * 60;
    const breakSec = breakMin * 60;
    const cycleSec = focusSec + breakSec;
    const cycleIndex = Math.floor(elapsedSec / cycleSec);
    const intoCycle = elapsedSec - cycleIndex * cycleSec;
    const isStudy = intoCycle < focusSec;
    const phaseRemaining = isStudy ? focusSec - intoCycle : cycleSec - intoCycle;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
        className: card,
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                className: "flex items-start justify-between gap-3",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                className: `text-sm ${isDark ? "text-slate-400" : "text-zinc-500"}`,
                                children: "Auto Focus Timer"
                            }, void 0, false, {
                                fileName: "[project]/Downloads/private-project/Preptime-private/web/pages/index.tsx",
                                lineNumber: 990,
                                columnNumber: 21
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                className: `mt-1 text-base font-semibold tracking-tight ${isDark ? "text-white" : "text-zinc-900"}`,
                                children: block.name
                            }, void 0, false, {
                                fileName: "[project]/Downloads/private-project/Preptime-private/web/pages/index.tsx",
                                lineNumber: 995,
                                columnNumber: 21
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                className: `mt-1 text-sm text-zinc-500`,
                                children: [
                                    formatTime(block.start),
                                    " – ",
                                    formatTime(block.end),
                                    " • ",
                                    focusMin,
                                    "/",
                                    breakMin
                                ]
                            }, void 0, true, {
                                fileName: "[project]/Downloads/private-project/Preptime-private/web/pages/index.tsx",
                                lineNumber: 1001,
                                columnNumber: 21
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/Downloads/private-project/Preptime-private/web/pages/index.tsx",
                        lineNumber: 989,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(StylePill, {
                        style: block.style
                    }, void 0, false, {
                        fileName: "[project]/Downloads/private-project/Preptime-private/web/pages/index.tsx",
                        lineNumber: 1006,
                        columnNumber: 17
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/Downloads/private-project/Preptime-private/web/pages/index.tsx",
                lineNumber: 988,
                columnNumber: 13
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                className: `mt-3 flex items-center justify-between rounded-xl border p-3 shadow-sm ${isDark ? "border-slate-700/50 bg-slate-900/30" : "border-zinc-200 bg-zinc-50/60"}`,
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                        className: "text-sm",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                className: `${isDark ? "text-zinc-500" : "text-zinc-500"}`,
                                children: "Now"
                            }, void 0, false, {
                                fileName: "[project]/Downloads/private-project/Preptime-private/web/pages/index.tsx",
                                lineNumber: 1016,
                                columnNumber: 21
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                className: `font-semibold ${isStudy ? "text-green-700" : "text-sky-700"}`,
                                children: isStudy ? "STUDY" : "BREAK"
                            }, void 0, false, {
                                fileName: "[project]/Downloads/private-project/Preptime-private/web/pages/index.tsx",
                                lineNumber: 1019,
                                columnNumber: 21
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/Downloads/private-project/Preptime-private/web/pages/index.tsx",
                        lineNumber: 1015,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                        className: "text-right",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                className: `text-xs ${isDark ? "text-slate-300" : "text-zinc-500"}`,
                                children: "Countdown"
                            }, void 0, false, {
                                fileName: "[project]/Downloads/private-project/Preptime-private/web/pages/index.tsx",
                                lineNumber: 1027,
                                columnNumber: 21
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                className: `text-2xl font-mono font-semibold ${isDark ? "text-white" : "text-zinc-900"}`,
                                children: fmtCountdownSmart(phaseRemaining)
                            }, void 0, false, {
                                fileName: "[project]/Downloads/private-project/Preptime-private/web/pages/index.tsx",
                                lineNumber: 1032,
                                columnNumber: 21
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                className: `text-xs ${isDark ? "text-slate-300" : "text-zinc-500"}`,
                                children: [
                                    "Cycle ",
                                    cycleIndex + 1
                                ]
                            }, void 0, true, {
                                fileName: "[project]/Downloads/private-project/Preptime-private/web/pages/index.tsx",
                                lineNumber: 1038,
                                columnNumber: 21
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/Downloads/private-project/Preptime-private/web/pages/index.tsx",
                        lineNumber: 1026,
                        columnNumber: 17
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/Downloads/private-project/Preptime-private/web/pages/index.tsx",
                lineNumber: 1009,
                columnNumber: 13
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                className: "mt-2 text-xs text-zinc-500",
                children: "Auto-updates using your device clock."
            }, void 0, false, {
                fileName: "[project]/Downloads/private-project/Preptime-private/web/pages/index.tsx",
                lineNumber: 1046,
                columnNumber: 13
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/Downloads/private-project/Preptime-private/web/pages/index.tsx",
        lineNumber: 987,
        columnNumber: 9
    }, this);
}
function Sidebar({ blocks, activeId, selectedDate, onSelectDate, onSelectBlock, onPickStyle, onSetCustomMinutes, onDeleteBlock, onUpdateBlock, manualOrderByDate, onSetManualOrderForDate, isDark }) {
    // Internal time state for sorting and header clock
    // Update every 10 seconds is enough for minute-level display and sorting
    const [now, setNow] = __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["default"].useState(()=>new Date());
    __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["default"].useEffect(()=>{
        const id = setInterval(()=>setNow(new Date()), 10000);
        return ()=>clearInterval(id);
    }, []);
    const [menuFor, setMenuFor] = __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["default"].useState(null);
    const [menuPos, setMenuPos] = __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["default"].useState(null);
    const [actionFor, setActionFor] = __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["default"].useState(null);
    const [actionPos, setActionPos] = __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["default"].useState(null);
    const [customFocus, setCustomFocus] = __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["default"].useState(25);
    const [customBreak, setCustomBreak] = __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["default"].useState(5);
    // NEW: drag state (enhanced)
    const [draggingId, setDraggingId] = __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["default"].useState(null);
    const [dragOverId, setDragOverId] = __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["default"].useState(null);
    const [dragOverEdge, setDragOverEdge] = __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["default"].useState(null);
    // edit modal state
    const sidebarRef = __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["default"].useRef(null);
    const [editId, setEditId] = __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["default"].useState(null);
    const [editName, setEditName] = __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["default"].useState("");
    const [editLabel, setEditLabel] = __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["default"].useState("");
    const [editDescription, setEditDescription] = __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["default"].useState("");
    const [editStart, setEditStart] = __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["default"].useState("15:00");
    const [editEnd, setEditEnd] = __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["default"].useState("16:30");
    const [editStyle, setEditStyle] = __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["default"].useState(undefined);
    const [editFocus, setEditFocus] = __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["default"].useState(25);
    const [editBreak, setEditBreak] = __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["default"].useState(5);
    const selectedISO = toISODate(selectedDate);
    const filteredRaw = blocks.filter((b)=>sameISO(b.dateISO, selectedISO));
    const isSelectedToday = sameISO(selectedISO, toISODate(now));
    const nowMin = now.getHours() * 60 + now.getMinutes();
    const timeSorted = filteredRaw.slice().sort((a, b)=>{
        const am = timeToMinutes(a.start);
        const bm = timeToMinutes(b.start);
        if (!isSelectedToday) return am - bm;
        const da = (am < nowMin ? am + 1440 : am) - nowMin;
        const db = (bm < nowMin ? bm + 1440 : bm) - nowMin;
        return da !== db ? da - db : am - bm;
    });
    const orderForDay = manualOrderByDate[selectedISO];
    const filtered = orderForDay ? timeSorted.slice().sort((a, b)=>{
        const ia = orderForDay.indexOf(a.id);
        const ib = orderForDay.indexOf(b.id);
        const aMissing = ia === -1;
        const bMissing = ib === -1;
        if (!aMissing && !bMissing) return ia - ib;
        if (!aMissing && bMissing) return -1;
        if (aMissing && !bMissing) return 1;
        return 0;
    }) : timeSorted;
    const active = blocks.find((b)=>b.id === activeId);
    __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["default"].useEffect(()=>{
        function onDocClick(e) {
            const target = e.target;
            const isStyleMenu = target.closest("[data-style-menu]");
            const isStyleButton = target.closest("[data-style-button]");
            const isActionMenu = target.closest("[data-action-menu]");
            const isActionButton = target.closest("[data-action-button]");
            const isEditModal = target.closest("[data-edit-modal]");
            if (!isStyleMenu && !isStyleButton) {
                setMenuFor(null);
                setMenuPos(null);
            }
            if (!isActionMenu && !isActionButton) {
                setActionFor(null);
                setActionPos(null);
            }
            if (editId && !isEditModal) {
                setEditId(null);
            }
        }
        document.addEventListener("mousedown", onDocClick);
        return ()=>document.removeEventListener("mousedown", onDocClick);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
        editId
    ]);
    function openMenuFor(block, anchorEl) {
        setMenuFor(block.id);
        setCustomFocus(block.focusMin ?? (block.style === "Deep Focus" ? 52 : 25));
        setCustomBreak(block.breakMin ?? (block.style === "Deep Focus" ? 17 : 5));
        const r = anchorEl.getBoundingClientRect();
        const menuW = 224;
        const menuH = 320;
        const pad = 8;
        // Try to position to the left of the button first
        let left = r.left - menuW - pad;
        let top = r.top;
        // If not enough space on left, position to the right
        if (left < pad) {
            left = r.right + pad;
        }
        // If still not enough space, position below
        if (left + menuW + pad > window.innerWidth) {
            left = r.right - menuW;
            top = r.bottom + pad;
        }
        // If menu would go off bottom, position above
        if (top + menuH + pad > window.innerHeight) {
            top = r.top - menuH - pad;
        }
        // Final bounds check
        left = Math.max(pad, Math.min(left, window.innerWidth - menuW - pad));
        top = Math.max(pad, Math.min(top, window.innerHeight - menuH - pad));
        // Convert to relative coordinates within Sidebar
        const sidebarRect = sidebarRef.current?.getBoundingClientRect();
        if (sidebarRect) {
            top -= sidebarRect.top;
            left -= sidebarRect.left;
        }
        setMenuPos({
            top,
            left
        });
    }
    function openActionMenuFor(block, anchorEl) {
        setActionFor(block.id);
        const r = anchorEl.getBoundingClientRect();
        const menuW = 180;
        const menuH = 120;
        const pad = 8;
        // Default: align top of menu with top of button, position to the left
        let left = r.left - menuW - pad;
        let top = r.top;
        // If not enough space on left, try right side
        if (left < pad) {
            left = r.right + pad;
        }
        // If goes off right edge, position below button and align right edge
        if (left + menuW + pad > window.innerWidth) {
            left = r.right - menuW;
            top = r.bottom + pad;
        }
        // If menu would go off bottom, position above the button instead
        if (top + menuH + pad > window.innerHeight) {
            top = r.top - menuH - pad;
        }
        // If menu would go off top, push it down
        if (top < pad) {
            top = r.bottom + pad;
        }
        // Final bounds check
        left = Math.max(pad, Math.min(left, window.innerWidth - menuW - pad));
        top = Math.max(pad, Math.min(top, window.innerHeight - menuH - pad));
        // Convert to relative coordinates within Sidebar
        const sidebarRect = sidebarRef.current?.getBoundingClientRect();
        if (sidebarRect) {
            top -= sidebarRect.top;
            left -= sidebarRect.left;
        }
        setActionPos({
            top,
            left
        });
    }
    function startEdit(block) {
        setEditId(block.id);
        setEditName(block.name);
        setEditLabel(block.label || "");
        setEditDescription(block.description || "");
        setEditStart(block.start);
        setEditEnd(block.end);
        setEditStyle(block.style);
        setEditFocus(block.focusMin ?? (block.style === "Deep Focus" ? 52 : 25));
        setEditBreak(block.breakMin ?? (block.style === "Deep Focus" ? 17 : 5));
    }
    function applyEdit() {
        if (!editId) return;
        onUpdateBlock(editId, {
            name: editName.trim() || "Untitled",
            label: editLabel.trim() || undefined,
            description: editDescription.trim() || undefined,
            start: editStart,
            end: editEnd,
            style: editStyle,
            focusMin: editStyle ? editFocus : undefined,
            breakMin: editStyle ? editBreak : undefined
        });
        setEditId(null);
    }
    function ensureOrderListForDay() {
        const current = filtered.map((b)=>b.id);
        return current;
    }
    // NEW: reorder helpers (enhanced drag)
    function insertIdInList(list, idToMove, targetId, where) {
        const next = list.slice();
        const from = next.indexOf(idToMove);
        const to = next.indexOf(targetId);
        if (from === -1 || to === -1) return next;
        if (idToMove === targetId) return next;
        next.splice(from, 1);
        const targetIndexAfterRemoval = from < to ? to - 1 : to;
        const insertAt = where === "top" ? targetIndexAfterRemoval : targetIndexAfterRemoval + 1;
        next.splice(insertAt, 0, idToMove);
        return next;
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("aside", {
        ref: sidebarRef,
        className: `relative z-40 w-full md:w-[400px] border-r flex flex-col backdrop-blur-sm ${isDark ? "border-slate-700/50 bg-slate-900/50" : "border-slate-200/50 bg-white/50"}`,
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                className: `p-6 border-b space-y-4 relative z-10 backdrop-blur-sm ${isDark ? "border-slate-700/50 bg-gradient-to-b from-slate-800/50 to-transparent" : "border-slate-200/50 bg-gradient-to-b from-white/50 to-transparent"}`,
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                        className: "flex items-start justify-between gap-3",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("h2", {
                                        className: `text-xl font-bold tracking-tight flex items-center gap-2 ${isDark ? "text-slate-100" : "text-slate-900"}`,
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(ClockIcon, {
                                                className: "w-5 h-5 text-indigo-500"
                                            }, void 0, false, {
                                                fileName: "[project]/Downloads/private-project/Preptime-private/web/pages/index.tsx",
                                                lineNumber: 1364,
                                                columnNumber: 29
                                            }, this),
                                            "Today"
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/Downloads/private-project/Preptime-private/web/pages/index.tsx",
                                        lineNumber: 1360,
                                        columnNumber: 25
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("p", {
                                        suppressHydrationWarning: true,
                                        className: `text-sm mt-1 font-medium ${isDark ? "text-slate-400" : "text-slate-600"}`,
                                        children: [
                                            fmtDateLong(now),
                                            " • ",
                                            fmtClock(now)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/Downloads/private-project/Preptime-private/web/pages/index.tsx",
                                        lineNumber: 1367,
                                        columnNumber: 25
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/Downloads/private-project/Preptime-private/web/pages/index.tsx",
                                lineNumber: 1359,
                                columnNumber: 21
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("span", {
                                className: `text-xs px-3 py-1.5 rounded-xl border shadow-sm font-bold backdrop-blur-sm ${isDark ? "bg-indigo-950/50 text-indigo-300 border-indigo-800/50" : "bg-indigo-50 text-indigo-700 border-indigo-200"}`,
                                children: "Tasks"
                            }, void 0, false, {
                                fileName: "[project]/Downloads/private-project/Preptime-private/web/pages/index.tsx",
                                lineNumber: 1375,
                                columnNumber: 21
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/Downloads/private-project/Preptime-private/web/pages/index.tsx",
                        lineNumber: 1358,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(MiniCalendar, {
                        selectedDate: selectedDate,
                        onSelectDate: onSelectDate,
                        isDark: isDark
                    }, void 0, false, {
                        fileName: "[project]/Downloads/private-project/Preptime-private/web/pages/index.tsx",
                        lineNumber: 1385,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                        className: `text-sm rounded-xl p-3 backdrop-blur-sm ${isDark ? "bg-slate-800/30 text-slate-300" : "bg-white/50 text-slate-700"}`,
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                            className: "flex items-center justify-between",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("span", {
                                    className: "font-semibold",
                                    children: fmtDateLong(selectedDate)
                                }, void 0, false, {
                                    fileName: "[project]/Downloads/private-project/Preptime-private/web/pages/index.tsx",
                                    lineNumber: 1398,
                                    columnNumber: 25
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("span", {
                                    suppressHydrationWarning: true,
                                    className: `text-xs px-2 py-1 rounded-lg font-bold ${isDark ? "bg-slate-700/50 text-slate-400" : "bg-slate-100 text-slate-600"}`,
                                    children: [
                                        filtered.length,
                                        " slots"
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/Downloads/private-project/Preptime-private/web/pages/index.tsx",
                                    lineNumber: 1399,
                                    columnNumber: 25
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/Downloads/private-project/Preptime-private/web/pages/index.tsx",
                            lineNumber: 1397,
                            columnNumber: 21
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/Downloads/private-project/Preptime-private/web/pages/index.tsx",
                        lineNumber: 1391,
                        columnNumber: 17
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/Downloads/private-project/Preptime-private/web/pages/index.tsx",
                lineNumber: 1352,
                columnNumber: 13
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                className: "p-4 space-y-3 overflow-y-auto flex-1",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                        className: "pb-2",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(FocusTimerPanel, {
                            block: active,
                            selectedDate: selectedDate,
                            isDark: isDark
                        }, void 0, false, {
                            fileName: "[project]/Downloads/private-project/Preptime-private/web/pages/index.tsx",
                            lineNumber: 1415,
                            columnNumber: 21
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/Downloads/private-project/Preptime-private/web/pages/index.tsx",
                        lineNumber: 1414,
                        columnNumber: 17
                    }, this),
                    filtered.length === 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$externals$5d2f$framer$2d$motion__$5b$external$5d$__$28$framer$2d$motion$2c$__esm_import$2c$__$5b$project$5d2f$Downloads$2f$private$2d$project$2f$Preptime$2d$private$2f$web$2f$node_modules$2f$framer$2d$motion$29$__["motion"].div, {
                        initial: {
                            opacity: 0,
                            y: 20
                        },
                        animate: {
                            opacity: 1,
                            y: 0
                        },
                        className: `p-6 border-2 border-dashed shadow-sm rounded-2xl text-center backdrop-blur-sm ${isDark ? "border-slate-700/50 bg-slate-800/30" : "border-slate-300/50 bg-white/50"}`,
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(CalendarIcon, {
                                className: `w-12 h-12 mx-auto mb-3 ${isDark ? "text-slate-600" : "text-slate-400"}`
                            }, void 0, false, {
                                fileName: "[project]/Downloads/private-project/Preptime-private/web/pages/index.tsx",
                                lineNumber: 1431,
                                columnNumber: 25
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("p", {
                                className: `font-bold ${isDark ? "text-slate-300" : "text-slate-700"}`,
                                children: "No time slots yet"
                            }, void 0, false, {
                                fileName: "[project]/Downloads/private-project/Preptime-private/web/pages/index.tsx",
                                lineNumber: 1435,
                                columnNumber: 25
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("p", {
                                className: `text-sm mt-1 ${isDark ? "text-slate-500" : "text-slate-600"}`,
                                children: "Add tasks from the schedule"
                            }, void 0, false, {
                                fileName: "[project]/Downloads/private-project/Preptime-private/web/pages/index.tsx",
                                lineNumber: 1441,
                                columnNumber: 25
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/Downloads/private-project/Preptime-private/web/pages/index.tsx",
                        lineNumber: 1423,
                        columnNumber: 21
                    }, this) : filtered.map((b, index)=>{
                        const isActive = b.id === activeId;
                        const isDragging = draggingId === b.id;
                        const isDragOver = dragOverId === b.id && draggingId && draggingId !== b.id;
                        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$externals$5d2f$framer$2d$motion__$5b$external$5d$__$28$framer$2d$motion$2c$__esm_import$2c$__$5b$project$5d2f$Downloads$2f$private$2d$project$2f$Preptime$2d$private$2f$web$2f$node_modules$2f$framer$2d$motion$29$__["motion"].div, {
                            initial: {
                                opacity: 0,
                                x: -20
                            },
                            animate: {
                                opacity: 1,
                                x: 0
                            },
                            transition: {
                                delay: index * 0.05
                            },
                            draggable: true,
                            onDragStart: (e)=>{
                                setDraggingId(b.id);
                                e.dataTransfer.setData("text/plain", b.id);
                                e.dataTransfer.effectAllowed = "move";
                                try {
                                    e.dataTransfer.setDragImage(e.currentTarget, 24, 24);
                                } catch  {}
                            },
                            onDragEnd: ()=>{
                                setDraggingId(null);
                                setDragOverId(null);
                                setDragOverEdge(null);
                            },
                            onDragOverCapture: (e)=>{
                                e.preventDefault();
                                e.dataTransfer.dropEffect = "move";
                                const rect = e.currentTarget.getBoundingClientRect();
                                const y = e.clientY - rect.top;
                                const edge = y < rect.height / 2 ? "top" : "bottom";
                                setDragOverId(b.id);
                                setDragOverEdge(edge);
                            },
                            onDropCapture: (e)=>{
                                e.preventDefault();
                                const dragId = e.dataTransfer.getData("text/plain");
                                if (!dragId) return;
                                if (dragId === b.id) return;
                                const baseOrder = manualOrderByDate[selectedISO] ?? ensureOrderListForDay();
                                const where = dragOverId === b.id && dragOverEdge ? dragOverEdge : "top";
                                const nextOrder = insertIdInList(baseOrder, dragId, b.id, where);
                                onSetManualOrderForDate(selectedISO, nextOrder);
                                setDraggingId(null);
                                setDragOverId(null);
                                setDragOverEdge(null);
                            },
                            whileHover: {
                                scale: 1.02,
                                x: 4
                            },
                            className: [
                                "relative rounded-2xl border-2 p-4 transition-all duration-200 min-h-[100px] backdrop-blur-sm cursor-move",
                                isActive ? isDark ? "border-indigo-600/50 bg-gradient-to-br from-indigo-950/50 to-purple-950/50 shadow-lg shadow-indigo-900/20" : "border-indigo-400/50 bg-gradient-to-br from-indigo-50/50 to-purple-50/50 shadow-lg shadow-indigo-200/50" : isDark ? "border-slate-700/50 bg-slate-800/30 hover:border-slate-600/50 hover:shadow-md" : "border-slate-300/50 bg-white/50 hover:border-slate-400/50 hover:shadow-md",
                                isDragging ? "opacity-50 scale-95" : "",
                                isDragOver ? "ring-2 ring-indigo-500/50" : ""
                            ].join(" "),
                            title: "Drag to reorder",
                            children: [
                                isActive && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$externals$5d2f$framer$2d$motion__$5b$external$5d$__$28$framer$2d$motion$2c$__esm_import$2c$__$5b$project$5d2f$Downloads$2f$private$2d$project$2f$Preptime$2d$private$2f$web$2f$node_modules$2f$framer$2d$motion$29$__["motion"].div, {
                                    layoutId: "activeIndicator",
                                    className: "absolute left-0 top-3 bottom-3 w-1 rounded-r-full bg-gradient-to-b from-indigo-500 to-purple-500"
                                }, void 0, false, {
                                    fileName: "[project]/Downloads/private-project/Preptime-private/web/pages/index.tsx",
                                    lineNumber: 1527,
                                    columnNumber: 37
                                }, this),
                                isDragOver && dragOverEdge === "top" && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$externals$5d2f$framer$2d$motion__$5b$external$5d$__$28$framer$2d$motion$2c$__esm_import$2c$__$5b$project$5d2f$Downloads$2f$private$2d$project$2f$Preptime$2d$private$2f$web$2f$node_modules$2f$framer$2d$motion$29$__["motion"].div, {
                                    initial: {
                                        scaleX: 0
                                    },
                                    animate: {
                                        scaleX: 1
                                    },
                                    className: "absolute left-3 right-3 top-1 h-0.5 bg-indigo-500 rounded-full"
                                }, void 0, false, {
                                    fileName: "[project]/Downloads/private-project/Preptime-private/web/pages/index.tsx",
                                    lineNumber: 1535,
                                    columnNumber: 37
                                }, this),
                                isDragOver && dragOverEdge === "bottom" && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$externals$5d2f$framer$2d$motion__$5b$external$5d$__$28$framer$2d$motion$2c$__esm_import$2c$__$5b$project$5d2f$Downloads$2f$private$2d$project$2f$Preptime$2d$private$2f$web$2f$node_modules$2f$framer$2d$motion$29$__["motion"].div, {
                                    initial: {
                                        scaleX: 0
                                    },
                                    animate: {
                                        scaleX: 1
                                    },
                                    className: "absolute left-3 right-3 bottom-1 h-0.5 bg-indigo-500 rounded-full"
                                }, void 0, false, {
                                    fileName: "[project]/Downloads/private-project/Preptime-private/web/pages/index.tsx",
                                    lineNumber: 1542,
                                    columnNumber: 37
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("button", {
                                    draggable: false,
                                    className: "w-full text-left",
                                    onClick: ()=>onSelectBlock(b.id),
                                    type: "button",
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                        className: "min-w-0 pr-12",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                                className: "flex items-center gap-2 flex-wrap",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                                        className: `text-[17px] font-semibold tracking-tight truncate max-w-[230px] ${isDark ? "text-slate-100" : "text-zinc-900"}`,
                                                        title: b.name,
                                                        children: b.name
                                                    }, void 0, false, {
                                                        fileName: "[project]/Downloads/private-project/Preptime-private/web/pages/index.tsx",
                                                        lineNumber: 1557,
                                                        columnNumber: 45
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(StylePill, {
                                                        style: b.style
                                                    }, void 0, false, {
                                                        fileName: "[project]/Downloads/private-project/Preptime-private/web/pages/index.tsx",
                                                        lineNumber: 1564,
                                                        columnNumber: 45
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/Downloads/private-project/Preptime-private/web/pages/index.tsx",
                                                lineNumber: 1556,
                                                columnNumber: 41
                                            }, this),
                                            b.label && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                                className: `mt-1.5 text-xs font-medium ${isDark ? "text-indigo-400" : "text-indigo-600"}`,
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(TagIcon, {
                                                        className: "w-3 h-3 inline mr-1"
                                                    }, void 0, false, {
                                                        fileName: "[project]/Downloads/private-project/Preptime-private/web/pages/index.tsx",
                                                        lineNumber: 1571,
                                                        columnNumber: 49
                                                    }, this),
                                                    b.label
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/Downloads/private-project/Preptime-private/web/pages/index.tsx",
                                                lineNumber: 1567,
                                                columnNumber: 45
                                            }, this),
                                            b.description && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                                className: `mt-1 text-xs line-clamp-2 ${isDark ? "text-slate-400" : "text-zinc-600"}`,
                                                children: b.description
                                            }, void 0, false, {
                                                fileName: "[project]/Downloads/private-project/Preptime-private/web/pages/index.tsx",
                                                lineNumber: 1576,
                                                columnNumber: 45
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                                className: `mt-2 text-sm ${isDark ? "text-slate-400" : "text-zinc-500"}`,
                                                children: [
                                                    formatTime(b.start),
                                                    " – ",
                                                    formatTime(b.end)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/Downloads/private-project/Preptime-private/web/pages/index.tsx",
                                                lineNumber: 1583,
                                                columnNumber: 41
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                                className: `mt-1 text-[11px] ${isDark ? "text-slate-500" : "text-zinc-400"}`,
                                                children: "Drag to prioritize"
                                            }, void 0, false, {
                                                fileName: "[project]/Downloads/private-project/Preptime-private/web/pages/index.tsx",
                                                lineNumber: 1589,
                                                columnNumber: 41
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/Downloads/private-project/Preptime-private/web/pages/index.tsx",
                                        lineNumber: 1555,
                                        columnNumber: 37
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/Downloads/private-project/Preptime-private/web/pages/index.tsx",
                                    lineNumber: 1549,
                                    columnNumber: 33
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                    className: "absolute top-5 right-5 flex flex-col items-end gap-2",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("button", {
                                            draggable: false,
                                            "data-action-button": true,
                                            onClick: (e)=>{
                                                e.stopPropagation();
                                                const next = actionFor === b.id ? null : b.id;
                                                if (next) openActionMenuFor(b, e.currentTarget);
                                                else {
                                                    setActionFor(null);
                                                    setActionPos(null);
                                                }
                                                if (menuFor === b.id) {
                                                    setMenuFor(null);
                                                    setMenuPos(null);
                                                }
                                            },
                                            className: [
                                                "h-9 w-9 rounded-xl border flex items-center justify-center shadow-sm transition active:scale-[0.98]",
                                                isDark ? "border-slate-600/50 bg-slate-800/60 text-slate-200 hover:bg-slate-700/70 active:bg-slate-700/80" : "border-zinc-200 bg-white text-zinc-800 hover:bg-zinc-50 active:bg-zinc-100"
                                            ].join(" "),
                                            "aria-label": "More options",
                                            title: "More options",
                                            type: "button",
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(DotsIcon, {
                                                className: "w-5 h-5 text-current"
                                            }, void 0, false, {
                                                fileName: "[project]/Downloads/private-project/Preptime-private/web/pages/index.tsx",
                                                lineNumber: 1625,
                                                columnNumber: 41
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/Downloads/private-project/Preptime-private/web/pages/index.tsx",
                                            lineNumber: 1599,
                                            columnNumber: 37
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("button", {
                                            draggable: false,
                                            "data-style-button": true,
                                            onClick: (e)=>{
                                                e.stopPropagation();
                                                const next = menuFor === b.id ? null : b.id;
                                                if (next) openMenuFor(b, e.currentTarget);
                                                else {
                                                    setMenuFor(null);
                                                    setMenuPos(null);
                                                }
                                                if (actionFor === b.id) {
                                                    setActionFor(null);
                                                    setActionPos(null);
                                                }
                                            },
                                            className: [
                                                "h-9 w-9 rounded-xl border flex items-center justify-center shadow-sm transition active:scale-[0.98]",
                                                isDark ? "border-slate-600/50 bg-slate-800/60 text-slate-200 hover:bg-slate-700/70 active:bg-slate-700/80" : "border-zinc-200 bg-white text-zinc-800 hover:bg-zinc-50 active:bg-zinc-100"
                                            ].join(" "),
                                            "aria-label": "Pick focus style",
                                            title: "Pick Pomodoro / Deep Focus / Custom",
                                            type: "button",
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(PlusIcon, {
                                                className: "w-5 h-5 text-current"
                                            }, void 0, false, {
                                                fileName: "[project]/Downloads/private-project/Preptime-private/web/pages/index.tsx",
                                                lineNumber: 1654,
                                                columnNumber: 41
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/Downloads/private-project/Preptime-private/web/pages/index.tsx",
                                            lineNumber: 1628,
                                            columnNumber: 37
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/Downloads/private-project/Preptime-private/web/pages/index.tsx",
                                    lineNumber: 1598,
                                    columnNumber: 33
                                }, this)
                            ]
                        }, b.id, true, {
                            fileName: "[project]/Downloads/private-project/Preptime-private/web/pages/index.tsx",
                            lineNumber: 1456,
                            columnNumber: 29
                        }, this);
                    })
                ]
            }, void 0, true, {
                fileName: "[project]/Downloads/private-project/Preptime-private/web/pages/index.tsx",
                lineNumber: 1412,
                columnNumber: 13
            }, this),
            editId ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                className: "fixed inset-0 z-[2147483646] bg-zinc-900/40 backdrop-blur-[2px] flex items-center justify-center p-4",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                    "data-edit-modal": true,
                    className: `w-full max-w-md rounded-2xl border shadow-2xl ring-1 overflow-hidden ${isDark ? "bg-slate-900 border-slate-700/50 ring-black/20" : "bg-white border-zinc-200 ring-black/5"}`,
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                            className: `px-4 py-3 border-b flex items-center justify-between ${isDark ? "border-slate-700/50" : "border-zinc-200"}`,
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                    className: `font-semibold tracking-tight ${isDark ? "text-slate-100" : "text-zinc-900"}`,
                                    children: "Edit time slot"
                                }, void 0, false, {
                                    fileName: "[project]/Downloads/private-project/Preptime-private/web/pages/index.tsx",
                                    lineNumber: 1678,
                                    columnNumber: 29
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("button", {
                                    draggable: false,
                                    type: "button",
                                    className: `text-sm px-2 py-1 rounded-lg border transition shadow-sm ${isDark ? "border-slate-600/50 text-slate-200 hover:bg-slate-800 active:bg-slate-700" : "border-zinc-200 hover:bg-zinc-50 active:bg-zinc-100"}`,
                                    onClick: ()=>setEditId(null),
                                    children: "Close"
                                }, void 0, false, {
                                    fileName: "[project]/Downloads/private-project/Preptime-private/web/pages/index.tsx",
                                    lineNumber: 1684,
                                    columnNumber: 29
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/Downloads/private-project/Preptime-private/web/pages/index.tsx",
                            lineNumber: 1674,
                            columnNumber: 25
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                            className: "p-4 space-y-4",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("label", {
                                            className: `text-sm ${isDark ? "text-slate-300" : "text-zinc-700"}`,
                                            children: "Name"
                                        }, void 0, false, {
                                            fileName: "[project]/Downloads/private-project/Preptime-private/web/pages/index.tsx",
                                            lineNumber: 1699,
                                            columnNumber: 33
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("input", {
                                            className: `mt-1 w-full border rounded-xl px-3 py-2 shadow-sm focus:outline-none focus:ring-2 ${isDark ? "border-slate-600/50 bg-slate-800/50 text-slate-100 placeholder-slate-500 focus:ring-slate-500/50" : "border-zinc-200 bg-white focus:ring-zinc-900/10"}`,
                                            value: editName,
                                            onChange: (e)=>setEditName(e.target.value),
                                            placeholder: "e.g., CPS209"
                                        }, void 0, false, {
                                            fileName: "[project]/Downloads/private-project/Preptime-private/web/pages/index.tsx",
                                            lineNumber: 1705,
                                            columnNumber: 33
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/Downloads/private-project/Preptime-private/web/pages/index.tsx",
                                    lineNumber: 1698,
                                    columnNumber: 29
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("label", {
                                            className: `text-sm ${isDark ? "text-slate-300" : "text-zinc-700"}`,
                                            children: "Label (optional)"
                                        }, void 0, false, {
                                            fileName: "[project]/Downloads/private-project/Preptime-private/web/pages/index.tsx",
                                            lineNumber: 1717,
                                            columnNumber: 33
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("input", {
                                            className: `mt-1 w-full border rounded-xl px-3 py-2 shadow-sm focus:outline-none focus:ring-2 ${isDark ? "border-slate-600/50 bg-slate-800/50 text-slate-100 placeholder-slate-500 focus:ring-slate-500/50" : "border-zinc-200 bg-white focus:ring-zinc-900/10"}`,
                                            value: editLabel,
                                            onChange: (e)=>setEditLabel(e.target.value),
                                            placeholder: "e.g., Computer Science, Math"
                                        }, void 0, false, {
                                            fileName: "[project]/Downloads/private-project/Preptime-private/web/pages/index.tsx",
                                            lineNumber: 1723,
                                            columnNumber: 33
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/Downloads/private-project/Preptime-private/web/pages/index.tsx",
                                    lineNumber: 1716,
                                    columnNumber: 29
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("label", {
                                            className: `text-sm ${isDark ? "text-slate-300" : "text-zinc-700"}`,
                                            children: "Description (optional)"
                                        }, void 0, false, {
                                            fileName: "[project]/Downloads/private-project/Preptime-private/web/pages/index.tsx",
                                            lineNumber: 1735,
                                            columnNumber: 33
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("textarea", {
                                            className: `mt-1 w-full border rounded-xl px-3 py-2 shadow-sm focus:outline-none focus:ring-2 resize-none ${isDark ? "border-slate-600/50 bg-slate-800/50 text-slate-100 placeholder-slate-500 focus:ring-slate-500/50" : "border-zinc-200 bg-white focus:ring-zinc-900/10"}`,
                                            value: editDescription,
                                            onChange: (e)=>setEditDescription(e.target.value),
                                            placeholder: "Add notes about this task...",
                                            rows: 2
                                        }, void 0, false, {
                                            fileName: "[project]/Downloads/private-project/Preptime-private/web/pages/index.tsx",
                                            lineNumber: 1741,
                                            columnNumber: 33
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/Downloads/private-project/Preptime-private/web/pages/index.tsx",
                                    lineNumber: 1734,
                                    columnNumber: 29
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                    className: "grid grid-cols-2 gap-3",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("label", {
                                                    className: `text-sm ${isDark ? "text-slate-300" : "text-zinc-700"}`,
                                                    children: "Start"
                                                }, void 0, false, {
                                                    fileName: "[project]/Downloads/private-project/Preptime-private/web/pages/index.tsx",
                                                    lineNumber: 1755,
                                                    columnNumber: 37
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("input", {
                                                    className: `mt-1 w-full border rounded-xl px-3 py-2 shadow-sm focus:outline-none focus:ring-2 ${isDark ? "border-slate-600/50 bg-slate-800/50 text-slate-100 focus:ring-slate-500/50" : "border-zinc-200 bg-white focus:ring-zinc-900/10"}`,
                                                    type: "time",
                                                    value: editStart,
                                                    onChange: (e)=>setEditStart(e.target.value)
                                                }, void 0, false, {
                                                    fileName: "[project]/Downloads/private-project/Preptime-private/web/pages/index.tsx",
                                                    lineNumber: 1761,
                                                    columnNumber: 37
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/Downloads/private-project/Preptime-private/web/pages/index.tsx",
                                            lineNumber: 1754,
                                            columnNumber: 33
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("label", {
                                                    className: `text-sm ${isDark ? "text-slate-300" : "text-zinc-700"}`,
                                                    children: "End"
                                                }, void 0, false, {
                                                    fileName: "[project]/Downloads/private-project/Preptime-private/web/pages/index.tsx",
                                                    lineNumber: 1773,
                                                    columnNumber: 37
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("input", {
                                                    className: `mt-1 w-full border rounded-xl px-3 py-2 shadow-sm focus:outline-none focus:ring-2 ${isDark ? "border-slate-600/50 bg-slate-800/50 text-slate-100 focus:ring-slate-500/50" : "border-zinc-200 bg-white focus:ring-zinc-900/10"}`,
                                                    type: "time",
                                                    value: editEnd,
                                                    onChange: (e)=>setEditEnd(e.target.value)
                                                }, void 0, false, {
                                                    fileName: "[project]/Downloads/private-project/Preptime-private/web/pages/index.tsx",
                                                    lineNumber: 1779,
                                                    columnNumber: 37
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/Downloads/private-project/Preptime-private/web/pages/index.tsx",
                                            lineNumber: 1772,
                                            columnNumber: 33
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/Downloads/private-project/Preptime-private/web/pages/index.tsx",
                                    lineNumber: 1753,
                                    columnNumber: 29
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                    className: `rounded-2xl border overflow-hidden shadow-sm ${isDark ? "border-slate-700/50" : "border-green-200"}`,
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                            className: `px-3 py-2 border-b text-sm font-medium ${isDark ? "border-slate-700/50 text-slate-200 bg-slate-800/30" : "border-green-200 text-green-900"}`,
                                            children: "Study method"
                                        }, void 0, false, {
                                            fileName: "[project]/Downloads/private-project/Preptime-private/web/pages/index.tsx",
                                            lineNumber: 1795,
                                            columnNumber: 33
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("button", {
                                            draggable: false,
                                            type: "button",
                                            className: `w-full text-left px-3 py-2 transition ${editStyle === "Pomodoro" ? isDark ? "bg-rose-900/30" : "bg-rose-50" : isDark ? "hover:bg-slate-800" : "hover:bg-zinc-50 active:bg-zinc-100/70"}`,
                                            onClick: ()=>{
                                                setEditStyle("Pomodoro");
                                                setEditFocus(25);
                                                setEditBreak(5);
                                            },
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                                    className: `text-sm font-medium ${isDark ? "text-rose-400" : "text-rose-900"}`,
                                                    children: "Pomodoro"
                                                }, void 0, false, {
                                                    fileName: "[project]/Downloads/private-project/Preptime-private/web/pages/index.tsx",
                                                    lineNumber: 1821,
                                                    columnNumber: 37
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                                    className: `text-xs ${isDark ? "text-slate-400" : "text-zinc-500"}`,
                                                    children: "25/5"
                                                }, void 0, false, {
                                                    fileName: "[project]/Downloads/private-project/Preptime-private/web/pages/index.tsx",
                                                    lineNumber: 1827,
                                                    columnNumber: 37
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/Downloads/private-project/Preptime-private/web/pages/index.tsx",
                                            lineNumber: 1804,
                                            columnNumber: 33
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("button", {
                                            draggable: false,
                                            type: "button",
                                            className: `w-full text-left px-3 py-2 transition border-t ${isDark ? "border-slate-700/50" : "border-green-200"} ${editStyle === "Deep Focus" ? isDark ? "bg-green-900/30" : "bg-green-50" : isDark ? "hover:bg-slate-800" : "hover:bg-zinc-50 active:bg-green-100/70"}`,
                                            onClick: ()=>{
                                                setEditStyle("Deep Focus");
                                                setEditFocus(52);
                                                setEditBreak(17);
                                            },
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                                    className: `text-sm font-medium ${isDark ? "text-green-400" : "text-green-700"}`,
                                                    children: "Deep Focus"
                                                }, void 0, false, {
                                                    fileName: "[project]/Downloads/private-project/Preptime-private/web/pages/index.tsx",
                                                    lineNumber: 1853,
                                                    columnNumber: 37
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                                    className: `text-xs ${isDark ? "text-slate-400" : "text-black-500"}`,
                                                    children: "52/17"
                                                }, void 0, false, {
                                                    fileName: "[project]/Downloads/private-project/Preptime-private/web/pages/index.tsx",
                                                    lineNumber: 1859,
                                                    columnNumber: 37
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/Downloads/private-project/Preptime-private/web/pages/index.tsx",
                                            lineNumber: 1835,
                                            columnNumber: 33
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                            className: `border-t p-3 ${isDark ? "border-slate-700/50" : "border-zinc-200"} ${editStyle === "Custom" ? isDark ? "bg-slate-800/50" : "bg-zinc-50" : ""}`,
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("button", {
                                                    draggable: false,
                                                    type: "button",
                                                    className: "w-full text-left",
                                                    onClick: ()=>{
                                                        setEditStyle("Custom");
                                                    },
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                                            className: `text-sm font-medium ${isDark ? "text-slate-100" : "text-zinc-900"}`,
                                                            children: "Custom"
                                                        }, void 0, false, {
                                                            fileName: "[project]/Downloads/private-project/Preptime-private/web/pages/index.tsx",
                                                            lineNumber: 1884,
                                                            columnNumber: 41
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                                            className: `text-xs ${isDark ? "text-slate-400" : "text-zinc-500"}`,
                                                            children: "Choose your own minutes"
                                                        }, void 0, false, {
                                                            fileName: "[project]/Downloads/private-project/Preptime-private/web/pages/index.tsx",
                                                            lineNumber: 1890,
                                                            columnNumber: 41
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/Downloads/private-project/Preptime-private/web/pages/index.tsx",
                                                    lineNumber: 1876,
                                                    columnNumber: 37
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                                    className: "mt-3 grid grid-cols-2 gap-2",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("label", {
                                                                    className: `text-xs font-medium ${isDark ? "text-green-400" : "text-green-700"}`,
                                                                    children: "Study (min)"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/Downloads/private-project/Preptime-private/web/pages/index.tsx",
                                                                    lineNumber: 1900,
                                                                    columnNumber: 45
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("input", {
                                                                    className: `mt-1 w-full border rounded-lg px-2 py-1.5 text-sm shadow-sm focus:outline-none focus:ring-2 ${isDark ? "border-slate-600/50 bg-slate-800/50 text-slate-100 focus:ring-slate-500/50" : "border-zinc-200 bg-white focus:ring-zinc-900/10"}`,
                                                                    type: "number",
                                                                    min: "1",
                                                                    value: editFocus,
                                                                    onChange: (e)=>setEditFocus(Math.max(1, parseInt(e.target.value) || 1)),
                                                                    disabled: editStyle !== "Custom"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/Downloads/private-project/Preptime-private/web/pages/index.tsx",
                                                                    lineNumber: 1906,
                                                                    columnNumber: 45
                                                                }, this)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/Downloads/private-project/Preptime-private/web/pages/index.tsx",
                                                            lineNumber: 1899,
                                                            columnNumber: 41
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("label", {
                                                                    className: `text-xs font-medium ${isDark ? "text-sky-400" : "text-sky-700"}`,
                                                                    children: "Break (min)"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/Downloads/private-project/Preptime-private/web/pages/index.tsx",
                                                                    lineNumber: 1924,
                                                                    columnNumber: 45
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("input", {
                                                                    className: `mt-1 w-full border rounded-lg px-2 py-1.5 text-sm shadow-sm focus:outline-none focus:ring-2 ${isDark ? "border-slate-600/50 bg-slate-800/50 text-slate-100 focus:ring-slate-500/50" : "border-zinc-200 bg-white focus:ring-zinc-900/10"}`,
                                                                    type: "number",
                                                                    min: "1",
                                                                    value: editBreak,
                                                                    onChange: (e)=>setEditBreak(Math.max(1, parseInt(e.target.value) || 1)),
                                                                    disabled: editStyle !== "Custom"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/Downloads/private-project/Preptime-private/web/pages/index.tsx",
                                                                    lineNumber: 1930,
                                                                    columnNumber: 45
                                                                }, this)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/Downloads/private-project/Preptime-private/web/pages/index.tsx",
                                                            lineNumber: 1923,
                                                            columnNumber: 41
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/Downloads/private-project/Preptime-private/web/pages/index.tsx",
                                                    lineNumber: 1898,
                                                    columnNumber: 37
                                                }, this),
                                                !editStyle && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                                    className: `mt-2 text-xs ${isDark ? "text-slate-400" : "text-zinc-500"}`,
                                                    children: "No method selected"
                                                }, void 0, false, {
                                                    fileName: "[project]/Downloads/private-project/Preptime-private/web/pages/index.tsx",
                                                    lineNumber: 1949,
                                                    columnNumber: 41
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/Downloads/private-project/Preptime-private/web/pages/index.tsx",
                                            lineNumber: 1867,
                                            columnNumber: 33
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/Downloads/private-project/Preptime-private/web/pages/index.tsx",
                                    lineNumber: 1791,
                                    columnNumber: 29
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                    className: "flex gap-2",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("button", {
                                            draggable: false,
                                            type: "button",
                                            className: `flex-1 px-4 py-2 rounded-xl border transition shadow-sm ${isDark ? "border-slate-600/50 text-slate-200 hover:bg-slate-800 active:bg-slate-700" : "border-zinc-200 hover:bg-zinc-50 active:bg-zinc-100"}`,
                                            onClick: ()=>setEditId(null),
                                            children: "Cancel"
                                        }, void 0, false, {
                                            fileName: "[project]/Downloads/private-project/Preptime-private/web/pages/index.tsx",
                                            lineNumber: 1960,
                                            columnNumber: 33
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("button", {
                                            draggable: false,
                                            type: "button",
                                            className: `px-4 py-2 rounded-xl shadow-sm active:scale-[0.99] ${isDark ? "bg-slate-100 text-slate-900 hover:opacity-90" : "bg-zinc-900 text-white hover:opacity-90"}`,
                                            onClick: applyEdit,
                                            children: "Save changes"
                                        }, void 0, false, {
                                            fileName: "[project]/Downloads/private-project/Preptime-private/web/pages/index.tsx",
                                            lineNumber: 1971,
                                            columnNumber: 33
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/Downloads/private-project/Preptime-private/web/pages/index.tsx",
                                    lineNumber: 1959,
                                    columnNumber: 29
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/Downloads/private-project/Preptime-private/web/pages/index.tsx",
                            lineNumber: 1697,
                            columnNumber: 25
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/Downloads/private-project/Preptime-private/web/pages/index.tsx",
                    lineNumber: 1667,
                    columnNumber: 21
                }, this)
            }, void 0, false, {
                fileName: "[project]/Downloads/private-project/Preptime-private/web/pages/index.tsx",
                lineNumber: 1666,
                columnNumber: 17
            }, this) : null,
            actionFor && actionPos && (()=>{
                const actionBlock = filtered.find((b)=>b.id === actionFor);
                if (!actionBlock) return null;
                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                    "data-action-menu": true,
                    className: `absolute w-[180px] z-[2147483647] rounded-2xl border shadow-2xl ring-1 overflow-hidden ${isDark ? "border-slate-700/50 bg-slate-900 ring-black/20" : "border-zinc-200 bg-white ring-black/5"}`,
                    style: {
                        top: actionPos.top,
                        left: actionPos.left
                    },
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("button", {
                            draggable: false,
                            type: "button",
                            className: `w-full text-left px-3 py-2 transition ${isDark ? "hover:bg-slate-800 active:bg-slate-700" : "hover:bg-zinc-50 active:bg-zinc-100/70"}`,
                            onClick: ()=>{
                                setActionFor(null);
                                setActionPos(null);
                                startEdit(actionBlock);
                            },
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                    className: `text-sm font-medium ${isDark ? "text-slate-100" : "text-zinc-900"}`,
                                    children: "Edit"
                                }, void 0, false, {
                                    fileName: "[project]/Downloads/private-project/Preptime-private/web/pages/index.tsx",
                                    lineNumber: 2014,
                                    columnNumber: 29
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                    className: `text-xs ${isDark ? "text-slate-400" : "text-zinc-500"}`,
                                    children: "Change name, time, and method"
                                }, void 0, false, {
                                    fileName: "[project]/Downloads/private-project/Preptime-private/web/pages/index.tsx",
                                    lineNumber: 2020,
                                    columnNumber: 29
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/Downloads/private-project/Preptime-private/web/pages/index.tsx",
                            lineNumber: 2001,
                            columnNumber: 25
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                            className: `border-t ${isDark ? "border-slate-700/50" : "border-zinc-200"}`
                        }, void 0, false, {
                            fileName: "[project]/Downloads/private-project/Preptime-private/web/pages/index.tsx",
                            lineNumber: 2028,
                            columnNumber: 25
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("button", {
                            draggable: false,
                            type: "button",
                            className: `w-full text-left px-3 py-2 transition ${isDark ? "hover:bg-rose-900/40 active:bg-rose-900/60" : "hover:bg-rose-50 active:bg-rose-100/60"}`,
                            onClick: ()=>{
                                onDeleteBlock(actionBlock.id);
                                setActionFor(null);
                                setActionPos(null);
                                if (menuFor === actionBlock.id) {
                                    setMenuFor(null);
                                    setMenuPos(null);
                                }
                                const cur = manualOrderByDate[selectedISO];
                                if (cur && cur.length) {
                                    onSetManualOrderForDate(selectedISO, cur.filter((x)=>x !== actionBlock.id));
                                }
                            },
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                    className: "text-sm font-medium text-rose-700",
                                    children: "Delete"
                                }, void 0, false, {
                                    fileName: "[project]/Downloads/private-project/Preptime-private/web/pages/index.tsx",
                                    lineNumber: 2058,
                                    columnNumber: 29
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                    className: `text-xs ${isDark ? "text-slate-400" : "text-zinc-500"}`,
                                    children: "Remove this time slot"
                                }, void 0, false, {
                                    fileName: "[project]/Downloads/private-project/Preptime-private/web/pages/index.tsx",
                                    lineNumber: 2061,
                                    columnNumber: 29
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/Downloads/private-project/Preptime-private/web/pages/index.tsx",
                            lineNumber: 2033,
                            columnNumber: 25
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/Downloads/private-project/Preptime-private/web/pages/index.tsx",
                    lineNumber: 1993,
                    columnNumber: 21
                }, this);
            })(),
            menuFor && menuPos && (()=>{
                const menuBlock = filtered.find((b)=>b.id === menuFor);
                if (!menuBlock) return null;
                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                    "data-style-menu": true,
                    className: `absolute w-56 z-[2147483647] rounded-2xl border shadow-2xl ring-1 overflow-hidden ${isDark ? "border-slate-700/50 bg-slate-900 ring-black/20" : "border-zinc-200 bg-white ring-black/5"}`,
                    style: {
                        top: menuPos.top,
                        left: menuPos.left
                    },
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(MenuItem, {
                            label: "Pomodoro",
                            sub: "25 minutes study 5 minutes break",
                            isDark: isDark,
                            onClick: ()=>{
                                onPickStyle(menuBlock.id, "Pomodoro");
                                onSetCustomMinutes(menuBlock.id, 25, 5);
                                setMenuFor(null);
                                setMenuPos(null);
                            }
                        }, void 0, false, {
                            fileName: "[project]/Downloads/private-project/Preptime-private/web/pages/index.tsx",
                            lineNumber: 2085,
                            columnNumber: 25
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(MenuItem, {
                            label: "Deep Focus",
                            sub: "52 minutes study 17 minutes break",
                            isDark: isDark,
                            onClick: ()=>{
                                onPickStyle(menuBlock.id, "Deep Focus");
                                onSetCustomMinutes(menuBlock.id, 52, 17);
                                setMenuFor(null);
                                setMenuPos(null);
                            }
                        }, void 0, false, {
                            fileName: "[project]/Downloads/private-project/Preptime-private/web/pages/index.tsx",
                            lineNumber: 2097,
                            columnNumber: 25
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                            className: `border-t p-3 ${isDark ? "border-slate-700/50" : "border-zinc-200"}`,
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("button", {
                                    draggable: false,
                                    className: "w-full text-left",
                                    type: "button",
                                    onClick: ()=>{
                                        onPickStyle(menuBlock.id, "Custom");
                                    },
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                            className: `text-sm font-medium ${isDark ? "text-slate-100" : "text-zinc-900"}`,
                                            children: "Custom"
                                        }, void 0, false, {
                                            fileName: "[project]/Downloads/private-project/Preptime-private/web/pages/index.tsx",
                                            lineNumber: 2121,
                                            columnNumber: 33
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                            className: `text-xs ${isDark ? "text-slate-400" : "text-zinc-500"}`,
                                            children: "Choose your own minutes"
                                        }, void 0, false, {
                                            fileName: "[project]/Downloads/private-project/Preptime-private/web/pages/index.tsx",
                                            lineNumber: 2124,
                                            columnNumber: 33
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/Downloads/private-project/Preptime-private/web/pages/index.tsx",
                                    lineNumber: 2113,
                                    columnNumber: 29
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                    className: "mt-3 grid grid-cols-2 gap-2",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("label", {
                                                    className: `text-xs ${isDark ? "text-green-400" : "text-green-600"}`,
                                                    children: "Study (min)"
                                                }, void 0, false, {
                                                    fileName: "[project]/Downloads/private-project/Preptime-private/web/pages/index.tsx",
                                                    lineNumber: 2131,
                                                    columnNumber: 37
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("input", {
                                                    type: "number",
                                                    min: 1,
                                                    max: 300,
                                                    value: customFocus,
                                                    onChange: (e)=>setCustomFocus(Number(e.target.value)),
                                                    className: `mt-1 w-full border rounded-xl px-2 py-1 text-sm shadow-sm focus:outline-none focus:ring-2 ${isDark ? "border-slate-600/50 bg-slate-800 text-slate-100 focus:ring-slate-500/50" : "border-zinc-200 bg-white focus:ring-zinc-900/10"}`
                                                }, void 0, false, {
                                                    fileName: "[project]/Downloads/private-project/Preptime-private/web/pages/index.tsx",
                                                    lineNumber: 2134,
                                                    columnNumber: 37
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/Downloads/private-project/Preptime-private/web/pages/index.tsx",
                                            lineNumber: 2130,
                                            columnNumber: 33
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("label", {
                                                    className: `text-xs ${isDark ? "text-blue-400" : "text-blue-600"}`,
                                                    children: "Break (min)"
                                                }, void 0, false, {
                                                    fileName: "[project]/Downloads/private-project/Preptime-private/web/pages/index.tsx",
                                                    lineNumber: 2150,
                                                    columnNumber: 37
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("input", {
                                                    type: "number",
                                                    min: 1,
                                                    max: 120,
                                                    value: customBreak,
                                                    onChange: (e)=>setCustomBreak(Number(e.target.value)),
                                                    className: `mt-1 w-full border rounded-xl px-2 py-1 text-sm shadow-sm focus:outline-none focus:ring-2 ${isDark ? "border-slate-600/50 bg-slate-800 text-slate-100 focus:ring-slate-500/50" : "border-zinc-200 bg-white focus:ring-zinc-900/10"}`
                                                }, void 0, false, {
                                                    fileName: "[project]/Downloads/private-project/Preptime-private/web/pages/index.tsx",
                                                    lineNumber: 2153,
                                                    columnNumber: 37
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/Downloads/private-project/Preptime-private/web/pages/index.tsx",
                                            lineNumber: 2149,
                                            columnNumber: 33
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/Downloads/private-project/Preptime-private/web/pages/index.tsx",
                                    lineNumber: 2129,
                                    columnNumber: 29
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("button", {
                                    draggable: false,
                                    type: "button",
                                    className: `mt-3 w-full rounded-xl py-2 text-sm shadow-sm transition-all hover:opacity-90 active:scale-[0.99] ${isDark ? "bg-indigo-600 text-white border border-indigo-500/50 hover:bg-indigo-500" : "bg-zinc-900 text-white hover:bg-zinc-800"}`,
                                    onClick: ()=>{
                                        const f = Math.max(1, Math.min(300, Math.floor(customFocus)));
                                        const br = Math.max(1, Math.min(120, Math.floor(customBreak)));
                                        onPickStyle(menuBlock.id, "Custom");
                                        onSetCustomMinutes(menuBlock.id, f, br);
                                        setMenuFor(null);
                                        setMenuPos(null);
                                    },
                                    children: "Save custom minutes"
                                }, void 0, false, {
                                    fileName: "[project]/Downloads/private-project/Preptime-private/web/pages/index.tsx",
                                    lineNumber: 2169,
                                    columnNumber: 29
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/Downloads/private-project/Preptime-private/web/pages/index.tsx",
                            lineNumber: 2109,
                            columnNumber: 25
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/Downloads/private-project/Preptime-private/web/pages/index.tsx",
                    lineNumber: 2077,
                    columnNumber: 21
                }, this);
            })()
        ]
    }, void 0, true, {
        fileName: "[project]/Downloads/private-project/Preptime-private/web/pages/index.tsx",
        lineNumber: 1345,
        columnNumber: 9
    }, this);
}
function Home() {
    const [currentDate, setCurrentDate] = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useState"])(new Date());
    const [currentMonday, setCurrentMonday] = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useState"])(getMonday(new Date()));
    const [selectedDateIndex, setSelectedDateIndex] = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useState"])(null);
    const [showModal, setShowModal] = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useState"])(false);
    const [showSettings, setShowSettings] = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useState"])(false);
    const [selectedSlot, setSelectedSlot] = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useState"])(null);
    const [taskTitle, setTaskTitle] = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useState"])("");
    const [taskLabel, setTaskLabel] = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useState"])("");
    const [taskDescription, setTaskDescription] = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useState"])("");
    const [startTime, setStartTime] = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useState"])("09:00");
    const [startAmPm, setStartAmPm] = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useState"])("AM");
    const [endTime, setEndTime] = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useState"])("10:00");
    const [endAmPm, setEndAmPm] = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useState"])("AM");
    const [selectedColor, setSelectedColor] = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useState"])(taskColors[0]);
    const [theme, setTheme] = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useState"])("system");
    const [isDark, setIsDark] = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useState"])(false);
    const [viewType, setViewType] = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useState"])("week");
    const [tasks, setTasks] = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useState"])([]);
    // Removed 'now' state and interval here to prevent frequent re-renders of the whole page.
    // Time is now managed locally in Sidebar, FocusTimerPanel, and ModernSchedule.
    const [selectedDate, setSelectedDate] = __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["default"].useState(()=>new Date());
    const [blocks, setBlocks] = __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["default"].useState([]);
    const [activeId, setActiveId] = __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["default"].useState(undefined);
    const [manualOrderByDate, setManualOrderByDate] = __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["default"].useState({});
    const [isLoaded, setIsLoaded] = __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["default"].useState(false);
    // Save blocks to localStorage whenever they change
    __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["default"].useEffect(()=>{
        if (!isLoaded) return;
        if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
        ;
    }, [
        blocks,
        isLoaded
    ]);
    // Persist activeId
    __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["default"].useEffect(()=>{
        if (!isLoaded) return;
        if (activeId) {
            localStorage.setItem("preptime-active-id", activeId);
        } else {
            localStorage.removeItem("preptime-active-id");
        }
    }, [
        activeId,
        isLoaded
    ]);
    // Persist selectedDate
    __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["default"].useEffect(()=>{
        if (!isLoaded) return;
        localStorage.setItem("preptime-selected-date", selectedDate.toISOString());
    }, [
        selectedDate,
        isLoaded
    ]);
    function selectDateEverywhere(d) {
        const nd = new Date(d);
        nd.setHours(0, 0, 0, 0);
        setSelectedDate(nd);
        setCurrentDate(nd);
        const mon = getMonday(nd);
        setCurrentMonday(mon);
        // If we are in week view, keep the highlight index aligned to the chosen date
        if (viewType === "week") {
            const diffDays = Math.round((nd.getTime() - mon.getTime()) / (1000 * 60 * 60 * 24));
            const safe = Math.max(0, Math.min(6, diffDays));
            setSelectedDateIndex(safe);
        } else {
            setSelectedDateIndex(null);
        }
    }
    (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useEffect"])(()=>{
        const savedBlocks = localStorage.getItem("preptime-blocks");
        const savedOrder = localStorage.getItem("preptime-block-order");
        if (savedBlocks) setBlocks(JSON.parse(savedBlocks));
        if (savedOrder) setManualOrderByDate(JSON.parse(savedOrder));
        const savedActiveId = localStorage.getItem("preptime-active-id");
        if (savedActiveId) {
            // Verify block exists before restoring
            let parsedBlocks = [];
            try {
                parsedBlocks = savedBlocks ? JSON.parse(savedBlocks) : [];
            } catch (e) {
                console.error("Error parsing saved blocks for activeId verification", e);
            }
            const exists = parsedBlocks.some((b)=>b.id === savedActiveId);
            if (exists) setActiveId(savedActiveId);
        }
        const savedDate = localStorage.getItem("preptime-selected-date");
        if (savedDate) {
            const date = new Date(savedDate);
            if (!isNaN(date.getTime())) {
                selectDateEverywhere(date);
            }
        }
        const savedTheme = localStorage.getItem("preptime-theme");
        const savedView = localStorage.getItem("preptime-view");
        const savedTasks = localStorage.getItem("preptime-tasks");
        if (savedTheme) setTheme(savedTheme);
        if (savedView) setViewType(savedView);
        if (savedTasks) {
            const parsed = JSON.parse(savedTasks);
            const updated = parsed.map((t)=>({
                    id: t.id,
                    title: t.title,
                    description: t.description || "",
                    label: t.label || "",
                    day: t.day,
                    date: t.date,
                    // Normalize loaded tasks to fix "17 PM" bugs from storage
                    startHour: normalizeHour24(t.startHour),
                    endHour: normalizeHour24(t.endHour),
                    color: t.color,
                    completed: t.completed ?? false
                }));
            setTasks(updated);
            // Auto-save the fixed data immediately so bug doesn't recur
            localStorage.setItem("preptime-tasks", JSON.stringify(updated));
        }
        setIsLoaded(true);
    }, []);
    (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useEffect"])(()=>{
        if (!isLoaded) return;
        localStorage.setItem("preptime-block-order", JSON.stringify(manualOrderByDate));
    }, [
        manualOrderByDate,
        isLoaded
    ]);
    (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["useEffect"])(()=>{
        const updateTheme = ()=>{
            if (theme === "system") {
                const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
                setIsDark(prefersDark);
            } else {
                setIsDark(theme === "dark");
            }
        };
        updateTheme();
        const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
        const handler = ()=>{
            if (theme === "system") updateTheme();
        };
        mediaQuery.addEventListener("change", handler);
        return ()=>mediaQuery.removeEventListener("change", handler);
    }, [
        theme
    ]);
    const handleThemeChange = (newTheme)=>{
        setTheme(newTheme);
        localStorage.setItem("preptime-theme", newTheme);
    };
    const handleViewChange = (newView)=>{
        setViewType(newView);
        localStorage.setItem("preptime-view", newView);
    };
    const toggleTaskCompletion = (taskId, e)=>{
        if (e) e.stopPropagation();
        const updated = tasks.map((task)=>task.id === taskId ? {
                ...task,
                completed: !task.completed
            } : task);
        setTasks(updated);
        localStorage.setItem("preptime-tasks", JSON.stringify(updated));
    };
    const deleteTask = (taskId, e)=>{
        e.stopPropagation();
        const updated = tasks.filter((task)=>task.id !== taskId);
        setTasks(updated);
        localStorage.setItem("preptime-tasks", JSON.stringify(updated));
    };
    function pickStyle(id, style) {
        setBlocks((prev)=>prev.map((b)=>b.id === id ? {
                    ...b,
                    style
                } : b));
    }
    function onSetCustomMinutes(id, focusMin, breakMin) {
        setBlocks((prev)=>prev.map((b)=>b.id === id ? {
                    ...b,
                    focusMin,
                    breakMin
                } : b));
    }
    function updateBlock(id, patch) {
        setBlocks((prev)=>prev.map((b)=>b.id === id ? {
                    ...b,
                    ...patch
                } : b));
    }
    function deleteSlot(id) {
        setBlocks((prev)=>prev.filter((b)=>b.id !== id));
        setActiveId((prev)=>prev === id ? undefined : prev);
        setManualOrderByDate((prev)=>{
            const next = {
                ...prev
            };
            Object.keys(next).forEach((day)=>{
                next[day] = next[day].filter((x)=>x !== id);
                if (next[day].length === 0) delete next[day];
            });
            return next;
        });
    }
    const getTaskStats = ()=>{
        const completed = tasks.filter((t)=>t.completed).length;
        const remaining = tasks.length - completed;
        return {
            total: tasks.length,
            completed,
            remaining
        };
    };
    const goToPrev = ()=>{
        if (viewType === "day") {
            const d = addDays(currentDate, -1);
            setCurrentDate(d);
            selectDateEverywhere(d);
        } else if (viewType === "week") {
            const newMon = addDays(currentMonday, -7);
            setCurrentMonday(newMon);
            // keep selection if it exists; otherwise default to Monday
            const idx = selectedDateIndex ?? 0;
            const d = addDays(newMon, idx);
            selectDateEverywhere(d);
        } else if (viewType === "month") {
            const newDate = new Date(currentDate);
            newDate.setMonth(newDate.getMonth() - 1);
            setCurrentDate(newDate);
            setSelectedDate(new Date(newDate));
        } else if (viewType === "season") {
            const newDate = new Date(currentDate);
            newDate.setMonth(newDate.getMonth() - 3);
            setCurrentDate(newDate);
            setSelectedDate(new Date(newDate));
        } else if (viewType === "year") {
            const newDate = new Date(currentDate);
            newDate.setFullYear(newDate.getFullYear() - 1);
            setCurrentDate(newDate);
            setSelectedDate(new Date(newDate));
        }
    };
    const goToNext = ()=>{
        if (viewType === "day") {
            const d = addDays(currentDate, 1);
            setCurrentDate(d);
            selectDateEverywhere(d);
        } else if (viewType === "week") {
            const newMon = addDays(currentMonday, 7);
            setCurrentMonday(newMon);
            // keep selection if it exists; otherwise default to Monday
            const idx = selectedDateIndex ?? 0;
            const d = addDays(newMon, idx);
            selectDateEverywhere(d);
        } else if (viewType === "month") {
            const newDate = new Date(currentDate);
            newDate.setMonth(newDate.getMonth() + 1);
            setCurrentDate(newDate);
            setSelectedDate(new Date(newDate));
        } else if (viewType === "season") {
            const newDate = new Date(currentDate);
            newDate.setMonth(newDate.getMonth() + 3);
            setCurrentDate(newDate);
            setSelectedDate(new Date(newDate));
        } else if (viewType === "year") {
            const newDate = new Date(currentDate);
            newDate.setFullYear(newDate.getFullYear() + 1);
            setCurrentDate(newDate);
            setSelectedDate(new Date(newDate));
        }
    };
    const getViewTitle = ()=>{
        if (viewType === "day") {
            return formatFullDate(currentDate);
        } else if (viewType === "week") {
            return `Week of ${formatFullWeek(currentMonday)}`;
        } else if (viewType === "month") {
            return `${months[currentDate.getMonth()]} ${currentDate.getFullYear()}`;
        } else if (viewType === "season") {
            return `${getSeason(currentDate)} ${currentDate.getFullYear()}`;
        } else {
            return `${currentDate.getFullYear()}`;
        }
    };
    const handleDateClick = (index)=>{
        const nextIndex = index === selectedDateIndex ? null : index;
        setSelectedDateIndex(nextIndex);
        if (nextIndex !== null) {
            const d = addDays(currentMonday, nextIndex);
            selectDateEverywhere(d);
        }
    };
    const goToDayView = (date)=>{
        const d = new Date(date);
        d.setHours(0, 0, 0, 0);
        setCurrentDate(d);
        selectDateEverywhere(d);
        setSelectedDateIndex(null);
        setViewType("day");
        localStorage.setItem("preptime-view", "day");
    };
    const handleSlotClick = (day, hour, date, e)=>{
        selectDateEverywhere(date);
        if (e) {
            e.stopPropagation();
        }
        setSelectedSlot({
            day,
            hour,
            date
        });
        // Set time input values safely
        setStartTime(hourToTimeString(hour));
        setStartAmPm(hourToAmPm(hour));
        setEndTime(hourToTimeString(hour + 1));
        setEndAmPm(hourToAmPm(hour + 1));
        setSelectedColor(taskColors[0]);
        setShowModal(true);
    };
    const closeModal = ()=>{
        setShowModal(false);
        setTaskTitle("");
        setTaskLabel("");
        setTaskDescription("");
        setStartTime("09:00");
        setStartAmPm("AM");
        setEndTime("10:00");
        setEndAmPm("AM");
        setSelectedColor(taskColors[0]);
    };
    const saveTask = ()=>{
        if (!selectedSlot) return;
        // Use normalizeHour24 to ensure we never save bugged >24 hours
        const startHourNum = normalizeHour24(timeStringToHour(startTime, startAmPm));
        const endHourNum = normalizeHour24(timeStringToHour(endTime, endAmPm));
        // Safety check just in case
        if (endHourNum <= startHourNum) {
            alert("End time must be after start time");
            return;
        }
        const newTask = {
            id: Date.now().toString(),
            title: taskTitle,
            label: taskLabel,
            description: taskDescription,
            day: selectedSlot.day,
            date: formatDateKey(selectedSlot.date),
            startHour: startHourNum,
            endHour: endHourNum,
            color: selectedColor.value,
            completed: false
        };
        const updatedTasks = [
            ...tasks,
            newTask
        ];
        setTasks(updatedTasks);
        localStorage.setItem("preptime-tasks", JSON.stringify(updatedTasks));
        // ALSO create a TimeBlock so the Sidebar isn't empty
        const newBlockId = uid();
        const newBlock = {
            id: newBlockId,
            name: taskTitle.trim() || "Untitled",
            dateISO: toISODate(selectedSlot.date),
            start: startTime,
            end: endTime
        };
        setBlocks((prev)=>[
                newBlock,
                ...prev
            ]);
        setActiveId(newBlockId);
        // ensure sidebar shows the correct day immediately
        selectDateEverywhere(selectedSlot.date);
        // keep manual order for that day (put new one at top)
        const dayISO = toISODate(selectedSlot.date);
        setManualOrderByDate((prev)=>{
            const existing = prev[dayISO] ?? [];
            return {
                ...prev,
                [dayISO]: [
                    newBlockId,
                    ...existing.filter((x)=>x !== newBlockId)
                ]
            };
        });
        closeModal();
    };
    const isValidTime = ()=>{
        const startHourNum = timeStringToHour(startTime, startAmPm);
        const endHourNum = timeStringToHour(endTime, endAmPm);
        // Use relaxed validation for UI, strict validation on save
        // Simple check: ensure they aren't equal if it's the same day logic
        return endHourNum > startHourNum || endHourNum === 0 && startHourNum > 0;
    };
    const renderTaskBlock = (task, date)=>{
        // Safety: ensure reasonable bounds for render
        const start = Math.max(startHour, Math.min(endHour, task.startHour));
        const end = Math.max(startHour, Math.min(endHour, task.endHour));
        if (end <= start) return null; // Don't render invalid blocks
        const duration = end - start;
        const heightInRows = duration;
        const startTimeDisplay = formatHour(task.startHour);
        const endTimeDisplay = formatHour(task.endHour);
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
            onClick: (e)=>{
                e.stopPropagation();
                toggleTaskCompletion(task.id);
            },
            className: `absolute pointer-events-auto ${task.color} border-l-4 border-opacity-80 rounded-r px-2 py-1 text-xs font-medium text-white overflow-hidden cursor-pointer hover:opacity-90 transition-all z-10 shadow-sm group ${task.completed ? "opacity-50" : ""}`,
            style: {
                top: `${(start - startHour) * 3.5}rem`,
                height: `${heightInRows * 3.5}rem`,
                left: "2px",
                right: "2px",
                borderLeftColor: "rgba(0,0,0,0.2)"
            },
            title: `${task.title}${task.label ? " - " + task.label : ""} ${task.completed ? "(Completed)" : ""}`,
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                className: "flex items-start justify-between gap-1",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                        className: "flex-1 overflow-hidden",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                className: `font-semibold truncate flex items-center gap-1 ${task.completed ? "line-through" : ""}`,
                                children: [
                                    task.completed && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("span", {
                                        className: "text-xs",
                                        children: "✓"
                                    }, void 0, false, {
                                        fileName: "[project]/Downloads/private-project/Preptime-private/web/pages/index.tsx",
                                        lineNumber: 2681,
                                        columnNumber: 48
                                    }, this),
                                    task.title
                                ]
                            }, void 0, true, {
                                fileName: "[project]/Downloads/private-project/Preptime-private/web/pages/index.tsx",
                                lineNumber: 2677,
                                columnNumber: 25
                            }, this),
                            task.label && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                className: "text-[10px] opacity-90 truncate",
                                children: task.label
                            }, void 0, false, {
                                fileName: "[project]/Downloads/private-project/Preptime-private/web/pages/index.tsx",
                                lineNumber: 2685,
                                columnNumber: 29
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                className: "text-[10px] opacity-80",
                                children: [
                                    startTimeDisplay,
                                    " - ",
                                    endTimeDisplay
                                ]
                            }, void 0, true, {
                                fileName: "[project]/Downloads/private-project/Preptime-private/web/pages/index.tsx",
                                lineNumber: 2689,
                                columnNumber: 25
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/Downloads/private-project/Preptime-private/web/pages/index.tsx",
                        lineNumber: 2676,
                        columnNumber: 21
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("button", {
                        onClick: (e)=>deleteTask(task.id, e),
                        className: "opacity-0 group-hover:opacity-100 transition-opacity p-0.5 hover:bg-white/20 rounded",
                        title: "Delete task",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("svg", {
                            className: "w-3 h-3",
                            fill: "currentColor",
                            viewBox: "0 0 20 20",
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("path", {
                                fillRule: "evenodd",
                                d: "M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z",
                                clipRule: "evenodd"
                            }, void 0, false, {
                                fileName: "[project]/Downloads/private-project/Preptime-private/web/pages/index.tsx",
                                lineNumber: 2699,
                                columnNumber: 29
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/Downloads/private-project/Preptime-private/web/pages/index.tsx",
                            lineNumber: 2698,
                            columnNumber: 25
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/Downloads/private-project/Preptime-private/web/pages/index.tsx",
                        lineNumber: 2693,
                        columnNumber: 21
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/Downloads/private-project/Preptime-private/web/pages/index.tsx",
                lineNumber: 2675,
                columnNumber: 17
            }, this)
        }, task.id, false, {
            fileName: "[project]/Downloads/private-project/Preptime-private/web/pages/index.tsx",
            lineNumber: 2656,
            columnNumber: 13
        }, this);
    };
    const renderDayView = ()=>{
        const isToday = currentDate.toDateString() === new Date().toDateString();
        const dayTasks = tasks.filter((task)=>task.date === formatDateKey(currentDate));
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
            className: "overflow-x-auto",
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                className: "min-w-[600px]",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                        className: `grid grid-cols-[70px_1fr] border-b-2 sticky top-0 z-10 ${isDark ? "bg-slate-800 border-slate-600" : "bg-white border-slate-300"}`,
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                className: `p-3 text-xs font-semibold ${isDark ? "text-slate-400" : "text-slate-500"}`
                            }, void 0, false, {
                                fileName: "[project]/Downloads/private-project/Preptime-private/web/pages/index.tsx",
                                lineNumber: 2726,
                                columnNumber: 25
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                className: `p-3 text-center ${isDark ? "text-slate-200" : "text-slate-700"}`,
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                        className: "text-xs font-semibold uppercase tracking-wide mb-1",
                                        children: daysFull[currentDate.getDay()]
                                    }, void 0, false, {
                                        fileName: "[project]/Downloads/private-project/Preptime-private/web/pages/index.tsx",
                                        lineNumber: 2734,
                                        columnNumber: 29
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                        className: `text-2xl font-bold ${isToday ? "text-indigo-600" : ""}`,
                                        children: currentDate.getDate()
                                    }, void 0, false, {
                                        fileName: "[project]/Downloads/private-project/Preptime-private/web/pages/index.tsx",
                                        lineNumber: 2737,
                                        columnNumber: 29
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/Downloads/private-project/Preptime-private/web/pages/index.tsx",
                                lineNumber: 2730,
                                columnNumber: 25
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/Downloads/private-project/Preptime-private/web/pages/index.tsx",
                        lineNumber: 2720,
                        columnNumber: 21
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                        className: "grid grid-cols-[70px_1fr] relative",
                        children: [
                            Array.from({
                                length: endHour - startHour
                            }).map((_, row)=>{
                                const hour = startHour + row;
                                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["default"].Fragment, {
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                            className: `px-2 py-3 text-xs text-right border-b ${isDark ? "text-slate-400 bg-slate-700 border-slate-600" : "text-slate-500 bg-slate-50 border-slate-200"}`,
                                            children: formatHour(hour)
                                        }, void 0, false, {
                                            fileName: "[project]/Downloads/private-project/Preptime-private/web/pages/index.tsx",
                                            lineNumber: 2752,
                                            columnNumber: 37
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                            onClick: (e)=>handleSlotClick(0, hour, currentDate, e),
                                            className: `h-14 border-b transition-all cursor-pointer relative group ${isDark ? "border-slate-700 hover:bg-indigo-900/30" : "border-slate-200 hover:bg-indigo-50"}`,
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("button", {
                                                onClick: (e)=>handleSlotClick(0, hour, currentDate, e),
                                                className: "absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity flex items-start justify-end p-1 z-20",
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                                    className: `text-xs font-bold rounded px-1 shadow-sm border ${isDark ? "text-indigo-400 bg-slate-800 border-indigo-700" : "text-indigo-600 bg-white border-indigo-200"}`,
                                                    children: "+"
                                                }, void 0, false, {
                                                    fileName: "[project]/Downloads/private-project/Preptime-private/web/pages/index.tsx",
                                                    lineNumber: 2772,
                                                    columnNumber: 45
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/Downloads/private-project/Preptime-private/web/pages/index.tsx",
                                                lineNumber: 2768,
                                                columnNumber: 41
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/Downloads/private-project/Preptime-private/web/pages/index.tsx",
                                            lineNumber: 2761,
                                            columnNumber: 37
                                        }, this)
                                    ]
                                }, `day-row-${hour}`, true, {
                                    fileName: "[project]/Downloads/private-project/Preptime-private/web/pages/index.tsx",
                                    lineNumber: 2751,
                                    columnNumber: 33
                                }, this);
                            }),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                className: "absolute top-0 left-[80px] right-0 bottom-0 pointer-events-auto",
                                children: dayTasks.map((task)=>renderTaskBlock(task, currentDate))
                            }, void 0, false, {
                                fileName: "[project]/Downloads/private-project/Preptime-private/web/pages/index.tsx",
                                lineNumber: 2786,
                                columnNumber: 25
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/Downloads/private-project/Preptime-private/web/pages/index.tsx",
                        lineNumber: 2746,
                        columnNumber: 21
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/Downloads/private-project/Preptime-private/web/pages/index.tsx",
                lineNumber: 2719,
                columnNumber: 17
            }, this)
        }, void 0, false, {
            fileName: "[project]/Downloads/private-project/Preptime-private/web/pages/index.tsx",
            lineNumber: 2718,
            columnNumber: 13
        }, this);
    };
    const renderWeekView = ()=>{
        const weekDates = Array.from({
            length: 7
        }, (_, i)=>addDays(currentMonday, i));
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
            className: "overflow-x-auto",
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                className: "min-w-[900px]",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                        className: `grid [grid-template-columns:80px_repeat(7,1fr)] sticky top-0 z-10 backdrop-blur-md border-b ${isDark ? "bg-slate-900/90 border-slate-700/50" : "bg-white/90 border-slate-200/50"}`,
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                className: "p-4"
                            }, void 0, false, {
                                fileName: "[project]/Downloads/private-project/Preptime-private/web/pages/index.tsx",
                                lineNumber: 2810,
                                columnNumber: 25
                            }, this),
                            weekDates.map((date, i)=>{
                                const isToday = date.toDateString() === new Date().toDateString();
                                const isSelected = selectedDateIndex === i;
                                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$externals$5d2f$framer$2d$motion__$5b$external$5d$__$28$framer$2d$motion$2c$__esm_import$2c$__$5b$project$5d2f$Downloads$2f$private$2d$project$2f$Preptime$2d$private$2f$web$2f$node_modules$2f$framer$2d$motion$29$__["motion"].div, {
                                    whileHover: {
                                        scale: 1.02,
                                        y: -2
                                    },
                                    whileTap: {
                                        scale: 0.98
                                    },
                                    onClick: ()=>handleDateClick(i),
                                    className: `p-4 text-center border-l first:border-l-0 cursor-pointer transition-all duration-200 ${isSelected ? "bg-gradient-to-br from-indigo-600 to-purple-600 shadow-lg" : isDark ? "border-slate-700/50 hover:bg-slate-800/50" : "border-slate-200/50 hover:bg-slate-50"}`,
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                            className: `text-xs font-bold uppercase tracking-wider mb-2 ${isSelected ? "text-indigo-100" : isDark ? "text-slate-400" : "text-slate-500"}`,
                                            children: days[i]
                                        }, void 0, false, {
                                            fileName: "[project]/Downloads/private-project/Preptime-private/web/pages/index.tsx",
                                            lineNumber: 2829,
                                            columnNumber: 37
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                            className: `text-xl font-bold ${isToday && !isSelected ? "bg-gradient-to-br from-indigo-500 to-purple-500 text-white w-10 h-10 rounded-2xl flex items-center justify-center mx-auto shadow-lg shadow-indigo-500/30" : isSelected ? "text-white" : isDark ? "text-slate-200" : "text-slate-700"}`,
                                            children: date.getDate()
                                        }, void 0, false, {
                                            fileName: "[project]/Downloads/private-project/Preptime-private/web/pages/index.tsx",
                                            lineNumber: 2840,
                                            columnNumber: 37
                                        }, this)
                                    ]
                                }, i, true, {
                                    fileName: "[project]/Downloads/private-project/Preptime-private/web/pages/index.tsx",
                                    lineNumber: 2817,
                                    columnNumber: 33
                                }, this);
                            })
                        ]
                    }, void 0, true, {
                        fileName: "[project]/Downloads/private-project/Preptime-private/web/pages/index.tsx",
                        lineNumber: 2804,
                        columnNumber: 21
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                        className: "grid [grid-template-columns:80px_repeat(7,1fr)] relative",
                        children: [
                            Array.from({
                                length: endHour - startHour
                            }).map((_, row)=>{
                                const hour = startHour + row;
                                const isBusinessHours = hour >= 9 && hour <= 17;
                                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$externals$5d2f$react__$5b$external$5d$__$28$react$2c$__cjs$29$__["default"].Fragment, {
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                            className: `px-3 py-4 text-sm font-semibold text-right border-b flex items-center justify-end ${isDark ? "text-slate-400 bg-slate-800/30 border-slate-700/30" : "text-slate-600 bg-slate-50/50 border-slate-200/30"}`,
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                                className: `${isBusinessHours ? "text-indigo-600 dark:text-indigo-400" : ""}`,
                                                children: formatHour(hour)
                                            }, void 0, false, {
                                                fileName: "[project]/Downloads/private-project/Preptime-private/web/pages/index.tsx",
                                                lineNumber: 2871,
                                                columnNumber: 41
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/Downloads/private-project/Preptime-private/web/pages/index.tsx",
                                            lineNumber: 2865,
                                            columnNumber: 37
                                        }, this),
                                        weekDates.map((date, col)=>{
                                            const isToday = date.toDateString() === new Date().toDateString();
                                            const isSelected = selectedDateIndex === col;
                                            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$externals$5d2f$framer$2d$motion__$5b$external$5d$__$28$framer$2d$motion$2c$__esm_import$2c$__$5b$project$5d2f$Downloads$2f$private$2d$project$2f$Preptime$2d$private$2f$web$2f$node_modules$2f$framer$2d$motion$29$__["motion"].div, {
                                                whileHover: {
                                                    scale: 1.01
                                                },
                                                onClick: (e)=>{
                                                    e.stopPropagation();
                                                    selectDateEverywhere(date);
                                                },
                                                className: `h-14 border-l border-b transition-all duration-200 cursor-pointer relative group ${isSelected ? isDark ? "bg-indigo-950/40 border-indigo-800/30 hover:bg-indigo-900/50" : "bg-indigo-50/50 border-indigo-200/50 hover:bg-indigo-100/50" : isToday ? isDark ? "bg-blue-950/20 border-slate-700/30 hover:bg-indigo-950/30" : "bg-blue-50/30 border-slate-200/30 hover:bg-indigo-50/50" : isDark ? "border-slate-800/30 hover:bg-slate-800/30" : "border-slate-200/30 hover:bg-slate-50/50"} ${isBusinessHours ? "bg-opacity-80" : "bg-opacity-40"}`,
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("button", {
                                                    type: "button",
                                                    onClick: (e)=>handleSlotClick(col, hour, date, e),
                                                    className: "absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity z-30 pointer-events-auto",
                                                    "aria-label": "Add task",
                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                                        className: `w-7 h-7 rounded-lg shadow-lg flex items-center justify-center backdrop-blur-sm ${isDark ? "text-indigo-300 bg-slate-800/90 border border-indigo-700/50" : "text-indigo-600 bg-white/90 border border-indigo-200"}`,
                                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(PlusIcon, {
                                                            className: "w-4 h-4"
                                                        }, void 0, false, {
                                                            fileName: "[project]/Downloads/private-project/Preptime-private/web/pages/index.tsx",
                                                            lineNumber: 2920,
                                                            columnNumber: 57
                                                        }, this)
                                                    }, void 0, false, {
                                                        fileName: "[project]/Downloads/private-project/Preptime-private/web/pages/index.tsx",
                                                        lineNumber: 2914,
                                                        columnNumber: 53
                                                    }, this)
                                                }, void 0, false, {
                                                    fileName: "[project]/Downloads/private-project/Preptime-private/web/pages/index.tsx",
                                                    lineNumber: 2908,
                                                    columnNumber: 49
                                                }, this)
                                            }, `${col}-${hour}`, false, {
                                                fileName: "[project]/Downloads/private-project/Preptime-private/web/pages/index.tsx",
                                                lineNumber: 2887,
                                                columnNumber: 45
                                            }, this);
                                        })
                                    ]
                                }, `week-row-${hour}`, true, {
                                    fileName: "[project]/Downloads/private-project/Preptime-private/web/pages/index.tsx",
                                    lineNumber: 2864,
                                    columnNumber: 33
                                }, this);
                            }),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                className: "absolute top-0 left-[80px] right-0 bottom-0 grid grid-cols-7 z-0 pointer-events-none",
                                children: weekDates.map((date, col)=>{
                                    const dayTasks = tasks.filter((task)=>task.date === formatDateKey(date));
                                    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                        className: "relative pointer-events-none",
                                        children: dayTasks.map((task)=>renderTaskBlock(task, date))
                                    }, `tasks-${col}`, false, {
                                        fileName: "[project]/Downloads/private-project/Preptime-private/web/pages/index.tsx",
                                        lineNumber: 2937,
                                        columnNumber: 37
                                    }, this);
                                })
                            }, void 0, false, {
                                fileName: "[project]/Downloads/private-project/Preptime-private/web/pages/index.tsx",
                                lineNumber: 2930,
                                columnNumber: 25
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/Downloads/private-project/Preptime-private/web/pages/index.tsx",
                        lineNumber: 2858,
                        columnNumber: 21
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/Downloads/private-project/Preptime-private/web/pages/index.tsx",
                lineNumber: 2802,
                columnNumber: 17
            }, this)
        }, void 0, false, {
            fileName: "[project]/Downloads/private-project/Preptime-private/web/pages/index.tsx",
            lineNumber: 2801,
            columnNumber: 13
        }, this);
    };
    const renderMonthView = ()=>{
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const daysInMonth = getDaysInMonth(year, month);
        const firstDay = getFirstDayOfMonth(year, month);
        const today = new Date();
        const calendarDays = [];
        for(let i = 0; i < firstDay; i++){
            calendarDays.push(null);
        }
        for(let i = 1; i <= daysInMonth; i++){
            calendarDays.push(i);
        }
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
            className: `p-4 ${isDark ? "bg-slate-800" : "bg-white"}`,
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                className: "grid grid-cols-7 gap-2",
                children: [
                    days.map((day)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                            className: `text-center text-sm font-semibold py-2 ${isDark ? "text-slate-400" : "text-slate-600"}`,
                            children: day
                        }, day, false, {
                            fileName: "[project]/Downloads/private-project/Preptime-private/web/pages/index.tsx",
                            lineNumber: 2971,
                            columnNumber: 25
                        }, this)),
                    calendarDays.map((day, idx)=>{
                        const isToday = day === today.getDate() && month === today.getMonth() && year === today.getFullYear();
                        const date = day ? new Date(year, month, day) : null;
                        const dayTaskCount = date ? tasks.filter((t)=>t.date === formatDateKey(date)).length : 0;
                        const completedCount = date ? tasks.filter((t)=>t.date === formatDateKey(date) && t.completed).length : 0;
                        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("button", {
                            disabled: !day,
                            onClick: ()=>date && goToDayView(date),
                            className: `aspect-square flex flex-col items-center justify-center rounded-lg cursor-pointer transition-all ${day === null ? "opacity-0 cursor-default" : isToday ? "bg-indigo-600 text-white font-bold" : isDark ? "bg-slate-700 hover:bg-slate-600 text-slate-200" : "bg-slate-50 hover:bg-slate-100 text-slate-700"}`,
                            children: [
                                day,
                                dayTaskCount > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                    className: "flex gap-1 mt-1",
                                    children: Array.from({
                                        length: Math.min(dayTaskCount, 3)
                                    }).map((_, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                            className: `w-1 h-1 rounded-full ${i < completedCount ? isToday ? "bg-green-200" : "bg-green-400" : isToday ? "bg-white" : "bg-indigo-400"}`
                                        }, i, false, {
                                            fileName: "[project]/Downloads/private-project/Preptime-private/web/pages/index.tsx",
                                            lineNumber: 3013,
                                            columnNumber: 49
                                        }, this))
                                }, void 0, false, {
                                    fileName: "[project]/Downloads/private-project/Preptime-private/web/pages/index.tsx",
                                    lineNumber: 3010,
                                    columnNumber: 37
                                }, this)
                            ]
                        }, idx, true, {
                            fileName: "[project]/Downloads/private-project/Preptime-private/web/pages/index.tsx",
                            lineNumber: 2995,
                            columnNumber: 29
                        }, this);
                    })
                ]
            }, void 0, true, {
                fileName: "[project]/Downloads/private-project/Preptime-private/web/pages/index.tsx",
                lineNumber: 2969,
                columnNumber: 17
            }, this)
        }, void 0, false, {
            fileName: "[project]/Downloads/private-project/Preptime-private/web/pages/index.tsx",
            lineNumber: 2968,
            columnNumber: 13
        }, this);
    };
    const renderSeasonView = ()=>{
        const season = getSeason(currentDate);
        const year = currentDate.getFullYear();
        let seasonMonths = [];
        if (season === "Spring") seasonMonths = [
            2,
            3,
            4
        ];
        else if (season === "Summer") seasonMonths = [
            5,
            6,
            7
        ];
        else if (season === "Fall") seasonMonths = [
            8,
            9,
            10
        ];
        else seasonMonths = [
            11,
            0,
            1
        ];
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
            className: `p-4 ${isDark ? "bg-slate-800" : "bg-white"}`,
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                className: "grid grid-cols-1 md:grid-cols-3 gap-4",
                children: seasonMonths.map((monthIdx)=>{
                    const daysInMonth = getDaysInMonth(year + (monthIdx === 11 ? -1 : monthIdx === 0 || monthIdx === 1 ? 1 : 0), monthIdx);
                    const firstDay = getFirstDayOfMonth(year, monthIdx);
                    const cells = [];
                    for(let i = 0; i < firstDay; i++)cells.push(null);
                    for(let d = 1; d <= daysInMonth; d++)cells.push(d);
                    while(cells.length < 35)cells.push(null);
                    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                        className: `rounded-lg p-4 ${isDark ? "bg-slate-700" : "bg-slate-50"}`,
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("h3", {
                                className: `text-lg font-bold mb-3 ${isDark ? "text-slate-200" : "text-slate-700"}`,
                                children: months[monthIdx]
                            }, void 0, false, {
                                fileName: "[project]/Downloads/private-project/Preptime-private/web/pages/index.tsx",
                                lineNumber: 3072,
                                columnNumber: 33
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                className: "grid grid-cols-7 gap-1",
                                children: [
                                    [
                                        "M",
                                        "T",
                                        "W",
                                        "T",
                                        "F",
                                        "S",
                                        "S"
                                    ].map((d)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                            className: `text-xs text-center ${isDark ? "text-slate-400" : "text-slate-500"}`,
                                            children: d
                                        }, d, false, {
                                            fileName: "[project]/Downloads/private-project/Preptime-private/web/pages/index.tsx",
                                            lineNumber: 3080,
                                            columnNumber: 41
                                        }, this)),
                                    cells.map((day, idx)=>{
                                        const date = day ? new Date(year, monthIdx, day) : null;
                                        const isToday = !!date && date.toDateString() === new Date().toDateString();
                                        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("button", {
                                            disabled: !day,
                                            onClick: ()=>date && goToDayView(date),
                                            className: `aspect-square text-xs flex items-center justify-center rounded cursor-pointer transition-colors ${day === null ? "opacity-0 cursor-default" : isToday ? "bg-indigo-600 text-white font-bold" : isDark ? "text-slate-200 hover:bg-slate-600" : "text-slate-700 hover:bg-slate-100"}`,
                                            children: day ?? ""
                                        }, idx, false, {
                                            fileName: "[project]/Downloads/private-project/Preptime-private/web/pages/index.tsx",
                                            lineNumber: 3094,
                                            columnNumber: 45
                                        }, this);
                                    })
                                ]
                            }, void 0, true, {
                                fileName: "[project]/Downloads/private-project/Preptime-private/web/pages/index.tsx",
                                lineNumber: 3078,
                                columnNumber: 33
                            }, this)
                        ]
                    }, monthIdx, true, {
                        fileName: "[project]/Downloads/private-project/Preptime-private/web/pages/index.tsx",
                        lineNumber: 3067,
                        columnNumber: 29
                    }, this);
                })
            }, void 0, false, {
                fileName: "[project]/Downloads/private-project/Preptime-private/web/pages/index.tsx",
                lineNumber: 3048,
                columnNumber: 17
            }, this)
        }, void 0, false, {
            fileName: "[project]/Downloads/private-project/Preptime-private/web/pages/index.tsx",
            lineNumber: 3047,
            columnNumber: 13
        }, this);
    };
    const renderYearView = ()=>{
        const year = currentDate.getFullYear();
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
            className: `p-4 ${isDark ? "bg-slate-800" : "bg-white"}`,
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                className: "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4",
                children: months.map((month, idx)=>{
                    const daysInMonth = getDaysInMonth(year, idx);
                    const firstDay = getFirstDayOfMonth(year, idx);
                    const cells = [];
                    for(let i = 0; i < firstDay; i++)cells.push(null);
                    for(let d = 1; d <= daysInMonth; d++)cells.push(d);
                    while(cells.length < 35)cells.push(null);
                    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                        className: `rounded-lg p-3 ${isDark ? "bg-slate-700" : "bg-slate-50"}`,
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("h3", {
                                className: `text-sm font-bold mb-2 ${isDark ? "text-slate-200" : "text-slate-700"}`,
                                children: month
                            }, void 0, false, {
                                fileName: "[project]/Downloads/private-project/Preptime-private/web/pages/index.tsx",
                                lineNumber: 3140,
                                columnNumber: 33
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                className: "grid grid-cols-7 gap-1",
                                children: [
                                    [
                                        "M",
                                        "T",
                                        "W",
                                        "T",
                                        "F",
                                        "S",
                                        "S"
                                    ].map((d)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                            className: `text-[10px] text-center ${isDark ? "text-slate-400" : "text-slate-500"}`,
                                            children: d
                                        }, d, false, {
                                            fileName: "[project]/Downloads/private-project/Preptime-private/web/pages/index.tsx",
                                            lineNumber: 3148,
                                            columnNumber: 41
                                        }, this)),
                                    cells.map((day, i)=>{
                                        const date = day ? new Date(year, idx, day) : null;
                                        const isToday = !!date && date.toDateString() === new Date().toDateString();
                                        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("button", {
                                            disabled: !day,
                                            onClick: ()=>date && goToDayView(date),
                                            className: `aspect-square text-[10px] flex items-center justify-center rounded cursor-pointer transition-colors ${day === null ? "opacity-0 cursor-default" : isToday ? "bg-indigo-600 text-white font-bold" : isDark ? "text-slate-200 hover:bg-slate-600" : "text-slate-700 hover:bg-slate-100"}`,
                                            children: day ?? ""
                                        }, i, false, {
                                            fileName: "[project]/Downloads/private-project/Preptime-private/web/pages/index.tsx",
                                            lineNumber: 3162,
                                            columnNumber: 45
                                        }, this);
                                    })
                                ]
                            }, void 0, true, {
                                fileName: "[project]/Downloads/private-project/Preptime-private/web/pages/index.tsx",
                                lineNumber: 3146,
                                columnNumber: 33
                            }, this)
                        ]
                    }, month, true, {
                        fileName: "[project]/Downloads/private-project/Preptime-private/web/pages/index.tsx",
                        lineNumber: 3135,
                        columnNumber: 29
                    }, this);
                })
            }, void 0, false, {
                fileName: "[project]/Downloads/private-project/Preptime-private/web/pages/index.tsx",
                lineNumber: 3125,
                columnNumber: 17
            }, this)
        }, void 0, false, {
            fileName: "[project]/Downloads/private-project/Preptime-private/web/pages/index.tsx",
            lineNumber: 3124,
            columnNumber: 13
        }, this);
    };
    const getUniqueLabels = ()=>{
        const labelMap = new Map();
        tasks.forEach((task)=>{
            if (task.label && !labelMap.has(task.label)) {
                labelMap.set(task.label, task.color);
            }
        });
        return Array.from(labelMap.entries()).map(([label, color])=>({
                label,
                color
            }));
    };
    const stats = getTaskStats();
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("main", {
        className: `min-h-screen transition-all duration-700 ${isDark ? "bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950" : "bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50"}`,
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                className: "flex min-h-screen gap-4 p-4",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(Sidebar, {
                        blocks: blocks,
                        activeId: activeId,
                        selectedDate: selectedDate,
                        onSelectDate: selectDateEverywhere,
                        onSelectBlock: (id)=>setActiveId(id),
                        onPickStyle: pickStyle,
                        onSetCustomMinutes: onSetCustomMinutes,
                        onDeleteBlock: deleteSlot,
                        onUpdateBlock: updateBlock,
                        manualOrderByDate: manualOrderByDate,
                        onSetManualOrderForDate: (dateISO, idsInOrder)=>setManualOrderByDate((prev)=>({
                                    ...prev,
                                    [dateISO]: idsInOrder
                                })),
                        isDark: isDark
                    }, void 0, false, {
                        fileName: "[project]/Downloads/private-project/Preptime-private/web/pages/index.tsx",
                        lineNumber: 3212,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                        className: "flex-1 flex flex-col min-h-screen",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                            className: `rounded-2xl shadow-2xl backdrop-blur-sm border flex flex-col ${isDark ? "bg-slate-900/80 border-slate-700/50" : "bg-white/80 border-white/50"}`,
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                    className: `px-6 py-5 flex items-center justify-between border-b ${isDark ? "bg-slate-800 border-slate-700" : "bg-white border-slate-200"}`,
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                            className: "flex items-center gap-3",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                                    className: `w-10 h-10 rounded-xl flex items-center justify-center ${isDark ? "bg-indigo-600/20" : "bg-indigo-100"}`,
                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(SparklesIcon, {
                                                        className: `w-6 h-6 ${isDark ? "text-indigo-400" : "text-indigo-600"}`
                                                    }, void 0, false, {
                                                        fileName: "[project]/Downloads/private-project/Preptime-private/web/pages/index.tsx",
                                                        lineNumber: 3248,
                                                        columnNumber: 37
                                                    }, this)
                                                }, void 0, false, {
                                                    fileName: "[project]/Downloads/private-project/Preptime-private/web/pages/index.tsx",
                                                    lineNumber: 3244,
                                                    columnNumber: 33
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("h2", {
                                                            className: `text-2xl font-bold tracking-tight ${isDark ? "text-white" : "text-slate-900"}`,
                                                            children: "PrepTime"
                                                        }, void 0, false, {
                                                            fileName: "[project]/Downloads/private-project/Preptime-private/web/pages/index.tsx",
                                                            lineNumber: 3254,
                                                            columnNumber: 37
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("p", {
                                                            className: `text-xs mt-0.5 font-medium ${isDark ? "text-slate-400" : "text-slate-600"}`,
                                                            children: "AI-Powered Smart Scheduler"
                                                        }, void 0, false, {
                                                            fileName: "[project]/Downloads/private-project/Preptime-private/web/pages/index.tsx",
                                                            lineNumber: 3260,
                                                            columnNumber: 37
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/Downloads/private-project/Preptime-private/web/pages/index.tsx",
                                                    lineNumber: 3253,
                                                    columnNumber: 33
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/Downloads/private-project/Preptime-private/web/pages/index.tsx",
                                            lineNumber: 3243,
                                            columnNumber: 29
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("button", {
                                            onClick: ()=>setShowSettings(true),
                                            className: `p-2.5 rounded-xl transition-all duration-200 ${isDark ? "hover:bg-slate-700 text-slate-300" : "hover:bg-slate-100 text-slate-600"}`,
                                            title: "Settings",
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("svg", {
                                                className: "w-6 h-6",
                                                fill: "none",
                                                stroke: "currentColor",
                                                viewBox: "0 0 24 24",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("path", {
                                                        strokeLinecap: "round",
                                                        strokeLinejoin: "round",
                                                        strokeWidth: 2,
                                                        d: "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                                                    }, void 0, false, {
                                                        fileName: "[project]/Downloads/private-project/Preptime-private/web/pages/index.tsx",
                                                        lineNumber: 3282,
                                                        columnNumber: 37
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("path", {
                                                        strokeLinecap: "round",
                                                        strokeLinejoin: "round",
                                                        strokeWidth: 2,
                                                        d: "M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                                    }, void 0, false, {
                                                        fileName: "[project]/Downloads/private-project/Preptime-private/web/pages/index.tsx",
                                                        lineNumber: 3288,
                                                        columnNumber: 37
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/Downloads/private-project/Preptime-private/web/pages/index.tsx",
                                                lineNumber: 3276,
                                                columnNumber: 33
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/Downloads/private-project/Preptime-private/web/pages/index.tsx",
                                            lineNumber: 3268,
                                            columnNumber: 29
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/Downloads/private-project/Preptime-private/web/pages/index.tsx",
                                    lineNumber: 3237,
                                    columnNumber: 25
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                    className: `px-6 py-4 border-b ${isDark ? "bg-slate-700 border-slate-600" : "bg-slate-50 border-slate-200"}`,
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                            className: "flex items-center gap-3 mb-3 overflow-x-auto",
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                                className: "flex gap-1",
                                                children: views.map((view)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("button", {
                                                        onClick: ()=>handleViewChange(view.value),
                                                        className: `px-3 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${viewType === view.value ? "bg-indigo-600 text-white" : isDark ? "bg-slate-800 text-slate-300 hover:bg-slate-600" : "bg-white text-slate-700 hover:bg-slate-100"}`,
                                                        children: view.label
                                                    }, view.value, false, {
                                                        fileName: "[project]/Downloads/private-project/Preptime-private/web/pages/index.tsx",
                                                        lineNumber: 3307,
                                                        columnNumber: 41
                                                    }, this))
                                            }, void 0, false, {
                                                fileName: "[project]/Downloads/private-project/Preptime-private/web/pages/index.tsx",
                                                lineNumber: 3305,
                                                columnNumber: 33
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/Downloads/private-project/Preptime-private/web/pages/index.tsx",
                                            lineNumber: 3304,
                                            columnNumber: 29
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                            className: "flex items-center gap-3 mb-4",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$externals$5d2f$framer$2d$motion__$5b$external$5d$__$28$framer$2d$motion$2c$__esm_import$2c$__$5b$project$5d2f$Downloads$2f$private$2d$project$2f$Preptime$2d$private$2f$web$2f$node_modules$2f$framer$2d$motion$29$__["motion"].button, {
                                                    type: "button",
                                                    whileHover: {
                                                        scale: 1.05,
                                                        x: -2
                                                    },
                                                    whileTap: {
                                                        scale: 0.95
                                                    },
                                                    onClick: goToPrev,
                                                    className: `px-5 py-2.5 border rounded-xl transition-all duration-200 font-semibold text-sm shadow-sm flex items-center gap-2 ${isDark ? "bg-slate-800/50 border-slate-600/50 text-white hover:bg-slate-700/50 hover:border-indigo-500/50 backdrop-blur-sm" : "bg-white/50 border-slate-300/50 hover:bg-slate-50 hover:border-indigo-400 backdrop-blur-sm"}`,
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(ChevronLeftIcon, {
                                                            className: "w-4 h-4"
                                                        }, void 0, false, {
                                                            fileName: "[project]/Downloads/private-project/Preptime-private/web/pages/index.tsx",
                                                            lineNumber: 3334,
                                                            columnNumber: 37
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("span", {
                                                            children: "Prev"
                                                        }, void 0, false, {
                                                            fileName: "[project]/Downloads/private-project/Preptime-private/web/pages/index.tsx",
                                                            lineNumber: 3335,
                                                            columnNumber: 37
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/Downloads/private-project/Preptime-private/web/pages/index.tsx",
                                                    lineNumber: 3324,
                                                    columnNumber: 33
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                                    className: `flex-1 text-center px-5 py-2.5 border rounded-xl font-bold backdrop-blur-sm ${isDark ? "bg-slate-800/50 border-slate-600/50 text-slate-100" : "bg-white/50 border-slate-300/50 text-slate-700"}`,
                                                    children: getViewTitle()
                                                }, void 0, false, {
                                                    fileName: "[project]/Downloads/private-project/Preptime-private/web/pages/index.tsx",
                                                    lineNumber: 3337,
                                                    columnNumber: 33
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$externals$5d2f$framer$2d$motion__$5b$external$5d$__$28$framer$2d$motion$2c$__esm_import$2c$__$5b$project$5d2f$Downloads$2f$private$2d$project$2f$Preptime$2d$private$2f$web$2f$node_modules$2f$framer$2d$motion$29$__["motion"].button, {
                                                    type: "button",
                                                    whileHover: {
                                                        scale: 1.05,
                                                        x: 2
                                                    },
                                                    whileTap: {
                                                        scale: 0.95
                                                    },
                                                    onClick: goToNext,
                                                    className: `px-5 py-2.5 border rounded-xl transition-all duration-200 font-semibold text-sm shadow-sm flex items-center gap-2 ${isDark ? "bg-slate-800/50 border-slate-600/50 text-white hover:bg-slate-700/50 hover:border-indigo-500/50 backdrop-blur-sm" : "bg-white/50 border-slate-300/50 hover:bg-slate-50 hover:border-indigo-400 backdrop-blur-sm"}`,
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("span", {
                                                            children: "Next"
                                                        }, void 0, false, {
                                                            fileName: "[project]/Downloads/private-project/Preptime-private/web/pages/index.tsx",
                                                            lineNumber: 3355,
                                                            columnNumber: 37
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(ChevronRightIcon, {
                                                            className: "w-4 h-4"
                                                        }, void 0, false, {
                                                            fileName: "[project]/Downloads/private-project/Preptime-private/web/pages/index.tsx",
                                                            lineNumber: 3356,
                                                            columnNumber: 37
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/Downloads/private-project/Preptime-private/web/pages/index.tsx",
                                                    lineNumber: 3345,
                                                    columnNumber: 33
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/Downloads/private-project/Preptime-private/web/pages/index.tsx",
                                            lineNumber: 3323,
                                            columnNumber: 29
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                            className: "mt-3 flex gap-3",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$private$2d$project$2f$Preptime$2d$private$2f$web$2f$components$2f$MonthGeneratorButton$2e$tsx__$5b$ssr$5d$__$28$ecmascript$29$__["default"], {
                                                    week1Blocks: blocks.filter((b)=>{
                                                        const blockDate = new Date(b.dateISO);
                                                        const weekStart = getMonday(currentDate);
                                                        const weekEnd = addDays(weekStart, 7);
                                                        return blockDate >= weekStart && blockDate < weekEnd;
                                                    }).map((b)=>{
                                                        // Create date in local timezone and format as ISO string with timezone
                                                        const startDate = new Date(b.dateISO + "T" + b.start);
                                                        const endDate = new Date(b.dateISO + "T" + b.end);
                                                        // Format as ISO string but keep local time (don't convert to UTC)
                                                        const formatLocalISO = (date)=>{
                                                            const year = date.getFullYear();
                                                            const month = String(date.getMonth() + 1).padStart(2, "0");
                                                            const day = String(date.getDate()).padStart(2, "0");
                                                            const hours = String(date.getHours()).padStart(2, "0");
                                                            const minutes = String(date.getMinutes()).padStart(2, "0");
                                                            const seconds = String(date.getSeconds()).padStart(2, "0");
                                                            // Get timezone offset
                                                            const offset = -date.getTimezoneOffset();
                                                            const offsetHours = String(Math.floor(Math.abs(offset) / 60)).padStart(2, "0");
                                                            const offsetMinutes = String(Math.abs(offset) % 60).padStart(2, "0");
                                                            const offsetSign = offset >= 0 ? "+" : "-";
                                                            return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}${offsetSign}${offsetHours}:${offsetMinutes}`;
                                                        };
                                                        return {
                                                            id: b.id,
                                                            taskId: b.id,
                                                            start: formatLocalISO(startDate),
                                                            end: formatLocalISO(endDate)
                                                        };
                                                    }),
                                                    week1Tasks: blocks.filter((b)=>{
                                                        const blockDate = new Date(b.dateISO);
                                                        const weekStart = getMonday(currentDate);
                                                        const weekEnd = addDays(weekStart, 7);
                                                        return blockDate >= weekStart && blockDate < weekEnd;
                                                    }).map((b)=>{
                                                        // Create a consistent color based on task name
                                                        const getColorForTask = (name)=>{
                                                            // Hash the name to get a consistent color
                                                            let hash = 0;
                                                            for(let i = 0; i < name.length; i++){
                                                                hash = name.charCodeAt(i) + ((hash << 5) - hash);
                                                            }
                                                            const colors = [
                                                                "#FF6B6B",
                                                                "#4ECDC4",
                                                                "#95E1D3",
                                                                "#F38181",
                                                                "#AA96DA",
                                                                "#FCBAD3",
                                                                "#FFFFD2",
                                                                "#A8D8EA",
                                                                "#FFB6B9",
                                                                "#FEC8D8",
                                                                "#957DAD",
                                                                "#D291BC"
                                                            ];
                                                            return colors[Math.abs(hash) % colors.length];
                                                        };
                                                        // Find matching task in tasks array to get its color
                                                        const matchingTask = tasks.find((t)=>t.title === b.name && t.date === b.dateISO);
                                                        return {
                                                            id: b.id,
                                                            title: b.name,
                                                            durationMin: Math.round((new Date(b.dateISO + "T" + b.end).getTime() - new Date(b.dateISO + "T" + b.start).getTime()) / 60000),
                                                            type: b.label === "study" || b.label === "deep" || b.label === "admin" || b.label === "relax" ? b.label : b.style === "Deep Focus" ? "deep" : b.style === "Pomodoro" ? "study" : "relax",
                                                            energy: b.style === "Deep Focus" || b.style === "Pomodoro" ? "high" : "med",
                                                            splittable: false,
                                                            priority: 3,
                                                            mode: b.style === "Deep Focus" ? "lockin" : b.style === "Pomodoro" ? "study" : "balanced",
                                                            label: b.label || b.name,
                                                            color: matchingTask?.color || getColorForTask(b.name)
                                                        };
                                                    }),
                                                    existingEvents: [],
                                                    preferences: {
                                                        dayStartHour: 7,
                                                        dayEndHour: 23,
                                                        slotStepMin: 15,
                                                        bufferMin: 5,
                                                        maxHeavyPerDay: 3
                                                    },
                                                    onMonthGenerated: (result)=>{
                                                        console.log("onMonthGenerated called with result:", result);
                                                        // Convert generated blocks back to TimeBlock format and add them
                                                        const newBlocks = result.scheduledBlocks.map((sb, index)=>{
                                                            // Parse ISO strings and extract local time directly (don't convert timezone)
                                                            // sb.start format: "2025-12-30T07:00:00-05:00"
                                                            const startISO = sb.start;
                                                            const endISO = sb.end;
                                                            // Extract date and time parts from ISO string
                                                            const startMatch = startISO.match(/^(\d{4}-\d{2}-\d{2})T(\d{2}):(\d{2})/);
                                                            const endMatch = endISO.match(/^(\d{4}-\d{2}-\d{2})T(\d{2}):(\d{2})/);
                                                            if (!startMatch || !endMatch) {
                                                                console.error("Failed to parse ISO times:", startISO, endISO);
                                                                return null;
                                                            }
                                                            const dateISO = startMatch[1];
                                                            const startTime = `${startMatch[2]}:${startMatch[3]}`;
                                                            const endTime = `${endMatch[2]}:${endMatch[3]}`;
                                                            const task = result.generatedTasks.find((t)=>t.id === sb.taskId);
                                                            // Generate truly unique ID to avoid collisions
                                                            const uniqueId = `ai_${Date.now()}_${index}_${Math.random().toString(36).slice(2, 9)}`;
                                                            return {
                                                                id: uniqueId,
                                                                name: task?.title || "Generated Task",
                                                                dateISO: dateISO,
                                                                start: startTime,
                                                                end: endTime,
                                                                style: task?.type === "deep" ? "Deep Focus" : task?.type === "study" ? "Pomodoro" : undefined,
                                                                focusMin: task?.type === "deep" ? 52 : task?.type === "study" ? 25 : undefined,
                                                                breakMin: task?.type === "deep" ? 17 : task?.type === "study" ? 5 : undefined,
                                                                label: task?.label || task?.type,
                                                                description: `AI-generated task (${result.appliedTechniques?.length || 0} techniques applied)`
                                                            };
                                                        });
                                                        console.log("Created newBlocks:", newBlocks);
                                                        // Also create Task objects for the calendar
                                                        const newTasks = result.scheduledBlocks.map((sb, index)=>{
                                                            // Parse ISO strings directly to avoid timezone conversion
                                                            const startMatch = sb.start.match(/^(\d{4}-\d{2}-\d{2})T(\d{2}):(\d{2})/);
                                                            if (!startMatch) return null;
                                                            const dateStr = startMatch[1];
                                                            const startHour = parseInt(startMatch[2]);
                                                            const startMin = parseInt(startMatch[3]);
                                                            const endMatch = sb.end.match(/T(\d{2}):(\d{2})/);
                                                            const endHour = endMatch ? parseInt(endMatch[1]) : startHour + 1;
                                                            const endMin = endMatch ? parseInt(endMatch[2]) : 0;
                                                            const task = result.generatedTasks.find((t)=>t.id === sb.taskId);
                                                            // Generate truly unique ID to avoid collisions
                                                            const uniqueId = `ai_task_${Date.now()}_${index}_${Math.random().toString(36).slice(2, 9)}`;
                                                            // Debug: Log task color
                                                            if (index === 0) {
                                                                console.log("First AI task:", task);
                                                                console.log("Task color:", task?.color);
                                                                console.log("Task label:", task?.label);
                                                                console.log("Task title:", task?.title);
                                                            }
                                                            // Use color from AI if available
                                                            let color = task?.color;
                                                            // If no color from AI, generate one based on task name
                                                            if (!color || color === "" || color === null || color === undefined) {
                                                                // Remove week number from title to get base name
                                                                const baseName = task?.title?.replace(/\s*\(W\d+\)/, "") || "Task";
                                                                // Hash the base name to get a consistent color
                                                                let hash = 0;
                                                                for(let i = 0; i < baseName.length; i++){
                                                                    hash = baseName.charCodeAt(i) + ((hash << 5) - hash);
                                                                }
                                                                const colors = [
                                                                    "#FF6B6B",
                                                                    "#4ECDC4",
                                                                    "#95E1D3",
                                                                    "#F38181",
                                                                    "#AA96DA",
                                                                    "#FCBAD3",
                                                                    "#FFFFD2",
                                                                    "#A8D8EA",
                                                                    "#FFB6B9",
                                                                    "#FEC8D8",
                                                                    "#957DAD",
                                                                    "#D291BC"
                                                                ];
                                                                color = colors[Math.abs(hash) % colors.length];
                                                                console.log(`Generated color for ${baseName}: ${color}`);
                                                            } else {
                                                                console.log(`Using AI color for ${task?.title}: ${color}`);
                                                            }
                                                            // Use label from AI if available, otherwise use type
                                                            const label = task?.label || task?.type || "AI Generated";
                                                            // Parse date for day of week
                                                            const dateObj = new Date(dateStr);
                                                            return {
                                                                id: uniqueId,
                                                                title: task?.title || "Generated Task",
                                                                description: `AI-generated: ${task?.type || "task"}`,
                                                                label: label,
                                                                day: dateObj.getDay(),
                                                                date: dateStr,
                                                                startHour: startHour + startMin / 60,
                                                                endHour: endHour + endMin / 60,
                                                                color: color,
                                                                completed: false
                                                            };
                                                        }).filter((t)=>t !== null);
                                                        console.log("Created newTasks:", newTasks);
                                                        console.log("Sample task:", newTasks[0]);
                                                        const updatedTasks = [
                                                            ...tasks,
                                                            ...newTasks
                                                        ];
                                                        const updatedBlocks = [
                                                            ...blocks,
                                                            ...newBlocks
                                                        ];
                                                        console.log("Total tasks after generation:", updatedTasks.length);
                                                        console.log("Total blocks after generation:", updatedBlocks.length);
                                                        setBlocks(updatedBlocks.filter((b)=>b !== null));
                                                        setTasks(updatedTasks);
                                                        // Save to localStorage
                                                        localStorage.setItem("preptime-tasks", JSON.stringify(updatedTasks));
                                                        localStorage.setItem("preptime-blocks", JSON.stringify(updatedBlocks));
                                                        console.log("Saved to localStorage");
                                                    }
                                                }, void 0, false, {
                                                    fileName: "[project]/Downloads/private-project/Preptime-private/web/pages/index.tsx",
                                                    lineNumber: 3362,
                                                    columnNumber: 33
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$externals$5d2f$framer$2d$motion__$5b$external$5d$__$28$framer$2d$motion$2c$__esm_import$2c$__$5b$project$5d2f$Downloads$2f$private$2d$project$2f$Preptime$2d$private$2f$web$2f$node_modules$2f$framer$2d$motion$29$__["motion"].button, {
                                                    type: "button",
                                                    whileHover: {
                                                        scale: 1.05
                                                    },
                                                    whileTap: {
                                                        scale: 0.95
                                                    },
                                                    onClick: ()=>{
                                                        // Get Monday of current week
                                                        const weekStart = getMonday(currentDate);
                                                        // Create demo tasks for the entire week (7 AM - 11 PM)
                                                        const demoTasks = [
                                                            // Monday
                                                            {
                                                                name: "Morning Workout",
                                                                day: 0,
                                                                start: "07:00",
                                                                end: "08:00",
                                                                label: "fitness",
                                                                color: "bg-cyan-500"
                                                            },
                                                            {
                                                                name: "Breakfast",
                                                                day: 0,
                                                                start: "08:00",
                                                                end: "08:30",
                                                                label: "break",
                                                                color: "bg-green-400"
                                                            },
                                                            {
                                                                name: "Deep Work - Coding",
                                                                day: 0,
                                                                start: "09:00",
                                                                end: "12:00",
                                                                label: "work",
                                                                color: "bg-red-500"
                                                            },
                                                            {
                                                                name: "Lunch Break",
                                                                day: 0,
                                                                start: "12:00",
                                                                end: "13:00",
                                                                label: "break",
                                                                color: "bg-green-400"
                                                            },
                                                            {
                                                                name: "Meetings",
                                                                day: 0,
                                                                start: "14:00",
                                                                end: "16:00",
                                                                label: "admin",
                                                                color: "bg-orange-500"
                                                            },
                                                            {
                                                                name: "Email & Admin",
                                                                day: 0,
                                                                start: "16:00",
                                                                end: "17:00",
                                                                label: "admin",
                                                                color: "bg-orange-500"
                                                            },
                                                            {
                                                                name: "Dinner",
                                                                day: 0,
                                                                start: "18:00",
                                                                end: "19:00",
                                                                label: "break",
                                                                color: "bg-green-400"
                                                            },
                                                            {
                                                                name: "Evening Reading",
                                                                day: 0,
                                                                start: "20:00",
                                                                end: "21:30",
                                                                label: "relax",
                                                                color: "bg-pink-400"
                                                            },
                                                            {
                                                                name: "Wind Down",
                                                                day: 0,
                                                                start: "21:30",
                                                                end: "23:00",
                                                                label: "relax",
                                                                color: "bg-pink-400"
                                                            },
                                                            // Tuesday
                                                            {
                                                                name: "Morning Workout",
                                                                day: 1,
                                                                start: "07:00",
                                                                end: "08:00",
                                                                label: "fitness",
                                                                color: "bg-cyan-500"
                                                            },
                                                            {
                                                                name: "Breakfast",
                                                                day: 1,
                                                                start: "08:00",
                                                                end: "08:30",
                                                                label: "break",
                                                                color: "bg-green-400"
                                                            },
                                                            {
                                                                name: "Study Session",
                                                                day: 1,
                                                                start: "09:00",
                                                                end: "11:00",
                                                                label: "study",
                                                                color: "bg-purple-500"
                                                            },
                                                            {
                                                                name: "Project Work",
                                                                day: 1,
                                                                start: "11:00",
                                                                end: "13:00",
                                                                label: "work",
                                                                color: "bg-red-500"
                                                            },
                                                            {
                                                                name: "Lunch",
                                                                day: 1,
                                                                start: "13:00",
                                                                end: "14:00",
                                                                label: "break",
                                                                color: "bg-green-400"
                                                            },
                                                            {
                                                                name: "Client Calls",
                                                                day: 1,
                                                                start: "15:00",
                                                                end: "17:00",
                                                                label: "admin",
                                                                color: "bg-orange-500"
                                                            },
                                                            {
                                                                name: "Creative Work",
                                                                day: 1,
                                                                start: "17:00",
                                                                end: "18:30",
                                                                label: "work",
                                                                color: "bg-red-500"
                                                            },
                                                            {
                                                                name: "Dinner",
                                                                day: 1,
                                                                start: "18:30",
                                                                end: "19:30",
                                                                label: "break",
                                                                color: "bg-green-400"
                                                            },
                                                            {
                                                                name: "Hobby Time",
                                                                day: 1,
                                                                start: "20:00",
                                                                end: "22:00",
                                                                label: "hobby",
                                                                color: "bg-blue-400"
                                                            },
                                                            {
                                                                name: "Relax",
                                                                day: 1,
                                                                start: "22:00",
                                                                end: "23:00",
                                                                label: "relax",
                                                                color: "bg-pink-400"
                                                            },
                                                            // Wednesday
                                                            {
                                                                name: "Gym",
                                                                day: 2,
                                                                start: "07:00",
                                                                end: "08:30",
                                                                label: "fitness",
                                                                color: "bg-cyan-500"
                                                            },
                                                            {
                                                                name: "Breakfast",
                                                                day: 2,
                                                                start: "08:30",
                                                                end: "09:00",
                                                                label: "break",
                                                                color: "bg-green-400"
                                                            },
                                                            {
                                                                name: "Deep Focus",
                                                                day: 2,
                                                                start: "09:00",
                                                                end: "12:00",
                                                                label: "deep",
                                                                color: "bg-fuchsia-500"
                                                            },
                                                            {
                                                                name: "Lunch",
                                                                day: 2,
                                                                start: "12:00",
                                                                end: "13:00",
                                                                label: "break",
                                                                color: "bg-green-400"
                                                            },
                                                            {
                                                                name: "Team Sync",
                                                                day: 2,
                                                                start: "14:00",
                                                                end: "15:00",
                                                                label: "admin",
                                                                color: "bg-orange-500"
                                                            },
                                                            {
                                                                name: "Creative Work",
                                                                day: 2,
                                                                start: "15:00",
                                                                end: "17:00",
                                                                label: "work",
                                                                color: "bg-red-500"
                                                            },
                                                            {
                                                                name: "Planning",
                                                                day: 2,
                                                                start: "17:00",
                                                                end: "18:00",
                                                                label: "admin",
                                                                color: "bg-orange-500"
                                                            },
                                                            {
                                                                name: "Dinner",
                                                                day: 2,
                                                                start: "18:00",
                                                                end: "19:00",
                                                                label: "break",
                                                                color: "bg-green-400"
                                                            },
                                                            {
                                                                name: "Learning",
                                                                day: 2,
                                                                start: "19:30",
                                                                end: "21:00",
                                                                label: "study",
                                                                color: "bg-purple-500"
                                                            },
                                                            {
                                                                name: "TV Time",
                                                                day: 2,
                                                                start: "21:00",
                                                                end: "23:00",
                                                                label: "relax",
                                                                color: "bg-pink-400"
                                                            },
                                                            // Thursday
                                                            {
                                                                name: "Morning Run",
                                                                day: 3,
                                                                start: "07:00",
                                                                end: "08:00",
                                                                label: "fitness",
                                                                color: "bg-cyan-500"
                                                            },
                                                            {
                                                                name: "Breakfast",
                                                                day: 3,
                                                                start: "08:00",
                                                                end: "08:30",
                                                                label: "break",
                                                                color: "bg-green-400"
                                                            },
                                                            {
                                                                name: "Learning Time",
                                                                day: 3,
                                                                start: "09:00",
                                                                end: "11:00",
                                                                label: "study",
                                                                color: "bg-purple-500"
                                                            },
                                                            {
                                                                name: "Development",
                                                                day: 3,
                                                                start: "11:00",
                                                                end: "13:00",
                                                                label: "work",
                                                                color: "bg-red-500"
                                                            },
                                                            {
                                                                name: "Lunch Break",
                                                                day: 3,
                                                                start: "13:00",
                                                                end: "14:00",
                                                                label: "break",
                                                                color: "bg-green-400"
                                                            },
                                                            {
                                                                name: "Planning",
                                                                day: 3,
                                                                start: "14:00",
                                                                end: "16:00",
                                                                label: "admin",
                                                                color: "bg-orange-500"
                                                            },
                                                            {
                                                                name: "Code Review",
                                                                day: 3,
                                                                start: "16:00",
                                                                end: "17:30",
                                                                label: "work",
                                                                color: "bg-red-500"
                                                            },
                                                            {
                                                                name: "Dinner",
                                                                day: 3,
                                                                start: "18:00",
                                                                end: "19:00",
                                                                label: "break",
                                                                color: "bg-green-400"
                                                            },
                                                            {
                                                                name: "Side Project",
                                                                day: 3,
                                                                start: "19:30",
                                                                end: "21:30",
                                                                label: "hobby",
                                                                color: "bg-blue-400"
                                                            },
                                                            {
                                                                name: "Chill Time",
                                                                day: 3,
                                                                start: "21:30",
                                                                end: "23:00",
                                                                label: "relax",
                                                                color: "bg-pink-400"
                                                            },
                                                            // Friday
                                                            {
                                                                name: "Workout",
                                                                day: 4,
                                                                start: "07:00",
                                                                end: "08:00",
                                                                label: "fitness",
                                                                color: "bg-cyan-500"
                                                            },
                                                            {
                                                                name: "Breakfast",
                                                                day: 4,
                                                                start: "08:00",
                                                                end: "08:30",
                                                                label: "break",
                                                                color: "bg-green-400"
                                                            },
                                                            {
                                                                name: "Focus Block",
                                                                day: 4,
                                                                start: "09:00",
                                                                end: "12:00",
                                                                label: "deep",
                                                                color: "bg-fuchsia-500"
                                                            },
                                                            {
                                                                name: "Lunch",
                                                                day: 4,
                                                                start: "12:00",
                                                                end: "13:00",
                                                                label: "break",
                                                                color: "bg-green-400"
                                                            },
                                                            {
                                                                name: "Review & Wrap-up",
                                                                day: 4,
                                                                start: "14:00",
                                                                end: "16:00",
                                                                label: "admin",
                                                                color: "bg-orange-500"
                                                            },
                                                            {
                                                                name: "Team Happy Hour",
                                                                day: 4,
                                                                start: "17:00",
                                                                end: "18:30",
                                                                label: "social",
                                                                color: "bg-violet-500"
                                                            },
                                                            {
                                                                name: "Dinner",
                                                                day: 4,
                                                                start: "19:00",
                                                                end: "20:00",
                                                                label: "break",
                                                                color: "bg-green-400"
                                                            },
                                                            {
                                                                name: "Movie Night",
                                                                day: 4,
                                                                start: "20:30",
                                                                end: "23:00",
                                                                label: "relax",
                                                                color: "bg-pink-400"
                                                            },
                                                            // Saturday
                                                            {
                                                                name: "Morning Yoga",
                                                                day: 5,
                                                                start: "08:00",
                                                                end: "09:00",
                                                                label: "fitness",
                                                                color: "bg-cyan-500"
                                                            },
                                                            {
                                                                name: "Brunch",
                                                                day: 5,
                                                                start: "10:00",
                                                                end: "11:00",
                                                                label: "break",
                                                                color: "bg-green-400"
                                                            },
                                                            {
                                                                name: "Personal Project",
                                                                day: 5,
                                                                start: "11:30",
                                                                end: "14:00",
                                                                label: "hobby",
                                                                color: "bg-blue-400"
                                                            },
                                                            {
                                                                name: "Lunch",
                                                                day: 5,
                                                                start: "14:00",
                                                                end: "15:00",
                                                                label: "break",
                                                                color: "bg-green-400"
                                                            },
                                                            {
                                                                name: "Errands",
                                                                day: 5,
                                                                start: "15:30",
                                                                end: "17:00",
                                                                label: "life",
                                                                color: "bg-slate-500"
                                                            },
                                                            {
                                                                name: "Dinner Prep",
                                                                day: 5,
                                                                start: "17:30",
                                                                end: "18:30",
                                                                label: "life",
                                                                color: "bg-slate-500"
                                                            },
                                                            {
                                                                name: "Dinner",
                                                                day: 5,
                                                                start: "18:30",
                                                                end: "19:30",
                                                                label: "break",
                                                                color: "bg-green-400"
                                                            },
                                                            {
                                                                name: "Social Time",
                                                                day: 5,
                                                                start: "20:00",
                                                                end: "22:00",
                                                                label: "social",
                                                                color: "bg-violet-500"
                                                            },
                                                            {
                                                                name: "Wind Down",
                                                                day: 5,
                                                                start: "22:00",
                                                                end: "23:00",
                                                                label: "relax",
                                                                color: "bg-pink-400"
                                                            },
                                                            // Sunday
                                                            {
                                                                name: "Light Exercise",
                                                                day: 6,
                                                                start: "09:00",
                                                                end: "10:00",
                                                                label: "fitness",
                                                                color: "bg-cyan-500"
                                                            },
                                                            {
                                                                name: "Breakfast",
                                                                day: 6,
                                                                start: "10:00",
                                                                end: "10:30",
                                                                label: "break",
                                                                color: "bg-green-400"
                                                            },
                                                            {
                                                                name: "Reading",
                                                                day: 6,
                                                                start: "11:00",
                                                                end: "13:00",
                                                                label: "study",
                                                                color: "bg-purple-500"
                                                            },
                                                            {
                                                                name: "Lunch",
                                                                day: 6,
                                                                start: "13:00",
                                                                end: "14:00",
                                                                label: "break",
                                                                color: "bg-green-400"
                                                            },
                                                            {
                                                                name: "Meal Prep",
                                                                day: 6,
                                                                start: "14:30",
                                                                end: "16:30",
                                                                label: "life",
                                                                color: "bg-slate-500"
                                                            },
                                                            {
                                                                name: "Planning Week",
                                                                day: 6,
                                                                start: "17:00",
                                                                end: "18:00",
                                                                label: "admin",
                                                                color: "bg-orange-500"
                                                            },
                                                            {
                                                                name: "Dinner",
                                                                day: 6,
                                                                start: "18:30",
                                                                end: "19:30",
                                                                label: "break",
                                                                color: "bg-green-400"
                                                            },
                                                            {
                                                                name: "Family Time",
                                                                day: 6,
                                                                start: "20:00",
                                                                end: "21:30",
                                                                label: "social",
                                                                color: "bg-violet-500"
                                                            },
                                                            {
                                                                name: "Relax",
                                                                day: 6,
                                                                start: "21:30",
                                                                end: "23:00",
                                                                label: "relax",
                                                                color: "bg-pink-400"
                                                            }
                                                        ];
                                                        const newBlocks = [];
                                                        const newTasks = [];
                                                        demoTasks.forEach((demo, idx)=>{
                                                            const taskDate = addDays(weekStart, demo.day);
                                                            const dateISO = toISODate(taskDate);
                                                            const blockId = `demo_${Date.now()}_${idx}`;
                                                            // Create block
                                                            newBlocks.push({
                                                                id: blockId,
                                                                name: demo.name,
                                                                dateISO: dateISO,
                                                                start: demo.start,
                                                                end: demo.end,
                                                                label: demo.label
                                                            });
                                                            // Create task
                                                            const [startHour, startMin] = demo.start.split(":").map(Number);
                                                            const [endHour, endMin] = demo.end.split(":").map(Number);
                                                            newTasks.push({
                                                                id: blockId,
                                                                title: demo.name,
                                                                description: "Demo task",
                                                                label: demo.label,
                                                                day: demo.day,
                                                                date: formatDateKey(taskDate),
                                                                startHour: startHour + startMin / 60,
                                                                endHour: endHour + endMin / 60,
                                                                color: demo.color,
                                                                completed: false
                                                            });
                                                        });
                                                        // Add to existing tasks and blocks
                                                        const updatedBlocks = [
                                                            ...blocks,
                                                            ...newBlocks
                                                        ];
                                                        const updatedTasks = [
                                                            ...tasks,
                                                            ...newTasks
                                                        ];
                                                        setBlocks(updatedBlocks.filter((b)=>b !== null));
                                                        setTasks(updatedTasks);
                                                        // Save to localStorage
                                                        localStorage.setItem("preptime-tasks", JSON.stringify(updatedTasks));
                                                        localStorage.setItem("preptime-blocks", JSON.stringify(updatedBlocks));
                                                        alert("Demo week added! You can now test the AI month generator.");
                                                    },
                                                    className: "px-6 py-3 rounded-lg font-medium text-white bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 shadow-lg hover:shadow-xl transition-all duration-200",
                                                    children: "🎯 Add Demo Week"
                                                }, void 0, false, {
                                                    fileName: "[project]/Downloads/private-project/Preptime-private/web/pages/index.tsx",
                                                    lineNumber: 3702,
                                                    columnNumber: 33
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$externals$5d2f$framer$2d$motion__$5b$external$5d$__$28$framer$2d$motion$2c$__esm_import$2c$__$5b$project$5d2f$Downloads$2f$private$2d$project$2f$Preptime$2d$private$2f$web$2f$node_modules$2f$framer$2d$motion$29$__["motion"].button, {
                                                    type: "button",
                                                    whileHover: {
                                                        scale: 1.05
                                                    },
                                                    whileTap: {
                                                        scale: 0.95
                                                    },
                                                    onClick: ()=>{
                                                        // Open task modal with current selected date and default 9 AM start time
                                                        setSelectedSlot({
                                                            day: 0,
                                                            hour: 9,
                                                            date: selectedDate
                                                        });
                                                        setStartTime("09:00");
                                                        setStartAmPm("AM");
                                                        setEndTime("10:00");
                                                        setEndAmPm("AM");
                                                        setSelectedColor(taskColors[0]);
                                                        setShowModal(true);
                                                    },
                                                    className: `px-6 py-3 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 shadow-lg hover:shadow-xl ${isDark ? "bg-indigo-600 hover:bg-indigo-500 text-white border border-indigo-500/50" : "bg-indigo-600 hover:bg-indigo-700 text-white"}`,
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(PlusIcon, {
                                                            className: "w-5 h-5"
                                                        }, void 0, false, {
                                                            fileName: "[project]/Downloads/private-project/Preptime-private/web/pages/index.tsx",
                                                            lineNumber: 4335,
                                                            columnNumber: 37
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("span", {
                                                            children: "Add Task"
                                                        }, void 0, false, {
                                                            fileName: "[project]/Downloads/private-project/Preptime-private/web/pages/index.tsx",
                                                            lineNumber: 4336,
                                                            columnNumber: 37
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/Downloads/private-project/Preptime-private/web/pages/index.tsx",
                                                    lineNumber: 4312,
                                                    columnNumber: 33
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/Downloads/private-project/Preptime-private/web/pages/index.tsx",
                                            lineNumber: 3361,
                                            columnNumber: 29
                                        }, this),
                                        getUniqueLabels().length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                            className: "mt-3 flex flex-wrap gap-2",
                                            children: getUniqueLabels().map(({ label, color })=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                                    className: `${color} text-white px-3 py-1 rounded-full text-xs font-medium shadow-sm flex items-center gap-1`,
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                                            className: "w-2 h-2 rounded-full bg-white/80"
                                                        }, void 0, false, {
                                                            fileName: "[project]/Downloads/private-project/Preptime-private/web/pages/index.tsx",
                                                            lineNumber: 4347,
                                                            columnNumber: 45
                                                        }, this),
                                                        label
                                                    ]
                                                }, label, true, {
                                                    fileName: "[project]/Downloads/private-project/Preptime-private/web/pages/index.tsx",
                                                    lineNumber: 4343,
                                                    columnNumber: 41
                                                }, this))
                                        }, void 0, false, {
                                            fileName: "[project]/Downloads/private-project/Preptime-private/web/pages/index.tsx",
                                            lineNumber: 4341,
                                            columnNumber: 33
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/Downloads/private-project/Preptime-private/web/pages/index.tsx",
                                    lineNumber: 3298,
                                    columnNumber: 25
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                    className: "flex-1 overflow-hidden",
                                    children: [
                                        viewType === "day" && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$private$2d$project$2f$Preptime$2d$private$2f$web$2f$components$2f$ModernSchedule$2e$tsx__$5b$ssr$5d$__$28$ecmascript$29$__["default"], {
                                            selectedDate: selectedDate,
                                            isDark: isDark,
                                            onAddTask: (hour)=>{
                                                // Create a slot at the selected hour
                                                const date = selectedDate;
                                                handleSlotClick(0, hour, date);
                                            },
                                            tasks: tasks,
                                            onToggleTask: (taskId)=>toggleTaskCompletion(taskId),
                                            onDeleteTask: deleteTask,
                                            formatDateKey: formatDateKey
                                        }, void 0, false, {
                                            fileName: "[project]/Downloads/private-project/Preptime-private/web/pages/index.tsx",
                                            lineNumber: 4357,
                                            columnNumber: 33
                                        }, this),
                                        viewType === "week" && renderWeekView(),
                                        viewType === "month" && renderMonthView(),
                                        viewType === "season" && renderSeasonView(),
                                        viewType === "year" && renderYearView()
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/Downloads/private-project/Preptime-private/web/pages/index.tsx",
                                    lineNumber: 4355,
                                    columnNumber: 25
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                    className: `px-6 py-3 border-t text-xs ${isDark ? "bg-slate-700 border-slate-600 text-slate-400" : "bg-slate-50 border-slate-200 text-slate-500"}`,
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                        className: "flex items-center justify-between",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                                children: viewType === "week" && selectedDateIndex !== null ? `Selected: ${days[selectedDateIndex]}, ${formatDate(addDays(currentMonday, selectedDateIndex))}` : `Viewing: ${viewType.charAt(0).toUpperCase() + viewType.slice(1)}`
                                            }, void 0, false, {
                                                fileName: "[project]/Downloads/private-project/Preptime-private/web/pages/index.tsx",
                                                lineNumber: 4384,
                                                columnNumber: 33
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                                className: "flex items-center gap-4",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("span", {
                                                        className: "flex items-center gap-1",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("span", {
                                                                className: "font-semibold text-green-600",
                                                                children: [
                                                                    "✓ ",
                                                                    stats.completed
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/Downloads/private-project/Preptime-private/web/pages/index.tsx",
                                                                lineNumber: 4394,
                                                                columnNumber: 41
                                                            }, this),
                                                            " ",
                                                            "Done"
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/Downloads/private-project/Preptime-private/web/pages/index.tsx",
                                                        lineNumber: 4393,
                                                        columnNumber: 37
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("span", {
                                                        className: "flex items-center gap-1",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("span", {
                                                                className: "font-semibold text-orange-600",
                                                                children: [
                                                                    "⏳ ",
                                                                    stats.remaining
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/Downloads/private-project/Preptime-private/web/pages/index.tsx",
                                                                lineNumber: 4400,
                                                                columnNumber: 41
                                                            }, this),
                                                            " ",
                                                            "Left"
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/Downloads/private-project/Preptime-private/web/pages/index.tsx",
                                                        lineNumber: 4399,
                                                        columnNumber: 37
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("span", {
                                                        className: "flex items-center gap-1",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("span", {
                                                                className: "font-semibold",
                                                                children: stats.total
                                                            }, void 0, false, {
                                                                fileName: "[project]/Downloads/private-project/Preptime-private/web/pages/index.tsx",
                                                                lineNumber: 4406,
                                                                columnNumber: 41
                                                            }, this),
                                                            " Total"
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/Downloads/private-project/Preptime-private/web/pages/index.tsx",
                                                        lineNumber: 4405,
                                                        columnNumber: 37
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/Downloads/private-project/Preptime-private/web/pages/index.tsx",
                                                lineNumber: 4392,
                                                columnNumber: 33
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/Downloads/private-project/Preptime-private/web/pages/index.tsx",
                                        lineNumber: 4383,
                                        columnNumber: 29
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/Downloads/private-project/Preptime-private/web/pages/index.tsx",
                                    lineNumber: 4377,
                                    columnNumber: 25
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/Downloads/private-project/Preptime-private/web/pages/index.tsx",
                            lineNumber: 3231,
                            columnNumber: 21
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/Downloads/private-project/Preptime-private/web/pages/index.tsx",
                        lineNumber: 3230,
                        columnNumber: 17
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/Downloads/private-project/Preptime-private/web/pages/index.tsx",
                lineNumber: 3210,
                columnNumber: 13
            }, this),
            showSettings && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                className: "fixed inset-0 bg-black/50 flex items-center justify-center z-50",
                onClick: ()=>setShowSettings(false),
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                    className: `rounded-xl shadow-2xl w-full max-w-md mx-4 ${isDark ? "bg-slate-800" : "bg-white"}`,
                    onClick: (e)=>e.stopPropagation(),
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                            className: `bg-gradient-to-r from-indigo-600 to-blue-600 px-6 py-4 rounded-t-xl transition-all duration-500`,
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("h3", {
                                className: "text-lg font-bold text-white",
                                children: "Settings"
                            }, void 0, false, {
                                fileName: "[project]/Downloads/private-project/Preptime-private/web/pages/index.tsx",
                                lineNumber: 4428,
                                columnNumber: 29
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/Downloads/private-project/Preptime-private/web/pages/index.tsx",
                            lineNumber: 4425,
                            columnNumber: 25
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                            className: "p-6 space-y-6",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("label", {
                                            className: `block text-sm font-semibold mb-3 ${isDark ? "text-slate-200" : "text-slate-700"}`,
                                            children: "Theme"
                                        }, void 0, false, {
                                            fileName: "[project]/Downloads/private-project/Preptime-private/web/pages/index.tsx",
                                            lineNumber: 4432,
                                            columnNumber: 33
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                            className: "space-y-2",
                                            children: [
                                                {
                                                    value: "system",
                                                    label: "System Default",
                                                    icon: "💻"
                                                },
                                                {
                                                    value: "light",
                                                    label: "Light Mode",
                                                    icon: "☀️"
                                                },
                                                {
                                                    value: "dark",
                                                    label: "Dark Mode",
                                                    icon: "🌙"
                                                }
                                            ].map((option)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("button", {
                                                    onClick: ()=>handleThemeChange(option.value),
                                                    className: `w-full flex items-center gap-3 px-4 py-3 rounded-lg border-2 transition-all ${theme === option.value ? "border-indigo-600 bg-indigo-50/50" : isDark ? "border-slate-700 hover:border-slate-600 bg-slate-700" : "border-slate-200 hover:border-slate-300"}`,
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("span", {
                                                            className: "text-2xl",
                                                            children: option.icon
                                                        }, void 0, false, {
                                                            fileName: "[project]/Downloads/private-project/Preptime-private/web/pages/index.tsx",
                                                            lineNumber: 4454,
                                                            columnNumber: 45
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("span", {
                                                            className: `flex-1 text-left font-medium ${theme === option.value ? "text-indigo-600" : isDark ? "text-slate-200" : "text-slate-700"}`,
                                                            children: option.label
                                                        }, void 0, false, {
                                                            fileName: "[project]/Downloads/private-project/Preptime-private/web/pages/index.tsx",
                                                            lineNumber: 4455,
                                                            columnNumber: 45
                                                        }, this),
                                                        theme === option.value && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("svg", {
                                                            className: "w-5 h-5 text-indigo-600",
                                                            fill: "currentColor",
                                                            viewBox: "0 0 20 20",
                                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("path", {
                                                                fillRule: "evenodd",
                                                                d: "M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z",
                                                                clipRule: "evenodd"
                                                            }, void 0, false, {
                                                                fileName: "[project]/Downloads/private-project/Preptime-private/web/pages/index.tsx",
                                                                lineNumber: 4471,
                                                                columnNumber: 53
                                                            }, this)
                                                        }, void 0, false, {
                                                            fileName: "[project]/Downloads/private-project/Preptime-private/web/pages/index.tsx",
                                                            lineNumber: 4466,
                                                            columnNumber: 49
                                                        }, this)
                                                    ]
                                                }, option.value, true, {
                                                    fileName: "[project]/Downloads/private-project/Preptime-private/web/pages/index.tsx",
                                                    lineNumber: 4444,
                                                    columnNumber: 41
                                                }, this))
                                        }, void 0, false, {
                                            fileName: "[project]/Downloads/private-project/Preptime-private/web/pages/index.tsx",
                                            lineNumber: 4438,
                                            columnNumber: 33
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/Downloads/private-project/Preptime-private/web/pages/index.tsx",
                                    lineNumber: 4431,
                                    columnNumber: 29
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                    className: `border-t pt-6 ${isDark ? "border-slate-700" : "border-slate-200"}`,
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("label", {
                                            className: `block text-sm font-semibold mb-3 ${isDark ? "text-slate-200" : "text-slate-700"}`,
                                            children: "Data Management"
                                        }, void 0, false, {
                                            fileName: "[project]/Downloads/private-project/Preptime-private/web/pages/index.tsx",
                                            lineNumber: 4488,
                                            columnNumber: 33
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("button", {
                                            onClick: ()=>{
                                                if (confirm("Are you sure you want to clear all tasks and time blocks? This cannot be undone.")) {
                                                    setTasks([]);
                                                    setBlocks([]);
                                                    localStorage.removeItem("preptime-tasks");
                                                    localStorage.removeItem("preptime-blocks");
                                                    setShowSettings(false);
                                                    alert("All tasks and time blocks have been cleared!");
                                                }
                                            },
                                            className: `w-full flex items-center gap-3 px-4 py-3 rounded-lg border-2 transition-all ${isDark ? "border-red-700 hover:border-red-600 bg-red-900/20 hover:bg-red-900/30" : "border-red-200 hover:border-red-300 bg-red-50 hover:bg-red-100"}`,
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("span", {
                                                    className: "text-2xl",
                                                    children: "🗑️"
                                                }, void 0, false, {
                                                    fileName: "[project]/Downloads/private-project/Preptime-private/web/pages/index.tsx",
                                                    lineNumber: 4514,
                                                    columnNumber: 37
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                                    className: "flex-1 text-left",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                                            className: `font-medium ${isDark ? "text-red-400" : "text-red-600"}`,
                                                            children: "Clear All Tasks"
                                                        }, void 0, false, {
                                                            fileName: "[project]/Downloads/private-project/Preptime-private/web/pages/index.tsx",
                                                            lineNumber: 4516,
                                                            columnNumber: 41
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                                            className: `text-xs ${isDark ? "text-red-500" : "text-red-500"}`,
                                                            children: "Remove all tasks and time blocks"
                                                        }, void 0, false, {
                                                            fileName: "[project]/Downloads/private-project/Preptime-private/web/pages/index.tsx",
                                                            lineNumber: 4522,
                                                            columnNumber: 41
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/Downloads/private-project/Preptime-private/web/pages/index.tsx",
                                                    lineNumber: 4515,
                                                    columnNumber: 37
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/Downloads/private-project/Preptime-private/web/pages/index.tsx",
                                            lineNumber: 4494,
                                            columnNumber: 33
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/Downloads/private-project/Preptime-private/web/pages/index.tsx",
                                    lineNumber: 4484,
                                    columnNumber: 29
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/Downloads/private-project/Preptime-private/web/pages/index.tsx",
                            lineNumber: 4430,
                            columnNumber: 25
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                            className: `px-6 py-4 rounded-b-xl border-t ${isDark ? "bg-slate-700 border-slate-600" : "bg-slate-50 border-slate-200"}`,
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("button", {
                                onClick: ()=>setShowSettings(false),
                                className: "w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium text-sm",
                                children: "Done"
                            }, void 0, false, {
                                fileName: "[project]/Downloads/private-project/Preptime-private/web/pages/index.tsx",
                                lineNumber: 4538,
                                columnNumber: 29
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/Downloads/private-project/Preptime-private/web/pages/index.tsx",
                            lineNumber: 4532,
                            columnNumber: 25
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/Downloads/private-project/Preptime-private/web/pages/index.tsx",
                    lineNumber: 4420,
                    columnNumber: 21
                }, this)
            }, void 0, false, {
                fileName: "[project]/Downloads/private-project/Preptime-private/web/pages/index.tsx",
                lineNumber: 4416,
                columnNumber: 17
            }, this),
            showModal && selectedSlot && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                className: "fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto",
                onClick: closeModal,
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                    className: `rounded-xl shadow-2xl w-full max-w-md my-8 ${isDark ? "bg-slate-800" : "bg-white"}`,
                    onClick: (e)=>e.stopPropagation(),
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                            className: `${selectedColor.value} px-6 py-4 rounded-t-xl`,
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("h3", {
                                    className: "text-lg font-bold text-white",
                                    children: "Add Task"
                                }, void 0, false, {
                                    fileName: "[project]/Downloads/private-project/Preptime-private/web/pages/index.tsx",
                                    lineNumber: 4560,
                                    columnNumber: 29
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("p", {
                                    className: "text-sm text-white/90 mt-1",
                                    children: viewType === "day" ? formatFullDate(currentDate) : `${days[selectedSlot.day]}, ${formatDate(selectedSlot.date)}`
                                }, void 0, false, {
                                    fileName: "[project]/Downloads/private-project/Preptime-private/web/pages/index.tsx",
                                    lineNumber: 4561,
                                    columnNumber: 29
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/Downloads/private-project/Preptime-private/web/pages/index.tsx",
                            lineNumber: 4559,
                            columnNumber: 25
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                            className: "p-6 space-y-4",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("label", {
                                            className: `block text-sm font-semibold mb-2 ${isDark ? "text-slate-200" : "text-slate-700"}`,
                                            children: "Task Title"
                                        }, void 0, false, {
                                            fileName: "[project]/Downloads/private-project/Preptime-private/web/pages/index.tsx",
                                            lineNumber: 4572,
                                            columnNumber: 33
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("input", {
                                            type: "text",
                                            value: taskTitle,
                                            onChange: (e)=>setTaskTitle(e.target.value),
                                            placeholder: "e.g. Team Meeting",
                                            className: `w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none ${isDark ? "bg-slate-700 border-slate-600 text-white placeholder-slate-400" : "border-slate-300"}`
                                        }, void 0, false, {
                                            fileName: "[project]/Downloads/private-project/Preptime-private/web/pages/index.tsx",
                                            lineNumber: 4578,
                                            columnNumber: 33
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/Downloads/private-project/Preptime-private/web/pages/index.tsx",
                                    lineNumber: 4571,
                                    columnNumber: 29
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("label", {
                                            className: `block text-sm font-semibold mb-2 ${isDark ? "text-slate-200" : "text-slate-700"}`,
                                            children: "Start Time"
                                        }, void 0, false, {
                                            fileName: "[project]/Downloads/private-project/Preptime-private/web/pages/index.tsx",
                                            lineNumber: 4591,
                                            columnNumber: 33
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                            className: "flex gap-2",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("input", {
                                                    type: "time",
                                                    value: startTime,
                                                    onChange: (e)=>{
                                                        const value = e.target.value;
                                                        setStartTime(value);
                                                        if (value) {
                                                            const [hours] = value.split(":").map(Number);
                                                            setStartAmPm(hours >= 12 ? "PM" : "AM");
                                                        }
                                                    },
                                                    className: `flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none ${isDark ? "bg-slate-700 border-slate-600 text-white" : "border-slate-300"}`
                                                }, void 0, false, {
                                                    fileName: "[project]/Downloads/private-project/Preptime-private/web/pages/index.tsx",
                                                    lineNumber: 4598,
                                                    columnNumber: 37
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("select", {
                                                    value: startAmPm,
                                                    onChange: (e)=>setStartAmPm(e.target.value),
                                                    className: `px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none ${isDark ? "bg-slate-700 border-slate-600 text-white" : "border-slate-300"}`,
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("option", {
                                                            value: "AM",
                                                            children: "AM"
                                                        }, void 0, false, {
                                                            fileName: "[project]/Downloads/private-project/Preptime-private/web/pages/index.tsx",
                                                            lineNumber: 4622,
                                                            columnNumber: 41
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("option", {
                                                            value: "PM",
                                                            children: "PM"
                                                        }, void 0, false, {
                                                            fileName: "[project]/Downloads/private-project/Preptime-private/web/pages/index.tsx",
                                                            lineNumber: 4623,
                                                            columnNumber: 41
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/Downloads/private-project/Preptime-private/web/pages/index.tsx",
                                                    lineNumber: 4614,
                                                    columnNumber: 37
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/Downloads/private-project/Preptime-private/web/pages/index.tsx",
                                            lineNumber: 4597,
                                            columnNumber: 33
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/Downloads/private-project/Preptime-private/web/pages/index.tsx",
                                    lineNumber: 4590,
                                    columnNumber: 29
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("label", {
                                            className: `block text-sm font-semibold mb-2 ${isDark ? "text-slate-200" : "text-slate-700"}`,
                                            children: "End Time"
                                        }, void 0, false, {
                                            fileName: "[project]/Downloads/private-project/Preptime-private/web/pages/index.tsx",
                                            lineNumber: 4629,
                                            columnNumber: 33
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                            className: "flex gap-2",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("input", {
                                                    type: "time",
                                                    value: endTime,
                                                    onChange: (e)=>{
                                                        const value = e.target.value;
                                                        setEndTime(value);
                                                        if (value) {
                                                            const [hours] = value.split(":").map(Number);
                                                            setEndAmPm(hours >= 12 ? "PM" : "AM");
                                                        }
                                                    },
                                                    className: `flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none ${isDark ? "bg-slate-700 border-slate-600 text-white" : "border-slate-300"}`
                                                }, void 0, false, {
                                                    fileName: "[project]/Downloads/private-project/Preptime-private/web/pages/index.tsx",
                                                    lineNumber: 4636,
                                                    columnNumber: 37
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("select", {
                                                    value: endAmPm,
                                                    onChange: (e)=>setEndAmPm(e.target.value),
                                                    className: `px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none ${isDark ? "bg-slate-700 border-slate-600 text-white" : "border-slate-300"}`,
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("option", {
                                                            value: "AM",
                                                            children: "AM"
                                                        }, void 0, false, {
                                                            fileName: "[project]/Downloads/private-project/Preptime-private/web/pages/index.tsx",
                                                            lineNumber: 4660,
                                                            columnNumber: 41
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("option", {
                                                            value: "PM",
                                                            children: "PM"
                                                        }, void 0, false, {
                                                            fileName: "[project]/Downloads/private-project/Preptime-private/web/pages/index.tsx",
                                                            lineNumber: 4661,
                                                            columnNumber: 41
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/Downloads/private-project/Preptime-private/web/pages/index.tsx",
                                                    lineNumber: 4652,
                                                    columnNumber: 37
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/Downloads/private-project/Preptime-private/web/pages/index.tsx",
                                            lineNumber: 4635,
                                            columnNumber: 33
                                        }, this),
                                        !isValidTime() && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("p", {
                                            className: "text-xs text-red-600 mt-1",
                                            children: "End time must be after start time"
                                        }, void 0, false, {
                                            fileName: "[project]/Downloads/private-project/Preptime-private/web/pages/index.tsx",
                                            lineNumber: 4665,
                                            columnNumber: 37
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/Downloads/private-project/Preptime-private/web/pages/index.tsx",
                                    lineNumber: 4628,
                                    columnNumber: 29
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("label", {
                                            className: `block text-sm font-semibold mb-2 ${isDark ? "text-slate-200" : "text-slate-700"}`,
                                            children: "Color"
                                        }, void 0, false, {
                                            fileName: "[project]/Downloads/private-project/Preptime-private/web/pages/index.tsx",
                                            lineNumber: 4672,
                                            columnNumber: 33
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                            className: "grid grid-cols-10 gap-2",
                                            children: taskColors.map((color)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("button", {
                                                    type: "button",
                                                    onClick: ()=>setSelectedColor(color),
                                                    className: `w-8 h-8 rounded-lg ${color.value} border-2 transition-all ${selectedColor.value === color.value ? "border-indigo-600 scale-110 ring-2 ring-indigo-400" : "border-transparent hover:scale-105"}`,
                                                    title: color.name
                                                }, color.value, false, {
                                                    fileName: "[project]/Downloads/private-project/Preptime-private/web/pages/index.tsx",
                                                    lineNumber: 4680,
                                                    columnNumber: 41
                                                }, this))
                                        }, void 0, false, {
                                            fileName: "[project]/Downloads/private-project/Preptime-private/web/pages/index.tsx",
                                            lineNumber: 4678,
                                            columnNumber: 33
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("p", {
                                            className: `text-xs mt-2 ${isDark ? "text-slate-400" : "text-slate-500"}`,
                                            children: [
                                                "Selected: ",
                                                selectedColor.name
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/Downloads/private-project/Preptime-private/web/pages/index.tsx",
                                            lineNumber: 4693,
                                            columnNumber: 33
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/Downloads/private-project/Preptime-private/web/pages/index.tsx",
                                    lineNumber: 4671,
                                    columnNumber: 29
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("label", {
                                            className: `block text-sm font-semibold mb-2 ${isDark ? "text-slate-200" : "text-slate-700"}`,
                                            children: "Label/Tag Name"
                                        }, void 0, false, {
                                            fileName: "[project]/Downloads/private-project/Preptime-private/web/pages/index.tsx",
                                            lineNumber: 4702,
                                            columnNumber: 33
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("input", {
                                            type: "text",
                                            value: taskLabel,
                                            onChange: (e)=>setTaskLabel(e.target.value),
                                            placeholder: "e.g. Work, Study, Exercise",
                                            className: `w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none ${isDark ? "bg-slate-700 border-slate-600 text-white placeholder-slate-400" : "border-slate-300"}`
                                        }, void 0, false, {
                                            fileName: "[project]/Downloads/private-project/Preptime-private/web/pages/index.tsx",
                                            lineNumber: 4708,
                                            columnNumber: 33
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("p", {
                                            className: `text-xs mt-1 ${isDark ? "text-slate-400" : "text-slate-500"}`,
                                            children: "Assign a category or subject name to this task"
                                        }, void 0, false, {
                                            fileName: "[project]/Downloads/private-project/Preptime-private/web/pages/index.tsx",
                                            lineNumber: 4718,
                                            columnNumber: 33
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/Downloads/private-project/Preptime-private/web/pages/index.tsx",
                                    lineNumber: 4701,
                                    columnNumber: 29
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("label", {
                                            className: `block text-sm font-semibold mb-2 ${isDark ? "text-slate-200" : "text-slate-700"}`,
                                            children: "Description (optional)"
                                        }, void 0, false, {
                                            fileName: "[project]/Downloads/private-project/Preptime-private/web/pages/index.tsx",
                                            lineNumber: 4727,
                                            columnNumber: 33
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("textarea", {
                                            value: taskDescription,
                                            onChange: (e)=>setTaskDescription(e.target.value),
                                            placeholder: "Add notes or details...",
                                            rows: 3,
                                            className: `w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none resize-none ${isDark ? "bg-slate-700 border-slate-600 text-white placeholder-slate-400" : "border-slate-300"}`
                                        }, void 0, false, {
                                            fileName: "[project]/Downloads/private-project/Preptime-private/web/pages/index.tsx",
                                            lineNumber: 4733,
                                            columnNumber: 33
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/Downloads/private-project/Preptime-private/web/pages/index.tsx",
                                    lineNumber: 4726,
                                    columnNumber: 29
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/Downloads/private-project/Preptime-private/web/pages/index.tsx",
                            lineNumber: 4570,
                            columnNumber: 25
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("div", {
                            className: `flex gap-3 px-6 py-4 rounded-b-xl border-t ${isDark ? "bg-slate-700 border-slate-600" : "bg-slate-50 border-slate-200"}`,
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("button", {
                                    onClick: closeModal,
                                    className: `flex-1 px-4 py-2 border rounded-lg transition-colors font-medium text-sm ${isDark ? "border-slate-600 hover:bg-slate-600 text-white" : "border-slate-300 hover:bg-white"}`,
                                    children: "Cancel"
                                }, void 0, false, {
                                    fileName: "[project]/Downloads/private-project/Preptime-private/web/pages/index.tsx",
                                    lineNumber: 4752,
                                    columnNumber: 29
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$externals$5d2f$react$2f$jsx$2d$dev$2d$runtime__$5b$external$5d$__$28$react$2f$jsx$2d$dev$2d$runtime$2c$__cjs$29$__["jsxDEV"])("button", {
                                    onClick: saveTask,
                                    disabled: !taskTitle.trim() || !isValidTime(),
                                    className: "flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium text-sm disabled:bg-slate-300 disabled:cursor-not-allowed",
                                    children: "Save Task"
                                }, void 0, false, {
                                    fileName: "[project]/Downloads/private-project/Preptime-private/web/pages/index.tsx",
                                    lineNumber: 4761,
                                    columnNumber: 29
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/Downloads/private-project/Preptime-private/web/pages/index.tsx",
                            lineNumber: 4746,
                            columnNumber: 25
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/Downloads/private-project/Preptime-private/web/pages/index.tsx",
                    lineNumber: 4554,
                    columnNumber: 21
                }, this)
            }, void 0, false, {
                fileName: "[project]/Downloads/private-project/Preptime-private/web/pages/index.tsx",
                lineNumber: 4550,
                columnNumber: 17
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/Downloads/private-project/Preptime-private/web/pages/index.tsx",
        lineNumber: 3204,
        columnNumber: 9
    }, this);
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[externals]/next/dist/shared/lib/no-fallback-error.external.js [external] (next/dist/shared/lib/no-fallback-error.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/shared/lib/no-fallback-error.external.js", () => require("next/dist/shared/lib/no-fallback-error.external.js"));

module.exports = mod;
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__d9c61221._.js.map