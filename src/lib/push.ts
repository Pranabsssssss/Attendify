import webpush from 'web-push';

const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY;
const pushConfigured = Boolean(vapidPublicKey && vapidPrivateKey);

if (pushConfigured) {
    webpush.setVapidDetails(
        process.env.VAPID_SUBJECT || 'mailto:admin@example.com',
        vapidPublicKey!,
        vapidPrivateKey!
    );
}

export async function sendNotification(user: any, title: string, body: string) {
    if (!pushConfigured) return;

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
