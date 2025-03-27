
import { toast } from "@/components/ui/use-toast";
import { AttachedFile } from "@/components/chat/ChatFileUploader";
import { generateEMCNetworkResponse, DEFAULT_MODEL } from "./emcAIService";
import { generateMockAIResponse } from "./mockAIService";
import { generateRealAIResponse } from "./openAIService";
import { EMCModel } from "../emcNetworkService";

/**
 * Handles text-based LLM interactions (EMC Network, SiliconFlow, or fallbacks)
 * This function encapsulates all LLM calling logic for text messages
 */
export async function handleTextLLMInteraction(
  message: string, 
  attachedFiles?: AttachedFile[], 
  useEMCNetwork: boolean = true,
  useMockApi: boolean = true,
  model: EMCModel = DEFAULT_MODEL
): Promise<string> {
  console.log(`[AI-AGENT] 🔄 Starting LLM interaction with model ${model} and message (${message.length} chars)${attachedFiles?.length ? ` and ${attachedFiles.length} files` : ''}`);
  
  // Try EMC Network/SiliconFlow first if enabled
  if (useEMCNetwork) {
    try {
      console.log(`[AI-AGENT] 🌐 Network services are enabled, attempting to use model: ${model}`);
      // The EMC implementation now handles its own fallback to a mock mechanism if needed
      return await generateEMCNetworkResponse(message, attachedFiles, model);
    } catch (error) {
      console.warn("[AI-AGENT] ⚠️ Network services completely failed, falling back to alternative:", error);
      
      // Only reach this if something catastrophic happened in the network services
      if (useMockApi) {
        console.log('[AI-AGENT] 🔄 Falling back to mock AI service');
        toast({
          title: "Network services error",
          description: "The service encountered an unexpected error. Using mock AI instead.",
          variant: "destructive"
        });
        return await generateMockAIResponse(message, attachedFiles);
      } else {
        console.log('[AI-AGENT] 🔄 Falling back to OpenAI service');
        toast({
          title: "Network services error",
          description: "The service encountered an unexpected error. Using OpenAI instead.",
          variant: "destructive"
        });
        return await generateRealAIResponse(message, attachedFiles);
      }
    }
  } else if (useMockApi) {
    // Use mock API if network services are disabled and mock is enabled
    console.log('[AI-AGENT] 🎭 Using mock AI service (Network services disabled)');
    return await generateMockAIResponse(message, attachedFiles);
  } else {
    // Use real OpenAI API if both network services and mock are disabled
    console.log('[AI-AGENT] 🧠 Using OpenAI service (Network services and mock disabled)');
    return await generateRealAIResponse(message, attachedFiles);
  }
}
