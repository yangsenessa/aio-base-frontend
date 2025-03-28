
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
        let errorMessage = "Unknown network error";
        
        try {
          const errorData = await response.json();
          console.error(`[EMC-NETWORK] 🛑 EMC endpoint ${i + 1} failed with status ${response.status}:`, errorData);
          errorMessage = errorData.error?.message || `Status ${response.status}`;
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
      console.warn(`[EMC-NETWORK] ⚠️ EMC endpoint ${i + 1} failed:`, error);
      lastError = error instanceof Error ? error : new Error(String(error));
      
      // Continue to the next endpoint
      continue;
    }
  }
  
  // If we've tried all endpoints and none succeeded, throw the last error
  throw lastError || new Error("All EMC Network endpoints failed");
}
