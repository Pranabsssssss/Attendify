'use client';

import { useState } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { ServiceWorkerRegister } from '@/components/layout/ServiceWorkerRegister';
import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface DashboardShellProps {
    children: React.ReactNode;
    user: any;
    role: string;
}

export function DashboardShell({ children, user, role }: DashboardShellProps) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    return (
        <div className="min-h-screen bg-bg-primary">
            {/* Sidebar handles its own positioning */}
            <Sidebar role={role} user={user} isDesktopOpen={isSidebarOpen} setIsDesktopOpen={setIsSidebarOpen} />

            {/* Main Content Area */}
            <div className={cn(
                "min-h-screen transition-all duration-300",
                isSidebarOpen ? "md:pl-56" : "md:pl-20"
            )}>
                <main className="pt-16 md:pt-0">
                    <ServiceWorkerRegister />
                    {children}
                </main>
            </div>
        </div>
    );
}
