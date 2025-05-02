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
      
      // Convert blob to base64 for protocol use
      const base64Data = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64 = reader.result as string;
          // Remove the data URL prefix (e.g., "data:audio/webm;base64,")
          const base64Clean = base64.split(',')[1];
          resolve(base64Clean);
        };
        reader.readAsDataURL(audioBlob);
      });
      
      const { response, messageId, transcript } = await processVoiceData(audioBlob, false);
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
          audioFormat: 'webm',
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
        return step.mcp ? `${step.mcp}::${step.action}` : step.action;
      }) || ["process"];

      // Create protocol data structure
      const protocolData = {
        inputValue: voiceData.voiceData,
        operationKeywords,
        executionPlan: aiMessage.execution_plan,
        stepCount: operationKeywords.length
      };
      
      const protocolHandler = AIOProtocolHandler.getInstance();
      
      // Generate a unique context ID
      const contextId = `voice-protocol-${Date.now()}`;
      
      // Initialize protocol context with protocol data
      const context = protocolHandler.init_calling_context(
        contextId,
        protocolData.inputValue,
        protocolData.operationKeywords,
        protocolData.executionPlan
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

      // Start protocol execution
      const protocolMessage = await protocolHandler.calling_step_by_step(
        contextId,
        "/api/aio/protocol"
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
