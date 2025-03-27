
import { toast } from "@/components/ui/use-toast";
import { AIProvider } from "./AIProvider";
import { ChatMessage, EMCModel } from "@/services/emcNetworkService";

// API endpoints for EMC Network - HTTP endpoints
const EMC_ENDPOINTS = [
  "http://162.218.231.180:50005/edge/16Uiu2HAm9oMkh29oyQaLRjVNn7dFxUqfHrG3xtmdFo1xmoKRPd6r/8001/v1/chat/completions",
  "http://162.218.231.180:50005/edge/16Uiu2HAmSodeWgMsMN9TWYo3QhtdC1s9TkGtaFdWqCqxwMcq3R3s/8002/v1/chat/completions",
  "http://18.167.51.1:50005/edge/16Uiu2HAmQnkL58V215wZUDCLBTxeUQZeCXUwzPZKLAQKyvBQ7c3a/8002/v1/chat/completions"
];

// API key
const EMC_API_KEY = "833_txLiSbJibu160317539183112192";

// Timeout for API calls in milliseconds
const REQUEST_TIMEOUT = 15000; // 15 seconds

/**
 * EMC Network provider implementation
 */
export class EMCNetworkProvider implements AIProvider {
  getName(): string {
    return "EMC Network";
  }
  
  getSupportedModels(): string[] {
    return [EMCModel.DEEPSEEK_CHAT];
  }
  
  supportsModel(model: string): boolean {
    return this.getSupportedModels().includes(model);
  }
  
  async generateCompletion(messages: ChatMessage[], model: string): Promise<string> {
    if (!this.supportsModel(model)) {
      throw new Error(`Model ${model} is not supported by EMC Network provider`);
    }
    
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
        
        const response = await this.fetchWithTimeout(
          endpoint,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${EMC_API_KEY}`,
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
  
  /**
   * Function to fetch with timeout
   */
  private async fetchWithTimeout(url: string, options: RequestInit, timeout: number): Promise<Response> {
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
}
