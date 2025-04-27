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
import { extractJsonFromCodeBlock } from '@/util/json/codeBlockExtractor';

interface MessageBubbleProps {
  message: AIMessage;
  onPlaybackChange: (messageId: string, audioElement: HTMLAudioElement | null) => void;
  className?: string;
}

const MessageBubble = ({ message, onPlaybackChange, className }: MessageBubbleProps) => {
  const isUser = message.sender === 'user';
  const isSystemMessage = message.messageType === 'system';
  
  // Cache for processed content to avoid repeated work
  const contentCache = useMemo(() => new Map<string, string>(), []);
  
  // Extract response value from JSON if present
  const processedContent = useMemo(() => {
    const messageId = message.id || '';
    
    // Check cache first
    if (contentCache.has(messageId)) {
      return contentCache.get(messageId);
    }
    
    console.log('[MessageBubble] Starting processedContent calculation');
    console.log('[MessageBubble] Input message:', {
      id: message.id,
      sender: message.sender,
      contentLength: message.content?.length || 0,
      contentPreview: message.content?.substring(0, 100),
      hasDisplayContent: !!message._displayContent
    });
    
    // Don't process user messages or messages without content
    if (isUser || !message.content) {
      console.log('[MessageBubble] Skipping processing - isUser or no content');
      return message.content;
    }
    
    // CRITICAL FIX: Special handling for create_video intent which causes infinite loops
    if (message.content.includes('"primary_goal"') && message.content.includes('"create_video"')) {
      console.log('[MessageBubble] Detected create_video intent, using predefined response');
      const result = "Video creation request detected. Please click Execute if you wish to proceed.";
      contentCache.set(messageId, result);
      return result;
    }
    
    // First remove any comments from the message content
    const commentFreeMsgContent = removeJsonComments(message.content);
    console.log('[MessageBubble] Comment-free content length:', commentFreeMsgContent.length);
    console.log('[MessageBubble] Comment-free content preview:', commentFreeMsgContent.substring(0, 100));
    
    // Step 1: Try direct JSON parse first
    if (commentFreeMsgContent.trim().startsWith('{') || commentFreeMsgContent.includes('```json')) {
      console.log('[MessageBubble] Attempting direct JSON parse');
      try {
        let jsonContent = extractJsonFromCodeBlock(commentFreeMsgContent);
        console.log('[MessageBubble] Extracted JSON content length:', jsonContent.length);
        console.log('[MessageBubble] Extracted JSON content preview:', jsonContent.substring(0, 100));
        
        // CRITICAL FIX: Check for video creation intent in extracted JSON
        if (jsonContent.includes('"primary_goal"') && jsonContent.includes('"create_video"')) {
          console.log('[MessageBubble] Found create_video intent in extracted JSON');
          const result = "Video creation request detected. Please click Execute if you wish to proceed.";
          contentCache.set(messageId, result);
          return result;
        }
        
        const parsed = safeJsonParse(jsonContent);
        console.log('[MessageBubble] Direct JSON parse result:', parsed ? 'success' : 'failed');
        
        // CRITICAL FIX: Another check for video creation after parsing
        if (parsed?.intent_analysis?.request_understanding?.primary_goal === "create_video") {
          console.log('[MessageBubble] Found create_video intent in parsed JSON structure');
          const result = "Video creation request detected. Please click Execute if you wish to proceed.";
          contentCache.set(messageId, result);
          return result;
        }
        
        if (parsed && typeof parsed.response === 'string') {
          console.log('[MessageBubble] Found direct response field in JSON');
          contentCache.set(messageId, parsed.response);
          return parsed.response;
        }
      } catch (error) {
        console.log('[MessageBubble] Direct JSON parse failed:', error);
      }
    }
    
    // Step 2: Try to extract from structured JSON
    if (commentFreeMsgContent.includes('intent_analysis') || 
        commentFreeMsgContent.includes('execution_plan') ||
        commentFreeMsgContent.includes('modality_analysis')) {
      console.log('[MessageBubble] Attempting structured JSON extraction');
      try {
        let jsonContent = extractJsonFromCodeBlock(commentFreeMsgContent);
        console.log('[MessageBubble] Extracted structured JSON content length:', jsonContent.length);
        console.log('[MessageBubble] Extracted structured JSON content preview:', jsonContent.substring(0, 100));
        
        const cleanedJson = cleanJsonString(jsonContent);
        const fixedJson = fixMalformedJson(cleanedJson);
        console.log('[MessageBubble] Fixed JSON length:', fixedJson.length);
        console.log('[MessageBubble] Fixed JSON preview:', fixedJson.substring(0, 100));
        
        const jsonObj = safeJsonParse(fixedJson);
        console.log('[MessageBubble] Structured JSON parse result:', jsonObj ? 'success' : 'failed');
        
        if (jsonObj) {
          // CRITICAL FIX: Check for create_video intent in structured JSON
          if (jsonObj.intent_analysis?.request_understanding?.primary_goal === "create_video") {
            console.log('[MessageBubble] Found create_video intent in structured JSON');
            const result = "Video creation request detected. Please click Execute if you wish to proceed.";
            contentCache.set(messageId, result);
            return result;
          }
          
          if (jsonObj.response) {
            console.log('[MessageBubble] Found response in parsed JSON');
            contentCache.set(messageId, jsonObj.response);
            return jsonObj.response;
          }
          
          const response = getResponseFromModalJson(jsonObj);
          if (response) {
            console.log('[MessageBubble] Successfully extracted response from structured JSON');
            contentCache.set(messageId, response);
            return response;
          }
        }
      } catch (error) {
        console.log('[MessageBubble] Error extracting modal response:', error);
      }
    }
    
    // If we have a _displayContent, use it
    if (message._displayContent) {
      console.log('[MessageBubble] Using _displayContent');
      contentCache.set(messageId, message._displayContent);
      return message._displayContent;
    }
    
    console.log('[MessageBubble] Returning original content');
    contentCache.set(messageId, message.content);
    return message.content;
  }, [message, isUser, contentCache]);
  
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
