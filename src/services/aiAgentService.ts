
import { toast } from "@/components/ui/use-toast";
import { AttachedFile } from "@/components/chat/ChatFileUploader";
import { generateEMCCompletion, ChatMessage, EMCModel } from "./emcNetworkService";

// Types for AI messages and conversations
export interface AIMessage {
  id: string;
  sender: 'user' | 'ai';
  content: string;
  timestamp: Date;
  isVoiceMessage?: boolean;
  audioProgress?: number;
  isPlaying?: boolean;
  attachedFiles?: AttachedFile[];
  referencedFiles?: AttachedFile[];
}

// OpenAI API configuration
// In a production environment, this should be loaded from environment variables
const OPENAI_API_KEY = "sk-your-api-key"; // Replace with actual API key or fetch from secure storage
const DEFAULT_MODEL = "gpt-4o-mini"; // Default model to use for chat completions

// Flag to toggle between mock API and real API calls
// This would be changed when deploying to production
let useMockApi = true;
let useEMCNetwork = true;

export const setUseRealAI = (useReal: boolean): void => {
  useMockApi = !useReal;
  console.log(`AI Agent Service using ${useMockApi ? 'mock' : 'real'} AI`);
};

export const setUseEMCNetwork = (useEMC: boolean): void => {
  useEMCNetwork = useEMC;
  console.log(`EMC Network ${useEMCNetwork ? 'enabled' : 'disabled'}`);
};

/**
 * Handles text-based LLM interactions (EMC Network or fallbacks)
 * This function encapsulates all LLM calling logic for text messages
 */
async function handleTextLLMInteraction(message: string, attachedFiles?: AttachedFile[]): Promise<string> {
  console.log(`[AI-AGENT] 🔄 Starting LLM interaction with message (${message.length} chars)${attachedFiles?.length ? ` and ${attachedFiles.length} files` : ''}`);
  
  // Try EMC Network first if enabled
  if (useEMCNetwork) {
    try {
      console.log('[AI-AGENT] 🌐 EMC Network is enabled, attempting to use it first');
      return await generateEMCNetworkResponse(message, attachedFiles);
    } catch (error) {
      console.warn("[AI-AGENT] ⚠️ EMC Network failed, falling back to alternative:", error);
      
      // Fall back to mock or OpenAI service
      if (useMockApi) {
        console.log('[AI-AGENT] 🔄 Falling back to mock AI service');
        return await generateMockAIResponse(message, attachedFiles);
      } else {
        console.log('[AI-AGENT] 🔄 Falling back to OpenAI service');
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

// Function to generate response using OpenAI API
async function generateRealAIResponse(message: string, attachedFiles?: AttachedFile[], model = DEFAULT_MODEL): Promise<string> {
  try {
    // Construct a message that includes file information
    let fullMessage = message;
    
    if (attachedFiles && attachedFiles.length > 0) {
      const fileInfo = attachedFiles.map(file => 
        `File: ${file.name} (${file.type}, ${file.size} bytes)`
      ).join('\n');
      
      fullMessage += `\n\nAttached files:\n${fileInfo}`;
    }
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model,
        messages: [
          {
            role: 'system',
            content: 'You are AIO-2030 AI, an advanced AI assistant for the decentralized AI agent network. Be concise, helpful, and knowledgeable about AI agents, distributed systems, and blockchain technology. When users share files, acknowledge them and provide relevant context about how you would process them in a production environment.'
          },
          {
            role: 'user',
            content: fullMessage
          }
        ],
        temperature: 0.7,
        max_tokens: 1000
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("OpenAI API error:", errorData);
      throw new Error(`API error: ${errorData.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    return data.choices[0].message.content.trim();
  } catch (error) {
    console.error("Error calling OpenAI API:", error);
    throw error;
  }
}

// Function to generate a mock AI response
function generateMockAIResponse(message: string, attachedFiles?: AttachedFile[]): Promise<string> {
  return new Promise((resolve) => {
    // Simulate API delay
    setTimeout(() => {
      // Generate different responses based on message content and attached files
      if (attachedFiles && attachedFiles.length > 0) {
        const fileTypes = attachedFiles.map(file => file.type.split('/')[0]).join(', ');
        const fileNames = attachedFiles.map(file => file.name).join(', ');
        
        if (fileTypes.includes('image')) {
          resolve(`I've received your ${attachedFiles.length} file(s) including ${fileNames}. I've analyzed the images you've shared. In a production environment, I could perform object detection, image classification, or extract text depending on your needs. What would you like to know about these images?`);
        } else if (fileTypes.includes('pdf') || fileTypes.includes('text')) {
          resolve(`Thank you for sharing these documents: ${fileNames}. I can see you've uploaded ${attachedFiles.length} file(s). In a production environment, I would extract the text content and analyze it for relevant information. What specific insights would you like me to find in these documents?`);
        } else if (fileTypes.includes('video') || fileTypes.includes('audio')) {
          resolve(`I've received your media files: ${fileNames}. In a production environment, I could transcribe audio content, analyze video frames, or extract metadata. Would you like me to explain how I would process these media files for your specific use case?`);
        } else {
          resolve(`Thank you for sharing ${attachedFiles.length} file(s): ${fileNames}. I've stored these files and can reference them in our conversation. In a production environment, I would analyze their contents based on the file types. How would you like me to help with these files?`);
        }
      } else if (message.toLowerCase().includes('hello') || message.toLowerCase().includes('hi')) {
        resolve(`Hello! I'm AIO-2030 AI. How can I assist you with the decentralized AI agent network today?`);
      } else if (message.toLowerCase().includes('agent')) {
        resolve(`AI Agents in our network are autonomous programs that can perform tasks, learn from interactions, and collaborate with other agents. They can be deployed across the network to solve complex problems.`);
      } else if (message.toLowerCase().includes('mcp') || message.toLowerCase().includes('protocol')) {
        resolve(`The Model Context Protocol (MCP) is a standardized way for AI agents to share context and communicate. It enables seamless interaction between different types of agents across the network.`);
      } else if (message.toLowerCase().includes('token') || message.toLowerCase().includes('reward')) {
        resolve(`Our network uses a token-based reward system to incentivize hosting and creating AI agents. Contributors earn tokens when their agents are used or when they provide computing resources to the network.`);
      } else {
        resolve(`I received your message: "${message}". This is a simulated response from AIO-2030 AI. In a production environment, I would connect to a large language model to provide more accurate and contextual responses.`);
      }
    }, 800); // Simulate 800ms latency
  });
}

// Function to generate response using EMC Network
async function generateEMCNetworkResponse(message: string, attachedFiles?: AttachedFile[]): Promise<string> {
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
    
    // Call EMC Network service with default model
    const response = await generateEMCCompletion(messages, EMCModel.DEEPSEEK_CHAT);
    console.log(`[AI-AGENT] 📥 Received response from EMC Network (${response.length} chars)`);
    
    return response;
  } catch (error) {
    console.error("[AI-AGENT] ❌ Error using EMC Network:", error);
    
    // Toast notification for the user about EMC Network failure
    toast({
      title: "EMC Network unavailable",
      description: "Falling back to alternative AI service",
      variant: "destructive"
    });
    
    // Throw the error to trigger fallback
    throw error;
  }
}

// Function to process voice data and get a response (both mock and real implementations)
export async function processVoiceData(audioData: Blob): Promise<{ response: string, messageId: string }> {
  try {
    if (!useMockApi) {
      // In a real implementation, we would:
      // 1. Convert the audio blob to a format suitable for the speech-to-text API
      // 2. Send the audio to a speech-to-text service
      // 3. Get the transcribed text
      // 4. Send the text to the LLM for a response
      // 5. Return both the transcript and the response
      
      // This is a placeholder for the real implementation
      const formData = new FormData();
      formData.append('file', audioData, 'recording.webm');
      formData.append('model', 'whisper-1');
      
      // Speech to text API call would go here
      // const transcription = await callSpeechToTextAPI(formData);
      
      // For now, simulate a transcription
      const transcription = "This is a simulated transcription of voice input.";
      
      // Get AI response based on the transcription - NOTE: Voice messages bypass EMC Network for now
      const response = await generateRealAIResponse(transcription);
      
      return {
        response,
        messageId: Date.now().toString()
      };
    }
    
    // Mock implementation
    console.log("Processing voice data (mock):", audioData);
    
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Generate a random message ID
    const messageId = Date.now().toString();
    
    // Generate mock response
    const response = "I've processed your voice message. This is a simulated response since we're using the mock API. In a production environment, your voice would be transcribed and processed by a real AI model.";
    
    return { response, messageId };
  } catch (error) {
    console.error("Error processing voice data:", error);
    throw error;
  }
}

// Function to send a text message and get a response
export async function sendMessage(message: string, attachedFiles?: AttachedFile[]): Promise<AIMessage> {
  try {
    // Use the dedicated text LLM interaction handler function
    const response = await handleTextLLMInteraction(message, attachedFiles);
    
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

// Function to get initial greeting message
export function getInitialMessage(): AIMessage {
  return {
    id: '1',
    sender: 'ai',
    content: "Hello! I'm AIO-2030 AI. How can I assist you with the decentralized AI agent network today?",
    timestamp: new Date(),
  };
}
