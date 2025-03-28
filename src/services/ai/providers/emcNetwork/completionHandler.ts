
/**
 * Completion handler for EMC Network
 */

import { ChatMessage } from "@/services/emcNetworkService";
import { EMC_ENDPOINTS, EMC_API_KEY, REQUEST_TIMEOUT } from "./config";
import { fetchWithTimeout } from "./networkUtils";

/**
 * Process a completion request through EMC Network
 */
export async function processCompletionRequest(messages: ChatMessage[], model: string): Promise<string> {
  let lastError: Error | null = null;
  
  console.log(`[EMC-NETWORK] 🚀 Starting EMC completion request with model: ${model}`);
  console.log(`[EMC-NETWORK] 📝 Message count: ${messages.length}`);
  
  // Try each EMC endpoint 
  for (let i = 0; i < EMC_ENDPOINTS.length; i++) {
    const endpoint = EMC_ENDPOINTS[i];
    
    try {
      console.log(`[EMC-NETWORK] 🔍 Trying EMC endpoint ${i + 1}/${EMC_ENDPOINTS.length}: ${endpoint}`);
      
      const requestBody = JSON.stringify({
        model,
        messages,
        stream: false
      });
      
      console.log(`[EMC-NETWORK] 📊 Request payload size: ${requestBody.length} bytes`);
      
      const response = await fetchWithTimeout(
        endpoint,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${EMC_API_KEY}`,
            "accept": "application/json"
          },
          body: requestBody
        },
        REQUEST_TIMEOUT
      );
      
      if (!response.ok) {
        const errorData = await response.json().catch((jsonError) => {
          console.log(`[EMC-NETWORK] ⚠️ Failed to parse error response: ${jsonError}`);
          return { error: { message: "Network error" } };
        });
        
        console.error(`[EMC-NETWORK] 🛑 EMC endpoint ${i + 1} failed with status ${response.status}:`, errorData);
        throw new Error(`EMC Network error: ${errorData.error?.message || response.statusText}`);
      }
      
      console.log(`[EMC-NETWORK] 📥 Parsing response from endpoint ${i + 1}`);
      const data = await response.json();
      
      // Check if the expected data structure is present
      if (!data.choices || !data.choices[0]?.message?.content) {
        console.error(`[EMC-NETWORK] 🧩 Invalid response format:`, data);
        throw new Error("Invalid response format from EMC Network");
      }
      
      const resultContent = data.choices[0].message.content.trim();
      console.log(`[EMC-NETWORK] ✅ EMC endpoint ${i + 1} succeeded, response length: ${resultContent.length} chars`);
      
      return resultContent;
    } catch (error) {
      console.warn(`[EMC-NETWORK] ⚠️ EMC endpoint ${i + 1} failed:`, error);
      lastError = error instanceof Error ? error : new Error(String(error));
      
      // Continue to the next endpoint
      continue;
    }
  }
  
  // If we've tried all endpoints and none succeeded, throw the last error
  throw lastError || new Error("All EMC Network endpoints failed");
}
