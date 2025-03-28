
import { AIMessage } from '@/services/types/aiTypes';
import MessageContent from './MessageContent';

interface MessageBubbleProps {
  message: AIMessage;
  onPlaybackChange: (messageId: string, audioElement: HTMLAudioElement | null) => void;
}

const MessageBubble = ({ message, onPlaybackChange }: MessageBubbleProps) => {
  return (
    <div 
      key={message.id}
      className={`${
        message.sender === 'user' 
          ? 'ml-auto bg-primary text-primary-foreground' 
          : 'mr-auto bg-secondary text-secondary-foreground'
      } rounded-lg p-3 max-w-[85%] animate-slide-up`}
    >
      <MessageContent 
        message={message}
        onPlaybackChange={onPlaybackChange}
      />
    </div>
  );
};

export default MessageBubble;
