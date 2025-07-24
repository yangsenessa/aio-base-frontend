
/**
 * SiliconFlow provider implementation
 */

import { toast } from "@/components/ui/use-toast";
import { AIProvider } from "./AIProvider";
import { CFG_SILICONFLOW_API_KEY, CFG_SILICONFLOW_ENDPOINT } from "./emcNetwork/config";
import { ChatMessage, EMCModel } from "@/services/emcNetworkService";
import { 
  fixMalformedJson, 
  safeJsonParse, 
  fixBackslashEscapeIssues, 
  aggressiveBackslashFix 
} from "@/util/json/jsonParser";
import { cleanJsonString } from "@/util/json/jsonExtractor";

// SiliconFlow endpoint
const SILICONFLOW_ENDPOINT = CFG_SILICONFLOW_ENDPOINT;

// API key
const SILICONFLOW_API_KEY = CFG_SILICONFLOW_API_KEY;

// Timeout for API calls in milliseconds
const REQUEST_TIMEOUT = 300000; // 5 minutes

/**
 * SiliconFlow provider implementation
 */
export class SiliconFlowProvider implements AIProvider {
  private readonly thinkPattern = /<think>(.*?)<\/think>/gs;
  private readonly MCP_INDEXER_ROLE = 'You are an MCP Capability Indexer';
  private readonly MCP_INVERT_INDEX_ROLE = "You are an AI indexing assistant";

  getName(): string {
    return "SiliconFlow";
  }
  
  getSupportedModels(): string[] {
    return [EMCModel.QWEN_CODER];
  }
  
  supportsModel(model: string): boolean {
    return this.getSupportedModels().includes(model);
  }

  /**
   * Helper method to process text by removing think tags and logging think content
   * @param text The text to process
   * @returns The cleaned text with think tags removed
   */
  private processText(text: string): string {
    // Extract and log think tags
    const thinkMatches = text.matchAll(this.thinkPattern);
    // Remove think tags and their contents
    return text.replace(this.thinkPattern, '').trim();
  }

  /**
   * Helper method to validate and clean JSON content
   * @param text The text containing JSON
   * @returns The cleaned and validated JSON string
   */
  private extractAndValidateJson(text: string): string {
    // 查找第一个[或{作为JSON的开始
    const startIndex = Math.min(
      text.indexOf('[') !== -1 ? text.indexOf('[') : Infinity,
      text.indexOf('{') !== -1 ? text.indexOf('{') : Infinity
    );
    
    if (startIndex === Infinity) {
      throw new Error('No JSON found in response');
    }
    
    // 根据开始字符确定结束字符
    const endChar = text[startIndex] === '[' ? ']' : '}';
    const endIndex = text.lastIndexOf(endChar);
    
    if (endIndex === -1) {
      throw new Error('No complete JSON found in response');
    }
    
    // 提取JSON内容
    const jsonContent = text.slice(startIndex, endIndex + 1);
    
    // 验证JSON
    JSON.parse(jsonContent);
    return jsonContent;
  }
  
  private isBuildMcpIndexPrompt(messages: ChatMessage[]): boolean {
    return messages.some(msg => 
      msg.role === 'system' && 
        msg.content.includes(this.MCP_INDEXER_ROLE)
    );
  }

  private isInvertIndexPrompt(messages: ChatMessage[]): boolean {
    return messages.some(msg => 
      msg.role === 'system' && 
        msg.content.includes(this.MCP_INVERT_INDEX_ROLE)
    );
  }

  /**
   * Fix specific JSON formatting issues commonly seen in AI responses
   * @param text The text containing malformed JSON
   * @returns The fixed JSON string
   */
  private fixSpecificJsonIssues(text: string): string {
    let fixed = text;
    
    // First, try to parse as-is to see if it's already valid
    try {
      JSON.parse(fixed);
      console.log('[SILICONFLOW] 🎯 JSON is already valid, no fixes needed');
      return fixed;
    } catch (error) {
      console.log('[SILICONFLOW] 🔧 JSON needs fixes, applying corrections...');
    }
    
    // Fix weird bracket syntax like \("key"\) to "key" - very specific pattern
    if (fixed.includes('\\(') && fixed.includes('\\)')) {
      fixed = fixed.replace(/\\\(\\?"([^"]+)\\?"\\\)/g, '"$1"');
      console.log('[SILICONFLOW] 🔧 Fixed bracket syntax');
    }
    
    // Fix escaped quotes that shouldn't be escaped (but be careful)
    if (fixed.includes('\\"')) {
      // Fix escaped quotes in property names: \"key\": -> "key":
      fixed = fixed.replace(/\\"([^"\\]+)\\":/g, '"$1":');
      console.log('[SILICONFLOW] 🔧 Fixed escaped property names');
      
      // Fix escaped quotes in string values: \"value\" -> "value"
      fixed = fixed.replace(/:\s*\\"([^"\\]*)\\"([,\s\}\]])/g, ': "$1"$2');
      console.log('[SILICONFLOW] 🔧 Fixed escaped string values');
    }
    
    // Fix missing quotes around property names (only if clearly unquoted)
    // Check for pattern like { word: or , word: where word is not already quoted
    if (/[{\s,]([a-zA-Z_][a-zA-Z0-9_]*)\s*:/g.test(fixed)) {
      fixed = fixed.replace(/([{\s,])([a-zA-Z_][a-zA-Z0-9_]*)\s*:/g, '$1"$2":');
      console.log('[SILICONFLOW] 🔧 Added quotes to property names');
    }
    
    // Fix trailing commas
    if (/,\s*[}\]]/g.test(fixed)) {
      fixed = fixed.replace(/,(\s*[}\]])/g, '$1');
      console.log('[SILICONFLOW] 🔧 Removed trailing commas');
    }
    
    // Fix missing commas between objects/arrays (be very careful here)
    // Look for patterns like }{ or ]{ or }" where comma is clearly missing
    if (/}[\s]*[{\[]|][\s]*[{\[]|}"[^,\s}]/g.test(fixed)) {
      fixed = fixed.replace(/}(\s*)([{\[])/g, '},$1$2');
      fixed = fixed.replace(/](\s*)([{\[])/g, '],$1$2');
      fixed = fixed.replace(/}(\s*)"/g, '},$1"');
      fixed = fixed.replace(/](\s*)"/g, '],$1"');
      console.log('[SILICONFLOW] 🔧 Added missing commas');
    }
    
    // Fix unescaped quotes inside string values
    // This is tricky - only fix obvious cases
    if (/"[^"]*"[^",:}\]]*"[^",:}\]]*"/g.test(fixed)) {
      // This pattern is too risky, skip for now
      console.log('[SILICONFLOW] ⚠️ Detected potential quote issues but skipping risky fix');
    }
    
    return fixed;
  }

  async reconstructJsonResponse(text: string): Promise<string> {
    console.log(`[SILICONFLOW] 🔄 Attempting JSON reconstruction`);
    console.log(`[SILICONFLOW] 📝 Original content:`, text);
    
    try {
      // Step 1: Try direct JSON parse first
      try {
        const directParsed = JSON.parse(text);
        if (directParsed) {
          console.log('[SILICONFLOW] ✅ Direct JSON parse successful');
          return JSON.stringify(directParsed);
        }
      } catch (directError) {
        console.log('[SILICONFLOW] Direct JSON parse failed, trying cleanup...');
      }

      // Step 2: Fix specific JSON issues first
      const specificFixed = this.fixSpecificJsonIssues(text);
      try {
        const specificParsed = JSON.parse(specificFixed);
        if (specificParsed) {
          console.log('[SILICONFLOW] ✅ Specific fix JSON parse successful');
          return JSON.stringify(specificParsed);
        }
      } catch (specificError) {
        console.log('[SILICONFLOW] Specific fix failed, trying general cleanup...');
      }

      // Step 3: Try cleaning the JSON content
      const cleanedContent = cleanJsonString(specificFixed);
      try {
        const cleanParsed = JSON.parse(cleanedContent);
        if (cleanParsed) {
          console.log('[SILICONFLOW] ✅ Clean JSON parse successful');
          return JSON.stringify(cleanParsed);
        }
      } catch (cleanError) {
        console.log('[SILICONFLOW] Clean JSON parse failed, trying malformed fixes...');
      }

      // Step 4: Try fixing malformed JSON
      const fixedJson = fixMalformedJson(cleanedContent);
      try {
        const fixedParsed = JSON.parse(fixedJson);
        if (fixedParsed) {
          console.log('[SILICONFLOW] ✅ Fixed JSON parse successful');
          return JSON.stringify(fixedParsed);
        }
      } catch (fixError) {
        console.log('[SILICONFLOW] Fixed JSON parse failed, trying safe parser...');
      }

      // Step 5: Try safe parser
      const safeParsed = safeJsonParse(fixedJson);
      if (safeParsed) {
        console.log('[SILICONFLOW] ✅ Safe JSON parse successful');
        return JSON.stringify(safeParsed);
      }

      // Step 6: Try backslash escape fixes
      const backslashFixed = fixBackslashEscapeIssues(fixedJson);
      try {
        const backslashParsed = JSON.parse(backslashFixed);
        if (backslashParsed) {
          console.log('[SILICONFLOW] ✅ Backslash fix parse successful');
          return JSON.stringify(backslashParsed);
        }
      } catch (backslashError) {
        console.log('[SILICONFLOW] Backslash fix parse failed, trying aggressive fix...');
      }

      // Step 7: Try aggressive backslash fix as final attempt
      const aggressiveFixed = aggressiveBackslashFix(backslashFixed);
      try {
        const aggressiveParsed = JSON.parse(aggressiveFixed);
        if (aggressiveParsed) {
          console.log('[SILICONFLOW] ✅ Aggressive fix parse successful');
          return JSON.stringify(aggressiveParsed);
        }
      } catch (aggressiveError) {
        console.log('[SILICONFLOW] Aggressive fix parse failed');
      }

      // If all fixes fail, throw error
      throw new Error('Failed to fix JSON format after all attempts');

    } catch (error) {
      console.error(`[SILICONFLOW] ❌ JSON reconstruction failed:`, error);
      console.log('[SILICONFLOW] 📝 Failed JSON content, so return as plain text:', text);
      return text;
    }
  }

  private async cleanJsonResponse(text: string, messages: ChatMessage[]): Promise<string> {
    try {
      // First process the text to remove think tags
      const processedText = this.processText(text);
      
      // Only attempt JSON reconstruction for MCP Indexer prompts
      if (this.isBuildMcpIndexPrompt(messages) || this.isInvertIndexPrompt(messages)) {
        console.log('[SILICONFLOW] 🔍 Detected MCP Indexer prompt, attempting JSON validation...');
        try {
          // Try to extract and validate JSON
          return this.extractAndValidateJson(processedText);
        } catch (error) {
          console.log('[SILICONFLOW] ⚠️ Invalid JSON format, attempting reconstruction...');
          // If parsing fails, try to reconstruct the JSON
          return await this.reconstructJsonResponse(processedText);
        }
      }
      
      // For other prompts, return the processed text directly
      console.log('[SILICONFLOW] 📝 Non-MCP Indexer prompt, returning processed text directly');
      return processedText;
    } catch (error) {
      console.error('[SILICONFLOW] ❌ Error processing response:', error);
      console.log('[SILICONFLOW] 📝 Failed to process response, so return as plain text:', text);
      return text;
    }
  }
  
  async generateCompletion(messages: ChatMessage[], model: string): Promise<string> {
    if (!this.supportsModel(model)) {
      throw new Error(`Model ${model} is not supported by SiliconFlow provider`);
    }
    
    console.log(`[SILICONFLOW] 🚀 Starting SiliconFlow completion request with model: ${model}`);
    
    try {
      const requestBody = JSON.stringify({
        model: model,
        messages: messages,
        stream: false,
        max_tokens: 16000,
        temperature: 0.7,
        top_p: 0.7,
        top_k: 50,
        frequency_penalty: 0.5,
        n: 1,
        response_format: { type: "text" }
      });
      
      console.log(`[SILICONFLOW] 📊 Request payload size: ${requestBody.length} bytes`);
      
      const response = await this.fetchWithTimeout(
        SILICONFLOW_ENDPOINT,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${SILICONFLOW_API_KEY}`,
            "accept": "application/json"
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
      
      // Clean and validate the JSON response using the new logic
      const finalResponse = await this.cleanJsonResponse(resultContent, messages);
      
      console.log(`[SILICONFLOW] ✅ SiliconFlow succeeded, response length: ${finalResponse.length} chars`);
      
      return finalResponse;
    } catch (error) {
      console.warn(`[SILICONFLOW] ⚠️ SiliconFlow request failed:`, error);
      throw error;
    }
  }
  
  /**
   * Function to fetch with timeout
   */
  private async fetchWithTimeout(url: string, options: RequestInit, timeout: number): Promise<Response> {
    const controller = new AbortController();
    const { signal } = controller;
    
    console.log(`[SILICONFLOW] 📡 Setting up fetch with timeout: ${timeout}ms`);
    const timeoutId = setTimeout(() => {
      console.log(`[SILICONFLOW] ⏱️ Request timed out after ${timeout}ms`);
      controller.abort();
    }, timeout);
    
    try {
      console.log(`[SILICONFLOW] 🔄 Starting fetch request to: ${url}`);
      const response = await fetch(url, { 
        ...options, 
        signal
      });
      console.log(`[SILICONFLOW] ✅ Fetch completed with status: ${response.status}`);
      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      console.log(`[SILICONFLOW] ❌ Fetch error: ${error instanceof Error ? error.message : String(error)}`);
      clearTimeout(timeoutId);
      throw error;
    }
  }
}
