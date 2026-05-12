import { ReactNode } from 'react';
import { getSession } from '@/lib/auth/session';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { redirect } from 'next/navigation';
import dbConnect from '@/lib/db/connect';
import User from '@/models/User';

export default async function DashboardLayout({ children }: { children: ReactNode }) {
    const session = await getSession();

    if (!session) {
        redirect('/login');
    }

    await dbConnect();
    // Fetch latest user details (name, etc.)
    const user = await User.findById(session.userId).select('name role email');

    if (!user) {
        redirect('/login');
    }

    // Convert to plain object to pass to Client Component
    const userData = {
        name: user.name,
        role: user.role,
        email: user.email
    };

    return (
        <DashboardShell user={userData} role={user.role}>
            {children}
        </DashboardShell>
    );
}
