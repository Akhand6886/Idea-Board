self.addEventListener('push', event => {
  let data = { title: 'IdeaOS', body: 'New notification' };
  if (event.data) {
    try {
      data = event.data.json();
    } catch (e) {
      data = { title: 'IdeaOS', body: event.data.text() };
    }
  }

  const options = {
    body: data.body,
    icon: '/favicon.ico',
    badge: '/favicon.ico',
    vibrate: [100, 50, 100],
    data: { url: self.registration.scope }
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(windowClients => {
      if (windowClients.length > 0) {
        if (!windowClients[0].focused) {
          windowClients[0].focus();
        }
      } else {
        clients.openWindow(event.notification.data.url);
      }
    })
  );
});
