
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
  // Import dynamically to avoid circular dependencies
  const { sendMessage: actualSendMessage } = await import('@/services/aiAgentService');
  return actualSendMessage(message, attachedFiles);
}

export function processAIResponse(rawResponse: string): AIMessage {
  try {
    // Improved JSON marker detection and removal
    let jsonStr = rawResponse;
    
    // Remove the JSON markers - handle both formats
    if (jsonStr.includes('\\\\json')) {
      jsonStr = jsonStr.replace(/\\\\json\n/, '').replace(/\\\\\n/, '');
    } else if (jsonStr.includes('```json')) {
      jsonStr = jsonStr.replace(/```json\n/, '').replace(/```\n?/, '');
    } else if (jsonStr.startsWith('```') && jsonStr.endsWith('```')) {
      jsonStr = jsonStr.substring(3, jsonStr.length - 3);
    }
    
    // Try to find the JSON object within the text
    const jsonRegex = /{[\s\S]*}/;
    const match = jsonStr.match(jsonRegex);
    
    if (match) {
      jsonStr = match[0];
    }
    
    console.log("Processing AI response, extracted JSON:", jsonStr);
    
    const parsed = JSON.parse(jsonStr);
    
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
  } catch (error) {
    console.error('Error processing AI response:', error);
    return {
      id: Date.now().toString(),
      sender: 'ai',
      content: rawResponse,
      timestamp: new Date()
    };
  }
}
