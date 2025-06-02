
import { cn } from '@/lib/utils';
import ChatContainer from './chat/ChatContainer';
import { useEffect } from 'react';
import { useChat } from '@/contexts/ChatContext';

const ChatSidebar = () => {
  const { messages } = useChat();
  
  // Add debug log to check if ChatSidebar is mounting properly
  useEffect(() => {
    console.log('[ChatSidebar] Mounted with', messages.length, 'messages');
  }, [messages.length]);
  
  return (
    <div 
      className={cn(
        "h-[calc(100vh-64px)] flex flex-col",
        "animate-fade-in border-l border-border/40",
        "bg-sidebar/80 backdrop-blur-sm"
      )}
    >
      <ChatContainer />
    </div>
  );
};

export default ChatSidebar;
