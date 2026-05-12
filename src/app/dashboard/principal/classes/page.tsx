import { getAllClasses } from '@/lib/actions/principal';
import { GlassCard } from '@/components/ui/glass-card';
import Link from 'next/link';
import { Users, ChevronRight } from 'lucide-react';

export default async function ClassesListPage() {
    const classes = await getAllClasses();

    return (
        <div className="p-8 space-y-8 animate-in fade-in slide-in-from-bottom-4">
            <div>
                <h1 className="text-3xl font-bold text-white mb-2">Class Analytics</h1>
                <p className="text-text-secondary">Select a class to view detailed attendance sheets.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {classes.map((cls: any) => (
                    <Link key={cls._id} href={`/dashboard/principal/classes/${cls._id}`}>
                        <GlassCard className="p-6 hover:bg-white/5 transition-colors cursor-pointer group border-l-4 border-l-primary/0 hover:border-l-primary">
                            <div className="flex justify-between items-center">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center text-primary-light font-bold text-xl">
                                        {cls.name}
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-white">Class {cls.name} - {cls.section}</h3>
                                        <p className="text-sm text-text-muted flex items-center gap-1">
                                            <Users size={14} /> View Attendance
                                        </p>
                                    </div>
                                </div>
                                <ChevronRight className="text-text-muted group-hover:text-white transition-colors" />
                            </div>
                        </GlassCard>
                    </Link>
                ))}
            </div>
        </div>
    );
}
