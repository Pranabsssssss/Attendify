import { getTeacherDashboardData } from '@/lib/actions/teacher';
import { GlassCard } from '@/components/ui/glass-card';
import { Users, Clock, AlertCircle, FileText } from 'lucide-react';
import Link from 'next/link';
import { HolidayBanner } from '@/components/dashboard/HolidayBanner';

export default async function TeacherDashboard(props: { searchParams?: Promise<{ month?: string, year?: string }> }) {
    const searchParams = await props.searchParams;
    const data = await getTeacherDashboardData();

    if (!data) {
        return (
            <div className="p-8 text-white">
                <h1 className="text-2xl font-bold">No Class Assigned</h1>
                <p className="text-text-secondary">Please contact IT Admin to assign you a class.</p>
            </div>
        );
    }

    const attendancePercent = data.totalStudents > 0
        ? Math.round((data.presentCount / data.totalStudents) * 100)
        : 0;

    const now = new Date();
    const currentMonth = searchParams?.month ? parseInt(searchParams.month) : now.getMonth();
    const currentYear = searchParams?.year ? parseInt(searchParams.year) : now.getFullYear();

    return (
        <div className="p-8 space-y-8 animate-in fade-in duration-500">
            <HolidayBanner />
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-white">Class {data.className} Overview</h1>
                    <p className="text-text-secondary">Manage attendance and student requests.</p>
                </div>
                <div className="text-right">
                    <p className="text-sm text-text-secondary">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                </div>
            </div>

            {/* UI Updated according to user request */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <GlassCard className="relative overflow-hidden group transition-all duration-300 hover:scale-[1.02] hover:shadow-lg hover:border-primary/30">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Users size={80} />
                    </div>
                    <p className="text-sm font-medium text-primary-light">Class Attendance</p>
                    <h3 className="text-4xl font-bold text-white mt-2">{attendancePercent}%</h3>
                    <p className="text-xs text-text-muted mt-2">Average for Today</p>
                </GlassCard>

                <GlassCard className="relative overflow-hidden group transition-all duration-300 hover:scale-[1.02] hover:shadow-lg hover:border-blue-500/30">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Users size={80} />
                    </div>
                    <p className="text-sm font-medium text-text-secondary">Total Students</p>
                    <h3 className="text-4xl font-bold text-white mt-2">{data.totalStudents}</h3>
                    <p className="text-xs text-blue-400 mt-2">Registered in Class</p>
                </GlassCard>

                <GlassCard className="relative overflow-hidden group transition-all duration-300 hover:scale-[1.02] hover:shadow-lg hover:border-yellow-500/30">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Clock size={80} />
                    </div>
                    <p className="text-sm font-medium text-text-secondary">Late Today</p>
                    <h3 className="text-4xl font-bold text-white mt-2">{data.lateCount}</h3>
                    <p className="text-xs text-yellow-400 mt-2">Students arrived late</p>
                </GlassCard>

                <GlassCard className="relative overflow-hidden group transition-all duration-300 hover:scale-[1.02] hover:shadow-lg hover:border-red-500/30">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <AlertCircle size={80} />
                    </div>
                    <p className="text-sm font-medium text-text-secondary">Low Attendance</p>
                    <h3 className="text-4xl font-bold text-white mt-2">{data.lowAttendanceCount}</h3>
                    <p className="text-xs text-red-400 mt-2">Students below 75%</p>
                </GlassCard>
            </div>
            <div className="mt-8">
                <GlassCard className="p-0 border-0 bg-transparent shadow-none overflow-hidden">
                    <div className="p-6 border-b border-white/5 flex justify-between items-center bg-white/5">
                        <div>
                            <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                <FileText className="text-primary" />
                                Monthly Attendance Sheet
                            </h3>
                            <p className="text-sm text-text-muted">Detailed view for the current month.</p>
                        </div>
                    </div>

                    {/* Async Server Component Wrapper for Data Fetching */}
                    <SuspenseAttendanceSheet classId={data.classId} month={currentMonth} year={currentYear} />
                </GlassCard>
            </div>
        </div>
    );
}

import { getClassMonthlyAttendance } from '@/lib/actions/principal';
import { AttendanceSheet } from '@/components/dashboard/AttendanceSheet';

async function SuspenseAttendanceSheet({ classId, month, year }: { classId: string, month: number, year: number }) {
    const sheetData = await getClassMonthlyAttendance(classId, month, year);

    if (!sheetData) return <div className="p-6 text-text-muted">Unable to load attendance sheet.</div>;

    return (
        <AttendanceSheet
            students={sheetData.students}
            attendanceData={sheetData.attendanceData}
            holidays={sheetData.holidays}
            year={year}
            month={month}
        />
    );
}
