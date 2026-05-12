'use client';

import { useState, useEffect } from 'react';
import { GlassCard } from '@/components/ui/glass-card';
import { Calendar, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface Holiday {
    name: string;
    description?: string;
}

export function HolidayBanner() {
    const [holiday, setHoliday] = useState<Holiday | null>(null);
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        const checkHoliday = async () => {
            try {
                // Fetch holidays for current month/year to see if today is one
                const now = new Date();
                const year = now.getFullYear();
                const month = now.getMonth();

                const res = await fetch(`/api/holidays?month=${month}&year=${year}`);
                if (!res.ok) return;

                const holidays: any[] = await res.json();

                // Check if today falls in any holiday range
                const today = new Date();
                today.setHours(0, 0, 0, 0);

                const currentHoliday = holidays.find(h => {
                    const start = new Date(h.startDate);
                    const end = new Date(h.endDate);
                    // Reset hours for accurate comparison
                    start.setHours(0, 0, 0, 0);
                    end.setHours(23, 59, 59, 999);

                    return today >= start && today <= end;
                });

                if (currentHoliday) {
                    setHoliday({
                        name: currentHoliday.name,
                        description: currentHoliday.description
                    });
                }
            } catch (error) {
                console.error("Failed to check holidays", error);
            }
        };

        checkHoliday();
    }, []);

    if (!holiday || !isVisible) return null;

    return (
        <div className="mb-6 animate-in slide-in-from-top-4 fade-in duration-500">
            <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-purple-500/20 to-blue-500/20 border border-purple-500/30 p-4 flex items-start gap-4 shadow-lg shadow-purple-900/10">
                {/* Decorative Background Blob */}
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

                <div className="p-2 bg-purple-500/20 rounded-lg shrink-0">
                    <Calendar className="text-purple-300 w-6 h-6" />
                </div>

                <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        Holiday: {holiday.name}
                        <span className="text-xs font-normal px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-200 border border-purple-500/20">
                            Happening Now
                        </span>
                    </h3>
                    {holiday.description && (
                        <p className="text-sm text-gray-300 mt-1 leading-relaxed">
                            {holiday.description}
                        </p>
                    )}
                </div>

                <Button
                    variant="ghost"
                    size="icon"
                    className="shrink-0 text-gray-400 hover:text-white hover:bg-white/10 -mt-1 -mr-1"
                    onClick={() => setIsVisible(false)}
                >
                    <X size={18} />
                </Button>
            </div>
        </div>
    );
}
