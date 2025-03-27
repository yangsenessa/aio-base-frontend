
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

// Add fetch event listener to handle HTTP requests for EMC Network
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  
  // For EMC Network requests, don't enforce HTTPS
  if (url.hostname === '162.218.231.180' || url.hostname === '18.167.51.1') {
    // Allow HTTP requests to these hostnames
    return;
  }
  
  // For all other requests, use default handling
  event.respondWith(fetch(event.request));
});
