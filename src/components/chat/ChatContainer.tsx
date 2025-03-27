
import { useState } from 'react';
import { Maximize2, Minimize2, X } from 'lucide-react';
import AIOLogo from '../AIOLogo';
import ChatMessages from './ChatMessages';
import ChatInput from './ChatInput';
import VoiceRecordingDialog from './VoiceRecordingDialog';
import { useChat } from '@/hooks/useChat';
import { useVoiceRecording } from '@/hooks/useVoiceRecording';
import { useFileAttachments } from '@/hooks/useFileAttachments';

const ChatContainer = () => {
  const [isExpanded, setIsExpanded] = useState(true);
  
  const { 
    message, 
    setMessage, 
    messages, 
    setMessages, 
    handleSendMessage 
  } = useChat();
  
  const {
    isRecording,
    isMicSupported,
    isRecordingDialogOpen,
    setIsRecordingDialogOpen,
    isProcessingVoice,
    recordingCompleted,
    startRecording,
    finishRecording,
    cancelRecording
  } = useVoiceRecording();
  
  const {
    attachedFiles,
    handleFileAttached,
    handleFileRemoved,
    clearAttachedFiles,
    updateMessagesWithFilePreview,
    removeFilePreviewFromMessages
  } = useFileAttachments();

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  const onSendMessage = async () => {
    if (message.trim() === '' && attachedFiles.length === 0) return;
    
    const currentMessage = message;
    const currentFiles = [...attachedFiles];
    
    setMessage('');
    clearAttachedFiles();
    
    await handleSendMessage(currentMessage, currentFiles);
  };
  
  const onFileAttached = (fileId: string, fileInfo: AttachedFile) => {
    const newFiles = handleFileAttached(fileId, fileInfo);
    const updatedMessages = updateMessagesWithFilePreview(messages, newFiles);
    setMessages(updatedMessages);
  };
  
  const onFileRemoved = (fileId: string) => {
    const updatedFiles = handleFileRemoved(fileId);
    const updatedMessages = removeFilePreviewFromMessages(messages, updatedFiles);
    setMessages(updatedMessages);
  };
  
  const onFinishRecording = async () => {
    const newMessages = await finishRecording();
    if (newMessages) {
      setMessages(prev => [...prev, ...newMessages]);
    }
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
        onSendMessage={onSendMessage}
        onStartRecording={startRecording}
        isMicSupported={isMicSupported}
        attachedFiles={attachedFiles}
        onFileAttached={onFileAttached}
        onFileRemoved={onFileRemoved}
      />
      
      <VoiceRecordingDialog 
        isOpen={isRecordingDialogOpen}
        onOpenChange={setIsRecordingDialogOpen}
        isRecording={isRecording}
        isProcessingVoice={isProcessingVoice}
        recordingCompleted={recordingCompleted}
        onFinish={onFinishRecording}
        onCancel={cancelRecording}
      />
    </aside>
  );
};

export default ChatContainer;
