import { AttachedFile } from "@/components/chat/ChatFileUploader";
import { isValidJson, fixMalformedJson, hasModalStructure, getResponseFromModalJson, cleanJsonString, safeJsonParse } from "@/util/formatters";

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
  intent_analysis?: Record<string, any>;
  execution_plan?: {
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
  protocolContext?: {
    isComplete?: boolean;
    [key: string]: any;
  };
  messageType?: 'text' | 'voice' | 'file' | 'rich' | 'system';
  status?: 'sending' | 'sent' | 'delivered' | 'read' | 'error';
  reactions?: { [emoji: string]: number };
  threadId?: string;
  isEdited?: boolean;
  editHistory?: { content: string; timestamp: Date }[];
  language?: string;
  sentiment?: 'positive' | 'neutral' | 'negative';
  priority?: 'low' | 'normal' | 'high' | 'urgent';
  expiresAt?: Date;
  _displayContent?: string;
  _rawJsonContent?: string;
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
