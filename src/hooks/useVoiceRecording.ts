
import { useState, useEffect } from 'react';
import { AIMessage } from '@/services/types/aiTypes';
import { 
  startVoiceRecording, 
  stopVoiceRecording, 
  isVoiceRecordingSupported, 
  requestMicrophonePermission,
  setupMediaRecorder,
  hasAudioData,
  getAudioUrl,
  cleanupAudioResources
} from '@/services/speechService';
import { processVoiceData } from '@/services/ai/voiceAIService';
import { toast } from '@/components/ui/use-toast';

export function useVoiceRecording() {
  const [isRecording, setIsRecording] = useState(false);
  const [isMicSupported, setIsMicSupported] = useState(false);
  const [hasMicPermission, setHasMicPermission] = useState(false);
  const [isRecordingDialogOpen, setIsRecordingDialogOpen] = useState(false);
  const [isProcessingVoice, setIsProcessingVoice] = useState(false);
  const [recordingCompleted, setRecordingCompleted] = useState(false);
  
  useEffect(() => {
    setIsMicSupported(isVoiceRecordingSupported());
    
    return () => {
      cleanupAudioResources();
    };
  }, []);

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
    
    console.log("Starting voice recording...");
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
  
  const finishRecording = async (): Promise<AIMessage[] | null> => {
    if (isRecording) {
      setIsProcessingVoice(true);
      setIsRecording(false);
      
      try {
        console.log("Stopping voice recording...");
        
        try {
          await stopVoiceRecording();
        } catch (stopError) {
          console.error("Error stopping recording:", stopError);
          throw new Error("Failed to stop recording: " + stopError);
        }
        
        // Verify we have data
        if (!hasAudioData()) {
          console.error("No audio data available after recording");
          throw new Error("No audio data was captured during recording");
        }
        
        // Get the audio URL and create a blob from it
        const audioUrl = getAudioUrl();
        if (!audioUrl) {
          throw new Error("No audio URL available");
        }
        
        console.log("Audio URL retrieved:", audioUrl);
        const audioBlob = await fetch(audioUrl).then(r => r.blob());
        console.log("Audio blob created, size:", audioBlob.size);
        
        // Process the voice data
        const { response, messageId, transcript } = await processVoiceData(audioBlob, false);
        
        setRecordingCompleted(true);
        
        const userMessage: AIMessage = {
          id: messageId,
          sender: 'user',
          content: transcript ? `🎤 "${transcript}"` : "[Voice message]",
          timestamp: new Date(),
          isVoiceMessage: true,
          audioProgress: 0,
          isPlaying: false,
          transcript: transcript
        };
        
        const aiMessage: AIMessage = {
          id: (Date.now() + 1).toString(),
          sender: 'ai',
          content: response,
          timestamp: new Date(),
        };
        
        console.log("Adding voice message with ID:", messageId);
        setIsProcessingVoice(false);
        setIsRecordingDialogOpen(false);
        
        return [userMessage, aiMessage];
      } catch (error) {
        console.error("Error processing voice:", error);
        toast({
          title: "Error processing voice",
          description: "There was an error processing your voice recording",
          variant: "destructive"
        });
        setIsProcessingVoice(false);
        return null;
      }
    } else if (recordingCompleted) {
      setIsRecordingDialogOpen(false);
    }
    
    return null;
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

  return {
    isRecording,
    isMicSupported,
    isRecordingDialogOpen,
    setIsRecordingDialogOpen,
    isProcessingVoice,
    recordingCompleted,
    startRecording,
    finishRecording,
    cancelRecording
  };
}
