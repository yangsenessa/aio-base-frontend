
import { toast } from "@/components/ui/use-toast";
import { AttachedFile } from "@/components/chat/ChatFileUploader";
import { generateEMCCompletion, ChatMessage, EMCModel } from "../emcNetworkService";
import { createEMCNetworkMessages } from "@/config/aiPrompts";

/**
 * Generate a response using the EMC Network
 */
export async function generateEMCNetworkResponse(message: string, attachedFiles?: AttachedFile[]): Promise<string> {
  try {
    console.log('[AI-AGENT] 🚀 Preparing EMC Network request');
    
    // Construct base user message
    let userMessage = message;
    
    // Add file information to the message content if files are attached
    if (attachedFiles && attachedFiles.length > 0) {
      console.log(`[AI-AGENT] 📎 Adding ${attachedFiles.length} file references to EMC request`);
      const fileInfo = attachedFiles.map(file => 
        `File: ${file.name} (${file.type}, ${file.size} bytes)`
      ).join('\n');
      
      userMessage += `\n\nAttached files:\n${fileInfo}`;
    }
    
    // Get formatted messages using the config helper
    const messages: ChatMessage[] = createEMCNetworkMessages(userMessage);
    
    console.log(`[AI-AGENT] 📤 Sending request to EMC Network with ${messages.length} messages`);
    
    // Call EMC Network service with default model
    const response = await generateEMCCompletion(messages, EMCModel.DEEPSEEK_CHAT);
    console.log(`[AI-AGENT] 📥 Received response from EMC Network (${response.length} chars)`);
    return response;
    
  } catch (error) {
    // This try-catch is now mostly for logging purposes since the main error handling is in generateEMCCompletion
    console.error("[AI-AGENT] ❌ Error with EMC Network:", error);
    
    // Re-throw the error to make it clear that something went wrong, even though we now handle fallbacks
    throw error;
  }
}
