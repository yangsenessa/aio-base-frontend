
import { Send, Mic, Paperclip } from 'lucide-react';
import { Button } from '../ui/button';
import ChatFileUploader, { AttachedFile } from './ChatFileUploader';

interface ChatInputProps {
  message: string;
  setMessage: (message: string) => void;
  onSendMessage: () => void;
  onStartRecording: () => void;
  isMicSupported: boolean;
  attachedFiles: AttachedFile[];
  onFileAttached: (fileId: string, fileInfo: AttachedFile) => void;
  onFileRemoved: (fileId: string) => void;
}

const ChatInput = ({ 
  message, 
  setMessage, 
  onSendMessage, 
  onStartRecording, 
  isMicSupported,
  attachedFiles,
  onFileAttached,
  onFileRemoved
}: ChatInputProps) => {
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSendMessage();
    }
  };
  
  return (
    <div className="p-4 border-t border-border/40 bg-background/80 sticky bottom-0 w-full">
      <div className="flex flex-col space-y-2">
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type your message..."
          className="w-full min-h-[60px] max-h-[120px] p-2 rounded-md border border-border bg-background resize-none focus:outline-none focus:ring-1 focus:ring-primary"
        />
        
        <div className="flex items-center justify-between">
          <div className="flex space-x-2">
            <ChatFileUploader 
              onFileAttached={onFileAttached}
              onFileRemoved={onFileRemoved}
              attachedFiles={attachedFiles}
            />
            
            {isMicSupported && (
              <Button 
                variant="outline" 
                size="icon"
                onClick={onStartRecording}
                className="bg-primary/10 hover:bg-primary/20 transition-colors"
              >
                <Mic size={18} className="text-primary" />
              </Button>
            )}
          </div>
          
          <Button
            onClick={onSendMessage}
            disabled={(message.trim() === '' && attachedFiles.length === 0)}
          >
            <Send size={18} />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ChatInput;
