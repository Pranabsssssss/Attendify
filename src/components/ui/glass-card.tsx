import { cn } from '@/lib/utils';
import { ReactNode } from 'react';

interface GlassCardProps {
    children: ReactNode;
    className?: string;
    hoverEffect?: boolean;
}

export function GlassCard({ children, className, hoverEffect = false }: GlassCardProps) {
    return (
        <div
            className={cn(
                'glass rounded-2xl p-6 transition-all duration-300',
                hoverEffect && 'hover:bg-opacity-20 hover:border-primary/30 hover:shadow-[0_0_20px_rgba(124,58,237,0.1)]',
                className
            )}
        >
            {children}
        </div>
    );
}
