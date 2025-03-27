
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

// API endpoints for EMC Network
const EMC_ENDPOINTS = [
  "http://162.218.231.180:50005/edge/16Uiu2HAm9oMkh29oyQaLRjVNn7dFxUqfHrG3xtmdFo1xmoKRPd6r/8001/v1/chat/completions",
  "http://162.218.231.180:50005/edge/16Uiu2HAmSodeWgMsMN9TWYo3QhtdC1s9TkGtaFdWqCqxwMcq3R3s/8002/v1/chat/completions",
  "http://18.167.51.1:50005/edge/16Uiu2HAmQnkL58V215wZUDCLBTxeUQZeCXUwzPZKLAQKyvBQ7c3a/8002/v1/chat/completions"
];

// API key for EMC Network
const EMC_API_KEY = "833_txLiSbJibu160317539183112192";

// Timeout for API calls in milliseconds
const REQUEST_TIMEOUT = 10000; // 10 seconds

/**
 * Function to fetch with timeout
 */
const fetchWithTimeout = async (url: string, options: RequestInit, timeout: number): Promise<Response> => {
  const controller = new AbortController();
  const { signal } = controller;
  
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  
  try {
    const response = await fetch(url, { ...options, signal });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
};

/**
 * Generates a completion using the EMC Network
 * Falls back to other endpoints if one fails
 */
export const generateEMCCompletion = async (
  messages: ChatMessage[],
  model: EMCModel = EMCModel.DEEPSEEK_CHAT
): Promise<string> {
  // Try each endpoint in order until one succeeds
  let lastError: Error | null = null;
  
  for (let i = 0; i < EMC_ENDPOINTS.length; i++) {
    const endpoint = EMC_ENDPOINTS[i];
    
    try {
      console.log(`Trying EMC endpoint ${i + 1}/${EMC_ENDPOINTS.length}: ${endpoint}`);
      
      const response = await fetchWithTimeout(
        endpoint,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${EMC_API_KEY}`
          },
          body: JSON.stringify({
            model,
            messages,
            stream: false
          })
        },
        REQUEST_TIMEOUT
      );
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: { message: "Network error" } }));
        console.error(`EMC endpoint ${i + 1} failed:`, errorData);
        throw new Error(`EMC Network error: ${errorData.error?.message || response.statusText}`);
      }
      
      const data = await response.json();
      
      // Check if the expected data structure is present
      if (!data.choices || !data.choices[0]?.message?.content) {
        throw new Error("Invalid response format from EMC Network");
      }
      
      console.log(`EMC endpoint ${i + 1} succeeded`);
      return data.choices[0].message.content.trim();
    } catch (error) {
      console.warn(`EMC endpoint ${i + 1} failed:`, error);
      lastError = error instanceof Error ? error : new Error(String(error));
      
      // Display a toast only when we've tried multiple endpoints
      if (i > 0) {
        toast({
          title: `EMC endpoint ${i + 1} failed`,
          description: "Trying next endpoint...",
          variant: "default"
        });
      }
      
      // Continue to the next endpoint
      continue;
    }
  }
  
  // If we've tried all endpoints and none succeeded, throw the last error
  console.error("All EMC endpoints failed");
  toast({
    title: "EMC Network unavailable",
    description: "All endpoints failed to respond",
    variant: "destructive"
  });
  
  throw lastError || new Error("All EMC Network endpoints failed");
};
