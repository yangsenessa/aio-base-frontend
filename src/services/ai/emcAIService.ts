import { toast } from "@/components/ui/use-toast";
import { AttachedFile } from "@/components/chat/ChatFileUploader";
import { generateEMCCompletion, ChatMessage, EMCModel } from "../emcNetworkService";
import { createEMCNetworkMessages, createEMCNetworkSampleMessage, createInvertedIndexMessage, createIntentDetectMessage } from "@/config/aiPrompts";

// Define available models with their display names for better UX
export const AI_MODELS = [
  { id: EMCModel.DEEPSEEK_CHAT, name: "DeepSeek Chat", provider: "EMC Network" },
  { id: EMCModel.QWEN_CODER, name: "Qwen 2.5 Coder", provider: "SiliconFlow" }
];

// Default model to use - set to SiliconFlow's Qwen Coder
export const DEFAULT_MODEL = EMCModel.LLM_STUDIO;

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
    let response = await generateEMCCompletion(messages, model);
    
    // Process the response: remove <think>...</think> content
    if (response.includes('<think>')) {
      console.log(`[AI-AGENT] 🧠 Detected thinking process in response, filtering it out`);
      
      // Log the thinking part for debugging
      const thinkMatch = response.match(/<think>([\s\S]*?)<\/think>/);
      if (thinkMatch && thinkMatch[1]) {
        console.log(`[AI-AGENT] 🧠 DeepSeek thinking process:`, thinkMatch[1].trim());
      }
      
      // Remove the thinking part from the response
      response = response.replace(/<think>[\s\S]*?<\/think>/g, '').trim();
      
      // Remove any leftover separator that might appear after the thinking section
      const separatorPattern = /^-{10,}$/m;
      response = response.replace(separatorPattern, '').trim();
    }
    
    console.log(`[AI-AGENT] 📥 Received processed response (${response.length} chars)`);
    return response;
    
  } catch (error) {
    console.error(`[AI-AGENT] ❌ Error with model ${model}:`, error);
    
    // Re-throw the error to make it clear that something went wrong
    throw error;
  }
}

/**
 * Generate a sample of AIO entity based on help response
 */
export async function generateSampleofAIOEntity(
  helpResponse: string, 
  describeContent: string,
  model: EMCModel = DEFAULT_MODEL
): Promise<string> {
  try {
    console.log(`[AI-AGENT] 🚀 Preparing sample generation request for model: ${model}`);
    
    // Get formatted messages using the config helper for sample generation
    const messages: ChatMessage[] = createEMCNetworkSampleMessage(helpResponse, describeContent);
    
    console.log(`[AI-AGENT] 📤 Sending sample generation request with ${messages.length} messages`);
    
    // Call service with specified model
    let response = await generateEMCCompletion(messages, model);
    
    // Process the response: remove <think>...</think> content
    if (model === EMCModel.DEEPSEEK_CHAT && response.includes('<think>')) {
      console.log(`[AI-AGENT] 🧠 Detected thinking process in response, filtering it out`);
      
      // Log the thinking part for debugging
      const thinkMatch = response.match(/<think>([\s\S]*?)<\/think>/);
      if (thinkMatch && thinkMatch[1]) {
        console.log(`[AI-AGENT] 🧠 DeepSeek thinking process:`, thinkMatch[1].trim());
      }
      
      // Remove the thinking part from the response
      response = response.replace(/<think>[\s\S]*?<\/think>/g, '').trim();
      
      // Remove any leftover separator that might appear after the thinking section
      const separatorPattern = /^-{10,}$/m;
      // Check for and remove code block markers
      if (response.includes('```')) {
        console.log(`[AI-AGENT] 🧹 Removing code block markers from response`);
        response = response.replace(/```\w*\n|```/g, '');
      }
      response = response.replace(separatorPattern, '').trim();
    }
    
    console.log(`[AI-AGENT] 📥 Received processed sample (${response.length} chars)`);
    return response;
    
  } catch (error) {
    console.error(`[AI-AGENT] ❌ Error generating sample with model ${model}:`, error);
    
    // Re-throw the error to make it clear that something went wrong
    throw error;
  }
}

/**
 * Generate inverted index for MCP service based on MCP JSON
 */
export async function generateInvertedIndex(
  mcpJson: string,
  model: EMCModel = DEFAULT_MODEL
): Promise<string> {
  try {
    console.log(`[AI-AGENT] 🚀 Preparing inverted index generation request for model: ${model}`);
    
    // Get formatted messages using the config helper for inverted index generation
    const messages: ChatMessage[] = createInvertedIndexMessage(mcpJson);
    
    console.log(`[AI-AGENT] 📤 Sending inverted index generation request with ${messages.length} messages`);
    
    // Call service with specified model
    let response = await generateEMCCompletion(messages, model);
    
    // Process the response: remove <think>...</think> content
    if (model === EMCModel.DEEPSEEK_CHAT && response.includes('<think>')) {
      console.log(`[AI-AGENT] 🧠 Detected thinking process in response, filtering it out`);
      
      // Log the thinking part for debugging
      const thinkMatch = response.match(/<think>([\s\S]*?)<\/think>/);
      if (thinkMatch && thinkMatch[1]) {
        console.log(`[AI-AGENT] 🧠 DeepSeek thinking process:`, thinkMatch[1].trim());
      }
      
      // Remove the thinking part from the response
      response = response.replace(/<think>[\s\S]*?<\/think>/g, '').trim();
      
      // Remove any leftover separator that might appear after the thinking section
      const separatorPattern = /^-{10,}$/m;
      // Check for and remove code block markers
      if (response.includes('```')) {
        console.log(`[AI-AGENT] 🧹 Removing code block markers from response`);
        response = response.replace(/```\w*\n|```/g, '');
      }
      response = response.replace(separatorPattern, '').trim();
    }
    
    // Validate the response is a valid JSON array
    try {
      const parsedResponse = JSON.parse(response);
      if (!Array.isArray(parsedResponse)) {
        throw new Error('Invalid response format: expected JSON array');
      }
    } catch (error) {
      console.error(`[AI-AGENT] ❌ Invalid JSON response:`, error);
      throw new Error('Failed to generate valid inverted index: invalid JSON format');
    }
    
    console.log(`[AI-AGENT] 📥 Received processed inverted index (${response.length} chars)`);
    return response;
    
  } catch (error) {
    console.error(`[AI-AGENT] ❌ Error generating inverted index with model ${model}:`, error);
    
    // Re-throw the error to make it clear that something went wrong
    throw error;
  }
}

/**
 * Generate intent detection for a given modality
 */
export async function generateIntentDetection(
  modality: string,
  availableMcps: any[] = [],
  model: EMCModel = DEFAULT_MODEL
): Promise<string> {
  try {
    console.log(`[AI-AGENT] 🚀 Preparing intent detection request for modality: ${modality}`);
    
    // Get formatted messages using the config helper for intent detection
    const messages: ChatMessage[] = createIntentDetectMessage(modality, availableMcps);
    
    console.log(`[AI-AGENT] 📤 Sending intent detection request with ${messages.length} messages`);
    console.log('[AI-AGENT] 📝 Messages content:', JSON.stringify(messages, null, 2));
    
    // Call service with specified model
    let response = await generateEMCCompletion(messages, model);
    
    // Process the response: remove <think>...</think> content
    if (model === EMCModel.DEEPSEEK_CHAT && response.includes('<think>')) {
      console.log(`[AI-AGENT] 🧠 Detected thinking process in response, filtering it out`);
      
      // Log the thinking part for debugging
      const thinkMatch = response.match(/<think>([\s\S]*?)<\/think>/);
      if (thinkMatch && thinkMatch[1]) {
        console.log(`[AI-AGENT] 🧠 DeepSeek thinking process:`, thinkMatch[1].trim());
      }
      
      // Remove the thinking part from the response
      response = response.replace(/<think>[\s\S]*?<\/think>/g, '').trim();
      
      // Remove any leftover separator that might appear after the thinking section
      const separatorPattern = /^-{10,}$/m;
      // Check for and remove code block markers
      if (response.includes('```')) {
        console.log(`[AI-AGENT] 🧹 Removing code block markers from response`);
        response = response.replace(/```\w*\n|```/g, '');
      }
      response = response.replace(separatorPattern, '').trim();
    }
    
    // Validate the response is a valid JSON array
    try {
      const parsedResponse = JSON.parse(response);
      if (!Array.isArray(parsedResponse)) {
        throw new Error('Invalid response format: expected JSON array');
      }
    } catch (error) {
      console.error(`[AI-AGENT] ❌ Invalid JSON response:`, error);
      throw new Error('Failed to generate valid intent detection: invalid JSON format');
    }
    
    console.log(`[AI-AGENT] 📥 Received processed intent detection (${response.length} chars)`);
    return response;
    
  } catch (error) {
    console.error(`[AI-AGENT] ❌ Error generating intent detection with model ${model}:`, error);
    
    // Re-throw the error to make it clear that something went wrong
    throw error;
  }
}



