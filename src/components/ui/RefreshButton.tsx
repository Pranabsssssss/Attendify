'use client';
// Rebuild trigger

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import { useState } from 'react';

export function RefreshButton() {
    const router = useRouter();
    const [isRefreshing, setIsRefreshing] = useState(false);

    const handleRefresh = () => {
        setIsRefreshing(true);
        router.refresh();
        // Visual feedback since router.refresh is async but doesn't return a promise we can await easily in all versions,
        // but typically it's fast. We'll show a spinner for at least 500ms or until next render.
        setTimeout(() => setIsRefreshing(false), 1000);
    };

    return (
        <Button
            variant="ghost"
            size="sm"
            onClick={handleRefresh}
            className="text-text-secondary hover:text-white hover:bg-white/5"
            disabled={isRefreshing}
        >
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
        </Button>
    );
}
