import { toast } from "@/components/ui/use-toast";
import { AttachedFile } from "@/components/chat/ChatFileUploader";

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
}

// OpenAI API configuration
// In a production environment, this should be loaded from environment variables
const OPENAI_API_KEY = "sk-your-api-key"; // Replace with actual API key or fetch from secure storage
const DEFAULT_MODEL = "gpt-4o-mini"; // Default model to use for chat completions

// Flag to toggle between mock API and real API calls
// This would be changed when deploying to production
let useMockApi = true;

export const setUseRealAI = (useReal: boolean): void => {
  useMockApi = !useReal;
  console.log(`AI Agent Service using ${useMockApi ? 'mock' : 'real'} AI`);
};

// Function to generate response using OpenAI API
async function generateRealAIResponse(message: string, model = DEFAULT_MODEL): Promise<string> {
  try {
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
            content: 'You are AIO-2030 AI, an advanced AI assistant for the decentralized AI agent network. Be concise, helpful, and knowledgeable about AI agents, distributed systems, and blockchain technology.'
          },
          {
            role: 'user',
            content: message
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
function generateMockAIResponse(message: string): Promise<string> {
  return new Promise((resolve) => {
    // Simulate API delay
    setTimeout(() => {
      // Generate different responses based on message content
      if (message.toLowerCase().includes('file') || message.toLowerCase().includes('attached')) {
        resolve(`I see you've attached a file. In a production environment, I would be able to analyze the contents of this file and provide specific feedback. For now, I acknowledge that I've received your attachment.`);
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
      
      // Get AI response based on the transcription
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
export async function sendMessage(message: string): Promise<AIMessage> {
  try {
    let response: string;
    
    if (useMockApi) {
      response = await generateMockAIResponse(message);
    } else {
      response = await generateRealAIResponse(message);
    }
    
    return {
      id: (Date.now() + 1).toString(),
      sender: 'ai',
      content: response,
      timestamp: new Date()
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
