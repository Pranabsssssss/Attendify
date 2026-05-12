import webpush from 'web-push';

webpush.setVapidDetails(
    process.env.VAPID_SUBJECT || 'mailto:admin@attendify.school',
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
    process.env.VAPID_PRIVATE_KEY!
);

export async function sendNotification(user: any, title: string, body: string) {
    if (!user.pushSubscription || !user.pushSubscription.endpoint) {
        console.log(`No push subscription for user ${user._id}`);
        return;
    }

    const payload = JSON.stringify({ title, body, icon: '/icons/icon-192.svg' });

    try {
        await webpush.sendNotification(user.pushSubscription, payload);
        console.log(`Notification sent to ${user.name}`);
    } catch (error) {
        console.error('Error sending notification:', error);
    }
}
