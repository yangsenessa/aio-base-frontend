// Service worker for handling audio permissions in ICP environment
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  clients.claim();
});

// No need to cache anything specific for this basic service worker
// It's mainly to ensure we're operating in a secure context for audio