import { useReactMediaRecorder } from 'react-media-recorder';
import { useState, useEffect, useRef } from 'react';
import { toast } from '@/components/ui/use-toast';
import { processVoiceData } from '@/services/ai/voiceAIService';
import { AIMessage } from '@/services/types/aiTypes';
import { registerMessageAudio } from '@/services/speechService';

export const useVoiceRecorder = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [recordingComplete, setRecordingComplete] = useState(false);
  const [isMicSupported, setIsMicSupported] = useState(true);
  const blobUrlRef = useRef<string | null>(null);

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

  // Track changes to mediaBlobUrl with a ref
  useEffect(() => {
    if (mediaBlobUrl) {
      console.log("[useVoiceRecorder] mediaBlobUrl updated:", mediaBlobUrl);
      blobUrlRef.current = mediaBlobUrl;
    }
  }, [mediaBlobUrl]);

  const isRecording = status === "recording";

  const handleStartRecording = () => {
    console.log("[useVoiceRecorder] Starting recording");
    setRecordingComplete(false);
    blobUrlRef.current = null;
    clearBlobUrl();
    startRecording();
    
    toast({
      title: "Recording started",
      description: "Speak now and click Finish when done.",
    });
  };

  const handleStopRecording = async (): Promise<AIMessage[] | null> => {
    console.log("[useVoiceRecorder] Stopping recording, status:", status, "mediaBlobUrl:", mediaBlobUrl, "blobUrlRef:", blobUrlRef.current);
    
    if (status !== "recording" && !mediaBlobUrl && !blobUrlRef.current) {
      console.log("[useVoiceRecorder] No recording to process");
      return null;
    }

    setIsProcessing(true);
    
    try {
      // If still recording, stop it
      if (status === "recording") {
        stopRecording();
        
        // Wait for mediaBlobUrl to be available with progressive timeouts
        let attempts = 0;
        const maxAttempts = 30;
        const initialDelay = 200;
        
        while (!mediaBlobUrl && !blobUrlRef.current && attempts < maxAttempts) {
          console.log(`[useVoiceRecorder] Waiting for mediaBlobUrl, attempt ${attempts + 1}`);
          await new Promise(resolve => setTimeout(resolve, initialDelay * Math.pow(1.2, attempts)));
          attempts++;
        }
      }

      // Use either the current mediaBlobUrl or the one stored in the ref
      const currentBlobUrl = mediaBlobUrl || blobUrlRef.current;
      
      if (!currentBlobUrl) {
        console.error("[useVoiceRecorder] No mediaBlobUrl available after recording");
        toast({
          title: "Recording error",
          description: "Could not process the audio recording. Please try again.",
          variant: "destructive"
        });
        return null;
      }

      console.log("[useVoiceRecorder] Fetching audio blob from URL:", currentBlobUrl);
      
      // Get the blob from the media URL
      const audioBlob = await fetch(currentBlobUrl).then(r => r.blob());
      
      if (audioBlob.size < 100) {
        console.error("[useVoiceRecorder] Audio blob too small:", audioBlob.size);
        toast({
          title: "Recording too short",
          description: "The recording was too short to process. Please try again.",
          variant: "destructive"
        });
        return null;
      }
      
      console.log("[useVoiceRecorder] Audio blob size:", audioBlob.size);
      
      const { response, messageId, transcript } = await processVoiceData(audioBlob, false);
      console.log("[useVoiceRecorder] Voice processed successfully, messageId:", messageId);
      
      setRecordingComplete(true);

      // Register the audio URL with the legacy system so it can be played back
      if (currentBlobUrl && messageId) {
        registerMessageAudio(messageId, currentBlobUrl);
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
    blobUrlRef.current = null;
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
    mediaBlobUrl: mediaBlobUrl || blobUrlRef.current,
    startRecording: handleStartRecording,
    stopRecording: handleStopRecording,
    cancelRecording: handleCancel
  };
};
