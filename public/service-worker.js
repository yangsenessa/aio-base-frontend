
// Service worker for handling audio permissions and CORS for EMC Network and SiliconFlow requests
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
// (we don't need to proxy SiliconFlow requests since they use HTTPS)
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  
  // For EMC Network requests, handle CORS and proxy the request
  if (url.hostname === '162.218.231.180' || url.hostname === '18.167.51.1') {
    // Only handle actual requests, not preflight
    if (event.request.method === 'OPTIONS') {
      // Respond to preflight requests with appropriate CORS headers
      event.respondWith(
        new Response(null, {
          status: 204,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
            'Access-Control-Max-Age': '86400'
          }
        })
      );
      return;
    }
    
    // For actual requests, fetch with CORS headers
    event.respondWith(
      fetch(event.request.url, {
        method: event.request.method,
        headers: event.request.headers,
        body: event.request.method !== 'GET' && event.request.method !== 'HEAD' ? event.request.clone().body : undefined,
        mode: 'cors',
        credentials: 'omit'
      }).then(response => {
        // Clone the response and add CORS headers
        const newHeaders = new Headers(response.headers);
        newHeaders.set('Access-Control-Allow-Origin', '*');
        
        return new Response(response.body, {
          status: response.status,
          statusText: response.statusText,
          headers: newHeaders
        });
      }).catch(error => {
        console.error('EMC Network fetch error:', error);
        return new Response(JSON.stringify({ 
          error: { message: 'Failed to connect to EMC Network' } 
        }), {
          status: 500,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          }
        });
      })
    );
    return;
  }
  
  // For all other requests, use default handling
  return;
});
