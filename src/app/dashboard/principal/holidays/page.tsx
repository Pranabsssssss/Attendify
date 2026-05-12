'use client';

import { useState, useEffect } from 'react';
import { GlassCard } from '@/components/ui/glass-card';
import { Button } from '@/components/ui/button';
import { Calendar, Trash2, Plus, Loader2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface Holiday {
    _id: string;
    name: string;
    startDate: string;
    endDate: string;
    description?: string;
    academicYear: string;
}

export default function HolidayManagementPage() {
    const [holidays, setHolidays] = useState<Holiday[]>([]);
    const [loading, setLoading] = useState(true);
    const [adding, setAdding] = useState(false);

    // Form State
    const [newHoliday, setNewHoliday] = useState({
        name: '',
        startDate: '',
        endDate: '',
        description: '',
        academicYear: '2025-2026' // Default logic could be dynamic
    });

    const fetchHolidays = async () => {
        try {
            const res = await fetch('/api/holidays?academicYear=2025-2026'); // Fetch for current year
            if (!res.ok) throw new Error('Failed to fetch holidays');
            const data = await res.json();
            setHolidays(data);
        } catch (error) {
            console.error(error);
            toast.error('Failed to load holidays');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchHolidays();
    }, []);

    const handleAddHoliday = async (e: React.FormEvent) => {
        e.preventDefault();
        setAdding(true);
        try {
            const res = await fetch('/api/holidays', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newHoliday),
            });

            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.error || 'Failed to add holiday');
            }

            toast.success('Holiday added successfully');
            setNewHoliday({ name: '', startDate: '', endDate: '', description: '', academicYear: '2025-2026' });
            fetchHolidays(); // Reload list
        } catch (error: any) {
            console.error(error);
            toast.error(error.message || 'Failed to add holiday');
        } finally {
            setAdding(false);
        }
    };

    const handleDeleteHoliday = async (id: string) => {
        if (!confirm('Are you sure you want to delete this holiday?')) return;
        try {
            const res = await fetch(`/api/holidays?id=${id}`, {
                method: 'DELETE',
            });
            if (!res.ok) throw new Error('Failed to delete holiday');
            toast.success('Holiday deleted');
            setHolidays(prev => prev.filter(h => h._id !== id));
        } catch (error) {
            console.error(error);
            toast.error('Failed to delete holiday');
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">
                        Holiday Management
                    </h1>
                    <p className="text-text-secondary mt-1">Declare holidays for the academic year</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Add Holiday Form */}
                <GlassCard className="p-6 h-fit border-t border-white/10 lg:col-span-1">
                    <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                        <Plus className="text-primary" size={20} />
                        Add New Holiday
                    </h2>
                    <form onSubmit={handleAddHoliday} className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-text-secondary">Holiday Name</label>
                            <input
                                type="text"
                                required
                                className="w-full bg-bg-input border border-white/5 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 text-white placeholder-text-muted"
                                placeholder="e.g. Diwali Break"
                                value={newHoliday.name}
                                onChange={e => setNewHoliday({ ...newHoliday, name: e.target.value })}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-text-secondary">Start Date</label>
                                <input
                                    type="date"
                                    required
                                    className="w-full bg-bg-input border border-white/5 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 text-white placeholder-text-muted [color-scheme:dark]"
                                    value={newHoliday.startDate}
                                    onChange={e => setNewHoliday({ ...newHoliday, startDate: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-text-secondary">End Date</label>
                                <input
                                    type="date"
                                    required
                                    className="w-full bg-bg-input border border-white/5 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 text-white placeholder-text-muted [color-scheme:dark]"
                                    value={newHoliday.endDate}
                                    onChange={e => setNewHoliday({ ...newHoliday, endDate: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-text-secondary">Description (Optional)</label>
                            <textarea
                                className="w-full bg-bg-input border border-white/5 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 text-white placeholder-text-muted min-h-[100px]"
                                placeholder="Additional details..."
                                value={newHoliday.description}
                                onChange={e => setNewHoliday({ ...newHoliday, description: e.target.value })}
                            />
                        </div>

                        <Button type="submit" className="w-full bg-primary hover:bg-primary-hover text-white font-bold shadow-lg shadow-primary/25" disabled={adding}>
                            {adding ? <Loader2 className="animate-spin" /> : 'Add Holiday'}
                        </Button>
                    </form>
                </GlassCard>

                {/* Holiday List */}
                <GlassCard className="p-6 border-t border-white/10 lg:col-span-2">
                    <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                        <Calendar className="text-purple-400" size={20} />
                        Upcoming Holidays
                    </h2>

                    {loading ? (
                        <div className="flex justify-center p-8">
                            <Loader2 className="animate-spin text-primary" size={32} />
                        </div>
                    ) : holidays.length === 0 ? (
                        <div className="text-center p-8 border border-dashed border-white/10 rounded-xl">
                            <AlertCircle className="mx-auto text-text-muted mb-2" size={32} />
                            <p className="text-text-muted">No holidays declared yet.</p>
                        </div>
                    ) : (
                        <div className="space-y-3 max-h-[600px] overflow-y-auto custom-scrollbar pr-2">
                            {holidays.map((holiday) => (
                                <div key={holiday._id} className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors group">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-lg bg-primary/10 flex flex-col items-center justify-center border border-primary/20 shrink-0">
                                            <span className="text-xs font-bold text-primary uppercase">
                                                {new Date(holiday.startDate).toLocaleString('default', { month: 'short' })}
                                            </span>
                                            <span className="text-lg font-bold text-white">
                                                {new Date(holiday.startDate).getDate()}
                                            </span>
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-white">{holiday.name}</h3>
                                            <p className="text-sm text-text-secondary line-clamp-1">{holiday.description || 'No description'}</p>
                                            <p className="text-xs text-text-muted mt-1">
                                                {new Date(holiday.startDate).toLocaleDateString()} - {new Date(holiday.endDate).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="text-text-muted hover:text-red-400 hover:bg-red-400/10 opacity-0 group-hover:opacity-100 transition-all"
                                        onClick={() => handleDeleteHoliday(holiday._id)}
                                    >
                                        <Trash2 size={18} />
                                    </Button>
                                </div>
                            ))}
                        </div>
                    )}
                </GlassCard>
            </div>
        </div>
    );
}
