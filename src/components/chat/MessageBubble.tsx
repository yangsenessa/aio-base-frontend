import { AIMessage } from '@/services/types/aiTypes';
import { cn } from '@/lib/utils';
import MessageContent from './MessageContent';
import { useEffect, useMemo } from 'react';
import { 
  isValidJson, 
  fixMalformedJson, 
  hasModalStructure, 
  safeJsonParse, 
  cleanJsonString,
  getResponseFromModalJson,
  extractResponseFromRawJson
} from '@/util/formatters';

interface MessageBubbleProps {
  message: AIMessage;
  onPlaybackChange: (messageId: string, audioElement: HTMLAudioElement | null) => void;
  className?: string;
}

const MessageBubble = ({ message, onPlaybackChange, className }: MessageBubbleProps) => {
  const isUser = message.sender === 'user';
  const isSystemMessage = message.messageType === 'system';
  
  // Extract response value from JSON if present
  const processedContent = useMemo(() => {
    // Don't process user messages or messages without content
    if (isUser || !message.content) return message.content;
    
    // Check if this is raw JSON with backticks
    if (message.content.includes('```') && message.content.includes('"response"')) {
      const extractedResponse = extractResponseFromRawJson(message.content);
      if (extractedResponse) {
        return extractedResponse;
      }
    }
    
    // Check if this is raw JSON without backticks
    if (message.content.trim().startsWith('{') && message.content.includes('"response"')) {
      try {
        const jsonObj = safeJsonParse(message.content);
        if (jsonObj && typeof jsonObj.response === 'string') {
          return jsonObj.response;
        }
      } catch (error) {
        // Fall back to regex extraction if parsing fails
        const responseRegex = /"response"\s*:\s*"([^"]+)"/;
        const matches = message.content.match(responseRegex);
        if (matches && matches[1]) {
          return matches[1];
        }
      }
    }
    
    // Return original content if no JSON response found
    return message._displayContent || message.content;
  }, [message, isUser]);
  
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
    
    // Direct check for known JSON structure with both intent_analysis and execution_plan
    if (message.content.includes('"intent_analysis"') && 
        message.content.includes('"execution_plan"') && 
        message.content.includes('"response"')) {
      return true;
    }
    
    // Check for JSON markup or actual JSON content
    if (
      message.content.includes('```json') || 
      message.content.includes('```') || 
      message.content.trim().startsWith('{')
    ) {
      try {
        let jsonContent;
        
        if (message.content.includes('```json')) {
          const parts = message.content.split('```json');
          if (parts.length > 1) {
            const jsonPart = parts[1].split('```')[0].trim();
            jsonContent = fixMalformedJson(jsonPart);
          }
        } else if (message.content.includes('```')) {
          const parts = message.content.split('```');
          if (parts.length > 1) {
            const jsonPart = parts[1].trim();
            jsonContent = fixMalformedJson(jsonPart);
          }
        } else if (message.content.trim().startsWith('{')) {
          jsonContent = fixMalformedJson(message.content);
        }
        
        if (jsonContent) {
          const parsedJson = safeJsonParse(jsonContent);
          if (parsedJson && hasModalStructure(parsedJson)) {
            return true;
          }
          // Additional check for known structure patterns
          if (parsedJson && 
             (parsedJson.intent_analysis || parsedJson.execution_plan) && 
              parsedJson.response) {
            return true;
          }
        }
      } catch (error) {
        // Silent failure, continue to other checks
      }
    }
    
    // Check for markdown structure or key JSON fields as text
    return (
      message.content.includes("**Intent Analysis:**") || 
      message.content.includes("**Execution Plan:**") || 
      message.content.includes("**Response:**") ||
      message.content.includes("intent_analysis") ||
      message.content.includes("execution_plan") ||
      message.content.includes("request_understanding")
    );
  };
  
  // Improved check for raw JSON content
  const isRawJsonContent = (): boolean => {
    if (message.sender !== 'ai' || !message.content) return false;
    
    // Check for JSON indicators
    if (
      message.content.trim().startsWith('{') || 
      message.content.includes('```json') || 
      message.content.includes('```')
    ) {
      try {
        let jsonContent;
        
        if (message.content.trim().startsWith('{')) {
          jsonContent = fixMalformedJson(message.content);
        } else if (message.content.includes('```json')) {
          const parts = message.content.split('```json');
          if (parts.length > 1) {
            jsonContent = fixMalformedJson(parts[1].split('```')[0].trim());
          }
        } else if (message.content.includes('```')) {
          const parts = message.content.split('```');
          if (parts.length > 1) {
            jsonContent = fixMalformedJson(parts[1].trim());
          }
        }
        
        if (jsonContent) {
          return isValidJson(jsonContent);
        }
      } catch (error) {
        return false;
      }
    }
    
    return message.content.includes('"intent_analysis"') || 
           message.content.includes('"execution_plan"') ||
           message.content.includes('"request_understanding"');
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
        isUser ? "justify-end" : "justify-start",
        className
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
          message={{
            ...message,
            content: processedContent, // Use the extracted response value
            // Preserve JSON structure info for the View Analysis button to appear
            _rawJsonContent: hasRawJson ? message.content : undefined
          }}
          onPlaybackChange={onPlaybackChange}
        />
      </div>
    </div>
  );
};

export default MessageBubble;
