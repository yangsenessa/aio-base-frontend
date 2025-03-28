
import { useEffect, useRef, useState } from 'react';
import { ScrollArea } from '../ui/scroll-area';
import { AIMessage } from '@/services/types/aiTypes';
import { useMessageAudio } from '@/hooks/useMessageAudio';
import MessageBubble from './MessageBubble';
import { ChevronDown } from 'lucide-react';

interface ChatMessagesProps {
  messages: AIMessage[];
  setMessages: React.Dispatch<React.SetStateAction<AIMessage[]>>;
}

const ChatMessages = ({ messages, setMessages }: ChatMessagesProps) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { toggleMessagePlayback } = useMessageAudio(messages, setMessages);
  const [showScrollButton, setShowScrollButton] = useState(false);
  
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  useEffect(() => {
    const checkScrollPosition = () => {
      if (!containerRef.current) return;
      
      const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
      const isScrolledUp = scrollHeight - scrollTop - clientHeight > 100;
      setShowScrollButton(isScrolledUp);
    };
    
    const container = containerRef.current;
    if (container) {
      container.addEventListener('scroll', checkScrollPosition);
      return () => container.removeEventListener('scroll', checkScrollPosition);
    }
  }, []);
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="relative flex-1 overflow-hidden">
      <ScrollArea 
        className="flex-1 p-4 overflow-y-auto" 
        style={{ height: 'calc(100vh - 190px)' }} 
        ref={containerRef}
      >
        <div className="space-y-4 pb-4">
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
      
      {showScrollButton && (
        <button
          onClick={scrollToBottom}
          className="absolute bottom-4 right-4 p-2 rounded-full bg-primary text-white shadow-md hover:bg-primary/90 transition-all"
          aria-label="Scroll to bottom"
        >
          <ChevronDown size={20} />
        </button>
      )}
    </div>
  );
};

export default ChatMessages;
