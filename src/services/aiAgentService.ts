import { toast } from "@/components/ui/use-toast";
import { AttachedFile } from "@/components/chat/ChatFileUploader";
import { AIMessage } from "./types/aiTypes";
import { handleTextLLMInteraction, handleAIOSampleInteraction } from "./ai/textAIService";
import { processVoiceData as processVoiceAudio } from "./ai/voiceAIService";
import { DEFAULT_MODEL } from "./ai/emcAIService";
import { EMCModel } from "./emcNetworkService";

// Configuration flags
let useMockApi = true;
let useEMCNetwork = true;
let currentModel = DEFAULT_MODEL;

/**
 * Set whether to use real AI services or mock AI
 */
export const setUseRealAI = (useReal: boolean): void => {
  useMockApi = !useReal;
  console.log(`AI Agent Service using ${useMockApi ? 'mock' : 'real'} AI`);
};

/**
 * Set whether to use network services or fall back directly to alternatives
 */
export const setUseEMCNetwork = (useEMC: boolean): void => {
  useEMCNetwork = useEMC;
  console.log(`Network services ${useEMCNetwork ? 'enabled' : 'disabled'}`);
};

/**
 * Set the current AI model to use
 */
export const setCurrentModel = (model: EMCModel): void => {
  currentModel = model;
  console.log(`Current AI model set to: ${model}`);
};

/**
 * Get the current AI model
 */
export const getCurrentModel = (): EMCModel => {
  return currentModel;
};

/**
 * Process voice data and get a response
 */
export async function processVoiceData(audioData: Blob): Promise<{ response: string, messageId: string }> {
  try {
    return await processVoiceAudio(audioData, useMockApi);
  } catch (error) {
    console.error("Error processing voice data:", error);
    throw error;
  }
}

/**
 * Send a text message and get a response
 */
export async function sendMessage(message: string, attachedFiles?: AttachedFile[]): Promise<AIMessage> {
  try {
    // Use the dedicated text LLM interaction handler function with the current model
    const response = await handleTextLLMInteraction(
      message, 
      attachedFiles, 
      useEMCNetwork, 
      useMockApi,
      currentModel
    );
    
    // For files mentioned in the response, the AI should reference them
    const referencedFiles = attachedFiles || [];
    
    return {
      id: (Date.now() + 1).toString(),
      sender: 'ai',
      content: response,
      timestamp: new Date(),
      referencedFiles: referencedFiles.length > 0 ? referencedFiles : undefined
    };
  } catch (error) {
    console.error("Error sending message:", error);
    
    // Provide a fallback response in case of error
    return {
      id: (Date.now() + 1).toString(),
      sender: 'ai',
      content: "I'm sorry, I encountered an error while processing your request. Please try again later.",
      timestamp: new Date()
    };
  }
}

/**
 * Get AIO sample based on help response
 */
export async function getAIOSample(helpResponse: string, describeContent: string): Promise<string> {
  try {
    // Use the dedicated AIO sample interaction handler function with the current model
    const response = await handleAIOSampleInteraction(
      helpResponse,
      describeContent,
      useEMCNetwork,
      useMockApi,
      currentModel
    );
    
    return response;
  } catch (error) {
    console.error("Error generating AIO sample:", error);
    throw error; // Propagate the error to the caller
  }
}

/**
 * Get initial greeting message
 */
export function getInitialMessage(): AIMessage {
  return {
    id: '1',
    sender: 'ai',
    content: "Hello! I'm AIO-2030 AI. How can I assist you with the decentralized AI agent network today?",
    timestamp: new Date(),
  };
}


