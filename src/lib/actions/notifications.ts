'use server';

import dbConnect from '@/lib/db/connect';
import Notification from '@/models/Notification';
import User from '@/models/User';
import { getSession } from '@/lib/auth/session';

export async function getNotifications() {
    const session = await getSession();
    if (!session) return [];

    await dbConnect();

    const notifications = await Notification.find({ recipient: session.userId })
        .sort({ createdAt: -1 })
        .limit(20);

    return JSON.parse(JSON.stringify(notifications));
}

export async function markAsRead(notificationId: string) {
    const session = await getSession();
    if (!session) return;

    await dbConnect();
    await Notification.findByIdAndUpdate(notificationId, { isRead: true });
}

export async function markAllAsRead() {
    const session = await getSession();
    if (!session) return;

    await dbConnect();
    await Notification.updateMany({ recipient: session.userId, isRead: false }, { isRead: true });
}

export async function broadcastNotification(title: string, message: string, targetRole: string) {
    const session = await getSession();
    if (!session || session.role !== 'it_admin') throw new Error('Unauthorized');

    await dbConnect();

    const users = await User.find(targetRole === 'all' ? {} : { role: targetRole }).select('_id');

    const notifications = users.map(user => ({
        recipient: user._id,
        title,
        message,
        type: 'info',
        createdAt: new Date(),
        updatedAt: new Date()
    }));

    if (notifications.length > 0) {
        await Notification.insertMany(notifications);
    }

    return { success: true, count: notifications.length };
}
