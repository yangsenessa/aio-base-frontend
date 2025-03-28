
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
  
  // Enhanced message properties for future features
  messageType?: 'text' | 'voice' | 'file' | 'rich' | 'system'; // Explicitly define message types
  status?: 'sending' | 'sent' | 'delivered' | 'read' | 'error'; // Message delivery status
  reactions?: { [emoji: string]: number }; // Support for message reactions
  metadata?: Record<string, any>; // Generic metadata for extensibility
  threadId?: string; // Support for message threading
  isEdited?: boolean; // Track if message was edited
  editHistory?: { content: string; timestamp: Date }[]; // Track edit history
  language?: string; // Language of the message for internationalization
  sentiment?: 'positive' | 'neutral' | 'negative'; // Message sentiment analysis result
  priority?: 'low' | 'normal' | 'high' | 'urgent'; // Message priority
  expiresAt?: Date; // Support for ephemeral messages
}

// Re-export functions that were moved during the refactoring
export { getInitialMessage, sendMessage } from '@/services/aiAgentService';
export { processVoiceData } from '@/services/ai/voiceAIService';
