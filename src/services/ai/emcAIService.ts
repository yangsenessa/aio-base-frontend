
import { toast } from "@/components/ui/use-toast";
import { AttachedFile } from "@/components/chat/ChatFileUploader";
import { generateEMCCompletion, ChatMessage, EMCModel } from "../emcNetworkService";

/**
 * Generate a response using the EMC Network
 */
export async function generateEMCNetworkResponse(message: string, attachedFiles?: AttachedFile[]): Promise<string> {
  try {
    console.log('[AI-AGENT] 🚀 Preparing EMC Network request');
    
    // Construct messages for EMC network format
    const messages: ChatMessage[] = [
      {
        role: "system",
        content: "You are AIO-2030 AI, an advanced AI assistant for the decentralized AI agent network. Be concise, helpful, and knowledgeable about AI agents, distributed systems, and blockchain technology."
      }
    ];
    
    // Add file information to the message content if files are attached
    let userMessage = message;
    if (attachedFiles && attachedFiles.length > 0) {
      console.log(`[AI-AGENT] 📎 Adding ${attachedFiles.length} file references to EMC request`);
      const fileInfo = attachedFiles.map(file => 
        `File: ${file.name} (${file.type}, ${file.size} bytes)`
      ).join('\n');
      
      userMessage += `\n\nAttached files:\n${fileInfo}`;
    }
    
    // Add the user message
    messages.push({
      role: "user",
      content: userMessage
    });
    
    console.log(`[AI-AGENT] 📤 Sending request to EMC Network with ${messages.length} messages`);
    
    try {
      // Call EMC Network service with default model
      const response = await generateEMCCompletion(messages, EMCModel.DEEPSEEK_CHAT);
      console.log(`[AI-AGENT] 📥 Received response from EMC Network (${response.length} chars)`);
      return response;
    } catch (error) {
      if (error instanceof Error && error.message.includes("CORS")) {
        // Special handling for CORS errors for clearer messaging
        console.error("[AI-AGENT] ❌ CORS Error with EMC Network:", error);
        toast({
          title: "EMC Network access blocked by browser",
          description: "CORS policy prevented direct access. Using fallback service.",
          variant: "destructive"
        });
      } else {
        console.error("[AI-AGENT] ❌ Error using EMC Network:", error);
        toast({
          title: "EMC Network unavailable",
          description: "Falling back to alternative AI service",
          variant: "destructive"
        });
      }
      
      // Throw the error to trigger fallback
      throw error;
    }
  } catch (error) {
    // This outer try-catch is for any errors in message preparation
    console.error("[AI-AGENT] ❌ Error preparing EMC Network request:", error);
    
    // Toast notification for the user about EMC Network failure
    toast({
      title: "EMC Network request preparation failed",
      description: "Falling back to alternative AI service",
      variant: "destructive"
    });
    
    // Throw the error to trigger fallback
    throw error;
  }
}
