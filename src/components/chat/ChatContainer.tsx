
import { useState } from 'react';
import { Maximize2, Minimize2, X } from 'lucide-react';
import AIOLogo from '../AIOLogo';
import ChatMessages from './ChatMessages';
import ChatInput from './ChatInput';
import VoiceRecordingDialog from './VoiceRecordingDialog';
import { useChat } from '@/hooks/useChat';
import { useVoiceRecording } from '@/hooks/useVoiceRecording';
import { useFileAttachments } from '@/hooks/useFileAttachments';
import { AttachedFile } from '@/components/chat/ChatFileUploader';

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
    <div className="flex flex-col h-full">
      <div className="p-2 border-b border-border/40 flex justify-between items-center">
        <AIOLogo size="sm" variant="sidebar" />
        <div className="flex space-x-2">
          <button 
            onClick={toggleExpand}
            className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded-md hover:bg-secondary/80"
            aria-label="Minimize chat"
          >
            <Minimize2 size={16} />
          </button>
          <button 
            onClick={toggleExpand}
            className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded-md hover:bg-secondary/80"
            aria-label="Close chat"
          >
            <X size={16} />
          </button>
        </div>
      </div>
      
      <div className="flex-1 overflow-hidden flex flex-col">
        <ChatMessages 
          messages={messages} 
          setMessages={setMessages} 
        />
        
        <div className="mt-auto">
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
        </div>
      </div>
      
      <VoiceRecordingDialog 
        isOpen={isRecordingDialogOpen}
        onOpenChange={setIsRecordingDialogOpen}
        isRecording={isRecording}
        isProcessingVoice={isProcessingVoice}
        recordingCompleted={recordingCompleted}
        onFinish={onFinishRecording}
        onCancel={cancelRecording}
      />
    </div>
  );
};

export default ChatContainer;
