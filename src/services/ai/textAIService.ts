
import { toast } from "@/components/ui/use-toast";
import { AttachedFile } from "@/components/chat/ChatFileUploader";
import { generateEMCNetworkResponse } from "./emcAIService";
import { generateMockAIResponse } from "./mockAIService";
import { generateRealAIResponse } from "./openAIService";

/**
 * Handles text-based LLM interactions (EMC Network or fallbacks)
 * This function encapsulates all LLM calling logic for text messages
 */
export async function handleTextLLMInteraction(
  message: string, 
  attachedFiles?: AttachedFile[], 
  useEMCNetwork: boolean = true,
  useMockApi: boolean = true
): Promise<string> {
  console.log(`[AI-AGENT] 🔄 Starting LLM interaction with message (${message.length} chars)${attachedFiles?.length ? ` and ${attachedFiles.length} files` : ''}`);
  
  // Try EMC Network first if enabled
  if (useEMCNetwork) {
    try {
      console.log('[AI-AGENT] 🌐 EMC Network is enabled, attempting to use it first');
      // The EMC implementation now handles its own fallback to a mock mechanism if needed
      return await generateEMCNetworkResponse(message, attachedFiles);
    } catch (error) {
      console.warn("[AI-AGENT] ⚠️ EMC Network completely failed, falling back to alternative:", error);
      
      // Only reach this if something catastrophic happened in the EMC service
      if (useMockApi) {
        console.log('[AI-AGENT] 🔄 Falling back to mock AI service');
        toast({
          title: "EMC Network error",
          description: "The service encountered an unexpected error. Using mock AI instead.",
          variant: "destructive"
        });
        return await generateMockAIResponse(message, attachedFiles);
      } else {
        console.log('[AI-AGENT] 🔄 Falling back to OpenAI service');
        toast({
          title: "EMC Network error",
          description: "The service encountered an unexpected error. Using OpenAI instead.",
          variant: "destructive"
        });
        return await generateRealAIResponse(message, attachedFiles);
      }
    }
  } else if (useMockApi) {
    // Use mock API if EMC is disabled and mock is enabled
    console.log('[AI-AGENT] 🎭 Using mock AI service (EMC disabled)');
    return await generateMockAIResponse(message, attachedFiles);
  } else {
    // Use real OpenAI API if both EMC and mock are disabled
    console.log('[AI-AGENT] 🧠 Using OpenAI service (EMC and mock disabled)');
    return await generateRealAIResponse(message, attachedFiles);
  }
}
