
import { cn } from '@/lib/utils';
import ChatContainer from './chat/ChatContainer';

const ChatSidebar = () => {
  return (
    <div className={cn(
      "h-full flex flex-col", 
      "animate-fade-in border-l border-border/40", 
      "bg-sidebar/80 backdrop-blur-sm"
    )}>
      <ChatContainer />
    </div>
  );
};

export default ChatSidebar;
