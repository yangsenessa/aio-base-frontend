
import { AIMessage } from '@/services/types/aiTypes';
import { cn } from '@/lib/utils';
import MessageContent from './MessageContent';
import { useEffect, useMemo, useRef } from 'react';
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

const processedContentCache = new Map<string, string>();
const MAX_CACHE_SIZE = 100;
const processingCount = new Map<string, number>();
const MAX_PROCESSING_ATTEMPTS = 3;

const MessageBubble = ({ message, onPlaybackChange, className }: MessageBubbleProps) => {
  const isUser = message.sender === 'user';
  const isSystemMessage = message.messageType === 'system';
  
  const messageRef = useRef(message);
  useEffect(() => {
    messageRef.current = message;
  }, [message]);
  
  const processedContent = useMemo(() => {
    const messageId = message.id || '';
    
    if (message._displayContent) {
      return message._displayContent;
    }
    
    if (processedContentCache.has(messageId)) {
      return processedContentCache.get(messageId);
    }
    
    if (isUser || !message.content) {
      return message.content;
    }
    
    const currentAttempts = processingCount.get(messageId) || 0;
    processingCount.set(messageId, currentAttempts + 1);
    
    if (currentAttempts >= MAX_PROCESSING_ATTEMPTS) {
      console.log(`[MessageBubble] Max processing attempts reached for message ${messageId}`);
      const safeResult = "Processing complete. Please click Execute if you'd like to proceed.";
      processedContentCache.set(messageId, safeResult);
      return safeResult;
    }
    
    console.log('[MessageBubble] Starting processedContent calculation');
    console.log('[MessageBubble] Input message:', {
      id: message.id,
      sender: message.sender,
      contentLength: message.content?.length || 0,
      contentPreview: message.content?.substring(0, 100),
      hasDisplayContent: !!message._displayContent
    });
    
    const commentFreeMsgContent = removeJsonComments(message.content);
    console.log('[MessageBubble] Comment-free content length:', commentFreeMsgContent.length);
    console.log('[MessageBubble] Comment-free content preview:', commentFreeMsgContent.substring(0, 100));
    
    if (commentFreeMsgContent.trim().startsWith('{') || commentFreeMsgContent.includes('```json')) {
      console.log('[MessageBubble] Attempting direct JSON parse');
      try {
        let jsonContent = extractJsonFromCodeBlock(commentFreeMsgContent);
        console.log('[MessageBubble] Extracted JSON content length:', jsonContent.length);
        console.log('[MessageBubble] Extracted JSON content preview:', jsonContent.substring(0, 100));
        
        const parsed = safeJsonParse(jsonContent);
        console.log('[MessageBubble] Direct JSON parse result:', parsed ? 'success' : 'failed');
        
        if (parsed && typeof parsed.response === 'string') {
          console.log('[MessageBubble] Found direct response field in JSON');
          const result = parsed.response;
          processedContentCache.set(messageId, result);
          return result;
        }
      } catch (error) {
        console.log('[MessageBubble] Direct JSON parse failed:', error);
      }
    }
    
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
          if (jsonObj.response) {
            console.log('[MessageBubble] Found response in parsed JSON');
            const result = jsonObj.response;
            processedContentCache.set(messageId, result);
            return result;
          }
          
          const response = getResponseFromModalJson(jsonObj);
          if (response) {
            console.log('[MessageBubble] Successfully extracted response from structured JSON');
            processedContentCache.set(messageId, response);
            return response;
          }
        }
      } catch (error) {
        console.log('[MessageBubble] Error extracting modal response:', error);
      }
    }
    
    console.log('[MessageBubble] Returning original content');
    if (processedContentCache.size >= MAX_CACHE_SIZE) {
      const keys = Array.from(processedContentCache.keys());
      const randomKey = keys[Math.floor(Math.random() * keys.length)];
      processedContentCache.delete(randomKey);
    }
    
    processedContentCache.set(messageId, message.content);
    return message.content;
  }, [message, isUser]);
  
  const isStructuredAIResponse = (): boolean => {
    if (message.sender !== 'ai' || !message.content) return false;
    
    const cleanedContent = removeJsonComments(message.content);
    
    if (message.metadata?.aiResponse) {
      return (
        Object.keys(message.metadata.aiResponse.intent_analysis || {}).length > 0 || 
        (message.metadata.aiResponse.execution_plan?.steps?.length > 0)
      );
    }
    
    if (cleanedContent.includes('"intent_analysis"') && 
        (cleanedContent.includes('"execution_plan"') || cleanedContent.includes('"modality_analysis"')) && 
        cleanedContent.includes('"response"')) {
      return true;
    }
    
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
    
    return (
      cleanedContent.includes("**Intent Analysis:**") || 
      cleanedContent.includes("**Execution Plan:**") || 
      cleanedContent.includes("**Response:**") ||
      cleanedContent.includes("intent_analysis") ||
      cleanedContent.includes("execution_plan") ||
      cleanedContent.includes("request_understanding")
    );
  };
  
  const isRawJsonContent = (): boolean => {
    if (message.sender !== 'ai' || !message.content) return false;
    
    const cleanedContent = removeJsonComments(message.content);
    
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
  
  useEffect(() => {
    console.log(`[MessageBubble] Rendering message ID: ${message.id}, type: ${message.messageType || 'standard'}`);
    console.log(`Is structured AI response: ${hasStructured}, Is raw JSON: ${hasRawJson}`);
    if (hasRawJson || hasStructured) {
      console.log(`[MessageBubble] Content preview:`, message.content.substring(0, 100));
    }
  }, [message, hasStructured, hasRawJson]);
  
  const bubbleWidth = hasStructured || hasRawJson
    ? "max-w-[95%] md:max-w-[90%]" // Wider for structured responses or JSON
    : "max-w-[85%]"; // Standard width
  
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
            content: processedContent,
            sender: message.sender,
            _rawJsonContent: hasRawJson || hasStructured ? message.content : undefined
          }}
          onPlaybackChange={onPlaybackChange}
        />
      </div>
    </div>
  );
};

export default MessageBubble;
