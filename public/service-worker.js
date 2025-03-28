
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
    console.log('Service worker intercepting EMC Network request:', url.toString());
    
    // Special handling for preflight requests - add more comprehensive headers
    if (event.request.method === 'OPTIONS') {
      console.log('Handling OPTIONS preflight request for EMC Network endpoint:', url.pathname);
      event.respondWith(
        new Response(null, {
          status: 204,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS, PUT, DELETE',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With, Accept, Origin',
            'Access-Control-Max-Age': '86400',
            'Access-Control-Allow-Credentials': 'true'
          }
        })
      );
      return;
    }
    
    // For actual requests, create a modified request without CORS restrictions
    console.log('Forwarding request to EMC Network:', event.request.method);
    event.respondWith(
      fetch(event.request.url, {
        method: event.request.method,
        headers: {
          'Authorization': event.request.headers.get('Authorization') || '',
          'Content-Type': event.request.headers.get('Content-Type') || 'application/json',
          'Accept': event.request.headers.get('Accept') || '*/*'
        },
        body: event.request.method !== 'GET' && event.request.method !== 'HEAD' ? event.request.clone().body : undefined,
        mode: 'cors',
        credentials: 'omit',
        duplex: 'half' // Add the duplex parameter for requests with streaming bodies
      }).then(response => {
        console.log('EMC Network response received with status:', response.status);
        // Clone the response and add CORS headers
        const newHeaders = new Headers(response.headers);
        newHeaders.set('Access-Control-Allow-Origin', '*');
        
        // Check if the response is an error
        if (!response.ok) {
          console.error(`EMC Network error with status ${response.status}`);
          return response.text().then(text => {
            console.error('EMC Network error response:', text);
            
            // Return a more helpful error response
            return new Response(JSON.stringify({ 
              error: { message: `EMC Network error (${response.status}): ${text}` } 
            }), {
              status: response.status,
              headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
              }
            });
          });
        }
        
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
