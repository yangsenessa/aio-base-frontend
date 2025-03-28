
import { cn } from '@/lib/utils';
import ChatContainer from './chat/ChatContainer';

const ChatSidebar = () => {
  return (
    <div className={cn(
      "h-full flex flex-col fixed right-0", 
      "animate-fade-in border-l border-border/40", 
      "bg-sidebar/80 backdrop-blur-sm overflow-hidden",
      "top-16 bottom-0 w-80"
    )}>
      <ChatContainer />
    </div>
  );
};

export default ChatSidebar;
