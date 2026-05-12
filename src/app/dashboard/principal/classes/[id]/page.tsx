import { getClassMonthlyAttendance } from '@/lib/actions/principal';
import { AttendanceSheet } from '@/components/dashboard/AttendanceSheet';
import { GlassCard } from '@/components/ui/glass-card';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import Link from 'next/link';
// import { getClassDetails } from ... (Need a way to get class name, but we can do without for now or add it)

export default async function ClassAttendancePage(props: { params: Promise<{ id: string }>, searchParams?: Promise<{ month?: string, year?: string }> }) {
    const params = await props.params;
    const searchParams = await props.searchParams;
    const classId = params.id;

    const now = new Date();
    const currentMonth = searchParams?.month ? parseInt(searchParams.month) : now.getMonth();
    const currentYear = searchParams?.year ? parseInt(searchParams.year) : now.getFullYear();

    const data = await getClassMonthlyAttendance(classId, currentMonth, currentYear);

    if (!data) return <div>Class not found</div>;

    const monthName = new Date(currentYear, currentMonth).toLocaleString('default', { month: 'long' });

    return (
        <div className="p-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 w-full max-w-[100vw] overflow-x-hidden">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <div className="flex items-center gap-2 text-text-muted text-sm mb-1">
                        <Link href="/dashboard/principal/classes" className="hover:text-white transition-colors">Classes</Link>
                        <span>/</span>
                        <span>Sheet</span>
                    </div>
                    <h1 className="text-3xl font-bold text-white">{monthName} {currentYear} Attendance</h1>
                    <p className="text-text-secondary">Detailed daily breakdown.</p>
                </div>

                <div className="flex gap-2">
                    <Button variant="outline" className="gap-2 border-white/10 text-text-muted hover:text-white hover:bg-white/5">
                        <Download size={16} /> Export CSV
                    </Button>
                </div>
            </div>

            <GlassCard className="p-0 border-0 bg-transparent shadow-none">
                <AttendanceSheet
                    students={data.students}
                    attendanceData={data.attendanceData}
                    holidays={data.holidays}
                    year={currentYear}
                    month={currentMonth}
                />
            </GlassCard>
        </div>
    );
}
