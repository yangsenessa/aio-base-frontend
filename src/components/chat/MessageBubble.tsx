
import { AIMessage } from '@/services/types/aiTypes';
import { cn } from '@/lib/utils';
import MessageContent from './MessageContent';
import { useEffect } from 'react';
import { 
  isValidJson, 
  fixMalformedJson, 
  hasModalStructure, 
  safeJsonParse, 
  cleanJsonString 
} from '@/util/formatters';

interface MessageBubbleProps {
  message: AIMessage;
  onPlaybackChange: (messageId: string, audioElement: HTMLAudioElement | null) => void;
}

const MessageBubble = ({ message, onPlaybackChange }: MessageBubbleProps) => {
  const isUser = message.sender === 'user';
  const isSystemMessage = message.messageType === 'system';
  
  // Enhanced check for structured AI response 
  const isStructuredAIResponse = (): boolean => {
    if (message.sender !== 'ai' || !message.content) return false;
    
    // First check metadata if available
    if (message.metadata?.aiResponse) {
      return (
        Object.keys(message.metadata.aiResponse.intent_analysis || {}).length > 0 || 
        (message.metadata.aiResponse.execution_plan?.steps?.length > 0)
      );
    }
    
    // Check for code blocks with JSON
    if (message.content.includes('```json') || message.content.includes('```')) {
      const cleanJson = cleanJsonString(message.content);
      try {
        const parsedJson = safeJsonParse(cleanJson);
        if (parsedJson && hasModalStructure(parsedJson)) {
          return true;
        }
      } catch (error) {
        // Silent failure, continue to other checks
      }
    }
    
    // Then check raw content for JSON structure
    if (message.content.trim().startsWith('{')) {
      try {
        // Apply JSON fixing before parsing
        const fixedJson = fixMalformedJson(message.content);
        const parsedJson = safeJsonParse(fixedJson);
        return parsedJson && hasModalStructure(parsedJson);
      } catch (error) {
        // Silent failure, continue to other checks
      }
    }
    
    // Check for markdown structure
    return (
      message.content.includes("**Intent Analysis:**") || 
      message.content.includes("**Execution Plan:**") || 
      message.content.includes("**Response:**") ||
      message.content.includes("intent_analysis") ||
      message.content.includes("execution_plan")
    );
  };
  
  // Check if the message contains raw JSON
  const isRawJsonContent = (): boolean => {
    if (message.sender !== 'ai' || !message.content) return false;
    
    // Check for obvious JSON markers
    const hasJsonMarkers = 
      message.content.trim().startsWith('{') || 
      message.content.includes('```json') || 
      message.content.includes('\\\\json') ||
      message.content.includes('"intent_analysis"') ||
      message.content.includes('"execution_plan"');
    
    if (hasJsonMarkers) {
      // For raw JSON content
      if (message.content.trim().startsWith('{')) {
        try {
          const fixedJson = fixMalformedJson(message.content);
          return isValidJson(fixedJson);
        } catch (error) {
          return false;
        }
      }
      
      // For code blocks
      if (message.content.includes('```json') || message.content.includes('```')) {
        const cleanJson = cleanJsonString(message.content);
        return isValidJson(cleanJson);
      }
    }
    
    return false;
  };
  
  const hasStructured = isStructuredAIResponse();
  const hasRawJson = isRawJsonContent();
  
  // Debug rendering of messages
  useEffect(() => {
    console.log(`[MessageBubble] Rendering message ID: ${message.id}, type: ${message.messageType || 'standard'}`);
    console.log(`Is structured AI response: ${hasStructured}, Is raw JSON: ${hasRawJson}`);
    if (hasRawJson || hasStructured) {
      console.log(`[MessageBubble] Content preview:`, message.content.substring(0, 100));
    }
  }, [message, hasStructured, hasRawJson]);
  
  // Determine the appropriate bubble width based on content type
  const bubbleWidth = hasStructured || hasRawJson
    ? "max-w-[95%] md:max-w-[90%]" // Wider for structured responses or JSON
    : "max-w-[85%]"; // Standard width
  
  // Determine the appropriate background color for different types of messages
  const getBubbleStyles = () => {
    if (isUser) {
      return "bg-primary text-primary-foreground rounded-tr-none";
    } else if (isSystemMessage) {
      return "bg-blue-500 text-white rounded-tl-none";
    } else if (hasStructured) {
      return "bg-secondary/80 text-secondary-foreground rounded-tl-none"; // Slightly different for structured
    } else if (hasRawJson) {
      return "bg-[#1A1F2C] text-gray-200 rounded-tl-none"; // Dark background for JSON
    } else {
      return "bg-secondary text-secondary-foreground rounded-tl-none";
    }
  };
  
  return (
    <div 
      key={message.id}
      className={cn(
        "flex w-full mb-4 animate-slide-up",
        isUser ? "justify-end" : "justify-start"
      )}
    >
      <div
        className={cn(
          "rounded-2xl px-4 py-3 shadow-sm transition-all duration-200 hover:shadow-md",
          bubbleWidth,
          getBubbleStyles()
        )}
      >
        <MessageContent 
          message={message}
          onPlaybackChange={onPlaybackChange}
        />
      </div>
    </div>
  );
};

export default MessageBubble;
