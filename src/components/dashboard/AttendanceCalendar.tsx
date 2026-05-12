'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { GlassCard } from '@/components/ui/glass-card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface CalendarProps {
    attendance: any[];
    holidays: any[];
    startDate?: string;
}

const STATUS_COLORS = {
    Present: 'bg-green-500/20 text-green-400 border-green-500/50',
    Late: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50',
    Absent: 'bg-red-500/20 text-red-400 border-red-500/50',
    Leave: 'bg-blue-500/20 text-blue-400 border-blue-500/50',
    Holiday: 'bg-white/10 text-white border-white/20',
    Weekend: 'bg-white/5 text-text-muted border-transparent',
    Disabled: 'opacity-30 text-text-muted border-transparent cursor-not-allowed',
    Default: 'bg-transparent text-text-secondary border-transparent hover:bg-white/5',
};

export function AttendanceCalendar({ attendance, holidays, startDate: startDateProp }: CalendarProps) {
    const [currentDate, setCurrentDate] = useState(new Date());

    // Use default local date parsing for start date to match calendar days
    // "2026-06-01" -> split and make local date at NOON (12:00) to avoid midnight timezone shifts
    const startDateStr = startDateProp || process.env.NEXT_PUBLIC_ATTENDANCE_START_DATE || '2026-06-01';
    const [startY, startM, startD] = startDateStr.split('-').map(Number);
    const startDate = new Date(startY, startM - 1, startD, 12, 0, 0);

    // Helper: Normalize to local YYYY-MM-DD for comparison
    const toDateKey = (date: Date) => {
        return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    };

    const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
    const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);

    const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
    const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

    const today = new Date();
    today.setHours(12, 0, 0, 0); // Set to Noon

    const getDayStatus = (day: number) => {
        const dateObj = new Date(year, month, day, 12, 0, 0); // Local NOON
        const dateKey = toDateKey(dateObj); // YYYY-MM-DD


        // 0. Check Before Start Date
        // Compare timestamps of local dates
        if (dateObj.getTime() < startDate.getTime()) {
            return { status: 'Disabled', label: 'Before Term', detail: null };
        }

        // 1. Check Holiday (Compare YYYY-MM-DD strings to avoid time issues)
        const holiday = holidays.find(h => {
            const hDate = new Date(h.date);
            return toDateKey(hDate) === dateKey;
        });
        if (holiday) return { status: 'Disabled', label: `Holiday: ${holiday.name}`, detail: null };

        // 2. Check Sunday
        const dayOfWeek = dateObj.getDay();
        if (dayOfWeek === 0) return { status: 'Disabled', label: 'Sunday (Non-Working)', detail: null };

        // 3. Check Second Saturday
        if (dayOfWeek === 6) {
            const weekNum = Math.ceil(day / 7);
            if (weekNum === 2) return { status: 'Disabled', label: 'Second Saturday', detail: null };
        }

        // 4. Check Attendance
        const record = attendance.find(a => {
            const aDate = new Date(a.date);
            return toDateKey(aDate) === dateKey;
        });
        if (record) {
            return { status: record.status, label: record.status, detail: record };
        }

        // 5. Implicit Absent
        // If date is valid (>= Start Date) AND (<= Today) AND not holiday/weekend
        if (dateObj.getTime() <= today.getTime()) {
            return { status: 'Absent', label: 'Absent', detail: null };
        }

        return { status: 'Default', label: '', detail: null };
    };

    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
    const padding = Array.from({ length: firstDay }, (_, i) => i);

    return (
        <div className="w-full">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-white">
                    {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </h2>
                <div className="flex gap-2">
                    <button onClick={prevMonth} className="p-2 rounded-lg hover:bg-white/5 text-white transition">
                        <ChevronLeft size={20} />
                    </button>
                    <button onClick={nextMonth} className="p-2 rounded-lg hover:bg-white/5 text-white transition">
                        <ChevronRight size={20} />
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-7 gap-2 mb-2 text-center text-sm font-medium text-text-muted">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => <div key={d}>{d}</div>)}
            </div>

            <div className="grid grid-cols-7 gap-2">
                {padding.map(i => <div key={`pad-${i}`} />)}

                {days.map(day => {
                    const statusObj = getDayStatus(day);
                    const { status, label, detail } = statusObj;

                    // Second Saturday Check
                    const date = new Date(year, month, day);
                    const dayOfWeek = date.getDay();
                    const isSaturday = dayOfWeek === 6;
                    let isSecondSaturday = false;
                    if (isSaturday) {
                        const weekNum = Math.ceil(day / 7);
                        if (weekNum === 2) isSecondSaturday = true;
                    }

                    // Special Overrides for UI grouping if needed, but getDayStatus handles priority
                    let finalStatus = status;
                    let finalLabel = label;

                    const colorClass = STATUS_COLORS[finalStatus as keyof typeof STATUS_COLORS] || STATUS_COLORS.Default;

                    return (
                        <Dialog key={day}>
                            <DialogTrigger asChild>
                                <div
                                    className={cn(
                                        "aspect-square rounded-xl flex flex-col items-center justify-center border text-sm font-medium transition-all relative group cursor-pointer hover:scale-105",
                                        colorClass
                                    )}
                                >
                                    <span>{day}</span>
                                    {finalStatus !== 'Default' && finalStatus !== 'Weekend' && finalStatus !== 'Disabled' && (
                                        <div className="absolute bottom-1 w-1.5 h-1.5 rounded-full bg-current opacity-50" />
                                    )}
                                </div>
                            </DialogTrigger>
                            <DialogContent className="bg-bg-card border-white/10 text-white">
                                <DialogHeader>
                                    <DialogTitle>
                                        {date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                                    </DialogTitle>
                                </DialogHeader>
                                <div className="space-y-4 pt-4">
                                    <div className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/5">
                                        <span className="text-text-secondary">Status</span>
                                        <span className={cn(
                                            "px-2 py-1 rounded text-sm font-medium",
                                            finalStatus === 'Present' ? "bg-green-500/20 text-green-400" :
                                                finalStatus === 'Absent' ? "bg-red-500/20 text-red-400" :
                                                    finalStatus === 'Late' ? "bg-yellow-500/20 text-yellow-400" :
                                                        "bg-white/10 text-white"
                                        )}>
                                            {finalStatus === 'Default' ? 'No Record' : finalLabel || finalStatus}
                                        </span>
                                    </div>

                                    {detail && (finalStatus === 'Present' || finalStatus === 'Late') && (
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="p-3 rounded-lg bg-white/5 border border-white/5">
                                                <p className="text-xs text-text-muted mb-1">Check In</p>
                                                <p className="font-mono">{new Date(detail.entryTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                            </div>
                                            <div className="p-3 rounded-lg bg-white/5 border border-white/5">
                                                <p className="text-xs text-text-muted mb-1">Total Hours</p>
                                                <p className="font-mono">--</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </DialogContent>
                        </Dialog>
                    );
                })}
            </div>
        </div>
    );
}
