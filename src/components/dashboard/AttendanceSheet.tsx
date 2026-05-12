'use client';

import { useState, useRef, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Maximize2, Minimize2, RefreshCw, Clock, Calendar as CalendarIcon, User as UserIcon, AlertCircle, CheckCircle2, XCircle, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";

interface AttendanceSheetProps {
    students: any[];
    attendanceData: Record<string, Record<number, { status: string; entryTime?: string | null }>>;
    holidays: Record<number, string>;
    year: number;
    month: number;
}

export function AttendanceSheet({ students, attendanceData, holidays, year, month }: AttendanceSheetProps) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const containerRef = useRef<HTMLDivElement>(null);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);

    // Interactive States
    const [selectedCell, setSelectedCell] = useState<{ student: any; day: number; data: any; holiday?: string } | null>(null);
    const [selectedStudent, setSelectedStudent] = useState<any | null>(null);

    const toggleFullscreen = () => {
        setIsFullscreen(!isFullscreen);
    };

    const handleRefresh = () => {
        setIsRefreshing(true);
        router.refresh();
        setTimeout(() => setIsRefreshing(false), 1000);
    };

    const handleMonthChange = (direction: 'prev' | 'next') => {
        let newMonth = month + (direction === 'next' ? 1 : -1);
        let newYear = year;

        if (newMonth > 11) { newMonth = 0; newYear++; }
        if (newMonth < 0) { newMonth = 11; newYear--; }

        const params = new URLSearchParams(window.location.search);
        params.set('month', newMonth.toString());
        params.set('year', newYear.toString());

        startTransition(() => {
            router.push(`?${params.toString()}`, { scroll: false });
        });
    };

    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

    const getDayName = (day: number) => {
        const date = new Date(year, month, day);
        return date.toLocaleDateString('en-US', { weekday: 'short' });
    };

    const isWeekend = (day: number) => {
        const date = new Date(year, month, day);
        return date.getDay() === 0; // Sunday
    };

    const isSecondSaturday = (day: number) => {
        const date = new Date(year, month, day);
        return date.getDay() === 6 && Math.ceil(day / 7) === 2;
    };

    // Calculate Stats for Selected Student
    const getStudentStats = (studentId: string) => {
        let present = 0, late = 0, absent = 0, leave = 0, totalDays = 0;

        const now = new Date();
        const currentYear = now.getFullYear();
        const currentMonth = now.getMonth();
        const currentDay = now.getDate();

        days.forEach(day => {
            // Only count past days or today
            const checkDate = new Date(year, month, day);
            if (checkDate > now) return;
            if (isWeekend(day) || isSecondSaturday(day) || holidays[day]) return;

            totalDays++;
            const record = attendanceData[studentId]?.[day];
            const status = record?.status;

            if (status === 'Present') present++;
            else if (status === 'Late') { late++; present++; } // Late counts as present? Usually separate or partial. Let's count as Present for % but track Late.
            else if (status === 'Absent' || (!status && checkDate < now)) absent++; // Implicit absent
            else if (status === 'Leave') leave++;
        });

        // Adjusted logic: If Late is considered Present for attendance %, include it.
        // Usually % = (Present + Late) / Working Days
        const percentage = totalDays > 0 ? ((present / totalDays) * 100).toFixed(1) : '0';

        return { present, late, absent, leave, percentage, totalDays };
    };

    return (
        <div
            ref={containerRef}
            className={cn(
                "transition-all duration-300",
                isFullscreen
                    ? "fixed inset-0 z-[100] bg-[#0a0a16] p-8 flex flex-col group"
                    : "relative w-full overflow-hidden rounded-xl border border-white/10 bg-black/20 group"
            )}
        >
            {/* Toolbar - fixed at top of sheet */}
            <div className="flex items-center justify-between p-4 border-b border-white/10 bg-white/5">
                <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-white">Attendance Sheet</h3>
                    <div className={cn(
                        "flex items-center gap-1 bg-black/40 rounded-lg p-1 border border-white/10 transition-opacity",
                        isPending && "opacity-50 pointer-events-none"
                    )}>
                        <Button variant="ghost" size="icon" className="h-6 w-6 hover:bg-white/10 text-white" onClick={() => handleMonthChange('prev')}>
                            <ChevronLeft size={14} />
                        </Button>
                        <div className="px-2 py-0.5 text-[12px] font-medium text-white min-w-[100px] text-center flex items-center justify-center gap-2">
                            {isPending && <Loader2 className="animate-spin h-3 w-3" />}
                            {new Date(year, month).toLocaleString('default', { month: 'long', year: 'numeric' })}
                        </div>
                        <Button variant="ghost" size="icon" className="h-6 w-6 hover:bg-white/10 text-white" onClick={() => handleMonthChange('next')}>
                            <ChevronRight size={14} />
                        </Button>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleRefresh}
                        className="gap-2 border-white/10 bg-white/5 hover:bg-white/10 text-text-secondary hover:text-white transition-colors"
                        disabled={isRefreshing}
                    >
                        <RefreshCw size={14} className={cn(isRefreshing && "animate-spin")} />
                        <span className="hidden sm:inline">Refresh</span>
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={toggleFullscreen}
                        className="gap-2 border-white/10 bg-white/5 hover:bg-white/10 text-text-secondary hover:text-white transition-colors"
                    >
                        {isFullscreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
                        <span className="hidden sm:inline">{isFullscreen ? "Exit" : "Fullscreen"}</span>
                    </Button>
                </div>
            </div>

            <div className={cn("overflow-x-auto custom-scrollbar", isFullscreen && "flex-1")}>
                <div className="min-w-max">
                    {/* Header Row */}
                    <div className="flex border-b border-white/10 bg-primary/20 sticky top-0 z-10 transition-colors duration-300">
                        <div className="w-48 p-3 text-sm font-bold text-white border-r border-white/10 shrink-0 md:sticky md:left-0 z-20 bg-primary/20 backdrop-blur-sm">
                            Student
                        </div>
                        {days.map(day => (
                            <div key={day} className={cn(
                                "flex flex-col items-center justify-center w-12 p-2 border-r border-white/5 text-xs shrink-0 transition-colors duration-300",
                                (isWeekend(day) || isSecondSaturday(day)) ? "bg-red-500/10 text-red-200" : "text-white"
                            )}>
                                <span className="font-bold">{day}</span>
                                <span className="opacity-70 text-[10px] uppercase">{getDayName(day)}</span>
                            </div>
                        ))}
                    </div>

                    {/* Student Rows */}
                    {students.map((student, index) => (
                        <div
                            key={student._id}
                            className="flex border-b border-white/5 hover:bg-white/5 transition-colors group animate-in fade-in slide-in-from-bottom-4 mb-0.5"
                            style={{ animationDelay: `${index * 30}ms`, animationFillMode: 'backwards' }}
                        >
                            {/* Student Name Cell - Clickable */}
                            <div
                                className="w-48 p-3 border-r border-white/10 shrink-0 flex flex-col justify-center cursor-pointer hover:bg-primary/10 hover:pl-4 transition-all duration-300 md:sticky md:left-0 z-10 bg-[#0a0a16] group-hover:bg-[#1a1a2e]"
                                onClick={() => setSelectedStudent(student)}
                            >
                                <p className="text-sm font-bold text-white truncate text-transform uppercase">{student.name}</p>
                                <p className="text-[10px] text-text-muted">{student.studentId}</p>
                            </div>

                            {/* Attendance Cells */}
                            {days.map(day => {
                                const record = attendanceData[student._id]?.[day];
                                let status = record?.status;

                                // Date Logic
                                const cellDate = new Date(year, month, day);
                                const today = new Date();
                                const cellTime = cellDate.setHours(0, 0, 0, 0);
                                const todayTime = today.setHours(0, 0, 0, 0);

                                // Start Date Logic
                                const startDateEnv = process.env.NEXT_PUBLIC_ATTENDANCE_START_DATE;
                                const startDate = startDateEnv ? new Date(startDateEnv) : null;
                                if (startDate) startDate.setHours(0, 0, 0, 0);

                                const isBeforeStart = startDate && cellTime < startDate.getTime();

                                if (!status && !holidays[day] && !isWeekend(day) && !isSecondSaturday(day) && cellTime < todayTime && !isBeforeStart) {
                                    status = 'Absent';
                                }

                                let cellContent = '-';
                                let cellClass = 'text-text-muted opacity-20';

                                if (isBeforeStart) {
                                    cellContent = '•';
                                    cellClass = 'bg-white/5 text-white/5 cursor-not-allowed'; // Greyed out, no pointer events handled by onClick check or CSS if needed, but 'cursor-not-allowed' suggests it.
                                } else if (holidays[day]) {
                                    cellContent = 'H';
                                    cellClass = 'text-gray-400 bg-white/5 font-bold cursor-help hover:bg-white/10';
                                } else if (isWeekend(day) || isSecondSaturday(day)) {
                                    cellContent = '-';
                                    cellClass = 'bg-white/5 text-text-muted';
                                } else if (status === 'Present') {
                                    cellContent = 'P';
                                    cellClass = 'text-green-400 bg-green-500/10 font-bold border-green-500/20';
                                } else if (status === 'Late') {
                                    cellContent = 'L';
                                    cellClass = 'text-yellow-400 bg-yellow-500/10 font-bold border-yellow-500/20';
                                } else if (status === 'Absent') {
                                    cellContent = 'A';
                                    cellClass = 'text-red-400 bg-red-500/10 font-bold border-red-500/20';
                                } else if (status === 'Leave') {
                                    cellContent = 'LV';
                                    cellClass = 'text-blue-400 bg-blue-500/10 font-bold border-blue-500/20';
                                }

                                return (
                                    <div
                                        key={day}
                                        className={cn(
                                            "w-12 border-r border-white/5 flex items-center justify-center shrink-0 text-xs cursor-pointer relative",
                                            !isBeforeStart && "transition-all duration-200 transform hover:scale-125 hover:z-20 hover:shadow-xl hover:rounded-md",
                                            cellClass
                                        )}
                                        onClick={() => !isBeforeStart && setSelectedCell({ student, day, data: record || { status }, holiday: holidays[day] })}
                                    >
                                        {cellContent}
                                    </div>
                                );
                            })}
                        </div>
                    ))}
                </div>
            </div>

            {/* Student Stats Dialog */}
            <Dialog open={!!selectedStudent} onOpenChange={(open) => !open && setSelectedStudent(null)}>
                <DialogContent className="bg-[#0a0a16] border-white/10 text-white sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-xl">
                            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                                <UserIcon size={18} />
                            </div>
                            {selectedStudent?.name}
                        </DialogTitle>
                        <DialogDescription className="text-text-muted">
                            Attendance statistics for {new Date(year, month).toLocaleString('default', { month: 'long', year: 'numeric' })}
                        </DialogDescription>
                    </DialogHeader>

                    {selectedStudent && (() => {
                        const stats = getStudentStats(selectedStudent._id);
                        return (
                            <div className="grid grid-cols-2 gap-4 mt-4">
                                <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/20 flex flex-col items-center justify-center text-center">
                                    <span className="text-2xl font-bold text-green-400">{stats.percentage}%</span>
                                    <span className="text-xs text-text-muted">Attendance Rate</span>
                                </div>
                                <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 flex flex-col items-center justify-center text-center">
                                    <span className="text-2xl font-bold text-blue-400">{stats.present}</span>
                                    <span className="text-xs text-text-muted">Days Present</span>
                                </div>
                                <div className="p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/20 flex flex-col items-center justify-center text-center">
                                    <span className="text-2xl font-bold text-yellow-400">{stats.late}</span>
                                    <span className="text-xs text-text-muted">Late Arrivals</span>
                                </div>
                                <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex flex-col items-center justify-center text-center">
                                    <span className="text-2xl font-bold text-red-400">{stats.absent}</span>
                                    <span className="text-xs text-text-muted">Days Absent</span>
                                </div>
                            </div>
                        );
                    })()}
                </DialogContent>
            </Dialog>

            {/* Daily Details Dialog */}
            <Dialog open={!!selectedCell} onOpenChange={(open) => !open && setSelectedCell(null)}>
                <DialogContent className="bg-[#0a0a16] border-white/10 text-white sm:max-w-sm">
                    <DialogHeader>
                        <DialogTitle className="text-lg">
                            {new Date(year, month, selectedCell?.day || 1).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}
                        </DialogTitle>
                        <DialogDescription>
                            Details for {selectedCell?.student.name}
                        </DialogDescription>
                    </DialogHeader>

                    {selectedCell && (
                        <div className="space-y-4 mt-4">
                            {selectedCell.holiday ? (
                                <div className="flex items-center gap-3 p-3 rounded-lg bg-purple-500/10 border border-purple-500/20">
                                    <CalendarIcon className="text-purple-400" />
                                    <div>
                                        <p className="font-bold text-purple-200">Holiday</p>
                                        <p className="text-sm text-purple-300/70">{selectedCell.holiday}</p>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <div className={cn(
                                        "flex items-center gap-3 p-3 rounded-lg border",
                                        selectedCell.data.status === 'Present' ? "bg-green-500/10 border-green-500/20" :
                                            selectedCell.data.status === 'Late' ? "bg-yellow-500/10 border-yellow-500/20" :
                                                selectedCell.data.status === 'Absent' ? "bg-red-500/10 border-red-500/20" :
                                                    selectedCell.data.status === 'Leave' ? "bg-blue-500/10 border-blue-500/20" :
                                                        "bg-white/5 border-white/10"
                                    )}>
                                        {selectedCell.data.status === 'Present' && <CheckCircle2 className="text-green-400" />}
                                        {selectedCell.data.status === 'Late' && <Clock className="text-yellow-400" />}
                                        {selectedCell.data.status === 'Absent' && <XCircle className="text-red-400" />}
                                        {selectedCell.data.status === 'Leave' && <AlertCircle className="text-blue-400" />}

                                        <div>
                                            <p className="font-bold text-white">{selectedCell.data.status || 'No Status'}</p>
                                            <p className="text-xs text-text-muted">Attendance Status</p>
                                        </div>
                                    </div>

                                    {(selectedCell.data.status === 'Present' || selectedCell.data.status === 'Late') && (
                                        <div className="flex items-center gap-3 p-3 rounded-lg bg-white/5 border border-white/10">
                                            <Clock className="text-text-secondary" />
                                            <div>
                                                <p className="font-bold text-white">
                                                    {selectedCell.data.entryTime ? new Date(selectedCell.data.entryTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : '--:--'}
                                                </p>
                                                <p className="text-xs text-text-muted">Check-in Time</p>
                                            </div>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
