
/**
 * Network utilities for EMC Network provider
 */

/**
 * Fetch with timeout for EMC Network
 */
export async function fetchWithTimeout(url: string, options: RequestInit, timeout: number): Promise<Response> {
  const controller = new AbortController();
  const { signal } = controller;
  
  console.log(`[EMC-NETWORK] 📡 Setting up fetch with timeout: ${timeout}ms`);
  const timeoutId = setTimeout(() => {
    console.log(`[EMC-NETWORK] ⏱️ Request timed out after ${timeout}ms`);
    controller.abort();
  }, timeout);
  
  try {
    console.log(`[EMC-NETWORK] 🔄 Starting fetch request to: ${url}`);
    const response = await fetch(url, { 
      ...options, 
      signal,
      mode: 'cors', 
      credentials: 'omit'
    });
    console.log(`[EMC-NETWORK] ✅ Fetch completed with status: ${response.status}`);
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    console.log(`[EMC-NETWORK] ❌ Fetch error: ${error instanceof Error ? error.message : String(error)}`);
    clearTimeout(timeoutId);
    throw error;
  }
}
