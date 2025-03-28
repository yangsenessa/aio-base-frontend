
import { useEffect, useRef } from 'react';
import { ScrollArea } from '../ui/scroll-area';
import { AIMessage } from '@/services/types/aiTypes';
import { useMessageAudio } from '@/hooks/useMessageAudio';
import MessageBubble from './MessageBubble';

interface ChatMessagesProps {
  messages: AIMessage[];
  setMessages: React.Dispatch<React.SetStateAction<AIMessage[]>>;
}

const ChatMessages = ({ messages, setMessages }: ChatMessagesProps) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toggleMessagePlayback } = useMessageAudio(messages, setMessages);
  
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <ScrollArea className="flex-1 p-4 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 180px)' }}>
      <div className="space-y-4">
        {messages.map((msg) => (
          <MessageBubble
            key={msg.id}
            message={msg}
            onPlaybackChange={toggleMessagePlayback}
          />
        ))}
        <div ref={messagesEndRef} />
      </div>
    </ScrollArea>
  );
};

export default ChatMessages;
