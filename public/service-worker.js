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
    console.log('Forwarding request to EMC Network:', event.request.method, 'to URL:', event.request.url);
    
    // Add timeout to the fetch request
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('EMC Network request timeout')), 30000);
    });
    
    const fetchOptions = {
      method: event.request.method,
      headers: (() => {
        // Create a new headers object
        const newHeaders = new Headers();
        
        // Store the original Content-Type if it's multipart/form-data
        let originalContentType = null;
        
        // Copy all original headers
        for (const [key, value] of event.request.headers.entries()) {
          if (key.toLowerCase() === 'content-type' && value.includes('multipart/form-data')) {
            // Save it to add back later
            originalContentType = value;
            console.log('Found FormData Content-Type:', value);
          } else {
            newHeaders.append(key, value);
          }
        }
        
        // Ensure Authorization is present with Bearer prefix
        if (!newHeaders.has('Authorization')) {
          newHeaders.append('Authorization', 'Bearer 833_txLiSbJibu160317539183112192');
        }
        
        // Important: Add back the multipart/form-data Content-Type if we found one
        if (originalContentType) {
          newHeaders.append('Content-Type', originalContentType);
          console.log('Added back FormData Content-Type header', originalContentType);
        }
        
        return newHeaders;
      })(),
      // Don't modify or clone the body for FormData requests
      body: event.request.method !== 'GET' && event.request.method !== 'HEAD' ? event.request.clone().body : undefined,
      mode: 'cors',
      credentials: 'omit',
      duplex: 'half', // Add this parameter for streaming body requests
      redirect: 'follow'
    };
    
    console.log('Fetch options:', JSON.stringify({
      method: fetchOptions.method,
      headers: Array.from(fetchOptions.headers.entries()),
      mode: fetchOptions.mode,
      credentials: fetchOptions.credentials
    }));
    
    event.respondWith(
      Promise.race([
        fetch(event.request.url, fetchOptions),
        timeoutPromise
      ])
      .then(response => {
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
      })
      .catch(error => {
        const errorMessage = error.toString();
        console.error('EMC Network fetch error:', errorMessage);
        console.error('Stack trace:', error.stack || 'No stack trace available');
        
        // Try a direct check to diagnose network connectivity issues
        return fetch('https://www.google.com', { mode: 'no-cors', cache: 'no-store' })
          .then(() => {
            // If Google is reachable but EMC isn't, it's likely an EMC-specific issue
            console.log('Internet connection is working, but EMC Network is unreachable');
            return new Response(JSON.stringify({ 
              error: { 
                message: 'Failed to connect to EMC Network while internet is available',
                details: errorMessage,
                url: event.request.url
              } 
            }), {
              status: 502, // Bad Gateway
              headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
              }
            });
          })
          .catch(() => {
            // If Google is also unreachable, it's likely a general network issue
            console.log('General internet connectivity issue detected');
            return new Response(JSON.stringify({ 
              error: { 
                message: 'Network connectivity issue detected',
                details: errorMessage,
                url: event.request.url
              } 
            }), {
              status: 503, // Service Unavailable
              headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
              }
            });
          });
      })
    );
    return;
  }
  
  // For all other requests, use default handling
  return;
});
