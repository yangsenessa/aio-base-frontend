
import { toast } from "@/components/ui/use-toast";

// Define the model options for EMC Network and SiliconFlow
export enum EMCModel {
  DEEPSEEK_CHAT = "deepseek-chat",
  QWEN_CODER = "Qwen/Qwen2.5-Coder-7B-Instruct"
}

// Define message type for chat completions
export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

// API endpoints for EMC Network - HTTP endpoints
const EMC_ENDPOINTS = [
  "http://162.218.231.180:50005/edge/16Uiu2HAm9oMkh29oyQaLRjVNn7dFxUqfHrG3xtmdFo1xmoKRPd6r/8001/v1/chat/completions",
  "http://162.218.231.180:50005/edge/16Uiu2HAmSodeWgMsMN9TWYo3QhtdC1s9TkGtaFdWqCqxwMcq3R3s/8002/v1/chat/completions",
  "http://18.167.51.1:50005/edge/16Uiu2HAmQnkL58V215wZUDCLBTxeUQZeCXUwzPZKLAQKyvBQ7c3a/8002/v1/chat/completions"
];

// SiliconFlow endpoint
const SILICONFLOW_ENDPOINT = "https://api.siliconflow.cn/v1/chat/completions";

// API keys
const EMC_API_KEY = "833_txLiSbJibu160317539183112192";
const SILICONFLOW_API_KEY = "sk-sizdciquzgledafoqeguebohudunufoztppywmclondftwij";

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
    const response = await fetch(url, { 
      ...options, 
      signal,
      // Only use CORS mode for EMC endpoints, not for SiliconFlow which uses HTTPS
      ...(url.includes('siliconflow.cn') ? {} : { mode: 'cors', credentials: 'omit' })
    });
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
 * Generate a mock response when network services are unavailable
 */
const generateMockResponse = async (messages: ChatMessage[]): Promise<string> => {
  const userMessage = messages.find(msg => msg.role === "user")?.content || "";
  
  console.log(`[EMC-NETWORK] 🎭 Generating mock response for: "${userMessage.substring(0, 50)}..."`);
  
  // Simple mock response simulation
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  return `I'm currently unable to process your request due to connection issues. 
  
As a fallback, I'm providing this automated response. Your message was about: "${userMessage.substring(0, 100)}${userMessage.length > 100 ? '...' : ''}".

Please try again later when network connectivity has been restored. In the meantime, you can:
1. Check your internet connection
2. Use local features that don't require network access
3. Try using a different network if available

Thank you for your understanding.`;
};

/**
 * Try to use SiliconFlow network
 */
const trySiliconFlow = async (messages: ChatMessage[], model: EMCModel): Promise<string> => {
  console.log(`[SILICONFLOW] 🚀 Starting SiliconFlow completion request with model: ${model}`);
  
  try {
    const requestBody = JSON.stringify({
      model: model,
      messages: messages,
      stream: false,
      max_tokens: 512,
      temperature: 0.7,
      top_p: 0.7,
      top_k: 50,
      frequency_penalty: 0.5,
      n: 1,
      response_format: { type: "text" }
    });
    
    console.log(`[SILICONFLOW] 📊 Request payload size: ${requestBody.length} bytes`);
    
    const response = await fetchWithTimeout(
      SILICONFLOW_ENDPOINT,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${SILICONFLOW_API_KEY}`,
        },
        body: requestBody
      },
      REQUEST_TIMEOUT
    );
    
    if (!response.ok) {
      const errorData = await response.json().catch((jsonError) => {
        console.log(`[SILICONFLOW] ⚠️ Failed to parse error response: ${jsonError}`);
        return { error: { message: "Network error" } };
      });
      
      console.error(`[SILICONFLOW] 🛑 SiliconFlow failed with status ${response.status}:`, errorData);
      throw new Error(`SiliconFlow error: ${errorData.error?.message || response.statusText}`);
    }
    
    console.log(`[SILICONFLOW] 📥 Parsing response`);
    const data = await response.json();
    
    // Check if the expected data structure is present
    if (!data.choices || !data.choices[0]?.message?.content) {
      console.error(`[SILICONFLOW] 🧩 Invalid response format:`, data);
      throw new Error("Invalid response format from SiliconFlow");
    }
    
    const resultContent = data.choices[0].message.content.trim();
    console.log(`[SILICONFLOW] ✅ SiliconFlow succeeded, response length: ${resultContent.length} chars`);
    
    return resultContent;
  } catch (error) {
    console.warn(`[SILICONFLOW] ⚠️ SiliconFlow request failed:`, error);
    throw error;
  }
};

/**
 * Generates a completion using the EMC Network or SiliconFlow
 * Falls back to mock response if all endpoints fail
 */
export const generateEMCCompletion = async (
  messages: ChatMessage[],
  model: EMCModel = EMCModel.DEEPSEEK_CHAT
): Promise<string> => {
  // Check if we should use SiliconFlow based on the model
  if (model === EMCModel.QWEN_CODER) {
    try {
      console.log(`[AI-PROVIDER] 🔍 Using SiliconFlow for model: ${model}`);
      return await trySiliconFlow(messages, model);
    } catch (error) {
      console.error(`[AI-PROVIDER] ❌ SiliconFlow failed, trying EMC Network:`, error);
      toast({
        title: "SiliconFlow unavailable",
        description: "Falling back to EMC Network or local service.",
        variant: "destructive"
      });
      // Continue with EMC endpoints as fallback
    }
  }
  
  // Try each EMC endpoint in order until one succeeds
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
  
  // If we've tried all endpoints and none succeeded, generate a mock response
  console.error("[AI-PROVIDER] ❌ All endpoints failed - using mock response mechanism");
  toast({
    title: "AI services unavailable",
    description: "All endpoints failed to respond. Using local fallback service.",
    variant: "destructive"
  });
  
  return generateMockResponse(messages);
};
