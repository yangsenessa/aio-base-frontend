
import { useMediaRecorder } from 'react-media-recorder';
import { useState } from 'react';
import { toast } from '@/components/ui/use-toast';
import { processVoiceData } from '@/services/ai/voiceAIService';
import { AIMessage } from '@/services/types/aiTypes';

export const useVoiceRecorder = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [recordingComplete, setRecordingComplete] = useState(false);

  const {
    status,
    startRecording,
    stopRecording,
    mediaBlobUrl,
    clearBlobUrl
  } = useMediaRecorder({
    audio: true,
    blobPropertyBag: { type: "audio/webm" }
  });

  const isRecording = status === "recording";
  const isMicSupported = true; // We'll handle this through the MediaRecorder API

  const handleStartRecording = () => {
    setRecordingComplete(false);
    clearBlobUrl();
    startRecording();
    
    toast({
      title: "Recording started",
      description: "Speak now and click Finish when done.",
    });
  };

  const handleStopRecording = async (): Promise<AIMessage[] | null> => {
    if (!isRecording && !mediaBlobUrl) return null;

    setIsProcessing(true);
    stopRecording();

    try {
      if (!mediaBlobUrl) {
        throw new Error("No recording available");
      }

      // Get the blob from the media URL
      const audioBlob = await fetch(mediaBlobUrl).then(r => r.blob());
      
      const { response, messageId, transcript } = await processVoiceData(audioBlob, false);
      
      setRecordingComplete(true);

      const userMessage: AIMessage = {
        id: messageId,
        sender: 'user',
        content: transcript ? `🎤 "${transcript}"` : "[Voice message]",
        timestamp: new Date(),
        isVoiceMessage: true,
        audioProgress: 0,
        isPlaying: false,
        transcript
      };

      const aiMessage: AIMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        content: response,
        timestamp: new Date(),
      };

      return [userMessage, aiMessage];
    } catch (error) {
      console.error("Error processing voice:", error);
      toast({
        title: "Error processing voice",
        description: "There was an error processing your voice recording",
        variant: "destructive"
      });
      return null;
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCancel = () => {
    stopRecording();
    clearBlobUrl();
    setRecordingComplete(false);
    setIsProcessing(false);
    
    toast({
      title: "Recording cancelled",
      description: "Voice recording has been cancelled",
    });
  };

  return {
    isRecording,
    isMicSupported,
    isProcessing,
    recordingComplete,
    mediaBlobUrl,
    startRecording: handleStartRecording,
    stopRecording: handleStopRecording,
    cancelRecording: handleCancel
  };
};
