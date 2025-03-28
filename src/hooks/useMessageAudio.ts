
import { useRef } from 'react';
import { AIMessage } from '@/services/types/aiTypes';
import { getMessageAudioUrl } from '@/services/speechService';
import { toast } from '@/components/ui/use-toast';

export function useMessageAudio(
  messages: AIMessage[], 
  setMessages: React.Dispatch<React.SetStateAction<AIMessage[]>>
) {
  const messageAudioRefs = useRef<Map<string, HTMLAudioElement>>(new Map());
  
  const toggleMessagePlayback = (messageId: string) => {
    console.log(`Toggling playback for message: ${messageId}`);
    
    setMessages(prev => 
      prev.map(msg => {
        // Stop any other playing messages
        if (msg.isPlaying && msg.id !== messageId) {
          const audioElement = messageAudioRefs.current.get(msg.id);
          if (audioElement) {
            console.log(`Stopping playback of message: ${msg.id}`);
            audioElement.pause();
          }
          return { ...msg, isPlaying: false };
        }
        
        // Handle the target message
        if (msg.id === messageId) {
          // Create an audio element if it doesn't exist
          if (!messageAudioRefs.current.has(messageId)) {
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
          
          // Toggle playback
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

  return { toggleMessagePlayback };
}
