
import { useEffect, useState } from 'react';
import { Play, Pause } from 'lucide-react';
import { Button } from '../ui/button';
import { toast } from '../ui/use-toast';
import { hasMessageAudio, getMessageAudioUrl } from '@/services/speechService';

interface MessageAudioPlayerProps {
  messageId: string;
  audioProgress?: number;
  isPlaying?: boolean;
  onPlaybackChange: (messageId: string, audioElement: HTMLAudioElement | null) => void;
}

const MessageAudioPlayer = ({ 
  messageId, 
  audioProgress = 0, 
  isPlaying = false,
  onPlaybackChange
}: MessageAudioPlayerProps) => {
  // Check if audio exists for this message
  if (!hasMessageAudio(messageId)) {
    return null;
  }
  
  const handleTogglePlayback = () => {
    onPlaybackChange(messageId, null);
  };
  
  return (
    <div className="mt-2 flex items-center space-x-2">
      <Button 
        variant="ghost" 
        size="icon" 
        className="h-6 w-6 p-0 bg-white/20 hover:bg-white/30 rounded-full"
        onClick={handleTogglePlayback}
        aria-label={isPlaying ? "Pause voice message" : "Play voice message"}
      >
        {isPlaying ? <Pause size={12} /> : <Play size={12} />}
      </Button>
      
      <div className="h-1 flex-grow bg-white/20 rounded-full overflow-hidden">
        <div 
          className="h-full bg-white/60 transition-all duration-100"
          style={{ width: `${audioProgress || 0}%` }}
        ></div>
      </div>
    </div>
  );
};

export default MessageAudioPlayer;
