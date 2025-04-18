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
  transcript?: string;
  attachedFiles?: AttachedFile[];
  referencedFiles?: AttachedFile[];
  metadata?: {
    aiResponse?: {
      intent_analysis: Record<string, any>;
      execution_plan: {
        steps: Array<{
          mcp: string;
          action: string;
          input: Record<string, any>;
          output: Record<string, any>;
          dependencies: string[];
        }>;
        constraints: string[];
        quality_metrics: string[];
      };
      response: string;
    };
    [key: string]: any; // Allow for other metadata properties
  };
  messageType?: 'text' | 'voice' | 'file' | 'rich' | 'system'; // Explicitly define message types
  status?: 'sending' | 'sent' | 'delivered' | 'read' | 'error'; // Message delivery status
  reactions?: { [emoji: string]: number }; // Support for message reactions
  threadId?: string; // Support for message threading
  isEdited?: boolean; // Track if message was edited
  editHistory?: { content: string; timestamp: Date }[]; // Track edit history
  language?: string; // Language of the message for internationalization
  sentiment?: 'positive' | 'neutral' | 'negative'; // Message sentiment analysis result
  priority?: 'low' | 'normal' | 'high' | 'urgent'; // Message priority
  expiresAt?: Date; // Support for ephemeral messages
}

// Add this new function for direct message creation
export function createDirectMessage(content: string, attachedFiles?: AttachedFile[]): AIMessage {
  return {
    id: Date.now().toString(),
    sender: 'ai',
    content,
    timestamp: new Date(),
    attachedFiles,
    messageType: 'system'  // Mark as system message
  };
}

// Function to test chat functionality
export function createDebugMessage(content: string = "Test message"): AIMessage {
  return {
    id: `debug-${Date.now()}`,
    sender: 'ai',
    content: `DEBUG: ${content} (${new Date().toLocaleTimeString()})`,
    timestamp: new Date(),
    messageType: 'system'
  };
}

// Re-export functions that were moved during the refactoring
export { getInitialMessage } from '@/services/aiAgentService';
export { processVoiceData } from '@/services/ai/voiceAIService';

// Export the enhanced version of sendMessage that supports both LLM processing and direct message insertion
export async function sendMessage(message: string, attachedFiles?: AttachedFile[]): Promise<AIMessage> {
  const { sendMessage: actualSendMessage } = await import('@/services/aiAgentService');
  return actualSendMessage(message, attachedFiles);
}

export function processAIResponse(rawResponse: string): AIMessage {
  try {
    console.log("Processing AI response:", rawResponse.substring(0, 100) + "...");
    
    // Step 1: Try to extract JSON content using various possible formats
    let jsonContent = null;
    
    // Check for ```json or ```\json markers
    if (rawResponse.includes('```json')) {
      const parts = rawResponse.split('```json');
      if (parts.length > 1) {
        const jsonPart = parts[1].split('```')[0].trim();
        jsonContent = jsonPart;
      }
    } 
    // Check for \\\\json markers
    else if (rawResponse.includes('\\\\json')) {
      const parts = rawResponse.split('\\\\json');
      if (parts.length > 1) {
        const jsonPart = parts[1].split('\\\\')[0].trim();
        jsonContent = jsonPart;
      }
    } 
    // Check for triple backticks
    else if (rawResponse.includes('```')) {
      const parts = rawResponse.split('```');
      if (parts.length > 2) { // Need at least opening and closing backticks
        jsonContent = parts[1].trim();
      }
    }
    // Look for JSON-like structure in the raw text
    else {
      const jsonRegex = /(\{[\s\S]*\})/g;
      const matches = rawResponse.match(jsonRegex);
      if (matches && matches.length > 0) {
        jsonContent = matches[0];
      }
    }
    
    // Step 2: Try to parse the extracted JSON content
    if (jsonContent) {
      try {
        const parsed = JSON.parse(jsonContent);
        console.log("Successfully parsed JSON response:", parsed);
        
        // If we found and parsed JSON, return structured message
        return {
          id: Date.now().toString(),
          sender: 'ai',
          content: parsed.response || rawResponse,
          timestamp: new Date(),
          metadata: {
            aiResponse: {
              intent_analysis: parsed.intent_analysis || {},
              execution_plan: parsed.execution_plan || {
                steps: [],
                constraints: [],
                quality_metrics: []
              },
              response: parsed.response || rawResponse
            }
          }
        };
      } catch (parseError) {
        console.warn("Found JSON-like content but failed to parse:", parseError);
        console.log("Raw content that failed parsing:", jsonContent.substring(0, 100));
        // Continue to fallback handling
      }
    }
    
    // Step 3: Fallback - if we couldn't extract or parse JSON, return the raw text
    console.log("Fallback: Returning raw text response");
    return {
      id: Date.now().toString(),
      sender: 'ai',
      content: rawResponse,
      timestamp: new Date(),
      metadata: undefined // No structured data available
    };
  } catch (error) {
    console.error("Error processing AI response:", error);
    
    // Always ensure a message is returned even if processing fails
    return {
      id: Date.now().toString(),
      sender: 'ai',
      content: rawResponse,
      timestamp: new Date(),
      metadata: undefined // No structured data available
    };
  }
}
