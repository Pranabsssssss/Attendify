import { LeaveRequestForm } from '@/components/dashboard/LeaveRequestForm';
import { GlassCard } from '@/components/ui/glass-card';
import { getStudentLeaves } from '@/lib/actions/student';
import { cn } from '@/lib/utils';
import { MessageSquare } from 'lucide-react';

import { RefreshButton } from '@/components/ui/RefreshButton';

export default async function StudentLeavePage() {
    const leaves = await getStudentLeaves();

    return (
        <div className="p-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div>
                <h1 className="text-3xl font-bold text-white mb-2">Leave Requests</h1>
                <p className="text-text-secondary">Submit and track your leave applications.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Apply for Leave */}
                <div className="lg:col-span-1">
                    <GlassCard className="p-6 hover:shadow-lg hover:shadow-primary/10 transition-shadow">
                        <h2 className="text-xl font-bold text-white mb-6">Apply for Leave</h2>
                        <LeaveRequestForm />
                    </GlassCard>
                </div>

                {/* History */}
                <div className="lg:col-span-2">
                    <GlassCard className="p-6 hover:border-primary/30 transition-colors">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-white">Request History</h2>
                            <RefreshButton />
                        </div>
                        <div className="space-y-4">
                            {leaves.length === 0 ? (
                                <p className="text-text-muted text-center py-8">No leave requests found.</p>
                            ) : (
                                leaves.map((leave: any) => (
                                    <div key={leave._id} className="p-4 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors flex flex-col gap-4">
                                        <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <span className={cn(
                                                        "px-2 py-0.5 rounded text-xs font-medium border",
                                                        leave.status === 'Approved' ? "bg-green-500/10 text-green-400 border-green-500/20" :
                                                            leave.status === 'Rejected' ? "bg-red-500/10 text-red-400 border-red-500/20" :
                                                                "bg-yellow-500/10 text-yellow-400 border-yellow-500/20"
                                                    )}>
                                                        {leave.status}
                                                    </span>
                                                    <span className="text-sm text-text-secondary">
                                                        {new Date(leave.startDate).toLocaleDateString()} - {new Date(leave.endDate).toLocaleDateString()}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-white">{leave.reason}</p>
                                            </div>

                                            {leave.adminUtils && (
                                                <div className="text-xs text-text-muted text-right whitespace-nowrap">
                                                    Reviewed by: {leave.adminUtils?.reviewedBy?.name || 'Class Teacher'} <br />
                                                    {new Date(leave.updatedAt).toLocaleDateString()}
                                                </div>
                                            )}
                                        </div>

                                        {leave.adminUtils?.message && (
                                            <div className="w-full bg-primary/5 border-l-2 border-primary/50 rounded-r-lg p-4 mt-2">
                                                <p className="text-[10px] font-bold text-primary mb-2 uppercase tracking-wider flex items-center gap-2">
                                                    <MessageSquare size={12} />
                                                    Teacher's Note
                                                </p>
                                                <p className="text-sm text-white/90 italic leading-relaxed pl-1">
                                                    "{leave.adminUtils.message}"
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                    </GlassCard>
                </div>
            </div>
        </div>
    );
}
