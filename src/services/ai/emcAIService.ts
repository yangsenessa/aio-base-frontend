import { toast } from "@/components/ui/use-toast";
import { AttachedFile } from "@/components/chat/ChatFileUploader";
import { generateEMCCompletion, ChatMessage, EMCModel } from "../emcNetworkService";
import { createEMCNetworkMessages, createEMCNetworkSampleMessage, createInvertedIndexMessage, createIntentDetectMessage } from "@/config/aiPrompts";
import { DialogAction, createActionMessages } from "../speech/tempateconfig/dialogPromptsTemplate";
import { createAdapterForMcpOutput } from "@/config/aioProtocalOutputAdapterPrompts";
import { createMatcherForKeywords } from "@/config/realtimeKeywordsMapping";

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
    const messages: ChatMessage[] =await createEMCNetworkMessages(userMessage);

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
    // Remove any leftover separator that might appear after the thinking section
    const separatorPattern = /^-{10,}$/m;
    response = response.replace(separatorPattern, '').trim();
    
    // Check for and remove code block markers
    if (response.includes('```')) {
      console.log(`[AI-AGENT] 📝 Detected code blocks in response, cleaning them up`);
      
      // Remove ```json, ```, and other code block markers
      response = response.replace(/```(?:json|javascript|typescript|python|java|cpp|csharp|php|ruby|go|rust|swift|kotlin|scala|r|matlab|sql|html|css|xml|yaml|toml|ini|bash|shell|powershell|batch|dockerfile|makefile|cmake|gradle|maven|npm|yarn|pip|conda|gitignore|markdown|text|plain|none)?\s*/g, '').trim();
      
      // Remove any trailing code block markers
      response = response.replace(/```\s*$/g, '').trim();
    }
    
    // Additional cleanup for any remaining <think> tags that might have been missed
    if (response.includes('<think>') || response.includes('</think>')) {
      console.log(`[AI-AGENT] 🧠 Additional cleanup: removing any remaining think tags`);
      response = response.replace(/<think>[\s\S]*?<\/think>/g, '').trim();
      response = response.replace(/<\/?think>/g, '').trim();
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
    if (response.includes('<think>')) {
      console.log(`[AI-AGENT] 🧠 Detected thinking process in response, filtering it out`);

      // Log the thinking part for debugging
      const thinkMatch = response.match(/<think>([\s\S]*?)<\/think>/);
      if (thinkMatch && thinkMatch[1]) {
        console.log(`[AI-AGENT] 🧠 DeepSeek thinking process:`, thinkMatch[1].trim());
      }

      // Remove the thinking part from the response
      response = response.replace(/<think>[\s\S]*?<\/think>/g, '').trim();

  
    }
     // Remove any leftover separator that might appear after the thinking section
     const separatorPattern = /^-{10,}$/m;
     // Check for and remove code block markers
     if (response.includes('```')) {
       console.log(`[AI-AGENT] 🧹 Removing code block markers from response`);
       response = response.replace(/```\w*\n|```/g, '');
     }
     response = response.replace(separatorPattern, '').trim();

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
      // Check for and remove code block markers
      if (response.includes('```')) {
        console.log(`[AI-AGENT] 🧹 Removing code block markers from response`);
        response = response.replace(/```\w*\n|```/g, '');
      }
      response = response.replace(separatorPattern, '').trim();
    }

    // Preprocess the response before JSON parsing
    console.log(`[AI-AGENT] 🧹 Preprocessing JSON response`, response);
    response = preprocessJsonResponse(response);

    // Validate the response is a valid JSON array
    try {
      const parsedResponse = JSON.parse(response);
      if (!Array.isArray(parsedResponse)) {
        throw new Error('Invalid response format: expected JSON array');
      }
    } catch (error) {
      console.error(`[AI-AGENT] ❌ Invalid JSON response:`, error);
      console.log(`[AI-AGENT] 📥 Raw response before preprocessing:`, response);
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
 * Helper function to preprocess and clean JSON response
 */
function preprocessJsonResponse(response: string): string {
  // First try to parse the response as is - if it's valid JSON, return it directly
  try {
    JSON.parse(response);
    return response;
  } catch (e) {
    console.log(`[AI-AGENT] 🧹 JSON validation failed,`, response);
  }

  // Find the start of JSON content (either { or [)
  const jsonStartIndex = Math.max(
    response.indexOf('{'),
    response.indexOf('[')
  );
  if (jsonStartIndex > 0) {
    response = response.slice(jsonStartIndex);
  }

  // Find the end of JSON content (either } or ])
  const jsonEndIndex = Math.max(
    response.lastIndexOf('}'),
    response.lastIndexOf(']')
  );
  if (jsonEndIndex < response.length - 1) {
    response = response.slice(0, jsonEndIndex + 1);
  }

  // Try parsing again after basic cleanup
  try {
    JSON.parse(response);
    return response;
  } catch (e) {
    console.log(`[AI-AGENT] 🧹 JSON still invalid after basic cleanup, applying minimal fixes`);
  }

  // Only apply minimal fixes for common JSON issues
  // Fix trailing commas before closing brackets/braces
  response = response.replace(/,(\s*[}\]])/g, '$1');
  
  // Fix boolean values that might be strings
  response = response.replace(/"true"/g, 'true');
  response = response.replace(/"false"/g, 'false');
  
  // Fix object/array formatting issues
  response = response.replace(/\}\s*\{/g, '},{');
  response = response.replace(/\}\s*,\s*\{/g, '},{');
  
  // Fix common jsonrpc format issues
  response = response.replace(/"jsonrpc"\s*:\s*"([^"]+)"/g, '"jsonrpc":"$1"');
  response = response.replace(/"id"\s*:\s*"([^"]+)"/g, '"id":"$1"');
  response = response.replace(/"trace_id"\s*:\s*"([^"]+)"/g, '"trace_id":"$1"');
  
  // Try parsing one final time
  try {
    JSON.parse(response);
    return response;
  } catch (e) {
    console.error(`[AI-AGENT] ❌ Failed to fix JSON format after all attempts:`, e);
    throw new Error('Failed to generate valid JSON format');
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
      // Check for and remove code block markers
      if (response.includes('```')) {
        console.log(`[AI-AGENT] 🧹 Removing code block markers from response`);
        response = response.replace(/```\w*\n|```/g, '');
      }
      response = response.replace(separatorPattern, '').trim();
    }

    // Preprocess the response before JSON parsing
    console.log(`[AI-AGENT] 🧹 Preprocessing JSON response`);
    response = preprocessJsonResponse(response);

    // Validate the response is a valid JSON array
    try {
      const parsedResponse = JSON.parse(response);
      if (!Array.isArray(parsedResponse)) {
        throw new Error('Invalid response format: expected JSON array');
      }
    } catch (error) {
      console.error(`[AI-AGENT] ❌ Invalid JSON response:`, error);
      console.log(`[AI-AGENT] 📥 Raw response before preprocessing:`, response);
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

/**
 * Generate a response using action-based message creation for specific dialog actions
 * Don't need to interacte with LLM, just return the response template
 */
export async function generateActionEMCNetWorkResponse(
  message: ChatMessage[],
  action: DialogAction,
  attachedFiles?: AttachedFile[],
  model: EMCModel = DEFAULT_MODEL
): Promise<string> {

  console.log(`[AI-AGENT] 🚀 Preparing action-based request for model: ${model} with action: ${action}`);

  // Construct base user message
  let userMessage = message;

  // Add file information to the message content if files are attached
  if (attachedFiles && attachedFiles.length > 0) {
    console.log(`[AI-AGENT] 📎 Adding ${attachedFiles.length} file references to request`);
    const fileInfo = attachedFiles.map(file =>
      `File: ${file.name} (${file.type}, ${file.size} bytes)`
    ).join('\n');

    // We need to append file info to the last message in the array
    if (userMessage.length > 0 && typeof userMessage[userMessage.length - 1].content === 'string') {
      userMessage[userMessage.length - 1].content += `\n\nAttached files:\n${fileInfo}`;
    }
  }

  // Get formatted messages using the action-based message creator
  let response = createActionMessages(action, typeof userMessage[0]?.content === 'string' ? userMessage[0].content : '');
  
  return response;
}

export async function generateMcp2AIOOutputAdapter(
  mcpJson: string,
  model: EMCModel = DEFAULT_MODEL
): Promise<string> {
  try {
    console.log(`[AI-AGENT-Adapter] 🚀 Preparing MCP to AIO protocol adapter request for : ${mcpJson}`);

    // Create the adapter prompt using the MCP JSON
    const adapterPrompt = createAdapterForMcpOutput(mcpJson);

    // Construct the message for the LLM
    const messages: ChatMessage[] = [
      {
        role: "system",
        content: adapterPrompt
      }
    ];

    console.log(`[AI-AGENT] 📤 Sending MCP to AIO adapter request`);

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

    // Preprocess the response before JSON parsing
    console.log(`[AI-AGENT] 🧹 Preprocessing JSON response`);
    response = preprocessJsonResponse(response);

    // Validate the response is a valid JSON
    try {
      const parsedResponse = JSON.parse(response);
      console.log(`[AI-AGENT-Adapter] 📥 Raw response:`, response);
      if (!parsedResponse.output) {
        throw new Error('Invalid response format: output field missing');
      }
    } catch (error) {
      console.error(`[AI-AGENT] ❌ Invalid JSON response:`, error);
      console.log(`[AI-AGENT] 📥 Raw response before preprocessing:`, response);
      throw new Error('Failed to generate valid AIO protocol output: invalid JSON format');
    }

    console.log(`[AI-AGENT] 📥 Received processed AIO protocol output (${response.length} chars)`);
    return response;

  } catch (error) {
    console.error(`[AI-AGENT] ❌ Error generating AIO protocol output with model ${model}:`, error);

    // Re-throw the error to make it clear that something went wrong
    throw error;
  }
}

/**
 * Generate realtime step keywords mapping between intent steps and MCP keywords
 */
export async function realtimeStepKeywordsMapping(
  goals: string,
  intentSteps: Array<{ step: number; keywords: string[] }>,
  candidateKeywords: string[],
  model: EMCModel = DEFAULT_MODEL
): Promise<string> {
  try {
    console.log(`[AI-AGENT] 🚀 Preparing realtime keywords mapping request for model: ${model}`);

    // Create the matcher prompt using the intent steps and candidate keywords
    const matcherPrompt = createMatcherForKeywords(goals,intentSteps, candidateKeywords);

    // Construct the message for the LLM
    const messages: ChatMessage[] = [
      {
        role: "system",
        content: matcherPrompt
      }
    ];

    console.log(`[AI-AGENT] 📤 Sending realtime keywords mapping request`);

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

    // Check for and remove code block markers if present
    if (response.includes('```')) {
      console.log(`[AI-AGENT] 🧹 Removing code block markers from response`);
      response = response.replace(/```json\n|```\n|```/g, '');
    }

    // Remove any non-JSON content before the first { or [ and after the last } or ]
    const jsonStartIndex = Math.max(
      response.indexOf('{'),
      response.indexOf('[')
    );
    if (jsonStartIndex > 0) {
      response = response.slice(jsonStartIndex);
    }

    const jsonEndIndex = Math.max(
      response.lastIndexOf('}'),
      response.lastIndexOf(']')
    );
    if (jsonEndIndex < response.length - 1) {
      response = response.slice(0, jsonEndIndex + 1);
    }

    // Validate the response is a valid JSON array or object
    try {
      const parsedResponse = JSON.parse(response);
      if (!Array.isArray(parsedResponse) && typeof parsedResponse !== 'object') {
        throw new Error('Invalid response format: expected JSON array or object');
      }
      if (Array.isArray(parsedResponse) && parsedResponse.length !== intentSteps.length) {
        throw new Error('Invalid response format: array length does not match intent steps length');
      }
      // Return the cleaned JSON string
      response = JSON.stringify(parsedResponse);
    } catch (error) {
      console.error(`[AI-AGENT] ❌ Invalid JSON response:`, error);
      console.log(`[AI-AGENT] 📥 Error parsed keywords mapping response: (${response})`);
      throw new Error('Failed to generate valid keywords mapping: invalid JSON format');
    }

    console.log(`[AI-AGENT-Realtime-Keywords-Mapping] 📥 Received processed keywords mapping (${response})`);
    return response;

  } catch (error) {
    console.error(`[AI-AGENT] ❌ Error generating keywords mapping with model ${model}:`, error);

    // Re-throw the error to make it clear that something went wrong
    throw error;
  }
}



