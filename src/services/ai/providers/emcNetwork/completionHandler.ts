/**
 * Completion handler for EMC Network
 * Uses service worker to handle CORS and CSP issues
 */

import { ChatMessage } from "@/services/emcNetworkService";
import { EMC_ENDPOINTS, EMC_API_KEY, REQUEST_TIMEOUT } from "./config";
import { fetchWithTimeout } from "./networkUtils";

// Number of retry attempts per endpoint
const MAX_RETRIES_PER_ENDPOINT = 2;
// Delay between retries in ms
const RETRY_BASE_DELAY = 1500;

/**
 * Sleep function for implementing delay between retries
 */
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Process a completion request through EMC Network
 * This version works through the service worker to handle CSP restrictions
 */
export async function processCompletionRequest(messages: ChatMessage[], model: string): Promise<string> {
  let lastError: Error | null = null;
  
  console.log(`[EMC-NETWORK] 🚀 Starting EMC completion request with model: ${model}`);
  console.log(`[EMC-NETWORK] 📝 Message count: ${messages.length}`);
  
  // Create the request body once to reuse it
  const requestBody = JSON.stringify({
    model,
    messages,
    stream: false
  });
  
  console.log(`[EMC-NETWORK] 📊 Request payload size: ${requestBody.length} bytes`);
  
  // Ensure service worker is registered before proceeding
  let serviceWorkerReady = false;
  try {
    serviceWorkerReady = await checkServiceWorkerRegistration();
    console.log(`[EMC-NETWORK] 🤖 Service worker status: ${serviceWorkerReady ? 'Ready' : 'Not available'}`);
  } catch (err) {
    console.warn(`[EMC-NETWORK] ⚠️ Could not verify service worker: ${err.message}`);
  }
  
  // Try each EMC endpoint 
  for (let i = 0; i < EMC_ENDPOINTS.length; i++) {
    const endpoint = EMC_ENDPOINTS[i];
    
    // Add retry logic for each endpoint
    for (let retryCount = 0; retryCount <= MAX_RETRIES_PER_ENDPOINT; retryCount++) {
      try {
        // Log attempt information
        if (retryCount === 0) {
          console.log(`[EMC-NETWORK] 🔍 Trying EMC endpoint ${i + 1}/${EMC_ENDPOINTS.length}: ${endpoint}`);
        } else {
          console.log(`[EMC-NETWORK] 🔁 Retry ${retryCount}/${MAX_RETRIES_PER_ENDPOINT} for endpoint ${i + 1}`);
        }
        
        // Request options
        const fetchOptions = {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${EMC_API_KEY}`,
            "Accept": "application/json"
          },
          body: requestBody
        };
        
        // Use standard fetch (which will go through service worker) instead of direct fetch
        // This ensures the service worker handles the request and applies CORS headers
        const response = await fetchWithTimeout(endpoint, fetchOptions, REQUEST_TIMEOUT);
        
        if (!response.ok) {
          let errorMessage = "Unknown network error";
          let errorData = null;
          
          try {
            // Try to parse error response
            errorData = await response.json();
            console.error(`[EMC-NETWORK] 🛑 EMC endpoint ${i + 1} failed with status ${response.status}:`, errorData);
            errorMessage = errorData.error?.message || `Status ${response.status}`;
            
            // Check for network-specific errors from service worker
            if (errorData.error?.details?.includes('Failed to fetch') || 
                errorMessage.includes('Network connectivity issue') ||
                errorMessage.includes('Failed to connect')) {
              // This is likely a network issue - handle accordingly
              console.warn(`[EMC-NETWORK] 📡 Network connectivity issue detected`);
              throw new Error(`Network connectivity issue: ${errorData.error?.details || errorMessage}`);
            }
          } catch (jsonError) {
            // If JSON parsing fails, try to get text
            const errorText = await response.text().catch(() => "Could not parse response");
            console.error(`[EMC-NETWORK] 🛑 EMC endpoint ${i + 1} failed with status ${response.status}, raw response:`, errorText);
            errorMessage = `Status ${response.status}: ${errorText.substring(0, 100)}`;
          }
          
          throw new Error(`EMC Network error: ${errorMessage}`);
        }
        
        console.log(`[EMC-NETWORK] 📥 Parsing response from endpoint ${i + 1}`);
        let data;
        
        try {
          data = await response.json();
        } catch (jsonError) {
          console.error(`[EMC-NETWORK] 🧩 Error parsing JSON response:`, jsonError);
          throw new Error("Invalid JSON response from EMC Network");
        }
        
        // Check if the expected data structure is present
        if (!data.choices || !data.choices[0]?.message?.content) {
          console.error(`[EMC-NETWORK] 🧩 Invalid response format:`, data);
          throw new Error("Invalid response format from EMC Network");
        }
        
        const resultContent = data.choices[0].message.content.trim();
        console.log(`[EMC-NETWORK] ✅ EMC endpoint ${i + 1} succeeded, response length: ${resultContent.length} chars`);
        
        return resultContent;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.warn(`[EMC-NETWORK] ⚠️ EMC endpoint ${i + 1}${retryCount > 0 ? ` (retry ${retryCount})` : ''} failed:`, error);
        
        // Store the last error to throw if all endpoints fail
        lastError = error instanceof Error ? error : new Error(String(error));
        
        // Check if this is a connectivity issue we should retry
        const isRetryableError = 
          errorMessage.includes('Failed to fetch') || 
          errorMessage.includes('Network connectivity issue') ||
          errorMessage.includes('Failed to connect') ||
          errorMessage.includes('Content Security Policy') ||
          errorMessage.toLowerCase().includes('timeout');
        
        // If this isn't the last retry attempt and it's a retryable error, wait and retry
        if (retryCount < MAX_RETRIES_PER_ENDPOINT && isRetryableError) {
          // Use progressive delay for retries
          const delay = RETRY_BASE_DELAY * (retryCount + 1);
          console.log(`[EMC-NETWORK] ⏱️ Waiting ${delay}ms before retrying endpoint ${i + 1}`);
          await sleep(delay);
          continue;
        }
        
        // If we've exhausted retries for this endpoint, try the next endpoint
        break;
      }
    }
  }
  
  // If we've tried all endpoints and none succeeded, throw the last error
  console.error(`[EMC-NETWORK] 💥 All EMC Network endpoints failed after exhausting all retries`);
  throw lastError || new Error("All EMC Network endpoints failed");
}

/**
 * Check if the service worker is registered and ready
 */
async function checkServiceWorkerRegistration(): Promise<boolean> {
  // Check if service workers are supported
  if (!('serviceWorker' in navigator)) {
    console.warn('[EMC-NETWORK] 🤖 Service workers are not supported in this browser');
    return false;
  }
  
  try {
    // Check for existing registrations
    const registrations = await navigator.serviceWorker.getRegistrations();
    
    if (registrations.length === 0) {
      console.warn('[EMC-NETWORK] 🤖 No service workers registered');
      return false;
    }
    
    // Find our service worker
    const ourServiceWorker = registrations.find(registration => 
      registration.active && 
      registration.active.scriptURL.includes('service-worker.js')
    );
    
    if (!ourServiceWorker) {
      console.warn('[EMC-NETWORK] 🤖 Our service worker not found among registered workers');
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('[EMC-NETWORK] 🤖 Error checking service worker registration:', error);
    return false;
  }
}
