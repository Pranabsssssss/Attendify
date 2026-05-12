import { getPrincipalDashboardData } from '@/lib/actions/principal';
import { GlassCard } from '@/components/ui/glass-card';
import { Users, TrendingUp, TrendingDown, Star, AlertOctagon } from 'lucide-react';

export default async function PrincipalDashboard() {
    const data = await getPrincipalDashboardData();

    if (!data) return <div>Access Denied</div>;

    return (
        <div className="p-8 space-y-8 animate-in fade-in duration-500">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-white">Principal Dashboard</h1>
                    <p className="text-text-secondary">School-wide attendance analytics.</p>
                </div>
                <div className="text-right">
                    <p className="text-sm text-text-secondary">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <GlassCard className="bg-primary/10 border-primary/20">
                    <p className="text-sm font-medium text-primary-light">Overall Attendance</p>
                    <h3 className="text-4xl font-bold text-white mt-2">{data.attendanceRate}%</h3>
                    <p className="text-xs text-text-muted mt-2">Across all classes today</p>
                </GlassCard>

                <GlassCard>
                    <p className="text-sm font-medium text-text-secondary">Total Students</p>
                    <h3 className="text-4xl font-bold text-white mt-2">{data.totalStudents}</h3>
                    <p className="text-xs text-text-muted mt-2">Active enrollments</p>
                </GlassCard>

                <GlassCard className="relative overflow-hidden">
                    <div className="absolute top-2 right-2 opacity-10"><Star size={60} /></div>
                    <p className="text-sm font-medium text-green-400">Best Performing</p>
                    <h3 className="text-2xl font-bold text-white mt-2">{data.bestClass?.name || 'N/A'}</h3>
                    <p className="text-lg font-bold text-green-400 mt-1">{data.bestClass?.percentage}%</p>
                </GlassCard>

                <GlassCard className="relative overflow-hidden">
                    <div className="absolute top-2 right-2 opacity-10"><AlertOctagon size={60} /></div>
                    <p className="text-sm font-medium text-red-400">Needs Attention</p>
                    <h3 className="text-2xl font-bold text-white mt-2">{data.worstClass?.name || 'N/A'}</h3>
                    <p className="text-lg font-bold text-red-400 mt-1">{data.worstClass?.percentage}%</p>
                </GlassCard>
            </div>

            <div className="grid grid-cols-1 gap-8">
                <GlassCard>
                    <h3 className="text-xl font-bold text-white mb-6">Class Performance</h3>
                    <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                        {data.classPerformance.map((cls: any) => (
                            <div key={cls.id} className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5 hover:border-white/10 transition-colors">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-lg bg-bg-primary flex items-center justify-center font-bold text-text-muted">
                                        {cls.name.split('-')[0]}
                                    </div>
                                    <div>
                                        <p className="font-bold text-white">Class {cls.name}</p>
                                        <div className="flex gap-3 mt-1">
                                            <p className="text-xs text-text-muted flex items-center gap-1">
                                                <span className="w-2 h-2 rounded-full bg-green-400"></span>
                                                {cls.percentage}% Present
                                            </p>
                                            <p className="text-xs text-text-muted flex items-center gap-1">
                                                <span className="w-2 h-2 rounded-full bg-yellow-400"></span>
                                                {cls.latePercentage}% Late
                                            </p>
                                            <p className="text-xs text-text-muted flex items-center gap-1">
                                                <span className="w-2 h-2 rounded-full bg-red-400"></span>
                                                {cls.absentPercentage}% Absent
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-medium text-white">
                                        {cls.total} Total
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </GlassCard>
            </div>
        </div>
    );
}
