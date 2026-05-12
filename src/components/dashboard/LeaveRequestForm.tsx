'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

export function LeaveRequestForm() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        startDate: '',
        endDate: '',
        reason: '',
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            // --- VALIDATION START ---
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            const start = new Date(formData.startDate);
            start.setHours(0, 0, 0, 0);

            if (start < today) {
                toast.error("Cannot apply for leave in the past.");
                setLoading(false);
                return;
            }

            if (start.getTime() === today.getTime()) {
                const now = new Date();
                const cutoffTime = process.env.NEXT_PUBLIC_LEAVE_CUTOFF_TIME || '08:00';
                const [cutoffHour, cutoffMinute] = cutoffTime.split(':').map(Number);

                const cutoffDate = new Date();
                cutoffDate.setHours(cutoffHour, cutoffMinute, 0, 0);

                if (now > cutoffDate) {
                    toast.error(`Cannot apply for today's leave after ${cutoffTime} AM.`);
                    setLoading(false);
                    return;
                }
            }
            // --- VALIDATION END ---

            const res = await fetch('/api/student/leave', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Failed to submit request');
            }

            toast.success('Request submitted to your Class Teacher successfully');
            setFormData({ startDate: '', endDate: '', reason: '' });
            router.refresh();
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <label className="text-sm font-medium text-text-secondary">Start Date</label>
                    <input
                        type="date"
                        required
                        min={new Date().toISOString().split('T')[0]}
                        className="w-full bg-bg-input border border-white/5 rounded-xl px-4 py-2 text-white sm-date-input"
                        value={formData.startDate}
                        onChange={e => setFormData({ ...formData, startDate: e.target.value })}
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-medium text-text-secondary">End Date</label>
                    <input
                        type="date"
                        required
                        min={formData.startDate || new Date().toISOString().split('T')[0]}
                        className="w-full bg-bg-input border border-white/5 rounded-xl px-4 py-2 text-white sm-date-input"
                        value={formData.endDate}
                        onChange={e => setFormData({ ...formData, endDate: e.target.value })}
                    />
                </div>
            </div>

            <div className="space-y-2">
                <label className="text-sm font-medium text-text-secondary">Reason</label>
                <textarea
                    required
                    rows={3}
                    className="w-full bg-bg-input border border-white/5 rounded-xl px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                    placeholder="Why are you taking leave?"
                    value={formData.reason}
                    onChange={e => setFormData({ ...formData, reason: e.target.value })}
                />
            </div>

            <Button type="submit" disabled={loading} className="w-full">
                {loading ? <Loader2 className="animate-spin" /> : 'Submit Request'}
            </Button>
        </form>
    );
}
