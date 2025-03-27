
import { useEffect, useRef, useState } from 'react';
import { ScrollArea } from '../ui/scroll-area';
import { AIMessage } from '@/services/types/aiTypes';
import { Play, Pause } from 'lucide-react';
import { Button } from '../ui/button';
import FilePreview from './FilePreview';
import { toast } from '../ui/use-toast';
import { hasMessageAudio, getMessageAudioUrl } from '@/services/speechService';

interface ChatMessagesProps {
  messages: AIMessage[];
  setMessages: React.Dispatch<React.SetStateAction<AIMessage[]>>;
}

const ChatMessages = ({ messages, setMessages }: ChatMessagesProps) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messageAudioRefs = useRef<Map<string, HTMLAudioElement>>(new Map());
  
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
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

  return (
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
  );
};

export default ChatMessages;
