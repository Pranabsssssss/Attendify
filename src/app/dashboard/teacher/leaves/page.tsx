import { getTeacherDashboardData } from '@/lib/actions/teacher';
import { GlassCard } from '@/components/ui/glass-card';
import { Button } from '@/components/ui/button';
import { LeaveActionButtons } from '@/components/dashboard/LeaveActionButtons';

import { RefreshButton } from '@/components/ui/RefreshButton';

export default async function TeacherLeavesPage() {
    const data = await getTeacherDashboardData();

    if (!data) return <div>Loading...</div>;

    return (
        <div className="p-8 text-white space-y-8 animate-in fade-in slide-in-from-bottom-4">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold">Leave Requests</h1>
                    <p className="text-text-secondary">Manage student leave applications.</p>
                </div>
                <RefreshButton />
            </div>

            <GlassCard className="p-6">
                {data.pendingLeaves.length === 0 ? (
                    <p className="text-text-muted">No pending leave requests.</p>
                ) : (
                    <div className="space-y-4">
                        {data.pendingLeaves.map((leave: any) => (
                            <div key={leave._id} className="p-4 rounded-xl bg-white/5 border border-white/5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                <div>
                                    <p className="font-bold text-white">{leave.student.name}</p>
                                    <p className="text-sm text-text-secondary">
                                        {new Date(leave.startDate).toLocaleDateString()} - {new Date(leave.endDate).toLocaleDateString()}
                                    </p>
                                    <p className="text-sm text-text-muted mt-1">{leave.reason}</p>
                                </div>
                                <LeaveActionButtons leaveId={leave._id} studentName={leave.student.name} />
                            </div>
                        ))}
                    </div>
                )}
            </GlassCard>

            <GlassCard className="p-6">
                <h2 className="text-xl font-bold mb-4">Leave History</h2>
                {data.leaveHistory.length === 0 ? (
                    <p className="text-text-muted">No past leave history.</p>
                ) : (
                    <div className="space-y-4">
                        {data.leaveHistory.map((leave: any) => (
                            <div key={leave._id} className="p-4 rounded-xl bg-white/5 border border-white/5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 opacity-80">
                                <div>
                                    <p className="font-bold text-white">{leave.student.name}</p>
                                    <p className="text-sm text-text-secondary">
                                        {new Date(leave.startDate).toLocaleDateString()} - {new Date(leave.endDate).toLocaleDateString()}
                                    </p>
                                    <p className="text-sm text-text-muted mt-1">{leave.reason}</p>
                                </div>
                                <div>
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${leave.status === 'Approved' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                                        }`}>
                                        {leave.status}
                                    </span>
                                    {leave.adminUtils?.message && (
                                        <p className="text-xs text-text-muted mt-2 text-right italic">"{leave.adminUtils.message}"</p>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </GlassCard>
        </div>
    );
}
