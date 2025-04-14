import { AIProvider } from "./AIProvider";
import { ChatMessage, EMCModel } from "@/services/emcNetworkService";
import { aioIndexPrompts } from "@/config/aiPrompts";

/**
 * LLM Studio provider implementation using OpenAI-compatible HTTP API
 */
export class LLMStudioProvider implements AIProvider {
  private readonly baseUrl = 'http://127.0.0.1:1234/v1';
  private readonly thinkPattern = /<think>(.*?)<\/think>/gs;
  private reconstructionAttempts = 0;
  private readonly MAX_RECONSTRUCTION_ATTEMPTS = 3;
  private readonly MCP_INDEXER_ROLE = 'You are an MCP Capability Indexer';
  
  getName(): string {
    return "LLM Studio";
  }
  
  getSupportedModels(): string[] {
    return [EMCModel.LLM_STUDIO];
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
    for (const match of thinkMatches) {
      console.log(`[LLM-STUDIO] 🤔 Think content:`, match[1]);
    }
    
    // Remove think tags and their contents
    return text.replace(this.thinkPattern, '').trim();
  }

  /**
   * Helper method to validate and clean JSON content
   * @param text The text containing JSON
   * @returns The cleaned and validated JSON string
   */
  private extractAndValidateJson(text: string): string {
    // Remove any text before the first {
    const startIndex = text.indexOf('{');
    if (startIndex === -1) {
      throw new Error('No JSON object found in response');
    }
    
    // Remove any text after the last }
    const endIndex = text.lastIndexOf('}');
    if (endIndex === -1) {
      throw new Error('No complete JSON object found in response');
    }
    
    // Extract the JSON content
    const jsonContent = text.slice(startIndex, endIndex + 1);
    
    // Validate the JSON
    JSON.parse(jsonContent);
    return jsonContent;
  }
  
  private isBuildMcpIndexPrompt(messages: ChatMessage[]): boolean {
    return messages.some(msg => 
      msg.role === 'system' && 
      msg.content.includes(this.MCP_INDEXER_ROLE)
    );
  }

  private async reconstructJsonResponse(text: string): Promise<string> {
    this.reconstructionAttempts++;
    
    console.log(`[LLM-STUDIO] 🔄 Reconstruction attempt ${this.reconstructionAttempts}/${this.MAX_RECONSTRUCTION_ATTEMPTS}`);
    console.log(`[LLM-STUDIO] 📝 Original content:`, text);
    
    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: EMCModel.LLM_STUDIO,
          messages: [
            {
              role: "system",
              content: aioIndexPrompts.reconstruct_json.replace('invalid_response', text)
            }
          ],
          temperature: 0.1, // Low temperature for more deterministic output
          stream: false
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const reconstructedJson = data.choices[0].message.content;
      
      console.log(`[LLM-STUDIO] 📝 Reconstructed content:`, reconstructedJson);
      
      // Process the reconstructed response
      const processedText = this.processText(reconstructedJson);
      
      // Validate and clean the JSON
      const finalJson = this.extractAndValidateJson(processedText);
      
      console.log(`[LLM-STUDIO] ✅ Successfully reconstructed JSON after ${this.reconstructionAttempts} attempts`);
      this.reconstructionAttempts = 0; // Reset counter on success
      return finalJson;
    } catch (error) {
      console.error(`[LLM-STUDIO] ❌ Reconstruction attempt ${this.reconstructionAttempts} failed:`, error);
      
      if (this.reconstructionAttempts >= this.MAX_RECONSTRUCTION_ATTEMPTS) {
        console.error(`[LLM-STUDIO] ❌ Maximum reconstruction attempts (${this.MAX_RECONSTRUCTION_ATTEMPTS}) reached`);
        this.reconstructionAttempts = 0; // Reset counter
        throw new Error(`Failed to reconstruct JSON after ${this.MAX_RECONSTRUCTION_ATTEMPTS} attempts`);
      }
      
      // If we haven't reached max attempts, try again
      return await this.reconstructJsonResponse(text);
    }
  }

  private async cleanJsonResponse(text: string, messages: ChatMessage[]): Promise<string> {
    try {
      // First process the text to remove think tags
      const processedText = this.processText(text);
      
      // Only attempt JSON reconstruction for MCP Indexer prompts
      if (this.isBuildMcpIndexPrompt(messages)) {
        console.log('[LLM-STUDIO] 🔍 Detected MCP Indexer prompt, attempting JSON validation...');
        try {
          // Try to extract and validate JSON
          return this.extractAndValidateJson(processedText);
        } catch (error) {
          console.log('[LLM-STUDIO] ⚠️ Invalid JSON format, attempting reconstruction...');
          // If parsing fails, try to reconstruct the JSON
          return await this.reconstructJsonResponse(processedText);
        }
      }
      
      // For other prompts, return the processed text directly
      console.log('[LLM-STUDIO] 📝 Non-MCP Indexer prompt, returning processed text directly');
      return processedText;
    } catch (error) {
      console.error('[LLM-STUDIO] ❌ Error processing response:', error);
      throw error;
    }
  }
  
  async generateCompletion(messages: ChatMessage[], model: string): Promise<string> {
    if (!this.supportsModel(model)) {
      throw new Error(`Model ${model} is not supported by LLM Studio provider`);
    }
    
    console.log(`[LLM-STUDIO] 🚀 Starting LLM Studio completion request with model: ${model}`);
    
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 300000); // 5 minutes timeout
      
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: model,
          messages: messages.map(msg => ({
            role: msg.role,
            content: msg.content
          })),
          temperature: 0.7,
          stream: false
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const completion = data.choices[0].message.content;
      
      // Clean and validate the JSON response
      const finalResponse = await this.cleanJsonResponse(completion, messages);
      
      console.log(`[LLM-STUDIO] ✅ Completion succeeded, response length: ${finalResponse.length} chars`);
      return finalResponse;
    } catch (error) {
      console.error(`[LLM-STUDIO] ❌ Completion failed:`, error);
      throw new Error(`LLM Studio error: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
} 