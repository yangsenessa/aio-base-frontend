
import { useState } from 'react';
import { AIMessage, getInitialMessage, sendMessage, createDirectMessage } from '@/services/types/aiTypes';
import { AttachedFile } from '@/components/chat/ChatFileUploader';
import { toast } from '@/components/ui/use-toast';

export function useChat() {
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

  // Add a new function to add a system/direct message to the chat
  const addDirectMessage = (content: string, attachedFiles?: AttachedFile[]): void => {
    const directMessage = createDirectMessage(content, attachedFiles);
    setMessages((prev) => [...prev, directMessage]);
  };

  return {
    message,
    setMessage,
    messages,
    setMessages,
    handleSendMessage,
    addDirectMessage
  };
}
