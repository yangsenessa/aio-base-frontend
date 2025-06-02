
import { cn } from '@/lib/utils';
import ChatContainer from './chat/ChatContainer';
import { useEffect, useState, useRef } from 'react';
import { useChat } from '@/contexts/ChatContext';

const ChatSidebar = () => {
  const { messages } = useChat();
  const [width, setWidth] = useState(400); // Initial width in pixels
  const [isResizing, setIsResizing] = useState(false);
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
  
  return (
    <>
      {/* Translucent overlay background - covers only the main content area */}
      <div 
        className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40"
        style={{ right: `${width}px` }}
      />
      
      {/* Chat sidebar - positioned as overlay but outside the shaded area */}
      <div 
        ref={sidebarRef}
        className={cn(
          "fixed right-0 top-0 bottom-0 flex flex-col z-50",
          "animate-fade-in border-l border-border/40",
          "bg-sidebar/95 backdrop-blur-md shadow-2xl"
        )}
        style={{ width: `${width}px` }}
      >
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
