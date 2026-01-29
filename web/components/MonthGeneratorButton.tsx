import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Task, Event, ScheduledBlock, Preferences } from '@/shared/types';

interface MonthGeneratorButtonProps {
    week1Blocks: ScheduledBlock[];
    week1Tasks: Task[];
    existingEvents: Event[];
    preferences: Preferences;
    onMonthGenerated: (result: GenerateMonthResult) => void;
    disabled?: boolean;
}

interface GenerateMonthResult {
    generatedTasks: Task[];
    scheduledBlocks: ScheduledBlock[];
    appliedTechniques: string[];
    patterns: {
        workHoursStart: number;
        workHoursEnd: number;
        avgTasksPerDay: number;
        taskTypeDistribution: Record<string, number>;
        peakProductivityHours: number[];
        breakFrequencyMinutes: number;
        preferredTaskClustering: boolean;
    };
}

export default function MonthGeneratorButton({
    week1Blocks,
    week1Tasks,
    existingEvents,
    preferences,
    onMonthGenerated,
    disabled = false,
}: MonthGeneratorButtonProps) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [loadingStep, setLoadingStep] = useState(0);

    const canGenerate = week1Blocks.length >= 5; // Need at least 5 tasks in Week 1

    const loadingSteps = [
        { icon: '🧠', text: 'Analyzing your Week 1 patterns...' },
        { icon: '📊', text: 'Detecting productivity trends...' },
        { icon: '⚡', text: 'Optimizing task distribution...' },
        { icon: '🎯', text: 'Applying AI techniques...' },
        { icon: '✨', text: 'Generating your schedule...' },
    ];

    const handleGenerate = async () => {
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
        const stepInterval = setInterval(() => {
            setLoadingStep((prev) => {
                if (prev < loadingSteps.length - 1) return prev + 1;
                return prev;
            });
        }, 800);

        try {
            console.log('Starting month generation...');
            console.log('Week 1 blocks:', week1Blocks);
            console.log('Week 1 tasks:', week1Tasks);
            console.log('Week 1 tasks sample:', week1Tasks[0]);
            console.log('Week 1 task colors:', week1Tasks.map(t => ({ title: t.title, color: t.color })));

            // Calculate Week 2 start date (7 days from now, or from Week 1 end)
            const week2Start = new Date();
            week2Start.setDate(week2Start.getDate() + 7);

            console.log('Calling API with start date:', week2Start.toISOString());

            const response = await fetch('/api/generate-month', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    week1Blocks,
                    week1Tasks,
                    existingEvents,
                    preferences,
                    startDate: week2Start.toISOString(),
                }),
            });

            console.log('API response status:', response.status);

            if (!response.ok) {
                const errorText = await response.text();
                console.error('API error response:', errorText);
                throw new Error(`Failed to generate month: ${response.statusText} - ${errorText}`);
            }

            const result: GenerateMonthResult = await response.json();
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
            setTimeout(() => {
                clearInterval(stepInterval);

                // Auto-apply the generated schedule
                onMonthGenerated(result);

                console.log('Successfully applied generated schedule');

                // Brief delay before hiding loading screen
                setTimeout(() => {
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

    return (
        <div className="space-y-4">
            {/* Generate Button */}
            <div className="flex items-center gap-4">
                <button
                    onClick={handleGenerate}
                    disabled={disabled || !canGenerate || loading}
                    suppressHydrationWarning
                    className={`
            px-6 py-3 rounded-lg font-medium text-white
            transition-all duration-200 transform
            ${canGenerate && !disabled && !loading
                            ? 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 hover:scale-105 shadow-lg hover:shadow-xl'
                            : 'bg-gray-400 cursor-not-allowed'
                        }
          `}
                >
                    {loading ? (
                        <span className="flex items-center gap-2">
                            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                <circle
                                    className="opacity-25"
                                    cx="12"
                                    cy="12"
                                    r="10"
                                    stroke="currentColor"
                                    strokeWidth="4"
                                    fill="none"
                                />
                                <path
                                    className="opacity-75"
                                    fill="currentColor"
                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                />
                            </svg>
                            Generating...
                        </span>
                    ) : (
                        '✨ Generate Rest of Month'
                    )}
                </button>

                {!canGenerate && (
                    <p className="text-sm text-gray-600" suppressHydrationWarning>
                        Schedule at least 5 tasks in Week 1 to enable AI generation
                    </p>
                )}
            </div>

            {/* Error Message */}
            {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                    <p className="font-medium">Error</p>
                    <p className="text-sm">{error}</p>
                </div>
            )}

            {/* Fancy Loading Modal */}
            <Portal>
                <AnimatePresence>
                    {loading && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-gradient-to-br from-purple-900/95 via-indigo-900/95 to-blue-900/95 backdrop-blur-sm flex items-center justify-center z-50"
                        >
                            <motion.div
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.8, opacity: 0 }}
                                className="bg-white/10 backdrop-blur-xl rounded-3xl p-12 max-w-md w-full mx-4 border border-white/20 shadow-2xl"
                            >
                                {/* Animated Icon */}
                                <motion.div
                                    animate={{
                                        scale: [1, 1.2, 1],
                                        rotate: [0, 360],
                                    }}
                                    transition={{
                                        duration: 2,
                                        repeat: Infinity,
                                        ease: "easeInOut",
                                    }}
                                    className="text-8xl text-center mb-8"
                                >
                                    {loadingSteps[loadingStep].icon}
                                </motion.div>

                                {/* Loading Text */}
                                <AnimatePresence mode="wait">
                                    <motion.div
                                        key={loadingStep}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -20 }}
                                        transition={{ duration: 0.3 }}
                                        className="text-center"
                                    >
                                        <h3 className="text-2xl font-bold text-white mb-2">
                                            {loadingSteps[loadingStep].text}
                                        </h3>
                                    </motion.div>
                                </AnimatePresence>

                                {/* Progress Bar */}
                                <div className="mt-8 bg-white/20 rounded-full h-2 overflow-hidden">
                                    <motion.div
                                        initial={{ width: '0%' }}
                                        animate={{ width: `${((loadingStep + 1) / loadingSteps.length) * 100}%` }}
                                        transition={{ duration: 0.5 }}
                                        className="h-full bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400"
                                    />
                                </div>

                                {/* Step Indicator */}
                                <div className="mt-4 text-center text-white/70 text-sm">
                                    Step {loadingStep + 1} of {loadingSteps.length}
                                </div>

                                {/* Floating Particles */}
                                <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-3xl">
                                    {[...Array(20)].map((_, i) => (
                                        <motion.div
                                            key={i}
                                            initial={{
                                                x: Math.random() * 400,
                                                y: Math.random() * 400,
                                                opacity: 0,
                                            }}
                                            animate={{
                                                y: [null, Math.random() * -100],
                                                opacity: [0, 1, 0],
                                            }}
                                            transition={{
                                                duration: 2 + Math.random() * 2,
                                                repeat: Infinity,
                                                delay: Math.random() * 2,
                                            }}
                                            className="absolute w-2 h-2 bg-white rounded-full"
                                        />
                                    ))}
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </Portal>
        </div >
    );
}

// Simple Portal Component
const Portal = ({ children }: { children: React.ReactNode }) => {
    const [mounted, setMounted] = useState(false);
    useEffect(() => setMounted(true), []);
    if (!mounted) return null;
    return createPortal(children, document.body);
};
