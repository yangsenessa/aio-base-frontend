
import { useReactMediaRecorder } from 'react-media-recorder';
import { useState, useEffect } from 'react';
import { toast } from '@/components/ui/use-toast';
import { processVoiceData } from '@/services/ai/voiceAIService';
import { AIMessage } from '@/services/types/aiTypes';
import { registerMessageAudio } from '@/services/speechService';

export const useVoiceRecorder = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [recordingComplete, setRecordingComplete] = useState(false);
  const [isMicSupported, setIsMicSupported] = useState(true);

  // Check if microphone is supported
  useEffect(() => {
    const checkMicSupport = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        stream.getTracks().forEach(track => track.stop());
        setIsMicSupported(true);
      } catch (err) {
        console.error("Microphone access error:", err);
        setIsMicSupported(false);
      }
    };
    
    checkMicSupport();
  }, []);

  const {
    status,
    startRecording,
    stopRecording,
    mediaBlobUrl,
    clearBlobUrl
  } = useReactMediaRecorder({
    audio: true,
    blobPropertyBag: { type: "audio/webm" }
  });

  const isRecording = status === "recording";

  const handleStartRecording = () => {
    console.log("[useVoiceRecorder] Starting recording");
    setRecordingComplete(false);
    clearBlobUrl();
    startRecording();
    
    toast({
      title: "Recording started",
      description: "Speak now and click Finish when done.",
    });
  };

  const handleStopRecording = async (): Promise<AIMessage[] | null> => {
    console.log("[useVoiceRecorder] Stopping recording, status:", status, "mediaBlobUrl:", mediaBlobUrl);
    
    if (!isRecording && !mediaBlobUrl) {
      console.log("[useVoiceRecorder] No recording to process");
      return null;
    }

    setIsProcessing(true);
    
    if (status === "recording") {
      stopRecording();
      // Wait a bit for the recording to finish and mediaBlobUrl to be available
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    try {
      if (!mediaBlobUrl) {
        console.error("[useVoiceRecorder] No mediaBlobUrl available after recording");
        throw new Error("No recording available");
      }

      console.log("[useVoiceRecorder] Fetching audio blob from URL:", mediaBlobUrl);
      
      // Get the blob from the media URL
      const audioBlob = await fetch(mediaBlobUrl).then(r => r.blob());
      console.log("[useVoiceRecorder] Audio blob size:", audioBlob.size);
      
      const { response, messageId, transcript } = await processVoiceData(audioBlob, false);
      console.log("[useVoiceRecorder] Voice processed successfully, messageId:", messageId);
      
      setRecordingComplete(true);

      // Register the audio URL with the legacy system so it can be played back
      if (mediaBlobUrl && messageId) {
        registerMessageAudio(messageId, mediaBlobUrl);
      }

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
      console.error("[useVoiceRecorder] Error processing voice:", error);
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
    console.log("[useVoiceRecorder] Canceling recording");
    if (status === "recording") {
      stopRecording();
    }
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
