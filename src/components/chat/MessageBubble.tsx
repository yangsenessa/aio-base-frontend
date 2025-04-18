
import { AIMessage } from '@/services/types/aiTypes';
import { cn } from '@/lib/utils';
import MessageContent from './MessageContent';
import { useEffect } from 'react';
import { isValidJson } from '@/util/formatters';

interface MessageBubbleProps {
  message: AIMessage;
  onPlaybackChange: (messageId: string, audioElement: HTMLAudioElement | null) => void;
}

const MessageBubble = ({ message, onPlaybackChange }: MessageBubbleProps) => {
  const isUser = message.sender === 'user';
  const isSystemMessage = message.messageType === 'system';
  
  // Check for structured AI response (parsed or unparsed)
  const isStructuredAIResponse = message.sender === 'ai' && (
    // Check for parsed metadata
    (!!message.metadata?.aiResponse && 
     (Object.keys(message.metadata.aiResponse.intent_analysis || {}).length > 0 || 
      (message.metadata.aiResponse.execution_plan?.steps?.length > 0))) ||
    // Check for unparsed but structured content
    (message.content && message.content.includes("**Intent Analysis:**") && 
     (message.content.includes("**Execution Plan:**") || message.content.includes("**Response:**")))
  );
  
  // Enhanced check for raw JSON content
  const isRawJsonContent = message.sender === 'ai' && message.content && (
    message.content.includes('```json') || 
    message.content.includes('\\\\json') ||
    message.content.trim().startsWith('{') ||
    (isValidJson(message.content) && message.content.includes('intent_analysis'))
  );
  
  // Debug rendering of messages
  useEffect(() => {
    console.log(`[MessageBubble] Rendering message ID: ${message.id}, type: ${message.messageType || 'standard'}`);
    console.log(`Is structured AI response: ${isStructuredAIResponse}, Is raw JSON: ${isRawJsonContent}`);
    if (isRawJsonContent) {
      console.log(`[MessageBubble] JSON content preview:`, message.content.substring(0, 100));
    }
  }, [message, isStructuredAIResponse, isRawJsonContent]);
  
  // Determine the appropriate bubble width based on content type
  const bubbleWidth = isStructuredAIResponse || isRawJsonContent
    ? "max-w-[95%] md:max-w-[90%]" // Wider for structured responses or JSON
    : "max-w-[85%]"; // Standard width
  
  // Determine the appropriate background color for different types of messages
  const getBubbleStyles = () => {
    if (isUser) {
      return "bg-primary text-primary-foreground rounded-tr-none";
    } else if (isSystemMessage) {
      return "bg-blue-500 text-white rounded-tl-none";
    } else if (isStructuredAIResponse) {
      return "bg-secondary/80 text-secondary-foreground rounded-tl-none"; // Slightly different for structured
    } else if (isRawJsonContent) {
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
