"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ModernSchedule from "../components/ModernSchedule";
import MonthGeneratorButton from "../components/MonthGeneratorButton";
import WeatherWidget from "../components/WeatherWidget";
import PreferencesPanel from "../components/PreferencesPanel";

// import DebugPanel from "../components/DebugPanel"; // Commented out after fixing
import type {
    Task as SharedTask,
    Event,
    ScheduledBlock,
    Preferences,
} from "@/shared/types";

const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const daysFull = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
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
    "December",
];
const startHour = 0;
const endHour = 24;

type ScheduleMode = "balanced" | "study" | "lockin" | "relax";
type ViewType = "day" | "week" | "month" | "season" | "year";
type BreakStyle = "Pomodoro" | "Deep Focus" | "Custom";

type TimeBlock = {
    id: string;
    name: string;
    dateISO: string; // "YYYY-MM-DD"
    start: string; // "HH:MM"
    end: string; // "HH:MM"
    style?: BreakStyle;
    focusMin?: number; // default 25
    breakMin?: number; // default 5
    label?: string; // task label/category
    description?: string; // task description
};

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

const modes = [
    {
        value: "balanced",
        label: "Balanced",
        icon: "⚖️",
        description: "Mixed strategy",
        gradient: "from-indigo-600 to-blue-600",
    },
    {
        value: "study",
        label: "Study",
        icon: "📚",
        description: "Spacing & retention",
        gradient: "from-purple-600 to-pink-600",
    },
    {
        value: "lockin",
        label: "Lock-In",
        icon: "🔒",
        description: "Deep work blocks",
        gradient: "from-orange-600 to-red-600",
    },
    {
        value: "relax",
        label: "Relax",
        icon: "🌿",
        description: "Recovery time",
        gradient: "from-green-600 to-teal-600",
    },
];

const views = [
    { value: "day", label: "Day" },
    { value: "week", label: "Week" },
    { value: "month", label: "Month" },
    { value: "season", label: "Season" },
    { value: "year", label: "Year" },
];

const taskColors = [
    { name: "Cyan", value: "bg-cyan-500" },
    { name: "Blue", value: "bg-blue-500" },
    { name: "Indigo", value: "bg-indigo-500" },
    { name: "Purple", value: "bg-purple-500" },
    { name: "Pink", value: "bg-pink-500" },
    { name: "Rose", value: "bg-rose-500" },
    { name: "Red", value: "bg-red-500" },
    { name: "Orange", value: "bg-orange-500" },
    { name: "Amber", value: "bg-amber-500" },
    { name: "Yellow", value: "bg-yellow-500" },
    { name: "Lime", value: "bg-lime-500" },
    { name: "Green", value: "bg-green-500" },
    { name: "Emerald", value: "bg-emerald-500" },
    { name: "Teal", value: "bg-teal-500" },
    { name: "Sky", value: "bg-sky-500" },
    { name: "Slate", value: "bg-slate-500" },
    { name: "Gray", value: "bg-gray-500" },
    { name: "Zinc", value: "bg-zinc-500" },
    { name: "Stone", value: "bg-stone-500" },
    { name: "Neutral", value: "bg-neutral-500" },
];
function pad2(n: number) {
    return (n < 10 ? "0" : "") + n;
}

function normalizeTimeString(input: string): string {
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

function parseTimeParts(input: string): [number, number] {
    const norm = normalizeTimeString(input);
    const [hh, mm] = norm.split(":").map(Number);
    return [Number.isFinite(hh) ? hh : 0, Number.isFinite(mm) ? mm : 0];
}

function toISODate(d: Date) {
    return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

function sameISO(a: string, b: string) {
    return a === b;
}

function formatTime(t: string) {
    const h = Number(t.slice(0, 2));
    const m = Number(t.slice(3, 5));
    const am = h < 12;
    const hh = ((h + 11) % 12) + 1;
    return `${hh}:${pad2(m)} ${am ? "AM" : "PM"}`;
}

function fmtDateLong(d: Date) {
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
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
        "Dec",
    ];
    return `${days[d.getDay()]}, ${months[d.getMonth()]} ${d.getDate()}`;
}

function fmtClock(d: Date) {
    const hh = d.getHours();
    const mm = d.getMinutes();
    const am = hh < 12;
    const h12 = ((hh + 11) % 12) + 1;
    return `${h12}:${pad2(mm)} ${am ? "AM" : "PM"}`;
}

function toDateForTime(selectedDate: Date, hhmm: string) {
    const [hh, mm] = hhmm.split(":").map(Number);
    const d = new Date(selectedDate);
    d.setHours(hh, mm, 0, 0);
    return d;
}

function fmtCountdownSmart(totalSec: number) {
    const s = Math.max(0, Math.floor(totalSec));
    const h = Math.floor(s / 3600);
    const rem = s - h * 3600;
    const m = Math.floor(rem / 60);
    const ss = rem % 60;

    if (h === 0) return `${m}:${pad2(ss)}`;
    return `${h}:${pad2(m)}:${pad2(ss)}`;
}

function timeToMinutes(hhmm: string) {
    const [hh, mm] = parseTimeParts(hhmm);
    return hh * 60 + mm;
}

function uid() {
    return `b_${Date.now().toString(36)}_${Math.random()
        .toString(36)
        .slice(2, 9)}`;
}

// Force 0..24 range and fix common double-PM bugs (e.g. 17 PM becoming 29)
function normalizeHour24(hour: any): number {
    let h = Number(hour);
    if (!Number.isFinite(h)) return 0;

    // keep 24 as 24 (valid as an end-time)
    if (h === 24) return 24;

    // fix double-PM bugs like 25..36 -> subtract 12
    while (h > 24) h -= 12;

    if (h < 0) h = 0;
    return h;
}

function formatHour(h: number): string {
    const hour = Math.floor(h);
    if (hour === 0 || hour === 24) return "12 AM";
    if (hour === 12) return "12 PM";
    if (hour > 12) return `${hour - 12} PM`;
    return `${hour} AM`;
}

function getMonday(date: Date): Date {
    const d = new Date(date);
    const day = d.getDay();
    const diff = (day === 0 ? -6 : 1) - day;
    d.setDate(d.getDate() + diff);
    d.setHours(0, 0, 0, 0);
    return d;
}

function addDays(date: Date, days: number): Date {
    const d = new Date(date);
    d.setDate(d.getDate() + days);
    return d;
}

function formatDate(date: Date): string {
    return months[date.getMonth()] + " " + date.getDate();
}

function formatFullDate(date: Date): string {
    return (
        daysFull[date.getDay()] +
        ", " +
        months[date.getMonth()] +
        " " +
        date.getDate() +
        ", " +
        date.getFullYear()
    );
}

function formatFullWeek(monday: Date): string {
    const sunday = addDays(monday, 6);
    return (
        formatDate(monday) +
        " - " +
        formatDate(sunday) +
        ", " +
        monday.getFullYear()
    );
}

function formatDateKey(date: Date): string {
    return `${date.getFullYear()}-${(date.getMonth() + 1)
        .toString()
        .padStart(2, "0")}-${date.getDate().toString().padStart(2, "0")}`;
}

function hourToTimeString(hour: number): string {
    const h = Math.floor(hour);
    const m = (hour % 1) * 60;
    const hours = h.toString().padStart(2, "0");
    const minutes = m.toString().padStart(2, "0");
    return `${hours}:${minutes}`;
}

function hourToAmPm(hour: number): string {
    return hour >= 12 ? "PM" : "AM";
}

// Fixed function: correctly handles 24h input vs 12h input
function timeStringToHour(time: string, ampm: string): number {
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

function getDaysInMonth(year: number, month: number): number {
    return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number): number {
    const day = new Date(year, month, 1).getDay();
    return day === 0 ? 6 : day - 1;
}

function getSeason(date: Date): string {
    const month = date.getMonth();
    if (month >= 2 && month <= 4) return "Spring";
    if (month >= 5 && month <= 7) return "Summer";
    if (month >= 8 && month <= 10) return "Fall";
    return "Winter";
}
function PlusIcon({ className = "" }: { className?: string }) {
    return (
        <svg
            className={className}
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
        >
            <path
                d="M12 5v14M5 12h14"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
            />
        </svg>
    );
}

function TrashIcon({ className = "" }: { className?: string }) {
    return (
        <svg
            className={className}
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
        >
            <path
                d="M9 3h6m-8 4h10m-9 0 1 14h6l1-14M10 11v6m4-6v6"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
}

function DotsIcon({ className = "" }: { className?: string }) {
    return (
        <svg
            className={className}
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
        >
            <path
                d="M6 12h.01M12 12h.01M18 12h.01"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
            />
        </svg>
    );
}

function CalendarIcon({ className = "" }: { className?: string }) {
    return (
        <svg
            className={className}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
        >
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
        </svg>
    );
}

function ClockIcon({ className = "" }: { className?: string }) {
    return (
        <svg
            className={className}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
        >
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
        </svg>
    );
}

function BookIcon({ className = "" }: { className?: string }) {
    return (
        <svg
            className={className}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
        >
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
            />
        </svg>
    );
}

function TagIcon({ className = "" }: { className?: string }) {
    return (
        <svg
            className={className}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
        >
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
            />
        </svg>
    );
}

function SparklesIcon({ className = "" }: { className?: string }) {
    return (
        <svg
            className={className}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
        >
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
            />
        </svg>
    );
}

function ChevronLeftIcon({ className = "" }: { className?: string }) {
    return (
        <svg
            className={className}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
        >
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
            />
        </svg>
    );
}

function ChevronRightIcon({ className = "" }: { className?: string }) {
    return (
        <svg
            className={className}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
        >
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
            />
        </svg>
    );
}

/* ------------------------------- small UI bits ------------------------------- */

function StylePill({ style }: { style?: BreakStyle }) {
    if (!style) return null;

    const base =
        "text-[11px] px-2.5 py-1 rounded-full border font-medium tracking-tight shadow-sm";
    if (style === "Pomodoro")
        return (
            <span className={`${base} border-rose-200 bg-rose-50 text-rose-700`}>
                Pomodoro
            </span>
        );
    if (style === "Deep Focus")
        return (
            <span
                className={`${base} border-emerald-200 bg-emerald-50 text-emerald-700`}
            >
                Deep Focus
            </span>
        );
    return (
        <span className={`${base} border-zinc-200 bg-zinc-50 text-zinc-700`}>
            Custom
        </span>
    );
}

function MenuItem({
    label,
    sub,
    onClick,
    isDark,
}: {
    label: string;
    sub: string;
    onClick: () => void;
    isDark: boolean;
}) {
    return (
        <button
            onClick={onClick}
            className={`w-full text-left px-3 py-2 transition ${isDark
                ? "hover:bg-slate-800 active:bg-slate-700"
                : "hover:bg-zinc-50 active:bg-zinc-100/70"
                }`}
            type="button"
        >
            <div
                className={`text-sm font-medium ${isDark ? "text-slate-100" : "text-zinc-900"
                    }`}
            >
                {label}
            </div>
            <div className={`text-xs ${isDark ? "text-slate-400" : "text-zinc-500"}`}>
                {sub}
            </div>
        </button>
    );
}

/* ------------------------------ Mini Calendar ------------------------------ */

function MiniCalendar({
    selectedDate,
    onSelectDate,
    isDark,
}: {
    selectedDate: Date;
    onSelectDate: (d: Date) => void;
    isDark: boolean;
}) {
    const [viewYear, setViewYear] = React.useState(selectedDate.getFullYear());
    const [viewMonth, setViewMonth] = React.useState(selectedDate.getMonth());

    React.useEffect(() => {
        setViewYear(selectedDate.getFullYear());
        setViewMonth(selectedDate.getMonth());
    }, [selectedDate]);

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
        "December",
    ];
    const dow = ["S", "M", "T", "W", "T", "F", "S"];

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

    const cells: Array<{ key: string; dayNum?: number; date?: Date }> = [];
    for (let i = 0; i < 42; i++) {
        const dayNum = i - firstDow + 1;
        if (dayNum >= 1 && dayNum <= daysInMonth) {
            const date = new Date(viewYear, viewMonth, dayNum);
            cells.push({ key: `${viewYear}-${viewMonth}-${dayNum}`, dayNum, date });
        } else {
            cells.push({ key: `empty-${i}` });
        }
    }

    return (
        <div
            className={`rounded-2xl border shadow-sm p-3 ${isDark
                ? "border-slate-700/50 bg-slate-800/40"
                : "border-zinc-200 bg-white"
                }`}
        >
            <div className="flex items-center justify-between">
                <button
                    onClick={prevMonth}
                    className={`h-8 w-8 rounded-lg border transition ${isDark
                        ? "border-slate-700/50 bg-slate-900/30 text-slate-200 hover:bg-slate-700/40 active:bg-slate-700/60"
                        : "border-zinc-200 bg-white hover:bg-zinc-50 active:bg-zinc-100"
                        }`}
                    type="button"
                >
                    {"<"}
                </button>
                <div
                    className={`text-sm font-semibold tracking-tight ${isDark ? "text-slate-100" : "text-blue-900"
                        }`}
                >
                    {months[viewMonth]} {viewYear}
                </div>
                <button
                    onClick={nextMonth}
                    className={`h-8 w-8 rounded-lg border transition ${isDark
                        ? "border-slate-700/50 bg-slate-900/30 text-slate-200 hover:bg-slate-700/40 active:bg-slate-700/60"
                        : "border-zinc-200 bg-white hover:bg-zinc-50 active:bg-zinc-100"
                        }`}
                    type="button"
                >
                    {">"}
                </button>
            </div>

            <div
                className={`mt-2 grid grid-cols-7 gap-1 text-xs ${isDark ? "text-slate-300" : "text-zinc-900"
                    }`}
            >
                {dow.map((d, i) => (
                    <div key={`${d}-${i}`} className="text-center py-1">
                        {d}
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
                {cells.map((c) => {
                    if (!c.date) return <div key={c.key} className="h-8" />;
                    const iso = toISODate(c.date);
                    const isToday = iso === todayISO;
                    const isSelected = iso === selectedISO;

                    return (
                        <button
                            key={c.key}
                            onClick={() => onSelectDate(c.date!)}
                            type="button"
                            className={[
                                "h-8 rounded-lg text-sm border transition shadow-sm",
                                isSelected
                                    ? isDark
                                        ? "bg-indigo-600 text-white border-indigo-400/40"
                                        : "bg-blue-900 text-white border-zinc-900"
                                    : isDark
                                        ? "bg-slate-900/30 text-slate-100 border-slate-700/50 hover:bg-slate-700/40 active:bg-slate-700/60"
                                        : "bg-white hover:bg-blue-50 active:bg-blue-100 border-blue-200",
                                isToday && !isSelected
                                    ? isDark
                                        ? "border-indigo-400/60"
                                        : "border-blue-900"
                                    : "",
                            ].join(" ")}
                        >
                            {c.dayNum}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}

function FocusTimerPanel({
    block,
    selectedDate,

    isDark,
}: {
    block: TimeBlock | undefined;
    selectedDate: Date;
    isDark: boolean;
}) {
    // Internal timer state to avoid re-rendering the whole app
    const [now, setNow] = React.useState<Date | null>(null);

    React.useEffect(() => {
        setNow(new Date());
        // Update frequently only when this component is mounted (timer is active)
        const id = setInterval(() => setNow(new Date()), 250);
        return () => clearInterval(id);
    }, []);

    if (!now) return null;
    const card = `rounded-2xl border shadow-sm p-4 ${isDark ? "border-slate-700/50 bg-slate-800/30" : "border-zinc-200 bg-white"
        }`;

    if (!block) {
        return (
            <div className={`${card} ${isDark ? "text-slate-300" : "text-zinc-600"}`}>
                Select a time slot to see the timer.
            </div>
        );
    }

    const startDt = toDateForTime(selectedDate, block.start);
    const endDt = toDateForTime(selectedDate, block.end);

    if (endDt <= startDt) {
        return (
            <div className={`${card} text-red-600`}>
                End time must be after start time.
            </div>
        );
    }

    const nowMs = now.getTime();
    const startMs = startDt.getTime();
    const endMs = endDt.getTime();

    if (!block.style) {
        const totalSec = (endMs - startMs) / 1000;

        if (nowMs < startMs) {
            const secToStart = (startMs - nowMs) / 1000;
            return (
                <div className={card}>
                    <div
                        className={`text-sm ${isDark ? "text-slate-400" : "text-zinc-500"}`}
                    >
                        Auto Focus Timer
                    </div>
                    <div
                        className={`mt-1 text-base font-semibold tracking-tight ${isDark ? "text-slate-100" : "text-zinc-900"
                            }`}
                    >
                        {block.name}
                    </div>
                    <div
                        className={`mt-1 text-sm ${isDark ? "text-slate-300" : "text-zinc-500"
                            }`}
                    >
                        {formatTime(block.start)} – {formatTime(block.end)} • Study
                    </div>

                    <div
                        className={`mt-3 ${isDark ? "text-slate-200" : "text-zinc-800"}`}
                    >
                        Starts in:{" "}
                        <span
                            className={`font-mono font-semibold ${isDark ? "text-white" : ""
                                }`}
                        >
                            {fmtCountdownSmart(secToStart)}
                        </span>
                    </div>
                </div>
            );
        }

        if (nowMs >= endMs) {
            return (
                <div className={card}>
                    <div
                        className={`text-sm ${isDark ? "text-slate-400" : "text-zinc-500"}`}
                    >
                        Auto Focus Timer
                    </div>
                    <div
                        className={`mt-1 text-base font-semibold tracking-tight ${isDark ? "text-white" : "text-zinc-900"
                            }`}
                    >
                        {block.name}
                    </div>
                    <div className="mt-3 text-emerald-700 font-semibold">Finished</div>
                </div>
            );
        }

        const elapsedSec = (nowMs - startMs) / 1000;
        const remaining = Math.max(0, totalSec - elapsedSec);

        return (
            <div className={card}>
                <div className="flex items-start justify-between gap-3">
                    <div>
                        <div
                            className={`text-sm ${isDark ? "text-slate-400" : "text-zinc-500"
                                }`}
                        >
                            Auto Focus Timer
                        </div>
                        <div
                            className={`mt-1 text-base font-semibold tracking-tight ${isDark ? "text-white" : "text-zinc-900"
                                }`}
                        >
                            {block.name}
                        </div>
                        <div className={`mt-1 text-sm text-zinc-500`}>
                            {formatTime(block.start)} – {formatTime(block.end)} • Study
                        </div>
                    </div>
                </div>

                <div
                    className={`mt-3 flex items-center justify-between rounded-xl border p-3 shadow-sm ${isDark
                        ? "border-slate-700/50 bg-slate-900/30"
                        : "border-green-200 bg-zinc-50/60"
                        }`}
                >
                    <div className="text-sm">
                        <div className="text-green-500">Now</div>
                        <div className="font-semibold text-green-700">STUDY</div>
                    </div>
                    <div className="text-right">
                        <div
                            className={`text-xs ${isDark ? "text-slate-300" : "text-zinc-500"
                                }`}
                        >
                            Countdown
                        </div>
                        <div
                            className={`text-2xl font-mono font-semibold ${isDark ? "text-white" : "text-zinc-900"
                                }`}
                        >
                            {fmtCountdownSmart(remaining)}
                        </div>
                    </div>
                </div>

                <div className="mt-2 text-xs text-zinc-500">
                    Auto-updates using your device clock.
                </div>
            </div>
        );
    }

    const fallbackFocus = block.style === "Deep Focus" ? 52 : 25;
    const fallbackBreak = block.style === "Deep Focus" ? 17 : 5;
    const focusMin = block.focusMin ?? fallbackFocus;
    const breakMin = block.breakMin ?? fallbackBreak;

    if (nowMs < startMs) {
        const secToStart = (startMs - nowMs) / 1000;
        return (
            <div className={card}>
                <div
                    className={`text-sm ${isDark ? "text-slate-400" : "text-zinc-500"}`}
                >
                    Auto Focus Timer
                </div>
                <div
                    className={`mt-1 text-base font-semibold tracking-tight ${isDark ? "text-white" : "text-zinc-900"
                        }`}
                >
                    {block.name}
                </div>
                <div className={`mt-1 text-sm text-zinc-500`}>
                    {formatTime(block.start)} – {formatTime(block.end)} • {focusMin}/
                    {breakMin}
                </div>

                <div className={`mt-3 ${isDark ? "text-slate-200" : "text-zinc-800"}`}>
                    Starts in:{" "}
                    <span
                        className={`font-mono font-semibold ${isDark ? "text-white" : ""}`}
                    >
                        {fmtCountdownSmart(secToStart)}
                    </span>
                </div>
            </div>
        );
    }

    if (nowMs >= endMs) {
        return (
            <div className={card}>
                <div
                    className={`text-sm ${isDark ? "text-slate-400" : "text-zinc-500"}`}
                >
                    Auto Focus Timer
                </div>
                <div
                    className={`mt-1 text-base font-semibold tracking-tight ${isDark ? "text-white" : "text-zinc-900"
                        }`}
                >
                    {block.name}
                </div>
                <div className="mt-3 text-emerald-700 font-semibold">Finished</div>
            </div>
        );
    }

    const elapsedSec = (nowMs - startMs) / 1000;
    const focusSec = focusMin * 60;
    const breakSec = breakMin * 60;
    const cycleSec = focusSec + breakSec;
    const cycleIndex = Math.floor(elapsedSec / cycleSec);
    const intoCycle = elapsedSec - cycleIndex * cycleSec;
    const isStudy = intoCycle < focusSec;
    const phaseRemaining = isStudy ? focusSec - intoCycle : cycleSec - intoCycle;

    return (
        <div className={card}>
            <div className="flex items-start justify-between gap-3">
                <div>
                    <div
                        className={`text-sm ${isDark ? "text-slate-400" : "text-zinc-500"}`}
                    >
                        Auto Focus Timer
                    </div>
                    <div
                        className={`mt-1 text-base font-semibold tracking-tight ${isDark ? "text-white" : "text-zinc-900"
                            }`}
                    >
                        {block.name}
                    </div>
                    <div className={`mt-1 text-sm text-zinc-500`}>
                        {formatTime(block.start)} – {formatTime(block.end)} • {focusMin}/
                        {breakMin}
                    </div>
                </div>
                <StylePill style={block.style} />
            </div>

            <div
                className={`mt-3 flex items-center justify-between rounded-xl border p-3 shadow-sm ${isDark
                    ? "border-slate-700/50 bg-slate-900/30"
                    : "border-zinc-200 bg-zinc-50/60"
                    }`}
            >
                <div className="text-sm">
                    <div className={`${isDark ? "text-zinc-500" : "text-zinc-500"}`}>
                        Now
                    </div>
                    <div
                        className={`font-semibold ${isStudy ? "text-green-700" : "text-sky-700"
                            }`}
                    >
                        {isStudy ? "STUDY" : "BREAK"}
                    </div>
                </div>
                <div className="text-right">
                    <div
                        className={`text-xs ${isDark ? "text-slate-300" : "text-zinc-500"}`}
                    >
                        Countdown
                    </div>
                    <div
                        className={`text-2xl font-mono font-semibold ${isDark ? "text-white" : "text-zinc-900"
                            }`}
                    >
                        {fmtCountdownSmart(phaseRemaining)}
                    </div>
                    <div
                        className={`text-xs ${isDark ? "text-slate-300" : "text-zinc-500"}`}
                    >
                        Cycle {cycleIndex + 1}
                    </div>
                </div>
            </div>

            <div className="mt-2 text-xs text-zinc-500">
                Auto-updates using your device clock.
            </div>
        </div>
    );
}



function Sidebar({
    blocks,
    activeId,
    selectedDate,
    onSelectDate,
    onSelectBlock,
    onPickStyle,
    onSetCustomMinutes,
    onDeleteBlock,
    onUpdateBlock,
    manualOrderByDate,
    onSetManualOrderForDate,
    isDark,
    weatherUnit,
}: {
    blocks: TimeBlock[];
    activeId?: string;
    selectedDate: Date;
    onSelectDate: (d: Date) => void;
    onSelectBlock: (id: string) => void;
    onPickStyle: (id: string, style: BreakStyle) => void;
    onSetCustomMinutes: (id: string, focusMin: number, breakMin: number) => void;
    onDeleteBlock: (id: string) => void;
    onUpdateBlock: (id: string, patch: Partial<TimeBlock>) => void;

    manualOrderByDate: Record<string, string[]>;
    onSetManualOrderForDate: (dateISO: string, idsInOrder: string[]) => void;
    isDark: boolean;
    weatherUnit?: 'celsius' | 'fahrenheit';
}) {
    // Internal time state for sorting and header clock
    // Update every 10 seconds is enough for minute-level display and sorting
    const [now, setNow] = React.useState(() => new Date());

    React.useEffect(() => {
        const id = setInterval(() => setNow(new Date()), 10000);
        return () => clearInterval(id);
    }, []);

    const [greeting, setGreeting] = React.useState("");
    const [username, setUsername] = React.useState("");

    React.useEffect(() => {
        // Calculate greeting based on hour
        const hour = now.getHours();
        if (hour >= 5 && hour < 12) setGreeting("Good Morning");
        else if (hour >= 12 && hour < 18) setGreeting("Good Afternoon");
        else setGreeting("Good Evening");

        // Get username
        const name = localStorage.getItem("preptime-username");
        setUsername(name || "Guest");
    }, [now]);
    const [menuFor, setMenuFor] = React.useState<string | null>(null);
    const [menuPos, setMenuPos] = React.useState<{
        top: number;
        left: number;
    } | null>(null);

    const [actionFor, setActionFor] = React.useState<string | null>(null);
    const [actionPos, setActionPos] = React.useState<{
        top: number;
        left: number;
    } | null>(null);

    const [customFocus, setCustomFocus] = React.useState(25);
    const [customBreak, setCustomBreak] = React.useState(5);

    // NEW: drag state (enhanced)
    const [draggingId, setDraggingId] = React.useState<string | null>(null);
    const [dragOverId, setDragOverId] = React.useState<string | null>(null);
    const [dragOverEdge, setDragOverEdge] = React.useState<
        "top" | "bottom" | null
    >(null);

    // edit modal state
    const sidebarRef = React.useRef<HTMLElement>(null);
    const [editId, setEditId] = React.useState<string | null>(null);
    const [editName, setEditName] = React.useState("");
    const [editLabel, setEditLabel] = React.useState("");
    const [editDescription, setEditDescription] = React.useState("");
    const [editStart, setEditStart] = React.useState("15:00");
    const [editEnd, setEditEnd] = React.useState("16:30");
    const [editStyle, setEditStyle] = React.useState<BreakStyle | undefined>(
        undefined
    );
    const [editFocus, setEditFocus] = React.useState(25);
    const [editBreak, setEditBreak] = React.useState(5);

    const selectedISO = toISODate(selectedDate);
    const filteredRaw = blocks.filter((b) => sameISO(b.dateISO, selectedISO));

    const isSelectedToday = sameISO(selectedISO, toISODate(now));
    const nowMin = now.getHours() * 60 + now.getMinutes();

    const timeSorted = filteredRaw.slice().sort((a, b) => {
        const am = timeToMinutes(a.start);
        const bm = timeToMinutes(b.start);

        if (!isSelectedToday) return am - bm;

        const da = (am < nowMin ? am + 1440 : am) - nowMin;
        const db = (bm < nowMin ? bm + 1440 : bm) - nowMin;

        return da !== db ? da - db : am - bm;
    });

    const orderForDay = manualOrderByDate[selectedISO];
    const filtered = orderForDay
        ? timeSorted.slice().sort((a, b) => {
            const ia = orderForDay.indexOf(a.id);
            const ib = orderForDay.indexOf(b.id);

            const aMissing = ia === -1;
            const bMissing = ib === -1;

            if (!aMissing && !bMissing) return ia - ib;
            if (!aMissing && bMissing) return -1;
            if (aMissing && !bMissing) return 1;

            return 0;
        })
        : timeSorted;

    const active = blocks.find((b) => b.id === activeId);

    React.useEffect(() => {
        function onDocClick(e: MouseEvent) {
            const target = e.target as HTMLElement;

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
        return () => document.removeEventListener("mousedown", onDocClick);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [editId]);

    function openMenuFor(block: TimeBlock, anchorEl: HTMLElement) {
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

        setMenuPos({ top, left });
    }

    function openActionMenuFor(block: TimeBlock, anchorEl: HTMLElement) {
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

        setActionPos({ top, left });
    }

    function startEdit(block: TimeBlock) {
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
            breakMin: editStyle ? editBreak : undefined,
        });

        setEditId(null);
    }

    function ensureOrderListForDay() {
        const current = filtered.map((b) => b.id);
        return current;
    }

    // NEW: reorder helpers (enhanced drag)
    function insertIdInList(
        list: string[],
        idToMove: string,
        targetId: string,
        where: "top" | "bottom"
    ) {
        const next = list.slice();
        const from = next.indexOf(idToMove);
        const to = next.indexOf(targetId);
        if (from === -1 || to === -1) return next;
        if (idToMove === targetId) return next;

        next.splice(from, 1);

        const targetIndexAfterRemoval = from < to ? to - 1 : to;
        const insertAt =
            where === "top" ? targetIndexAfterRemoval : targetIndexAfterRemoval + 1;

        next.splice(insertAt, 0, idToMove);
        return next;
    }

    return (
        <aside
            ref={sidebarRef}
            className={`relative z-40 w-full md:w-[400px] border-r flex flex-col backdrop-blur-sm ${isDark
                ? "border-slate-700/50 bg-slate-900/50"
                : "border-slate-200/50 bg-white/50"
                }`}
        >
            <div
                className={`p-6 border-b space-y-4 relative z-10 backdrop-blur-sm ${isDark
                    ? "border-slate-700/50 bg-gradient-to-b from-slate-800/50 to-transparent"
                    : "border-slate-200/50 bg-gradient-to-b from-white/50 to-transparent"
                    }`}
            >
                <div className="flex items-start justify-between gap-3">
                    <div>
                        <h2
                            className={`text-xl font-bold tracking-tight flex items-center gap-2 ${isDark ? "text-slate-100" : "text-slate-900"
                                }`}
                        >
                            <ClockIcon className="w-5 h-5 text-indigo-500" />
                            Today
                        </h2>
                        <p
                            suppressHydrationWarning
                            className={`text-sm mt-1 font-medium ${isDark ? "text-slate-400" : "text-slate-600"
                                }`}
                        >
                            {fmtDateLong(now)} • {fmtClock(now)}
                        </p>
                        <p className={`text-sm mt-1 font-medium ${isDark ? 'text-indigo-300' : 'text-indigo-600'}`}>
                            {greeting}, {username}!
                        </p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                        <span
                            className={`text-xs px-3 py-1.5 rounded-xl border shadow-sm font-bold backdrop-blur-sm ${isDark
                                ? "bg-indigo-950/50 text-indigo-300 border-indigo-800/50"
                                : "bg-indigo-50 text-indigo-700 border-indigo-200"
                                }`}
                        >
                            Tasks
                        </span>
                        <WeatherWidget isDark={isDark} unit={weatherUnit} />
                    </div>
                </div>

                <MiniCalendar
                    selectedDate={selectedDate}
                    onSelectDate={onSelectDate}
                    isDark={isDark}
                />

                <div
                    className={`text-sm rounded-xl p-3 backdrop-blur-sm ${isDark
                        ? "bg-slate-800/30 text-slate-300"
                        : "bg-white/50 text-slate-700"
                        }`}
                >
                    <div className="flex items-center justify-between">
                        <span className="font-semibold">{fmtDateLong(selectedDate)}</span>
                        <span
                            suppressHydrationWarning
                            className={`text-xs px-2 py-1 rounded-lg font-bold ${isDark
                                ? "bg-slate-700/50 text-slate-400"
                                : "bg-slate-100 text-slate-600"
                                }`}
                        >
                            {filtered.length} slots
                        </span>
                    </div>
                </div>
            </div>

            <div className="p-4 space-y-3 overflow-y-auto flex-1">
                {/* Focus Timer Panel - moved to top */}
                <div className="pb-2">
                    <FocusTimerPanel
                        block={active}
                        selectedDate={selectedDate}
                        isDark={isDark}
                    />
                </div>

                {filtered.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`p-6 border-2 border-dashed shadow-sm rounded-2xl text-center backdrop-blur-sm ${isDark
                            ? "border-slate-700/50 bg-slate-800/30"
                            : "border-slate-300/50 bg-white/50"
                            }`}
                    >
                        <CalendarIcon
                            className={`w-12 h-12 mx-auto mb-3 ${isDark ? "text-slate-600" : "text-slate-400"
                                }`}
                        />
                        <p
                            className={`font-bold ${isDark ? "text-slate-300" : "text-slate-700"
                                }`}
                        >
                            No time slots yet
                        </p>
                        <p
                            className={`text-sm mt-1 ${isDark ? "text-slate-500" : "text-slate-600"
                                }`}
                        >
                            Add tasks from the schedule
                        </p>
                    </motion.div>
                ) : (
                    filtered.map((b, index) => {
                        const isActive = b.id === activeId;
                        const isDragging = draggingId === b.id;
                        const isDragOver =
                            dragOverId === b.id && draggingId && draggingId !== b.id;

                        return (
                            <motion.div
                                key={b.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.05 }}
                                draggable
                                onDragStart={(e: any) => {
                                    setDraggingId(b.id);
                                    e.dataTransfer.setData("text/plain", b.id);
                                    e.dataTransfer.effectAllowed = "move";
                                    try {
                                        e.dataTransfer.setDragImage(e.currentTarget, 24, 24);
                                    } catch { }
                                }}
                                onDragEnd={() => {
                                    setDraggingId(null);
                                    setDragOverId(null);
                                    setDragOverEdge(null);
                                }}
                                onDragOverCapture={(e: any) => {
                                    e.preventDefault();
                                    e.dataTransfer.dropEffect = "move";
                                    const rect = (
                                        e.currentTarget as HTMLElement
                                    ).getBoundingClientRect();
                                    const y = e.clientY - rect.top;
                                    const edge: "top" | "bottom" =
                                        y < rect.height / 2 ? "top" : "bottom";
                                    setDragOverId(b.id);
                                    setDragOverEdge(edge);
                                }}
                                onDropCapture={(e: any) => {
                                    e.preventDefault();
                                    const dragId = e.dataTransfer.getData("text/plain");
                                    if (!dragId) return;
                                    if (dragId === b.id) return;

                                    const baseOrder =
                                        manualOrderByDate[selectedISO] ?? ensureOrderListForDay();
                                    const where =
                                        dragOverId === b.id && dragOverEdge ? dragOverEdge : "top";
                                    const nextOrder = insertIdInList(
                                        baseOrder,
                                        dragId,
                                        b.id,
                                        where
                                    );

                                    onSetManualOrderForDate(selectedISO, nextOrder);

                                    setDraggingId(null);
                                    setDragOverId(null);
                                    setDragOverEdge(null);
                                }}
                                whileHover={{ scale: 1.02, x: 4 }}
                                className={[
                                    "relative rounded-2xl border-2 p-4 transition-all duration-200 min-h-[100px] backdrop-blur-sm cursor-move",
                                    isActive
                                        ? isDark
                                            ? "border-indigo-600/50 bg-gradient-to-br from-indigo-950/50 to-purple-950/50 shadow-lg shadow-indigo-900/20"
                                            : "border-indigo-400/50 bg-gradient-to-br from-indigo-50/50 to-purple-50/50 shadow-lg shadow-indigo-200/50"
                                        : isDark
                                            ? "border-slate-700/50 bg-slate-800/30 hover:border-slate-600/50 hover:shadow-md"
                                            : "border-slate-300/50 bg-white/50 hover:border-slate-400/50 hover:shadow-md",
                                    isDragging ? "opacity-50 scale-95" : "",
                                    isDragOver ? "ring-2 ring-indigo-500/50" : "",
                                ].join(" ")}
                                title="Drag to reorder"
                            >
                                {/* Active indicator */}
                                {isActive && (
                                    <motion.div
                                        layoutId="activeIndicator"
                                        className="absolute left-0 top-3 bottom-3 w-1 rounded-r-full bg-gradient-to-b from-indigo-500 to-purple-500"
                                    />
                                )}

                                {/* Drop indicators */}
                                {isDragOver && dragOverEdge === "top" && (
                                    <motion.div
                                        initial={{ scaleX: 0 }}
                                        animate={{ scaleX: 1 }}
                                        className="absolute left-3 right-3 top-1 h-0.5 bg-indigo-500 rounded-full"
                                    />
                                )}
                                {isDragOver && dragOverEdge === "bottom" && (
                                    <motion.div
                                        initial={{ scaleX: 0 }}
                                        animate={{ scaleX: 1 }}
                                        className="absolute left-3 right-3 bottom-1 h-0.5 bg-indigo-500 rounded-full"
                                    />
                                )}

                                <button
                                    draggable={false}
                                    className="w-full text-left"
                                    onClick={() => onSelectBlock(b.id)}
                                    type="button"
                                >
                                    <div className="min-w-0 pr-12">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <div
                                                className={`text-[17px] font-semibold tracking-tight truncate max-w-[230px] ${isDark ? "text-slate-100" : "text-zinc-900"
                                                    }`}
                                                title={b.name}
                                            >
                                                {b.name}
                                            </div>
                                            <StylePill style={b.style} />
                                        </div>
                                        {b.label && (
                                            <div
                                                className={`mt-1.5 text-xs font-medium ${isDark ? "text-indigo-400" : "text-indigo-600"
                                                    }`}
                                            >
                                                <TagIcon className="w-3 h-3 inline mr-1" />
                                                {b.label}
                                            </div>
                                        )}
                                        {b.description && (
                                            <div
                                                className={`mt-1 text-xs line-clamp-2 ${isDark ? "text-slate-400" : "text-zinc-600"
                                                    }`}
                                            >
                                                {b.description}
                                            </div>
                                        )}
                                        <div
                                            className={`mt-2 text-sm ${isDark ? "text-slate-400" : "text-zinc-500"
                                                }`}
                                        >
                                            {formatTime(b.start)} – {formatTime(b.end)}
                                        </div>
                                        <div
                                            className={`mt-1 text-[11px] ${isDark ? "text-slate-500" : "text-zinc-400"
                                                }`}
                                        >
                                            Drag to prioritize
                                        </div>
                                    </div>
                                </button>

                                <div className="absolute top-5 right-5 flex flex-col items-end gap-2">
                                    <button
                                        draggable={false}
                                        data-action-button
                                        onClick={(e) => {
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
                                        }}
                                        className={[
                                            "h-9 w-9 rounded-xl border flex items-center justify-center shadow-sm transition active:scale-[0.98]",
                                            isDark
                                                ? "border-slate-600/50 bg-slate-800/60 text-slate-200 hover:bg-slate-700/70 active:bg-slate-700/80"
                                                : "border-zinc-200 bg-white text-zinc-800 hover:bg-zinc-50 active:bg-zinc-100",
                                        ].join(" ")}
                                        aria-label="More options"
                                        title="More options"
                                        type="button"
                                    >
                                        <DotsIcon className="w-5 h-5 text-current" />
                                    </button>

                                    <button
                                        draggable={false}
                                        data-style-button
                                        onClick={(e) => {
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
                                        }}
                                        className={[
                                            "h-9 w-9 rounded-xl border flex items-center justify-center shadow-sm transition active:scale-[0.98]",
                                            isDark
                                                ? "border-slate-600/50 bg-slate-800/60 text-slate-200 hover:bg-slate-700/70 active:bg-slate-700/80"
                                                : "border-zinc-200 bg-white text-zinc-800 hover:bg-zinc-50 active:bg-zinc-100",
                                        ].join(" ")}
                                        aria-label="Pick focus style"
                                        title="Pick Pomodoro / Deep Focus / Custom"
                                        type="button"
                                    >
                                        <PlusIcon className="w-5 h-5 text-current" />
                                    </button>


                                </div>
                            </motion.div>
                        );
                    })
                )}
            </div>

            {editId ? (
                <div className="fixed inset-0 z-[2147483646] bg-zinc-900/40 backdrop-blur-[2px] flex items-center justify-center p-4">
                    <div
                        data-edit-modal
                        className={`w-full max-w-md rounded-2xl border shadow-2xl ring-1 overflow-hidden ${isDark
                            ? "bg-slate-900 border-slate-700/50 ring-black/20"
                            : "bg-white border-zinc-200 ring-black/5"
                            }`}
                    >
                        <div
                            className={`px-4 py-3 border-b flex items-center justify-between ${isDark ? "border-slate-700/50" : "border-zinc-200"
                                }`}
                        >
                            <div
                                className={`font-semibold tracking-tight ${isDark ? "text-slate-100" : "text-zinc-900"
                                    }`}
                            >
                                Edit time slot
                            </div>
                            <button
                                draggable={false}
                                type="button"
                                className={`text-sm px-2 py-1 rounded-lg border transition shadow-sm ${isDark
                                    ? "border-slate-600/50 text-slate-200 hover:bg-slate-800 active:bg-slate-700"
                                    : "border-zinc-200 hover:bg-zinc-50 active:bg-zinc-100"
                                    }`}
                                onClick={() => setEditId(null)}
                            >
                                Close
                            </button>
                        </div>

                        <div className="p-4 space-y-4">
                            <div>
                                <label
                                    className={`text-sm ${isDark ? "text-slate-300" : "text-zinc-700"
                                        }`}
                                >
                                    Name
                                </label>
                                <input
                                    className={`mt-1 w-full border rounded-xl px-3 py-2 shadow-sm focus:outline-none focus:ring-2 ${isDark
                                        ? "border-slate-600/50 bg-slate-800/50 text-slate-100 placeholder-slate-500 focus:ring-slate-500/50"
                                        : "border-zinc-200 bg-white focus:ring-zinc-900/10"
                                        }`}
                                    value={editName}
                                    onChange={(e) => setEditName(e.target.value)}
                                    placeholder="e.g., CPS209"
                                />
                            </div>

                            <div>
                                <label
                                    className={`text-sm ${isDark ? "text-slate-300" : "text-zinc-700"
                                        }`}
                                >
                                    Label (optional)
                                </label>
                                <input
                                    className={`mt-1 w-full border rounded-xl px-3 py-2 shadow-sm focus:outline-none focus:ring-2 ${isDark
                                        ? "border-slate-600/50 bg-slate-800/50 text-slate-100 placeholder-slate-500 focus:ring-slate-500/50"
                                        : "border-zinc-200 bg-white focus:ring-zinc-900/10"
                                        }`}
                                    value={editLabel}
                                    onChange={(e) => setEditLabel(e.target.value)}
                                    placeholder="e.g., Computer Science, Math"
                                />
                            </div>

                            <div>
                                <label
                                    className={`text-sm ${isDark ? "text-slate-300" : "text-zinc-700"
                                        }`}
                                >
                                    Description (optional)
                                </label>
                                <textarea
                                    className={`mt-1 w-full border rounded-xl px-3 py-2 shadow-sm focus:outline-none focus:ring-2 resize-none ${isDark
                                        ? "border-slate-600/50 bg-slate-800/50 text-slate-100 placeholder-slate-500 focus:ring-slate-500/50"
                                        : "border-zinc-200 bg-white focus:ring-zinc-900/10"
                                        }`}
                                    value={editDescription}
                                    onChange={(e) => setEditDescription(e.target.value)}
                                    placeholder="Add notes about this task..."
                                    rows={2}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label
                                        className={`text-sm ${isDark ? "text-slate-300" : "text-zinc-700"
                                            }`}
                                    >
                                        Start
                                    </label>
                                    <input
                                        className={`mt-1 w-full border rounded-xl px-3 py-2 shadow-sm focus:outline-none focus:ring-2 ${isDark
                                            ? "border-slate-600/50 bg-slate-800/50 text-slate-100 focus:ring-slate-500/50"
                                            : "border-zinc-200 bg-white focus:ring-zinc-900/10"
                                            }`}
                                        type="time"
                                        value={editStart}
                                        onChange={(e) => setEditStart(e.target.value)}
                                    />
                                </div>

                                <div>
                                    <label
                                        className={`text-sm ${isDark ? "text-slate-300" : "text-zinc-700"
                                            }`}
                                    >
                                        End
                                    </label>
                                    <input
                                        className={`mt-1 w-full border rounded-xl px-3 py-2 shadow-sm focus:outline-none focus:ring-2 ${isDark
                                            ? "border-slate-600/50 bg-slate-800/50 text-slate-100 focus:ring-slate-500/50"
                                            : "border-zinc-200 bg-white focus:ring-zinc-900/10"
                                            }`}
                                        type="time"
                                        value={editEnd}
                                        onChange={(e) => setEditEnd(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div
                                className={`rounded-2xl border overflow-hidden shadow-sm ${isDark ? "border-slate-700/50" : "border-green-200"
                                    }`}
                            >
                                <div
                                    className={`px-3 py-2 border-b text-sm font-medium ${isDark
                                        ? "border-slate-700/50 text-slate-200 bg-slate-800/30"
                                        : "border-green-200 text-green-900"
                                        }`}
                                >
                                    Study method
                                </div>

                                <button
                                    draggable={false}
                                    type="button"
                                    className={`w-full text-left px-3 py-2 transition ${editStyle === "Pomodoro"
                                        ? isDark
                                            ? "bg-rose-900/30"
                                            : "bg-rose-50"
                                        : isDark
                                            ? "hover:bg-slate-800"
                                            : "hover:bg-zinc-50 active:bg-zinc-100/70"
                                        }`}
                                    onClick={() => {
                                        setEditStyle("Pomodoro");
                                        setEditFocus(25);
                                        setEditBreak(5);
                                    }}
                                >
                                    <div
                                        className={`text-sm font-medium ${isDark ? "text-rose-400" : "text-rose-900"
                                            }`}
                                    >
                                        Pomodoro
                                    </div>
                                    <div
                                        className={`text-xs ${isDark ? "text-slate-400" : "text-zinc-500"
                                            }`}
                                    >
                                        25/5
                                    </div>
                                </button>

                                <button
                                    draggable={false}
                                    type="button"
                                    className={`w-full text-left px-3 py-2 transition border-t ${isDark ? "border-slate-700/50" : "border-green-200"
                                        } ${editStyle === "Deep Focus"
                                            ? isDark
                                                ? "bg-green-900/30"
                                                : "bg-green-50"
                                            : isDark
                                                ? "hover:bg-slate-800"
                                                : "hover:bg-zinc-50 active:bg-green-100/70"
                                        }`}
                                    onClick={() => {
                                        setEditStyle("Deep Focus");
                                        setEditFocus(52);
                                        setEditBreak(17);
                                    }}
                                >
                                    <div
                                        className={`text-sm font-medium ${isDark ? "text-green-400" : "text-green-700"
                                            }`}
                                    >
                                        Deep Focus
                                    </div>
                                    <div
                                        className={`text-xs ${isDark ? "text-slate-400" : "text-black-500"
                                            }`}
                                    >
                                        52/17
                                    </div>
                                </button>

                                <div
                                    className={`border-t p-3 ${isDark ? "border-slate-700/50" : "border-zinc-200"
                                        } ${editStyle === "Custom"
                                            ? isDark
                                                ? "bg-slate-800/50"
                                                : "bg-zinc-50"
                                            : ""
                                        }`}
                                >
                                    <button
                                        draggable={false}
                                        type="button"
                                        className="w-full text-left"
                                        onClick={() => {
                                            setEditStyle("Custom");
                                        }}
                                    >
                                        <div
                                            className={`text-sm font-medium ${isDark ? "text-slate-100" : "text-zinc-900"
                                                }`}
                                        >
                                            Custom
                                        </div>
                                        <div
                                            className={`text-xs ${isDark ? "text-slate-400" : "text-zinc-500"
                                                }`}
                                        >
                                            Choose your own minutes
                                        </div>
                                    </button>

                                    <div className="mt-3 grid grid-cols-2 gap-2">
                                        <div>
                                            <label
                                                className={`text-xs font-medium ${isDark ? "text-green-400" : "text-green-700"
                                                    }`}
                                            >
                                                Study (min)
                                            </label>
                                            <input
                                                className={`mt-1 w-full border rounded-lg px-2 py-1.5 text-sm shadow-sm focus:outline-none focus:ring-2 ${isDark
                                                    ? "border-slate-600/50 bg-slate-800/50 text-slate-100 focus:ring-slate-500/50"
                                                    : "border-zinc-200 bg-white focus:ring-zinc-900/10"
                                                    }`}
                                                type="number"
                                                min="1"
                                                value={editFocus}
                                                onChange={(e) =>
                                                    setEditFocus(
                                                        Math.max(1, parseInt(e.target.value) || 1)
                                                    )
                                                }
                                                disabled={editStyle !== "Custom"}
                                            />
                                        </div>

                                        <div>
                                            <label
                                                className={`text-xs font-medium ${isDark ? "text-sky-400" : "text-sky-700"
                                                    }`}
                                            >
                                                Break (min)
                                            </label>
                                            <input
                                                className={`mt-1 w-full border rounded-lg px-2 py-1.5 text-sm shadow-sm focus:outline-none focus:ring-2 ${isDark
                                                    ? "border-slate-600/50 bg-slate-800/50 text-slate-100 focus:ring-slate-500/50"
                                                    : "border-zinc-200 bg-white focus:ring-zinc-900/10"
                                                    }`}
                                                type="number"
                                                min="1"
                                                value={editBreak}
                                                onChange={(e) =>
                                                    setEditBreak(
                                                        Math.max(1, parseInt(e.target.value) || 1)
                                                    )
                                                }
                                                disabled={editStyle !== "Custom"}
                                            />
                                        </div>
                                    </div>

                                    {!editStyle && (
                                        <div
                                            className={`mt-2 text-xs ${isDark ? "text-slate-400" : "text-zinc-500"
                                                }`}
                                        >
                                            No method selected
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="flex gap-2">
                                <button
                                    draggable={false}
                                    type="button"
                                    className={`flex-1 px-4 py-2 rounded-xl border transition shadow-sm ${isDark
                                        ? "border-slate-600/50 text-slate-200 hover:bg-slate-800 active:bg-slate-700"
                                        : "border-zinc-200 hover:bg-zinc-50 active:bg-zinc-100"
                                        }`}
                                    onClick={() => setEditId(null)}
                                >
                                    Cancel
                                </button>
                                <button
                                    draggable={false}
                                    type="button"
                                    className={`px-4 py-2 rounded-xl shadow-sm active:scale-[0.99] ${isDark
                                        ? "bg-slate-100 text-slate-900 hover:opacity-90"
                                        : "bg-zinc-900 text-white hover:opacity-90"
                                        }`}
                                    onClick={applyEdit}
                                >
                                    Save changes
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            ) : null}

            {/* Moved Action Menu */}
            {actionFor && actionPos && (() => {
                const actionBlock = filtered.find(b => b.id === actionFor);
                if (!actionBlock) return null;
                return (
                    <div
                        data-action-menu
                        className={`absolute w-[180px] z-[2147483647] rounded-2xl border shadow-2xl ring-1 overflow-hidden ${isDark
                            ? "border-slate-700/50 bg-slate-900 ring-black/20"
                            : "border-zinc-200 bg-white ring-black/5"
                            }`}
                        style={{ top: actionPos.top, left: actionPos.left }}
                    >
                        <button
                            draggable={false}
                            type="button"
                            className={`w-full text-left px-3 py-2 transition ${isDark
                                ? "hover:bg-slate-800 active:bg-slate-700"
                                : "hover:bg-zinc-50 active:bg-zinc-100/70"
                                }`}
                            onClick={() => {
                                setActionFor(null);
                                setActionPos(null);
                                startEdit(actionBlock);
                            }}
                        >
                            <div
                                className={`text-sm font-medium ${isDark ? "text-slate-100" : "text-zinc-900"
                                    }`}
                            >
                                Edit
                            </div>
                            <div
                                className={`text-xs ${isDark ? "text-slate-400" : "text-zinc-500"
                                    }`}
                            >
                                Change name, time, and method
                            </div>
                        </button>

                        <div
                            className={`border-t ${isDark ? "border-slate-700/50" : "border-zinc-200"
                                }`}
                        />

                        <button
                            draggable={false}
                            type="button"
                            className={`w-full text-left px-3 py-2 transition ${isDark
                                ? "hover:bg-rose-900/40 active:bg-rose-900/60"
                                : "hover:bg-rose-50 active:bg-rose-100/60"
                                }`}
                            onClick={() => {
                                onDeleteBlock(actionBlock.id);
                                setActionFor(null);
                                setActionPos(null);
                                if (menuFor === actionBlock.id) {
                                    setMenuFor(null);
                                    setMenuPos(null);
                                }

                                const cur = manualOrderByDate[selectedISO];
                                if (cur && cur.length) {
                                    onSetManualOrderForDate(
                                        selectedISO,
                                        cur.filter((x) => x !== actionBlock.id)
                                    );
                                }
                            }}
                        >
                            <div className="text-sm font-medium text-rose-700">
                                Delete
                            </div>
                            <div
                                className={`text-xs ${isDark ? "text-slate-400" : "text-zinc-500"
                                    }`}
                            >
                                Remove this time slot
                            </div>
                        </button>
                    </div>
                );
            })()}

            {/* Moved Style Menu */}
            {menuFor && menuPos && (() => {
                const menuBlock = filtered.find(b => b.id === menuFor);
                if (!menuBlock) return null;
                return (
                    <div
                        data-style-menu
                        className={`absolute w-56 z-[2147483647] rounded-2xl border shadow-2xl ring-1 overflow-hidden ${isDark
                            ? "border-slate-700/50 bg-slate-900 ring-black/20"
                            : "border-zinc-200 bg-white ring-black/5"
                            }`}
                        style={{ top: menuPos.top, left: menuPos.left }}
                    >
                        <MenuItem
                            label="Pomodoro"
                            sub="25 minutes study 5 minutes break"
                            isDark={isDark}
                            onClick={() => {
                                onPickStyle(menuBlock.id, "Pomodoro");
                                onSetCustomMinutes(menuBlock.id, 25, 5);
                                setMenuFor(null);
                                setMenuPos(null);
                            }}
                        />

                        <MenuItem
                            label="Deep Focus"
                            sub="52 minutes study 17 minutes break"
                            isDark={isDark}
                            onClick={() => {
                                onPickStyle(menuBlock.id, "Deep Focus");
                                onSetCustomMinutes(menuBlock.id, 52, 17);
                                setMenuFor(null);
                                setMenuPos(null);
                            }}
                        />

                        <div
                            className={`border-t p-3 ${isDark ? "border-slate-700/50" : "border-zinc-200"
                                }`}
                        >
                            <button
                                draggable={false}
                                className="w-full text-left"
                                type="button"
                                onClick={() => {
                                    onPickStyle(menuBlock.id, "Custom");
                                }}
                            >
                                <div className={`text-sm font-medium ${isDark ? "text-slate-100" : "text-zinc-900"}`}>
                                    Custom
                                </div>
                                <div className={`text-xs ${isDark ? "text-slate-400" : "text-zinc-500"}`}>
                                    Choose your own minutes
                                </div>
                            </button>

                            <div className="mt-3 grid grid-cols-2 gap-2">
                                <div>
                                    <label className={`text-xs ${isDark ? "text-green-400" : "text-green-600"}`}>
                                        Study (min)
                                    </label>
                                    <input
                                        type="number"
                                        min={1}
                                        max={300}
                                        value={customFocus}
                                        onChange={(e) =>
                                            setCustomFocus(Number(e.target.value))
                                        }
                                        className={`mt-1 w-full border rounded-xl px-2 py-1 text-sm shadow-sm focus:outline-none focus:ring-2 ${isDark
                                            ? "border-slate-600/50 bg-slate-800 text-slate-100 focus:ring-slate-500/50"
                                            : "border-zinc-200 bg-white focus:ring-zinc-900/10"
                                            }`}
                                    />
                                </div>

                                <div>
                                    <label className={`text-xs ${isDark ? "text-blue-400" : "text-blue-600"}`}>
                                        Break (min)
                                    </label>
                                    <input
                                        type="number"
                                        min={1}
                                        max={120}
                                        value={customBreak}
                                        onChange={(e) =>
                                            setCustomBreak(Number(e.target.value))
                                        }
                                        className={`mt-1 w-full border rounded-xl px-2 py-1 text-sm shadow-sm focus:outline-none focus:ring-2 ${isDark
                                            ? "border-slate-600/50 bg-slate-800 text-slate-100 focus:ring-slate-500/50"
                                            : "border-zinc-200 bg-white focus:ring-zinc-900/10"
                                            }`}
                                    />
                                </div>
                            </div>

                            <button
                                draggable={false}
                                type="button"
                                className={`mt-3 w-full rounded-xl py-2 text-sm shadow-sm transition-all hover:opacity-90 active:scale-[0.99] ${isDark
                                    ? "bg-indigo-600 text-white border border-indigo-500/50 hover:bg-indigo-500"
                                    : "bg-zinc-900 text-white hover:bg-zinc-800"
                                    }`}
                                onClick={() => {
                                    const f = Math.max(
                                        1,
                                        Math.min(300, Math.floor(customFocus))
                                    );
                                    const br = Math.max(
                                        1,
                                        Math.min(120, Math.floor(customBreak))
                                    );
                                    onPickStyle(menuBlock.id, "Custom");
                                    onSetCustomMinutes(menuBlock.id, f, br);
                                    setMenuFor(null);
                                    setMenuPos(null);
                                }}
                            >
                                Save custom minutes
                            </button>
                        </div>
                    </div>
                );
            })()}
        </aside>
    );
}
export default function Home() {
    const router = useRouter();
    const [isCheckingAuth, setIsCheckingAuth] = useState(true);

    useEffect(() => {
        // Simple "Auth" check: do we have a username?
        const username = localStorage.getItem("preptime-username");
        if (!username) {
            router.push("/login");
        } else {
            setIsCheckingAuth(false);
        }
    }, []);

    const handleImportComplete = (events: any[]) => {
        // Logic to merge imported events into existing tasks/blocks
        // For now, we'll just log them or alert
        console.log("Imported events:", events);

        // Transform and add to tasks (simplified mapping)
        const newTasks = events.map(e => ({
            id: e.id,
            title: e.title,
            // Mapping logic needs to be robust for dates but for now...
            date: e.startValue ? e.startValue.split('T')[0] : new Date().toISOString().split('T')[0],
            startHour: 9, // Default
            endHour: 10, // Default
            description: "Imported Event",
            isHeavy: false,
            completed: false,
            label: "Imported",
            day: new Date(e.startValue || new Date()).getDay(),
            color: "bg-blue-500"
        }));

        setTasks(prev => [...prev, ...newTasks]);
        localStorage.setItem("preptime-imported", "true");
    };

    // ... existing state initialization ...
    const [currentDate, setCurrentDate] = useState<Date>(new Date());
    const [currentMonday, setCurrentMonday] = useState<Date>(
        getMonday(new Date())
    );
    const [selectedDateIndex, setSelectedDateIndex] = useState<number | null>(
        null
    );
    const [showModal, setShowModal] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const [selectedSlot, setSelectedSlot] = useState<{
        day: number;
        hour: number;
        date: Date;
    } | null>(null);
    const [taskTitle, setTaskTitle] = useState("");
    const [taskLabel, setTaskLabel] = useState("");
    const [taskDescription, setTaskDescription] = useState("");
    const [startTime, setStartTime] = useState("09:00");
    const [startAmPm, setStartAmPm] = useState("AM");
    const [endTime, setEndTime] = useState("10:00");
    const [endAmPm, setEndAmPm] = useState("AM");
    const [selectedColor, setSelectedColor] = useState(taskColors[0]);
    const [theme, setTheme] = useState<"system" | "light" | "dark">("system");
    const [isDark, setIsDark] = useState(false);
    const [viewType, setViewType] = useState<ViewType>("week");
    const [tasks, setTasks] = useState<Task[]>([]);

    // Removed 'now' state and interval here to prevent frequent re-renders of the whole page.
    // Time is now managed locally in Sidebar, FocusTimerPanel, and ModernSchedule.

    const [selectedDate, setSelectedDate] = React.useState(() => new Date());

    const [blocks, setBlocks] = React.useState<TimeBlock[]>([]);
    const [activeId, setActiveId] = React.useState<string | undefined>(undefined);

    const [manualOrderByDate, setManualOrderByDate] = React.useState<
        Record<string, string[]>
    >({});

    const [preferences, setPreferences] = useState<Preferences>({
        dayStartHour: 7,
        dayEndHour: 23,
        slotStepMin: 15,
        bufferMin: 5,
        maxHeavyPerDay: 3,
        weatherUnit: 'celsius'
    });

    const [isLoaded, setIsLoaded] = React.useState(false);

    // Save blocks to localStorage whenever they change
    React.useEffect(() => {
        if (!isLoaded) return;
        if (typeof window !== "undefined") {
            localStorage.setItem("preptime-blocks", JSON.stringify(blocks));
        }
    }, [blocks, isLoaded]);

    // Persist activeId
    React.useEffect(() => {
        if (!isLoaded) return;
        if (activeId) {
            localStorage.setItem("preptime-active-id", activeId);
        } else {
            localStorage.removeItem("preptime-active-id");
        }
    }, [activeId, isLoaded]);

    // Persist selectedDate
    React.useEffect(() => {
        if (!isLoaded) return;
        localStorage.setItem("preptime-selected-date", selectedDate.toISOString());
    }, [selectedDate, isLoaded]);

    // Persist preferences
    React.useEffect(() => {
        if (!isLoaded) return;
        localStorage.setItem("preptime-preferences", JSON.stringify(preferences));
    }, [preferences, isLoaded]);
    function selectDateEverywhere(d: Date) {
        const nd = new Date(d);
        nd.setHours(0, 0, 0, 0);

        setSelectedDate(nd);
        setCurrentDate(nd);

        const mon = getMonday(nd);
        setCurrentMonday(mon);

        // If we are in week view, keep the highlight index aligned to the chosen date
        if (viewType === "week") {
            const diffDays = Math.round(
                (nd.getTime() - mon.getTime()) / (1000 * 60 * 60 * 24)
            );
            const safe = Math.max(0, Math.min(6, diffDays));
            setSelectedDateIndex(safe);
        } else {
            setSelectedDateIndex(null);
        }
    }

    useEffect(() => {
        const savedBlocks = localStorage.getItem("preptime-blocks");
        const savedOrder = localStorage.getItem("preptime-block-order");

        if (savedBlocks) setBlocks(JSON.parse(savedBlocks));
        if (savedOrder) setManualOrderByDate(JSON.parse(savedOrder));

        const savedActiveId = localStorage.getItem("preptime-active-id");
        if (savedActiveId) {
            // Verify block exists before restoring
            let parsedBlocks: any[] = [];
            try {
                parsedBlocks = savedBlocks ? JSON.parse(savedBlocks) : [];
            } catch (e) {
                console.error("Error parsing saved blocks for activeId verification", e);
            }
            const exists = parsedBlocks.some((b: any) => b.id === savedActiveId);
            if (exists) setActiveId(savedActiveId);
        }

        const savedDate = localStorage.getItem("preptime-selected-date");
        if (savedDate) {
            const date = new Date(savedDate);
            if (!isNaN(date.getTime())) {
                selectDateEverywhere(date);
            }
        }

        const savedTheme = localStorage.getItem("preptime-theme") as
            | "system"
            | "light"
            | "dark"
            | null;
        const savedView = localStorage.getItem("preptime-view") as ViewType | null;
        const savedTasks = localStorage.getItem("preptime-tasks");
        const savedPrefs = localStorage.getItem("preptime-preferences");

        if (savedPrefs) {
            try {
                setPreferences(JSON.parse(savedPrefs));
            } catch (e) {
                console.error("Error parsing preferences", e);
            }
        }

        if (savedTheme) setTheme(savedTheme);
        if (savedView) setViewType(savedView);
        if (savedTasks) {
            const parsed = JSON.parse(savedTasks);
            const updated = parsed.map((t: any) => ({
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
                completed: t.completed ?? false,
            }));

            setTasks(updated);

            // Auto-save the fixed data immediately so bug doesn't recur
            localStorage.setItem("preptime-tasks", JSON.stringify(updated));
        }
        setIsLoaded(true);
    }, []);


    useEffect(() => {
        if (!isLoaded) return;
        localStorage.setItem(
            "preptime-block-order",
            JSON.stringify(manualOrderByDate)
        );
    }, [manualOrderByDate, isLoaded]);

    useEffect(() => {
        const updateTheme = () => {
            if (theme === "system") {
                const prefersDark = window.matchMedia(
                    "(prefers-color-scheme: dark)"
                ).matches;
                setIsDark(prefersDark);
            } else {
                setIsDark(theme === "dark");
            }
        };

        updateTheme();

        const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
        const handler = () => {
            if (theme === "system") updateTheme();
        };

        mediaQuery.addEventListener("change", handler);
        return () => mediaQuery.removeEventListener("change", handler);
    }, [theme]);

    const handleThemeChange = (newTheme: "system" | "light" | "dark") => {
        setTheme(newTheme);
        localStorage.setItem("preptime-theme", newTheme);
    };

    const handleViewChange = (newView: ViewType) => {
        setViewType(newView);
        localStorage.setItem("preptime-view", newView);
    };

    const toggleTaskCompletion = (taskId: string, e?: React.MouseEvent) => {
        if (e) e.stopPropagation();
        const updated = tasks.map((task) =>
            task.id === taskId ? { ...task, completed: !task.completed } : task
        );
        setTasks(updated);
        localStorage.setItem("preptime-tasks", JSON.stringify(updated));
    };

    const deleteTask = (taskId: string, e: React.MouseEvent) => {
        e.stopPropagation();
        const updated = tasks.filter((task) => task.id !== taskId);
        setTasks(updated);
        localStorage.setItem("preptime-tasks", JSON.stringify(updated));
    };
    function pickStyle(id: string, style: BreakStyle) {
        setBlocks((prev) => prev.map((b) => (b.id === id ? { ...b, style } : b)));
    }

    function onSetCustomMinutes(id: string, focusMin: number, breakMin: number) {
        setBlocks((prev) =>
            prev.map((b) => (b.id === id ? { ...b, focusMin, breakMin } : b))
        );
    }

    function updateBlock(id: string, patch: Partial<TimeBlock>) {
        setBlocks((prev) =>
            prev.map((b) => (b.id === id ? { ...b, ...patch } : b))
        );
    }

    function deleteSlot(id: string) {
        setBlocks((prev) => prev.filter((b) => b.id !== id));
        setActiveId((prev) => (prev === id ? undefined : prev));

        setManualOrderByDate((prev) => {
            const next: Record<string, string[]> = { ...prev };
            Object.keys(next).forEach((day) => {
                next[day] = next[day].filter((x) => x !== id);
                if (next[day].length === 0) delete next[day];
            });
            return next;
        });
    }

    const getTaskStats = () => {
        const completed = tasks.filter((t) => t.completed).length;
        const remaining = tasks.length - completed;
        return { total: tasks.length, completed, remaining };
    };

    const goToPrev = () => {
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

    const goToNext = () => {
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

    const getViewTitle = () => {
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

    const handleDateClick = (index: number) => {
        const nextIndex = index === selectedDateIndex ? null : index;
        setSelectedDateIndex(nextIndex);

        if (nextIndex !== null) {
            const d = addDays(currentMonday, nextIndex);
            selectDateEverywhere(d);
        }
    };

    const goToDayView = (date: Date) => {
        const d = new Date(date);
        d.setHours(0, 0, 0, 0);
        setCurrentDate(d);
        selectDateEverywhere(d);
        setSelectedDateIndex(null);
        setViewType("day");
        localStorage.setItem("preptime-view", "day");
    };

    const handleSlotClick = (
        day: number,
        hour: number,
        date: Date,
        e?: React.MouseEvent
    ) => {
        selectDateEverywhere(date);

        if (e) {
            e.stopPropagation();
        }
        setSelectedSlot({ day, hour, date });

        // Set time input values safely
        setStartTime(hourToTimeString(hour));
        setStartAmPm(hourToAmPm(hour));
        setEndTime(hourToTimeString(hour + 1));
        setEndAmPm(hourToAmPm(hour + 1));

        setSelectedColor(taskColors[0]);
        setShowModal(true);
    };

    const closeModal = () => {
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

    const saveTask = () => {
        if (!selectedSlot) return;

        // Use normalizeHour24 to ensure we never save bugged >24 hours
        const startHourNum = normalizeHour24(
            timeStringToHour(startTime, startAmPm)
        );
        const endHourNum = normalizeHour24(timeStringToHour(endTime, endAmPm));

        // Safety check just in case
        if (endHourNum <= startHourNum) {
            alert("End time must be after start time");
            return;
        }

        const newTask: Task = {
            id: Date.now().toString(),
            title: taskTitle,
            label: taskLabel,
            description: taskDescription,
            day: selectedSlot.day,
            date: formatDateKey(selectedSlot.date),
            startHour: startHourNum,
            endHour: endHourNum,
            color: selectedColor.value,
            completed: false,
        };

        const updatedTasks = [...tasks, newTask];
        setTasks(updatedTasks);
        localStorage.setItem("preptime-tasks", JSON.stringify(updatedTasks));

        // ALSO create a TimeBlock so the Sidebar isn't empty
        const newBlockId = uid();
        const newBlock: TimeBlock = {
            id: newBlockId,
            name: taskTitle.trim() || "Untitled",
            dateISO: toISODate(selectedSlot.date),
            start: startTime, // "HH:MM"
            end: endTime, // "HH:MM"
            // style undefined -> FocusTimerPanel will treat it as full-block study
        };

        setBlocks((prev) => [newBlock, ...prev]);
        setActiveId(newBlockId);

        // ensure sidebar shows the correct day immediately
        selectDateEverywhere(selectedSlot.date);

        // keep manual order for that day (put new one at top)
        const dayISO = toISODate(selectedSlot.date);
        setManualOrderByDate((prev) => {
            const existing = prev[dayISO] ?? [];
            return {
                ...prev,
                [dayISO]: [newBlockId, ...existing.filter((x) => x !== newBlockId)],
            };
        });

        closeModal();
    };

    const isValidTime = () => {
        const startHourNum = timeStringToHour(startTime, startAmPm);
        const endHourNum = timeStringToHour(endTime, endAmPm);
        // Use relaxed validation for UI, strict validation on save
        // Simple check: ensure they aren't equal if it's the same day logic
        return endHourNum > startHourNum || (endHourNum === 0 && startHourNum > 0);
    };

    const renderTaskBlock = (task: Task, date: Date) => {
        // Safety: ensure reasonable bounds for render
        const start = Math.max(startHour, Math.min(endHour, task.startHour));
        const end = Math.max(startHour, Math.min(endHour, task.endHour));

        if (end <= start) return null; // Don't render invalid blocks

        const duration = end - start;
        const heightInRows = duration;

        const startTimeDisplay = formatHour(task.startHour);
        const endTimeDisplay = formatHour(task.endHour);

        return (
            <motion.div
                key={task.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{
                    scale: 1.03,
                    zIndex: 50,
                    boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.15), 0 10px 10px -5px rgba(0, 0, 0, 0.08)",
                    filter: "brightness(1.08)"
                }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
                onClick={(e: React.MouseEvent) => {
                    e.stopPropagation();
                    toggleTaskCompletion(task.id);
                }}
                className={`absolute pointer-events-auto ${task.color
                    } border-l-4 border-opacity-80 rounded-r ${heightInRows < 0.5 ? 'px-1 py-0.5' : 'px-2 py-1'} text-xs font-medium text-white overflow-hidden cursor-pointer z-10 shadow-sm group ${task.completed ? "opacity-50" : ""
                    }`}
                style={{
                    top: `${(start - startHour) * 3.5}rem`,
                    height: `${heightInRows * 3.5}rem`,
                    left: "2px",
                    right: "2px",
                    borderLeftColor: "rgba(0,0,0,0.2)",
                    transformOrigin: "center left",
                }}
                title={`${task.title}${task.label ? " - " + task.label : ""} ${task.completed ? "(Completed)" : ""
                    }`}
            >
                <div className="flex items-start justify-between gap-1">
                    <div className="flex-1 overflow-hidden">
                        <div
                            className={`font-semibold truncate flex items-center gap-1 ${task.completed ? "line-through" : ""
                                }`}
                        >
                            {task.completed && <span className="text-xs">✓</span>}
                            {task.title}
                        </div>
                        {task.label && (
                            <div className="text-[10px] opacity-90 truncate">
                                {task.label}
                            </div>
                        )}
                        <div className="text-[10px] opacity-80">
                            {startTimeDisplay} - {endTimeDisplay}
                        </div>
                    </div>
                    <button
                        onClick={(e) => deleteTask(task.id, e)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 hover:bg-white/20 rounded"
                        title="Delete task"
                    >
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                            <path
                                fillRule="evenodd"
                                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                                clipRule="evenodd"
                            />
                        </svg>
                    </button>
                </div>
            </motion.div>
        );
    };

    const renderDayView = () => {
        const isToday = currentDate.toDateString() === new Date().toDateString();
        const dayTasks = tasks.filter(
            (task) => task.date === formatDateKey(currentDate)
        );

        return (
            <div className="overflow-x-auto">
                <div className="min-w-[600px]">
                    <div
                        className={`grid grid-cols-[70px_1fr] border-b-2 sticky top-0 z-10 ${isDark
                            ? "bg-slate-800 border-slate-600"
                            : "bg-white border-slate-300"
                            }`}
                    >
                        <div
                            className={`p-3 text-xs font-semibold ${isDark ? "text-slate-400" : "text-slate-500"
                                }`}
                        ></div>
                        <div
                            className={`p-3 text-center ${isDark ? "text-slate-200" : "text-slate-700"
                                }`}
                        >
                            <div className="text-xs font-semibold uppercase tracking-wide mb-1">
                                {daysFull[currentDate.getDay()]}
                            </div>
                            <div
                                className={`text-2xl font-bold ${isToday ? "text-indigo-600" : ""
                                    }`}
                            >
                                {currentDate.getDate()}
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-[70px_1fr] relative">
                        {Array.from({ length: endHour - startHour }).map((_, row) => {
                            const hour = startHour + row;

                            return (
                                <React.Fragment key={`day-row-${hour}`}>
                                    <div
                                        className={`px-2 py-3 text-xs text-right border-b ${isDark
                                            ? "text-slate-400 bg-slate-700 border-slate-600"
                                            : "text-slate-500 bg-slate-50 border-slate-200"
                                            }`}
                                    >
                                        {formatHour(hour)}
                                    </div>

                                    <div
                                        onClick={(e) => handleSlotClick(0, hour, currentDate, e)}
                                        className={`h-14 border-b transition-all cursor-pointer relative group ${isDark
                                            ? "border-slate-700 hover:bg-indigo-900/30"
                                            : "border-slate-200 hover:bg-indigo-50"
                                            }`}
                                    >
                                        <button
                                            onClick={(e) => handleSlotClick(0, hour, currentDate, e)}
                                            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity flex items-start justify-end p-1 z-20"
                                        >
                                            <div
                                                className={`text-xs font-bold rounded px-1 shadow-sm border ${isDark
                                                    ? "text-indigo-400 bg-slate-800 border-indigo-700"
                                                    : "text-indigo-600 bg-white border-indigo-200"
                                                    }`}
                                            >
                                                +
                                            </div>
                                        </button>
                                    </div>
                                </React.Fragment>
                            );
                        })}

                        <div className="absolute top-0 left-[80px] right-0 bottom-0 pointer-events-auto">
                            {dayTasks.map((task) => renderTaskBlock(task, currentDate))}
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    const renderWeekView = () => {
        const weekDates = Array.from({ length: 7 }, (_, i) =>
            addDays(currentMonday, i)
        );

        return (
            <div className="overflow-x-auto">
                <div className="min-w-[900px]">
                    {/* Modern Header with Days */}
                    <div
                        className={`grid [grid-template-columns:80px_repeat(7,1fr)] sticky top-0 z-10 backdrop-blur-md border-b ${isDark
                            ? "bg-slate-900/90 border-slate-700/50"
                            : "bg-white/90 border-slate-200/50"
                            }`}
                    >
                        <div className="p-4"></div>

                        {weekDates.map((date, i) => {
                            const isToday = date.toDateString() === new Date().toDateString();
                            const isSelected = selectedDateIndex === i;

                            return (
                                <motion.div
                                    key={i}
                                    whileHover={{ scale: 1.02, y: -2 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => handleDateClick(i)}
                                    className={`p-4 text-center border-l first:border-l-0 cursor-pointer transition-all duration-200 ${isSelected
                                        ? "bg-gradient-to-br from-indigo-600 to-purple-600 shadow-lg"
                                        : isDark
                                            ? "border-slate-700/50 hover:bg-slate-800/50"
                                            : "border-slate-200/50 hover:bg-slate-50"
                                        }`}
                                >
                                    <div
                                        className={`text-xs font-bold uppercase tracking-wider mb-2 ${isSelected
                                            ? "text-indigo-100"
                                            : isDark
                                                ? "text-slate-400"
                                                : "text-slate-500"
                                            }`}
                                    >
                                        {days[i]}
                                    </div>

                                    <div
                                        className={`text-xl font-bold ${isToday && !isSelected
                                            ? "bg-gradient-to-br from-indigo-500 to-purple-500 text-white w-10 h-10 rounded-2xl flex items-center justify-center mx-auto shadow-lg shadow-indigo-500/30"
                                            : isSelected
                                                ? "text-white"
                                                : isDark
                                                    ? "text-slate-200"
                                                    : "text-slate-700"
                                            }`}
                                    >
                                        {date.getDate()}
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>

                    {/* Time Grid with Modern Styling */}
                    <div className="grid [grid-template-columns:80px_repeat(7,1fr)] relative">
                        {Array.from({ length: endHour - startHour }).map((_, row) => {
                            const hour = startHour + row;
                            const isBusinessHours = hour >= 9 && hour <= 17;

                            return (
                                <React.Fragment key={`week-row-${hour}`}>
                                    <div
                                        className={`px-3 py-4 text-sm font-semibold text-right border-b flex items-center justify-end ${isDark
                                            ? "text-slate-400 bg-slate-800/30 border-slate-700/30"
                                            : "text-slate-600 bg-slate-50/50 border-slate-200/30"
                                            }`}
                                    >
                                        <div
                                            className={`${isBusinessHours
                                                ? "text-indigo-600 dark:text-indigo-400"
                                                : ""
                                                }`}
                                        >
                                            {formatHour(hour)}
                                        </div>
                                    </div>

                                    {weekDates.map((date, col) => {
                                        const isToday =
                                            date.toDateString() === new Date().toDateString();
                                        const isSelected = selectedDateIndex === col;

                                        // Check if any task occupies this slot to prevent button overlap
                                        const hasTask = tasks.some(t =>
                                            t.date === formatDateKey(date) &&
                                            t.startHour <= hour &&
                                            t.endHour > hour
                                        );

                                        return (
                                            <motion.div
                                                key={`${col}-${hour}`}
                                                whileHover={{ scale: 1.01 }}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    selectDateEverywhere(date);
                                                }}
                                                className={`h-14 border-l border-b transition-all duration-200 cursor-pointer relative group ${isSelected
                                                    ? isDark
                                                        ? "bg-indigo-950/40 border-indigo-800/30 hover:bg-indigo-900/50"
                                                        : "bg-indigo-50/50 border-indigo-200/50 hover:bg-indigo-100/50"
                                                    : isToday
                                                        ? isDark
                                                            ? "bg-blue-950/20 border-slate-700/30 hover:bg-indigo-950/30"
                                                            : "bg-blue-50/30 border-slate-200/30 hover:bg-indigo-50/50"
                                                        : isDark
                                                            ? "border-slate-800/30 hover:bg-slate-800/30"
                                                            : "border-slate-200/30 hover:bg-slate-50/50"
                                                    } ${isBusinessHours ? "bg-opacity-80" : "bg-opacity-40"
                                                    }`}
                                            >
                                                {!hasTask && (
                                                    <button
                                                        type="button"
                                                        onClick={(e) => handleSlotClick(col, hour, date, e)}
                                                        className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity z-30 pointer-events-auto"
                                                        aria-label="Add task"
                                                    >
                                                        <div
                                                            className={`w-7 h-7 rounded-lg shadow-lg flex items-center justify-center backdrop-blur-sm ${isDark
                                                                ? "text-indigo-300 bg-slate-800/90 border border-indigo-700/50"
                                                                : "text-indigo-600 bg-white/90 border border-indigo-200"
                                                                }`}
                                                        >
                                                            <PlusIcon className="w-4 h-4" />
                                                        </div>
                                                    </button>
                                                )}
                                            </motion.div>
                                        );
                                    })}
                                </React.Fragment>
                            );
                        })}

                        <div className="absolute top-0 left-[80px] right-0 bottom-0 grid grid-cols-7 z-0 pointer-events-none">
                            {weekDates.map((date, col) => {
                                const dayTasks = tasks.filter(
                                    (task) => task.date === formatDateKey(date)
                                );

                                return (
                                    <div
                                        key={`tasks-${col}`}
                                        className="relative pointer-events-none"
                                    >
                                        {dayTasks.map((task) => renderTaskBlock(task, date))}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    const renderMonthView = () => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const daysInMonth = getDaysInMonth(year, month);
        const firstDay = getFirstDayOfMonth(year, month);
        const today = new Date();

        const calendarDays: (number | null)[] = [];
        for (let i = 0; i < firstDay; i++) {
            calendarDays.push(null);
        }
        for (let i = 1; i <= daysInMonth; i++) {
            calendarDays.push(i);
        }

        return (
            <div className={`p-4 ${isDark ? "bg-slate-800" : "bg-white"}`}>
                <div className="grid grid-cols-7 gap-2">
                    {days.map((day) => (
                        <div
                            key={day}
                            className={`text-center text-sm font-semibold py-2 ${isDark ? "text-slate-400" : "text-slate-600"
                                }`}
                        >
                            {day}
                        </div>
                    ))}
                    {calendarDays.map((day, idx) => {
                        const isToday =
                            day === today.getDate() &&
                            month === today.getMonth() &&
                            year === today.getFullYear();
                        const date = day ? new Date(year, month, day) : null;
                        const dayTaskCount = date
                            ? tasks.filter((t) => t.date === formatDateKey(date)).length
                            : 0;
                        const completedCount = date
                            ? tasks.filter(
                                (t) => t.date === formatDateKey(date) && t.completed
                            ).length
                            : 0;

                        return (
                            <button
                                key={idx}
                                disabled={!day}
                                onClick={() => date && goToDayView(date)}
                                className={`aspect-square flex flex-col items-center justify-center rounded-lg cursor-pointer transition-all ${day === null
                                    ? "opacity-0 cursor-default"
                                    : isToday
                                        ? "bg-indigo-600 text-white font-bold"
                                        : isDark
                                            ? "bg-slate-700 hover:bg-slate-600 text-slate-200"
                                            : "bg-slate-50 hover:bg-slate-100 text-slate-700"
                                    }`}
                            >
                                {day}
                                {dayTaskCount > 0 && (
                                    <div className="flex gap-1 mt-1">
                                        {Array.from({ length: Math.min(dayTaskCount, 3) }).map(
                                            (_, i) => (
                                                <div
                                                    key={i}
                                                    className={`w-1 h-1 rounded-full ${i < completedCount
                                                        ? isToday
                                                            ? "bg-green-200"
                                                            : "bg-green-400"
                                                        : isToday
                                                            ? "bg-white"
                                                            : "bg-indigo-400"
                                                        }`}
                                                />
                                            )
                                        )}
                                    </div>
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>
        );
    };

    const renderSeasonView = () => {
        const season = getSeason(currentDate);
        const year = currentDate.getFullYear();
        let seasonMonths: number[] = [];

        if (season === "Spring") seasonMonths = [2, 3, 4];
        else if (season === "Summer") seasonMonths = [5, 6, 7];
        else if (season === "Fall") seasonMonths = [8, 9, 10];
        else seasonMonths = [11, 0, 1];

        return (
            <div className={`p-4 ${isDark ? "bg-slate-800" : "bg-white"}`}>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {seasonMonths.map((monthIdx) => {
                        const daysInMonth = getDaysInMonth(
                            year +
                            (monthIdx === 11
                                ? -1
                                : monthIdx === 0 || monthIdx === 1
                                    ? 1
                                    : 0),
                            monthIdx
                        );
                        const firstDay = getFirstDayOfMonth(year, monthIdx);

                        const cells: (number | null)[] = [];
                        for (let i = 0; i < firstDay; i++) cells.push(null);
                        for (let d = 1; d <= daysInMonth; d++) cells.push(d);
                        while (cells.length < 35) cells.push(null);

                        return (
                            <div
                                key={monthIdx}
                                className={`rounded-lg p-4 ${isDark ? "bg-slate-700" : "bg-slate-50"
                                    }`}
                            >
                                <h3
                                    className={`text-lg font-bold mb-3 ${isDark ? "text-slate-200" : "text-slate-700"
                                        }`}
                                >
                                    {months[monthIdx]}
                                </h3>
                                <div className="grid grid-cols-7 gap-1">
                                    {["M", "T", "W", "T", "F", "S", "S"].map((d) => (
                                        <div
                                            key={d}
                                            className={`text-xs text-center ${isDark ? "text-slate-400" : "text-slate-500"
                                                }`}
                                        >
                                            {d}
                                        </div>
                                    ))}
                                    {cells.map((day, idx) => {
                                        const date = day ? new Date(year, monthIdx, day) : null;
                                        const isToday =
                                            !!date &&
                                            date.toDateString() === new Date().toDateString();
                                        return (
                                            <button
                                                key={idx}
                                                disabled={!day}
                                                onClick={() => date && goToDayView(date)}
                                                className={`aspect-square text-xs flex items-center justify-center rounded cursor-pointer transition-colors ${day === null
                                                    ? "opacity-0 cursor-default"
                                                    : isToday
                                                        ? "bg-indigo-600 text-white font-bold"
                                                        : isDark
                                                            ? "text-slate-200 hover:bg-slate-600"
                                                            : "text-slate-700 hover:bg-slate-100"
                                                    }`}
                                            >
                                                {day ?? ""}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    };

    const renderYearView = () => {
        const year = currentDate.getFullYear();

        return (
            <div className={`p-4 ${isDark ? "bg-slate-800" : "bg-white"}`}>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {months.map((month, idx) => {
                        const daysInMonth = getDaysInMonth(year, idx);
                        const firstDay = getFirstDayOfMonth(year, idx);
                        const cells: (number | null)[] = [];
                        for (let i = 0; i < firstDay; i++) cells.push(null);
                        for (let d = 1; d <= daysInMonth; d++) cells.push(d);
                        while (cells.length < 35) cells.push(null);

                        return (
                            <div
                                key={month}
                                className={`rounded-lg p-3 ${isDark ? "bg-slate-700" : "bg-slate-50"
                                    }`}
                            >
                                <h3
                                    className={`text-sm font-bold mb-2 ${isDark ? "text-slate-200" : "text-slate-700"
                                        }`}
                                >
                                    {month}
                                </h3>
                                <div className="grid grid-cols-7 gap-1">
                                    {["M", "T", "W", "T", "F", "S", "S"].map((d) => (
                                        <div
                                            key={d}
                                            className={`text-[10px] text-center ${isDark ? "text-slate-400" : "text-slate-500"
                                                }`}
                                        >
                                            {d}
                                        </div>
                                    ))}
                                    {cells.map((day, i) => {
                                        const date = day ? new Date(year, idx, day) : null;
                                        const isToday =
                                            !!date &&
                                            date.toDateString() === new Date().toDateString();
                                        return (
                                            <button
                                                key={i}
                                                disabled={!day}
                                                onClick={() => date && goToDayView(date)}
                                                className={`aspect-square text-[10px] flex items-center justify-center rounded cursor-pointer transition-colors ${day === null
                                                    ? "opacity-0 cursor-default"
                                                    : isToday
                                                        ? "bg-indigo-600 text-white font-bold"
                                                        : isDark
                                                            ? "text-slate-200 hover:bg-slate-600"
                                                            : "text-slate-700 hover:bg-slate-100"
                                                    }`}
                                            >
                                                {day ?? ""}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    };

    const getUniqueLabels = () => {
        const labelMap = new Map<string, string>();
        tasks.forEach((task) => {
            if (task.label && !labelMap.has(task.label)) {
                labelMap.set(task.label, task.color);
            }
        });
        return Array.from(labelMap.entries()).map(([label, color]) => ({
            label,
            color,
        }));
    };

    const stats = getTaskStats();

    if (isCheckingAuth) {
        return (
            <div className="flex h-screen items-center justify-center bg-slate-900">
                <Loader2 className="animate-spin h-8 w-8 text-white" />
            </div>
        );
    }

    return (
        <main
            className={`min-h-screen transition-all duration-700 ${isDark
                ? "bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950"
                : "bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50"
                }`}
        >
            <div className="flex min-h-screen gap-4 p-4">
                {/* LEFT SIDEBAR - Space for teammate's Pomodoro/Task panel */}
                <Sidebar
                    blocks={blocks}
                    activeId={activeId}
                    selectedDate={selectedDate}
                    onSelectDate={selectDateEverywhere}
                    onSelectBlock={(id) => setActiveId(id)}
                    onPickStyle={pickStyle}
                    onSetCustomMinutes={onSetCustomMinutes}
                    onDeleteBlock={deleteSlot}
                    onUpdateBlock={updateBlock}
                    manualOrderByDate={manualOrderByDate}
                    onSetManualOrderForDate={(dateISO, idsInOrder) =>
                        setManualOrderByDate((prev) => ({ ...prev, [dateISO]: idsInOrder }))
                    }
                    isDark={isDark}
                    weatherUnit={preferences.weatherUnit}
                />

                {/* RIGHT SIDE - Calendar */}
                <div className="flex-1 flex flex-col min-h-screen">
                    <div
                        className={`rounded-2xl shadow-2xl backdrop-blur-sm border flex flex-col ${isDark
                            ? "bg-slate-900/80 border-slate-700/50"
                            : "bg-white/80 border-white/50"
                            }`}
                    >
                        <div
                            className={`px-6 py-5 flex items-center justify-between border-b ${isDark
                                ? "bg-slate-800 border-slate-700"
                                : "bg-white border-slate-200"
                                }`}
                        >
                            <div className="flex items-center gap-3">
                                <div
                                    className={`w-10 h-10 rounded-xl flex items-center justify-center ${isDark ? "bg-indigo-600/20" : "bg-indigo-100"
                                        }`}
                                >
                                    <SparklesIcon
                                        className={`w-6 h-6 ${isDark ? "text-indigo-400" : "text-indigo-600"
                                            }`}
                                    />
                                </div>
                                <div>
                                    <h2
                                        className={`text-2xl font-bold tracking-tight ${isDark ? "text-white" : "text-slate-900"
                                            }`}
                                    >
                                        PrepTime
                                    </h2>
                                    <p
                                        className={`text-xs mt-0.5 font-medium ${isDark ? "text-slate-400" : "text-slate-600"
                                            }`}
                                    >
                                        AI-Powered Smart Scheduler
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => setShowSettings(true)}
                                className={`p-2.5 rounded-xl transition-all duration-200 ${isDark
                                    ? "hover:bg-slate-700 text-slate-300"
                                    : "hover:bg-slate-100 text-slate-600"
                                    }`}
                                title="Settings"
                            >
                                <svg
                                    className="w-6 h-6"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                                    />
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                    />
                                </svg>
                            </button>
                        </div>

                        <div
                            className={`px-6 py-4 border-b ${isDark
                                ? "bg-slate-700 border-slate-600"
                                : "bg-slate-50 border-slate-200"
                                }`}
                        >
                            <div className="flex items-center gap-3 mb-3 overflow-x-auto">
                                <div className="flex gap-1">
                                    {views.map((view) => (
                                        <button
                                            key={view.value}
                                            onClick={() => handleViewChange(view.value as ViewType)}
                                            className={`px-3 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${viewType === view.value
                                                ? "bg-indigo-600 text-white"
                                                : isDark
                                                    ? "bg-slate-800 text-slate-300 hover:bg-slate-600"
                                                    : "bg-white text-slate-700 hover:bg-slate-100"
                                                }`}
                                        >
                                            {view.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="flex items-center gap-3 mb-4">
                                <motion.button
                                    type="button"
                                    whileHover={{ scale: 1.05, x: -2 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={goToPrev}
                                    className={`px-5 py-2.5 border rounded-xl transition-all duration-200 font-semibold text-sm shadow-sm flex items-center gap-2 ${isDark
                                        ? "bg-slate-800/50 border-slate-600/50 text-white hover:bg-slate-700/50 hover:border-indigo-500/50 backdrop-blur-sm"
                                        : "bg-white/50 border-slate-300/50 hover:bg-slate-50 hover:border-indigo-400 backdrop-blur-sm"
                                        }`}
                                >
                                    <ChevronLeftIcon className="w-4 h-4" />
                                    <span>Prev</span>
                                </motion.button>
                                <div
                                    className={`flex-1 text-center px-5 py-2.5 border rounded-xl font-bold backdrop-blur-sm ${isDark
                                        ? "bg-slate-800/50 border-slate-600/50 text-slate-100"
                                        : "bg-white/50 border-slate-300/50 text-slate-700"
                                        }`}
                                >
                                    {getViewTitle()}
                                </div>
                                <motion.button
                                    type="button"
                                    whileHover={{ scale: 1.05, x: 2 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={goToNext}
                                    className={`px-5 py-2.5 border rounded-xl transition-all duration-200 font-semibold text-sm shadow-sm flex items-center gap-2 ${isDark
                                        ? "bg-slate-800/50 border-slate-600/50 text-white hover:bg-slate-700/50 hover:border-indigo-500/50 backdrop-blur-sm"
                                        : "bg-white/50 border-slate-300/50 hover:bg-slate-50 hover:border-indigo-400 backdrop-blur-sm"
                                        }`}
                                >
                                    <span>Next</span>
                                    <ChevronRightIcon className="w-4 h-4" />
                                </motion.button>
                            </div>

                            {/* AI Month Generator Button */}
                            <div className="mt-3 flex gap-3">
                                <MonthGeneratorButton
                                    week1Blocks={blocks
                                        .filter((b) => {
                                            const blockDate = new Date(b.dateISO);
                                            const weekStart = getMonday(currentDate);
                                            const weekEnd = addDays(weekStart, 7);
                                            return blockDate >= weekStart && blockDate < weekEnd;
                                        })
                                        .map((b) => {
                                            // Create date in local timezone and format as ISO string with timezone
                                            const startDate = new Date(b.dateISO + "T" + b.start);
                                            const endDate = new Date(b.dateISO + "T" + b.end);

                                            // Format as ISO string but keep local time (don't convert to UTC)
                                            const formatLocalISO = (date: Date) => {
                                                const year = date.getFullYear();
                                                const month = String(date.getMonth() + 1).padStart(
                                                    2,
                                                    "0"
                                                );
                                                const day = String(date.getDate()).padStart(2, "0");
                                                const hours = String(date.getHours()).padStart(2, "0");
                                                const minutes = String(date.getMinutes()).padStart(
                                                    2,
                                                    "0"
                                                );
                                                const seconds = String(date.getSeconds()).padStart(
                                                    2,
                                                    "0"
                                                );

                                                // Get timezone offset
                                                const offset = -date.getTimezoneOffset();
                                                const offsetHours = String(
                                                    Math.floor(Math.abs(offset) / 60)
                                                ).padStart(2, "0");
                                                const offsetMinutes = String(
                                                    Math.abs(offset) % 60
                                                ).padStart(2, "0");
                                                const offsetSign = offset >= 0 ? "+" : "-";

                                                return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}${offsetSign}${offsetHours}:${offsetMinutes}`;
                                            };

                                            return {
                                                id: b.id,
                                                taskId: b.id,
                                                start: formatLocalISO(startDate),
                                                end: formatLocalISO(endDate),
                                            };
                                        })}
                                    week1Tasks={blocks
                                        .filter((b) => {
                                            const blockDate = new Date(b.dateISO);
                                            const weekStart = getMonday(currentDate);
                                            const weekEnd = addDays(weekStart, 7);
                                            return blockDate >= weekStart && blockDate < weekEnd;
                                        })
                                        .map((b) => {
                                            // Create a consistent color based on task name
                                            const getColorForTask = (name: string): string => {
                                                // Hash the name to get a consistent color
                                                let hash = 0;
                                                for (let i = 0; i < name.length; i++) {
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
                                                    "#D291BC",
                                                ];
                                                return colors[Math.abs(hash) % colors.length];
                                            };

                                            // Find matching task in tasks array to get its color
                                            const matchingTask = tasks.find(
                                                (t) => t.title === b.name && t.date === b.dateISO
                                            );

                                            return {
                                                id: b.id,
                                                title: b.name,
                                                durationMin: Math.round(
                                                    (new Date(b.dateISO + "T" + b.end).getTime() -
                                                        new Date(b.dateISO + "T" + b.start).getTime()) /
                                                    60000
                                                ),
                                                type:
                                                    b.label === "study" ||
                                                        b.label === "deep" ||
                                                        b.label === "admin" ||
                                                        b.label === "relax"
                                                        ? b.label
                                                        : b.style === "Deep Focus"
                                                            ? "deep"
                                                            : b.style === "Pomodoro"
                                                                ? "study"
                                                                : "relax",
                                                energy:
                                                    b.style === "Deep Focus" || b.style === "Pomodoro"
                                                        ? "high"
                                                        : "med",
                                                splittable: false,
                                                priority: 3,
                                                mode:
                                                    b.style === "Deep Focus"
                                                        ? "lockin"
                                                        : b.style === "Pomodoro"
                                                            ? "study"
                                                            : "balanced",
                                                label: b.label || b.name,
                                                color: matchingTask?.color || getColorForTask(b.name), // Use task color if available, otherwise generate
                                            };
                                        })}
                                    existingEvents={[]}
                                    preferences={{
                                        dayStartHour: 7, // 7 AM start
                                        dayEndHour: 23, // 11 PM end
                                        slotStepMin: 15, // Smaller steps for better scheduling
                                        bufferMin: 5,
                                        maxHeavyPerDay: 3,
                                    }}
                                    onMonthGenerated={(result) => {
                                        console.log("onMonthGenerated called with result:", result);

                                        // Convert generated blocks back to TimeBlock format and add them
                                        const newBlocks = result.scheduledBlocks.map(
                                            (sb, index) => {
                                                // Parse ISO strings and extract local time directly (don't convert timezone)
                                                // sb.start format: "2025-12-30T07:00:00-05:00"
                                                const startISO = sb.start;
                                                const endISO = sb.end;

                                                // Extract date and time parts from ISO string
                                                const startMatch = startISO.match(
                                                    /^(\d{4}-\d{2}-\d{2})T(\d{2}):(\d{2})/
                                                );
                                                const endMatch = endISO.match(
                                                    /^(\d{4}-\d{2}-\d{2})T(\d{2}):(\d{2})/
                                                );

                                                if (!startMatch || !endMatch) {
                                                    console.error(
                                                        "Failed to parse ISO times:",
                                                        startISO,
                                                        endISO
                                                    );
                                                    return null;
                                                }

                                                const dateISO = startMatch[1];
                                                const startTime = `${startMatch[2]}:${startMatch[3]}`;
                                                const endTime = `${endMatch[2]}:${endMatch[3]}`;

                                                const task = result.generatedTasks.find(
                                                    (t) => t.id === sb.taskId
                                                );

                                                // Generate truly unique ID to avoid collisions
                                                const uniqueId = `ai_${Date.now()}_${index}_${Math.random()
                                                    .toString(36)
                                                    .slice(2, 9)}`;

                                                return {
                                                    id: uniqueId,
                                                    name: task?.title || "Generated Task",
                                                    dateISO: dateISO,
                                                    start: startTime,
                                                    end: endTime,
                                                    style:
                                                        task?.type === "deep"
                                                            ? ("Deep Focus" as BreakStyle)
                                                            : task?.type === "study"
                                                                ? ("Pomodoro" as BreakStyle)
                                                                : undefined,
                                                    focusMin:
                                                        task?.type === "deep"
                                                            ? 52
                                                            : task?.type === "study"
                                                                ? 25
                                                                : undefined,
                                                    breakMin:
                                                        task?.type === "deep"
                                                            ? 17
                                                            : task?.type === "study"
                                                                ? 5
                                                                : undefined,
                                                    label: task?.label || task?.type, // Use label from AI
                                                    description: `AI-generated task (${result.appliedTechniques?.length || 0
                                                        } techniques applied)`,
                                                };
                                            }
                                        );

                                        console.log("Created newBlocks:", newBlocks);

                                        // Also create Task objects for the calendar
                                        const newTasks = result.scheduledBlocks
                                            .map((sb, index) => {
                                                // Parse ISO strings directly to avoid timezone conversion
                                                const startMatch = sb.start.match(
                                                    /^(\d{4}-\d{2}-\d{2})T(\d{2}):(\d{2})/
                                                );
                                                if (!startMatch) return null;

                                                const dateStr = startMatch[1];
                                                const startHour = parseInt(startMatch[2]);
                                                const startMin = parseInt(startMatch[3]);

                                                const endMatch = sb.end.match(/T(\d{2}):(\d{2})/);
                                                const endHour = endMatch
                                                    ? parseInt(endMatch[1])
                                                    : startHour + 1;
                                                const endMin = endMatch ? parseInt(endMatch[2]) : 0;

                                                const task = result.generatedTasks.find(
                                                    (t) => t.id === sb.taskId
                                                );

                                                // Generate truly unique ID to avoid collisions
                                                const uniqueId = `ai_task_${Date.now()}_${index}_${Math.random()
                                                    .toString(36)
                                                    .slice(2, 9)}`;

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
                                                if (
                                                    !color ||
                                                    color === "" ||
                                                    color === null ||
                                                    color === undefined
                                                ) {
                                                    // Remove week number from title to get base name
                                                    const baseName =
                                                        task?.title?.replace(/\s*\(W\d+\)/, "") || "Task";

                                                    // Hash the base name to get a consistent color
                                                    let hash = 0;
                                                    for (let i = 0; i < baseName.length; i++) {
                                                        hash =
                                                            baseName.charCodeAt(i) + ((hash << 5) - hash);
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
                                                        "#D291BC",
                                                    ];
                                                    color = colors[Math.abs(hash) % colors.length];
                                                    console.log(
                                                        `Generated color for ${baseName}: ${color}`
                                                    );
                                                } else {
                                                    console.log(
                                                        `Using AI color for ${task?.title}: ${color}`
                                                    );
                                                }

                                                // Use label from AI if available, otherwise use type
                                                const label =
                                                    task?.label || task?.type || "AI Generated";

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
                                                    completed: false,
                                                };
                                            })
                                            .filter((t) => t !== null);

                                        console.log("Created newTasks:", newTasks);
                                        console.log("Sample task:", newTasks[0]);

                                        const updatedTasks = [...tasks, ...newTasks];
                                        const updatedBlocks = [...blocks, ...newBlocks];

                                        console.log(
                                            "Total tasks after generation:",
                                            updatedTasks.length
                                        );
                                        console.log(
                                            "Total blocks after generation:",
                                            updatedBlocks.length
                                        );

                                        setBlocks(updatedBlocks.filter((b): b is TimeBlock => b !== null));
                                        setTasks(updatedTasks);

                                        // Save to localStorage
                                        localStorage.setItem(
                                            "preptime-tasks",
                                            JSON.stringify(updatedTasks)
                                        );
                                        localStorage.setItem(
                                            "preptime-blocks",
                                            JSON.stringify(updatedBlocks)
                                        );

                                        console.log("Saved to localStorage");
                                    }}
                                />

                                {/* Demo Week Button - For Testing */}
                                <motion.button
                                    type="button"
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => {
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
                                                color: "bg-cyan-500",
                                            },
                                            {
                                                name: "Breakfast",
                                                day: 0,
                                                start: "08:00",
                                                end: "08:30",
                                                label: "break",
                                                color: "bg-green-400",
                                            },
                                            {
                                                name: "Deep Work - Coding",
                                                day: 0,
                                                start: "09:00",
                                                end: "12:00",
                                                label: "work",
                                                color: "bg-red-500",
                                            },
                                            {
                                                name: "Lunch Break",
                                                day: 0,
                                                start: "12:00",
                                                end: "13:00",
                                                label: "break",
                                                color: "bg-green-400",
                                            },
                                            {
                                                name: "Meetings",
                                                day: 0,
                                                start: "14:00",
                                                end: "16:00",
                                                label: "admin",
                                                color: "bg-orange-500",
                                            },
                                            {
                                                name: "Email & Admin",
                                                day: 0,
                                                start: "16:00",
                                                end: "17:00",
                                                label: "admin",
                                                color: "bg-orange-500",
                                            },
                                            {
                                                name: "Dinner",
                                                day: 0,
                                                start: "18:00",
                                                end: "19:00",
                                                label: "break",
                                                color: "bg-green-400",
                                            },
                                            {
                                                name: "Evening Reading",
                                                day: 0,
                                                start: "20:00",
                                                end: "21:30",
                                                label: "relax",
                                                color: "bg-pink-400",
                                            },
                                            {
                                                name: "Wind Down",
                                                day: 0,
                                                start: "21:30",
                                                end: "23:00",
                                                label: "relax",
                                                color: "bg-pink-400",
                                            },

                                            // Tuesday
                                            {
                                                name: "Morning Workout",
                                                day: 1,
                                                start: "07:00",
                                                end: "08:00",
                                                label: "fitness",
                                                color: "bg-cyan-500",
                                            },
                                            {
                                                name: "Breakfast",
                                                day: 1,
                                                start: "08:00",
                                                end: "08:30",
                                                label: "break",
                                                color: "bg-green-400",
                                            },
                                            {
                                                name: "Study Session",
                                                day: 1,
                                                start: "09:00",
                                                end: "11:00",
                                                label: "study",
                                                color: "bg-purple-500",
                                            },
                                            {
                                                name: "Project Work",
                                                day: 1,
                                                start: "11:00",
                                                end: "13:00",
                                                label: "work",
                                                color: "bg-red-500",
                                            },
                                            {
                                                name: "Lunch",
                                                day: 1,
                                                start: "13:00",
                                                end: "14:00",
                                                label: "break",
                                                color: "bg-green-400",
                                            },
                                            {
                                                name: "Client Calls",
                                                day: 1,
                                                start: "15:00",
                                                end: "17:00",
                                                label: "admin",
                                                color: "bg-orange-500",
                                            },
                                            {
                                                name: "Creative Work",
                                                day: 1,
                                                start: "17:00",
                                                end: "18:30",
                                                label: "work",
                                                color: "bg-red-500",
                                            },
                                            {
                                                name: "Dinner",
                                                day: 1,
                                                start: "18:30",
                                                end: "19:30",
                                                label: "break",
                                                color: "bg-green-400",
                                            },
                                            {
                                                name: "Hobby Time",
                                                day: 1,
                                                start: "20:00",
                                                end: "22:00",
                                                label: "hobby",
                                                color: "bg-blue-400",
                                            },
                                            {
                                                name: "Relax",
                                                day: 1,
                                                start: "22:00",
                                                end: "23:00",
                                                label: "relax",
                                                color: "bg-pink-400",
                                            },

                                            // Wednesday
                                            {
                                                name: "Gym",
                                                day: 2,
                                                start: "07:00",
                                                end: "08:30",
                                                label: "fitness",
                                                color: "bg-cyan-500",
                                            },
                                            {
                                                name: "Breakfast",
                                                day: 2,
                                                start: "08:30",
                                                end: "09:00",
                                                label: "break",
                                                color: "bg-green-400",
                                            },
                                            {
                                                name: "Deep Focus",
                                                day: 2,
                                                start: "09:00",
                                                end: "12:00",
                                                label: "deep",
                                                color: "bg-fuchsia-500",
                                            },
                                            {
                                                name: "Lunch",
                                                day: 2,
                                                start: "12:00",
                                                end: "13:00",
                                                label: "break",
                                                color: "bg-green-400",
                                            },
                                            {
                                                name: "Team Sync",
                                                day: 2,
                                                start: "14:00",
                                                end: "15:00",
                                                label: "admin",
                                                color: "bg-orange-500",
                                            },
                                            {
                                                name: "Creative Work",
                                                day: 2,
                                                start: "15:00",
                                                end: "17:00",
                                                label: "work",
                                                color: "bg-red-500",
                                            },
                                            {
                                                name: "Planning",
                                                day: 2,
                                                start: "17:00",
                                                end: "18:00",
                                                label: "admin",
                                                color: "bg-orange-500",
                                            },
                                            {
                                                name: "Dinner",
                                                day: 2,
                                                start: "18:00",
                                                end: "19:00",
                                                label: "break",
                                                color: "bg-green-400",
                                            },
                                            {
                                                name: "Learning",
                                                day: 2,
                                                start: "19:30",
                                                end: "21:00",
                                                label: "study",
                                                color: "bg-purple-500",
                                            },
                                            {
                                                name: "TV Time",
                                                day: 2,
                                                start: "21:00",
                                                end: "23:00",
                                                label: "relax",
                                                color: "bg-pink-400",
                                            },

                                            // Thursday
                                            {
                                                name: "Morning Run",
                                                day: 3,
                                                start: "07:00",
                                                end: "08:00",
                                                label: "fitness",
                                                color: "bg-cyan-500",
                                            },
                                            {
                                                name: "Breakfast",
                                                day: 3,
                                                start: "08:00",
                                                end: "08:30",
                                                label: "break",
                                                color: "bg-green-400",
                                            },
                                            {
                                                name: "Learning Time",
                                                day: 3,
                                                start: "09:00",
                                                end: "11:00",
                                                label: "study",
                                                color: "bg-purple-500",
                                            },
                                            {
                                                name: "Development",
                                                day: 3,
                                                start: "11:00",
                                                end: "13:00",
                                                label: "work",
                                                color: "bg-red-500",
                                            },
                                            {
                                                name: "Lunch Break",
                                                day: 3,
                                                start: "13:00",
                                                end: "14:00",
                                                label: "break",
                                                color: "bg-green-400",
                                            },
                                            {
                                                name: "Planning",
                                                day: 3,
                                                start: "14:00",
                                                end: "16:00",
                                                label: "admin",
                                                color: "bg-orange-500",
                                            },
                                            {
                                                name: "Code Review",
                                                day: 3,
                                                start: "16:00",
                                                end: "17:30",
                                                label: "work",
                                                color: "bg-red-500",
                                            },
                                            {
                                                name: "Dinner",
                                                day: 3,
                                                start: "18:00",
                                                end: "19:00",
                                                label: "break",
                                                color: "bg-green-400",
                                            },
                                            {
                                                name: "Side Project",
                                                day: 3,
                                                start: "19:30",
                                                end: "21:30",
                                                label: "hobby",
                                                color: "bg-blue-400",
                                            },
                                            {
                                                name: "Chill Time",
                                                day: 3,
                                                start: "21:30",
                                                end: "23:00",
                                                label: "relax",
                                                color: "bg-pink-400",
                                            },

                                            // Friday
                                            {
                                                name: "Workout",
                                                day: 4,
                                                start: "07:00",
                                                end: "08:00",
                                                label: "fitness",
                                                color: "bg-cyan-500",
                                            },
                                            {
                                                name: "Breakfast",
                                                day: 4,
                                                start: "08:00",
                                                end: "08:30",
                                                label: "break",
                                                color: "bg-green-400",
                                            },
                                            {
                                                name: "Focus Block",
                                                day: 4,
                                                start: "09:00",
                                                end: "12:00",
                                                label: "deep",
                                                color: "bg-fuchsia-500",
                                            },
                                            {
                                                name: "Lunch",
                                                day: 4,
                                                start: "12:00",
                                                end: "13:00",
                                                label: "break",
                                                color: "bg-green-400",
                                            },
                                            {
                                                name: "Review & Wrap-up",
                                                day: 4,
                                                start: "14:00",
                                                end: "16:00",
                                                label: "admin",
                                                color: "bg-orange-500",
                                            },
                                            {
                                                name: "Team Happy Hour",
                                                day: 4,
                                                start: "17:00",
                                                end: "18:30",
                                                label: "social",
                                                color: "bg-violet-500",
                                            },
                                            {
                                                name: "Dinner",
                                                day: 4,
                                                start: "19:00",
                                                end: "20:00",
                                                label: "break",
                                                color: "bg-green-400",
                                            },
                                            {
                                                name: "Movie Night",
                                                day: 4,
                                                start: "20:30",
                                                end: "23:00",
                                                label: "relax",
                                                color: "bg-pink-400",
                                            },

                                            // Saturday
                                            {
                                                name: "Morning Yoga",
                                                day: 5,
                                                start: "08:00",
                                                end: "09:00",
                                                label: "fitness",
                                                color: "bg-cyan-500",
                                            },
                                            {
                                                name: "Brunch",
                                                day: 5,
                                                start: "10:00",
                                                end: "11:00",
                                                label: "break",
                                                color: "bg-green-400",
                                            },
                                            {
                                                name: "Personal Project",
                                                day: 5,
                                                start: "11:30",
                                                end: "14:00",
                                                label: "hobby",
                                                color: "bg-blue-400",
                                            },
                                            {
                                                name: "Lunch",
                                                day: 5,
                                                start: "14:00",
                                                end: "15:00",
                                                label: "break",
                                                color: "bg-green-400",
                                            },
                                            {
                                                name: "Errands",
                                                day: 5,
                                                start: "15:30",
                                                end: "17:00",
                                                label: "life",
                                                color: "bg-slate-500",
                                            },
                                            {
                                                name: "Dinner Prep",
                                                day: 5,
                                                start: "17:30",
                                                end: "18:30",
                                                label: "life",
                                                color: "bg-slate-500",
                                            },
                                            {
                                                name: "Dinner",
                                                day: 5,
                                                start: "18:30",
                                                end: "19:30",
                                                label: "break",
                                                color: "bg-green-400",
                                            },
                                            {
                                                name: "Social Time",
                                                day: 5,
                                                start: "20:00",
                                                end: "22:00",
                                                label: "social",
                                                color: "bg-violet-500",
                                            },
                                            {
                                                name: "Wind Down",
                                                day: 5,
                                                start: "22:00",
                                                end: "23:00",
                                                label: "relax",
                                                color: "bg-pink-400",
                                            },

                                            // Sunday
                                            {
                                                name: "Light Exercise",
                                                day: 6,
                                                start: "09:00",
                                                end: "10:00",
                                                label: "fitness",
                                                color: "bg-cyan-500",
                                            },
                                            {
                                                name: "Breakfast",
                                                day: 6,
                                                start: "10:00",
                                                end: "10:30",
                                                label: "break",
                                                color: "bg-green-400",
                                            },
                                            {
                                                name: "Reading",
                                                day: 6,
                                                start: "11:00",
                                                end: "13:00",
                                                label: "study",
                                                color: "bg-purple-500",
                                            },
                                            {
                                                name: "Lunch",
                                                day: 6,
                                                start: "13:00",
                                                end: "14:00",
                                                label: "break",
                                                color: "bg-green-400",
                                            },
                                            {
                                                name: "Meal Prep",
                                                day: 6,
                                                start: "14:30",
                                                end: "16:30",
                                                label: "life",
                                                color: "bg-slate-500",
                                            },
                                            {
                                                name: "Planning Week",
                                                day: 6,
                                                start: "17:00",
                                                end: "18:00",
                                                label: "admin",
                                                color: "bg-orange-500",
                                            },
                                            {
                                                name: "Dinner",
                                                day: 6,
                                                start: "18:30",
                                                end: "19:30",
                                                label: "break",
                                                color: "bg-green-400",
                                            },
                                            {
                                                name: "Family Time",
                                                day: 6,
                                                start: "20:00",
                                                end: "21:30",
                                                label: "social",
                                                color: "bg-violet-500",
                                            },
                                            {
                                                name: "Relax",
                                                day: 6,
                                                start: "21:30",
                                                end: "23:00",
                                                label: "relax",
                                                color: "bg-pink-400",
                                            },
                                        ];

                                        const newBlocks: TimeBlock[] = [];
                                        const newTasks: Task[] = [];

                                        demoTasks.forEach((demo, idx) => {
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
                                                label: demo.label,
                                            });

                                            // Create task
                                            const [startHour, startMin] = demo.start
                                                .split(":")
                                                .map(Number);
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
                                                completed: false,
                                            });
                                        });

                                        // Add to existing tasks and blocks
                                        const updatedBlocks = [...blocks, ...newBlocks];
                                        const updatedTasks = [...tasks, ...newTasks];

                                        setBlocks(updatedBlocks.filter((b): b is TimeBlock => b !== null));
                                        setTasks(updatedTasks);

                                        // Save to localStorage
                                        localStorage.setItem(
                                            "preptime-tasks",
                                            JSON.stringify(updatedTasks)
                                        );
                                        localStorage.setItem(
                                            "preptime-blocks",
                                            JSON.stringify(updatedBlocks)
                                        );

                                        alert(
                                            "Demo week added! You can now test the AI month generator."
                                        );
                                    }}
                                    className="px-6 py-3 rounded-lg font-medium text-white bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 shadow-lg hover:shadow-xl transition-all duration-200"
                                >
                                    🎯 Add Demo Week
                                </motion.button>

                                {/* General Add Task Button - Works for all views */}
                                <motion.button
                                    type="button"
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => {
                                        // Open task modal with current selected date and default 9 AM start time
                                        setSelectedSlot({
                                            day: 0,
                                            hour: 9,
                                            date: selectedDate,
                                        });
                                        setStartTime("09:00");
                                        setStartAmPm("AM");
                                        setEndTime("10:00");
                                        setEndAmPm("AM");
                                        setSelectedColor(taskColors[0]);
                                        setShowModal(true);
                                    }}
                                    className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 shadow-lg hover:shadow-xl ${isDark
                                        ? "bg-indigo-600 hover:bg-indigo-500 text-white border border-indigo-500/50"
                                        : "bg-indigo-600 hover:bg-indigo-700 text-white"
                                        }`}
                                >
                                    <PlusIcon className="w-5 h-5" />
                                    <span>Add Task</span>
                                </motion.button>
                            </div>

                            {getUniqueLabels().length > 0 && (
                                <div className="mt-3 flex flex-wrap gap-2">
                                    {getUniqueLabels().map(({ label, color }) => (
                                        <div
                                            key={label}
                                            className={`${color} text-white px-3 py-1 rounded-full text-xs font-medium shadow-sm flex items-center gap-1`}
                                        >
                                            <div className="w-2 h-2 rounded-full bg-white/80" />
                                            {label}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="flex-1 overflow-hidden">
                            {viewType === "day" && (
                                <ModernSchedule
                                    selectedDate={selectedDate}
                                    isDark={isDark}
                                    onAddTask={(hour) => {
                                        // Create a slot at the selected hour
                                        const date = selectedDate;
                                        handleSlotClick(0, hour, date);
                                    }}
                                    tasks={tasks}
                                    onToggleTask={(taskId) => toggleTaskCompletion(taskId)}
                                    onDeleteTask={deleteTask}
                                    formatDateKey={formatDateKey}
                                />
                            )}
                            {viewType === "week" && renderWeekView()}
                            {viewType === "month" && renderMonthView()}
                            {viewType === "season" && renderSeasonView()}
                            {viewType === "year" && renderYearView()}
                        </div>

                        <div
                            className={`px-6 py-3 border-t text-xs ${isDark
                                ? "bg-slate-700 border-slate-600 text-slate-400"
                                : "bg-slate-50 border-slate-200 text-slate-500"
                                }`}
                        >
                            <div className="flex items-center justify-between">
                                <div>
                                    {viewType === "week" && selectedDateIndex !== null
                                        ? `Selected: ${days[selectedDateIndex]}, ${formatDate(
                                            addDays(currentMonday, selectedDateIndex)
                                        )}`
                                        : `Viewing: ${viewType.charAt(0).toUpperCase() + viewType.slice(1)
                                        }`}
                                </div>
                                <div className="flex items-center gap-4">
                                    <span className="flex items-center gap-1">
                                        <span className="font-semibold text-green-600">
                                            ✓ {stats.completed}
                                        </span>{" "}
                                        Done
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <span className="font-semibold text-orange-600">
                                            ⏳ {stats.remaining}
                                        </span>{" "}
                                        Left
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <span className="font-semibold">{stats.total}</span> Total
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Settings Modal */}
            <AnimatePresence>
                {showSettings && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className={`w-full max-w-md rounded-2xl shadow-2xl overflow-hidden ${isDark ? "bg-slate-800" : "bg-white"
                                }`}
                        >
                            <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700">
                                <h2 className={`text-xl font-bold ${isDark ? "text-white" : "text-slate-900"}`}>
                                    Settings
                                </h2>
                                <button
                                    onClick={() => setShowSettings(false)}
                                    className={`p-2 rounded-lg transition-colors ${isDark
                                        ? "hover:bg-slate-700 text-slate-400 hover:text-white"
                                        : "hover:bg-slate-100 text-slate-500 hover:text-slate-900"
                                        }`}
                                >
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            <div className="p-6 space-y-6">
                                {/* Preferences Panel */}
                                <PreferencesPanel
                                    preferences={preferences}
                                    onChange={(newPrefs) => setPreferences(newPrefs)}
                                    isDark={isDark}
                                />

                                <div>
                                    <label
                                        className={`block text-sm font-semibold mb-3 ${isDark ? "text-slate-200" : "text-slate-700"
                                            }`}
                                    >
                                        Theme
                                    </label>
                                    <div className="space-y-2">
                                        {[
                                            { value: "system", label: "System Default", icon: "💻" },
                                            { value: "light", label: "Light Mode", icon: "☀️" },
                                            { value: "dark", label: "Dark Mode", icon: "🌙" },
                                        ].map((option) => (
                                            <button
                                                key={option.value}
                                                onClick={() => handleThemeChange(option.value as any)}
                                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg border-2 transition-all ${theme === option.value
                                                    ? "border-indigo-600 bg-indigo-50/50"
                                                    : isDark
                                                        ? "border-slate-700 hover:border-slate-600 bg-slate-700"
                                                        : "border-slate-200 hover:border-slate-300"
                                                    }`}
                                            >
                                                <span className="text-2xl">{option.icon}</span>
                                                <span
                                                    className={`flex-1 text-left font-medium ${theme === option.value
                                                        ? "text-indigo-600"
                                                        : isDark
                                                            ? "text-slate-200"
                                                            : "text-slate-700"
                                                        }`}
                                                >
                                                    {option.label}
                                                </span>
                                                {theme === option.value && (
                                                    <svg
                                                        className="w-5 h-5 text-indigo-600"
                                                        fill="currentColor"
                                                        viewBox="0 0 20 20"
                                                    >
                                                        <path
                                                            fillRule="evenodd"
                                                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                                            clipRule="evenodd"
                                                        />
                                                    </svg>
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className={`border-t pt-6 ${isDark ? "border-slate-700" : "border-slate-200"}`}>
                                    <label
                                        className={`block text-sm font-semibold mb-3 ${isDark ? "text-slate-200" : "text-slate-700"
                                            }`}
                                    >
                                        Data Management
                                    </label>
                                    <button
                                        onClick={() => {
                                            if (
                                                confirm(
                                                    "Are you sure you want to clear all tasks and time blocks? This cannot be undone."
                                                )
                                            ) {
                                                setTasks([]);
                                                setBlocks([]);
                                                localStorage.removeItem("preptime-tasks");
                                                localStorage.removeItem("preptime-blocks");
                                                setShowSettings(false);
                                                alert("All tasks and time blocks have been cleared!");
                                            }
                                        }}
                                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg border-2 transition-all ${isDark
                                            ? "border-red-700 hover:border-red-600 bg-red-900/20 hover:bg-red-900/30"
                                            : "border-red-200 hover:border-red-300 bg-red-50 hover:bg-red-100"
                                            }`}
                                    >
                                        <span className="text-2xl">🗑️</span>
                                        <div className="flex-1 text-left">
                                            <div
                                                className={`font-medium ${isDark ? "text-red-400" : "text-red-600"
                                                    }`}
                                            >
                                                Clear All Tasks
                                            </div>
                                            <div
                                                className={`text-xs ${isDark ? "text-red-500" : "text-red-500"
                                                    }`}
                                            >
                                                Resets local data
                                            </div>
                                        </div>
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>




            {
                showModal && selectedSlot && (
                    <div
                        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto"
                        onClick={closeModal}
                    >
                        <div
                            className={`rounded-xl shadow-2xl w-full max-w-md my-8 ${isDark ? "bg-slate-800" : "bg-white"
                                }`}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className={`${selectedColor.value} px-6 py-4 rounded-t-xl`}>
                                <h3 className="text-lg font-bold text-white">Add Task</h3>
                                <p className="text-sm text-white/90 mt-1">
                                    {viewType === "day"
                                        ? formatFullDate(currentDate)
                                        : `${days[selectedSlot.day]}, ${formatDate(
                                            selectedSlot.date
                                        )}`}
                                </p>
                            </div>

                            <div className="p-6 space-y-4">
                                <div>
                                    <label
                                        className={`block text-sm font-semibold mb-2 ${isDark ? "text-slate-200" : "text-slate-700"
                                            }`}
                                    >
                                        Task Title
                                    </label>
                                    <input
                                        type="text"
                                        value={taskTitle}
                                        onChange={(e) => setTaskTitle(e.target.value)}
                                        placeholder="e.g. Team Meeting"
                                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none ${isDark
                                            ? "bg-slate-700 border-slate-600 text-white placeholder-slate-400"
                                            : "border-slate-300"
                                            }`}
                                    />
                                </div>

                                <div>
                                    <label
                                        className={`block text-sm font-semibold mb-2 ${isDark ? "text-slate-200" : "text-slate-700"
                                            }`}
                                    >
                                        Start Time
                                    </label>
                                    <div className="flex gap-2">
                                        <input
                                            type="time"
                                            value={startTime}
                                            onChange={(e) => {
                                                const value = e.target.value;
                                                setStartTime(value);
                                                if (value) {
                                                    const [hours] = value.split(":").map(Number);
                                                    setStartAmPm(hours >= 12 ? "PM" : "AM");
                                                }
                                            }}
                                            className={`flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none ${isDark
                                                ? "bg-slate-700 border-slate-600 text-white"
                                                : "border-slate-300"
                                                }`}
                                        />
                                        <select
                                            value={startAmPm}
                                            onChange={(e) => setStartAmPm(e.target.value)}
                                            className={`px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none ${isDark
                                                ? "bg-slate-700 border-slate-600 text-white"
                                                : "border-slate-300"
                                                }`}
                                        >
                                            <option value="AM">AM</option>
                                            <option value="PM">PM</option>
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label
                                        className={`block text-sm font-semibold mb-2 ${isDark ? "text-slate-200" : "text-slate-700"
                                            }`}
                                    >
                                        End Time
                                    </label>
                                    <div className="flex gap-2">
                                        <input
                                            type="time"
                                            value={endTime}
                                            onChange={(e) => {
                                                const value = e.target.value;
                                                setEndTime(value);
                                                if (value) {
                                                    const [hours] = value.split(":").map(Number);
                                                    setEndAmPm(hours >= 12 ? "PM" : "AM");
                                                }
                                            }}
                                            className={`flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none ${isDark
                                                ? "bg-slate-700 border-slate-600 text-white"
                                                : "border-slate-300"
                                                }`}
                                        />
                                        <select
                                            value={endAmPm}
                                            onChange={(e) => setEndAmPm(e.target.value)}
                                            className={`px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none ${isDark
                                                ? "bg-slate-700 border-slate-600 text-white"
                                                : "border-slate-300"
                                                }`}
                                        >
                                            <option value="AM">AM</option>
                                            <option value="PM">PM</option>
                                        </select>
                                    </div>
                                    {!isValidTime() && (
                                        <p className="text-xs text-red-600 mt-1">
                                            End time must be after start time
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <label
                                        className={`block text-sm font-semibold mb-2 ${isDark ? "text-slate-200" : "text-slate-700"
                                            }`}
                                    >
                                        Color
                                    </label>
                                    <div className="grid grid-cols-10 gap-2">
                                        {taskColors.map((color) => (
                                            <button
                                                key={color.value}
                                                type="button"
                                                onClick={() => setSelectedColor(color)}
                                                className={`w-8 h-8 rounded-lg ${color.value
                                                    } border-2 transition-all ${selectedColor.value === color.value
                                                        ? "border-indigo-600 scale-110 ring-2 ring-indigo-400"
                                                        : "border-transparent hover:scale-105"
                                                    }`}
                                                title={color.name}
                                            />
                                        ))}
                                    </div>
                                    <p
                                        className={`text-xs mt-2 ${isDark ? "text-slate-400" : "text-slate-500"
                                            }`}
                                    >
                                        Selected: {selectedColor.name}
                                    </p>
                                </div>

                                <div>
                                    <label
                                        className={`block text-sm font-semibold mb-2 ${isDark ? "text-slate-200" : "text-slate-700"
                                            }`}
                                    >
                                        Label/Tag Name
                                    </label>
                                    <input
                                        type="text"
                                        value={taskLabel}
                                        onChange={(e) => setTaskLabel(e.target.value)}
                                        placeholder="e.g. Work, Study, Exercise"
                                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none ${isDark
                                            ? "bg-slate-700 border-slate-600 text-white placeholder-slate-400"
                                            : "border-slate-300"
                                            }`}
                                    />
                                    <p
                                        className={`text-xs mt-1 ${isDark ? "text-slate-400" : "text-slate-500"
                                            }`}
                                    >
                                        Assign a category or subject name to this task
                                    </p>
                                </div>

                                <div>
                                    <label
                                        className={`block text-sm font-semibold mb-2 ${isDark ? "text-slate-200" : "text-slate-700"
                                            }`}
                                    >
                                        Description (optional)
                                    </label>
                                    <textarea
                                        value={taskDescription}
                                        onChange={(e) => setTaskDescription(e.target.value)}
                                        placeholder="Add notes or details..."
                                        rows={3}
                                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none resize-none ${isDark
                                            ? "bg-slate-700 border-slate-600 text-white placeholder-slate-400"
                                            : "border-slate-300"
                                            }`}
                                    />
                                </div>
                            </div>

                            <div
                                className={`flex gap-3 px-6 py-4 rounded-b-xl border-t ${isDark
                                    ? "bg-slate-700 border-slate-600"
                                    : "bg-slate-50 border-slate-200"
                                    }`}
                            >
                                <button
                                    onClick={closeModal}
                                    className={`flex-1 px-4 py-2 border rounded-lg transition-colors font-medium text-sm ${isDark
                                        ? "border-slate-600 hover:bg-slate-600 text-white"
                                        : "border-slate-300 hover:bg-white"
                                        }`}
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={saveTask}
                                    disabled={!taskTitle.trim() || !isValidTime()}
                                    className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium text-sm disabled:bg-slate-300 disabled:cursor-not-allowed"
                                >
                                    Save Task
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }

            {/* Debug Panel - Commented out after fixing task display issue */}
            {/* <DebugPanel 
        tasks={tasks}
        currentDate={currentDate}
        formatDateKey={formatDateKey} 
      /> */}
        </main >
    );
}
