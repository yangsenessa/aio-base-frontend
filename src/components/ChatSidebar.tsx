
import { cn } from '@/lib/utils';
import ChatContainer from './chat/ChatContainer';
import { useEffect, useState, useRef } from 'react';
import { useChat } from '@/contexts/ChatContext';
import { MessageSquare, Sparkles, Brain, Zap } from 'lucide-react';

const ChatSidebar = () => {
  const { messages } = useChat();
  const [width, setWidth] = useState(400); // Initial width in pixels
  const [isResizing, setIsResizing] = useState(false);
  const [isVisible, setIsVisible] = useState(true); // Add visibility state
  const sidebarRef = useRef<HTMLDivElement>(null);
  
  // Add debug log to check if ChatSidebar is mounting properly
  useEffect(() => {
    console.log('[ChatSidebar] Mounted with', messages.length, 'messages');
  }, [messages.length]);

  // Handle mouse move for resizing
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;
      
      const newWidth = window.innerWidth - e.clientX;
      const maxWidth = window.innerWidth * 0.8; // 80% max width
      const minWidth = 300; // Minimum width
      
      setWidth(Math.min(Math.max(newWidth, minWidth), maxWidth));
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'ew-resize';
      document.body.style.userSelect = 'none';
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isResizing]);

  const handleMouseDown = () => {
    setIsResizing(true);
  };

  const toggleVisibility = () => {
    setIsVisible(!isVisible);
  };
  
  // Don't render anything if not visible
  if (!isVisible) {
    return (
      <div className="fixed right-6 top-24 z-50 group">
        {/* Floating AI Center Button */}
        <button
          onClick={toggleVisibility}
          className="relative overflow-hidden bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-600 hover:from-blue-600 hover:via-purple-600 hover:to-indigo-700 text-white rounded-full p-4 shadow-2xl hover:shadow-blue-500/25 transition-all duration-300 transform hover:scale-110 group-hover:rotate-12 animate-pulse"
          aria-label="Open Queen Agent - AI Center"
        >
          {/* Animated background glow */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-400 via-purple-400 to-indigo-500 rounded-full blur-lg opacity-70 group-hover:opacity-100 transition-opacity duration-300"></div>
          
          {/* Main icon container */}
          <div className="relative flex items-center justify-center">
            <Brain className="w-6 h-6 relative z-10" />
            
            {/* Sparkle animations */}
            <Sparkles className="w-3 h-3 absolute -top-1 -right-1 animate-bounce delay-100" />
            <Zap className="w-3 h-3 absolute -bottom-1 -left-1 animate-bounce delay-300" />
          </div>
          
          {/* Ripple effect */}
          <div className="absolute inset-0 rounded-full bg-white/20 scale-0 group-hover:scale-150 transition-transform duration-500 opacity-0 group-hover:opacity-100"></div>
        </button>
        
        {/* Floating label */}
        <div className="absolute right-full mr-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
          <div className="bg-gray-900/90 text-white px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap backdrop-blur-sm border border-gray-700/50">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              <span>Queen Agent AI</span>
            </div>
            <div className="text-xs text-gray-300 mt-1">Click to open AI center</div>
          </div>
          {/* Arrow pointer */}
          <div className="absolute left-full top-1/2 -translate-y-1/2 border-8 border-transparent border-l-gray-900/90"></div>
        </div>
        
        {/* Notification badge for new messages */}
        {messages.length > 0 && (
          <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold animate-bounce">
            {messages.length > 9 ? '9+' : messages.length}
          </div>
        )}
      </div>
    );
  }

  return (
    <>
      {/* Chat sidebar - positioned as overlay on the right side */}
      <div 
        ref={sidebarRef}
        className={cn(
          "fixed right-0 top-0 bottom-0 flex flex-col z-50",
          "animate-fade-in border-l border-border/40",
          "bg-sidebar/95 backdrop-blur-md shadow-2xl"
        )}
        style={{ width: `${width}px` }}
      >
        {/* Close button */}
        <button
          onClick={toggleVisibility}
          className="absolute right-2 top-2 z-20 p-1 hover:bg-sidebar-accent rounded-md transition-colors"
          aria-label="Close chat sidebar"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 6L6 18M6 6l12 12"/>
          </svg>
        </button>

        {/* Resize handle */}
        <div
          className={cn(
            "absolute left-0 top-0 h-full w-2 cursor-ew-resize group",
            "hover:bg-primary/30 active:bg-primary/50 transition-colors",
            "flex items-center justify-center z-10"
          )}
          onMouseDown={handleMouseDown}
        >
          <div className="opacity-0 group-hover:opacity-100 absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 p-1.5 bg-primary/20 rounded-lg transition-opacity">
            <div className="flex gap-0.5">
              <div className="w-0.5 h-4 bg-primary/70 rounded" />
              <div className="w-0.5 h-4 bg-primary/70 rounded" />
            </div>
          </div>
        </div>
        
        <ChatContainer />
      </div>
    </>
  );
};

export default ChatSidebar;
