import { toast } from "@/components/ui/use-toast";
import { AttachedFile } from "@/components/chat/ChatFileUploader";
import { generateEMCNetworkResponse, DEFAULT_MODEL, generateSampleofAIOEntity } from "./emcAIService";
import { generateMockAIResponse } from "./mockAIService";
import { generateRealAIResponse } from "./openAIService";
import { EMCModel } from "../emcNetworkService";
import { aioIndexPrompts } from "@/config/aiPrompts";

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

/**
 * Handles AIO sample generation interactions
 * This function encapsulates all AIO sample generation logic similar to text LLM interactions
 */
export async function handleAIOSampleInteraction(
  helpResponse: string,
  useEMCNetwork: boolean = true,
  useMockApi: boolean = true,
  model: EMCModel = DEFAULT_MODEL
): Promise<string> {
  console.log(`[AI-AGENT] 🔄 Starting AIO sample generation with model ${model}`);
  
  // Try EMC Network/SiliconFlow first if enabled
  if (useEMCNetwork) {
    try {
      console.log(`[AI-AGENT] 🌐 Network services are enabled, attempting to generate sample using model: ${model}`);
      // Use the generateSampleofAIOEntity implementation
      return await generateSampleofAIOEntity(helpResponse, model);
    } catch (error) {
      console.warn("[AI-AGENT] ⚠️ Network services completely failed for sample generation, falling back to alternative:", error);
      
      // Only reach this if something catastrophic happened in the network services
      if (useMockApi) {
        console.log('[AI-AGENT] 🔄 Falling back to mock AI service for sample generation');
        toast({
          title: "Network services error",
          description: "The service encountered an unexpected error. Using mock AI instead for sample generation.",
          variant: "destructive"
        });
        // Fall back to mock service with sample request
        return await generateMockAIResponse(`Generate sample based on: ${helpResponse}`);
      } else {
        console.log('[AI-AGENT] 🔄 Falling back to OpenAI service for sample generation');
        toast({
          title: "Network services error",
          description: "The service encountered an unexpected error. Using OpenAI instead for sample generation.",
          variant: "destructive"
        });
        // Fall back to OpenAI with sample request
        return await generateRealAIResponse(`Generate sample based on: ${helpResponse}`);
      }
    }
  } else if (useMockApi) {
    // Use mock API if network services are disabled and mock is enabled
    console.log('[AI-AGENT] 🎭 Using mock AI service for sample generation (Network services disabled)');
    return await generateMockAIResponse(`Generate sample based on: ${helpResponse}`);
  } else {
    // Use real OpenAI API if both network services and mock are disabled
    console.log('[AI-AGENT] 🧠 Using OpenAI service for sample generation (Network services and mock disabled)');
    return await generateRealAIResponse(`Generate sample based on: ${helpResponse}`);
  }
}
