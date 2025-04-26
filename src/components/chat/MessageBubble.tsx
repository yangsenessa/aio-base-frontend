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
  extractResponseFromRawJson,
  removeJsonComments
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
    
    // First remove any comments from the message content
    const commentFreeMsgContent = removeJsonComments(message.content);
    
    // Step 1: Try direct JSON parse first
    if (commentFreeMsgContent.trim().startsWith('{')) {
      try {
        const parsed = safeJsonParse(commentFreeMsgContent);
        if (parsed && typeof parsed.response === 'string') {
          console.log("[MessageBubble] Found direct response field in JSON");
          return parsed.response;
        }
      } catch (error) {
        console.log("[MessageBubble] Direct JSON parse failed:", error);
      }
    }
    
    // Step 2: Try to extract from structured JSON with intent_analysis and execution_plan
    if (commentFreeMsgContent.includes('intent_analysis') || 
        commentFreeMsgContent.includes('execution_plan') ||
        commentFreeMsgContent.includes('modality_analysis')) {
      try {
        const cleanedJson = cleanJsonString(commentFreeMsgContent);
        const fixedJson = fixMalformedJson(cleanedJson);
        const jsonObj = safeJsonParse(fixedJson);
        
        if (jsonObj) {
          const response = getResponseFromModalJson(jsonObj);
          if (response) {
            console.log("[MessageBubble] Successfully extracted response from structured JSON");
            return response;
          }
        }
      } catch (error) {
        console.log("[MessageBubble] Error extracting modal response:", error);
      }
    }
    
    // Step 3: Check if this is raw JSON with backticks
    if (commentFreeMsgContent.includes('```') && commentFreeMsgContent.includes('"response"')) {
      const extractedResponse = extractResponseFromRawJson(commentFreeMsgContent);
      if (extractedResponse) {
        console.log("[MessageBubble] Successfully extracted response from code block");
        return extractedResponse;
      }
    }
    
    // Step 4: Try regex extraction as fallback
    if (commentFreeMsgContent.includes('"response"')) {
      const responseRegex = /"response"\s*:\s*"([^"]+)"/;
      const matches = commentFreeMsgContent.match(responseRegex);
      if (matches && matches[1]) {
        console.log("[MessageBubble] Extracted response using regex");
        return matches[1];
      }
    }
    
    // If we have a _displayContent, use it
    if (message._displayContent) {
      return message._displayContent;
    }
    
    // Return original content if no response found
    return message.content;
  }, [message, isUser]);
  
  // Enhanced check for structured AI response 
  const isStructuredAIResponse = (): boolean => {
    if (message.sender !== 'ai' || !message.content) return false;
    
    // Clean the content first
    const cleanedContent = removeJsonComments(message.content);
    
    // First check metadata if available
    if (message.metadata?.aiResponse) {
      return (
        Object.keys(message.metadata.aiResponse.intent_analysis || {}).length > 0 || 
        (message.metadata.aiResponse.execution_plan?.steps?.length > 0)
      );
    }
    
    // Direct check for known JSON structure with both intent_analysis and execution_plan
    if (cleanedContent.includes('"intent_analysis"') && 
        (cleanedContent.includes('"execution_plan"') || cleanedContent.includes('"modality_analysis"')) && 
        cleanedContent.includes('"response"')) {
      return true;
    }
    
    // Check for JSON markup or actual JSON content
    if (
      cleanedContent.includes('```json') || 
      cleanedContent.includes('```') || 
      cleanedContent.trim().startsWith('{')
    ) {
      try {
        let jsonContent;
        
        if (cleanedContent.includes('```json')) {
          const parts = cleanedContent.split('```json');
          if (parts.length > 1) {
            const jsonPart = parts[1].split('```')[0].trim();
            jsonContent = fixMalformedJson(jsonPart);
          }
        } else if (cleanedContent.includes('```')) {
          const parts = cleanedContent.split('```');
          if (parts.length > 1) {
            const jsonPart = parts[1].trim();
            jsonContent = fixMalformedJson(jsonPart);
          }
        } else if (cleanedContent.trim().startsWith('{')) {
          jsonContent = fixMalformedJson(cleanedContent);
        }
        
        if (jsonContent) {
          const parsedJson = safeJsonParse(jsonContent);
          if (parsedJson && hasModalStructure(parsedJson)) {
            return true;
          }
          // Additional check for known structure patterns
          if (parsedJson && 
             (parsedJson.intent_analysis || parsedJson.execution_plan || parsedJson.modality_analysis) && 
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
      cleanedContent.includes("**Intent Analysis:**") || 
      cleanedContent.includes("**Execution Plan:**") || 
      cleanedContent.includes("**Response:**") ||
      cleanedContent.includes("intent_analysis") ||
      cleanedContent.includes("execution_plan") ||
      cleanedContent.includes("request_understanding")
    );
  };
  
  // Improved check for raw JSON content
  const isRawJsonContent = (): boolean => {
    if (message.sender !== 'ai' || !message.content) return false;
    
    // Clean content first
    const cleanedContent = removeJsonComments(message.content);
    
    // Check for JSON indicators
    if (
      cleanedContent.trim().startsWith('{') || 
      cleanedContent.includes('```json') || 
      cleanedContent.includes('```')
    ) {
      try {
        let jsonContent;
        
        if (cleanedContent.trim().startsWith('{')) {
          jsonContent = fixMalformedJson(cleanedContent);
        } else if (cleanedContent.includes('```json')) {
          const parts = cleanedContent.split('```json');
          if (parts.length > 1) {
            jsonContent = fixMalformedJson(parts[1].split('```')[0].trim());
          }
        } else if (cleanedContent.includes('```')) {
          const parts = cleanedContent.split('```');
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
    
    return cleanedContent.includes('"intent_analysis"') || 
           cleanedContent.includes('"execution_plan"') ||
           cleanedContent.includes('"request_understanding"');
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
            // Explicitly preserve the sender property to ensure AI message detection works
            sender: message.sender,
            // Preserve JSON structure info for the View Analysis button to appear
            _rawJsonContent: hasRawJson || hasStructured ? message.content : undefined
          }}
          onPlaybackChange={onPlaybackChange}
        />
      </div>
    </div>
  );
};

export default MessageBubble;
