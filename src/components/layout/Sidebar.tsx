'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { LayoutDashboard, Calendar, Users, Settings, LogOut, Shield, BookOpen, GraduationCap, X, ChevronUp, Lock, User, PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { NotificationBell } from '@/components/layout/NotificationBell';
import Image from 'next/image';
import { ChangePasswordDialog } from '@/components/auth/ChangePasswordDialog';

interface ProfileSectionProps {
    user: any;
    role: string;
    isCollapsed: boolean;
    onLogout: () => void;
    onExpand?: () => void;
}

function ProfileSection({ user, role, isCollapsed, onLogout, onExpand }: ProfileSectionProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [showPasswordDialog, setShowPasswordDialog] = useState(false);
    const wrapperRef = useState<HTMLDivElement | null>(null);

    // Close on click outside (Simplified using a backdrop for now or custom hook)
    // For simplicity, lightweight toggling.

    return (
        <div className="relative">
            {isOpen && (
                <>
                    <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
                    <div className="absolute bottom-full left-0 mb-2 w-full min-w-[200px] bg-[#1a1a2e] border border-white/10 rounded-xl shadow-xl z-50 p-1 overflow-hidden animate-in slide-in-from-bottom-2">
                        {role !== 'student' && (
                            <Button
                                variant="ghost"
                                className="w-full justify-start gap-2 text-text-secondary hover:text-white"
                                onClick={() => {
                                    setIsOpen(false);
                                    setShowPasswordDialog(true);
                                }}
                            >
                                <Lock size={16} />
                                Change Password
                            </Button>
                        )}
                        <Button variant="ghost" className="w-full justify-start gap-2 text-red-400 hover:text-red-300 hover:bg-red-400/10" onClick={onLogout}>
                            <LogOut size={16} />
                            Logout
                        </Button>
                    </div>
                </>
            )}

            <div
                className={cn(
                    "flex items-center cursor-pointer hover:bg-white/10 transition-colors",
                    isCollapsed
                        ? "w-10 h-10 justify-center p-0 mx-auto rounded-lg bg-white/5 gap-0"
                        : "w-full p-3 rounded-xl bg-white/5 border border-white/5 gap-3"
                )}
                onClick={() => {
                    if (isCollapsed) {
                        onExpand?.();
                    } else {
                        setIsOpen(!isOpen);
                    }
                }}
                title={isCollapsed ? "Expand Profile" : undefined}
            >
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary-light font-bold shrink-0 text-sm">
                    {user.name?.[0]?.toUpperCase() || 'U'}
                </div>

                <div className={cn("overflow-hidden transition-all duration-300 flex-1", isCollapsed ? "w-0 opacity-0 hidden" : "w-auto opacity-100")}>
                    <p className="text-sm font-medium text-white truncate">{user.name}</p>
                    <p className="text-xs text-text-muted capitalize">{role}</p>
                </div>

                {!isCollapsed && (
                    <ChevronUp size={16} className={cn("text-text-muted transition-transform", isOpen && "rotate-180")} />
                )}
            </div>

            <ChangePasswordDialog
                open={showPasswordDialog}
                onOpenChange={setShowPasswordDialog}
                userEmail={user.email}
            />
        </div >
    );
}

interface SidebarProps {
    role: string;
    user: any;
    isDesktopOpen?: boolean;
    setIsDesktopOpen?: (open: boolean) => void;
}

export function Sidebar({ role, user, isDesktopOpen = true, setIsDesktopOpen }: SidebarProps) {
    const pathname = usePathname();
    const router = useRouter();
    const [isMobileOpen, setIsMobileOpen] = useState(false);

    // Close sidebar on route change (Mobile only usually, but desktop maybe?)
    // On desktop we typically want it to stay open.
    useEffect(() => {
        setIsMobileOpen(false);
    }, [pathname]);

    // Prevent body scroll when sidebar is open on mobile
    useEffect(() => {
        if (isMobileOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'auto';
        }
        return () => { document.body.style.overflow = 'auto'; };
    }, [isMobileOpen]);

    const handleLogout = async () => {
        try {
            await fetch('/api/auth/logout', { method: 'POST' });
        } catch (error) {
            console.error("Logout failed", error);
        } finally {
            window.location.href = '/login';
        }
    };

    const navItems = {
        student: [
            { label: 'Dashboard', href: '/dashboard/student', icon: LayoutDashboard },
            { label: 'Leave Request', href: '/dashboard/student/leave', icon: BookOpen },
        ],
        teacher: [
            { label: 'Overview', href: '/dashboard/teacher', icon: LayoutDashboard },
            { label: 'Mark Attendance', href: '/dashboard/teacher/mark', icon: Users },
            { label: 'Leave Requests', href: '/dashboard/teacher/leaves', icon: BookOpen },
        ],
        principal: [
            { label: 'School Overview', href: '/dashboard/principal', icon: LayoutDashboard },
            { label: 'Class Analytics', href: '/dashboard/principal/classes', icon: Users },
            { label: 'Holidays', href: '/dashboard/principal/holidays', icon: Calendar },
        ],
        it_admin: [
            { label: 'User Management', href: '/dashboard/it_admin', icon: Users },
        ],
    };

    const items = navItems[role as keyof typeof navItems] || [];

    return (
        <>
            {/* Mobile Toggle Button (Top Bar) */}
            <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-bg-secondary/80 backdrop-blur-md border-b border-white/5 flex items-center px-4 z-40">
                <Button
                    variant="ghost"
                    size="icon"
                    className="mr-2"
                    onPointerDown={(e) => {
                        e.preventDefault();
                        setIsMobileOpen(true);
                    }}
                >
                    <LayoutDashboard className="w-6 h-6 text-white" />
                </Button>
                <div className="flex items-center gap-2">
                    <div className="w-6 h-6 relative rounded-md overflow-hidden">
                        <Image src="/icons/icon.svg" alt="Attendify Logo" fill className="object-cover" />
                    </div>
                    <span className="font-bold text-white">Attendify</span>
                </div>
            </div>

            {/* Backdrop for Mobile */}
            {isMobileOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm animate-in fade-in"
                    onClick={() => setIsMobileOpen(false)}
                />
            )}

            {/* Sidebar Container */}
            <aside
                className={cn(
                    "h-screen bg-bg-secondary border-r border-white/5 flex flex-col fixed left-0 top-0 z-50 transition-all duration-300 shadow-xl overflow-x-hidden",
                    // Mobile State (Width fixed 56, slide in/out)
                    "w-56 md:translate-x-0",
                    isMobileOpen ? "translate-x-0" : "-translate-x-full",
                    // Desktop State (Width changes, always visible)
                    isDesktopOpen ? "md:w-56" : "md:w-20"
                )}
            >
                <div className={cn("p-4 flex items-center transition-all", isDesktopOpen ? "justify-between" : "justify-between md:justify-center")}>
                    {/* Logo - Animate minimize */}
                    <div className={cn(
                        "relative rounded-lg overflow-hidden shrink-0 transition-all duration-300",
                        isDesktopOpen ? "w-8 h-8 opacity-100" : "w-8 h-8 opacity-100 md:w-0 md:opacity-0 md:p-0 md:m-0"
                    )}>
                        <Image src="/icons/icon.svg" alt="Attendify Logo" fill className="object-cover" />
                    </div>

                    {/* Desktop Toggle Button */}
                    <div className="hidden md:block">
                        <Button
                            variant="ghost"
                            size="icon"
                            className={cn("text-text-muted hover:text-white transition-all", !isDesktopOpen && "h-10 w-10 mx-auto")}
                            onClick={() => setIsDesktopOpen?.(!isDesktopOpen)}
                            title={isDesktopOpen ? "Collapse Sidebar" : "Expand Sidebar"}
                        >
                            {isDesktopOpen ? <PanelLeftClose size={20} /> : <PanelLeftOpen size={20} />}
                        </Button>
                    </div>

                    {/* Close Button Mobile */}
                    <div className="md:hidden ml-auto">
                        <Button variant="ghost" size="icon" onClick={() => setIsMobileOpen(false)}>
                            <X className="w-5 h-5 text-text-muted" />
                        </Button>
                    </div>
                </div>

                {/* Content Area */}
                <div className="flex-1 flex flex-col min-h-0">
                    <nav className={cn("flex-1 space-y-2 overflow-y-auto custom-scrollbar", isDesktopOpen ? "px-4" : "px-4 md:px-2")}>
                        {items.map((item) => {
                            const Icon = item.icon;
                            const isActive = pathname === item.href;
                            return (
                                <Link key={item.href} href={item.href}>
                                    <div
                                        className={cn(
                                            'flex items-center gap-3 transition-all cursor-pointer overflow-hidden',
                                            isDesktopOpen
                                                ? "w-full px-4 py-3 rounded-xl text-sm font-medium"
                                                : "w-full px-4 py-3 rounded-xl text-sm font-medium md:w-10 md:h-10 md:justify-center md:p-0 md:mx-auto md:rounded-lg",
                                            isActive
                                                ? 'bg-primary text-white shadow-lg shadow-primary/20'
                                                : 'text-text-secondary hover:bg-white/5 hover:text-white'
                                        )}
                                        title={!isDesktopOpen ? item.label : undefined}
                                    >
                                        <Icon size={20} className="shrink-0" />
                                        <span className={cn("whitespace-nowrap transition-all duration-300", isDesktopOpen ? "opacity-100 w-auto" : "opacity-100 w-auto md:opacity-0 md:w-0 md:hidden")}>
                                            {item.label}
                                        </span>
                                    </div>
                                </Link>
                            );
                        })}
                    </nav>

                    <div className={cn("flex flex-col gap-2", isDesktopOpen ? "p-4" : "p-4 md:p-2")}>
                        {/* Notifications Item */}
                        <div className={cn(!isDesktopOpen && "md:border-transparent")}>
                            <NotificationBell collapsed={!isDesktopOpen && !isMobileOpen} onExpand={() => setIsDesktopOpen?.(true)} />
                        </div>

                        {/* Profile Section with Popover */}
                        <ProfileSection
                            user={user}
                            role={role}
                            isCollapsed={!isDesktopOpen && !isMobileOpen}
                            onLogout={handleLogout}
                            onExpand={() => setIsDesktopOpen?.(true)}
                        />
                    </div>
                </div>

                <div className={cn("mt-auto px-4 pb-4 transition-all", isDesktopOpen ? "opacity-100" : "opacity-0 h-0 hidden")}>
                    {/* Hiding completely when collapsed to avoid clutter, or maybe showing a mini icon? 
                        User request about footer was "Built with ... in a box card". 
                        If collapsed, user didn't specify. I'll hide it to keep "Mini" sidebar clean (40px width items).
                        Wait, earlier code had `opacity-0 h-0`.
                        User said "box card border thing".
                    */}
                    <div className="rounded-lg border border-white/5 bg-white/5 py-2 px-3 text-center transition-colors hover:bg-white/10 hover:border-white/10">
                        <a
                            href="https://pranab.tech"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[10px] text-text-secondary hover:text-white transition-colors block"
                        >
                            Built with <span className="text-red-400 animate-pulse">💖</span> by <span className="font-medium text-white">Pranab Saini</span>
                        </a>
                    </div>
                </div>
            </aside>
        </>
    );
}
