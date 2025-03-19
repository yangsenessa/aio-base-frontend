
import { useState, useRef, useEffect } from 'react';
import { Send, X, Maximize2, Minimize2, Mic, MicOff, StopCircle } from 'lucide-react';
import { ScrollArea } from './ui/scroll-area';
import { Button } from './ui/button';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
import { toast } from './ui/use-toast';
import AIOLogo from './AIOLogo';
import { 
  startVoiceRecording, 
  stopVoiceRecording, 
  isVoiceRecordingActive,
  isVoiceRecordingSupported, 
  requestMicrophonePermission,
  setupMediaRecorder
} from '@/services/speechService';

interface Message {
  id: string;
  sender: 'user' | 'ai';
  content: string;
  timestamp: Date;
}

const ChatSidebar = () => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      sender: 'ai',
      content: "Hello! I'm AIO-2030 AI. How can I assist you with the decentralized AI agent network today?",
      timestamp: new Date(),
    },
  ]);
  const [isRecording, setIsRecording] = useState(false);
  const [isMicSupported, setIsMicSupported] = useState(false);
  const [hasMicPermission, setHasMicPermission] = useState(false);
  const [isRecordingDialogOpen, setIsRecordingDialogOpen] = useState(false);
  const [isProcessingVoice, setIsProcessingVoice] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Check if voice recording is supported
    setIsMicSupported(isVoiceRecordingSupported());
  }, []);

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  const handleSendMessage = () => {
    if (message.trim() === '') return;

    const newMessage: Message = {
      id: Date.now().toString(),
      sender: 'user',
      content: message,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, newMessage]);
    setMessage('');

    // Simulate AI response
    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        content: `I received your message: "${message}". This is a simulated response from AIO-2030 AI.`,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiResponse]);
    }, 1000);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const startRecording = async () => {
    if (!isMicSupported) {
      toast({
        title: "Microphone not supported",
        description: "Your browser does not support microphone access",
        variant: "destructive"
      });
      return;
    }
    
    if (!hasMicPermission) {
      const permissionGranted = await requestMicrophonePermission();
      setHasMicPermission(permissionGranted);
      
      if (!permissionGranted) {
        toast({
          title: "Microphone access denied",
          description: "Please allow microphone access to use voice input",
          variant: "destructive"
        });
        return;
      }
    }
    
    // Setup media recorder
    await setupMediaRecorder();
    
    // Start recording
    startVoiceRecording();
    setIsRecording(true);
    setIsRecordingDialogOpen(true);
    
    toast({
      title: "Recording started",
      description: "Speak now and click Finish when done.",
    });
  };
  
  const finishRecording = async () => {
    setIsProcessingVoice(true);
    
    try {
      // Stop recording and get transcribed text
      const transcribedText = await stopVoiceRecording();
      setMessage(transcribedText);
      
      toast({
        title: "Voice recorded",
        description: "Your voice has been converted to text",
      });
    } catch (error) {
      toast({
        title: "Error processing voice",
        description: "There was an error processing your voice recording",
        variant: "destructive"
      });
    } finally {
      setIsRecording(false);
      setIsRecordingDialogOpen(false);
      setIsProcessingVoice(false);
    }
  };

  const cancelRecording = () => {
    // Cancel recording
    stopVoiceRecording();
    setIsRecording(false);
    setIsRecordingDialogOpen(false);
    
    toast({
      title: "Recording cancelled",
      description: "Voice recording has been cancelled",
    });
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (!isExpanded) {
    return (
      <div className="fixed bottom-5 right-5 z-40">
        <button 
          onClick={toggleExpand}
          className="bg-primary text-white p-4 rounded-full shadow-lg hover:bg-primary/90 transition-colors"
          aria-label="Open chat"
        >
          <Maximize2 size={20} />
        </button>
      </div>
    );
  }

  return (
    <aside className="border-l border-border/40 bg-background/80 backdrop-blur-sm h-full flex flex-col animate-slide-in-right pt-16">
      <div className="p-4 border-b border-border/40 flex justify-between items-center">
        <AIOLogo size="sm" variant="sidebar" />
        <div className="flex space-x-2">
          <button 
            onClick={toggleExpand}
            className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded-md hover:bg-secondary/80"
            aria-label="Minimize chat"
          >
            <Minimize2 size={18} />
          </button>
          <button 
            onClick={toggleExpand}
            className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded-md hover:bg-secondary/80"
            aria-label="Close chat"
          >
            <X size={18} />
          </button>
        </div>
      </div>
      
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map((msg) => (
            <div 
              key={msg.id}
              className={`${
                msg.sender === 'user' 
                  ? 'ml-auto bg-primary text-primary-foreground' 
                  : 'mr-auto bg-secondary text-secondary-foreground'
              } rounded-lg p-3 max-w-[85%] animate-slide-up`}
            >
              <div className="text-sm">{msg.content}</div>
              <div className="text-xs opacity-70 mt-1">
                {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>
      
      <div className="p-4 border-t border-border/40 bg-background/80">
        <div className="flex space-x-2">
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your message..."
            className="flex-1 min-h-[60px] max-h-[120px] p-2 rounded-md border border-border bg-background resize-none focus:outline-none focus:ring-1 focus:ring-primary"
          />
          
          {isMicSupported && (
            <Button 
              variant="outline" 
              size="icon" 
              className={`self-end ${isRecording ? 'bg-red-500 text-white hover:bg-red-600' : ''}`}
              onClick={startRecording}
              disabled={isRecording}
            >
              <Mic size={18} />
            </Button>
          )}
          
          <Button
            onClick={handleSendMessage}
            disabled={message.trim() === ''}
            className="self-end"
          >
            <Send size={18} />
          </Button>
        </div>
      </div>
      
      {/* Voice Recording Dialog */}
      <Dialog open={isRecordingDialogOpen} onOpenChange={setIsRecordingDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Voice Recording</DialogTitle>
          </DialogHeader>
          <div className="py-4 flex flex-col items-center">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${isRecording ? 'animate-pulse bg-red-100' : ''}`}>
              <Mic size={36} className="text-red-500" />
            </div>
            <p className="text-center">
              {isProcessingVoice ? 'Processing your voice...' : 'Speak now. Click Finish when done.'}
            </p>
          </div>
          <DialogFooter>
            <Button variant="secondary" onClick={cancelRecording} disabled={isProcessingVoice}>
              Cancel
            </Button>
            <Button onClick={finishRecording} disabled={isProcessingVoice}>
              {isProcessingVoice ? 'Processing...' : 'Finish'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </aside>
  );
};

export default ChatSidebar;
