import { useState, useRef, useEffect } from 'react';
import { Send, X, Maximize2, Minimize2, Mic, MicOff, StopCircle, Play, Pause } from 'lucide-react';
import { ScrollArea } from './ui/scroll-area';
import { Button } from './ui/button';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
import { toast } from './ui/use-toast';
import { Slider } from './ui/slider';
import AIOLogo from './AIOLogo';
import { 
  startVoiceRecording, 
  stopVoiceRecording, 
  isVoiceRecordingActive,
  isVoiceRecordingSupported, 
  requestMicrophonePermission,
  setupMediaRecorder,
  getAudioUrl,
  cleanupAudioResources,
  hasAudioData
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
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioProgress, setAudioProgress] = useState(0);
  const [recordingCompleted, setRecordingCompleted] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    setIsMicSupported(isVoiceRecordingSupported());
    
    return () => {
      cleanupAudioResources();
    };
  }, []);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.addEventListener('timeupdate', updateAudioProgress);
      audioRef.current.addEventListener('ended', () => {
        setIsPlaying(false);
        setAudioProgress(0);
      });
      
      return () => {
        if (audioRef.current) {
          audioRef.current.removeEventListener('timeupdate', updateAudioProgress);
          audioRef.current.removeEventListener('ended', () => {
            setIsPlaying(false);
            setAudioProgress(0);
          });
        }
      };
    }
  }, [audioRef.current]);

  const updateAudioProgress = () => {
    if (audioRef.current) {
      const progress = (audioRef.current.currentTime / audioRef.current.duration) * 100;
      setAudioProgress(progress);
    }
  };

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
    
    await setupMediaRecorder();
    const started = await startVoiceRecording();
    
    if (started) {
      setIsRecording(true);
      setIsRecordingDialogOpen(true);
      setRecordingCompleted(false);
      setIsPlaying(false);
      setAudioProgress(0);
      
      toast({
        title: "Recording started",
        description: "Speak now and click Finish when done.",
      });
    } else {
      toast({
        title: "Recording failed",
        description: "Could not start recording. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  const finishRecording = async () => {
    if (isRecording) {
      setIsProcessingVoice(true);
      setIsRecording(false);
      
      try {
        const aiResponse = await stopVoiceRecording();
        setRecordingCompleted(true);
        
        setTimeout(() => {
          if (hasAudioData() && audioRef.current) {
            audioRef.current.src = getAudioUrl() || '';
            audioRef.current.load();
          }
        }, 300);
        
        const userMessage: Message = {
          id: Date.now().toString(),
          sender: 'user',
          content: "[Voice input]",
          timestamp: new Date(),
        };
        
        const aiMessage: Message = {
          id: (Date.now() + 1).toString(),
          sender: 'ai',
          content: aiResponse,
          timestamp: new Date(),
        };
        
        setMessages(prev => [...prev, userMessage, aiMessage]);
        setIsProcessingVoice(false);
        setIsRecordingDialogOpen(false);
        
      } catch (error) {
        toast({
          title: "Error processing voice",
          description: "There was an error processing your voice recording",
          variant: "destructive"
        });
        setIsProcessingVoice(false);
      }
    } else if (recordingCompleted) {
      setIsRecordingDialogOpen(false);
    }
  };

  const cancelRecording = () => {
    stopVoiceRecording().catch(console.error);
    setIsRecording(false);
    setRecordingCompleted(false);
    setIsRecordingDialogOpen(false);
    setIsPlaying(false);
    setAudioProgress(0);
    
    toast({
      title: "Recording cancelled",
      description: "Voice recording has been cancelled",
    });
  };

  const togglePlayback = () => {
    const audioElement = audioRef.current;
    if (!audioElement) return;
    
    if (isPlaying) {
      audioElement.pause();
    } else {
      audioElement.play().catch(error => {
        console.error("Error playing audio:", error);
        toast({
          title: "Playback error",
          description: "Could not play the audio recording",
          variant: "destructive"
        });
      });
    }
    setIsPlaying(!isPlaying);
  };
  
  const handleAudioProgressChange = (value: number[]) => {
    const audioElement = audioRef.current;
    if (!audioElement) return;
    
    const newProgress = value[0];
    setAudioProgress(newProgress);
    
    const newTime = (newProgress / 100) * audioElement.duration;
    audioElement.currentTime = newTime;
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
      
      <Dialog open={isRecordingDialogOpen} onOpenChange={(open) => {
        if (!open && !isProcessingVoice) cancelRecording();
        setIsRecordingDialogOpen(open);
      }}>
        <DialogContent className="sm:max-w-[425px] bg-[#0F172A] border-none text-white">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-medium">
              {isRecording ? "Recording in progress" : recordingCompleted ? "Recording completed" : "Processing..."}
            </h2>
            <Button 
              variant="ghost" 
              size="icon" 
              className="text-white/70 hover:text-white hover:bg-transparent"
              onClick={cancelRecording}
              disabled={isProcessingVoice}
            >
              <X size={18} />
            </Button>
          </div>
          
          <div className="py-3">
            <p className="text-center text-white/80">
              {isProcessingVoice 
                ? 'Processing your voice...' 
                : isRecording 
                  ? 'Speak now and click Finish when done.' 
                  : recordingCompleted 
                    ? 'Listen to your recording before sending' 
                    : 'Preparing audio playback...'}
            </p>
          </div>
          
          {isRecording && (
            <div className="flex justify-center space-x-2 mt-4">
              <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
              <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
              <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
            </div>
          )}
          
          {recordingCompleted && getAudioUrl() && (
            <div className="space-y-4 mt-3 p-3 bg-[#172A46] rounded-md">
              <div className="flex items-center space-x-4">
                <Button 
                  onClick={togglePlayback}
                  size="icon"
                  variant="ghost" 
                  className="text-white bg-primary/20 hover:bg-primary/30"
                >
                  {isPlaying ? <Pause size={18} /> : <Play size={18} />}
                </Button>
                <div className="flex-1">
                  <Slider 
                    value={[audioProgress]} 
                    max={100} 
                    step={1}
                    onValueChange={handleAudioProgressChange}
                    className="w-full"
                  />
                </div>
              </div>
              <audio 
                ref={audioRef} 
                src={getAudioUrl() || undefined} 
                className="hidden" 
                onEnded={() => setIsPlaying(false)}
              />
            </div>
          )}
          
          {!isProcessingVoice && (
            <div className="flex justify-center mt-4">
              <Button 
                onClick={finishRecording}
                className="bg-primary hover:bg-primary/90 text-white"
                disabled={isProcessingVoice}
              >
                {isRecording ? 'Finish Recording' : recordingCompleted ? 'Send' : 'Processing...'}
              </Button>
            </div>
          )}
          
          {isProcessingVoice && (
            <div className="flex justify-center mt-4">
              <div className="animate-pulse">Processing...</div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </aside>
  );
};

export default ChatSidebar;
