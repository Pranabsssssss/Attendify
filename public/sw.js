self.addEventListener('push', function (event) {
    if (event.data) {
        const data = event.data.json();
        const options = {
            body: data.body,
            icon: data.icon || '/icons/icon-192.svg',
            badge: '/icons/icon-72.svg',
            vibrate: [100, 50, 100],
            data: {
                dateOfArrival: Date.now(),
                primaryKey: '2'
            }
        };
        event.waitUntil(
            self.registration.showNotification(data.title, options)
        );
    } else {
        console.log('This push event has no data.');
    }
});

self.addEventListener('notificationclick', function (event) {
    console.log('On notification click: ', event.notification.tag);
    event.notification.close();
    event.waitUntil(
        clients.openWindow('/')
    );
});
