import { useState, useRef, useEffect } from 'react';
import { Send, X, Maximize2, Minimize2, Mic, MicOff, StopCircle, Play, Pause, Paperclip } from 'lucide-react';
import { ScrollArea } from './ui/scroll-area';
import { Button } from './ui/button';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from './ui/dialog';
import { toast } from './ui/use-toast';
import { Slider } from './ui/slider';
import AIOLogo from './AIOLogo';
import ChatFileUploader, { AttachedFile } from './chat/ChatFileUploader';
import FilePreview from './chat/FilePreview';
import { 
  startVoiceRecording, 
  stopVoiceRecording, 
  isVoiceRecordingActive,
  isVoiceRecordingSupported, 
  requestMicrophonePermission,
  setupMediaRecorder,
  getAudioUrl,
  getMessageAudioUrl,
  cleanupAudioResources,
  hasAudioData,
  hasMessageAudio
} from '@/services/speechService';
import {
  AIMessage,
  processVoiceData,
  sendMessage,
  getInitialMessage
} from '@/services/aiAgentService';

const ChatSidebar = () => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<AIMessage[]>([getInitialMessage()]);
  const [isRecording, setIsRecording] = useState(false);
  const [isMicSupported, setIsMicSupported] = useState(false);
  const [hasMicPermission, setHasMicPermission] = useState(false);
  const [isRecordingDialogOpen, setIsRecordingDialogOpen] = useState(false);
  const [isProcessingVoice, setIsProcessingVoice] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioProgress, setAudioProgress] = useState(0);
  const [recordingCompleted, setRecordingCompleted] = useState(false);
  const [attachedFiles, setAttachedFiles] = useState<AttachedFile[]>([]);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const messageAudioRefs = useRef<Map<string, HTMLAudioElement>>(new Map());

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

  const handleSendMessage = async () => {
    if (message.trim() === '' && attachedFiles.length === 0) return;

    let messageContent = message.trim();
    
    if (attachedFiles.length > 0) {
      const fileNames = attachedFiles.map(file => file.name).join(', ');
      
      if (messageContent) {
        messageContent += `\n\nAttached files: ${fileNames}`;
      } else {
        messageContent = `[Attached files: ${fileNames}]`;
      }
    }

    const userMsg: AIMessage = {
      id: Date.now().toString(),
      sender: 'user',
      content: messageContent,
      timestamp: new Date(),
      attachedFiles: attachedFiles.length > 0 ? [...attachedFiles] : undefined
    };

    setMessages((prev) => [...prev, userMsg]);
    const currentMessage = messageContent;
    const currentFiles = [...attachedFiles];
    setMessage('');
    setAttachedFiles([]);

    try {
      const aiResponse = await sendMessage(currentMessage, currentFiles);
      setMessages((prev) => [...prev, aiResponse]);
    } catch (error) {
      console.error("Error sending message:", error);
      toast({
        title: "Error",
        description: "Failed to get response from AI",
        variant: "destructive"
      });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleFileAttached = (fileId: string, fileInfo: AttachedFile) => {
    const newFiles = [...attachedFiles, fileInfo];
    setAttachedFiles(newFiles);
    
    toast({
      title: "File attached",
      description: `${fileInfo.name} has been attached to your message.`,
    });
    
    if (newFiles.length === 1) { // Only show response for the first file upload
      const aiResponse: AIMessage = {
        id: `file-preview-${Date.now()}`,
        sender: 'ai',
        content: "I've received your file. Here's what you uploaded:",
        timestamp: new Date(),
        referencedFiles: newFiles
      };
      
      setMessages(prev => [...prev, aiResponse]);
    } else {
      // Update the latest AI message that has referencedFiles with the new files
      setMessages(prev => {
        const updatedMessages = [...prev];
        const lastAiMessageIndex = updatedMessages.findIndex(msg => 
          msg.sender === 'ai' && msg.referencedFiles && msg.referencedFiles.length > 0
        );
        
        if (lastAiMessageIndex !== -1) {
          updatedMessages[lastAiMessageIndex] = {
            ...updatedMessages[lastAiMessageIndex],
            referencedFiles: newFiles,
            content: "I've received your files. Here's what you uploaded:"
          };
        } else {
          // If no existing AI message with files, create a new one
          updatedMessages.push({
            id: `file-preview-${Date.now()}`,
            sender: 'ai',
            content: "I've received your files. Here's what you uploaded:",
            timestamp: new Date(),
            referencedFiles: newFiles
          });
        }
        return updatedMessages;
      });
    }
  };
  
  const handleFileRemoved = (fileId: string) => {
    const updatedFiles = attachedFiles.filter(file => file.id !== fileId);
    setAttachedFiles(updatedFiles);
    
    // Update the AI response to reflect removed files
    setMessages(prev => {
      const updatedMessages = [...prev];
      const lastAiMessageIndex = updatedMessages.findIndex(msg => 
        msg.sender === 'ai' && msg.referencedFiles && msg.referencedFiles.length > 0
      );
      
      if (lastAiMessageIndex !== -1) {
        if (updatedFiles.length === 0) {
          // Remove the AI message if no files left
          updatedMessages.splice(lastAiMessageIndex, 1);
        } else {
          // Update the AI message with remaining files
          updatedMessages[lastAiMessageIndex] = {
            ...updatedMessages[lastAiMessageIndex],
            referencedFiles: updatedFiles,
          };
        }
      }
      
      return updatedMessages;
    });
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
        console.log("Stopping voice recording...");
        await stopVoiceRecording();
        
        if (hasAudioData()) {
          const audioBlob = await fetch(getAudioUrl() || '').then(r => r.blob());
          const { response, messageId } = await processVoiceData(audioBlob);
          
          setRecordingCompleted(true);
          
          setTimeout(() => {
            if (hasAudioData() && audioRef.current) {
              const audioUrl = getAudioUrl();
              console.log("Setting audio URL for preview:", audioUrl);
              audioRef.current.src = audioUrl || '';
              audioRef.current.load();
            }
          }, 300);
          
          const userMessage: AIMessage = {
            id: messageId,
            sender: 'user',
            content: "[Voice message]",
            timestamp: new Date(),
            isVoiceMessage: true,
            audioProgress: 0,
            isPlaying: false
          };
          
          const aiMessage: AIMessage = {
            id: (Date.now() + 1).toString(),
            sender: 'ai',
            content: response,
            timestamp: new Date(),
          };
          
          console.log("Adding voice message with ID:", messageId);
          setMessages(prev => [...prev, userMessage, aiMessage]);
        } else {
          throw new Error("No audio data available");
        }
        
        setIsProcessingVoice(false);
        setIsRecordingDialogOpen(false);
        
      } catch (error) {
        console.error("Error processing voice:", error);
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
  
  const toggleMessagePlayback = (messageId: string) => {
    console.log(`Toggling playback for message: ${messageId}`);
    
    if (!hasMessageAudio(messageId)) {
      console.error(`No audio found for message ID: ${messageId}`);
      toast({
        title: "Audio not available",
        description: "The audio for this message is not available",
        variant: "destructive"
      });
      return;
    }
    
    setMessages(prev => 
      prev.map(msg => {
        if (msg.isPlaying && msg.id !== messageId) {
          const audioElement = messageAudioRefs.current.get(msg.id);
          if (audioElement) {
            console.log(`Stopping playback of message: ${msg.id}`);
            audioElement.pause();
          }
          return { ...msg, isPlaying: false };
        }
        
        if (msg.id === messageId) {
          if (!messageAudioRefs.current.has(messageId)) {
            console.log(`Creating new audio element for message: ${messageId}`);
            const audioUrl = getMessageAudioUrl(messageId);
            console.log(`Audio URL for message ${messageId}:`, audioUrl);
            
            if (audioUrl) {
              const newAudio = new Audio(audioUrl);
              messageAudioRefs.current.set(messageId, newAudio);
              
              newAudio.addEventListener('timeupdate', () => {
                updateMessageAudioProgress(messageId, newAudio);
              });
              
              newAudio.addEventListener('ended', () => {
                console.log(`Playback ended for message: ${messageId}`);
                setMessages(prevMsgs => 
                  prevMsgs.map(m => 
                    m.id === messageId 
                      ? { ...m, isPlaying: false, audioProgress: 0 } 
                      : m
                  )
                );
              });
              
              newAudio.addEventListener('error', (e) => {
                console.error(`Audio error for message ${messageId}:`, e);
                toast({
                  title: "Audio playback error",
                  description: "There was an error playing the voice message",
                  variant: "destructive"
                });
              });
            }
          }
          
          const audio = messageAudioRefs.current.get(messageId);
          if (audio) {
            if (msg.isPlaying) {
              console.log(`Pausing message: ${messageId}`);
              audio.pause();
            } else {
              console.log(`Playing message: ${messageId}`);
              audio.play().catch(error => {
                console.error(`Error playing message audio ${messageId}:`, error);
                toast({
                  title: "Playback error",
                  description: "Could not play the voice message",
                  variant: "destructive"
                });
              });
            }
            return { ...msg, isPlaying: !msg.isPlaying };
          }
        }
        return msg;
      })
    );
  };
  
  const updateMessageAudioProgress = (messageId: string, audioElement: HTMLAudioElement) => {
    const progress = (audioElement.currentTime / audioElement.duration) * 100;
    
    setMessages(prev => 
      prev.map(msg => 
        msg.id === messageId 
          ? { ...msg, audioProgress: progress } 
          : msg
      )
    );
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
              
              {msg.isVoiceMessage && (
                <div className="mt-2 flex items-center space-x-2">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-6 w-6 p-0 bg-white/20 hover:bg-white/30 rounded-full"
                    onClick={() => toggleMessagePlayback(msg.id)}
                    aria-label={msg.isPlaying ? "Pause voice message" : "Play voice message"}
                  >
                    {msg.isPlaying ? <Pause size={12} /> : <Play size={12} />}
                  </Button>
                  
                  <div className="h-1 flex-grow bg-white/20 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-white/60 transition-all duration-100"
                      style={{ width: `${msg.audioProgress || 0}%` }}
                    ></div>
                  </div>
                </div>
              )}
              
              {msg.attachedFiles && msg.attachedFiles.length > 0 && (
                <div className="mt-2 space-y-2">
                  {msg.attachedFiles.map(file => (
                    <FilePreview 
                      key={file.id} 
                      file={file} 
                      compact={true}
                      inMessage={true}
                    />
                  ))}
                </div>
              )}
              
              {msg.sender === 'ai' && msg.referencedFiles && msg.referencedFiles.length > 0 && (
                <div className="mt-4 space-y-3 pt-2 border-t border-white/10">
                  <div className="text-xs opacity-70">Files referenced:</div>
                  <div className="grid grid-cols-1 gap-2">
                    {msg.referencedFiles.map(file => (
                      <FilePreview 
                        key={file.id} 
                        file={file} 
                        inAIResponse={true}
                      />
                    ))}
                  </div>
                </div>
              )}
              
              <div className="text-xs opacity-70 mt-1">
                {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>
      
      <div className="p-4 border-t border-border/40 bg-background/80">
        <div className="flex flex-col space-y-2">
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your message..."
            className="w-full min-h-[60px] max-h-[120px] p-2 rounded-md border border-border bg-background resize-none focus:outline-none focus:ring-1 focus:ring-primary"
          />
          
          <div className="flex items-center justify-between">
            <div className="flex">
              <ChatFileUploader 
                onFileAttached={handleFileAttached}
                onFileRemoved={handleFileRemoved}
                attachedFiles={attachedFiles}
              />
              
              {isMicSupported && (
                <Button 
                  variant="outline" 
                  size="icon" 
                  className={`${isRecording ? 'bg-red-500 text-white hover:bg-red-600' : ''}`}
                  onClick={startRecording}
                  disabled={isRecording}
                >
                  <Mic size={18} />
                </Button>
              )}
            </div>
            
            <Button
              onClick={handleSendMessage}
              disabled={(message.trim() === '' && attachedFiles.length === 0)}
            >
              <Send size={18} />
            </Button>
          </div>
        </div>
      </div>
      
      <Dialog open={isRecordingDialogOpen} onOpenChange={(open) => {
        if (!open && !isProcessingVoice) cancelRecording();
        setIsRecordingDialogOpen(open);
      }}>
        <DialogContent className="sm:max-w-[425px] bg-[#0F172A] border-none text-white">
          <DialogTitle className="text-lg font-medium">
            {isRecording ? "Recording in progress" : recordingCompleted ? "Recording completed" : "Processing..."}
          </DialogTitle>
          
          <DialogDescription className="text-white/80">
            {isProcessingVoice 
              ? 'Processing your voice...' 
              : isRecording 
                ? 'Speak now and click Finish when done.' 
                : recordingCompleted 
                  ? 'Listen to your recording before sending' 
                  : 'Preparing audio playback...'}
          </DialogDescription>
          
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
