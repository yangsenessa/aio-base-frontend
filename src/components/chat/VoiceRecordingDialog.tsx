
import { useEffect, useRef, useState } from 'react';
import { Play, Pause, StopCircle, Server, Mic } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '../ui/dialog';
import { Button } from '../ui/button';
import { Slider } from '../ui/slider';
import { getAudioUrl } from '@/services/speechService';

interface VoiceRecordingDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  isRecording: boolean;
  isProcessingVoice: boolean;
  recordingCompleted: boolean;
  onFinish: () => void;
  onCancel: () => void;
}

const VoiceRecordingDialog = ({
  isOpen,
  onOpenChange,
  isRecording,
  isProcessingVoice,
  recordingCompleted,
  onFinish,
  onCancel
}: VoiceRecordingDialogProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioProgress, setAudioProgress] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
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
  
  const togglePlayback = () => {
    const audioElement = audioRef.current;
    if (!audioElement) return;
    
    if (isPlaying) {
      audioElement.pause();
    } else {
      audioElement.play().catch(error => {
        console.error("Error playing audio:", error);
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
  
  // Create dialog title based on current state
  const dialogTitle = isRecording 
    ? "Recording in progress" 
    : recordingCompleted 
      ? "Recording completed" 
      : isProcessingVoice 
        ? "Processing with EMC Network" 
        : "Ready";
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open && !isProcessingVoice) onCancel();
      onOpenChange(open);
    }}>
      <DialogContent className="sm:max-w-[425px] bg-[#0F172A] border-none text-white">
        <DialogTitle className="text-lg font-medium">
          {dialogTitle}
        </DialogTitle>
        
        <DialogDescription className="text-white/80">
          {isProcessingVoice 
            ? 'Transcribing your voice using EMC Network AI...' 
            : isRecording 
              ? 'Speak now and click Finish when done.' 
              : recordingCompleted 
                ? 'Listen to your recording before sending' 
                : 'Preparing audio playback...'}
        </DialogDescription>
        
        {isRecording && (
          <div className="flex items-center justify-center space-x-3 mt-4">
            <Mic size={24} className="text-red-500 animate-pulse" />
            <div className="flex space-x-2">
              <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
              <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
              <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
            </div>
          </div>
        )}
        
        {isProcessingVoice && (
          <div className="flex flex-col items-center justify-center mt-4 space-y-3">
            <Server size={24} className="text-primary animate-pulse" />
            <div className="text-center">
              <p className="font-medium">Connecting to EMC Network</p>
              <p className="text-sm text-white/70 mt-1">Converting speech to text...</p>
            </div>
            <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden mt-2">
              <div className="h-full bg-primary animate-pulse rounded-full" style={{width: '60%'}}></div>
            </div>
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
              onClick={onFinish}
              className="bg-primary hover:bg-primary/90 text-white"
              disabled={isProcessingVoice}
            >
              {isRecording ? 'Finish Recording' : recordingCompleted ? 'Send' : 'Processing...'}
            </Button>
          </div>
        )}
        
        {isProcessingVoice && (
          <div className="flex justify-center mt-4">
            <div className="text-sm text-white/80">
              Using EMC Network AI to transcribe your voice message...
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default VoiceRecordingDialog;
