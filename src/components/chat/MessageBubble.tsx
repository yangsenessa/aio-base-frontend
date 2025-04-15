
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
  
  // Debug rendering of messages
  useEffect(() => {
    console.log(`[MessageBubble] Rendering message ID: ${message.id}, type: ${message.messageType || 'standard'}`);
  }, [message.id, message.messageType]);
  
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
          "rounded-2xl px-4 py-3 max-w-[85%] shadow-sm transition-all duration-200 hover:shadow-md",
          isUser 
            ? "bg-primary text-primary-foreground rounded-tr-none" 
            : message.messageType === 'system'
              ? "bg-blue-500 text-white rounded-tl-none"
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
