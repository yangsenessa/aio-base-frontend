import { useReactMediaRecorder } from 'react-media-recorder';
import { useState, useEffect, useRef } from 'react';
import { toast } from '@/components/ui/use-toast';
import { processVoiceData } from '@/services/ai/voiceAIService';
import { AIMessage } from '@/services/types/aiTypes';
import { registerMessageAudio } from '@/services/speechService';
import { AIOProtocolHandler } from '@/runtime/AIOProtocolHandler';
import { 
  cleanJsonString, 
  fixMalformedJson, 
  safeJsonParse 
} from '@/util/formatters';
import { useChat } from '@/contexts/ChatContext';

// Function to convert audio blob to WAV format
async function convertToWav(audioBlob: Blob): Promise<Blob> {
  // Create an audio context
  const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  
  // Read the blob as array buffer
  const arrayBuffer = await audioBlob.arrayBuffer();
  
  // Decode the audio data
  const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
  
  // Create an offline context for rendering
  const offlineContext = new OfflineAudioContext(
    audioBuffer.numberOfChannels,
    audioBuffer.length,
    audioBuffer.sampleRate
  );
  
  // Create a buffer source
  const source = offlineContext.createBufferSource();
  source.buffer = audioBuffer;
  source.connect(offlineContext.destination);
  source.start();
  
  // Render the audio
  const renderedBuffer = await offlineContext.startRendering();
  
  // Convert to WAV
  const wavBlob = await new Promise<Blob>((resolve) => {
    const length = renderedBuffer.length;
    const channels = renderedBuffer.numberOfChannels;
    const sampleRate = renderedBuffer.sampleRate;
    
    // Create the WAV file
    const buffer = new ArrayBuffer(44 + length * 2);
    const view = new DataView(buffer);
    
    // Write WAV header
    writeString(view, 0, 'RIFF');
    view.setUint32(4, 36 + length * 2, true);
    writeString(view, 8, 'WAVE');
    writeString(view, 12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, channels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * channels * 2, true);
    view.setUint16(32, channels * 2, true);
    view.setUint16(34, 16, true);
    writeString(view, 36, 'data');
    view.setUint32(40, length * 2, true);
    
    // Write audio data
    const volume = 1;
    let index = 44;
    for (let i = 0; i < length; i++) {
      for (let channel = 0; channel < channels; channel++) {
        const sample = Math.max(-1, Math.min(1, renderedBuffer.getChannelData(channel)[i]));
        view.setInt16(index, sample < 0 ? sample * 0x8000 : sample * 0x7FFF, true);
        index += 2;
      }
    }
    
    resolve(new Blob([buffer], { type: 'audio/wav' }));
  });
  
  return wavBlob;
}

// Helper function to write strings to DataView
function writeString(view: DataView, offset: number, string: string) {
  for (let i = 0; i < string.length; i++) {
    view.setUint8(offset + i, string.charCodeAt(i));
  }
}

export const useVoiceRecorder = () => {
  const { addDirectMessage } = useChat();
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
      console.log("[useVoiceRecorder] Audio blob type:", audioBlob.type);
      
      try {
        // Convert to WAV format
        const wavBlob = await convertToWav(audioBlob);
        console.log("[useVoiceRecorder] Converted to WAV, size:", wavBlob.size);
        
        // Read WAV file as array buffer
        const arrayBuffer = await wavBlob.arrayBuffer();
        const uint8Array = new Uint8Array(arrayBuffer);
        
        // Convert to base64 string in chunks to avoid call stack size exceeded
        const chunkSize = 32768; // Process 32KB chunks
        let base64Data = '';
        
        for (let i = 0; i < uint8Array.length; i += chunkSize) {
          const chunk = uint8Array.slice(i, i + chunkSize);
          base64Data += btoa(
            chunk.reduce((data, byte) => data + String.fromCharCode(byte), '')
          );
        }
        
        console.log("[useVoiceRecorder] Base64 conversion successful, length:", base64Data.length);
        
        const { response, messageId, transcript } = await processVoiceData(wavBlob, false);
        console.log("[useVoiceRecorder] Voice processed successfully, messageId:", messageId);
        
        setRecordingComplete(true);

        // Register the audio URL with the legacy system so it can be played back
        if (currentBlobUrl && messageId) {
          registerMessageAudio(messageId, currentBlobUrl);
        }

        // Create user voice message
        const userMessage: AIMessage = {
          id: messageId,
          sender: 'user',
          content: transcript ? `🎤 Voice Input: "${transcript}"` : "🎤 [Voice message recorded]",
          timestamp: new Date(),
          isVoiceMessage: true,
          audioProgress: 0,
          isPlaying: false,
          transcript,
          voiceData: base64Data,
          messageType: 'voice',
          metadata: {
            audioFormat: 'audio/wav',
            recordingTimestamp: Date.now(),
            hasTranscript: !!transcript,
            voiceDataSize: base64Data.length,
            messageRole: 'voice_input'
          }
        };

        // Process AI response to extract execution plan and other structured data
        let processedResponse = response;
        let executionPlan;
        let intentAnalysis;
        let displayContent;

        try {
          // Clean and process the response similar to ChatContext
          const cleanedContent = cleanJsonString(response);
          const fixedJson = fixMalformedJson(cleanedContent);
          const parsedJson = safeJsonParse(fixedJson);

          if (parsedJson) {
            // Store the processed JSON content
            processedResponse = fixedJson;

            // Extract structured data
            if (parsedJson.execution_plan) {
              executionPlan = parsedJson.execution_plan;
            }
            if (parsedJson.intent_analysis) {
              intentAnalysis = parsedJson.intent_analysis;
            }
            if (parsedJson.response) {
              displayContent = parsedJson.response;
            }
          }
        } catch (error) {
          console.error("[useVoiceRecorder] Error processing AI response:", error);
        }

        // Create AI response message with structured data
        const aiMessage: AIMessage = {
          id: (Date.now() + 1).toString(),
          sender: 'ai',
          content: processedResponse,
          timestamp: new Date(),
          messageType: 'text',
          _displayContent: displayContent,
          _rawJsonContent: processedResponse,
          execution_plan: executionPlan,
          intent_analysis: intentAnalysis,
          metadata: {
            responseType: 'voice_processing',
            processingTimestamp: Date.now(),
            messageRole: 'voice_response'
          }
        };

        console.log("[useVoiceRecorder] Created messages:", {
          voiceMessage: {
            id: userMessage.id,
            type: userMessage.messageType,
            hasTranscript: !!userMessage.transcript,
            hasVoiceData: !!userMessage.voiceData
          },
          aiResponse: {
            id: aiMessage.id,
            type: aiMessage.messageType,
            hasExecutionPlan: !!aiMessage.execution_plan,
            hasIntentAnalysis: !!aiMessage.intent_analysis,
            hasDisplayContent: !!aiMessage._displayContent
          }
        });

        return [userMessage, aiMessage];
      } catch (error) {
        console.error("[useVoiceRecorder] Error converting audio to base64:", error);
        toast({
          title: "Conversion Error",
          description: "Failed to convert audio recording. Please try again.",
          variant: "destructive"
        });
        return null;
      }
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

  /**
   * Initialize and start a protocol with voice data
   * @param voiceData The processed voice data
   * @param aiMessage The AI message containing execution plan
   * @returns The initialized context ID and first protocol message if successful, null otherwise
   */
  const protocolStarting = async (voiceData: any, aiMessage: AIMessage): Promise<{ contextId: string; message: AIMessage } | null> => {
    try {
      console.log("[useVoiceRecorder] Starting protocol with voice data");
      
      // Ensure we have the base64 voice data
      if (!voiceData.voiceData) {
        console.error("[useVoiceRecorder] No base64 voice data available");
        toast({
          title: "Protocol Error",
          description: "Voice data not properly formatted for protocol",
          variant: "destructive"
        });
        return null;
      }

      // Extract operation keywords from execution plan
      const operationKeywords = aiMessage.execution_plan?.steps?.map(step => {
        if (step.mcp && step.action) {
          return `${step.mcp}::${step.action}`;
        }
        return step.action || 'process';
      }) || ['process'];

      console.log("[useVoiceRecorder] Operation keywords:", operationKeywords);

      // Initialize protocol context with raw voice data
      const protocolHandler = AIOProtocolHandler.getInstance();
      const contextId = `voice-protocol-${Date.now()}`;
      
      const context =await protocolHandler.init_calling_context(
        contextId,
        voiceData.voiceData, // Pass raw voice data, let protocol handler adapt it
        operationKeywords,
        aiMessage.execution_plan
      );

      if (!context) {
        console.error("[useVoiceRecorder] Failed to initialize protocol context");
        toast({
          title: "Protocol Error",
          description: "Failed to initialize protocol with voice data",
          variant: "destructive"
        });
        return null;
      }
      console.log("[useVoiceRecorder] Will execute protocol step by step with context:", context);
      addDirectMessage(`Starting voice protocol execution (ID: ${contextId})`);
      // Start protocol execution
      const protocolMessage = await protocolHandler.calling_step_by_step(
        contextId,
        "",
        true,
        addDirectMessage
      );

      if (!protocolMessage) {
        console.error("[useVoiceRecorder] Failed to start protocol execution");
        protocolHandler.deleteContext(contextId);
        return null;
      }

      console.log("[useVoiceRecorder] Protocol started successfully:", contextId);
      return {
        contextId,
        message: protocolMessage
      };
    } catch (error) {
      console.error("[useVoiceRecorder] Error starting protocol:", error);
      toast({
        title: "Protocol Error",
        description: "Failed to start protocol: " + error.message,
        variant: "destructive"
      });
      return null;
    }
  };

  return {
    isRecording,
    isMicSupported,
    isProcessing,
    recordingComplete,
    mediaBlobUrl: mediaBlobUrl || blobUrlRef.current,
    startRecording: handleStartRecording,
    stopRecording: handleStopRecording,
    cancelRecording: handleCancel,
    protocolStarting
  };
};
