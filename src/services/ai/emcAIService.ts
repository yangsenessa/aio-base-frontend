
import { toast } from "@/components/ui/use-toast";
import { AttachedFile } from "@/components/chat/ChatFileUploader";
import { generateEMCCompletion, ChatMessage, EMCModel } from "../emcNetworkService";
import { createEMCNetworkMessages } from "@/config/aiPrompts";

// Define available models with their display names for better UX
export const AI_MODELS = [
  { id: EMCModel.DEEPSEEK_CHAT, name: "DeepSeek Chat", provider: "EMC Network" },
  { id: EMCModel.QWEN_CODER, name: "Qwen 2.5 Coder", provider: "SiliconFlow" }
];

// Default model to use - set to SiliconFlow's Qwen Coder
export const DEFAULT_MODEL = EMCModel.DEEPSEEK_CHAT;

/**
 * Generate a response using the appropriate AI provider
 */
export async function generateEMCNetworkResponse(
  message: string, 
  attachedFiles?: AttachedFile[],
  model: EMCModel = DEFAULT_MODEL
): Promise<string> {
  try {
    console.log(`[AI-AGENT] 🚀 Preparing request for model: ${model}`);
    
    // Construct base user message
    let userMessage = message;
    
    // Add file information to the message content if files are attached
    if (attachedFiles && attachedFiles.length > 0) {
      console.log(`[AI-AGENT] 📎 Adding ${attachedFiles.length} file references to request`);
      const fileInfo = attachedFiles.map(file => 
        `File: ${file.name} (${file.type}, ${file.size} bytes)`
      ).join('\n');
      
      userMessage += `\n\nAttached files:\n${fileInfo}`;
    }
    
    // Get formatted messages using the config helper
    const messages: ChatMessage[] = createEMCNetworkMessages(userMessage);
    
    console.log(`[AI-AGENT] 📤 Sending request with ${messages.length} messages`);
    
    // Call service with specified model
    const response = await generateEMCCompletion(messages, model);
    console.log(`[AI-AGENT] 📥 Received response (${response.length} chars)`);
    return response;
    
  } catch (error) {
    console.error(`[AI-AGENT] ❌ Error with model ${model}:`, error);
    
    // Re-throw the error to make it clear that something went wrong
    throw error;
  }
}
