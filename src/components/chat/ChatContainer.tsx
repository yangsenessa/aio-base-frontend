
import { useState } from 'react';
import { Maximize2, Minimize2, X } from 'lucide-react';
import AIOLogo from '../AIOLogo';
import ChatMessages from './ChatMessages';
import ChatInput from './ChatInput';
import VoiceRecordingDialog from './VoiceRecordingDialog';
import { AIMessage, getInitialMessage, sendMessage, processVoiceData } from '@/services/aiAgentService';
import { AttachedFile } from './ChatFileUploader';
import { toast } from '../ui/use-toast';
import { 
  startVoiceRecording, 
  stopVoiceRecording, 
  isVoiceRecordingSupported, 
  requestMicrophonePermission,
  setupMediaRecorder,
  getAudioUrl,
  hasAudioData,
  cleanupAudioResources
} from '@/services/speechService';

const ChatContainer = () => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<AIMessage[]>([getInitialMessage()]);
  const [isRecording, setIsRecording] = useState(false);
  const [isMicSupported, setIsMicSupported] = useState(false);
  const [hasMicPermission, setHasMicPermission] = useState(false);
  const [isRecordingDialogOpen, setIsRecordingDialogOpen] = useState(false);
  const [isProcessingVoice, setIsProcessingVoice] = useState(false);
  const [recordingCompleted, setRecordingCompleted] = useState(false);
  const [attachedFiles, setAttachedFiles] = useState<AttachedFile[]>([]);
  
  // Check microphone support on component mount
  useState(() => {
    setIsMicSupported(isVoiceRecordingSupported());
    
    return () => {
      cleanupAudioResources();
    };
  });

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
    
    toast({
      title: "Recording cancelled",
      description: "Voice recording has been cancelled",
    });
  };

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
      
      <ChatMessages 
        messages={messages} 
        setMessages={setMessages} 
      />
      
      <ChatInput 
        message={message}
        setMessage={setMessage}
        onSendMessage={handleSendMessage}
        onStartRecording={startRecording}
        isMicSupported={isMicSupported}
        attachedFiles={attachedFiles}
        onFileAttached={handleFileAttached}
        onFileRemoved={handleFileRemoved}
      />
      
      <VoiceRecordingDialog 
        isOpen={isRecordingDialogOpen}
        onOpenChange={setIsRecordingDialogOpen}
        isRecording={isRecording}
        isProcessingVoice={isProcessingVoice}
        recordingCompleted={recordingCompleted}
        onFinish={finishRecording}
        onCancel={cancelRecording}
      />
    </aside>
  );
};

export default ChatContainer;
