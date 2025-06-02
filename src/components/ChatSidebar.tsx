
import { cn } from '@/lib/utils';
import ChatContainer from './chat/ChatContainer';
import { useEffect, useState, useRef } from 'react';
import { useChat } from '@/contexts/ChatContext';

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
      <button
        onClick={toggleVisibility}
        className="fixed right-4 top-20 z-50 p-2 bg-primary text-primary-foreground rounded-lg shadow-lg hover:bg-primary/90 transition-colors"
        aria-label="Open chat sidebar"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 12h18m-9-9l9 9-9 9"/>
        </svg>
      </button>
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
