
// Service worker for handling audio permissions in ICP environment
self.addEventListener('install', (event) => {
  self.skipWaiting();
  console.log('Service worker installed successfully');
});

self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim());
  console.log('Service worker activated and claimed clients');
});

// Handle messages from the main thread
self.addEventListener('message', (event) => {
  // Log received messages but don't attempt to use bridge messenger
  console.log('Service worker received message:', event.data);
  
  // Send response back to main thread
  if (event.source) {
    event.source.postMessage({
      type: 'SW_RESPONSE',
      payload: 'Message received by service worker'
    });
  }
});

// Add fetch event listener to provide offline capabilities if needed
self.addEventListener('fetch', (event) => {
  // Simply pass through all network requests
  // This ensures we're not interfering with the app's functionality
  // but allows us to intercept requests if needed in the future
  event.respondWith(fetch(event.request));
});
