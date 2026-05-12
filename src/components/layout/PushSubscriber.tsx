'use client';

import { useEffect, useState } from 'react';
import { Bell, BellOff } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Helper to convert VAPID key
function urlBase64ToUint8Array(base64String: string) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
        .replace(/\-/g, '+')
        .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}

export function PushSubscriber() {
    const [isMounted, setIsMounted] = useState(false);
    const [isSubscribed, setIsSubscribed] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        setIsMounted(true);
        // Check if already subscribed
        if ('serviceWorker' in navigator && 'PushManager' in window) {
            navigator.serviceWorker.ready.then(function (registration) {
                registration.pushManager.getSubscription().then(function (subscription) {
                    setIsSubscribed(!!subscription);
                });
            }).catch(err => console.error('SW ready error:', err));
        }
    }, []);

    const subscribe = async () => {
        setLoading(true);
        try {
            if (!('serviceWorker' in navigator)) {
                alert('Service Worker not supported');
                return;
            }

            if (Notification.permission === 'denied') {
                alert('Notifications are blocked. Please enable them in your browser settings.');
                return;
            }

            const registration = await navigator.serviceWorker.ready;
            const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

            if (!vapidPublicKey) {
                console.error('No VAPID public key found');
                alert('Push configuration missing');
                return;
            }

            const convertedVapidKey = urlBase64ToUint8Array(vapidPublicKey);

            // Race condition to prevent hanging
            const subscriptionPromise = registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: convertedVapidKey
            });

            const timeoutPromise = new Promise((_, reject) =>
                setTimeout(() => reject(new Error('Subscription timed out. Please check if a permission prompt is open.')), 20000)
            );

            const subscription = await Promise.race([subscriptionPromise, timeoutPromise]) as PushSubscription;

            console.log('Got subscription:', subscription);

            // Send subscription to server
            const res = await fetch('/api/push/subscribe', {
                method: 'POST',
                body: JSON.stringify({ subscription }),
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (!res.ok) throw new Error('Failed to save subscription on server');

            setIsSubscribed(true);
            console.log('User subscribed to push notifications');
            alert('Notifications Enabled Successfully!');
        } catch (error: any) {
            console.error('Failed to subscribe user: ', error);
            alert(`Error: ${error.message || 'Failed to enable notifications'}`);
        } finally {
            setLoading(false);
        }
    };

    if (!isMounted) return null; // Avoid hydration mismatch

    if (!('serviceWorker' in navigator)) {
        return null;
    }

    if (isSubscribed) {
        return (
            <Button variant="ghost" size="sm" className="text-green-400 gap-2 cursor-default hover:bg-transparent">
                <Bell size={16} />
                <span className="text-xs">Notifications On</span>
            </Button>
        );
    }

    return (
        <Button
            variant="outline"
            size="sm"
            onClick={subscribe}
            disabled={loading}
            className="gap-2 border-primary/20 hover:bg-primary/10 w-full justify-start"
        >
            <Bell size={16} />
            <span className="text-xs">{loading ? 'Enabling...' : 'Enable Notifications'}</span>
        </Button>
    );
}
