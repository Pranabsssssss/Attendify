'use server';

import dbConnect from '@/lib/db/connect';
import User from '@/models/User';
import AuditLog from '@/models/AuditLog';
import { getSession } from '@/lib/auth/session';

export async function getAdminDashboardData() {
    const session = await getSession();
    if (!session || session.role !== 'it_admin') return null;

    await dbConnect();

    // Quick Stats
    const totalUsers = await User.countDocuments({});
    const pendingRfids = await User.countDocuments({ rfidUid: { $exists: false } }); // Users without RFID

    // Recent Audit Logs (Mock or Real)
    // checks if model exists, if not returns empty
    let recentLogs: any[] = [];
    try {
        recentLogs = await AuditLog.find({}).sort({ createdAt: -1 }).limit(5).populate('performedBy', 'name');
    } catch (e) { console.log('Audit log error', e) }

    return {
        totalUsers,
        pendingRfids,
        recentLogs: JSON.parse(JSON.stringify(recentLogs))
    };
}

export async function getAllUsers(query: string = '') {
    const session = await getSession();
    if (!session || session.role !== 'it_admin') return [];

    await dbConnect();

    const filter = query ? {
        $or: [
            { name: { $regex: query, $options: 'i' } },
            { email: { $regex: query, $options: 'i' } },
            { studentId: { $regex: query, $options: 'i' } }
        ]
    } : {};

    const users = await User.find(filter).sort({ createdAt: -1 }).limit(50);
    return JSON.parse(JSON.stringify(users));
}

export async function updateUserRfid(userId: string, rfidUid: string) {
    const session = await getSession();
    if (!session || session.role !== 'it_admin') throw new Error('Unauthorized');

    await dbConnect();

    await User.findByIdAndUpdate(userId, { rfidUid });
    return { success: true };
}
