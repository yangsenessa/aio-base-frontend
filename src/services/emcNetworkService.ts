import { toast } from "@/components/ui/use-toast";

// Define the model options for EMC Network
export enum EMCModel {
  DEEPSEEK_CHAT = "deepseek-chat"
}

// Define message type for chat completions
export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

// API endpoints for EMC Network - changed from HTTPS to HTTP
const EMC_ENDPOINTS = [
  "http://162.218.231.180:50005/edge/16Uiu2HAm9oMkh29oyQaLRjVNn7dFxUqfHrG3xtmdFo1xmoKRPd6r/8001/v1/chat/completions",
  "http://162.218.231.180:50005/edge/16Uiu2HAmSodeWgMsMN9TWYo3QhtdC1s9TkGtaFdWqCqxwMcq3R3s/8002/v1/chat/completions",
  "http://18.167.51.1:50005/edge/16Uiu2HAmQnkL58V215wZUDCLBTxeUQZeCXUwzPZKLAQKyvBQ7c3a/8002/v1/chat/completions"
];

// API key for EMC Network
const EMC_API_KEY = "833_txLiSbJibu160317539183112192";

// Timeout for API calls in milliseconds
const REQUEST_TIMEOUT = 15000; // 15 seconds

/**
 * Function to fetch with timeout
 */
const fetchWithTimeout = async (url: string, options: RequestInit, timeout: number): Promise<Response> => {
  const controller = new AbortController();
  const { signal } = controller;
  
  console.log(`[EMC-NETWORK] 📡 Setting up fetch with timeout: ${timeout}ms`);
  const timeoutId = setTimeout(() => {
    console.log(`[EMC-NETWORK] ⏱️ Request timed out after ${timeout}ms`);
    controller.abort();
  }, timeout);
  
  try {
    console.log(`[EMC-NETWORK] 🔄 Starting fetch request to: ${url}`);
    const response = await fetch(url, { ...options, signal });
    console.log(`[EMC-NETWORK] ✅ Fetch completed with status: ${response.status}`);
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    console.log(`[EMC-NETWORK] ❌ Fetch error: ${error instanceof Error ? error.message : String(error)}`);
    clearTimeout(timeoutId);
    throw error;
  }
};

/**
 * Generate a mock response when EMC Network is unavailable
 * This is a fallback mechanism to ensure we can still provide a user experience
 */
const generateMockResponse = async (messages: ChatMessage[]): Promise<string> => {
  const userMessage = messages.find(msg => msg.role === "user")?.content || "";
  
  console.log(`[EMC-NETWORK] 🎭 Generating mock response for: "${userMessage.substring(0, 50)}..."`);
  
  // Simple mock response simulation
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  return `I'm currently unable to process your request through the EMC Network due to connection issues. 
  
As a fallback, I'm providing this automated response. Your message was about: "${userMessage.substring(0, 100)}${userMessage.length > 100 ? '...' : ''}".

Please try again later when the network connectivity to EMC servers has been restored. In the meantime, you can:
1. Check your internet connection
2. Use local features that don't require EMC Network access
3. Try using a different network if available

Thank you for your understanding.`;
};

/**
 * Generates a completion using the EMC Network
 * Falls back to mock response if all endpoints fail
 */
export const generateEMCCompletion = async (
  messages: ChatMessage[],
  model: EMCModel = EMCModel.DEEPSEEK_CHAT
): Promise<string> => {
  // Try each endpoint in order until one succeeds
  let lastError: Error | null = null;
  
  console.log(`[EMC-NETWORK] 🚀 Starting EMC completion request with model: ${model}`);
  console.log(`[EMC-NETWORK] 📝 Message count: ${messages.length}`);
  
  // Try each endpoint with HTTP
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
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type, Authorization"
          },
          mode: "cors",
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
  
  // If we've tried all endpoints and none succeeded, generate a mock response
  console.error("[EMC-NETWORK] ❌ All EMC endpoints failed - using mock response mechanism");
  toast({
    title: "EMC Network unavailable",
    description: "All endpoints failed to respond. Using local fallback service.",
    variant: "destructive"
  });
  
  return generateMockResponse(messages);
};
