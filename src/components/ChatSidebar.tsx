
import { cn } from '@/lib/utils';
import ChatContainer from './chat/ChatContainer';

const ChatSidebar = () => {
  return (
    <div className={cn(
      "h-[calc(100vh-64px)] flex flex-col fixed right-0", 
      "animate-fade-in border-l border-border/40", 
      "bg-sidebar/80 backdrop-blur-sm",
      "top-16 bottom-0 w-80 z-40"
    )}>
      <ChatContainer />
    </div>
  );
};

export default ChatSidebar;
