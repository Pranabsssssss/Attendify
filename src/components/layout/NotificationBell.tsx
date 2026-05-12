'use client';

import { useState, useEffect, useRef } from 'react';
import { Bell, LogOut, User, Lock } from 'lucide-react';
import { getNotifications, markAsRead, markAllAsRead } from '@/lib/actions/notifications';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { PushSubscriber } from './PushSubscriber';

interface NotificationBellProps {
    collapsed?: boolean;
    onExpand?: () => void;
}

export function NotificationBell({ collapsed, onExpand }: NotificationBellProps) {
    const [notifications, setNotifications] = useState<any[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const wrapperRef = useRef<HTMLDivElement>(null);

    const fetchNotifs = async () => {
        try {
            const data = await getNotifications();
            setNotifications(data);
            const unread = data.filter((n: any) => !n.isRead).length;
            if (unread > unreadCount) {
                toast.info('New Notification', { description: 'You have unread messages.' });
            }
            setUnreadCount(unread);
        } catch (e) {
            console.error(e);
        }
    };

    useEffect(() => {
        fetchNotifs();
        // Poll every 30 seconds
        const interval = setInterval(fetchNotifs, 30000);
        return () => clearInterval(interval);
    }, []);

    // Close on click outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [wrapperRef]);

    const handleRead = async (id: string) => {
        await markAsRead(id);
        setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
        setUnreadCount(prev => Math.max(0, prev - 1));
    };

    const handleReadAll = async () => {
        await markAllAsRead();
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
        setUnreadCount(0);
    };

    return (
        <div className="relative w-full" ref={wrapperRef}>
            <button
                onClick={() => {
                    if (collapsed) {
                        onExpand?.();
                    } else {
                        setIsOpen(!isOpen);
                    }
                }}
                className={cn(
                    "transition-all cursor-pointer hover:bg-white/5 text-text-secondary hover:text-white flex items-center gap-3",
                    collapsed
                        ? "w-10 h-10 justify-center px-0 mx-auto rounded-lg gap-0"
                        : "w-full px-4 py-3 rounded-xl text-sm font-medium gap-3"
                )}
                title={collapsed ? "Expand Notifications" : "Notifications"}
            >
                <div className="relative shrink-0">
                    <Bell size={20} />
                    {unreadCount > 0 && (
                        <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-red-500 border-2 border-bg-secondary" />
                    )}
                </div>
                <span className={cn("whitespace-nowrap transition-all duration-300", collapsed ? "opacity-0 w-0 hidden" : "opacity-100 w-auto")}>
                    Notifications
                </span>
            </button>

            {isOpen && (
                <>
                    <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
                    <div className={cn(
                        "absolute bottom-full mb-2 bg-[#1a1a2e] border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden animate-in slide-in-from-bottom-2",
                        collapsed ? "-left-2 w-56" : "-left-4 w-56"
                    )}>
                        <div className="p-3 border-b border-white/5 flex flex-col gap-3 bg-white/5">
                            <div className="flex justify-between items-center">
                                <h3 className="font-bold text-sm text-white">Notifications</h3>
                                {unreadCount > 0 && (
                                    <button onClick={handleReadAll} className="text-xs text-primary hover:text-primary-light">
                                        Mark all read
                                    </button>
                                )}
                            </div>
                            {/* Integrated Push Subscriber */}
                            <div className="pt-2 border-t border-white/5">
                                <PushSubscriber />
                            </div>
                        </div>

                        <div className="max-h-64 overflow-y-auto custom-scrollbar">
                            {notifications.length === 0 ? (
                                <div className="p-4 text-center text-text-muted text-sm">
                                    No new notifications
                                </div>
                            ) : (
                                notifications.map(n => (
                                    <div
                                        key={n._id}
                                        onClick={() => !n.isRead && handleRead(n._id)}
                                        className={cn(
                                            "p-3 border-b border-white/5 cursor-pointer hover:bg-white/5 transition-colors",
                                            !n.isRead ? "bg-primary/5 border-l-2 border-l-primary" : "opacity-70"
                                        )}
                                    >
                                        <div className="flex justify-between items-start mb-1">
                                            <span className={cn("text-sm font-medium", !n.isRead ? "text-white" : "text-text-secondary")}>
                                                {n.title}
                                            </span>
                                            <span className="text-[10px] text-text-muted">
                                                {new Date(n.createdAt).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <p className="text-xs text-text-secondary line-clamp-2">{n.message}</p>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
