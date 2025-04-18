
import { AIMessage } from '@/services/types/aiTypes';
import { cn } from '@/lib/utils';
import MessageContent from './MessageContent';
import { useEffect } from 'react';

interface MessageBubbleProps {
  message: AIMessage;
  onPlaybackChange: (messageId: string, audioElement: HTMLAudioElement | null) => void;
}

const MessageBubble = ({ message, onPlaybackChange }: MessageBubbleProps) => {
  const isUser = message.sender === 'user';
  const isSystemMessage = message.messageType === 'system';
  const isAIResponseWithStructuredData = message.sender === 'ai' && 
    !!message.metadata?.aiResponse && 
    (Object.keys(message.metadata.aiResponse.intent_analysis || {}).length > 0 || 
    (message.metadata.aiResponse.execution_plan?.steps?.length > 0));
  
  // Determine if content appears to be raw JSON
  const isRawJsonContent = message.sender === 'ai' && message.content && (
    message.content.includes('```json') || 
    message.content.includes('\\\\json') ||
    (message.content.includes('{') && message.content.includes('}'))
  );
  
  // Debug rendering of messages
  useEffect(() => {
    console.log(`[MessageBubble] Rendering message ID: ${message.id}, type: ${message.messageType || 'standard'}`);
    console.log(`Has AI response: ${!!message.metadata?.aiResponse}, Is raw JSON: ${isRawJsonContent}`);
  }, [message, isRawJsonContent]);
  
  // Determine the appropriate bubble width based on content type
  const bubbleWidth = isAIResponseWithStructuredData || isRawJsonContent
    ? "max-w-[90%] md:max-w-[80%]" 
    : "max-w-[85%]";
  
  // Determine the appropriate background color for different types of messages
  const getBubbleStyles = () => {
    if (isUser) {
      return "bg-primary text-primary-foreground rounded-tr-none";
    } else if (isSystemMessage) {
      return "bg-blue-500 text-white rounded-tl-none";
    } else if (isAIResponseWithStructuredData) {
      return "bg-transparent text-secondary-foreground rounded-tl-none";
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
