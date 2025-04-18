
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
  const isAIResponseWithStructuredData = message.sender === 'ai' && !!message.metadata?.aiResponse;
  
  // Debug rendering of messages
  useEffect(() => {
    console.log(`[MessageBubble] Rendering message ID: ${message.id}, type: ${message.messageType || 'standard'}, has AI response: ${!!message.metadata?.aiResponse}`);
  }, [message.id, message.messageType, message.metadata?.aiResponse]);
  
  // Determine the appropriate bubble width based on content type
  const bubbleWidth = isAIResponseWithStructuredData 
    ? "max-w-[90%] md:max-w-[80%]" 
    : "max-w-[85%]";
  
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
          isUser 
            ? "bg-primary text-primary-foreground rounded-tr-none" 
            : isSystemMessage
              ? "bg-blue-500 text-white rounded-tl-none"
              : isAIResponseWithStructuredData
                ? "bg-transparent text-secondary-foreground rounded-tl-none"
                : "bg-secondary text-secondary-foreground rounded-tl-none"
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
