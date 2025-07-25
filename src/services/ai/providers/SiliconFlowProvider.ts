
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

    // NEW: Simplified mixed quote fix strategy
    // This handles the specific cases from user's examples more effectively
    if (fixed.includes('\\"')) {
      console.log('[SILICONFLOW] 🔧 Detected escaped quotes, applying simplified fix...');
      
      // NEW: Pre-process complex escape patterns before normalization
      if (fixed.includes('\\\\\\') || fixed.includes('$')) {
        console.log('[SILICONFLOW] 🔧 Detected complex escape patterns, applying pre-processing...');
        
        // Fix triple backslash quotes: \\\" -> \"
        if (fixed.includes('\\\\\\')) {
          fixed = fixed.replace(/\\\\\\\"/g, '\\"');
          console.log('[SILICONFLOW] 🔧 Fixed triple backslash quotes');
        }
        
        // Fix property names with $ symbols: \"key\$: -> \"key\":
        if (fixed.includes('$')) {
          fixed = fixed.replace(/\\"([^"\\]+)\\\$\$?:/g, '\\"$1\\":');
          console.log('[SILICONFLOW] 🔧 Fixed property names with $ symbols');
        }
        
        // Fix mixed complex patterns in values: \$: -> \":
        fixed = fixed.replace(/\\\$:/g, '\\":');
        
        // Fix any remaining $ symbols in JSON structure
        fixed = fixed.replace(/(["\w])\$([:\],}])/g, '$1$2');
        console.log('[SILICONFLOW] 🔧 Cleaned remaining $ symbols');
      }
      
      // Strategy 1: Complete normalization of all quotes
      // Replace all escaped quotes with normal quotes, then validate context
      let normalized = fixed.replace(/\\"/g, '"');
      
      // Check if the normalization worked
      try {
        JSON.parse(normalized);
        console.log('[SILICONFLOW] ✅ Simple normalization successful');
        fixed = normalized;
      } catch (error) {
        console.log('[SILICONFLOW] ⚠️ Simple normalization failed, trying advanced fix...');
        
        // Strategy 2: Context-aware quote fixing
        // Split into lines and fix each line individually
        const lines = fixed.split('\n');
        const fixedLines = lines.map(line => {
          let fixedLine = line;
          
          // Only process lines that have escaped quotes
          if (fixedLine.includes('\\"')) {
            
            // NEW: Handle remaining complex patterns first
            // Fix patterns like: \\"key\$: or \\"value\\\$
            if (fixedLine.includes('$')) {
              fixedLine = fixedLine.replace(/\\"([^"\\]*)\\\$(\s*[:}],])/g, '\\"$1\\"$2');
              fixedLine = fixedLine.replace(/\\"([^"\\]*)\$(\s*[:}],])/g, '\\"$1\\"$2');
            }
            
            // Fix property names: \"key\": -> "key":
            fixedLine = fixedLine.replace(/\\"([^"\\]+)\\"(\s*:)/g, '"$1"$2');
            
            // Fix string values: : \"value\" -> : "value"
            fixedLine = fixedLine.replace(/:\s*\\"([^"\\]*)\\"(?=\s*[,\]\}])/g, ': "$1"');
            
            // Fix mixed patterns on the same line
            // Convert remaining \" to " in JSON structure context
            fixedLine = fixedLine.replace(/\\"([^"\\]*)\\"(?=\s*[,\]\}:])/g, '"$1"');
            
            // NEW: Handle incomplete quoted strings more carefully
            // Look for pattern like \"text_without_ending_quote followed by JSON structure chars
            if (fixedLine.includes('\\"') && /\\"[^"]*[}\],]/g.test(fixedLine)) {
              // Fix pattern: \"text_content} -> "text_content"}
              fixedLine = fixedLine.replace(/\\"([^"\\]*?)([}\],])/g, '"$1"$2');
              console.log('[SILICONFLOW] 🔧 Fixed incomplete quoted string with JSON delimiter');
            }
            
            // Handle remaining incomplete quoted strings - add missing closing quotes
            // But be more careful about where to add them
            const incompleteMatches = fixedLine.match(/\\"[^"]*$/g);
            if (incompleteMatches) {
              // Look for JSON structure characters after the incomplete quote
              const afterIncomplete = fixedLine.substring(fixedLine.lastIndexOf('\\"'));
              const nextStructureChar = afterIncomplete.search(/[}\],]/);
              
              if (nextStructureChar > 0) {
                // Insert quote before the structure character
                const beforeStructure = afterIncomplete.substring(0, nextStructureChar);
                const afterStructure = afterIncomplete.substring(nextStructureChar);
                fixedLine = fixedLine.substring(0, fixedLine.lastIndexOf('\\"')) + 
                           beforeStructure.replace(/\\"/, '"') + '"' + afterStructure;
              } else {
                // No structure character found, add at end
                if (!fixedLine.trimRight().endsWith('"') && 
                    !fixedLine.trimRight().endsWith('",') && 
                    !fixedLine.trimRight().endsWith('"}')) {
                  fixedLine = fixedLine.replace(/\\"([^"]*)$/, '"$1"');
                }
              }
            }
          }
          
          return fixedLine;
        });
        
        fixed = fixedLines.join('\n');
        
        // Final cleanup: handle any remaining escaped quotes
        if (fixed.includes('\\"')) {
          // Convert any remaining escaped quotes to normal quotes
          fixed = fixed.replace(/\\"/g, '"');
        }
      }
      
      console.log('[SILICONFLOW] 🔧 Applied mixed quote fixes');
    }

    // Fix weird bracket syntax like \("key"\) to "key" - very specific pattern
    if (fixed.includes('\\(') && fixed.includes('\\)')) {
      fixed = fixed.replace(/\\\(\\?"([^"]+)\\?"\\\)/g, '"$1"');
      console.log('[SILICONFLOW] 🔧 Fixed bracket syntax');
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
    
    // NEW: Final validation and report
    try {
      JSON.parse(fixed);
      console.log('[SILICONFLOW] ✅ All JSON fixes successful - valid JSON achieved');
    } catch (validationError) {
      console.log('[SILICONFLOW] ⚠️ JSON fixes validation failed, proceeding to next reconstruction step');
      // Log the specific error for debugging
      console.log('[SILICONFLOW] 🐛 Parse error:', validationError.message);
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

  /**
   * Clean and fix inverted index array responses
   * @param jsonString The JSON string to clean
   * @returns The cleaned JSON string
   */
  private cleanInvertedIndexResponse(jsonString: string): string {
    try {
      const parsed = JSON.parse(jsonString);
      
      // Ensure it's an array
      if (!Array.isArray(parsed)) {
        console.log('[SILICONFLOW] ⚠️ Inverted index response is not an array, wrapping...');
        return JSON.stringify([]);
      }
      
      // Filter and clean each entry
      const cleanedEntries = parsed
        .filter((entry: any) => {
          // Skip entries that are not objects
          if (typeof entry !== 'object' || entry === null) {
            console.log('[SILICONFLOW] 🗑️ Skipping non-object entry:', entry);
            return false;
          }
          
          // Skip entries with _value_ corruption in any field
          const hasValueCorruption = Object.keys(entry).some(key => 
            key.includes('_value_') || 
            (typeof entry[key] === 'string' && entry[key].includes('_value_'))
          );
          
          if (hasValueCorruption) {
            console.log('[SILICONFLOW] 🗑️ Skipping entry with _value_ corruption:', entry);
            return false;
          }
          
          // Check required fields
          const requiredFields = ['keyword', 'primary_keyword', 'keyword_group', 'mcp_name', 'method_name', 'source_field'];
          const hasRequiredFields = requiredFields.every(field => 
            entry[field] && typeof entry[field] === 'string' && entry[field].trim().length > 0
          );
          
          if (!hasRequiredFields) {
            console.log('[SILICONFLOW] 🗑️ Skipping entry with missing required fields:', entry);
            return false;
          }
          
          return true;
        })
        .map((entry: any) => {
          const cleaned: any = {};
          
          // Copy and clean each field
          for (const [key, value] of Object.entries(entry)) {
            // Skip _value_ fields
            if (key.includes('_value_') || key.includes('_content_')) {
              continue;
            }
            
            if (key === 'standard_match') {
              // Ensure standard_match is always a string
              if (typeof value === 'boolean') {
                cleaned[key] = value ? "true" : "false";
                console.log('[SILICONFLOW] 🔧 Fixed boolean standard_match to string');
              } else if (typeof value === 'string') {
                cleaned[key] = value;
              } else {
                cleaned[key] = "true"; // Default fallback
              }
            } else if (key === 'confidence') {
              // Ensure confidence is a number
              if (typeof value === 'string') {
                const numValue = parseFloat(value);
                cleaned[key] = isNaN(numValue) ? 0.8 : Math.min(Math.max(numValue, 0.8), 1.0);
                console.log('[SILICONFLOW] 🔧 Converted confidence from string to number');
              } else if (typeof value === 'number') {
                cleaned[key] = Math.min(Math.max(value, 0.8), 1.0);
              } else {
                cleaned[key] = 0.8; // Default fallback
              }
            } else if (typeof value === 'string') {
              // Clean string values
              cleaned[key] = value
                .replace(/&nbsp;/g, ' ')
                .replace(/&amp;/g, '&')
                .replace(/&lt;/g, '<')
                .replace(/&gt;/g, '>')
                .replace(/\u0026nbsp;/g, ' ')
                .trim();
            } else {
              // Copy other values as-is
              cleaned[key] = value;
            }
          }
          
          return cleaned;
        });
      
      console.log(`[SILICONFLOW] 🧹 Cleaned inverted index: ${parsed.length} → ${cleanedEntries.length} entries`);
      return JSON.stringify(cleanedEntries);
      
    } catch (error) {
      console.error('[SILICONFLOW] ❌ Failed to clean inverted index response:', error);
      console.log('[SILICONFLOW] 📝 Returning empty array as fallback');
      return JSON.stringify([]);
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
          const extractedJson = this.extractAndValidateJson(processedText);
          
          // Apply specific cleaning for inverted index responses
          if (this.isInvertIndexPrompt(messages)) {
            console.log('[SILICONFLOW] 🔍 Applying inverted index specific cleaning...');
            return this.cleanInvertedIndexResponse(extractedJson);
          }
          
          return extractedJson;
        } catch (error) {
          console.log('[SILICONFLOW] ⚠️ Invalid JSON format, attempting reconstruction...');
          // If parsing fails, try to reconstruct the JSON
          const reconstructed = await this.reconstructJsonResponse(processedText);
          
          // Apply specific cleaning for inverted index responses after reconstruction
          if (this.isInvertIndexPrompt(messages)) {
            console.log('[SILICONFLOW] 🔍 Applying inverted index specific cleaning to reconstructed JSON...');
            return this.cleanInvertedIndexResponse(reconstructed);
          }
          
          return reconstructed;
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
    console.log(`[SILICONFLOW] 📝 Request messages:`, messages);
    const MAX_RETRIES = 3;
    const RETRY_DELAY = 2000; // 2 seconds
    
    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      try {
        if (attempt > 1) {
          console.log(`[SILICONFLOW] 🔁 Retry attempt ${attempt}/${MAX_RETRIES}`);
          // Add exponential backoff delay
          await new Promise(resolve => setTimeout(resolve, RETRY_DELAY * (attempt - 1)));
        }
        
        const requestBody = JSON.stringify({
          model: model,
          messages: messages,
          stream: false,
          max_tokens: 16000,
          temperature: 0.5,
          top_p: 0.7,
          top_k: 50,
          frequency_penalty: 0.5,
          n: 1
          //response_format: { type: "json_object" }
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
          
          // Determine if we should retry based on the error type
          const shouldRetry = this.shouldRetryError(response.status, errorData);
          
          if (shouldRetry && attempt < MAX_RETRIES) {
            console.log(`[SILICONFLOW] ⏳ Error is retryable, will retry in ${RETRY_DELAY * attempt}ms`);
            continue;
          }
          
          throw new Error(`SiliconFlow error: ${errorData.error?.message || response.statusText}`);
        }
        
        const data = await response.json();
        console.log(`[SILICONFLOW] 📥 Parsing response`,data);

        
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
        console.warn(`[SILICONFLOW] ⚠️ SiliconFlow request failed (attempt ${attempt}/${MAX_RETRIES}):`, error);
        
        // If this is the last attempt, throw a more user-friendly error
        if (attempt === MAX_RETRIES) {
          // Check if it's a persistent service availability issue
          if (error instanceof Error && (
            error.message.includes('503') ||
            error.message.includes('Service Unavailable') ||
            error.message.includes('Network connectivity')
          )) {
            throw new Error('SiliconFlow服务暂时不可用，请稍后重试。这可能是由于服务维护或网络连接问题导致的。');
          }
          throw error;
        }
        
        // Check if error is retryable for network/timeout errors
        if (error instanceof Error && (
          error.message.includes('timeout') ||
          error.message.includes('Network connectivity') ||
          error.message.includes('Failed to fetch')
        )) {
          console.log(`[SILICONFLOW] ⏳ Network error is retryable, will retry in ${RETRY_DELAY * attempt}ms`);
          continue;
        }
        
        // For non-retryable errors, throw immediately
        throw error;
      }
    }
    
    throw new Error('SiliconFlow request failed after all retry attempts');
  }

  /**
   * Determine if an error should be retried based on status code and error details
   */
  private shouldRetryError(status: number, errorData: any): boolean {
    // Retry on server errors (5xx) and specific client errors
    if (status >= 500) {
      return true;
    }
    
    // Retry on rate limiting
    if (status === 429) {
      return true;
    }
    
    // Retry on specific network connectivity errors
    if (status === 0 || status === 502 || status === 503 || status === 504) {
      return true;
    }
    
    // Check error message for retryable conditions
    const errorMessage = errorData?.error?.message?.toLowerCase() || '';
    if (errorMessage.includes('timeout') || 
        errorMessage.includes('network') || 
        errorMessage.includes('connectivity')) {
      return true;
    }
    
    return false;
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
