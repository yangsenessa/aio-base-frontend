import { createContext, useContext, useState, ReactNode } from 'react';
import { AIMessage, getInitialMessage, sendMessage, createDirectMessage } from '@/services/types/aiTypes';
import { AttachedFile } from '@/components/chat/ChatFileUploader';
import { toast } from '@/components/ui/use-toast';
import QueenLogo from '@/components/QueenLogo';

interface ChatContextType {
  message: string;
  setMessage: (message: string) => void;
  messages: AIMessage[];
  setMessages: React.Dispatch<React.SetStateAction<AIMessage[]>>;
  handleSendMessage: (currentMessage: string, currentFiles: AttachedFile[]) => Promise<void>;
  addDirectMessage: (content: string, attachedFiles?: AttachedFile[]) => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: ReactNode }) {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<AIMessage[]>([getInitialMessage()]);

  const handleSendMessage = async (
    currentMessage: string, 
    currentFiles: AttachedFile[]
  ): Promise<void> => {
    if (currentMessage.trim() === '' && currentFiles.length === 0) return;

    let messageContent = currentMessage.trim();
    
    if (currentFiles.length > 0) {
      const fileNames = currentFiles.map(file => file.name).join(', ');
      
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
      attachedFiles: currentFiles.length > 0 ? [...currentFiles] : undefined
    };

    setMessages((prev) => [...prev, userMsg]);

    try {
      const aiResponse = await sendMessage(messageContent, currentFiles);
      console.log('[ChatContext] AI response:', aiResponse);
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

  // Add a direct message to the chat without LLM processing
  const addDirectMessage = (content: string, attachedFiles?: AttachedFile[]): void => {
    console.log('[ChatContext] Adding direct message:', content);
    const directMessage = createDirectMessage(content, attachedFiles);
    setMessages((prev) => {
      console.log('[ChatContext] Previous messages count:', prev.length);
      const updated = [...prev, directMessage];
      console.log('[ChatContext] Updated messages count:', updated.length);
      return updated;
    });
  };

  return (
    <ChatContext.Provider 
      value={{ 
        message, 
        setMessage, 
        messages, 
        setMessages, 
        handleSendMessage,
        addDirectMessage
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const context = useContext(ChatContext);
  
  if (context === undefined) {
    console.error('useChat must be used within a ChatProvider');
    throw new Error('useChat must be used within a ChatProvider');
  }
  
  return context;
}
